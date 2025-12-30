import 'aws-sdk-client-mock-vitest/extend';

process.env.TABLE_NAME = 'Table';
process.env.WSAPI_URL =
  'https://apiid.execute-api.eu-west-2.amazonaws.com/default/';
process.env.EVENTBUS_NAME = 'default';
