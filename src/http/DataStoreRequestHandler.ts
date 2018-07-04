import * as http from 'http';

import HttpError from 'standard-http-error';
import MethodExtractor from './MethodExtractor';

/**
 * Handles an HTTP request for the data store.
 */
export default class DataStoreRequestHandler {
  protected methodExtractor: MethodExtractor;

  constructor(options: {
      methodExtractor: MethodExtractor,
    }) {
    this.methodExtractor = options.methodExtractor;
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

    response.end();
  }
}
