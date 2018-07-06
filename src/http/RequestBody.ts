import PermissionSet from '../auth/PermissionSet';

/**
 * A parsed HTTP request body.
 */
export default interface IRequestBody {
  readonly requiredPermissions: PermissionSet;
}
