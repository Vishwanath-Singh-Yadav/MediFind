export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(err, req, res, _next) {
  if (err.name === "ZodError") {
    return res.status(422).json({ message: "Validation failed", issues: err.issues });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ message: "A record with that unique value already exists." });
  }

  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === "production"
    ? "Something went wrong."
    : err.message;
  if (status === 500) console.error(err);
  res.status(status).json({ message, details: err.details });
}
