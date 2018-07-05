import * as http from 'http';

import HttpError from 'standard-http-error';
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
    // Extract and validate the method
    const method = this.methodExtractor.extract(request);
    if (!/^(GET|HEAD|OPTIONS|POST|PUT|DELETE|PATCH)$/.test(method)) {
      throw new HttpError(HttpError.METHOD_NOT_ALLOWED);
    }

    // Extract and validate the target
    let target;
    try {
      target = this.targetExtractor.extract(request);
    } catch (error) {
      throw new HttpError(HttpError.BAD_REQUEST, { cause: error });
    }

    // Generate a response
    response.end(JSON.stringify({ method, target }));
  }
}
