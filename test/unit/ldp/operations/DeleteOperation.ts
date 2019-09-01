import DeleteOperation from '../../../../src/ldp/operations/DeleteOperation';

import ResourceStore from '../../../__mocks__/ResourceStore';
import ResourceIdentifier from '../../../../src/ldp/IResourceIdentifier';
import PermissionSet from '../../../../src/permissions/PermissionSet';

describe('A DeleteOperation instance', () => {
  const store = new ResourceStore ();
  const target = <ResourceIdentifier> {};
  const operation = new DeleteOperation({ store, target });

  it('does not accept a body', () => {
    expect(operation.acceptsBody).toBe(false);
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

    it('deletes the target', () => {
      expect(store.deleteResource).toHaveBeenCalledTimes(1);
      expect(store.deleteResource).toHaveBeenCalledWith(target);
    });

    it('returns null', () => {
      expect(result).toBe(null);
    });
  });
});
