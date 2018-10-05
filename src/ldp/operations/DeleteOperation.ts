import LdpOperation from './LdpOperation';
import ResourceStore from '../ResourceStore';
import ResourceIdentifier from '../ResourceIdentifier';
import PermissionSet from '../../permissions/PermissionSet';

/**
 * Performs an LDP DELETE operation.
 */
export default class DeleteOperation extends LdpOperation {
  constructor(settings :
              { store: ResourceStore,
                target: ResourceIdentifier }) {
    super(settings);
  }

  get requiredPermissions(): PermissionSet { return PermissionSet.WRITE_ONLY }

  async performModification(): Promise<null> {
    await this.store.deleteResource(this.target);
    return null;
  }
}
