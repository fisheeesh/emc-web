import { CookieOptions } from 'express';

interface CookieConfig {
    accessToken: CookieOptions;
    refreshToken: CookieOptions;
}

const isProduction = process.env.NODE_ENV === 'production';

//* Base cookie options
const baseCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || isProduction,
    sameSite: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || (isProduction ? 'lax' : 'strict'),
    path: '/',
    ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN })
};

//* Cookie configuration
export const cookieConfig: CookieConfig = {
    accessToken: {
        ...baseCookieOptions,
        maxAge: 1000 * 60 * 15 
    },
    refreshToken: {
        ...baseCookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 30 
    }
};

//* Helper function to get cookie options dynamically
export const getCookieOptions = (type: 'accessToken' | 'refreshToken'): CookieOptions => {
    return cookieConfig[type];
};