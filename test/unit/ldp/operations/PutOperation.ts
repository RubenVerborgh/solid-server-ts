import PutOperation from '../../../../src/ldp/operations/PutOperation';

import ResourceStore from '../../../__mocks__/ResourceStore';
import ResourceIdentifier from '../../../../src/ldp/IResourceIdentifier';
import Representation from '../../../../src/ldp/IRepresentation';
import PermissionSet from '../../../../src/permissions/PermissionSet';

describe('A PutOperation instance', () => {
  const store = new ResourceStore();
  const target = <ResourceIdentifier> {};
  const body = <Representation> {};
  const operation = new PutOperation({ store, target, body });

  it('accepts a body', () => {
    expect(operation.acceptsBody).toBe(true);
  });

  it('does not accept a parsed body', () => {
    expect(operation.acceptsParsedBody).toBe(false);
  });

  it('requires write permissions', () => {
    expect(operation.requiredPermissions).toEqual(PermissionSet.WRITE_ONLY);
  });

  it('performs a modification', () => {
    expect(operation.performsModification).toBe(true);
  });

  describe('when performing the modification', () => {
    let result : ResourceIdentifier | null;
    beforeEach(async () => {
      result = await operation.performModification();
    });

    it('replaces the target representation', () => {
      expect(store.setRepresentation).toHaveBeenCalledTimes(1);
      expect(store.setRepresentation).toHaveBeenCalledWith(target, body);
    });

    it('returns the target', () => {
      expect(result).toBe(target);
    });
  });
});
