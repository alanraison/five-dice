import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import joinGameHandlerFactory from './handler';
import joinGameDAOFactory from './dao';
import bodyParserFactory from '../bodyParser';

jest.mock('../bodyParser');
jest.mock('./dao');

describe('joinGameHandler', () => {
  let joinGameHandler: (
    e: APIGatewayProxyEventV2
  ) => Promise<APIGatewayProxyResultV2>;
  const dao = jest.fn();
  const bodyParser = jest.fn();
  beforeEach(() => {
    (bodyParserFactory as jest.Mock).mockReturnValue(bodyParser);
    (joinGameDAOFactory as jest.Mock).mockReturnValue(dao);
    joinGameHandler = joinGameHandlerFactory(dao);
  });
  it('should return 400 if is an error parsing the input', () => {
    bodyParser.mockImplementation(() => {
      throw new Error('Test Error');
    });
    return expect(joinGameHandler({} as any)).resolves.toMatchObject({
      statusCode: 400,
      body: 'Test Error',
    });
  });
  it('should register the player with the game', () => {
    bodyParser.mockReturnValue({
      gameId: 'aaa',
      name: 'player1',
    });
    joinGameHandler({} as any);
    expect(dao).toBeCalled();
  });
});
