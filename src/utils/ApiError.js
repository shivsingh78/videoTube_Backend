// Custom error class for API responses
class ApiError extends Error {
  // Constructor for the custom error class
  constructor(
    statusCode, // The HTTP status code to indicate the type of error
    message = "Something went wrong", // Optional human-readable error message (defaults to "Something went wrong")
    errors = [], // Optional array of additional error details or objects
    stack = "" // Optional error stack trace (usually you don't need to provide this)
  ) {
    super(message); // Call the parent constructor (Error) to initialize its properties

    // Define custom error properties for API responses
    this.statusCode = statusCode;
    this.data = null; // Can be used to store additional error data if needed
    this.message = message;
    this.success = false; // Indicate an error condition
    this.errors = errors;

    // Set the stack trace for debugging purposes
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
