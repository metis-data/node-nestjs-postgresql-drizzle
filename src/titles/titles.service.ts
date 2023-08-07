import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { nameBasic, titleBasic, titleCrew, titlePrincipal, titleRatings } from '../drizzle/schema';
import { and, desc, eq, gte, inArray, like, ne, or, sql, lte } from "drizzle-orm";
import { alias } from 'drizzle-orm/pg-core';

@Injectable()
export class TitlesService {
  constructor(private drizzle: DrizzleService) {}

  getTitles(title: string) {
    return this.drizzle.db.select()
      .from(titleBasic)
      .where(like(titleBasic.primaryTitle, `%${title}%`));
  }

  titlesForAnActor(nconst: string, method: string) {
    const titlesForAnActorNaive = () => {
      return this.drizzle.db.select()
      .from(titleBasic)
      .innerJoin(titlePrincipal, eq(titleBasic.tconst, titlePrincipal.tconst))
      .where(eq(titlePrincipal.nconst, nconst))
      .orderBy(titleBasic.startYear)
      .limit(10)
      .then(r => r.map(e => e.title_basics));
    }

    const titlesForAnActorManual = () => {
      return this.drizzle.db.execute(sql`CREATE INDEX IF NOT EXISTS title_principals_nconst_idx ON imdb.title_principals(nconst) INCLUDE (tconst)`).then(() => 
        this.drizzle.db.execute(sql`
          SELECT TitleBasic.*
          FROM imdb.title_basics AS TitleBasic
          JOIN imdb.title_principals AS TitlePrincipals ON TitlePrincipals.tconst = TitleBasic.tconst
          WHERE TitlePrincipals.nconst = ${nconst}
          ORDER BY TitleBasic.startyear DESC
          LIMIT 10
        `)
      );
    }

    if (!method) {
      return titlesForAnActorNaive();
    } else if (method == '2') {
      return titlesForAnActorManual();
    }

    return titlesForAnActorNaive();
  }

  highestRatedMoviesForAnActor(nconst: string, method: string) {
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

    const highestRatedMoviesForAnActorWithIndex = () => {
      return this.drizzle.db.execute(sql`CREATE INDEX IF NOT EXISTS title_principals_nconst_idx ON imdb.title_principals(nconst) INCLUDE (tconst)`).then(() => 
        this.drizzle.db.select()
        .from(titleBasic)
        .innerJoin(titleRatings, eq(titleBasic.tconst, titleRatings.tconst))
        .innerJoin(titlePrincipal, eq(titleBasic.tconst, titlePrincipal.tconst))
        .where(eq(titlePrincipal.nconst, nconst))
        .orderBy(desc(titleRatings.averageRating))
        .limit(10)
        .then(r => r.map(e => e.title_basics)
      ));
    }

    if (!method) {
      return highestRatedMoviesForAnActorNaive();
    } else if (method == '2') {
      return highestRatedMoviesForAnActorWithIndex();
    }

    return highestRatedMoviesForAnActorNaive();
  }

  highestRatedMovies(numberOfVotes: number, method: string) {    
    const highestRatedMoviesNaive = () => {
      return this.drizzle.db.select()
      .from(titleBasic)
      .innerJoin(titleRatings, eq(titleBasic.tconst, titleRatings.tconst))
      .where(gte(titleRatings.numvotes, numberOfVotes))
      .orderBy(desc(titleRatings.averageRating))
      .then(r => r.map(e => e.title_basics));
    }
    
    const highestRatedMoviesWithIndex = () => {
      return this.drizzle.db.execute(sql`CREATE INDEX IF NOT EXISTS IDX_title_ratings ON imdb.title_ratings (numvotes)`).then(() => 
        this.drizzle.db.select()
        .from(titleBasic)
        .innerJoin(titleRatings, eq(titleBasic.tconst, titleRatings.tconst))
        .where(gte(titleRatings.numvotes, numberOfVotes))
        .orderBy(desc(titleRatings.averageRating))
        .then(r => r.map(e => e.title_basics))
      );
    }

    if (!method) {
      return highestRatedMoviesNaive();
    } else if (method == '2') {
      return highestRatedMoviesWithIndex();
    }

    return highestRatedMoviesNaive();
  }

