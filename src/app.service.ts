import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Temporal } from '@js-temporal/polyfill';

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export type EntryResult = {
  page: 'Welcome.jsx' | null;
  discordNick: string | null;
  token?: string;
  expiresAt?: Date;
};

@Injectable()
export class AppService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
  ) {}

  async enter(token?: string): Promise<EntryResult> {
    if (token && TOKEN_PATTERN.test(token)) {
      const session = await this.prismaService.findActiveSession(
        this.hashToken(token),
        Temporal.Now.instant(),
      );

      if (session) {
        return {
          page: session.discordNick ? null : 'Welcome.jsx',
          discordNick: session.discordNick,
        };
      }
    }

    const newToken = randomBytes(32).toString('base64url');
    const expiresAt = Temporal.Now.instant().add({ hours: 24 });

    await this.prismaService.createSession(this.hashToken(newToken), expiresAt);

    return {
      page: 'Welcome.jsx',
      discordNick: null,
      token: newToken,
      expiresAt: new Date(expiresAt.epochMilliseconds),
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
