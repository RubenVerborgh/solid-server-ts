import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import ParsedRequestBody from './IParsedRequestBody';

/**
 * Parser of an HTTP request body.
 */
export default class RequestBodyParser {
  /**
   * Determines whether this parser supports
   * a body accompanied by the given headers.
   */
  public supports(headers: IncomingHttpHeaders = {}): boolean {
    return false;
  }

  /**
   * Parses the given HTTP request body.
   */
  public async parse(body: Readable, headers: IncomingHttpHeaders):
                     Promise<ParsedRequestBody> {
    if (!this.supports(headers)) {
      throw new Error(`Unsupported body: ${headers['content-type']}`);
    }
    return this._parse(body, headers);
  }

  /**
   * Parses the given HTTP request body.
   */
  protected async _parse(body: Readable, headers: IncomingHttpHeaders):
                         Promise<ParsedRequestBody> {
    throw new Error('Not implemented');
  }
}
