import { Injectable, Logger } from '@nestjs/common';
import { Client, ColorResolvable, Interaction, MessageEmbed } from 'discord.js';

@Injectable()
export class EmbedService {
  private readonly logger = new Logger(EmbedService.name);

  constructor(private readonly client: Client) {}
  public createEmbed(options?: { interaction?: Interaction }): MessageEmbed {
    // Default values
    let color: ColorResolvable = '#513535';

    if (options?.interaction) {
      const { interaction } = options;

      if (
        interaction.inGuild() &&
        interaction.guild &&
        'displayColor' in interaction.member &&
        interaction.member.displayHexColor !== '#000000'
      ) {
        color = interaction.member.displayHexColor;
      }
    }

    return new MessageEmbed().setColor(color).setFooter({
      text: `Made with ❤ by Osrs.cloud`,
      iconURL: this.client.user.avatarURL(),
    });
  }
}
