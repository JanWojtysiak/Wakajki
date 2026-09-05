import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30;
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
        new Date(),
      );

      if (session) {
        return {
          page: session.discordNick ? null : 'Welcome.jsx',
          discordNick: session.discordNick,
        };
      }
    }

    const newToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await this.prismaService.createSession(this.hashToken(newToken), expiresAt);

    return {
      page: 'Welcome.jsx',
      discordNick: null,
      token: newToken,
      expiresAt,
    };
  }

  async updateDiscordNick(
    token: string | undefined,
    value: unknown,
  ): Promise<EntryResult> {
    if (!token || !TOKEN_PATTERN.test(token)) {
      throw new UnauthorizedException();
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('discordNick is required');
    }

    const discordNick = value.trim();
    const length = Array.from(discordNick).length;
    const hasControlCharacter = Array.from(discordNick).some((character) => {
      const code = character.codePointAt(0);
      return code !== undefined && (code < 32 || code === 127);
    });

    if (length < 2 || length > 32 || hasControlCharacter) {
      throw new BadRequestException('discordNick is invalid');
    }

    const updated = await this.prismaService.updateActiveSession(
      this.hashToken(token),
      discordNick,
      new Date(),
    );

    if (!updated) {
      throw new UnauthorizedException();
    }

    return {
      page: null,
      discordNick,
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
