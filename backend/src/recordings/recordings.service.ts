import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordingDto } from './dto/create-recording.dto';

@Injectable()
export class RecordingsService {
  constructor(private prisma: PrismaService) { }

  async create(createRecordingDto: CreateRecordingDto, fileUrl: string) {
    return this.prisma.recording.create({
      data: {
        songId: createRecordingDto.songId,
        url: fileUrl,
        versionName: createRecordingDto.versionName || 'Take 1',
        category: createRecordingDto.category || 'REHEARSAL',
        recordedAt: createRecordingDto.recordedAt
          ? new Date(createRecordingDto.recordedAt)
          : new Date(),
        isFinal: createRecordingDto.isFinal || false,
        type: createRecordingDto.type || 'audio/mpeg',
        duration: createRecordingDto.duration || 0,
      },
    });
  }

  async findBySong(songId: string) {
    return this.prisma.recording.findMany({
      where: { songId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.recording.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.recording.delete({
      where: { id },
    });
  }
}
