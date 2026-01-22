import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Delete,
    Param,
    Put,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecordingsService } from './recordings.service';
import { CreateRecordingDto } from './dto/create-recording.dto';
import { UpdateRecordingDto } from './dto/update-recording.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { StorageService } from '../storage/storage.service';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recordings')
export class RecordingsController {
    constructor(
        private readonly recordingsService: RecordingsService,
        private readonly storageService: StorageService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            limits: {
                fileSize: 100 * 1024 * 1024, // 100MB
            },
        }),
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() createRecordingDto: CreateRecordingDto,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        try {
            // 1. Upload the staged local file to the cloud
            console.log('Staging file at:', file.path);
            const cloudResult = await this.storageService.uploadFile(file.path);

            // 2. Map existing DTO + Cloud results
            const result = await this.recordingsService.create(
                {
                    ...createRecordingDto,
                    duration: cloudResult.duration,
                },
                cloudResult.url,
            );

            // 3. Cleanup local file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            return result;
        } catch (error) {
            console.error('Upload error details:', error);
            // Cleanup on error too
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw new BadRequestException('Cloud upload failed: ' + error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.recordingsService.remove(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateRecordingDto: UpdateRecordingDto,
    ) {
        return this.recordingsService.update(id, updateRecordingDto);
    }
}
