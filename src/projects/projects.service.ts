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

  async findAll() {
    return this.prisma.project.all();
  }

  async create(
    token: string,
    data: { name: string; description?: string; peopleNeeded: number },
  ) {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const session = await this.prisma.session.where({ tokenHash }).first();

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
    });
  }

  async update(
    projectId: number,
    token: string,
    data: { name?: string; description?: string; peopleNeeded?: number },
  ) {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const session = await this.prisma.session.where({ tokenHash }).first();

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
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const session = await this.prisma.session.where({ tokenHash }).first();

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
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const session = await this.prisma.session.where({ tokenHash }).first();

    if (!session || !session.discordNick) {
      throw new UnauthorizedException('Nieprawidłowa sesja');
    }

    const project = await this.prisma.project.where({ id: projectId }).first();
    if (!project) {
      throw new NotFoundException('Projekt nie istnieje');
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

  async leave(projectId: number, token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const session = await this.prisma.session.where({ tokenHash }).first();

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

    const newPeopleIn = Math.max(1, project.peopleIn - 1);

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

        if (!user.joinedProjects.find((p: any) => p.id === project.id)) {
          user.joinedProjects.push(projectData);
        }
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
