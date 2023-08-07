import { Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import { DefaultLogger, LogWriter } from 'drizzle-orm/logger';
import { sql } from 'drizzle-orm'
import { SpanKind, trace, Tracer } from '@opentelemetry/api';
import { startOtelInstrumentation } from '../tracer';

import {
  PostgresJsDatabase,
  drizzle,
} from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';

function isThisNoopProvider(tracer: Tracer){
  return (tracer as any)._provider !== undefined;
}

function getTracer(): Tracer {
  return trace.getTracer('metis-instrumentation');
}

class SpanLogger implements LogWriter {
  shouldCreateRestSpan: boolean;

  constructor() {
    if(isThisNoopProvider(getTracer())) {
      startOtelInstrumentation(4318);
      this.shouldCreateRestSpan = true;
    }
  }

  write(message: string) {
    let finalStatement = message.substring("Query:".length);

    if(finalStatement.includes("params:")) {
      let parameters = JSON.parse(finalStatement.split("params:").reverse()[0]);

      let parts = finalStatement.split("$").map((p, i) => {
        if(i == 0) return p;
        
        let parameterIdText = p.split(/[^0-9]/)[0];
        let parameterId = parseInt(parameterIdText);
        let parameterValue = parameters[parameterId-1];
        let restOfPart = p.substring(parameterIdText.length);
        return ((typeof parameterValue === 'string') ? "'" + parameterValue + "'" : parameterValue) + restOfPart;
      });
    
      finalStatement = parts.join("");
    }

    console.log("Running: " + finalStatement);
  
    let tracer = getTracer();

    if(this.shouldCreateRestSpan){
      let span = tracer.startSpan('http-call', {
        kind: SpanKind.SERVER
      });
      span.setAttribute('http.target', '/drizzle-call');  
      span.setAttribute('http.status_code', 200);
      span.setAttribute('http.method', 'GET');

      let traceId = span.spanContext().traceId;
      span.end();
  
      span = tracer.startSpan('query', {
        kind: SpanKind.CLIENT
      });
      span.setAttribute('db.statement', finalStatement);
      span.spanContext().traceId = traceId;
      span.end();
    } else {
      let span = tracer.startSpan('query', {
        kind: SpanKind.CLIENT
      });
      span.setAttribute('db.statement', finalStatement);
      span.spanContext().traceId = span.spanContext().traceId;
      span.end();
    }
  }
}

@Injectable()
export class DrizzleService {
  db: PostgresJsDatabase;

  constructor() {
  }

  async onModuleInit() {
    const connectionString = process.env['DATABASE_URL'];
    const client = postgres(connectionString);
    const logger = new DefaultLogger({ writer: new SpanLogger() });
    this.db = drizzle(client, { logger });
    await this.migrate();
  }

  async migrate(){
    let files = await fsPromises.readdir('src/drizzle/migrations');
    for(let id in files) {
      if(files[id].endsWith(".sql")){
        let data = await fsPromises.readFile('src/drizzle/migrations/' + files[id], 'utf8');
        let allQueries = data.split(";").filter(q => q && q !== "" && q.length > 0);
        for(let queryId = 0; queryId < allQueries.length;++queryId){
            let query = allQueries[queryId];
            console.log("Running " + query);

            console.log(await this.db.execute(sql.raw(`${query}`)));
        };
      }
    }

    console.log("Done migrating");
  }
}
