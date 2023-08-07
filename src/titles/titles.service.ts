import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { nameBasic, titleBasic, titleCrew, titlePrincipal, titleRatings } from '../drizzle/schema';
import { and, desc, eq, gte, inArray, like, lte, ne, or, sql } from "drizzle-orm";
import { alias } from 'drizzle-orm/pg-core';

@Injectable()
export class TitlesService {
  constructor(private drizzle: DrizzleService) {}

  getTitles(title: string) {
    return this.drizzle.db.select()
      .from(titleBasic)
      .where(like(titleBasic.primaryTitle, `%${title}%`));
  }

  titlesForAnActor(nconst: string) {
    const titlesForAnActorNaive = () => {
      return this.drizzle.db.select()
      .from(titleBasic)
      .innerJoin(titlePrincipal, eq(titleBasic.tconst, titlePrincipal.tconst))
      .where(eq(titlePrincipal.nconst, nconst))
      .orderBy(titleBasic.startYear)
      .limit(10)
      .then(r => r.map(e => e.title_basics));
    }

    return titlesForAnActorNaive();
  }

  highestRatedMoviesForAnActor(nconst: string) {
    const highestRatedMoviesForAnActorNaive = () => {
      return this.drizzle.db.select()
      .from(titleBasic)
      .innerJoin(titleRatings, eq(titleBasic.tconst, titleRatings.tconst))
      .innerJoin(titlePrincipal, eq(titleBasic.tconst, titlePrincipal.tconst))
      .where(eq(titlePrincipal.nconst, nconst))
      .orderBy(desc(titleRatings.averageRating))
      .limit(10)
      .then(r => r.map(e => e.title_basics));
    }

    return highestRatedMoviesForAnActorNaive();
  }

  highestRatedMovies(numberOfVotes: number) {    
    const highestRatedMoviesNaive = () => {
      return this.drizzle.db.select()
      .from(titleBasic)
      .innerJoin(titleRatings, eq(titleBasic.tconst, titleRatings.tconst))
      .where(gte(titleRatings.numvotes, numberOfVotes))
      .orderBy(desc(titleRatings.averageRating))
      .then(r => r.map(e => e.title_basics));
    }

    return highestRatedMoviesNaive();
  }

  commonMoviesForTwoActors(actor1: string, actor2: string) {
    const commonMoviesForTwoActorsNaive = () => {
      const titlePrincipals2 = alias(titlePrincipal, 'title_principals2');

      return this.drizzle.db.select()
      .from(titleBasic)
      .innerJoin(titlePrincipal, eq(titleBasic.tconst, titlePrincipal.tconst))
      .innerJoin(titlePrincipals2, eq(titleBasic.tconst, titlePrincipals2.tconst))
      .where(and(eq(titlePrincipal.nconst, actor1), eq(titlePrincipals2.nconst, actor2)))
      .then(r => r.map(e => e.title_basics));
    }

    return commonMoviesForTwoActorsNaive();
  }

  crewOfGivenMovie(tconst: string) {
    const crewOfGivenMovieInAppCode = () => {
      const crewViaTitlePrincipals = this.drizzle.db.select()
      .from(titlePrincipal)
      .where(eq(titlePrincipal.tconst, tconst))
      .then(crew => crew.map(c => c.nconst));

      const crewViaTitleCrew = this.drizzle.db.select()
      .from(titleCrew)
      .where(eq(titleCrew.tconst, tconst));

      const crewMatchingNames = crewViaTitleCrew.then(crew => crew.flatMap(c => [
          c.directors.split(','),
          c.writers.split(',')
        ].flat()));

      const allMatchingNames = crewViaTitlePrincipals.then(crew1 => crewMatchingNames.then(crew2 => new Set([crew1, crew2].flat())));

      return allMatchingNames.then(names => this.drizzle.db.select()
      .from(nameBasic)
      .where(inArray(nameBasic.nconst, [...names])));
    }

    return crewOfGivenMovieInAppCode();
  }

