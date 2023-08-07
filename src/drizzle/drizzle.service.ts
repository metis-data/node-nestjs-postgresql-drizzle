
import { Injectable } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';

@Injectable()
export class DrizzleService {
  db: PostgresJsDatabase;

  constructor() {
  }

  async onModuleInit() {
    const connectionString = process.env['DATABASE_URL'];
    const client = postgres(connectionString);
    this.db = drizzle(client);
  }
}
