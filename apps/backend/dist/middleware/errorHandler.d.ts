import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';
declare const errorHandler: (err: AppError | Error, req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map