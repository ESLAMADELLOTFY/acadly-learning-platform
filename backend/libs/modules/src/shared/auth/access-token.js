import { AUTH_CONSTANTS } from './auth.constants.js';
export function extractAccessToken(request) {
    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
        return authorization.slice('Bearer '.length);
    }
    const cookie = request.headers.cookie
        ?.split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE_NAME}=`));
    if (!cookie) {
        return null;
    }
    const value = cookie
        .split('=')
        .slice(1)
        .join('=');
    try {
        return decodeURIComponent(value);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=access-token.js.map