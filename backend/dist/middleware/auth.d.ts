import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): void;
/** Optional auth — sets userId if token present, but doesn't block */
export declare function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map