import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@mynaga/shared';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('Error:', err.message);
    console.error(err.stack);

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : err.message,
        },
    } as ApiResponse<never>);
}
