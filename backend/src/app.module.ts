import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ProjectsModule } from './projects/projects.module';
import { AuthController } from './auth/auth.controller';
import { DiscordStrategy } from './auth/discord.strategy';

@Module({
  imports: [ProjectsModule],
  controllers: [AppController, AuthController],
  providers: [AppService, PrismaService, DiscordStrategy],
})
export class AppModule {}
