import { Module } from '@nestjs/common';
import { TitlesService } from './titles.service';
import { TitleRatingsService } from './title_ratings.service';
import { TitlesController } from './titles.controller';
import { TitleRatingsController } from './title_ratings.controller';

@Module({
  controllers: [TitlesController, TitleRatingsController],
  providers: [TitlesService, TitleRatingsService]
})
export class TitlesModule {}
