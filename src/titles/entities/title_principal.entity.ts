import { ApiProperty } from '@nestjs/swagger';

export class TitlePrincipal {
  @ApiProperty()
  tconst: string;

  @ApiProperty()
  ordering: number;

  @ApiProperty()
  nconst: string | null;

  @ApiProperty()
  category: string | null;

  @ApiProperty()
  job: string | null;

  @ApiProperty()
  characters: string | null;
}
