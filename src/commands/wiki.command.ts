import { Injectable, Logger } from '@nestjs/common';
import * as Cheerio from 'cheerio';
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton
} from 'discord.js';
import {
  Autocomplete,
  Context,
  Options,
  SlashCommand,
  StringOption
} from 'necord';
import { WikiPageAutocomplete } from '../autocomplete/wikipage.autocomplete';
import { EmbedService } from '../discord/embed.service';
import { WikiService } from '../wiki/wiki.service';

class WikiSearchCommandOptions {
  @StringOption({
    name: 'query',
    description: 'Your search query',
    autocomplete: true,
  })
  query: string;
}

@Injectable()
export class WikiCommand {
  logger = new Logger(WikiCommand.name);

  constructor(
    private readonly wikiService: WikiService,
    private readonly embedService: EmbedService,
  ) {}

  @SlashCommand('wiki', 'Search for something on the wiki')
  @Autocomplete(WikiPageAutocomplete)
  public async onWikiSearch(
    @Context() [interaction]: [CommandInteraction],
    @Options() userProvidedOptions: WikiSearchCommandOptions,
  ) {
    await interaction.deferReply();

    const embed = this.embedService.createEmbed({ interaction });
    embed.setTitle(`${userProvidedOptions?.query}`);
    embed.setDescription(
      `Click here to view the wiki search result for \`${userProvidedOptions?.query.replace(
        /\`/g,
        '',
      )}\``,
    );
    embed.setThumbnail('https://oldschool.runescape.wiki/images/Wiki.png');
    embed.setURL(
      `https://oldschool.runescape.wiki/?search=${encodeURIComponent(
        userProvidedOptions.query,
      )}`,
    );

    const candidatePage = this.wikiService.getSlimPageByName(
      userProvidedOptions.query,
    );
    if (candidatePage) {
      embed.setURL(
        `https://oldschool.runescape.wiki/w/${encodeURIComponent(
          candidatePage.title,
        )}`,
      );
      embed.setTitle(candidatePage.title);
      const page = this.wikiService.getPage(candidatePage.pageid);
      if (page) {
        const { rawContent } = page;
        const candidateImages = Array.from(rawContent.matchAll(/:(.*).png/g));
        const detailImage = candidateImages.find((i) =>
          i[1].includes('detail'),
        );

        const image = detailImage || candidateImages[0];
        if (image) {
          const transformed = image[1].replace(/ /g, '_');
          const imageUrl = `https://oldschool.runescape.wiki/images/${encodeURIComponent(
            transformed,
          )}.png?5a834`;
          embed.setImage(imageUrl);
        }

        const content = page.content;
        const $ = Cheerio.load(content);
        const description = $('p').text();
        if (description.length > 400) {
          embed.setDescription(description.slice(0, 400) + '...');
        } else {
          embed.setDescription(description);
        }
      }
    }
    const button = new MessageButton()
      .setLabel('View on the Wiki')
      .setStyle(5)
      .setURL(embed.url);
    const row = new MessageActionRow();
    row.addComponents(button);
    interaction.followUp({ embeds: [embed], components: [row] });
  }
}
