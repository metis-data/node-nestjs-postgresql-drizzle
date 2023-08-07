import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { TitlesService } from './titles.service';

@Controller('')
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  @Get('titles/')
  getTitles(@Query() query) {
    return this.titlesService.getTitles(query.title);
  }

  @Get('titlesForAnActor')
  titlesForAnActor(@Query() query) {
    return this.titlesService.titlesForAnActor(query.nconst, query.method);
  }

  @Get('highestRatedMoviesForAnActor')
  highestRatedMoviesForAnActor(@Query() query) {
    return this.titlesService.highestRatedMoviesForAnActor(query.nconst, query.method);
  }

  @Get('highestRatedMovies')
  highestRatedMovies(@Query() query) {
    return this.titlesService.highestRatedMovies(Number(query.numvotes), query.method);
  }

  @Get('commonMoviesForTwoActors')
  commonMoviesForTwoActors(@Query() query) {
    return this.titlesService.commonMoviesForTwoActors(query.actor1, query.actor2, query.method);
  }

  @Get('crewOfGivenMovie')
  crewOfGivenMovie(@Query() query) {
    return this.titlesService.crewOfGivenMovie(query.tconst, query.method);
  }

  @Get('mostProlificActorInPeriod')
  mostProlificActorInPeriod(@Query() query) {
    return this.titlesService.mostProlificActorInPeriod(Number(query.startYear), Number(query.endYear), query.method);
  }

  @Get('mostProlificActorInGenre')
  mostProlificActorInGenre(@Query() query) {
    return this.titlesService.mostProlificActorInGenre(query.genre, query.method);
  }

  @Get('mostCommonTeammates')
  mostCommonTeammates(@Query() query) {
    return this.titlesService.mostCommonTeammates(query.nconst, query.method);
  }
}
