import ResourceStoreRequestHandler from '../../../src/http/ResourceStoreRequestHandler';

import PermissionSet from '../../../src/permissions/PermissionSet';
import MethodExtractor from '../../../src/http/MethodExtractor';
import TargetExtractor from '../../../src/http/TargetExtractor';
import CredentialsExtractor from '../../../src/http/CredentialsExtractor';
import RequestBodyParser from '../../../src/http/RequestBodyParser';
import AuthorizationManager from '../../../src/auth/AuthorizationManager';
import ResourceStore from '../../__mocks__/ResourceStore';
import LdpOperationFactory from '../../../src/ldp/operations/LdpOperationFactory';

import mock from 'jest-create-mock-instance';
import { createRequest, createResponse } from 'node-mocks-http';

describe('A ResourceStoreRequestHandler instance', () => {
  // Mock data
  const agent = {};
  const target = { isAcl: false };

  // Mock extractors and parsers
  const methodExtractor = mock(MethodExtractor);
  methodExtractor.extract.mockImplementation(request => request.method);
  const targetExtractor = mock(TargetExtractor);
  targetExtractor.extract.mockImplementation(() => target);
  const credentialsExtractor = <jest.Mocked<CredentialsExtractor>> {
    extract: <Function> jest.fn(() => agent),
  };
  const bodyParsers = [0, 1, 2].map(() => mock(RequestBodyParser));

  // Mock permissions
  const authorizationManager = <jest.Mocked<AuthorizationManager>> {
    hasPermissions: <Function> jest.fn(async () => true),
  };

  // Mock store
  const resourceStore = new ResourceStore();
  const operations = new LdpOperationFactory({ store: resourceStore });

  // Create main instance
  let handler : ResourceStoreRequestHandler;
  beforeAll(() => {
    handler = new ResourceStoreRequestHandler({
      methodExtractor,
      targetExtractor,
      credentialsExtractor,
      bodyParsers,
      authorizationManager,
      operations,
    });
  });

  describe('handling a GET request', () => {
    const request = createRequest({ method: 'GET' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });
    afterAll(jest.clearAllMocks);

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

    it('checks the permissions for the agent on the target', () => {
      expect(authorizationManager.hasPermissions).toHaveBeenCalledTimes(1);
      expect(authorizationManager.hasPermissions.mock.calls[0]).toEqual([
        agent,
        target,
        new PermissionSet({ read: true }),
      ]);
    });
  });

  describe('handling a GET request on an ACL resource', () => {
    const request = createRequest({ method: 'GET' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      targetExtractor.extract.mockImplementationOnce(() => ({ isAcl: true }));
      handler.handleRequest(request, response, next);
    });
    afterAll(jest.clearAllMocks);

    it('requires read and control permissions', () => {
      expect(authorizationManager.hasPermissions.mock.calls[0][2]).toEqual(
        new PermissionSet({ read: true, control: true }));
    });
  });

  describe('handling a HEAD request', () => {
    const request = createRequest({ method: 'HEAD' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });
    afterAll(jest.clearAllMocks);

    it('requires read permissions', () => {
      expect(authorizationManager.hasPermissions.mock.calls[0][2]).toEqual(
        new PermissionSet({ read: true }));
    });
  });

  describe('handling an OPTIONS request', () => {
    const request = createRequest({ method: 'OPTIONS' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });
    afterAll(jest.clearAllMocks);

    it('requires read permissions', () => {
      expect(authorizationManager.hasPermissions.mock.calls[0][2]).toEqual(
        new PermissionSet({ read: true }));
    });
  });

  describe('handling a POST request', () => {
    const request = createRequest({ method: 'POST' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });
    afterAll(jest.clearAllMocks);

    it('requires append permissions', () => {
      expect(authorizationManager.hasPermissions.mock.calls[0][2]).toEqual(
        new PermissionSet({ append: true }));
    });

    it('asks the source to create a new resource', () => {
      expect(resourceStore.addResource).toHaveBeenCalledTimes(1);
      expect(resourceStore.addResource).toHaveBeenCalledWith(target, request);
    });

    it('writes a response', () => {
      expect(response.finished).toBe(true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a PUT request', () => {
    const request = createRequest({ method: 'PUT' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });
    afterAll(jest.clearAllMocks);

    it('requires write permissions', () => {
      expect(authorizationManager.hasPermissions.mock.calls[0][2]).toEqual(
        new PermissionSet({ write: true }));
    });

    it('asks the source to write a representation', () => {
      expect(resourceStore.setRepresentation).toHaveBeenCalledTimes(1);
      expect(resourceStore.setRepresentation).toHaveBeenCalledWith(target, request);
    });

    it('writes a response', () => {
      expect(response.finished).toBe(true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a DELETE request', () => {
    const request = createRequest({ method: 'DELETE' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });
    afterAll(jest.clearAllMocks);

    it('requires write permissions', () => {
      expect(authorizationManager.hasPermissions.mock.calls[0][2]).toEqual(
        new PermissionSet({ write: true }));
    });

    it('asks the source to delete the resource', () => {
      expect(resourceStore.deleteResource).toHaveBeenCalledTimes(1);
      expect(resourceStore.deleteResource).toHaveBeenCalledWith(target);
    });

    it('writes a response', () => {
      expect(response.finished).toBe(true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a PATCH request when no body parser matches', () => {
    const request = createRequest({ method: 'PATCH' });
    const response = createResponse();
    const next = jest.fn();

    beforeAll(() => {
      handler.handleRequest(request, response, next);
    });
    afterAll(() => {
      bodyParsers.forEach(p => p.supports.mockClear());
    });

    it('does not ask the source to modify the resource', () => {
      expect(resourceStore.modifyResource).not.toHaveBeenCalled();
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
      bodyParsers[1].supports.mockImplementationOnce(() => true);
      bodyParsers[1].parse.mockImplementationOnce(async () => parsedBody);

      handler.handleRequest(request, response, next);
    });
    afterAll(jest.clearAllMocks);

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

    it('obtains the required permissions from the body parser', () => {
      const requiredPermissions = authorizationManager.hasPermissions.mock.calls[0][2];
      expect(requiredPermissions).toEqual(parsedBody.requiredPermissions);
    });

    it('asks the source to modify the resource', () => {
      expect(resourceStore.modifyResource).toHaveBeenCalledTimes(1);
      expect(resourceStore.modifyResource).toHaveBeenCalledWith(target, parsedBody);
    });

    it('writes a response', () => {
      expect(response.finished).toBe(true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a PATCH request when the matching parser errors', () => {
    const request = createRequest({ method: 'PATCH' });
    const response = createResponse();
    const next = jest.fn();
    const cause = new Error('cause');

    beforeAll(() => {
      bodyParsers[1].supports.mockImplementationOnce(() => true);
      bodyParsers[1].parse.mockImplementationOnce(() => { throw cause; });

      handler.handleRequest(request, response, next);
    });
    afterAll(jest.clearAllMocks);

    it('does not ask the source to modify the resource', () => {
      expect(resourceStore.modifyResource).not.toHaveBeenCalled();
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
    afterAll(jest.clearAllMocks);

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
    afterAll(jest.clearAllMocks);

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

  describe('handling a PUT request that requires permission', () => {
    describe('without an authenticated agent', () => {
      const request = createRequest({ method: 'PUT' });
      const response = createResponse();
      const next = jest.fn();

      beforeAll(() => {
        authorizationManager.hasPermissions.mockReturnValueOnce(false);
        credentialsExtractor.extract.mockReturnValueOnce({ authenticated: false });
        handler.handleRequest(request, response, next);
      });
      afterAll(jest.clearAllMocks);

      it('does not ask the source to set a representation', () => {
        expect(resourceStore.setRepresentation).not.toHaveBeenCalled();
      });

      it('does not write a response', () => {
        expect(response.finished).toBe(false);
      });

      it('calls next with a 401 error', () => {
        expect(next).toHaveBeenCalledTimes(1);
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('status', 401);
      });
    });

    describe('with an authenticated agent', () => {
      const request = createRequest({ method: 'PUT' });
      const response = createResponse();
      const next = jest.fn();

      beforeAll(() => {
        authorizationManager.hasPermissions.mockReturnValueOnce(false);
        credentialsExtractor.extract.mockReturnValueOnce({ authenticated: true });
        handler.handleRequest(request, response, next);
      });
      afterAll(jest.clearAllMocks);

      it('does not ask the source to set a representation', () => {
        expect(resourceStore.setRepresentation).not.toHaveBeenCalled();
      });

      it('does not write a response', () => {
        expect(response.finished).toBe(false);
      });

      it('calls next with a 403 error', () => {
        expect(next).toHaveBeenCalledTimes(1);
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('status', 403);
      });
    });
  });
});