  commonMoviesForTwoActors(actor1: string, actor2: string, method: string) {
    const commonMoviesForTwoActorsNaive = () => {
      const titlePrincipals2 = alias(titlePrincipal, 'title_principals2');

      return this.drizzle.db.select()
      .from(titleBasic)
      .innerJoin(titlePrincipal, eq(titleBasic.tconst, titlePrincipal.tconst))
      .innerJoin(titlePrincipals2, eq(titleBasic.tconst, titlePrincipals2.tconst))
      .where(and(eq(titlePrincipal.nconst, actor1), eq(titlePrincipals2.nconst, actor2)))
      .then(r => r.map(e => e.title_basics));
    }

    const commonMoviesForTwoActorsInApp = () => {
      const first = this.drizzle.db.select()
        .from(titlePrincipal)
        .where(eq(titlePrincipal.nconst, actor1))
        .then(titles => titles.map(t => t.tconst));

      const second = this.drizzle.db.select()
        .from(titlePrincipal)
        .where(eq(titlePrincipal.nconst, actor2))
        .then(titles => titles.map(t => t.tconst));

      return first.then(firstTitles => second.then(secondTitles => { 
        return this.drizzle.db.select()
          .from(titleBasic)
          .where(and(inArray(titleBasic.tconst, [...firstTitles]), inArray(titleBasic.tconst, [...secondTitles])))
        }));
    }

    const commonMoviesForTwoActorsInAppOptimized = () => {
      const first = this.drizzle.db.select()
        .from(titlePrincipal)
        .where(eq(titlePrincipal.nconst, actor1))
        .then(titles => titles.map(t => t.tconst));

      const second = this.drizzle.db.select()
        .from(titlePrincipal)
        .where(eq(titlePrincipal.nconst, actor2))
        .then(titles => titles.map(t => t.tconst));

      return first.then(firstTitles => second.then(secondTitles => {
        let secondSet = new Set([...secondTitles]);
        let intersection = new Set([...firstTitles].filter(i => secondSet.has(i)));
        return this.drizzle.db.select()
        .from(titleBasic)
        .where(inArray(titleBasic.tconst, [...intersection]))
      }));
    }
    
    const commonMoviesForTwoActorsManual = () => {
      return this.drizzle.db.execute(sql`CREATE INDEX IF NOT EXISTS title_principals_nconst_idx ON imdb.title_principals(nconst) INCLUDE (tconst)`).then(() => 
      this.drizzle.db.execute(sql`
          SELECT TB.*
          FROM imdb.title_basics AS TB
          JOIN imdb.title_principals AS TP1 ON TP1.tconst = TB.tconst
          JOIN imdb.title_principals AS TP2 ON TP2.tconst = TB.tconst
          WHERE TP1.nconst = ${actor1} AND TP2.nconst = ${actor2}
        `)
      );
    }
    
    if (!method) {
      return commonMoviesForTwoActorsNaive();
    } else if (method == '2') {
      return commonMoviesForTwoActorsInApp();
    } else if (method == '3') {
      return commonMoviesForTwoActorsInAppOptimized();
    } else if (method == '4') {
      return commonMoviesForTwoActorsManual();
    }

    return commonMoviesForTwoActorsNaive();
  }

