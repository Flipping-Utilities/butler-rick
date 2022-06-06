import { Injectable } from '@nestjs/common';
import {
  AutocompleteInteraction,
  CacheType,
  ApplicationCommandOptionChoiceData,
} from 'discord.js';
import Fuse from 'fuse.js';
import { Monster } from '../types/monster.type';
import { MonsterService } from '../wiki/monster.service';
import { BaseAutocomplete } from './base.autocomplete';

@Injectable()
export class MonsterAutocomplete extends BaseAutocomplete<Monster> {
  protected fuseOptions: Fuse.IFuseOptions<Monster>;
  protected keys: Fuse.FuseOptionKey<null>[] = ['name', 'aliases', 'drops'];
  protected autocompleteFieldKey = 'monster';

  constructor(private ms: MonsterService) {
    super();
  }

  protected async init(): Promise<void> {
    const monsters = this.ms.getAllMonsters();
    this.options = monsters;
  }

  protected getResultName(row: Monster): string {
    return row.name;
  }
  protected getResultKey(row: Monster): string {
    return row.name;
  }

  public transformOptions(
    interaction: AutocompleteInteraction<CacheType>,
    focused: ApplicationCommandOptionChoiceData,
  ): { name: string; value: string }[] {
    if (focused.name === this.autocompleteFieldKey) {
      return super.transformOptions(interaction, focused);
    }
    if (focused.name !== 'drop' || interaction.commandName !== 'droprate') {
      return;
    }

    const monsterName = interaction.options.getString(
      this.autocompleteFieldKey,
    );
    if (!monsterName) {
      return [
        {
          name: 'Fill in the monster first',
          value: '',
        },
      ];
    }

    const monster = this.ms.getMonsterByName(monsterName);
    if (!monster) {
      return [
        {
          name: 'Unknown monster!',
          value: '',
        },
      ];
    }
    return monster.drops
      .filter((drop) => drop.name.includes(focused.value.toString()))
      .slice(0, 25)
      .map((drop) => ({ name: drop.name, value: drop.name }));
  }
}
