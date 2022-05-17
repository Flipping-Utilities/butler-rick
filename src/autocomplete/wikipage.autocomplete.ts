import { Injectable } from '@nestjs/common';
import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
} from 'discord.js';
import Fuse from 'fuse.js';
import { TransformOptions } from 'necord';
import { WikiPageSlim, WikiService } from '../wiki/wiki.service';

@Injectable()
export class WikiPageAutocomplete implements TransformOptions {
  private fuse: Fuse<WikiPageSlim>;

  public constructor(private wikiService: WikiService) {
    this.init();
  }

  private async init() {
    this.fuse = new Fuse(this.wikiService.getAllPages(), {
      isCaseSensitive: false,
      // Some items share a common prefix
      findAllMatches: true,
      fieldNormWeight: 1,
      threshold: 0.3,
      keys: ['title', 'redirects'],
    });
  }

  public transformOptions(
    interaction: AutocompleteInteraction,
    focused: ApplicationCommandOptionChoiceData,
  ) {
    // Todo: Use a constant for this field name
    if (focused.name !== 'query') {
      return;
    }
    let value = focused.value.toString();

    // Supporting page ID
    if (!Number.isNaN(Number(value))) {
      const candidate = this.wikiService.getPagesRecord()[Number(value)];
      if (candidate) {
        value = candidate.title;
      }
    }

    const choices = this.fuse
      .search(value)
      .slice(0, 25)
      .map((choice) => ({
        name: choice.item.title,
        value: choice.item.title,
      }));

    return choices;
  }
}
