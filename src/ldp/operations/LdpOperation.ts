import ResourceStore from '../ResourceStore';
import ResourceIdentifier from '../ResourceIdentifier';
import PermissionSet from '../../permissions/PermissionSet';
import Representation from '../Representation';
import ParsedRequestBody from '../../http/ParsedRequestBody';

/**
 * Base class for LDP operations.
 */
export default abstract class LdpOperation {
  protected readonly store: ResourceStore;

  public readonly target: ResourceIdentifier;

  private _body: Representation | null;
  private _parsedBody: ParsedRequestBody | null;

  constructor({ store, target, body = null, parsedBody = null } : {
    store: ResourceStore,
    target: ResourceIdentifier,
    body?: Representation,
    parsedBody?: ParsedRequestBody
  }) {
    this.store = store;
    this.target = target;
    this._body = body;
    this._parsedBody = parsedBody;
  }

  get acceptsBody(): boolean { return false; }

  get body(): Representation | null { return this._body; }

  set body(body: Representation | null) {
    if (!this.acceptsBody)
      throw new Error('This operation does not accept a body.');
    if (this._body !== null)
      throw new Error('The body has already been set on this operation.');
    this._body = body;
  }

  get acceptsParsedBody(): boolean { return false; }

  get parsedBody(): ParsedRequestBody | null { return this._parsedBody; }

  set parsedBody(parsedBody: ParsedRequestBody | null) {
    if (!this.acceptsParsedBody)
      throw new Error('This operation does not accept a parsed body.');
    if (this._parsedBody !== null)
      throw new Error('The parsed body has already been set on this operation.');
    this._parsedBody = parsedBody;
  }

  get requiredPermissions(): PermissionSet { return PermissionSet.READ_ONLY; }

  get performsModification(): boolean {
    return this.requiredPermissions.append || this.requiredPermissions.write;
  }

  async performModification(): Promise<ResourceIdentifier | null> {
    return this.target;
  }
}
