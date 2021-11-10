#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import GameServerStack from '../lib/game-server-stack';

const app = new cdk.App();
new GameServerStack(app, 'GameServerStack');
