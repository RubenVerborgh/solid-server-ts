import * as http from 'http';

/**
 * Extractor for the HTTP method of a request.
 */
export default class MethodExtractor {
  /**
   * Extracts the HTTP method from a request.
   *
   * @param request - The HTTP request
   * @returns The HTTP method
   */
  public extract(request: http.IncomingMessage): string {
    // The current implementation is trivial,
    // but in the future we might look at X-Http-Method-Override and others.
    return request.method || 'GET';
  }
}
