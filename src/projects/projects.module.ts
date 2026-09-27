import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsGateway } from './projects.gateway';

@Module({
  providers: [ProjectsService, PrismaService, ProjectsGateway],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
