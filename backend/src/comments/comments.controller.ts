import { Controller, Post, Body, Delete, Param, Patch } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    create(@Body() createCommentDto: CreateCommentDto) {
        return this.commentsService.create(createCommentDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: { text?: string; authorName?: string }) {
        return this.commentsService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.commentsService.remove(id);
    }
}
