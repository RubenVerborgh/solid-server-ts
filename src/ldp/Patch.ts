import Representation from './Representation';

/**
 * A patch describes modifications to a resource.
 */
export default interface IPatch {
  apply(representation: Representation): void;
}
