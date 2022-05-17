import { Module } from '@nestjs/common';
import { Intents } from 'discord.js';
import { NecordModule } from 'necord';
import { WikiPageAutocomplete } from './autocomplete/wikipage.autocomplete';
import { WikiCommand } from './commands/wiki.command';
import { EmbedService } from './discord/embed.service';
import { WikiService } from './wiki/wiki.service';

@Module({
  imports: [
    NecordModule.forRoot({
      token: process.env.DISCORD_TOKEN,
      intents: [Intents.FLAGS.GUILDS],
      development: [process.env.DISCORD_DEVELOPMENT_GUILD_ID],
    }),
  ],
  controllers: [],
  providers: [WikiCommand, WikiPageAutocomplete, WikiService, EmbedService],
})
export class AppModule {}
