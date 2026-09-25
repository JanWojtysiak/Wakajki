import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'node:crypto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByHash(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return await this.prisma.session.where({ tokenHash }).first();
  }

  async findAll(token?: string) {
    const projects = await this.prisma.project.all();
    const sessions = await this.prisma.session.all();
    const sessionToNick = new Map();

    for (const session of sessions) {
      if (session.discordNick) {
        sessionToNick.set(session.id, session.discordNick);
      }
    }

    if (!token) {
      throw new UnauthorizedException(
        'Musisz być zalogowany przez Discord, żeby zobaczyć projekty',
      );
    }

    const session = await this.findByHash(token);
    if (!session || !session.discordNick) {
      throw new UnauthorizedException('Nieprawidłowa sesja');
    }

    const discordNick = session.discordNick;

    const myRequests = await this.prisma.projectRequest
      .where({ sessionId: session.id })
      .all();
    const requestedProjectIds = myRequests.map((request) => request.projectId);

    return projects.map((project) => {
      const participants: string[] = JSON.parse(project.participants || '[]');

      return {
        ...project,
        ownerNick: sessionToNick.get(project.sessionId) || null,
        isOwner: project.sessionId === session.id,
        isJoined: participants.includes(discordNick),
        hasRequested: requestedProjectIds.includes(project.id),
      };
    });
  }

  async create(
    token: string,
    data: {
      name: string;
      description?: string;
      peopleNeeded: number;
      isOpen: boolean;
    },
  ) {
    const session = await this.findByHash(token);

    if (!session || !session.discordNick) {
      throw new UnauthorizedException(
        'Nieprawidłowa sesja lub brak ustawionego nicku',
      );
    }

    const initialParticipants = JSON.stringify([session.discordNick]);

    return this.prisma.project.create({
      name: data.name,
      description: data.description || null,
      peopleNeeded: data.peopleNeeded,
      peopleIn: 1,
      sessionId: session.id,
      participants: initialParticipants,
      isOpen: data.isOpen,
    });
  }

  async update(
    projectId: number,
    token: string,
    data: { name?: string; description?: string; peopleNeeded?: number },
  ) {
    const session = await this.findByHash(token);

    if (!session) {
      throw new UnauthorizedException('Nieprawidłowa sesja');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.peopleNeeded !== undefined)
      updateData.peopleNeeded = data.peopleNeeded;

    const updatedCount = await this.prisma.project
      .where({ id: projectId })
      .where({ sessionId: session.id })
      .updateAndCount(updateData);

    if (updatedCount === 0) {
      throw new UnauthorizedException(
        'Brak uprawnień do edycji tego projektu lub projekt nie istnieje',
      );
    }

    return { message: 'Projekt został zaktualizowany' };
  }

  async remove(projectId: number, token: string) {
    const session = await this.findByHash(token);

    if (!session) {
      throw new UnauthorizedException('Nieprawidłowa sesja');
    }

    const deletedInfo = await this.prisma.project
      .where({ id: projectId })
      .where({ sessionId: session.id })
      .delete();

    if (!deletedInfo) {
      throw new UnauthorizedException(
        'Brak uprawnień lub projekt nie istnieje',
      );
    }

    return { message: 'Projekt został pomyślnie usunięty' };
  }

  async join(projectId: number, token: string) {
    const session = await this.findByHash(token);

    if (!session || !session.discordNick) {
      throw new UnauthorizedException('Nieprawidłowa sesja');
    }

    const project = await this.prisma.project.where({ id: projectId }).first();
    if (!project) {
      throw new NotFoundException('Projekt nie istnieje');
    }

    if (!project.isOpen) {
      throw new BadRequestException(
        'Do tego projektu trzeba wysłać prośbę o dołączenie',
      );
    }

    if (project.peopleIn >= project.peopleNeeded) {
      throw new BadRequestException(
        'Ten projekt osiągnął już maksymalną liczbę osób!',
      );
    }

    const participants = JSON.parse(project.participants || '[]');
    if (participants.includes(session.discordNick)) {
      throw new BadRequestException('Już dołączyłeś do tego projektu!');
    }

    participants.push(session.discordNick);

    const updatedCount = await this.prisma.project
      .where({ id: projectId })
      .updateAndCount({
        peopleIn: project.peopleIn + 1,
        participants: JSON.stringify(participants),
      });

    if (updatedCount === 0) {
      throw new BadRequestException(
        'Wystąpił błąd podczas dołączania do projektu',
      );
    }

    return { message: 'Dołączono do projektu!' };
  }

  async request(projectId: number, token: string, message?: string) {
    const session = await this.findByHash(token);

    if (!session || !session.discordNick) {
      throw new UnauthorizedException('Nieprawidłowa sesja');
    }

    const project = await this.prisma.project.where({ id: projectId }).first();
    if (!project) {
      throw new NotFoundException('Projekt nie istnieje');
    }

    if (project.isOpen) {
      throw new BadRequestException(
        'Ten projekt jest otwarty, możesz od razu dołączyć',
      );
    }

    const participants = JSON.parse(project.participants || '[]');
    if (participants.includes(session.discordNick)) {
      throw new BadRequestException('Już jesteś w tym projekcie!');
    }

    const existingRequest = await this.prisma.projectRequest
      .where({ projectId })
      .where({ sessionId: session.id })
      .first();
    if (existingRequest) {
      throw new BadRequestException('Już wysłałeś prośbę do tego projektu!');
    }

    await this.prisma.projectRequest.create({
      projectId,
      sessionId: session.id,
      discordNick: session.discordNick,
      message: message || null,
    });

    return { message: 'Prośba o dołączenie została wysłana!' };
  }

  async getMyRequests(token: string) {
    const session = await this.findByHash(token);

    if (!session) {
      throw new UnauthorizedException('Nieprawidłowa sesja');
    }

    const myProjects = await this.prisma.project
      .where({ sessionId: session.id })
      .all();
    const pendingRequests = await this.prisma.projectRequest
      .where({ status: 'pending' })
      .all();

    const result: any[] = [];
    for (const request of pendingRequests) {
      const project = myProjects.find((p) => p.id === request.projectId);
      if (project) {
        result.push({
          id: request.id,
          discordNick: request.discordNick,
          message: request.message,
          createdAt: request.createdAt,
          projectId: project.id,
          projectName: project.name,
        });
      }
    }

    return result;
  }

  async answerRequest(requestId: number, token: string, accept: boolean) {
    const session = await this.findByHash(token);

    if (!session) {
      throw new UnauthorizedException('Nieprawidłowa sesja');
    }

    const request = await this.prisma.projectRequest
      .where({ id: requestId })
      .first();
    if (!request || request.status !== 'pending') {
      throw new NotFoundException('Prośba nie istnieje');
    }

    const project = await this.prisma.project
      .where({ id: request.projectId })
      .first();
    if (!project || project.sessionId !== session.id) {
      throw new UnauthorizedException('Brak uprawnień do tej prośby');
    }

    if (!accept) {
      await this.prisma.projectRequest
        .where({ id: requestId })
        .updateAndCount({ status: 'rejected' });

      return { message: 'Prośba została odrzucona' };
    }

    if (project.peopleIn >= project.peopleNeeded) {
      throw new BadRequestException(
        'Ten projekt osiągnął już maksymalną liczbę osób!',
      );
    }

    const participants = JSON.parse(project.participants || '[]');
    if (!participants.includes(request.discordNick)) {
      participants.push(request.discordNick);

      await this.prisma.project.where({ id: project.id }).updateAndCount({
        peopleIn: project.peopleIn + 1,
        participants: JSON.stringify(participants),
      });
    }

    await this.prisma.projectRequest
      .where({ id: requestId })
      .updateAndCount({ status: 'accepted' });

    return { message: 'Prośba została zaakceptowana' };
  }

  async leave(projectId: number, token: string) {
    const session = await this.findByHash(token);

    if (!session || !session.discordNick) {
      throw new UnauthorizedException('Nieprawidłowa sesja');
    }

    const project = await this.prisma.project.where({ id: projectId }).first();
    if (!project) {
      throw new NotFoundException('Projekt nie istnieje');
    }

    let participants = JSON.parse(project.participants || '[]');

    participants = participants.filter(
      (nick: string) => nick !== session.discordNick,
    );

    const newPeopleIn = Math.max(0, project.peopleIn - 1);

    await this.prisma.project.where({ id: projectId }).updateAndCount({
      peopleIn: newPeopleIn,
      participants: JSON.stringify(participants),
    });

    return { message: 'Opuszczono projekt' };
  }

  async getUsersWithProjects() {
    const sessions = await this.prisma.session.all();
    const projects = await this.prisma.project.all();

    const usersMap = new Map();
    const sessionToNick = new Map();

    for (const session of sessions) {
      if (session.discordNick) {
        sessionToNick.set(session.id, session.discordNick);

        if (!usersMap.has(session.discordNick)) {
          usersMap.set(session.discordNick, {
            nick: session.discordNick,
            discordAvatar: session.discordAvatar,
            projects: [],
            joinedProjects: [],
          });
        }
      }
    }

    for (const project of projects) {
      const projectData = { id: project.id, name: project.name };

      const creatorNick = sessionToNick.get(project.sessionId);
      if (creatorNick && usersMap.has(creatorNick)) {
        const user = usersMap.get(creatorNick);
        user.projects.push(projectData);
      }

      const participantsList = JSON.parse(project.participants || '[]');
      for (const participantNick of participantsList) {
        if (usersMap.has(participantNick)) {
          const participantUser = usersMap.get(participantNick);

          if (
            !participantUser.joinedProjects.find(
              (p: any) => p.id === project.id,
            )
          ) {
            participantUser.joinedProjects.push(projectData);
          }
        }
      }
    }

    return Array.from(usersMap.values());
  }
}
