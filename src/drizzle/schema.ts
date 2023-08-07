import { pgSchema, text, numeric, bigint, boolean } from "drizzle-orm/pg-core";

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

export const titleBasic = imdbSchema.table('title_basics', {
    tconst: text('tconst').primaryKey(),
    titleType: text("titletype"),
    primaryTitle: text("primarytitle"),
    originalTitle: text("originaltitle"),
    isAdult: boolean("isadult"),
    startYear: numeric("startyear"),
    endYear: numeric("endyear"),
    runtimeMinutes: numeric("runtimeminutes"),
    genres: text("genres")
});

export const titleCrew = imdbSchema.table('title_crew', {
    tconst: text('tconst').primaryKey(),
    directors: text("directors"),
    writers: text("writers")
});

export const titlePrincipal = imdbSchema.table('title_principals', {
    tconst: text('tconst').primaryKey(),
    ordering: numeric("ordering").primaryKey(),
    nconst: text("nconst"),
    category: text("category"),
    job: text("job"),
    characters: text("characters")
});

export const nameBasic = imdbSchema.table('name_basics', {
    nconst: text('nconst').primaryKey(),
    primaryname: text("primaryname"),
    birthyear: numeric("birthyear"),
    deathyear: numeric("deathyear"),
    primaryprofession: text("primaryprofession"),
    knownfortitles: text("knownfortitles")
});
