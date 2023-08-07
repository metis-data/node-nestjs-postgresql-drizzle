import * as dotenv from 'dotenv';
dotenv.config();
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { startMetisInstrumentation, shudownhook } from '../tracer';

describe('AppController (e2e)', function() {
  let app: INestApplication;
  jest.setTimeout(3600000);

  const endpoints = [
    '/titles/ratings/best',
    '/titles/ratingsIndexed/best',
    '/titles?title=Test',
    '/titlesForAnActor?nconst=nm1588970',
    '/highestRatedMoviesForAnActor?nconst=nm1588970',
    '/highestRatedMovies?numvotes=10000',
    '/commonMoviesForTwoActors?actor1=nm0302368&actor2=nm0001908',
    '/crewOfGivenMovie?tconst=tt0000439',
    '/mostProlificActorInPeriod?startYear=1900&endYear=1912',
    '/mostProlificActorInGenre?genre=Action',
    '/mostCommonTeammates?nconst=nm0000428',
  ];

  beforeAll(async function() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    startMetisInstrumentation();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  endpoints.map(url => it(`${url} (GET)`, async function() {
    await request(app.getHttpServer())
      .get(url)
      .expect(200);
  }));

  afterAll(async function() {
    await app.close();
    await shudownhook();
  });
});
