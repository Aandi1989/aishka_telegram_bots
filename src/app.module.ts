import { Module } from '@nestjs/common';
import { BotsService } from './bots.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }), 
    ],
    providers: [BotsService],
})
export class AppModule {}
