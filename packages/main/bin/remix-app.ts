#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import 'source-map-support/register';
import { RemixStack } from '../lib/remix-stack';

const app = new App();
new RemixStack(app, 'App');
