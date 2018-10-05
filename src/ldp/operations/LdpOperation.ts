import ResourceStore from '../ResourceStore';
import ResourceIdentifier from '../ResourceIdentifier';
import PermissionSet from '../../permissions/PermissionSet';
import Representation from '../Representation';
import ParsedRequestBody from '../../http/ParsedRequestBody';

/**
 * Base class for LDP operations.
 */
export default abstract class LdpOperation {
  public store: ResourceStore;
  public target: ResourceIdentifier;
  public body: Representation | null;
  public parsedBody: ParsedRequestBody | null;

  constructor({ store, target,
                body = null, parsedBody = null } :
              { store: ResourceStore,
                target: ResourceIdentifier,
                body?: Representation,
                parsedBody?: ParsedRequestBody }) {
    this.store = store;
    this.target = target;
    this.body = body;
    this.parsedBody = parsedBody;
  }

  get requiresBody(): boolean { return false; }

  get requiresParsedBody(): boolean { return false; }

  get requiredPermissions(): PermissionSet { return PermissionSet.READ_ONLY; }

  get performsModification(): boolean {
    return this.requiredPermissions.append || this.requiredPermissions.write;
  }

  async performModification(): Promise<ResourceIdentifier | null> {
    return this.target;
  }
}
