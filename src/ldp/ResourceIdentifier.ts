/**
 * An identifier of a resource.
 */
export default interface IResourceIdentifier {
  path: string;
  domain: string;
  isAcl: boolean;
}
