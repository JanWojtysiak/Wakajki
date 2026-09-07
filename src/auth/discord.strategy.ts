import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-discord';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      clientID: '1546482863443288074',
      clientSecret: 'xGE6xAA1eGk5NQxHRVgDLACNnz99xjzz',
      callbackURL: 'http://localhost:3000/auth/discord/callback',
      scope: ['identify'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    return done(null, profile);
  }
}
