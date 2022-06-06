import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { Monster } from '../types/monster.type';

@Injectable()
export class MonsterService {
  private allMonsters: Monster[];
  private monsterMap: Map<string, Monster>;

  constructor() {
    const monstersFilePath = `${process.env.DATASET_PATH}/data/monsters/all-monsters.json`;
    if (!existsSync(monstersFilePath)) {
      throw new Error(`Invalid dataset path provided!`);
    }
    const monsters: Monster[] = JSON.parse(
      readFileSync(monstersFilePath, 'utf-8'),
    );
    this.allMonsters = monsters;
    this.monsterMap = new Map();
    monsters.forEach((m) => this.monsterMap.set(m.name, m));
  }

  public getAllMonsters(): Monster[] {
    return this.allMonsters;
  }

  public getMonsterByName(name: string): Monster | undefined {
    return this.monsterMap.get(name);
  }
}
