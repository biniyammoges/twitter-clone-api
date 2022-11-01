import { INestApplication } from '@nestjs/common';
import request, { SuperAgentTest } from 'supertest';
import { EntityManager } from 'typeorm';
import { fixtures } from './fixtures';
import { TypeormFixture } from './typeorm-fixture';
import { collect } from 'typeorm-fixture-builder';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { LoginDto } from 'src/modules/auth/dtos/auth.dto';
import { AuthService } from 'src/modules/auth/auth.service';

type httpMethods = 'get' | 'post' | 'put' | 'patch';

interface RequestOpts {
  method?: httpMethods;
  headers?: Record<string, any>;
  cookies?: Record<string, any>;
  body?: Record<string, any>;
}

export class TestClient {
  protected defaultHeaders: Record<string, any> = {};
  protected defaultCookies: Record<string, any> = {};
  protected nestApp: INestApplication;
  protected testAgent: SuperAgentTest;
  private authService: AuthService;

  get app() {
    return this.nestApp || null;
  }

  async initializeApp() {
    const module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [TypeormFixture],
    }).compile();

    this.nestApp = await module.createNestApplication();
    this.authService = this.nestApp.get(AuthService);
    await this.nestApp.init();
    this.resetTestAgent();
  }

  async resetTestAgent() {
    this.testAgent = request.agent(this.app.getHttpServer());
  }

  async loadFixtures() {
    const em = this.nestApp.get(EntityManager);

    let sql = '';
    for (const metadata of em.connection.entityMetadatas) {
      sql += `TRUNCATE TABLE ${metadata.tableName} CASCADE`;
    }

    await em.query(sql);
    const typeormFixture = await this.nestApp.get(TypeormFixture);
    await typeormFixture.installFixtures(collect(fixtures));
  }

  async close() {
    await this.nestApp.close();
  }

  async login(data: LoginDto): Promise<void> {
    try {
      const tokens = await this.authService.signinLocal(data);
      this.defaultHeaders.Authorization = `Bearer ${tokens.authToken}`;
    } catch (err) {
      throw err;
    }
  }

  async requestApi(endpoint: string, opts: RequestOpts = { method: 'get' }) {
    const req = this.testAgent[opts.method](endpoint).set({
      ...this.defaultHeaders,
      ...opts.headers,
    });

    let response: request.Response;
    if (opts.body) {
      response = await req.send(opts.body);
    } else {
      response = await req;
    }

    return response.body;
  }
}
