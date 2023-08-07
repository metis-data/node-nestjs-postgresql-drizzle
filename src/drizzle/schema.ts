import { pgSchema, text, numeric, bigint } from "drizzle-orm/pg-core";
 
export const imdbSchema = pgSchema("imdb")

export const titleRatings = imdbSchema.table('title_ratings', {
    tconst: text('tconst').primaryKey(),
    averageRating: numeric('averagerating'),
    numvotes: bigint('numvotes', { mode: 'number' }),
});

export const titleRatingsIndexed = imdbSchema.table('title_ratings_indexed', {
    tconst: text('tconst').primaryKey(),
    averageRating: numeric('averagerating'),
    numvotes: bigint('numvotes', { mode: 'number' }),
});