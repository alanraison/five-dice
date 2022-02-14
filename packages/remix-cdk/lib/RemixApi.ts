import {
  HttpApi,
  HttpApiProps,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import {
  HttpLambdaIntegration,
  HttpUrlIntegration,
} from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface RemixApiProps extends HttpApiProps {
  staticBucket: IBucket;
  publicPath: string;
  ssrFunction: IFunction;
}

export class RemixApi extends HttpApi {
  constructor(scope: Construct, id: string, props: RemixApiProps) {
    super(scope, id);

    this.addSSRIntegration(props);
    this.addStaticAssetsIntegration(props);
  }

  addSSRIntegration({ ssrFunction }: { ssrFunction: IFunction }) {
    this.addRoutes({
      path: '/{proxy+}',
      integration: new HttpLambdaIntegration('SSR', ssrFunction),
    });
  }

  addStaticAssetsIntegration({
    staticBucket,
    publicPath,
  }: {
    staticBucket: IBucket;
    publicPath: string;
  }) {
    this.addRoutes({
      path: `${publicPath}{proxy+}`,
      methods: [HttpMethod.GET],
      integration: new HttpUrlIntegration(
        'Static',
        `${staticBucket.bucketWebsiteUrl}/{proxy}`,
        {
          method: HttpMethod.GET,
        }
      ),
    });
  }
}
