import { Injectable, Logger } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import {
  Autocomplete,
  Context,
  Options,
  SlashCommand,
  StringOption,
} from 'necord';
import { MonsterAutocomplete } from 'src/autocomplete/monster.autocomplete';
import { FormatService } from 'src/discord/format.service';
import { EmbedService } from '../discord/embed.service';
import { MonsterService } from '../wiki/monster.service';

class DroprateCommandOptions {
  @StringOption({
    name: 'monster',
    description: "The monster you're looking for",
    autocomplete: true,
  })
  monster: string;
  @StringOption({
    name: 'drop',
    description: "The drop you're looking for",
    autocomplete: true,
  })
  drop: string;
}

@Injectable()
export class DroprateCommand {
  logger = new Logger(DroprateCommand.name);

  constructor(
    private readonly monsterService: MonsterService,
    private readonly embedService: EmbedService,
    private readonly format: FormatService,
  ) {}

  @SlashCommand('droprate', 'Get the droprate of an item')
  @Autocomplete(MonsterAutocomplete)
  public async onWikiSearch(
    @Context() [interaction]: [CommandInteraction],
    @Options() userProvidedOptions: DroprateCommandOptions,
  ) {
    await interaction.deferReply();

    const monster = this.monsterService.getMonsterByName(
      userProvidedOptions.monster,
    );
    if (!monster) {
      return interaction.followUp({ content: 'Invalid monster!' });
    }
    const drop = monster.drops.find((d) => d.name === userProvidedOptions.drop);
    if (!monster) {
      return interaction.followUp({ content: 'Invalid drop!' });
    }

    const embed = this.embedService.createEmbed({ interaction });
    embed
      .setTitle(`${drop.name} droprate from ${monster.name}`)
      .setDescription(monster.examine)
      .setURL(
        `https://oldschool.runescape.wiki/w/${encodeURIComponent(
          monster.name,
        )}#Drops`,
      )
      .addField(
        drop.name,
        `${this.format.inlineCode(
          drop.rarity,
        )} chances of dropping ${this.format.inlineCode(
          drop.quantity,
        )} ${this.format.link(
          this.format.bold(drop.name),
          `https://oldschool.runescape.wiki/w/${encodeURIComponent(drop.name)}`,
        )}`,
      );

    await interaction.followUp({
      embeds: [embed],
    });
  }
}
