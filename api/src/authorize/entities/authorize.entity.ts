import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../@generated/user/';

@ObjectType('Authorize')
export class Authorize {
    @Field(() => String, { description: 'JWT Token' })
    accessToken: string;

    @Field(() => String, { description: 'JWT Token' })
    refreshToken: string;

    @Field(() => User)
    user: User;
}
