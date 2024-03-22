import { Module } from '@nestjs/common';
import { AuthorizeService } from './authorize.service';
import { AuthorizeResolver } from './authorize.resolver';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../common/prisma/prisma.service';
import { GqlThrottlerGuard } from '../common/guards/gql-throttle.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserPasswordService } from '../common/services/user-password/user-password.service';
import { UserRoleService } from '../common/services/user-role/user-role.service';
import { PubSub } from 'graphql-subscriptions';
import { TokensService } from '../common/services/tokens/tokens.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

@Module({
    exports: [AuthorizeService],
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: 'SECRED TEXT',
            signOptions: {
                expiresIn: '7d',
            },
        }),
    ],
    providers: [
        AuthorizeResolver,
        AuthorizeService,
        PrismaService,
        GqlThrottlerGuard,
        JwtStrategy,
        UserPasswordService,
        UserRoleService,
        PubSub,
        RefreshTokenService,
        TokensService,
    ],
})
export class AuthorizeModule {}
