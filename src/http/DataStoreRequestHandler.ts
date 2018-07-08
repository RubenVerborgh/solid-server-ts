import * as http from 'http';

import HttpError from 'standard-http-error';

import PermissionManager from '../auth/PermissionManager';
import PermissionSet from '../auth/PermissionSet';
import CredentialsExtractor from './CredentialsExtractor';
import MethodExtractor from './MethodExtractor';
import RequestBody from './RequestBody';
import RequestBodyParser from './RequestBodyParser';
import TargetExtractor from './TargetExtractor';

/**
 * Handles an HTTP request for the data store.
 */
export default class DataStoreRequestHandler {
  // Extractors and parsers for the request
  protected methodExtractor: MethodExtractor;
  protected targetExtractor: TargetExtractor;
  protected credentialsExtractor: CredentialsExtractor;
  protected bodyParsers: RequestBodyParser[];

  // Permissions
  protected permissionManager: PermissionManager;

  constructor({ methodExtractor, targetExtractor,
                credentialsExtractor, bodyParsers = [],
                permissionManager }:
              { methodExtractor: MethodExtractor,
                targetExtractor: TargetExtractor,
                credentialsExtractor: CredentialsExtractor,
                bodyParsers?: RequestBodyParser[],
                permissionManager: PermissionManager }) {
    this.methodExtractor = methodExtractor;
    this.targetExtractor = targetExtractor;
    this.credentialsExtractor = credentialsExtractor;
    this.bodyParsers = bodyParsers;
    this.permissionManager = permissionManager;
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
    // Parse the request
    const parsedRequest = await this.parseRequest(request);
    const { target, agent, requiredPermissions } = parsedRequest;

    // Validate whether the agent has sufficient permissions
    const actualPermissions = this.permissionManager.getPermissions(agent, target);
    if (!actualPermissions.includes(requiredPermissions)) {
      throw new HttpError(agent.authenticated ? HttpError.FORBIDDEN
                                              : HttpError.UNAUTHORIZED);
    }

    // TODO: write actual response
    response.end();
  }

  /**
   * Parses an HTTP request.
   *
   * @param request - The HTTP request
   *
   * @return - An object containing the properties of the request
   */
  protected async parseRequest(request: http.IncomingMessage) {
    // Extract and validate the method
    const method = this.methodExtractor.extract(request);
    if (!METHOD_PERMISSIONS.hasOwnProperty(method)) {
      throw new HttpError(HttpError.METHOD_NOT_ALLOWED);
    }

    // Extract and validate the target
    let target;
    try {
      target = this.targetExtractor.extract(request);
    } catch (cause) {
      throw new HttpError(HttpError.BAD_REQUEST, { cause });
    }

    // Extract the credentials
    const agent = this.credentialsExtractor.extract(request);

    // Determine the required permissions based on the method or request body
    let requiredPermissions: PermissionSet;
    let requestBody: RequestBody | undefined;
    if (!PERMISSIONS_IN_BODY[method]) {
      // The method fully determines the permissions
      requiredPermissions = METHOD_PERMISSIONS[method].clone();
    } else {
      // Determine the permissions by parsing the body
      requestBody = await this.parseRequestBody(request);
      requiredPermissions = requestBody.requiredPermissions;
    }
    // Determine ACL permissions from the target
    requiredPermissions.control = target.isAcl;

    return { method, target, agent, requiredPermissions, requestBody };
  }

  /**
   * Parses the body of an HTTP request.
   *
   * @param request - The HTTP request
   *
   * @return - The parsed body
   */
  protected async parseRequestBody(request: http.IncomingMessage): Promise<RequestBody> {
    const bodyParser = this.bodyParsers.find(p => p.supports(request.headers));
    if (!bodyParser) {
      throw new HttpError(HttpError.UNSUPPORTED_MEDIA_TYPE);
    }
    try {
      return bodyParser.parse(request, request.headers);
    } catch (cause) {
      throw new HttpError(HttpError.BAD_REQUEST, { cause });
    }
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

// Methods that require parsing the request body in order to determine permissions
const PERMISSIONS_IN_BODY: { [key: string]: boolean } = {
  PATCH: true,
};
