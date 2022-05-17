import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { WikiPageAutocomplete } from './autocomplete/wikipage.autocomplete';
import { WikiCommand } from './commands/wiki.command';
import { WikiService } from './wiki/wiki.service';

@Module({
  imports: [
    NecordModule.forRoot({
      token: process.env.DISCORD_TOKEN,
      intents: [],
      development: [process.env.DISCORD_DEVELOPMENT_GUILD_ID],
    }),
  ],
  controllers: [],
  providers: [WikiCommand, WikiPageAutocomplete, WikiService],
})
export class AppModule {}
