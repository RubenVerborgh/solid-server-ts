import Patch from './Patch';
import Representation from './Representation';
import ResourceIdentifier from './ResourceIdentifier';

export default interface IResourceStore {
  /**
   * Obtains a representation of the given resource.
   *
   * @param identifier - The identifier of the resource
   *
   * @returns - A representation of the resource
   */
  getRepresentation(identifier: ResourceIdentifier): Promise<Representation>;

  /**
   * Adds a resource to the container.
   *
   * @param container - The identifier of the container
   * @param representation - A representation of the resource
   *
   * @returns - The identifier of the appended resource
   */
  addResource(container: ResourceIdentifier,
              representation: Representation): Promise<ResourceIdentifier>;

  /**
   * Sets or replaces the representation of a resource.
   *
   * @param identifier - The identifier of the resource
   * @param representation - A representation of the resource
   */
  setRepresentation(identifier: ResourceIdentifier,
                    representation: Representation): Promise<void>;

  /**
   * Deletes the given resource.
   *
   * @param identifier - The identifier of the resource
   * @param representation - A representation of the resource
   */
  deleteResource(identifier: ResourceIdentifier): Promise<void>;

  /**
   * Modifies the given resource.
   *
   * @param identifier - The identifier of the resource
   * @param patch - The patch to be applied to the resource
   */
  modifyResource(identifier: ResourceIdentifier, patch: Patch): Promise<void>;
}
