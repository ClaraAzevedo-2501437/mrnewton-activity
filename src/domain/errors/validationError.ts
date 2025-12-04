import { ValidationResult } from '../validators/activityValidators';

/**
 * ValidationError - Thrown when activity validation fails
 */
export class ValidationError extends Error {
  public readonly validationResult: ValidationResult;

  constructor(validationResult: ValidationResult) {
    const errorMessages = Object.entries(validationResult.errors)
      .flatMap(([field, messages]) => messages.map(msg => `${field}: ${msg}`))
      .join('; ');
    
    super(`Validation failed: ${errorMessages}`);
    this.name = 'ValidationError';
    this.validationResult = validationResult;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
