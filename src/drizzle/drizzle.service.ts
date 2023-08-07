
import { Injectable } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import { promises as fsPromises } from 'fs';
import { sql } from 'drizzle-orm' 

@Injectable()
export class DrizzleService {
  db: PostgresJsDatabase;

  constructor() {
  }

  async onModuleInit() {
    const connectionString = process.env['DATABASE_URL'];
    const client = postgres(connectionString);
    this.db = drizzle(client);

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
