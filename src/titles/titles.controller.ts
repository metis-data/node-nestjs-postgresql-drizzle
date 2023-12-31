import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { TitlesService } from './titles.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TitleBasic } from './entities/title_basic.entity';
import { NameBasic } from '../names/entities/name_basic.entity'

@Controller('')
@ApiTags('titles')
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  @Get('titles/')
  @ApiOkResponse({ type: TitleBasic, isArray: true })
  getTitles(@Query() query) {
    return this.titlesService.getTitles(query.title);
  }

  @Get('titlesForAnActor')
  @ApiOkResponse({ type: TitleBasic, isArray: true })
  titlesForAnActor(@Query() query) {
    return this.titlesService.titlesForAnActor(query.nconst, query.method);
  }

  @Get('highestRatedMoviesForAnActor')
  @ApiOkResponse({ type: TitleBasic, isArray: true })
  highestRatedMoviesForAnActor(@Query() query) {
    return this.titlesService.highestRatedMoviesForAnActor(query.nconst, query.method);
  }

  @Get('highestRatedMovies')
  @ApiOkResponse({ type: TitleBasic, isArray: true })
  highestRatedMovies(@Query() query) {
    return this.titlesService.highestRatedMovies(Number(query.numvotes), query.method);
  }

  @Get('commonMoviesForTwoActors')
  @ApiOkResponse({ type: TitleBasic, isArray: true })
  commonMoviesForTwoActors(@Query() query) {
    return this.titlesService.commonMoviesForTwoActors(query.actor1, query.actor2, query.method);
  }

  @Get('crewOfGivenMovie')
  @ApiOkResponse({ type: NameBasic, isArray: true })
  crewOfGivenMovie(@Query() query) {
    return this.titlesService.crewOfGivenMovie(query.tconst, query.method);
  }

  @Get('mostProlificActorInPeriod')
  @ApiOkResponse({ type: NameBasic, isArray: true })
  mostProlificActorInPeriod(@Query() query) {
    return this.titlesService.mostProlificActorInPeriod(Number(query.startYear), Number(query.endYear), query.method);
  }

  @Get('mostProlificActorInGenre')
  @ApiOkResponse({ type: NameBasic, isArray: true })
  mostProlificActorInGenre(@Query() query) {
    return this.titlesService.mostProlificActorInGenre(query.genre, query.method);
  }

  @Get('mostCommonTeammates')
  @ApiOkResponse({ type: NameBasic, isArray: true })
  mostCommonTeammates(@Query() query) {
    return this.titlesService.mostCommonTeammates(query.nconst, query.method);
  }
}
