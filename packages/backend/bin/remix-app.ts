#!/usr/bin/env node
import { App } from 'aws-cdk-lib/core';
import { RemixStack } from '../lib/remix-stack.js';

const app = new App();
new RemixStack(app, 'App');
