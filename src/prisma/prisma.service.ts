import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Contract } from './generated/contract';

const contractJson: unknown = require('./generated/contract.json');

async function createDatabase() {
  const { default: postgres } = await import('@prisma/orm-postgres/runtime');

  return postgres<Contract>({
    contractJson,
    url: process.env.DATABASE_URL,
  });
}

type Database = Awaited<ReturnType<typeof createDatabase>>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private database?: Database;

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      throw new ServiceUnavailableException('DATABASE_URL is required');
    }

    this.database = await createDatabase();
    await this.database.connect();
  }

  async onModuleDestroy() {
    await this.database?.close();
  }

  async findActiveSession(tokenHash: string, now: Date) {
    return this.session
      .select('discordNick')
      .where({ tokenHash })
      .where((session) => session.expiresAt.gt(now))
      .first();
  }

  async createSession(tokenHash: string, expiresAt: Date) {
    return this.session.create({
      tokenHash,
      discordNick: null,
      expiresAt,
    });
  }

  async updateActiveSession(tokenHash: string, discordNick: string, now: Date) {
    const updated = await this.session
      .where({ tokenHash })
      .where((session) => session.expiresAt.gt(now))
      .updateAndCount({ discordNick });

    return updated > 0;
  }

  public get session() {
    if (!this.database) {
      throw new ServiceUnavailableException('Database is not connected');
    }
    return this.database.orm.public.Session;
  }

  public get project() {
    if (!this.database) {
      throw new ServiceUnavailableException('Database is not connected');
    }
    return this.database.orm.public.Project;
  }
}
