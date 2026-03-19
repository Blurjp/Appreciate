import { Response } from 'express';
import { ApiResponse } from '../types';

export function success<T>(res: Response, data: T, statusOrMessage?: number | string, status = 200): void {
  const body: ApiResponse<T> = { success: true, data };
  
  if (typeof statusOrMessage === 'string') {
    body.message = statusOrMessage;
  } else if (typeof statusOrMessage === 'number') {
    status = statusOrMessage;
  }
  
  res.status(status).json(body);
}

export function error(
  res: Response,
  message: string,
  code: string,
  status: number
): void {
  const body: ApiResponse = { success: false, error: { message, code } };
  res.status(status).json(body);
}
