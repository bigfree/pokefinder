import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AccessTokenData, RefreshTokenPayload } from '../../../authorize/types/authorize.types';
import { RefreshTokenService } from '../../../refresh-token/refresh-token.service';
import { RefreshToken, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TokensService {
    private jwtBaseOptions = {
        issuer: 'localhost', // TODO: change me
        audience: 'localhost', // TODO: change me
    };

    constructor(
        private readonly jwtService: JwtService,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly prismaService: PrismaService,
    ) {}

    /**
     * Generates a JWT (JSON Web Token) using the provided data.
     *
     * @param {AccessTokenData} data - The token data to be signed.
     * @returns {Promise<string>} - A Promise that resolves to the generated JWT as a string.
     */
    public async generateAccessToken(data: AccessTokenData): Promise<string> {
        return await this.jwtService.signAsync({
            ...data,
            ...this.jwtBaseOptions,
        });
    }

    /**
     * Generates a refresh token for a given user ID and time-to-live (TTL).
     *
     * @param {string} userId - The ID of the user for whom the refresh token is generated.
     * @param {number} ttl - The time-to-live (in seconds) for the refresh token.
     *
     * @return {Promise<string>} - A promise that resolves with the generated refresh token.
     */
    public async generateRefreshToken(userId: string, ttl: number): Promise<string> {
        const token = await this.refreshTokenService.createOne(
            {
                data: {
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            },
            ttl,
        );

        return await this.jwtService.signAsync({
            id: token.id,
            userId: userId,
            expiresIn: token.expiresAt,
            ...this.jwtBaseOptions,
        });
    }

    /**
     * Resolves a refresh token.
     *
     * @param {string} tokenEncoded - The encoded refresh token.
     *
     * @returns {Promise<Token>} - A Promise that resolves to the Token object.
     * @throws {UnprocessableEntityException} - If the refresh token is invalid or revoked.
     */
    public async resolveRefreshToken(tokenEncoded: string): Promise<RefreshToken> {
        const payload = await this.decodeRefreshToken(tokenEncoded);
        const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

        if (!token) {
            throw new UnprocessableEntityException('Invalid refresh token!');
        }

        if (token.isRevoked) {
            throw new UnprocessableEntityException('Refresh token revoked!');
        }

        if (token.expiresAt < new Date()) {
            throw new UnprocessableEntityException('Refresh token expired!');
        }

        return token;
    }

    /**
     * Creates an access token from a refresh token.
     *
     * @param {string} refresh - The refresh token.
     * @returns {Promise<{token: string; user: User}>} - A Promise that resolves to an object containing the access token and the user.
     */
    public async createAccessTokenFromRefreshToken(refresh: string): Promise<{ token: string; user: User }> {
        const refreshToken = await this.resolveRefreshToken(refresh);
        const user = await this.prismaService.user.findUnique({
            include: {
                password: true,
                profile: true,
            },
            where: {
                id: refreshToken.userId,
            },
        });

        const token = await this.generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
            type: user.type,
        });

        return {
            token,
            user,
        };
    }

    /**
     * Decode a refresh token.
     *
     * @param {string} token - The refresh token to decode.
     * @returns {Promise<RefreshTokenPayload>} - A Promise that resolves to the decoded refresh token payload.
     * @throws {UnprocessableEntityException} - If the refresh token is expired or malformed.
     * @private
     */
    private async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
        try {
            return this.jwtService.verifyAsync(token);
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new UnprocessableEntityException('Refresh token expired!');
            } else {
                throw new UnprocessableEntityException('Refresh token malformed!');
            }
        }
    }

    /**
     * Retrieves the stored refresh token based on the provided payload.
     *
     * @param {RefreshTokenPayload} payload - The payload containing the refresh token ID and user ID.
     * @returns {Promise<RefreshToken | null>} The stored refresh token, or null if it is not found.
     * @private
     */
    private async getStoredTokenFromRefreshTokenPayload(payload: RefreshTokenPayload): Promise<RefreshToken | null> {
        if (!payload.id) {
            throw new UnprocessableEntityException('Refresh token malformed');
        }

        return this.prismaService.refreshToken.findUniqueOrThrow({
            where: {
                id: payload.id,
                userId: {
                    equals: payload.userId,
                },
            },
        });
    }
}
