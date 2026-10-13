import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App> | undefined;
  const findActiveSession = jest.fn();
  const createSession = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
    process.env.DISCORD_CLIENT_SECRET = 'test-client-secret';
    process.env.DISCORD_CALLBACK_URL = 'http://localhost/auth/discord/callback';
    createSession.mockResolvedValue(undefined);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ findActiveSession, createSession })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  it('/ (GET) creates a session and returns Welcome.jsx', () => {
    return request(app!.getHttpServer())
      .get('/')
      .expect(200)
      .expect('set-cookie', /wakajki_session=/)
      .expect({
        page: 'Welcome.jsx',
        discordNick: null,
      });
  });

  afterEach(async () => {
    await app?.close();
  });
});
