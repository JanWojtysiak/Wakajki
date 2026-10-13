import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-discord';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      clientID: getRequiredEnv('DISCORD_CLIENT_ID'),
      clientSecret: getRequiredEnv('DISCORD_CLIENT_SECRET'),
      callbackURL: getRequiredEnv('DISCORD_CALLBACK_URL'),
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
