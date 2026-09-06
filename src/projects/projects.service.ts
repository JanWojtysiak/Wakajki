import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'node:crypto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project;
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

    return this.prisma.project.create({
      name: data.name,
      description: data.description || null,
      peopleNeeded: data.peopleNeeded,
      peopleIn: 1,
      sessionId: session.id,
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
}
