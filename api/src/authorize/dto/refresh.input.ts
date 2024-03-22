import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class RefreshInput {
    @Field(() => String, {
        description: 'Refresh token',
    })
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
