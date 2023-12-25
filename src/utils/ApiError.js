class ApiError extends Error {
  constructor(statusCode, message, error = [], stack = "") {
    (this.statusCode = statusCode),
      (this.data = null),
      (this.message = message),
      (this.error = error),
      (this.success = false);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { ApiError };
