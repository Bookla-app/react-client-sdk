import { ZodError } from "zod"; // Import ZodError type

export class BooklaError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
  ) {
    super(message);
    this.name = "BooklaError";
  }
}

export class BooklaValidationError extends BooklaError {
  constructor(
    message: string,
    public details: ZodError,
  ) {
    super(message, "VALIDATION_ERROR");
    this.name = "BooklaValidationError";
  }
}
