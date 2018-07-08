import PermissionSet from '../auth/PermissionSet';
import Patch from '../ldp/Patch';
import Representation from '../ldp/Representation';

/**
 * A parsed HTTP request body.
 */
export default interface IParsedRequestBody extends Representation, Patch {
  readonly requiredPermissions: PermissionSet;
}
