import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { resolve } from 'path';

export interface RemixFunctionProps extends NodejsFunctionProps {
  serverBuildDirectory: string;
  serverEntryPoint?: string;
}

export class RemixFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, props: RemixFunctionProps) {
    super(scope, id, {
      entry: resolve(
        props.serverBuildDirectory,
        props.serverEntryPoint || 'index.js'
      ),
      ...props,
    });
  }
}
