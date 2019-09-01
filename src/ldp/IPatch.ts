import Representation from './IRepresentation';

/**
 * A patch describes modifications to a resource.
 */
export default interface IPatch {
  apply(representation: Representation): void;
}
