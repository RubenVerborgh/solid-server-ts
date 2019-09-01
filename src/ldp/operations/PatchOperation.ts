import LdpOperation from './LdpOperation';
import ResourceStore from '../IResourceStore';
import ResourceIdentifier from '../IResourceIdentifier';
import PermissionSet from '../../permissions/PermissionSet';
import ParsedRequestBody from '../../http/IParsedRequestBody';

/**
 * Performs an LDP PATCH operation.
 */
export default class PatchOperation extends LdpOperation {
  constructor(settings :
              { store: ResourceStore,
                target: ResourceIdentifier,
                parsedBody?: ParsedRequestBody }) {
    super(settings);
  }

  get acceptsParsedBody(): boolean { return true; }

  get requiredPermissions(): PermissionSet {
    return this.patch.requiredPermissions;
  }

  protected get patch(): ParsedRequestBody {
    return this.parsedBody as ParsedRequestBody;
  }

  async performModification(): Promise<ResourceIdentifier> {
    await this.store.modifyResource(this.target, this.patch);
    return this.target;
  }
}
