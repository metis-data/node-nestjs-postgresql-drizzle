import { Module } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { TitlesModule } from './titles/titles.module'

@Module({
  imports: [DrizzleModule, TitlesModule],
})
export class AppModule {
  constructor() {
    (BigInt.prototype as any).toJSON = function() { return this.toString(); };
  }
}
