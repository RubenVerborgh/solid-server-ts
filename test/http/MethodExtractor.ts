import MethodExtractor from '../../src/http/MethodExtractor';

import { createRequest } from 'node-mocks-http';

describe('A MethodExtractor instance', () => {
  let extractor : MethodExtractor;
  beforeAll(() => { extractor = new MethodExtractor(); });

  it('defaults to GET', () => {
    const request = createRequest();
    expect(extractor.extract(request)).toEqual('GET');
  });

  it('extracts the method from the method property', () => {
    const request = createRequest({ method: 'POST' });
    expect(extractor.extract(request)).toEqual('POST');
  });
});
