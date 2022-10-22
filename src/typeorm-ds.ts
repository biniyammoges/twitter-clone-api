import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

let isTsNode = false;
// https://github.com/TypeStrong/ts-node/issues/846#issuecomment-631828160
// Alternative: https://www.npmjs.com/package/detect-ts-node
// @ts-ignore
if (process[Symbol.for('ts-node.register.instance')]) {
  isTsNode = true;
}

const appEnv = process.env.APP_ENV;

let entities: DataSourceOptions['entities'] = [
  path.join(process.cwd(), '/dist/**/*.entity.js'),
  ...(isTsNode ? path.join(process.cwd(), 'src/**/*.entity.ts') : []),
];

export const ds: DataSourceOptions = {
  type: 'mysql',
  host: 'mysql_db',
  username: 'user',
  password: 'password',
  logger: 'debug',
  synchronize: true, //appEnv === 'test',
  entities,
  database: 'db',
  subscribers: [],
  migrations: [],
};

export default new DataSource(ds);
