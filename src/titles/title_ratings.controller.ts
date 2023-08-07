import {
  Controller,
  Get,
} from '@nestjs/common';
import { TitleRatingsService } from './title_ratings.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TitleRating } from './entities/title_rating.entity';
import { TitleRatingIndexed } from './entities/title_rating_indexed.entity';

@Controller('titles')
@ApiTags('titles')
export class TitleRatingsController {
  constructor(private readonly titleRatingsService: TitleRatingsService) {}

  @Get('ratings/best')
  @ApiOkResponse({ type: TitleRating, isArray: true })
  getBestMovies() {
    return this.titleRatingsService.getBestMovies();
  }

  @Get('ratingsIndexed/best')
  @ApiOkResponse({ type: TitleRatingIndexed, isArray: true })
  getBestMoviesIndexed() {
    return this.titleRatingsService.getBestMoviesIndexed();
  }
}
