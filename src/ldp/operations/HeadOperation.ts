import LdpOperation from './LdpOperation';
import ResourceStore from '../IResourceStore';
import ResourceIdentifier from '../IResourceIdentifier';

/**
 * Performs an LDP HEAD operation.
 */
export default class HeadOperation extends LdpOperation {
  constructor(settings :
              { store: ResourceStore,
                target: ResourceIdentifier }) {
    super(settings);
  }
}
