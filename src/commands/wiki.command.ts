import { Injectable, Logger } from '@nestjs/common';
import * as Cheerio from 'cheerio';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import {
  Autocomplete,
  Context,
  Options,
  SlashCommand,
  StringOption,
} from 'necord';
import { WikiPageAutocomplete } from '../autocomplete/wikipage.autocomplete';
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

  constructor(private readonly wikiService: WikiService) {}

  @SlashCommand('wiki', 'Search for something on the wiki')
  @Autocomplete(WikiPageAutocomplete)
  public async onWikiSearch(
    @Context() [interaction]: [CommandInteraction],
    @Options() userProvidedOptions: WikiSearchCommandOptions,
  ) {
    await interaction.deferReply();

    const embed = new MessageEmbed();
    embed.setTitle(`${userProvidedOptions?.query}`);
    embed.setDescription(
      `Click here to view the wiki search result for ${userProvidedOptions?.query}`,
    );
    embed.setThumbnail('https://oldschool.runescape.wiki/images/Wiki.png');

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
        const description = $('p').first().text();
        if (description.length > 400) {
          embed.setDescription(description.slice(0, 400) + '...');
        } else {
          embed.setDescription(description);
        }
      }
    }
    interaction.followUp({ embeds: [embed] });
  }
}
