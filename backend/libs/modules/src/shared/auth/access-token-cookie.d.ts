import type { Response } from 'express';
export declare function setAccessTokenCookie(response: Pick<Response, 'cookie'>, accessToken: string, expiresIn: string): void;
