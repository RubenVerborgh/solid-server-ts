import PatchOperation from '../../../../src/ldp/operations/PatchOperation';

import ResourceStore from '../../../__mocks__/ResourceStore';
import ResourceIdentifier from '../../../../src/ldp/ResourceIdentifier';
import PermissionSet from '../../../../src/permissions/PermissionSet';
import ParsedRequestBody from '../../../../src/http/ParsedRequestBody';

describe('A PatchOperation instance', () => {
  const store = new ResourceStore ();
  const target = <ResourceIdentifier> {};
  const parsedBody = <ParsedRequestBody> {
    requiredPermissions: new PermissionSet({ append: true }),
  };
  const operation = new PatchOperation({ store, target, parsedBody });

  it('does not accept a body', () => {
    expect(operation.acceptsBody).toBe(false);
  });

  it('accepts a parsed body', () => {
    expect(operation.acceptsParsedBody).toBe(true);
  });

  it('requires the same permissions as the parsedBody', () => {
    expect(operation.requiredPermissions).toBe(parsedBody.requiredPermissions);
  });

  it('performs a modification', () => {
    expect(operation.performsModification).toBe(true);
  });

  describe('when performing the modification', () => {
    let result : ResourceIdentifier | null;
    beforeEach(async () => {
      result = await operation.performModification();
    });

    it('applies the patch to the target', () => {
      expect(store.modifyResource).toHaveBeenCalledTimes(1);
      expect(store.modifyResource).toHaveBeenCalledWith(target, parsedBody);
    });

    it('returns the target', () => {
      expect(result).toBe(target);
    });
  });
});
