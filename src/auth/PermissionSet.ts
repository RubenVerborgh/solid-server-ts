/**
 * Describes the needed or actual permissions on a resource.
 */
export default class PermissionSet {
  protected flags: {
    read: boolean,
    write: boolean,
    append: boolean,
    control: boolean,
    [key: string]: boolean,
  };

  constructor({ read = false,   write = false,   append = false,   control = false }:
              { read?: boolean, write?: boolean, append?: boolean, control?: boolean }) {
    this.flags = { read, write, append: append || write, control };
  }

  public get read() { return this.flags.read; }
  public set read(value: boolean) { this.flags.read = value; }

  public get write() { return this.flags.write; }
  public set write(value: boolean) {
    this.flags.write = value;
    if (value) {
      this.append = true;
    }
  }

  public get append() { return this.flags.append; }
  public set append(value: boolean) {
    this.flags.append = value;
    if (!value) {
      this.flags.write = false;
    }
  }

  public get control() { return this.flags.control; }
  public set control(value: boolean) { this.flags.control = value; }

  public clone(): PermissionSet {
    return new PermissionSet(this.flags);
  }

  public includes(subset: PermissionSet) {
    return (!subset.read    || this.read)   &&
           (!subset.write   || this.write)  &&
           (!subset.append  || this.append) &&
           (!subset.control || this.control);
  }

  public toString() {
    const flags = Object.keys(this.flags).filter(f => this.flags[f]);
    return `PermissionSet { ${flags.join(', ') || '(none)'} }`;
  }
}
