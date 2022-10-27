import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface GlobalConfig {
  appEnv: 'local' | 'test' | 'dev' | 'stg' | 'prod';
  authTokenSecret: string;
  refreshTokenSecret: string;
  authTokenExpire: string;
  refreshTokenExpire: string;
  s3Endpoint: string;
  s3Port: number;
  s3AccessKey: string;
  s3SecretKey: string;
}

const GlobalConfigSchema = Joi.object<GlobalConfig>({
  appEnv: Joi.string()
    .valid(...['local', 'test', 'dev', 'stg', 'prod'])
    .required(),
  authTokenSecret: Joi.string().required(),
  authTokenExpire: Joi.string().required(),
  refreshTokenExpire: Joi.string().required(),
  refreshTokenSecret: Joi.string().required(),
});

export const globalConfig = registerAs('global', () => {
  const cfg: Partial<GlobalConfig> = {
    appEnv: 'dev',
    authTokenExpire: process.env.AUTH_TOKEN_EXPIRE,
    authTokenSecret: process.env.AUTH_TOKEN_SECRET,
    refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    s3Endpoint: process.env.S3_ENDPOINT,
    s3Port: +process.env.S3_PORT,
    s3AccessKey: process.env.S3_ACCESS_KEY,
    s3SecretKey: process.env.S3_SECRET_KEY,
  };

  console.log(`Loading global config for enviroment '${cfg.appEnv}'`);

  const result = GlobalConfigSchema.validate(cfg, {
    abortEarly: true,
    allowUnknown: true,
  });

  if (result.error) {
    for (const v of result.error.details)
      console.error('GlobalConfig validation error:', v.message);

    throw new Error('Missing configration options');
  }

  return cfg;
});
