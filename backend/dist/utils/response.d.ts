import { Response } from 'express';
export declare function success<T>(res: Response, data: T, statusOrMessage?: number | string, status?: number): void;
export declare function error(res: Response, message: string, code: string, status: number): void;
//# sourceMappingURL=response.d.ts.map