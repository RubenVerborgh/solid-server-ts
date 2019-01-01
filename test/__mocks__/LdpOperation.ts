import LdpOperation from '../../src/ldp/operations/LdpOperation';

export default class MockLdpOperation extends LdpOperation {
  private options: any;

  constructor(options: any = {}) {
    super({ store: {} as any, target: {} as any });
    this.options = options;
    this.performModification = jest.fn();
  }

  get acceptsParsedBody() { return this.options.acceptsParsedBody; }

  get requiredPermissions() { return this.options.requiredPermissions; }
}
