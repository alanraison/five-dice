#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import GameServerStack from '../lib/game-server-stack';

const app = new cdk.App();
const zoneid = app.node.tryGetContext('zoneid');
if (!zoneid) {
  throw new Error('No zoneid found. Please add to the context');
}
new GameServerStack(app, 'GameServerStack', {
  zoneid,
});
