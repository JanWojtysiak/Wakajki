import 'dotenv/config';
import { defineConfig as definePostgresConfig } from '@prisma/orm-postgres/config';
import { definePrismaConfig } from 'prisma/config';

export default definePrismaConfig({
  orm: definePostgresConfig({
    contract: 'prisma/schema.prisma',
    output: 'src/prisma/generated',
    db: {
      connection: process.env.DATABASE_URL,
    },
  }),
  skills: {
    agents: ['claude', 'cursor', 'agents', 'devin'],
  },
});
