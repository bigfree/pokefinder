import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RefreshTokenService } from './refresh-token.service';

@Module({
    providers: [RefreshTokenService, PrismaService],
})
export class RefreshTokenModule {}
