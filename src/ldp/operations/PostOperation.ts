import LdpOperation from './LdpOperation';
import ResourceStore from '../IResourceStore';
import ResourceIdentifier from '../IResourceIdentifier';
import Representation from '../IRepresentation';
import PermissionSet from '../../permissions/PermissionSet';

/**
 * Performs an LDP POST operation.
 */
export default class PostOperation extends LdpOperation {
  constructor(settings :
              { store: ResourceStore,
                target: ResourceIdentifier,
                body: Representation }) {
    super(settings);
  }

  get acceptsBody(): boolean { return true; }

  get requiredPermissions(): PermissionSet { return PermissionSet.APPEND_ONLY; }

  async performModification(): Promise<ResourceIdentifier> {
    return this.store.addResource(this.target, this.body as Representation);
  }
}
