import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateOneRefreshTokenArgs, FindUniqueRefreshTokenArgs } from '../@generated/refresh-token';
import { RefreshToken } from '@prisma/client';

@Injectable()
export class RefreshTokenService {
    constructor(private readonly prismaService: PrismaService) {}

    /**
     * Creates a refresh token with the given arguments and time-to-live (ttl).
     *
     * @param {CreateOneRefreshTokenArgs} createOneRefreshTokenArgs - The arguments for creating the refresh token.
     * @param {number} ttl - The time-to-live for the refresh token.
     * @returns {Promise} - A promise that resolves with the created refresh token.
     */
    public async createOne(createOneRefreshTokenArgs: CreateOneRefreshTokenArgs, ttl: number): Promise<RefreshToken> {
        const { data } = createOneRefreshTokenArgs;
        const expiration: Date = new Date();
        return this.prismaService.refreshToken.create({
            data: {
                ...data,
                expiresAt: new Date(expiration.setDate(expiration.getDate() + ttl)),
            },
        });
    }

    /**
     * Finds a unique refresh token based on the provided arguments.
     *
     * @param {FindUniqueRefreshTokenArgs} findUniqueRefreshTokenArgs - The arguments used to find the unique refresh token.
     * @return {Promise<RefreshToken | null>} - A promise that resolves to the unique refresh token if found, otherwise null.
     */
    public async findUnique(findUniqueRefreshTokenArgs: FindUniqueRefreshTokenArgs): Promise<RefreshToken | null> {
        return this.prismaService.refreshToken.findUniqueOrThrow({
            ...findUniqueRefreshTokenArgs,
        });
    }
}
