import * as http from 'http';
import MethodExtractor from '../../src/http/MethodExtractor';
import TargetExtractor from '../../src/http/TargetExtractor';
import CredentialsExtractor from '../../src/http/CredentialsExtractor';
import AuthorizationManager from '../__mocks__/AuthorizationManager';
import ResourceStore from '../__mocks__/ResourceStore';
import ResourceStoreRequestHandler from '../../src/http/ResourceStoreRequestHandler';
import LdpOperationFactory from '../../src/ldp/operations/LdpOperationFactory';

import { createRequest, createResponse } from 'node-mocks-http';

// TODO: As more components become implemented,
// more detailed assertions should be added below.

describe('A ResourceStoreRequestHandler with an LdpOperationFactory', () => {
  // Create or mock extractors and parsers
  const methodExtractor = new MethodExtractor();
  const targetExtractor = new TargetExtractor();
  const credentialsExtractor = {
    extract: () => ({}) as any,
  } as CredentialsExtractor;
  const parsedBody = {
    requiredPermissions: { append: true },
  };
  const bodyParsers = [{
    supports: () => true,
    parse: () => parsedBody,
  } as any];

  // Mock permissions
  const authorizationManager = new AuthorizationManager();

  // Create operation factory
  const store = new ResourceStore();
  const operations = new LdpOperationFactory({ store });

  // Create main instance
  const handler = new ResourceStoreRequestHandler({
    methodExtractor,
    targetExtractor,
    credentialsExtractor,
    bodyParsers,
    authorizationManager,
    operations,
  });

  // Request headers
  const headers = {
    host: 'example.org',
  };

  // Variables for testing assertions
  let request: http.IncomingMessage;
  let response: http.ServerResponse;
  let next = jest.fn();

  // Creates a request that handles the given operation
  function sendRequest(options: object) {
    request = createRequest(options);
    response = createResponse();
    next = jest.fn();
    handler.handleRequest(request, response, next);

    return new Promise(resolve => setImmediate(resolve));
  }

  describe('handling a GET request', () => {
    beforeEach(() => sendRequest({ method: 'GET', headers }));

    it('writes a 200 response', () => {
      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('finished', true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a HEAD request', () => {
    beforeEach(() => sendRequest({ method: 'HEAD', headers }));

    it('writes a 200 response', () => {
      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('finished', true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling an OPTIONS request', () => {
    beforeEach(() => sendRequest({ method: 'OPTIONS', headers }));

    it('writes a 200 response', () => {
      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('finished', true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a POST request', () => {
    beforeEach(() => sendRequest({ method: 'POST', headers }));

    it('adds a resource to the target', () => {
      expect(store.addResource).toHaveBeenCalledTimes(1);
    });

    it('writes a 200 response', () => {
      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('finished', true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a PUT request', () => {
    beforeEach(() => sendRequest({ method: 'PUT', headers }));

    it('replaces the target representation', () => {
      expect(store.setRepresentation).toHaveBeenCalledTimes(1);
    });

    it('writes a 200 response', () => {
      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('finished', true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a DELETE request', () => {
    beforeEach(() => sendRequest({ method: 'DELETE', headers }));

    it('deletes the target', () => {
      expect(store.deleteResource).toHaveBeenCalledTimes(1);
    });

    it('writes a 200 response', () => {
      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('finished', true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a PATCH request', () => {
    beforeEach(() => sendRequest({ method: 'PATCH', headers }));

    it('applies the patch to the target', () => {
      expect(store.modifyResource).toHaveBeenCalledTimes(1);
    });

    it('writes a 200 response', () => {
      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('finished', true);
    });

    it('does not call next', () => {
      expect(next).not.toBeCalled();
    });
  });

  describe('handling a TRACE request', () => {
    beforeEach(() => sendRequest({ method: 'TRACE', headers }));

    it('does not write a response', () => {
      expect(response).toHaveProperty('finished', false);
    });

    it('calls next with a 405 error', () => {
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('status', 405);
    });
  });

  describe('handling a GET request without Host header', () => {
    beforeEach(() => sendRequest({ method: 'GET' }));

    it('does not write a response', () => {
      expect(response).toHaveProperty('finished', false);
    });

    it('calls next with a 400 error', () => {
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('status', 400);
      expect(error).toHaveProperty('cause');
      expect(error.cause).toEqual(new Error('Invalid hostname: (none)'));
    });
  });
});
