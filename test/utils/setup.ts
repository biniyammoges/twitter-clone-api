import { TestClient } from './test-client';

export const setup = async (): Promise<TestClient> => {
  const client = new TestClient();
  process.env.APP_ENV = 'test';

  await client.initializeApp();
  await client.loadFixtures();

  return client;
};
