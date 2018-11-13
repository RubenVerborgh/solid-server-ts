import ResourceIdentifier from '../ldp/ResourceIdentifier';
import Credentials from './Credentials';
import PermissionSet from '../permissions/PermissionSet';

/**
 * Determines the permissions of an agent.
 */
export default interface IAuthorizationManager {
  /**
   * Obtains the permissions the agent has on the given resource.
   */
  getPermissions(agent: Credentials, target: ResourceIdentifier):
    Promise<PermissionSet>;
}
