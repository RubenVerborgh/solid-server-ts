import * as http from 'http';

import URL from 'url';
import ResourceIdentifier from './ResourceIdentifier';

const VALID_HOST = /^([a-z0-9-]+\.)*[a-z0-9-]+$/;

/**
 * Extractor for the target resource of a request.
 */
export default class TargetExtractor {
  /**
   * Extracts the target resource from a request.
   *
   * @param request - The HTTP request
   * @returns The target resource
   */
  public extract(request: http.IncomingMessage): ResourceIdentifier {
    // Extract path
    const { pathname } = URL.parse(request.url || '');
    const path = decodeURI(pathname || '/').replace(/(?<=.)\/+$/, '');
    if (path.indexOf('/..') >= 0) {
      throw new Error(`Disallowed /.. segment in URL ${pathname}`);
    }

    // Extract domain
    const domain = (request.headers.host || '').replace(/:\d+$/, '');
    if (!VALID_HOST.test(domain)) {
      throw new Error(`Invalid hostname ${domain}`);
    }

    return { path, domain };
  }
}
