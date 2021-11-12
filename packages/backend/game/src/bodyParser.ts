import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';

const ajv = new Ajv();

export default function bodyParserFactory<T>(schema: JTDSchemaType<T>) {
  const parse = ajv.compileParser<T>(schema);
  return function parseBody({
    body,
    isBase64Encoded = false,
  }: {
    body?: string;
    isBase64Encoded?: boolean;
  }): T {
    if (!body) {
      throw new Error('No body provided in request');
    }
    const bodyString = isBase64Encoded
      ? Buffer.from(body, 'base64').toString('utf-8')
      : body;
    const bodyObj = parse(bodyString);
    if (!bodyObj) {
      throw new Error(`parsing input: ${parse.message}`);
    }
    return bodyObj;
  };
}
