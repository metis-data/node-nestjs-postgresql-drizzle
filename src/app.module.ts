import { Module } from '@nestjs/common';
import { TitleRatingsController } from './titles/title_ratings.controller';
import { TitleRatingsService } from './titles/title_ratings.service';
import { DrizzleModule } from './drizzle/drizzle.module';
import { TitlesController } from './titles/titles.controller';
import { TitlesService } from './titles/titles.service';

@Module({
  controllers: [TitleRatingsController, TitlesController],
  providers: [TitleRatingsService, TitlesService],
  imports: [DrizzleModule],
})
export class AppModule {
  constructor() {
    (BigInt.prototype as any).toJSON = function() { return this.toString(); };
  }
}
