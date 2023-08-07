import { Injectable } from '@nestjs/common';
import { titleRatings, titleRatingsIndexed } from '../drizzle/schema';
import { eq } from "drizzle-orm";
import { DrizzleService } from '../drizzle/drizzle.service';

@Injectable()
export class TitleRatingsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  getBestMovies() {
    return this.drizzleService.db.select()
      .from(titleRatings)
      .where(eq(titleRatings.averageRating, "10.0"));
  }

  getBestMoviesIndexed() {
    return this.drizzleService.db.select()
      .from(titleRatingsIndexed)
      .where(eq(titleRatingsIndexed.averageRating, "10.0"));
  }
}
