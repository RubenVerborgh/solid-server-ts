import DataStoreRequestHandler from '../../src/http/DataStoreRequestHandler';

import MethodExtractor from '../../src/http/MethodExtractor';
import TargetExtractor from '../../src/http/TargetExtractor';
import PermissionSet from '../../src/auth/PermissionSet';
import RequestBodyParser from '../../src/http/RequestBodyParser';
import mock from 'jest-create-mock-instance';
import { createRequest, createResponse } from 'node-mocks-http';

describe('A DataStoreRequestHandler instance', () => {
  const methodExtractor = mock(MethodExtractor);
  methodExtractor.extract.mockImplementation(request => request.method);
  const targetExtractor = mock(TargetExtractor);
  const bodyParsers = [0, 1, 2].map(() => mock(RequestBodyParser));

  let handler : DataStoreRequestHandler;
  beforeAll(() => {
    handler = new DataStoreRequestHandler({
      methodExtractor,
      targetExtractor,
      bodyParsers,
    });
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

    it('requires read permissions', () => {
      const body = JSON.parse(response._getData());
      const requiredPermissions = new PermissionSet(body.requiredPermissions.flags);
      expect(requiredPermissions).toHaveProperty('read', true);
      expect(requiredPermissions).toHaveProperty('write', false);
      expect(requiredPermissions).toHaveProperty('append', false);
      expect(requiredPermissions).toHaveProperty('control', false);
    });
  });

  describe('handling a HEAD request', () => {
    const request = createRequest({ method: 'HEAD' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });

    it('requires read permissions', () => {
      const body = JSON.parse(response._getData());
      const requiredPermissions = new PermissionSet(body.requiredPermissions.flags);
      expect(requiredPermissions).toHaveProperty('read', true);
      expect(requiredPermissions).toHaveProperty('write', false);
      expect(requiredPermissions).toHaveProperty('append', false);
      expect(requiredPermissions).toHaveProperty('control', false);
    });
  });

  describe('handling an OPTIONS request', () => {
    const request = createRequest({ method: 'OPTIONS' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });

    it('requires read permissions', () => {
      const body = JSON.parse(response._getData());
      const requiredPermissions = new PermissionSet(body.requiredPermissions.flags);
      expect(requiredPermissions).toHaveProperty('read', true);
      expect(requiredPermissions).toHaveProperty('write', false);
      expect(requiredPermissions).toHaveProperty('append', false);
      expect(requiredPermissions).toHaveProperty('control', false);
    });
  });

  describe('handling a POST request', () => {
    const request = createRequest({ method: 'POST' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });

    it('requires append permissions', () => {
      const body = JSON.parse(response._getData());
      const requiredPermissions = new PermissionSet(body.requiredPermissions.flags);
      expect(requiredPermissions).toHaveProperty('read', false);
      expect(requiredPermissions).toHaveProperty('write', false);
      expect(requiredPermissions).toHaveProperty('append', true);
      expect(requiredPermissions).toHaveProperty('control', false);
    });
  });

  describe('handling a PUT request', () => {
    const request = createRequest({ method: 'PUT' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });

    it('requires write permissions', () => {
      const body = JSON.parse(response._getData());
      const requiredPermissions = new PermissionSet(body.requiredPermissions.flags);
      expect(requiredPermissions).toHaveProperty('read', false);
      expect(requiredPermissions).toHaveProperty('write', true);
      expect(requiredPermissions).toHaveProperty('append', true);
      expect(requiredPermissions).toHaveProperty('control', false);
    });
  });

  describe('handling a DELETE request', () => {
    const request = createRequest({ method: 'DELETE' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });

    it('requires write permissions', () => {
      const body = JSON.parse(response._getData());
      const requiredPermissions = new PermissionSet(body.requiredPermissions.flags);
      expect(requiredPermissions).toHaveProperty('read', false);
      expect(requiredPermissions).toHaveProperty('write', true);
      expect(requiredPermissions).toHaveProperty('append', true);
      expect(requiredPermissions).toHaveProperty('control', false);
    });
  });

  describe('handling a PATCH request when no body parser matches', () => {
    const request = createRequest({ method: 'PATCH' });
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
      expect(error).toHaveProperty('status', 415);
    });
  });

  describe('handling a PATCH request when the second body parser matches', () => {
    const request = createRequest({ method: 'PATCH' });
    const response = createResponse();
    const next = jest.fn();
    const parsedBody = {
      requiredPermissions: new PermissionSet({ write: true, append: true }),
    };

    beforeAll(() => {
      bodyParsers.forEach(p => p.supports.mockClear());

      bodyParsers[1].supports.mockReturnValueOnce(true);
      bodyParsers[1].parse.mockReturnValueOnce(Promise.resolve(parsedBody));

      handler.handleRequest(request, response, next);
    });

    it('checks whether the first body parser supports the body', () => {
      expect(bodyParsers[0].supports).toHaveBeenCalledTimes(1);
      expect(bodyParsers[0].supports).toHaveBeenCalledWith(request.headers);
    });

    it('checks whether the second body parser supports the body', () => {
      expect(bodyParsers[1].supports).toHaveBeenCalledTimes(1);
      expect(bodyParsers[1].supports).toHaveBeenCalledWith(request.headers);
    });

    it('does not check whether the third body parser supports the body', () => {
      expect(bodyParsers[2].supports).not.toHaveBeenCalled();
    });

    it('uses the second body parser', () => {
      expect(bodyParsers[1].parse).toHaveBeenCalledTimes(1);
      expect(bodyParsers[1].parse).toHaveBeenCalledWith(request, request.headers);
    });

    it('writes a response', () => {
      expect(response.finished).toBe(true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });

    it('obtains the required permissions from the body parser', () => {
      const body = JSON.parse(response._getData());
      const requiredPermissions = new PermissionSet(body.requiredPermissions.flags);
      expect(requiredPermissions).toHaveProperty('read', false);
      expect(requiredPermissions).toHaveProperty('write', true);
      expect(requiredPermissions).toHaveProperty('append', true);
      expect(requiredPermissions).toHaveProperty('control', false);
    });
  });

  describe('handling a PATCH request when the matching parser errors', () => {
    const request = createRequest({ method: 'PATCH' });
    const response = createResponse();
    const next = jest.fn();
    const cause = new Error('cause');

    beforeAll(() => {
      bodyParsers.forEach(p => p.supports.mockClear());

      bodyParsers[1].supports.mockReturnValueOnce(true);
      bodyParsers[1].parse.mockImplementationOnce(() => { throw cause; });

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

  describe('handling a request with an unsupported method', () => {
    const request = createRequest({ method: 'TRACE' });
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
      targetExtractor.extract.mockImplementationOnce(() => { throw cause; });
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
