import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Erro interno no servidor OS Master';
  
  res.status(status).json({
    error: true,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};
