import 'dotenv/config';

class TEnviroments {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_DATABASE: string;
  PORT: number;
  MODE: 'DEV' | 'PRD' | 'TST';
  DATABASE_TYPE: 'postgres' | 'mysql';
  SECRET_KEY: string;
  SECRET_BYPASS?: string;
}

enum EEnviroments {
  DATABASE_HOST = 'DATABASE_HOST',
  DATABASE_PORT = 'DATABASE_PORT',
  DATABASE_USER = 'DATABASE_USER',
  DATABASE_PASSWORD = 'DATABASE_PASSWORD',
  DATABASE_DATABASE = 'DATABASE_DATABASE',
  PORT = 'PORT',
  MODE = 'MODE',
  DATABASE_TYPE = 'DATABASE_TYPE',
  SECRET_KEY = 'SECRET_KEY',
  SECRET_BYPASS = 'SECRET_BYPASS',
}

const toNumber: Array<string> = [EEnviroments.DATABASE_PORT, EEnviroments.PORT];

class Enviroments {
  constructor(private enviroment: NodeJS.ProcessEnv) {}

  public envs: TEnviroments = {
    DATABASE_HOST: '',
    DATABASE_PORT: 5432,
    DATABASE_USER: '',
    DATABASE_PASSWORD: '',
    DATABASE_DATABASE: '',
    PORT: 3001,
    MODE: 'DEV',
    DATABASE_TYPE: 'postgres',
    SECRET_KEY: '',
  };

  private checkValueType(env: string, eEnv: string): number | string {
    if (toNumber.find((env) => env === eEnv)) return parseFloat(env);
    return env;
  }

  private validateValue(eEnv: string): void {
    const value = this.enviroment[eEnv];
    if (!value) {
      console.log('Missing enviroment variable:', eEnv);
      throw new Error(`config error - missing env.${eEnv}`);
    }
    this.envs[eEnv] = this.checkValueType(value, eEnv);
  }

  public setValues(enviroments: Array<EEnviroments>) {
    enviroments.forEach((env) => this.validateValue(env));
    return this;
  }

  public isProduction(): boolean {
    return this.envs.MODE === 'PRD';
  }
}

const configEnviroments = new Enviroments(process.env).setValues(
  Object.values(EEnviroments),
);

const enviroments: TEnviroments = configEnviroments.envs;

export { Enviroments, configEnviroments, enviroments };
