import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const findActiveSession = jest.fn();
  const createSession = jest.fn();
  const updateActiveSession = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    createSession.mockResolvedValue(undefined);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ findActiveSession, createSession, updateActiveSession })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  it('/ (GET) creates a session and returns Welcome.jsx', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('set-cookie', /wakajki_session=/)
      .expect({
        page: 'Welcome.jsx',
        discordNick: null,
      });
  });

  it('/ (PATCH) completes the cookie session profile', () => {
    updateActiveSession.mockResolvedValue(true);

    return request(app.getHttpServer())
      .patch('/')
      .set('Cookie', `wakajki_session=${'a'.repeat(43)}`)
      .send({ discordNick: 'discord-user' })
      .expect(200)
      .expect({
        page: null,
        discordNick: 'discord-user',
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