  crewOfGivenMovie(tconst: string, method: string) {
    const crewOfGivenMovieManualSlow = () => {
        return this.drizzle.db.execute(sql`
          SELECT DISTINCT NB.*
          FROM imdb.title_basics AS TB
          LEFT JOIN imdb.title_principals AS TP ON TP.tconst = TB.tconst
          LEFT JOIN imdb.title_crew AS TC ON TC.tconst = TB.tconst
          LEFT JOIN imdb.name_basics AS NB ON 
                  NB.nconst = TP.nconst 
                  OR TC.directors = NB.nconst
                  OR TC.directors LIKE NB.nconst || ',%'::text
                  OR TC.directors LIKE '%,'::text || NB.nconst || ',%'::text
                  OR TC.directors LIKE '%,'::text || NB.nconst
                  OR TC.writers = NB.nconst
                  OR TC.writers LIKE NB.nconst || ',%'::text
                  OR TC.writers LIKE '%,'::text || NB.nconst || ',%'::text
                  OR TC.writers LIKE '%,'::text || NB.nconst
          WHERE TB.tconst = ${tconst}
        `);
    }

    const crewOfGivenMovieWithUnions = () => {
      return this.drizzle.db.execute(sql`
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = ${tconst}
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON NB.nconst = TP.nconst
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = ${tconst}
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.directors LIKE NB.nconst || ',%'::text
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = ${tconst}
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.directors LIKE '%,'::text || NB.nconst || ',%'::text
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = ${tconst}
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.directors LIKE '%,'::text || NB.nconst
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = ${tconst}
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.writers = NB.nconst
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = ${tconst}
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.writers LIKE NB.nconst || ',%'::text
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = ${tconst}
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.writers LIKE '%,'::text || NB.nconst || ',%'::text
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = ${tconst}
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.writers LIKE '%,'::text || NB.nconst
      `);
    }

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

    const crewOfGivenMovieManualFast = () => {
      return this.drizzle.db.execute(sql`
        WITH RECURSIVE numbers AS (
          SELECT 1 AS number
          UNION ALL
          SELECT number + 1 AS number FROM numbers WHERE number < 1500
        ),
        split_associations AS (
            SELECT SPLIT_PART(TC.directors, ',', N.number) AS nconst
            FROM imdb.title_crew AS TC
            CROSS JOIN numbers AS N
            WHERE tconst = ${tconst} AND directors IS NOT NULL AND CHAR_LENGTH(directors) - CHAR_LENGTH(REPLACE(directors, ',', '')) + 1 >= N.number
          UNION
            SELECT SPLIT_PART(TC.writers, ',', N.number) AS nconst
            FROM imdb.title_crew AS TC
            CROSS JOIN numbers AS N
            WHERE tconst = ${tconst} AND writers IS NOT NULL AND CHAR_LENGTH(writers) - CHAR_LENGTH(REPLACE(writers, ',', '')) + 1 >= N.number
        ),
        all_associations AS (
          SELECT SA.nconst
          FROM split_associations AS SA
          UNION
          SELECT TP.nconst
          FROM imdb.title_principals AS TP
          WHERE TP.tconst = ${tconst}
        )
        SELECT NB.*
        FROM imdb.name_basics AS NB
        JOIN all_associations AS AA ON AA.nconst = NB.nconst
        `);
    }

    if (!method) {
      return crewOfGivenMovieManualSlow();
    } else if (method == '2') {
      return crewOfGivenMovieWithUnions();
    } else if (method == '3') {
      return crewOfGivenMovieInAppCode();
    } else if (method == '4') {
      return crewOfGivenMovieManualFast();
    }
  }

  mostProlificActorInPeriod(startYear: number, endYear: number, method: string) {
    const mostProlificActorInPeriodInApp = () => {
      const titlesMatchingPeriod = this.drizzle.db.select()
        .from(titleBasic)
        .where(and(gte(titleBasic.startYear, "" + startYear), lte(titleBasic.startYear, "" + endYear)))
        .then(titles => titles.map(t => t.tconst));

      const principals = titlesMatchingPeriod.then(titles => this.drizzle.db.select()
        .from(titlePrincipal)
        .where(inArray(titlePrincipal.tconst, [...new Set(titles)])))
        .then(principals => {
          const counts = principals
            .reduce(
              (entryMap, e) => {
                entryMap[e.nconst] = (entryMap[e.nconst] || 0) + 1;
                return entryMap;
              },
              {}
            );
          const keys = Object.keys(counts);
          const countsWithKeys = keys.map(k => [counts[k], k]);
          countsWithKeys.sort((pair1, pair2) => pair2[0] - pair1[0]);
          const topResults = countsWithKeys.splice(0,1);
          return topResults;
        });

      return principals.then(countsWithKeys => this.drizzle.db.select()
        .from(nameBasic)
        .where(inArray(nameBasic.nconst, countsWithKeys.map(c => "" + c[1]))));
    }

    const mostProlificActorInPeriodManual = () => {
      return this.drizzle.db.execute(sql`
      SELECT NB.nconst, MAX(NB.primaryname) AS primaryname, MAX(nb.birthyear) AS birthyear, MAX(NB.deathyear) AS deathyear, MAX(nb.primaryprofession) AS primaryprofession, COUNT(*) AS number_of_titles
        FROM imdb.title_basics AS TB
        RIGHT JOIN imdb.title_principals AS TP ON TP.tconst = TB.tconst
        RIGHT JOIN imdb.name_basics AS NB ON NB.nconst = TP.nconst
        WHERE TB.startyear >= ${startYear} AND TB.startyear <= ${endYear}
        GROUP BY NB.nconst
        ORDER BY number_of_titles DESC
        LIMIT 1
      `);
    }

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

    if (!method) {
      return mostProlificActorInPeriodInApp();
    } else if (method == '2') {
      return mostProlificActorInPeriodManual();
    } else if (method == '3') {
      return mostProlificActorInPeriodManualOptimized();
    }
  }

