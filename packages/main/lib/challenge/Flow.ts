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
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import {
  Choice,
  Condition,
  IChainable,
  INextable,
  IStateMachine,
  JsonPath,
  StateMachine,
  TaskInput,
} from 'aws-cdk-lib/aws-stepfunctions';
import {
  EventBridgePutEvents,
  LambdaInvoke,
} from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { SendMessage } from '../sendMessageFunction';
import { UpdateDice } from './UpdateDice';

interface ChallengeFlowProps {
  table: ITable;
  sendMessageFunction: SendMessage;
  eventBus: IEventBus;
}

export class Flow extends Construct {
  readonly stateMachine: IStateMachine;
  readonly invokeRole: IRole;
  private readonly eventBus: IEventBus;
  private readonly sendMessageFunction: SendMessage;
  private readonly table: ITable;
  constructor(
    scope: Construct,
    id: string,
    { table, sendMessageFunction, eventBus }: ChallengeFlowProps
  ) {
    super(scope, id);

    this.eventBus = eventBus;
    this.sendMessageFunction = sendMessageFunction;
    this.table = table;

    this.stateMachine = this.createStateMachine(
      this.getData(table).next(
        this.checkWhetherCurrentBidder().otherwise(
          this.checkChallengeSuccess({
            onSuccess: this.challengeSuccess(),
            onFailure: this.challengeFailed(),
          }).next(this.notifyChallengeResult())
        )
      )
    );
    this.invokeRole = new Role(this, 'ChallengeRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      inlinePolicies: {
        ChallengeFlowInvoker: new PolicyDocument({
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

  private createStateMachine(definition: IChainable): StateMachine {
    const stateMachine = new StateMachine(this, 'ChallengeFlow', {
      definition,
    });
    stateMachine.grantStartExecution(
      new ServicePrincipal('apigateway.amazonaws.com')
    );
    return stateMachine;
  }

  private getData(table: ITable): INextable {
    const getDataFn = new NodejsFunction(this, 'GetData', {
      entry: require.resolve('../../src/challenge/getData'),
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_DAY,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    getDataFn.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [`${table.tableArn}/index/GSI2`],
      })
    );
    return new LambdaInvoke(this, 'InvokeGetData', {
      lambdaFunction: getDataFn,
      resultPath: '$.data',
      resultSelector: {
        'bid.$': '$.Payload.bid',
        'dice.$': '$.Payload.dice',
        'isCorrectPlayer.$': '$.Payload.isCorrectPlayer',
        'bidder.$': '$.Payload.bidder',
        'challenger.$': '$.Payload.challenger',
        'players.$': '$.Payload.players',
      },
    });
  }

  private checkWhetherCurrentBidder() {
    const notCurrentBidder = Condition.booleanEquals(
      '$.data.isCorrectPlayer',
      false
    );
    const choice = new Choice(this, 'NotCurrentBidder').when(
      notCurrentBidder,
      new LambdaInvoke(this, 'NotCurrentBidderError', {
        lambdaFunction: this.sendMessageFunction,
        payload: TaskInput.fromObject({
          connectionId: JsonPath.stringAt('$.connectionId'),
          message: { event: 'error', message: 'Challenge not expected' },
        }),
      })
    );
    return choice;
  }

  private checkChallengeSuccess({
    onSuccess,
    onFailure,
  }: {
    onSuccess: IChainable;
    onFailure: IChainable;
  }) {
    const validateFunction = new NodejsFunction(this, 'Validate', {
      entry: require.resolve('../../src/challenge/validate'),
      logRetention: RetentionDays.ONE_DAY,
      tracing: Tracing.ACTIVE,
    });
    const validate = new LambdaInvoke(this, 'ValidateChallenge', {
      lambdaFunction: validateFunction,
      payload: TaskInput.fromObject({
        bid: JsonPath.objectAt('$.data.bid'),
        dice: JsonPath.objectAt('$.data.dice'),
      }),
      resultPath: '$.validate',
      resultSelector: {
        'success.$': '$.Payload.success',
        'counts.$': '$.Payload.counts',
      },
    });
    const challengeSuccessfulCheck = Condition.booleanEquals(
      '$.validate.success',
      true
    );
    const challengeSuccessful = new Choice(this, 'ChallengeSuccessful');
    challengeSuccessful.when(challengeSuccessfulCheck, onSuccess);
    challengeSuccessful.otherwise(onFailure);
    return validate.next(
      challengeSuccessful.afterwards({ includeErrorHandlers: false })
    );
  }

  private challengeSuccess(): IChainable {
    return new UpdateDice(this, 'UpdateDiceBidderLoses', {
      table: this.table,
      connectionId: JsonPath.stringAt('$.data.bidder.connectionId'),
      resultPath: '$.update',
      resultSelector: {
        loser: 'bidder',
      },
    }).next(
      new EventBridgePutEvents(this, 'ChallengeSuccessfulEvent', {
        entries: [
          {
            eventBus: this.eventBus,
            source: 'five-dice-wsapi',
            detailType: 'challenge-result',
            detail: TaskInput.fromObject({
              gameId: JsonPath.stringAt('$.gameId'),
              counts: JsonPath.objectAt('$.validate.counts'),
              result: JsonPath.stringAt(
                "States.Format('{} loses a die', $.data.bidder.name)"
              ),
              bid: JsonPath.objectAt('$.data.bid'),
            }),
          },
        ],
      })
    );
  }

  private challengeFailed(): IChainable {
    return new UpdateDice(this, 'UpdateDiceChallengerLoses', {
      table: this.table,
      connectionId: JsonPath.stringAt('$.data.challenger.connectionId'),
      resultPath: '$.update',
      resultSelector: {
        loser: 'challenger',
      },
    });
  }

  private notifyChallengeResult(): IChainable {
    return new EventBridgePutEvents(this, 'ChallengeCompletedEvent', {
      entries: [
        {
          eventBus: this.eventBus,
          source: 'five-dice-wsapi',
          detailType: 'challenge-result',
          detail: TaskInput.fromObject({
            gameId: JsonPath.stringAt('$.gameId'),
            counts: JsonPath.objectAt('$.validate.counts'),
            loser: JsonPath.stringAt('$.update.loser'),
            bid: JsonPath.objectAt('$.data.bid'),
            bidder: '',
            challenger: '',
          }),
        },
      ],
    });
  }
}
