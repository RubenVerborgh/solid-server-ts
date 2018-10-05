import LdpOperation from './LdpOperation';
import ResourceStore from '../ResourceStore';
import ResourceIdentifier from '../ResourceIdentifier';

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
