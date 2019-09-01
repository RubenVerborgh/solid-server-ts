import * as http from 'http';
import Credentials from '../auth/ICredentials';

/**
 * Extractor for credentials of a request.
 */
export default interface ICredentialsExtractor {
  /**
   * Extracts the credentials from a request.
   *
   * @param request - The HTTP request
   * @returns The credentials
   */
  extract(request: http.IncomingMessage): Credentials;
}
