import { Injectable, Logger } from '@nestjs/common';
import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
} from 'discord.js';
import Fuse from 'fuse.js';
import { TransformOptions } from 'necord';

@Injectable()
export abstract class BaseAutocomplete<T> implements TransformOptions {
  private fuse: Fuse<T>;
  protected options: T[];
  protected abstract fuseOptions: Fuse.IFuseOptions<T>;
  protected abstract keys: Fuse.FuseOptionKey<null>[];
  protected abstract autocompleteFieldKey: string;
  protected logger: Logger = new Logger(BaseAutocomplete.name);

  constructor() {
    // Need to use setImmediate as if we call init right away,
    // the `private service: XService` will not be available in the child class.
    setImmediate(() => this.init().then(() => this.initFuse()));
  }

  /*
   * Gets the result's name for the autocomplete display
   */
  protected abstract getResultName(row: T): string;
  /*
   * Gets the result's identifier for the autocomplete value
   */
  protected abstract getResultKey(row: T): string;

  protected async initFuse() {
    this.fuse = new Fuse(this.options, {
      findAllMatches: true,
      fieldNormWeight: 1,
      threshold: 0.3,
      keys: this.keys,
      ...this.fuseOptions,
    });
    this.logger.log('Autocomplete ready! ' + this.constructor.name);
  }

  /**
   * Load the choices and populate the this.options array
   */
  protected abstract init(): Promise<void>;

  public transformOptions(
    interaction: AutocompleteInteraction,
    focused: ApplicationCommandOptionChoiceData,
  ) {
    // Automatically autocomplete all fields with the name `item` with the GE items.
    // Todo: Use a constant for this field name
    if (focused.name !== this.autocompleteFieldKey) {
      return;
    }
    const value = focused.value.toString();

    const choices = this.fuse
      .search(value)
      .slice(0, 25)
      .map((choice) => ({
        name: this.getResultName(choice.item),
        value: this.getResultKey(choice.item),
      }));

    return choices;
  }
}
