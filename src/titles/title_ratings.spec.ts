import * as dotenv from 'dotenv';
dotenv.config();
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import {
  GenericContainer,
  Network,
  StartedTestContainer,
} from "testcontainers";

describe('AppController (e2e)', function() {
  let app: INestApplication;
  let databasecontainer: StartedTestContainer;
  let otelCollectorContainer: StartedTestContainer;
  jest.setTimeout(3600000);

  const endpoints = [
    '/titles/ratings/best',
    '/titles/ratingsIndexed/best',
    '/titles?title=Test',
    '/titlesForAnActor?nconst=nm1588970',
    '/highestRatedMoviesForAnActor?nconst=nm1588970',
    '/highestRatedMovies?numvotes=10000',
    '/highestRatedMovies?numvotes=10000&method=2',
    '/commonMoviesForTwoActors?actor1=nm0302368&actor2=nm0001908',
    '/crewOfGivenMovie?tconst=tt0000439',
    '/mostProlificActorInPeriod?startYear=1900&endYear=1912',
    '/mostProlificActorInGenre?genre=Action',
    '/mostCommonTeammates?nconst=nm0000428',
  ];

  beforeAll(async function() {

    if(process.env.MOCK_CONTAINER_DEPENDENCIES){
      const network = await new Network().start();
      const dbPort = 5432;
      const otelPort = 4318;
      
      databasecontainer = await new GenericContainer("public.ecr.aws/o2c0x5x8/metis-demo-mini-db:latest")
        .withExposedPorts(dbPort)
        .withNetwork(network)
        .withNetworkAliases("database")
        .start();
      
      process.env.DATABASE_URL = process.env.DATABASE_URL.replace('' + dbPort, '' + databasecontainer.getMappedPort(dbPort));

      otelCollectorContainer = await new GenericContainer("public.ecr.aws/o2c0x5x8/metis-otel-collector:latest")
        .withExposedPorts(otelPort)
        .withNetwork(network)
        .withEnvironment({
          METIS_API_KEY: process.env.METIS_API_KEY,
          CONNECTION_STRING: "postgresql://postgres:postgres@database:5432/demo?schema=imdb",
          LOG_LEVEL: "debug"
        })
        .start();

      await new Promise(resolve => setTimeout(resolve, 10000));

      const { startOtelInstrumentation } = require('../tracer');
      startOtelInstrumentation(otelCollectorContainer.getMappedPort(otelPort));
    }
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  endpoints.map(url => it(`${url} (GET)`, async function() {
    await request(app.getHttpServer())
      .get(url)
      .expect(200);
  }));

  afterAll(async function() {
    await new Promise(resolve => setTimeout(resolve, 30000));
    await app.close();
    await otelCollectorContainer?.stop();
    await databasecontainer?.stop();
  });
});
