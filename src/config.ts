import 'dotenv/config';
import {z} from 'zod';

const ConfigSchema = z.object({
  HTTP_HOST: z.string().default('0.0.0.0'),
  HTTP_PORT: z.number().int().default(8080),

  DB_URL: z.string(),
  DB_POOL_MIN: z.number().int().default(0),
  DB_POOL_MAX: z.number().int().default(5)
});

export default (() => {
  try {
    return ConfigSchema.parse(
      Object.keys(process.env)
        .reduce(
          (env, key) => {
            if (!isNaN(Number(process.env[key]))) {
              env[key] = Number(process.env[key]);
            } else if (['true', 'false'].includes(process.env[key]!.toLowerCase())) {
              env[key] = process.env[key]!.toLowerCase() === 'true';
            } else {
              env[key] = process.env[key];
            }
            return env;
          },
          {} as Record<string, unknown>
        )
    );
  } catch (e) {
    console.log(`🚫 Configuration loading has failed: ${e}`);
    process.exit(1);
  }
})();
