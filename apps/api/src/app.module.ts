import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { IdentityModule } from './modules/identity/identity.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { MediaModule } from './modules/media/media.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { LearningModule } from './modules/learning/learning.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '../../.env'),
      ],
    }),
    DatabaseModule,
    IdentityModule,
    CatalogModule,
    MediaModule,
    CommerceModule,
    LearningModule,
  ],
})
export class AppModule {}
