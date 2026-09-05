import { createHash } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppService', () => {
  let appService: AppService;
  const findActiveSession = jest.fn();
  const createSession = jest.fn();
  const updateActiveSession = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            findActiveSession,
            createSession,
            updateActiveSession,
          },
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
  });

  it('returns the app for an active configured session', async () => {
    const token = 'a'.repeat(43);
    findActiveSession.mockResolvedValue({ discordNick: 'discord-user' });

    const result = await appService.enter(token);

    expect(findActiveSession).toHaveBeenCalledWith(
      createHash('sha256').update(token).digest('hex'),
      expect.any(Date),
    );
    expect(createSession).not.toHaveBeenCalled();
    expect(result).toEqual({
      page: null,
      discordNick: 'discord-user',
    });
  });

  it('creates a new anonymous session without a valid cookie', async () => {
    createSession.mockResolvedValue(undefined);

    const result = await appService.enter('invalid');

    expect(findActiveSession).not.toHaveBeenCalled();
    expect(createSession).toHaveBeenCalledWith(
      expect.stringMatching(/^[a-f0-9]{64}$/),
      expect.any(Date),
    );
    expect(result).toEqual({
      page: 'Welcome.jsx',
      discordNick: null,
      token: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
      expiresAt: expect.any(Date),
    });
  });

  it('saves the Discord nick for the active cookie session', async () => {
    const token = 'a'.repeat(43);
    updateActiveSession.mockResolvedValue(true);

    const result = await appService.updateDiscordNick(token, ' discord-user ');

    expect(updateActiveSession).toHaveBeenCalledWith(
      createHash('sha256').update(token).digest('hex'),
      'discord-user',
      expect.any(Date),
    );
    expect(result).toEqual({
      page: null,
      discordNick: 'discord-user',
    });
  });
});
