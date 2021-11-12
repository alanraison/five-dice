import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import createGameHandlerFactory from './handler';
import createGameDAOFactory from './dao';
import bodyParserFactory from '../bodyParser';

jest.mock('./dao');
jest.mock('../bodyParser');

describe('createGameHandler', () => {
  let createGameHandler: (
    e: APIGatewayProxyEventV2
  ) => Promise<APIGatewayProxyResultV2>;
  const dao = jest.fn();
  const bodyParser = jest.fn();

  beforeEach(() => {
    (bodyParserFactory as jest.Mock).mockReturnValue(bodyParser);
    (createGameDAOFactory as jest.Mock).mockReturnValue(dao);
    createGameHandler = createGameHandlerFactory({
      dao,
    });
  });
  it('should return 400 if is an error parsing the input', () => {
    bodyParser.mockImplementation(() => {
      throw new Error('Test Error');
    });
    return expect(createGameHandler({} as any)).resolves.toMatchObject({
      statusCode: 400,
      body: 'Test Error',
    });
  });
  it('should call the GameService if all input is valid', async () => {
    bodyParser.mockReturnValue({ name: 'alan' });
    await createGameHandler({
      body: 'replaced by mock',
    } as any);
    expect(dao).toHaveBeenCalled();
  });
  it('should return a 500 error if there is a problem in the gameService', async () => {
    (dao as jest.Mock).mockRejectedValue(new Error('some error'));
    const result = createGameHandler({
      body: 'not used',
    } as any);
    await expect(result).resolves.toMatchObject({
      statusCode: 500,
    });
  });
  it('should return the game id from the gameService', async () => {
    bodyParser.mockReturnValue({ name: 'alan' });
    (dao as jest.Mock).mockReturnValue('abcde');
    const result = await createGameHandler({
      body: 'replaced by mock',
    } as any);
    expect(result).toBe('{"gameId":"abcde"}');
  });
});
