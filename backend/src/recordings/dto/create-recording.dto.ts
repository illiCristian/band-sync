import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum RecordingCategory {
    REHEARSAL = 'REHEARSAL',
    STUDIO = 'STUDIO',
    LIVE = 'LIVE',
    DEMO = 'DEMO',
}

export class CreateRecordingDto {
    @IsString()
    @IsNotEmpty()
    songId: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    versionName?: string;

    @IsEnum(RecordingCategory)
    @IsOptional()
    category?: RecordingCategory;

    @IsDateString()
    @IsOptional()
    recordedAt?: string;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    isFinal?: boolean;

    @IsString()
    @IsOptional()
    type?: string;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    duration?: number;
}
