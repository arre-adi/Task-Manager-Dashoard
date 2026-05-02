export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function badRequest(message) {
  throw new HttpError(400, message);
}

export function unauthorized(message = "Authentication required") {
  throw new HttpError(401, message);
}

export function forbidden(message = "You do not have permission to perform this action") {
  throw new HttpError(403, message);
}

export function notFound(message = "Resource not found") {
  throw new HttpError(404, message);
}

export function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

