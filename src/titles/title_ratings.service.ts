import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { titleRatings, titleRatingsIndexed } from '../drizzle/schema';
import { eq } from "drizzle-orm";

@Injectable()
export class TitleRatingsService {
  constructor(private drizzle: DrizzleService) {}

  getBestMovies() {
    return this.drizzle.db.select()
      .from(titleRatings)
      .where(eq(titleRatings.averageRating, "10.0"));
  }

  getBestMoviesIndexed() {
    return [];
  }
}
