import ResourceIdentifier from '../ldp/ResourceIdentifier';
import Credentials from './Credentials';
import PermissionSet from './PermissionSet';

/**
 * Determines the permissions of an agent.
 */
export default interface IPermissionManager {
  /**
   * Obtains the permissions the agent has on the given resource.
   */
  getPermissions(agent: Credentials, target: ResourceIdentifier): PermissionSet;
}
