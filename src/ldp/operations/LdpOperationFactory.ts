import ResourceStore from '../IResourceStore';
import ResourceIdentifier from '../IResourceIdentifier';
import Representation from '../IRepresentation';
import ParsedRequestBody from '../../http/IParsedRequestBody';

import LdpOperation from './LdpOperation';
import GetOperation from './GetOperation';
import HeadOperation from './HeadOperation';
import OptionsOperation from './OptionsOperation';
import PostOperation from './PostOperation';
import PutOperation from './PutOperation';
import DeleteOperation from './DeleteOperation';
import PatchOperation from './PatchOperation';

/**
 * Factory for LDP operations.
 */
export default class LdpOperationFactory {
  private store: ResourceStore;

  private operations: {
    [key: string]: { new(settings: any): LdpOperation }
  } = {
    'GET': GetOperation,
    'HEAD': HeadOperation,
    'OPTIONS': OptionsOperation,
    'POST': PostOperation,
    'PUT': PutOperation,
    'DELETE': DeleteOperation,
    'PATCH': PatchOperation,
  };

  constructor({ store } : { store: ResourceStore }) {
    this.store = store;
  }

  createOperation({ method, target, body, parsedBody }:
    { method: string,
                target: ResourceIdentifier,
                body?: Representation,
                parsedBody?: ParsedRequestBody }): LdpOperation {
    const Constructor = this.operations[method];
    if (!Constructor) {
      throw new Error(`Unsupported method: ${method}`);
    }
    const { store } = this;
    return new Constructor({ store, target, body, parsedBody });
  }
}
