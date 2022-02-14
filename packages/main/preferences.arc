# The @env pragma is synced (and overwritten) by running arc env
@env
testing
  REMIX_ENV development

staging
  REMIX_ENV production

production
  REMIX_ENV production
  WS_API wss://60q1ewkm12.execute-api.eu-west-2.amazonaws.com/default
  API_URL https://g15qw0snvh.execute-api.eu-west-2.amazonaws.com
  TABLE_NAME GameServerStack-FiveDiceA2C0460A-N1FTIVO6S54F
