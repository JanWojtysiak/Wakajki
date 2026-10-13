import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const enter = jest.fn();
  const cookie = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: { enter },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('creates a cookie and opens Welcome.jsx for a new session', async () => {
    const expiresAt = new Date('2026-10-05T12:00:00.000Z');
    enter.mockResolvedValue({
      page: 'Welcome.jsx',
      discordNick: null,
      token: 'token',
      expiresAt,
    });

    const result = await appController.enter(undefined, {
      cookie,
    } as unknown as Response);

    expect(enter).toHaveBeenCalledWith(undefined);
    expect(cookie).toHaveBeenCalledWith(
      'wakajki_session',
      'token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        expires: expiresAt,
      }),
    );
    expect(result).toEqual({
      page: 'Welcome.jsx',
      discordNick: null,
    });
  });

  it('uses an existing cookie without replacing it', async () => {
    enter.mockResolvedValue({
      page: null,
      discordNick: 'discord-user',
    });

    const result = await appController.enter('session-token', {
      cookie,
    } as unknown as Response);

    expect(enter).toHaveBeenCalledWith('session-token');
    expect(cookie).not.toHaveBeenCalled();
    expect(result).toEqual({
      page: null,
      discordNick: 'discord-user',
    });
  });
});
