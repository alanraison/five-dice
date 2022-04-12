import { IWebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Stack } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IEventBus } from 'aws-cdk-lib/aws-events';
import {
  IRole,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import {
  Choice,
  Condition,
  IStateMachine,
  JsonPath,
  LogLevel,
  StateMachine,
  TaskInput,
} from 'aws-cdk-lib/aws-stepfunctions';
import {
  EventBridgePutEvents,
  LambdaInvoke,
} from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { UpdateBidTask } from './updateBid';
import { SendMessage } from '../sendMessageFunction';

interface BidFunctionProps {
  table: ITable;
  eventBus: IEventBus;
  sendMessageFunction: SendMessage;
}

export class Flow extends Construct {
  readonly stateMachine: IStateMachine;
  readonly invokeRole: IRole;
  constructor(
    scope: Construct,
    id: string,
    { eventBus, table, sendMessageFunction }: BidFunctionProps
  ) {
    super(scope, id);

    const bidFetchDataFunction = new NodejsFunction(this, 'GetBidDataFn', {
      entry: require.resolve('../../src/bid/getBidData'),
      environment: {
        TABLE_NAME: table.tableName,
      },
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_DAY,
    });
    bidFetchDataFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [`${table.tableArn}/index/GSI2`],
      })
    );
    const validateBidFunction = new NodejsFunction(this, 'ValidateBidFn', {
      entry: require.resolve('../../src/bid/validateBid'),
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_DAY,
    });

    const invokeGetData = new LambdaInvoke(this, 'GetBidData', {
      lambdaFunction: bidFetchDataFunction,
      resultPath: '$.data',
      resultSelector: {
        'isCurrentBidder.$': '$.Payload.isCurrentBidder',
        'currentBid.$': '$.Payload.currentBid',
        'bidder.$': '$.Payload.bidder',
        'nextPlayer.$': '$.Payload.nextPlayer',
        'gameKey.$': '$.Payload.gameKey',
      },
    });
    const notCurrentBidder = Condition.booleanEquals(
      '$.data.isCurrentBidder',
      false
    );
    const invokeBidderError = new LambdaInvoke(this, 'BidderError', {
      lambdaFunction: sendMessageFunction,
      payload: TaskInput.fromObject({
        connectionId: JsonPath.stringAt('$.connectionId'),
        message: { event: 'error', message: 'Bid not expected' },
      }),
    });
    const invokeValidatation = new LambdaInvoke(this, 'ValidateBid', {
      lambdaFunction: validateBidFunction,
      payload: TaskInput.fromObject({
        newBid: {
          q: JsonPath.numberAt('$.q'),
          v: JsonPath.numberAt('$.v'),
        },
        currentBid: JsonPath.objectAt('$.data.currentBid'),
      }),
      resultPath: '$.validate',
      resultSelector: {
        'result.$': '$.Payload',
      },
    });
    const invokeValidationError = new LambdaInvoke(
      this,
      'SendValidationError',
      {
        lambdaFunction: sendMessageFunction,
        payload: TaskInput.fromObject({
          connectionId: JsonPath.stringAt('$.connectionId'),
          message: {
            event: 'error',
            message: JsonPath.stringAt('$.validate.result.reason'),
          },
        }),
      }
    );

    const notValid = Condition.booleanEquals('$.validate.result.valid', false);
    const updateBid = new UpdateBidTask(this, 'UpdateBid', { table });
    const publishBid = new EventBridgePutEvents(this, 'PublishBid', {
      entries: [
        {
          eventBus: eventBus,
          detail: TaskInput.fromObject({
            gameId: JsonPath.stringAt('$.gameId'),
            q: JsonPath.numberAt('$.q'),
            v: JsonPath.numberAt('$.v'),
            bidder: JsonPath.stringAt('$.data.bidder'),
            nextPlayer: JsonPath.stringAt('$.data.nextPlayer'),
          }),
          detailType: 'bid-increased',
          source: 'five-dice-wsapi',
        },
      ],
    });

    const definition = invokeGetData.next(
      new Choice(this, 'NotCurrentBidder')
        .when(notCurrentBidder, invokeBidderError)
        .otherwise(
          invokeValidatation.next(
            new Choice(this, 'InvalidBid')
              .when(notValid, invokeValidationError)
              .otherwise(updateBid.next(publishBid))
          )
        )
    );
    const logGroup = new LogGroup(this, 'BidHandler', {
      retention: RetentionDays.ONE_DAY,
    });

    this.stateMachine = new StateMachine(this, 'Bid', {
      definition,
      tracingEnabled: true,
      logs: {
        destination: logGroup,
        includeExecutionData: true,
        level: LogLevel.ALL,
      },
    });
    this.stateMachine.grantStartExecution(
      new ServicePrincipal('apigateway.amazonaws.com')
    );

    this.invokeRole = new Role(this, 'BidInvoke', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      inlinePolicies: {
        execute: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['states:StartExecution'],
              resources: [this.stateMachine.stateMachineArn],
            }),
          ],
        }),
      },
    });
  }
}
