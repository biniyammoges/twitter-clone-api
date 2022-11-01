import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { install } from 'typeorm-fixture-builder';

@Injectable()
export class TypeormFixture {
  constructor(@InjectEntityManager() private em: EntityManager) {}

  async installFixtures(fixtures: unknown[]) {
    try {
      await install(this.em.connection, fixtures);
    } catch (err) {
      throw err;
    }
  }
}
