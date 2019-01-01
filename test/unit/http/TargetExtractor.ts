import TargetExtractor from '../../../src/http/TargetExtractor';

import { createRequest } from 'node-mocks-http';

describe('A TargetExtractor instance', () => {
  let extractor : TargetExtractor;
  beforeAll(() => { extractor = new TargetExtractor(); });

  it('extracts the target from a slash URL', () => {
    const request = createRequest({
      url: '/',
      headers: { host: 'example.org' },
    });
    const identifier = extractor.extract(request);
    expect(identifier.path).toEqual('/');
    expect(identifier.domain).toEqual('example.org');
    expect(identifier.isAcl).toEqual(false);
  });

  it('extracts the target from a URL without trailing slash', () => {
    const request = createRequest({
      url: '/foo/bar',
      headers: { host: 'example.org' },
    });
    const identifier = extractor.extract(request);
    expect(identifier.path).toEqual('/foo/bar');
    expect(identifier.domain).toEqual('example.org');
    expect(identifier.isAcl).toEqual(false);
  });

  it('removes a trailing slash', () => {
    const request = createRequest({
      url: '/foo/bar/',
      headers: { host: 'example.org' },
    });
    const identifier = extractor.extract(request);
    expect(identifier.path).toEqual('/foo/bar');
    expect(identifier.domain).toEqual('example.org');
    expect(identifier.isAcl).toEqual(false);
  });

  it('removes multiple trailing slashes', () => {
    const request = createRequest({
      url: '/foo/bar///',
      headers: { host: 'example.org' },
    });
    const identifier = extractor.extract(request);
    expect(identifier.path).toEqual('/foo/bar');
    expect(identifier.domain).toEqual('example.org');
    expect(identifier.isAcl).toEqual(false);
  });

  it('removes a query string', () => {
    const request = createRequest({
      url: '/foo/bar?abc=xyz',
      headers: { host: 'example.org' },
    });
    const identifier = extractor.extract(request);
    expect(identifier.path).toEqual('/foo/bar');
    expect(identifier.domain).toEqual('example.org');
    expect(identifier.isAcl).toEqual(false);
  });

  it('extracts http://example.org/foo%20bar%20bar', () => {
    const request = createRequest({
      url: '/foo%20bar%20bar',
      headers: { host: 'example.org' },
    });
    const identifier = extractor.extract(request);
    expect(identifier.path).toEqual('/foo bar bar');
    expect(identifier.domain).toEqual('example.org');
    expect(identifier.isAcl).toEqual(false);
  });

  it('does not extract http://example.org/../abc/', () => {
    const request = createRequest({
      url: '/../abc/',
      headers: { host: 'example.org' },
    });
    expect(() => extractor.extract(request))
      .toThrowError('Disallowed /.. segment in URL /../abc/');
  });

  it('does not extract http://example.org/..%2Fabc/', () => {
    const request = createRequest({
      url: '/..%2Fabc/',
      headers: { host: 'example.org' },
    });
    expect(() => extractor.extract(request))
      .toThrowError('Disallowed /.. segment in URL /..%2Fabc/');
  });

  it('recognizes an ACL resource', () => {
    const request = createRequest({
      url: '/foo/bar.acl',
      headers: { host: 'example.org' },
    });
    const identifier = extractor.extract(request);
    expect(identifier.path).toEqual('/foo/bar.acl');
    expect(identifier.domain).toEqual('example.org');
    expect(identifier.isAcl).toEqual(true);
  });

  it('does not allow invalid host names', () => {
    const request = createRequest({
      url: '/',
      headers: { host: 'abc/../' },
    });
    expect(() => extractor.extract(request))
      .toThrowError('Invalid hostname abc/../');
  });
});
