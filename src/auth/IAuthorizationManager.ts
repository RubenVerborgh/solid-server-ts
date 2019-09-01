import ResourceIdentifier from '../ldp/IResourceIdentifier';
import Credentials from './ICredentials';
import PermissionSet from '../permissions/PermissionSet';

/**
 * Determines the permissions of an agent.
 */
export default interface IAuthorizationManager {
  /**
   * Verifies whether the agent has the required permissions on the given target.
   */
  hasPermissions(
    agent: Credentials,
    target: ResourceIdentifier,
    requiredPermissions: PermissionSet,
  ): Promise<boolean>;
}
