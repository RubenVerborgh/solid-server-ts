import OptionsOperation from '../../../../src/ldp/operations/OptionsOperation';

import ResourceStore from '../../../../src/ldp/IResourceStore';
import ResourceIdentifier from '../../../../src/ldp/IResourceIdentifier';
import PermissionSet from '../../../../src/permissions/PermissionSet';

describe('A OptionsOperation instance', () => {
  const store = <ResourceStore> {};
  const target = <ResourceIdentifier> {};
  const operation = new OptionsOperation({ store, target });

  it('does not accept a body', () => {
    expect(operation.acceptsBody).toBe(false);
  });

  it('does not accept a parsed body', () => {
    expect(operation.acceptsParsedBody).toBe(false);
  });

  it('requires read permissions', () => {
    expect(operation.requiredPermissions).toEqual(PermissionSet.READ_ONLY);
  });

  it('does not perform a modification', () => {
    expect(operation.performsModification).toBe(false);
  });
});
