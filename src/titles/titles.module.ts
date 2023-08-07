import { Module } from '@nestjs/common';
import { TitlesService } from './titles.service';
import { TitleRatingsService } from './title_ratings.service';
import { TitlesController } from './titles.controller';
import { TitleRatingsController } from './title_ratings.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  controllers: [TitlesController, TitleRatingsController],
  providers: [TitlesService, TitleRatingsService],
  imports: [DrizzleModule]
})
export class TitlesModule {}
