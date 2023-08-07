import { ApiProperty } from '@nestjs/swagger';

export class TitleRatingIndexed {
  @ApiProperty()
  tconst: string;

  @ApiProperty()
  averagerating: number | null;

  @ApiProperty()
  numvotes: bigint | null;
}
