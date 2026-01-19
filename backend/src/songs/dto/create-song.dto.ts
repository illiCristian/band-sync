import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
} from 'class-validator';

export enum SongStatus {
  IDEA = 'IDEA',
  RECORDED = 'RECORDED',
  PUBLISHED = 'PUBLISHED',
}

export class CreateSongDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(SongStatus)
  @IsOptional()
  status?: SongStatus;

  // For MVP, we'll create a default band if not provided or pass bandId
  @IsString()
  @IsNotEmpty()
  bandId: string;
}
