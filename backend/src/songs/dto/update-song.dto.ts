import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SongStatus } from '@prisma/client';

export class UpdateSongDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsEnum(SongStatus)
  status?: SongStatus;
}
