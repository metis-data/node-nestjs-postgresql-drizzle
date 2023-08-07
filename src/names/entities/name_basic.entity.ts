import { ApiProperty } from '@nestjs/swagger';

export class NameBasic {
  @ApiProperty()
  nconst: string;

  @ApiProperty()
  primaryname: string | null;

  @ApiProperty()
  birthyear: number | null;

  @ApiProperty()
  deathyear: number | null;

  @ApiProperty()
  primaryprofession: string | null;

  @ApiProperty()
  knownfortitles: string | null;
}
