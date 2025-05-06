// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { 
  AppError, 
  BadRequestError, 
  ConflictError, 
  InputValidationError, 
  UnauthorizedError 
} from '../errors';

// Error response interface
interface ErrorResponse {
  status: string;
  message: string;
  errors?: Record<string, string>;
  stack?: string;
  error?: any;
}

// MongoDB specific error interfaces
interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, any>;
}

interface MongoValidationError extends Error {
  errors: {
    [path: string]: {
      message: string;
    };
  };
}

interface MongoCastError extends Error {
  path?: string;
  value?: string;
}

// Development environment error handler (with detailed error info)
const sendDevError = (err: AppError, res: Response): void => {
  const response: ErrorResponse = {
    status: err.status || 'error',
    message: err.message,
    stack: err.stack,
    error: err
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(err.statusCode || 500).json(response);
};

// Production environment error handler (sanitized error info)
const sendProdError = (err: AppError, res: Response): void => {
  // Operational errors that we trust: send to client
  if (err.isOperational) {
    const response: ErrorResponse = {
      status: err.status,
      message: err.message
    };
    
    // Add validation errors if present
    if (err.errors) {
      response.errors = err.errors;
    }
    
    res.status(err.statusCode).json(response);
    return;
  } 
  
  // Programming or unknown errors: don't leak error details to client
  console.error('ERROR 💥', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

// MongoDB specific error handlers
const handleMongoDBDuplicateKeyError = (err: MongoError): ConflictError => {
  if (!err.keyValue) {
    return new ConflictError('Duplicate field value');
  }
  
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = ${value}. Please use another value!`;
  return new ConflictError(message);
};

const handleMongoDBValidationError = (err: MongoValidationError): InputValidationError => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new InputValidationError(message);
};

const handleMongoDBCastError = (err: MongoCastError): BadRequestError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new BadRequestError(message);
};

// Express error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err as AppError;
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Handle specific errors
  if (error.code === 11000) error = handleMongoDBDuplicateKeyError(error as MongoError);
  if (error.name === 'ValidationError') error = handleMongoDBValidationError(error as MongoValidationError);
  if (error.name === 'CastError') error = handleMongoDBCastError(error as MongoCastError);
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') error = new UnauthorizedError('Invalid token. Please log in again!');
  if (error.name === 'TokenExpiredError') error = new UnauthorizedError('Your token has expired. Please log in again!');

  // Send different errors based on environment
  if (process.env.NODE_ENV === 'development') {
    sendDevError(error, res);
  } else {
    sendProdError(error, res);
  }
};