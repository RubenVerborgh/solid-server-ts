import AuthorizationManager from '../../src/auth/AuthorizationManager';

export default class MockAuthorizationManager implements jest.Mocked<AuthorizationManager> {
  public hasPermissions = jest.fn(async () => true) as any;
}
