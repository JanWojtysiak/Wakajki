import {
  Body,
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  Inject,
  Patch,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service';

const SESSION_COOKIE = 'wakajki_session';
export const SessionToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined =>
    context.switchToHttp().getRequest<Request>().cookies?.[SESSION_COOKIE],
);

@Controller()
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Get()
  async enter(
    @SessionToken() token: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.appService.enter(token);

    if (result.token && result.expiresAt) {
      response.cookie(SESSION_COOKIE, result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: result.expiresAt,
      });
    }

    return {
      page: result.page,
      discordNick: result.discordNick,
    };
  }

  @Patch()
  updateDiscordNick(
    @SessionToken() token: string | undefined,
    @Body() body: Record<string, unknown> | undefined,
  ) {
    return this.appService.updateDiscordNick(token, body?.discordNick);
  }
}
