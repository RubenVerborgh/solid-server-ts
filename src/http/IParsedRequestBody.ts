import PermissionSet from '../permissions/PermissionSet';
import Patch from '../ldp/IPatch';
import Representation from '../ldp/IRepresentation';

/**
 * A parsed HTTP request body.
 */
export default interface IParsedRequestBody extends Representation, Patch {
  readonly requiredPermissions: PermissionSet;
}
