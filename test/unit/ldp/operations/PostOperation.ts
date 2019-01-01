import PostOperation from '../../../../src/ldp/operations/PostOperation';

import ResourceStore from '../../../__mocks__/ResourceStore';
import ResourceIdentifier from '../../../../src/ldp/ResourceIdentifier';
import Representation from '../../../../src/ldp/Representation';
import PermissionSet from '../../../../src/permissions/PermissionSet';

describe('A PostOperation instance', () => {
  const store = new ResourceStore();
  const target = <ResourceIdentifier> {};
  const body = <Representation> {};
  const operation = new PostOperation({ store, target, body });

  it('accepts a body', () => {
    expect(operation.acceptsBody).toBe(true);
  });

  it('does not accept a parsed body', () => {
    expect(operation.acceptsParsedBody).toBe(false);
  });

  it('requires append permissions', () => {
    expect(operation.requiredPermissions).toEqual(PermissionSet.APPEND_ONLY);
  });

  it('performs a modification', () => {
    expect(operation.performsModification).toBe(true);
  });

  describe('when performing the modification', () => {
    const newIdentifier = <ResourceIdentifier> {};
    let result : ResourceIdentifier | null;
    beforeEach(async () => {
      store.addResource.mockReturnValueOnce(newIdentifier);
      result = await operation.performModification();
    });

    it('adds a resource to the target', () => {
      expect(store.addResource).toHaveBeenCalledTimes(1);
      expect(store.addResource).toHaveBeenCalledWith(target, body);
    });

    it('returns the new resource identifier', () => {
      expect(result).toBe(newIdentifier);
    });
  });
});
