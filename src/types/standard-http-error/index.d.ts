declare module 'standard-http-error' {
  class HttpError extends Error {
    constructor(status: number, properties?: object);
    static BAD_REQUEST: number;
    static METHOD_NOT_ALLOWED: number;
    static UNSUPPORTED_MEDIA_TYPE: number;
  }
  export = HttpError;
}
