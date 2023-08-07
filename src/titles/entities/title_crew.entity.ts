import { ApiProperty } from '@nestjs/swagger';

export class TitleCrew {
  @ApiProperty()
  tconst: string;

  @ApiProperty()
  directors: string | null;

  @ApiProperty()
  writers: string | null;
}
