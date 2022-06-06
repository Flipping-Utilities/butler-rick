import { Injectable } from '@nestjs/common';

@Injectable()
export class FormatService {
  /**
   * Will convert the message to an inline code block
   * The message must not contain newlines
   * Backticks within the message will be converted to single quotes to avoid breaking the code block
   * @param message The message to surround
   * @returns The surrounded message
   */
  public inlineCode(message: string): string {
    return '`' + message.replace(/`/g, "'") + '`';
  }

  public bold(message: string): string {
    return '**' + message.replace(/\*/g, '') + '**';
  }

  public italic(message: string): string {
    return '_' + message.replace(/\_/g, '') + '_';
  }

  public link(message: string, url: string): string {
    return `[${message.replace(/\]/g, '\\]')}](${encodeURI(url)})`;
  }
}
