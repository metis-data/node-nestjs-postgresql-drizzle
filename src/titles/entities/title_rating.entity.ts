import { ApiProperty } from '@nestjs/swagger';

export class TitleRating {
  @ApiProperty()
  tconst: string;

  @ApiProperty()
  averagerating: number | null;

  @ApiProperty()
  numvotes: bigint | null;
}
