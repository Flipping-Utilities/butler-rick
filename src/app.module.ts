import { Module } from '@nestjs/common';
import { Intents } from 'discord.js';
import { NecordModule } from 'necord';
import { MonsterAutocomplete } from './autocomplete/monster.autocomplete';
import { WikiPageAutocomplete } from './autocomplete/wikipage.autocomplete';
import { DroprateCommand } from './commands/droprate.command';
import { WikiCommand } from './commands/wiki.command';
import { EmbedService } from './discord/embed.service';
import { FormatService } from './discord/format.service';
import { MonsterService } from './wiki/monster.service';
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
  providers: [
    WikiCommand,
    WikiPageAutocomplete,
    WikiService,
    DroprateCommand,
    MonsterService,
    FormatService,
    MonsterAutocomplete,
    EmbedService,
  ],
})
export class AppModule {}
