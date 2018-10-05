import * as http from 'http';

import HttpError from 'standard-http-error';

import CredentialsExtractor from './CredentialsExtractor';
import MethodExtractor from './MethodExtractor';
import ParsedRequestBody from './ParsedRequestBody';
import RequestBodyParser from './RequestBodyParser';
import TargetExtractor from './TargetExtractor';

import PermissionManager from '../auth/PermissionManager';
import ResourceIdentifier from '../ldp/ResourceIdentifier';
import LdpOperationFactory from '../ldp/operations/LdpOperationFactory';

/**
 * Handles an HTTP request for the data store.
 */
export default class ResourceStoreRequestHandler {
  // Extractors and parsers for the request
  protected methodExtractor: MethodExtractor;
  protected targetExtractor: TargetExtractor;
  protected credentialsExtractor: CredentialsExtractor;
  protected bodyParsers: RequestBodyParser[];

  // Operations
  protected operations: LdpOperationFactory;

  // Permissions
  protected permissionManager: PermissionManager;

  constructor({ methodExtractor, targetExtractor,
                credentialsExtractor, bodyParsers = [],
                operations, permissionManager }:
              { methodExtractor: MethodExtractor,
                targetExtractor: TargetExtractor,
                credentialsExtractor: CredentialsExtractor,
                bodyParsers?: RequestBodyParser[],
                operations: LdpOperationFactory,
                permissionManager: PermissionManager }) {
    this.methodExtractor = methodExtractor;
    this.targetExtractor = targetExtractor;
    this.credentialsExtractor = credentialsExtractor;
    this.bodyParsers = bodyParsers;
    this.permissionManager = permissionManager;
    this.operations = operations;
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
    const { target, operation, requiredPermissions, agent } = parsedRequest;

    // Validate whether the agent has sufficient permissions
    const actualPermissions = this.permissionManager.getPermissions(agent, target);
    if (!actualPermissions.includes(requiredPermissions)) {
      throw new HttpError(agent.authenticated ? HttpError.FORBIDDEN
                                              : HttpError.UNAUTHORIZED);
    }

    // If a modification was requested, perform it
    let resource: ResourceIdentifier | null = target;
    if (operation.performsModification) {
      resource = await operation.performModification();
    }

    // TODO: write representation of the resource
    response.end({ resource });
  }

  /**
   * Parses an HTTP request.
   *
   * @param request - The HTTP request
   *
   * @return - An object containing the properties of the request
   */
  protected async parseRequest(request: http.IncomingMessage) {
    // Extract and validate the target
    let target;
    try {
      target = this.targetExtractor.extract(request);
    } catch (cause) {
      throw new HttpError(HttpError.BAD_REQUEST, { cause });
    }

    // Create the operation based on the HTTP method
    let operation;
    try {
      const method = this.methodExtractor.extract(request);
      operation = this.operations.createOperation({ method, target });
    } catch {
      throw new HttpError(HttpError.METHOD_NOT_ALLOWED);
    }
    // Pass the body to the operation if necessary
    if (operation.requiresBody) {
      operation.body = request;
    }
    if (operation.requiresParsedBody) {
      operation.parsedBody = await this.parseRequestBody(request);
    }

    // Determine required ACL permissions from the target
    const requiredPermissions = operation.requiredPermissions;
    requiredPermissions.control = target.isAcl;

    // Extract the credentials
    const agent = this.credentialsExtractor.extract(request);

    return { target, operation, requiredPermissions, agent };
  }

  /**
   * Parses the body of an HTTP request.
   *
   * @param request - The HTTP request
   *
   * @return - The parsed body
   */
  protected async parseRequestBody(request: http.IncomingMessage):
      Promise<ParsedRequestBody> {
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
