import { JTDSchemaType } from 'ajv/dist/core';
import bodyParserFactory from './bodyParser';

interface TestInput {
  stringProperty: string;
  optionalProperty?: string;
}

const testSchema: JTDSchemaType<TestInput> = {
  properties: {
    stringProperty: { type: 'string' },
  },
  optionalProperties: {
    optionalProperty: { type: 'string' },
  },
};

const relaxedSchema: JTDSchemaType<TestInput> = {
  properties: {
    stringProperty: { type: 'string' },
  },
  optionalProperties: {
    optionalProperty: { type: 'string' },
  },
  additionalProperties: true,
};

describe('bodyParser', () => {
  const bodyParser = bodyParserFactory(testSchema);
  it('should throw an error when no body is present', () => {
    expect(() => bodyParser({})).toThrowError('No body provided in request');
  });
  it('should throw an error when invalid JSON is provided', () => {
    expect(() => bodyParser({ body: '{not valid JSON]' })).toThrowError(
      'parsing input: unexpected token n'
    );
  });
  it('should decode base64 encoded JSON', () => {
    const sample = JSON.stringify({
      stringProperty: 'something',
      optionalProperty: 'optional',
    });
    expect(
      bodyParser({
        body: Buffer.from(sample).toString('base64'),
        isBase64Encoded: true,
      })
    ).toEqual({
      stringProperty: 'something',
      optionalProperty: 'optional',
    });
  });
  it('should parse utf-8 encoded JSON', () => {
    const body = JSON.stringify({
      stringProperty: '👍',
    });
    expect(bodyParser({ body })).toEqual({
      stringProperty: '👍',
    });
  });
  it('should reject extra properties by default', () => {
    expect(() =>
      bodyParser({
        body: JSON.stringify({
          stringProperty: 'a string',
          extraProperty: 'invalid',
        }),
      })
    ).toThrowError('parsing input: property extraProperty not allowed');
  });
  it('should reject input with required fields missing', () => {
    expect(() =>
      bodyParser({ body: JSON.stringify({ optionalProperty: 'optional' }) })
    ).toThrowError('parsing input: missing required properties');
  });
  it('should be able to allow extra properties in the type definition', () => {
    const relaxedBodyParser = bodyParserFactory(relaxedSchema);
    expect(
      relaxedBodyParser({
        body: JSON.stringify({
          stringProperty: 'a string',
          extraProperty: 'allowed',
        }),
      })
    ).toEqual({
      stringProperty: 'a string',
      extraProperty: 'allowed',
    });
  });
});
