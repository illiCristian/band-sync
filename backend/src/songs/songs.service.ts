import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}

  async create(createSongDto: CreateSongDto) {
    // Ensure a band exists. For MVP, we use the provided bandId or the first one found.
    let bandId = createSongDto.bandId;

    const existingBand = await this.prisma.band.findFirst({
      where: { OR: [{ id: bandId }, { name: 'Default Band' }] },
    });

    if (!existingBand) {
      const newBand = await this.prisma.band.create({
        data: {
          name: 'Default Band',
          id:
            bandId === 'placeholder-band-id' || bandId === 'default'
              ? undefined
              : bandId,
        },
      });
      bandId = newBand.id;
    } else {
      bandId = existingBand.id;
    }

    return this.prisma.song.create({
      data: {
        title: createSongDto.title,
        status: createSongDto.status || 'IDEA',
        band: {
          connect: { id: bandId },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.song.findMany({
      include: {
        band: true,
        recordings: {
          include: {
            comments: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.song.findUnique({
      where: { id },
      include: {
        recordings: {
          include: {
            comments: true,
          },
        },
      },
    });
  }

  async update(id: string, updateSongDto: UpdateSongDto) {
    return this.prisma.song.update({
      where: { id },
      data: {
        title: updateSongDto.title,
        status: updateSongDto.status,
        // add other fields as needed
      },
    });
  }

  async remove(id: string) {
    return this.prisma.song.delete({
      where: { id },
    });
  }
}
