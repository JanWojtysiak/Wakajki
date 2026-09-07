import {
  Controller,
  Get,
  Post,
  Body,
  UnauthorizedException,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SessionToken } from '../app.controller';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  getAllProjects() {
    return this.projectsService.findAll();
  }

  @Post()
  createProject(
    @SessionToken() token: string | undefined,
    @Body() body: CreateProjectDto,
  ) {
    if (!token) {
      throw new UnauthorizedException(
        'Musisz być zalogowany (mieć ciastko), żeby dodać projekt',
      );
    }

    const peopleNeeded = Number(body.peopleNeeded);

    return this.projectsService.create(token, {
      name: body.name,
      description: body.description,
      peopleNeeded: isNaN(peopleNeeded) ? 1 : peopleNeeded,
    });
  }

  @Get('users')
  getUsersList() {
    return this.projectsService.getUsersWithProjects();
  }

  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @SessionToken() token: string | undefined,
    @Body() body: UpdateProjectDto,
  ) {
    if (!token) {
      throw new UnauthorizedException(
        'Musisz być zalogowany, żeby edytować projekt',
      );
    }

    const projectId = Number(id);

    if (isNaN(projectId)) {
      throw new Error('ID projektu musi być liczbą');
    }

    return this.projectsService.update(projectId, token, {
      name: body.name,
      description: body.description,
      peopleNeeded: body.peopleNeeded ? Number(body.peopleNeeded) : undefined,
    });
  }

  @Delete(':id')
  removeProject(
    @Param('id') id: string,
    @SessionToken() token: string | undefined,
  ) {
    if (!token) {
      throw new UnauthorizedException(
        'Musisz być zalogowany, żeby usunąć projekt',
      );
    }

    const projectId = Number(id);
    if (isNaN(projectId)) {
      throw new Error('ID projektu musi być liczbą');
    }

    return this.projectsService.remove(projectId, token);
  }

  @Post(':id/join')
  joinProject(
    @Param('id') id: string,
    @SessionToken() token: string | undefined,
  ) {
    if (!token) {
      throw new UnauthorizedException(
        'Musisz być zalogowany, żeby dołączyć do projektu',
      );
    }

    const projectId = Number(id);
    if (isNaN(projectId)) {
      throw new Error('ID projektu musi być liczbą');
    }

    return this.projectsService.join(projectId, token);
  }

  @Post(':id/leave')
  leaveProject(
    @Param('id') id: string,
    @SessionToken() token: string | undefined,
  ) {
    if (!token) {
      throw new UnauthorizedException('Musisz być zalogowany');
    }

    const projectId = Number(id);
    if (isNaN(projectId)) {
      throw new Error('ID projektu musi być liczbą');
    }

    return this.projectsService.leave(projectId, token);
  }
}
