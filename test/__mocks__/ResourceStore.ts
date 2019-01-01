import ResourceStore from '../../src/ldp/ResourceStore';

export default class MockResourceStore implements ResourceStore {
  public getRepresentation = jest.fn();
  public addResource = jest.fn();
  public setRepresentation = jest.fn();
  public deleteResource = jest.fn();
  public modifyResource = jest.fn();
}
