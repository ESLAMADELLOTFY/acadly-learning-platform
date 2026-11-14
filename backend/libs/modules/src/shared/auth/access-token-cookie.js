import { AUTH_CONSTANTS } from './auth.constants.js';
import { TimeHelper } from '../helpers/time.helper.js';
export function setAccessTokenCookie(response, accessToken, expiresIn) {
    response.cookie(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: TimeHelper.parseDurationToMs(expiresIn),
    });
}
//# sourceMappingURL=access-token-cookie.js.map