  mostProlificActorInGenre(genre: string, method: string) {
    const mostProlificActorInGenreInApp = () => {
      const titlesMatchingGenre = this.drizzle.db.select()
        .from(titleBasic)
        .where(like(titleBasic.genres, '%' + genre + '%'))
        .then(titles => titles
          .filter(t => t.genres.split(',').indexOf(genre) >= 0)
          .map(t => t.tconst)
        );

      const principals = titlesMatchingGenre.then(titles => this.drizzle.db.select()
        .from(titlePrincipal)
        .where(inArray(titlePrincipal.tconst, [...new Set(titles)]))
        .then(principals => {
          const counts = principals
            .reduce(
              (entryMap, e) => {
                entryMap[e.nconst] = (entryMap[e.nconst] || 0) + 1;
                return entryMap;
              },
              {}
            );
          const keys = Object.keys(counts);
          const countsWithKeys = keys.map(k => [counts[k], k]);
          countsWithKeys.sort((pair1, pair2) => pair2[0] - pair1[0]);
          const topResults = countsWithKeys.splice(0,10);
          return topResults;
        })
      );

      return principals.then(countsWithKeys => this.drizzle.db.select()
        .from(nameBasic)
        .where(inArray(nameBasic.nconst, countsWithKeys.map(c => "" + c[1]))));
    }

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

    const mostProlificActorInGenreManualOptimized = () => {
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

    if (!method) {
      return mostProlificActorInGenreInApp();
    } else if (method == '2'){
      return mostProlificActorInGenreManual();
    } else if (method == '3') {
      return mostProlificActorInGenreManualOptimized();
    }
  }

  mostCommonTeammates(nconst: string, method: string) {
    const mostCommonTeammatesManual = () => {
      return this.drizzle.db.execute(sql`
        WITH RECURSIVE numbers AS (
          SELECT 1 AS number
          UNION ALL
          SELECT number + 1 AS number FROM numbers WHERE number < 1500
        ),
        titles_for_person AS (
            SELECT TC.tconst
            FROM imdb.title_crew AS TC
            WHERE directors = ${nconst} OR directors LIKE ${nconst} || ',%' OR directors LIKE '%,' || ${nconst} || ',%' OR directors LIKE '%,' || ${nconst}
          UNION
            SELECT TC.tconst
            FROM imdb.title_crew AS TC
            WHERE writers = ${nconst} OR writers LIKE ${nconst} || ',%' OR writers LIKE '%,' || ${nconst} || ',%' OR writers LIKE '%,' || ${nconst}
          UNION
            SELECT tconst
            FROM imdb.title_principals
            WHERE nconst = ${nconst}
        ),
        titles_corresponding AS (
          SELECT TC.tconst, TC.directors, TC.writers
          FROM imdb.title_crew AS TC
          JOIN titles_for_person AS TFP ON TFP.tconst = TC.tconst
        ),
        split_associations AS (
            SELECT TC.tconst, SPLIT_PART(TC.directors, ',', N.number) AS nconst
            FROM titles_corresponding AS TC
            CROSS JOIN numbers AS N
            WHERE directors IS NOT NULL AND CHAR_LENGTH(directors) - CHAR_LENGTH(REPLACE(directors, ',', '')) + 1 >= N.number
          UNION
            SELECT TC.tconst, SPLIT_PART(TC.writers, ',', N.number) AS nconst
            FROM titles_corresponding AS TC
            CROSS JOIN numbers AS N
            WHERE writers IS NOT NULL AND CHAR_LENGTH(writers) - CHAR_LENGTH(REPLACE(writers, ',', '')) + 1 >= N.number
        ),
        all_associations AS (
            SELECT SA.tconst, SA.nconst
            FROM split_associations AS SA
          UNION
            SELECT TP.tconst, TP.nconst
            FROM imdb.title_principals AS TP
            JOIN titles_for_person AS TFP ON TFP.tconst = TP.tconst
        ),
        other_people AS (
          SELECT nconst
          FROM all_associations
          WHERE nconst != ${nconst}
        ),
        top_peers AS (
          SELECT OP.nconst, COUNT(*) as common_titles
          FROM other_people AS OP
          GROUP BY nconst
          ORDER BY common_titles DESC
          LIMIT 5
        )
        SELECT TP.nconst, TP.common_titles, NB.*
        FROM top_peers AS TP
        JOIN imdb.name_basics AS NB ON NB.nconst = TP.nconst
        ORDER BY TP.common_titles DESC
      `);
    }

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

    if (!method) {
      return mostCommonTeammatesManual();
    } else if (method == '2') {
      return mostCommonTeammatesInApp();
    }
  }
}
