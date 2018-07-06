import * as http from 'http';

import HttpError from 'standard-http-error';

import PermissionSet from '../auth/PermissionSet';
import MethodExtractor from './MethodExtractor';
import TargetExtractor from './TargetExtractor';

/**
 * Handles an HTTP request for the data store.
 */
export default class DataStoreRequestHandler {
  protected methodExtractor: MethodExtractor;
  protected targetExtractor: TargetExtractor;

  constructor(options: {
      methodExtractor: MethodExtractor,
      targetExtractor: TargetExtractor,
    }) {
    this.methodExtractor = options.methodExtractor;
    this.targetExtractor = options.targetExtractor;
  }

  /**
   * Handles an HTTP request.
   *
   * @param request  - The HTTP request
   * @param response - The HTTP response
   * @param next     - An error callback
   */
  public handleRequest(request: http.IncomingMessage, response: http.ServerResponse,
                       next: (error: Error) => void) {
    this._handleRequest(request, response).catch(next);
  }

  /**
   * Handles an HTTP request.
   *
   * @param request  - The HTTP request
   * @param response - The HTTP response
   */
  protected async _handleRequest(request: http.IncomingMessage, response: http.ServerResponse) {
    // Extract and validate the method and the associated required permissions
    const method = this.methodExtractor.extract(request);
    if (!METHOD_PERMISSIONS.hasOwnProperty(method)) {
      throw new HttpError(HttpError.METHOD_NOT_ALLOWED);
    }
    const requiredPermissions = METHOD_PERMISSIONS[method].clone();

    // Extract and validate the target
    let target;
    try {
      target = this.targetExtractor.extract(request);
    } catch (error) {
      throw new HttpError(HttpError.BAD_REQUEST, { cause: error });
    }

    // Generate a response
    response.end(JSON.stringify({ method, requiredPermissions, target }));
  }
}

// Common permission sets
const READ_ONLY = new PermissionSet({ read: true });
const WRITE_ONLY = new PermissionSet({ write: true });
const APPEND_ONLY = new PermissionSet({ append: true });
const READ_WRITE = new PermissionSet({ read: true, write: true });

// Required permissions per HTTP method
const METHOD_PERMISSIONS: { [key: string]: PermissionSet } = {
  GET: READ_ONLY,
  HEAD: READ_ONLY,
  OPTIONS: READ_ONLY,
  POST: APPEND_ONLY,
  PUT: WRITE_ONLY,
  DELETE: WRITE_ONLY,
  PATCH: READ_WRITE,
};
