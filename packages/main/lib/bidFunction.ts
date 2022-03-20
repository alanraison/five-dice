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
  CallAwsService,
  EventBridgePutEvents,
  LambdaInvoke,
} from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { UpdateBidTask } from './bid/updateBid';

interface BidFunctionProps {
  table: ITable;
  eventBus: IEventBus;
}

export class BidFunction extends Construct {
  readonly stateMachine: IStateMachine;
  readonly invokeRole: IRole;
  constructor(
    scope: Construct,
    id: string,
    { eventBus, table }: BidFunctionProps
  ) {
    super(scope, id);

    const bidFetchDataFunction = new NodejsFunction(this, 'GetBidDataFn', {
      entry: require.resolve('../src/bid/getBidData'),
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
      entry: require.resolve('../src/bid/validateBid'),
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_DAY,
    });

    const handleBid = new LambdaInvoke(this, 'GetBidData', {
      lambdaFunction: bidFetchDataFunction,
      resultPath: '$.data',
      resultSelector: {
        'isCurrentBidder.$': '$.Payload.isCurrentBidder',
        'currentBid.$': '$.Payload.currentBid',
        'bidder.$': '$.Payload.bidder',
        'nextPlayer.$': '$.Payload.nextPlayer',
        'gameKey.$': '$.Payload.gameKey',
      },
    })
      .next(
        new LambdaInvoke(this, 'ValidateBid', {
          lambdaFunction: validateBidFunction,
          resultPath: '$.validate',
          resultSelector: {
            'valid.$': '$.Payload',
          },
        })
      )
      .next(
        new Choice(this, 'IsValid').when(
          Condition.booleanEquals('$.validate.valid', true),
          new UpdateBidTask(this, 'UpdateBid', { table }).next(
            new EventBridgePutEvents(this, 'PutIncreaseBidResult', {
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
                  source: JsonPath.stringAt('$.gameId'),
                },
              ],
            })
          )
        )
      );

    const logGroup = new LogGroup(this, 'BidHandler', {
      retention: RetentionDays.ONE_DAY,
    });

    this.stateMachine = new StateMachine(this, 'Bid', {
      definition: handleBid,
      tracingEnabled: true,
      logs: {
        destination: logGroup,
        includeExecutionData: true,
        level: LogLevel.ALL,
      },
    });

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
    /* , {
    }
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ['execute-api:ManageConnections'],
        resources: [
          Stack.of(this).formatArn({
            service: 'execute-api',
            resource: `${wsApiStage.api.apiId}/${wsApiStage.stageName}/POST/@connections/{connectionId}`,
          }),
        ],
      })
    );
    */
  }
}