  mostProlificActorInPeriod(startYear: number, endYear: number) {
    const mostProlificActorInPeriodManualOptimized = () => {
      return this.drizzle.db.execute(sql`
        WITH best_actor AS (
          SELECT TP.nconst, COUNT(*) AS number_of_titles
          FROM imdb.title_basics AS TB
          LEFT JOIN imdb.title_principals AS TP ON TP.tconst = TB.tconst
          WHERE TB.startyear >= ${startYear} AND TB.startyear <= ${endYear} AND TP.nconst IS NOT NULL
          GROUP BY TP.nconst
          ORDER BY number_of_titles DESC
          LIMIT 1
        )
        SELECT BA.nconst, BA.number_of_titles, NB.primaryname, nb.birthyear, NB.deathyear, nb.primaryprofession
        FROM best_actor AS BA
        JOIN imdb.name_basics AS NB ON NB.nconst = BA.nconst
      `);
    }

    return mostProlificActorInPeriodManualOptimized();
  }

  mostProlificActorInGenre(genre: string) {
    const mostProlificActorInGenreManual = () => {
      return this.drizzle.db.execute(sql`
        WITH best_actors AS (
          SELECT TP.nconst, COUNT(*) AS movies_count
          FROM imdb.title_basics AS TB
          LEFT JOIN imdb.title_principals AS TP ON TP.tconst = TB.tconst
          WHERE TB.genres = ${genre} OR TB.genres LIKE (${genre} || ',%') OR TB.genres LIKE ('%,' || ${genre} || ',%') OR TB.genres LIKE ('%,' || ${genre})
          GROUP BY TP.nconst
          ORDER BY movies_count DESC
          LIMIT 10
        )
        SELECT BA.nconst, NB.primaryname, NB.birthyear, BA.movies_count
        FROM best_actors AS BA
        JOIN imdb.name_basics AS NB ON NB.nconst = BA.nconst
        ORDER BY movies_count DESC
      `);
    }

    return mostProlificActorInGenreManual();
  }

  mostCommonTeammates(nconst: string) {
    const mostCommonTeammatesInApp = () => {
      const titlesPrincipalMatchingPerson = this.drizzle.db.select()
      .from(titlePrincipal)
      .where(eq(titlePrincipal.nconst, nconst))
      .then(titles => titles.map(t => t.tconst));

      const otherTitlePrincipals = titlesPrincipalMatchingPerson.then(titles => this.drizzle.db.select()
      .from(titlePrincipal)
      .where(and(
          ne(titlePrincipal.nconst, nconst),
          inArray(titlePrincipal.tconst, titles))
      ))
      .then(titles => titles.map(t => t.nconst));

      const titleCrewMatchingPerson = this.drizzle.db.select()
      .from(titleCrew)
      .where(or(
          like(titleCrew.directors, `%${nconst}%`),
          like(titleCrew.writers, `%${nconst}%`))
      )
      .then(titles => {
          return titles
            .filter(t => (t.directors || "").split(",").indexOf(nconst) >= 0 || (t.writers || "").split(",").indexOf(nconst) >= 0)
            .map(t => [...new Set([(t.directors || "").split(","), (t.writers || "").split(",")].flat())].filter(n => n != nconst && n != "" && n))
        });

      const allTeammates = Promise.all([otherTitlePrincipals, titleCrewMatchingPerson]).then(nconsts => {
        return nconsts.flat().filter(n => n && n != "");
      });

      const topTeammates = allTeammates.then(nconsts => {
        const counts = nconsts
          .reduce(
            (entryMap, e: any) => {
              entryMap[e] = (entryMap[e] || 0) + 1;
              return entryMap;
            },
            {}
          );
        const keys = Object.keys(counts);
        const countsWithKeys = keys.map(k => [counts[k], k]);
        countsWithKeys.sort((pair1, pair2) => pair2[0] - pair1[0]);
        const topResults = countsWithKeys.splice(0,5);
        return topResults;
      });

      return topTeammates.then(countsWithKeys => this.drizzle.db.select()
      .from(nameBasic)
      .where(inArray(nameBasic.nconst, countsWithKeys.map(c => "" + c[1]))));
    };

    return mostCommonTeammatesInApp();
  }
}
