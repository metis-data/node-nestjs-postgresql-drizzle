import { Module } from '@nestjs/common';
import { TitlesModule } from './titles/titles.module'

@Module({
  imports: [TitlesModule],
})
export class AppModule {
  constructor() {
    (BigInt.prototype as any).toJSON = function() { return this.toString(); };
  }
}
