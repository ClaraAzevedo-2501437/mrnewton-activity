import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../domain/errors/validationError';
import { AppError, NotFoundError } from '../../common/errors';
import { logger } from '../../infra/logger';

/**
 * Error handling middleware
 * Catches and formats all errors for API responses
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred', err);

  // Validation errors
  if (err instanceof ValidationError) {
    const errorMessages = Object.entries(err.validationResult.errors)
      .flatMap(([field, messages]) => messages);
    
    res.status(400).json({
      error: 'Validation Error',
      message: 'Erro na validação dos dados',
      details: errorMessages
    });
    return;
  }

  // Application errors (operational)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message
    });
    return;
  }

  // MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    res.status(500).json({
      error: 'Database Error',
      message: 'Erro ao acessar a base de dados'
    });
    return;
  }

  // Default error response (unexpected errors)
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Ocorreu um erro inesperado'
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
}

/**
 * Request logger middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
}
