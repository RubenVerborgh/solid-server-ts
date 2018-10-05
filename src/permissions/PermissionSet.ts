/**
 * Describes the needed or actual permissions on a resource.
 */
export default class PermissionSet {
  public static READ_ONLY   = new PermissionSet({ read:   true });
  public static WRITE_ONLY  = new PermissionSet({ write:  true });
  public static APPEND_ONLY = new PermissionSet({ append: true });
  public static READ_WRITE  = new PermissionSet({ read:   true, write: true });

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
  public get write() { return this.flags.write; }
  public get append() { return this.flags.append; }
  public get control() { return this.flags.control; }

  public includes(subset: PermissionSet) {
    return (!subset.read    || this.read)   &&
           (!subset.write   || this.write)  &&
           (!subset.append  || this.append) &&
           (!subset.control || this.control);
  }

  public update({ read, write, append, control }:
                { read?: boolean, write?: boolean, append?: boolean, control?: boolean }) {
    return new PermissionSet({
      read:    typeof    read === 'boolean' ? read    : this.read,
      write:   typeof   write === 'boolean' ? write   : this.write,
      append:  typeof  append === 'boolean' ? append  : this.append,
      control: typeof control === 'boolean' ? control : this.control,
    });
  }

  public toString() {
    const flags = Object.keys(this.flags).filter(f => this.flags[f]);
    return `PermissionSet { ${flags.join(', ') || '(none)'} }`;
  }
}
