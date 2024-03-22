import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenData, AccessTokenPayload } from '../types/authorize.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    /**
     * Constructor for creating a new instance of the class.
     * @constructor
     */
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'SECRED TEXT',
        });
    }

    /**
     * Validate function extracts email and id fields from JwtTokenData object.
     *
     * @param {AccessTokenData} payload - The payload containing email and id fields.
     * @returns {Object} - An object containing email and id fields.
     */
    public validate = async (payload: AccessTokenPayload): Promise<AccessTokenData> => ({
        email: payload.email,
        id: payload.id,
        role: payload.role,
        type: payload.type,
    });
}
