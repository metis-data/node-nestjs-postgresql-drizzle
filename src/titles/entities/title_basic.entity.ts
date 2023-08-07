import { TitlePrincipal } from './title_principal.entity'; 
import { ApiProperty } from '@nestjs/swagger';
import { TitleRating } from './title_rating.entity';

export class TitleBasic {
  @ApiProperty()
  tconst: string;

  @ApiProperty()
  titletype: string | null;

  @ApiProperty()
  primarytitle: string | null;

  @ApiProperty()
  originaltitle: string | null;

  @ApiProperty()
  isadult: string | null;

  @ApiProperty()
  startyear: number | null;

  @ApiProperty()
  endyear: number | null;

  @ApiProperty()
  runtimeminutes: number | null;

  @ApiProperty()
  genres: string | null;
  
  @ApiProperty()
  title_principals: TitlePrincipal[];
  
  @ApiProperty()
  title_rating: TitleRating | null;
}
