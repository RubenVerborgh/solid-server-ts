import LdpOperation from './LdpOperation';
import ResourceStore from '../IResourceStore';
import ResourceIdentifier from '../IResourceIdentifier';

/**
 * Performs an LDP GET operation.
 */
export default class GetOperation extends LdpOperation {
  constructor(settings :
              { store: ResourceStore,
                target: ResourceIdentifier }) {
    super(settings);
  }
}
