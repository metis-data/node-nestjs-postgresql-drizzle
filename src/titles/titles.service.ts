import { Injectable } from '@nestjs/common';

@Injectable()
export class TitlesService {
  constructor() {}

  getTitles(title: string) {
    return [];
  }

  titlesForAnActor(nconst: string) {
    return [];
  }

  highestRatedMoviesForAnActor(nconst: string) {
    return [];
  }

  highestRatedMovies(numberOfVotes: number) {
    return [];
  }

  commonMoviesForTwoActors(actor1: string, actor2: string) {
    return [];
  }

  crewOfGivenMovie(tconst: string) {
    return [];
  }

  mostProlificActorInPeriod(startYear: number, endYear: number) {
    return [];
  }

  mostProlificActorInGenre(genre: string) {
    return [];
  }

  mostCommonTeammates(nconst: string) {
    return [];
  }
}
