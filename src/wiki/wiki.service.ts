import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';

export interface WikiPageWithContent {
  pagename: string;
  title: string;
  pageid: number;
  revid: number;
  content: string;
  rawContent: string;
  displaytitle: string;
  redirects?: string[];
  properties: { name: string; value: string }[];
}

export type WikiPageSlim = Pick<
  WikiPageWithContent,
  'pageid' | 'title' | 'redirects'
>;

@Injectable()
export class WikiService {
  private pageIdRecord: Record<number, WikiPageSlim>;
  private pageNameRecord: Record<string, WikiPageSlim>;
  private pages: WikiPageSlim[];
  constructor() {
    const pagesPath = `${process.env.DATASET_PATH}/data/wiki-page-list.json`;
    if (!existsSync(pagesPath)) {
      throw new Error(`Invalid dataset path provided!`);
    }
    const pages: WikiPageSlim[] = JSON.parse(readFileSync(pagesPath, 'utf-8'));
    this.pages = pages;
    this.pageIdRecord = pages.reduce((acc, p) => {
      acc[p.pageid] = p;
      return acc;
    }, {});
    this.pageNameRecord = pages.reduce((acc, p) => {
      acc[p.title] = p;
      return acc;
    }, {});
  }

  public getAllPages(): WikiPageSlim[] {
    return this.pages;
  }
  public getPagesRecord(): Record<number, WikiPageSlim> {
    return this.pageIdRecord;
  }

  public getSlimPageByName(name: string): WikiPageSlim | undefined {
    return this.pageNameRecord[name];
  }

  public getPage(pageid: number): WikiPageWithContent {
    const path = `${process.env.DATASET_PATH}/data/wiki-pages/${pageid}.json`;
    if (!existsSync(path)) {
      throw new Error(`Unknown page provided!`);
    }
    const page: WikiPageWithContent = JSON.parse(readFileSync(path, 'utf-8'));

    return page;
  }
}
