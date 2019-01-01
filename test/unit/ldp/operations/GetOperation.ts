import GetOperation from '../../../../src/ldp/operations/GetOperation';

import ResourceStore from '../../../../src/ldp/ResourceStore';
import ResourceIdentifier from '../../../../src/ldp/ResourceIdentifier';
import PermissionSet from '../../../../src/permissions/PermissionSet';

describe('A GetOperation instance', () => {
  const store = <ResourceStore> {};
  const target = <ResourceIdentifier> {};
  const operation = new GetOperation({ store, target });

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
