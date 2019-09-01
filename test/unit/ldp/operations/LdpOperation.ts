import LdpOperation from '../../../../src/ldp/operations/LdpOperation';

import ResourceStore from '../../../../src/ldp/IResourceStore';
import ResourceIdentifier from '../../../../src/ldp/IResourceIdentifier';
import Representation from '../../../../src/ldp/IRepresentation';
import ParsedRequestBody from '../../../../src/http/IParsedRequestBody';
import PermissionSet from '../../../../src/permissions/PermissionSet';

class MyLdpOperation extends LdpOperation {}

describe('A default LdpOperation instance', () => {
  const store = <ResourceStore> {};
  const target = <ResourceIdentifier> {};
  const operation = new MyLdpOperation({ store, target });

  it('exposes the target', () => {
    expect(operation.target).toBe(target);
  });

  it('does not accept a body', () => {
    expect(operation.acceptsBody).toBe(false);
  });

  it('does not have a body', () => {
    expect(operation.body).toBe(null);
  });

  it('does not allow setting a body', () => {
    expect(() => { operation.body = <Representation> {}; })
      .toThrow(new Error("This operation does not accept a body."));
  });

  it('does not accept a parsed body', () => {
    expect(operation.acceptsParsedBody).toBe(false);
  });

  it('does not have a parsed body', () => {
    expect(operation.parsedBody).toBe(null);
  });

  it('does not allow setting a parsed body', () => {
    expect(() => { operation.parsedBody = <ParsedRequestBody> {}; })
      .toThrow(new Error("This operation does not accept a parsed body."));
  });

  it('requires read permissions', () => {
    expect(operation.requiredPermissions).toEqual(PermissionSet.READ_ONLY);
  });

  it('does not perform a modification', () => {
    expect(operation.performsModification).toEqual(false);
  });

  it('errors when trying to perform a modification', () => {
    return expect(operation.performModification())
      .rejects.toThrow(new Error('This operation does not perform a modification.'));
  });
});
