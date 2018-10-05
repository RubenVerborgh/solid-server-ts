import LdpOperation from './LdpOperation';
import ResourceStore from '../ResourceStore';
import ResourceIdentifier from '../ResourceIdentifier';

/**
 * Performs an LDP OPTIONS operation.
 */
export default class OptionsOperation extends LdpOperation {
  constructor(settings :
              { store: ResourceStore,
                target: ResourceIdentifier }) {
    super(settings);
  }
}
