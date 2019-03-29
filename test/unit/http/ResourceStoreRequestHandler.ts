import ResourceStoreRequestHandler from '../../../src/http/ResourceStoreRequestHandler';

import * as http from 'http';
import PermissionSet from '../../../src/permissions/PermissionSet';
import MethodExtractor from '../../../src/http/MethodExtractor';
import TargetExtractor from '../../../src/http/TargetExtractor';
import CredentialsExtractor from '../../../src/http/CredentialsExtractor';
import RequestBodyParser from '../../../src/http/RequestBodyParser';
import ParsedRequestBody from '../../../src/http/ParsedRequestBody';
import AuthorizationManager from '../../__mocks__/AuthorizationManager';
import LdpOperation from '../../__mocks__/LdpOperation';
import LdpOperationFactory from '../../../src/ldp/operations/LdpOperationFactory';

import { createRequest, createResponse } from 'node-mocks-http';

describe('A ResourceStoreRequestHandler instance', () => {
  // Mock data
  const agent = {};
  const method = 'METHOD';
  const target = { isAcl: false };

  // Mock extractors and parsers
  const methodExtractor = <jest.Mocked<MethodExtractor>> {
    extract: <Function> jest.fn(() => method),
  };
  const targetExtractor = <jest.Mocked<TargetExtractor>> {
    extract: <Function> jest.fn(() => target),
  };
  const credentialsExtractor = <jest.Mocked<CredentialsExtractor>> {
    extract: <Function> jest.fn(() => agent),
  };
  const bodyParsers = [0, 1, 2].map(() => <jest.Mocked<RequestBodyParser>> {
    supports: <Function> jest.fn(() => false),
    parse: <Function> jest.fn(),
  });

  // Mock permissions
  const authorizationManager = new AuthorizationManager();

  // Mock operations
  const operations = <jest.Mocked<LdpOperationFactory>> {
    createOperation: <Function> jest.fn(),
  };

  // Create main instance
  const handler = new ResourceStoreRequestHandler({
    methodExtractor,
    targetExtractor,
    credentialsExtractor,
    bodyParsers,
    authorizationManager,
    operations,
  });

  // Variables for testing assertions
  let operation: LdpOperation;
  let request: http.IncomingMessage;
  let response: http.ServerResponse;
  let next = jest.fn();
  const cause = new Error('cause');

  // Creates a request that handles the given operation
  function sendRequestFor(requestedOperation?: LdpOperation) {
    if (requestedOperation) {
      operation = requestedOperation;
      operations.createOperation.mockReturnValueOnce(operation);
    }
    else {
      operations.createOperation.mockImplementationOnce(() => {
        throw new Error();
      });
    }

    request = createRequest();
    response = createResponse();
    next = jest.fn();
    handler.handleRequest(request, response, next);

    return new Promise(resolve => setImmediate(resolve));
  }

  describe('handling a read-only request', () => {
    beforeEach(() => sendRequestFor(new LdpOperation({
      requiredPermissions: PermissionSet.READ_ONLY })
    ));

    it('calls the method extractor with the request', () => {
      expect(methodExtractor.extract).toHaveBeenCalledTimes(1);
      expect(methodExtractor.extract).toBeCalledWith(request);
    });

    it('calls the target extractor with the request', () => {
      expect(targetExtractor.extract).toHaveBeenCalledTimes(1);
      expect(targetExtractor.extract).toBeCalledWith(request);
    });

    it('creates an operation for the extracted method and target', () => {
      expect(operations.createOperation).toHaveBeenCalledTimes(1);
      expect(operations.createOperation).toBeCalledWith({ method, target });
    });

    it('does not perform a modification', () => {
      expect(operation.performModification).not.toBeCalled();
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
        operation.requiredPermissions,
      ]);
    });
  });

  describe('handling a request for an ACL resource', () => {
    beforeEach(async () => {
      const target = { isAcl: true } as any;
      targetExtractor.extract.mockImplementationOnce(() => target);
      await sendRequestFor(new LdpOperation({
        requiredPermissions: PermissionSet.READ_ONLY,
      }));
    });

    it('requires control permissions', () => {
      expect(authorizationManager.hasPermissions).toHaveBeenCalledTimes(1);
      expect(authorizationManager.hasPermissions.mock.calls[0][2]).toEqual(
        new PermissionSet({ read: true, control: true }));
    });
  });

  describe('handling a request with an unsupported method', () => {
    beforeEach(() => sendRequestFor(undefined));

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
    beforeEach(async () => {
      targetExtractor.extract
        .mockImplementationOnce(() => { throw cause; });
      await sendRequestFor(new LdpOperation({}));
    });

    beforeEach(() => {
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

  describe('handling a request without appropriate permission', () => {
    describe('without an authenticated agent', () => {
      beforeEach(async () => {
        const credentials = { authenticated: false } as any;
        authorizationManager.hasPermissions.mockReturnValueOnce(false);
        credentialsExtractor.extract.mockReturnValueOnce(credentials);
        await sendRequestFor(new LdpOperation({}));
      });

      it('does not perform a modification', () => {
        expect(operation.performModification).not.toBeCalled();
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
      beforeEach(async () => {
        const credentials = { authenticated: true } as any;
        authorizationManager.hasPermissions.mockReturnValueOnce(false);
        credentialsExtractor.extract.mockReturnValueOnce(credentials);
        await sendRequestFor(new LdpOperation({}));
      });

      it('does not perform a modification', () => {
        expect(operation.performModification).not.toBeCalled();
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

  describe('handling request that requires a body parser', () => {
    describe('when no body parser matches', () => {
      beforeEach(() => sendRequestFor(new LdpOperation({
        requiredPermissions: PermissionSet.APPEND_ONLY,
        acceptsParsedBody: true,
      })));

      it('does not perform a modification', () => {
        expect(operation.performModification).not.toBeCalled();
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

    describe('when the second body parser matches', () => {
      const parsedBody = <ParsedRequestBody> {};

      beforeEach(async () => {
        bodyParsers[1].supports.mockImplementationOnce(() => true);
        bodyParsers[1].parse.mockImplementationOnce(async () => parsedBody);
        await sendRequestFor(new LdpOperation({
          requiredPermissions: PermissionSet.APPEND_ONLY,
          acceptsParsedBody: true,
        }));
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

      it('sets the parsed body on the operation', () => {
        expect(operation.parsedBody).toBe(parsedBody);
      });

      it('performs a modification', () => {
        expect(operation.performModification).toHaveBeenCalledTimes(1);
      });

      it('writes a response', () => {
        expect(response.finished).toBe(true);
      });

      it('does not call next', () => {
        expect(next).not.toBeCalled();
      });
    });

    describe('when the matching body parser errors', () => {
      beforeEach(async () => {
        bodyParsers[1].supports.mockImplementationOnce(() => true);
        bodyParsers[1].parse.mockImplementationOnce(() => Promise.reject(cause));
        await sendRequestFor(new LdpOperation({
          requiredPermissions: PermissionSet.APPEND_ONLY,
          acceptsParsedBody: true,
        }));
      });

      it('does not perform a modification', () => {
        expect(operation.performModification).not.toBeCalled();
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
});
