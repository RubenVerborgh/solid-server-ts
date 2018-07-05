import DataStoreRequestHandler from '../../src/http/DataStoreRequestHandler';

import MethodExtractor from '../../src/http/MethodExtractor';
import TargetExtractor from '../../src/http/TargetExtractor';
import { createRequest, createResponse } from 'node-mocks-http';

describe('A DataStoreRequestHandler instance', () => {
  const methodExtractor = <MethodExtractor> {
    extract: jest.fn().mockImplementation(request => request.method),
  };
  const targetExtractor = <TargetExtractor> {
    extract: jest.fn(),
  };

  let handler : DataStoreRequestHandler;
  beforeAll(() => {
    handler = new DataStoreRequestHandler({ methodExtractor, targetExtractor });
  });

  describe('handling a GET request', () => {
    const request = createRequest({
      method: 'GET',
    });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });

    it('calls the method extractor with the request', () => {
      expect(methodExtractor.extract).toHaveBeenCalledTimes(1);
      expect(methodExtractor.extract).toBeCalledWith(request);
    });

    it('calls the target extractor with the request', () => {
      expect(targetExtractor.extract).toHaveBeenCalledTimes(1);
      expect(targetExtractor.extract).toBeCalledWith(request);
    });

    it('writes a response', () => {
      expect(response.finished).toBe(true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a request with an unsupported method', () => {
    const request = createRequest({
      method: 'TRACE',
    });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });

    it('does not write a response', () => {
      expect(response.finished).toBe(false);
    });

    it('calls next with a 405 error', () => {
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('status', 405);
    });
  });

  describe('handling a request with an invalid target', () => {
    const request = createRequest();
    const response = createResponse();
    const next = jest.fn();
    const cause = new Error('cause');

    beforeAll(() => {
      targetExtractor.extract = jest.fn().mockImplementationOnce(() => { throw cause; });
      handler.handleRequest(request, response, next);
    });

    it('does not write a response', () => {
      expect(response.finished).toBe(false);
    });

    it('calls next with a 400 error', () => {
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('status', 400);
      expect(error).toHaveProperty('cause', cause);
    });
  });
});
