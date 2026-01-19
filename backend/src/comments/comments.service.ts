import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) { }

    async create(createCommentDto: CreateCommentDto) {
        return this.prisma.comment.create({
            data: {
                text: createCommentDto.text,
                authorName: createCommentDto.authorName,
                timestampSeconds: createCommentDto.timestampSeconds,
                recording: {
                    connect: { id: createCommentDto.recordingId },
                },
            },
        });
    }

    async update(id: string, data: { text?: string; authorName?: string }) {
        return this.prisma.comment.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.comment.delete({
            where: { id },
        });
    }
}
