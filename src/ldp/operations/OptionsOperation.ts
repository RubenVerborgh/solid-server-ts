import LdpOperation from './LdpOperation';
import ResourceStore from '../IResourceStore';
import ResourceIdentifier from '../IResourceIdentifier';

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
