import { RefreshToken, User } from '@prisma/client';

export type TokenBasePayload = {
    issuer: string;
    audience: string;
    exp: number;
    iat: number;
};

export type AccessTokenData = Pick<User, 'id' | 'email' | 'type' | 'role'>;
export type AccessTokenPayload = AccessTokenData & TokenBasePayload;

export type RefreshTokenData = Pick<RefreshToken, 'id' | 'userId'>;
export type RefreshTokenPayload = RefreshTokenData & TokenBasePayload;
