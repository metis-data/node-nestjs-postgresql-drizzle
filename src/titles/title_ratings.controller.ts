import { Controller, Get, Inject } from '@nestjs/common';
import { TitleRatingsService } from './title_ratings.service';

@Controller("titles")
export class TitleRatingsController {
  constructor(private readonly titleRatingsService: TitleRatingsService) {}

  @Get('ratings/best')
  getBestMovies() {
    return this.titleRatingsService.getBestMovies();
  }

  @Get('ratingsIndexed/best')
  getBestMoviesIndexed() {
    return this.titleRatingsService.getBestMoviesIndexed();
  }
}
