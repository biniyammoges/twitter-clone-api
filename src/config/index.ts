import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface GlobalConfig {
  appEnv: 'local' | 'test' | 'dev' | 'stg' | 'prod';
  authTokenSecret: string;
  refreshTokenSecret: string;
  authTokenExpire: string;
  refreshTokenExpire: string;
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
