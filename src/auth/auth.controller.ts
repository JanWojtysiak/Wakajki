import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { createHash, randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import { Temporal } from '@js-temporal/polyfill';
import { SESSION_COOKIE } from '../app.controller';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordLogin() {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as any;

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      : null;

    const expiresAt = Temporal.Now.instant().add({ hours: 24 * 7 });

    await this.prisma.session.create({
      tokenHash: tokenHash,
      discordId: profile.id,
      discordNick: profile.username,
      discordAvatar: avatarUrl,
      expiresAt,
    });

    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.cookie('myNick', profile.username, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.redirect('http://localhost:5173');
  }
}
