import 'dotenv/config';
import {z} from 'zod';

const ConfigSchema = z.object({
  HTTP_HOST: z.string().default('0.0.0.0'),
  HTTP_PORT: z.coerce.number().int().default(8080),

  DB_URL: z.string(),
  DB_POOL_MIN: z.coerce.number().int().default(0),
  DB_POOL_MAX: z.coerce.number().int().default(5)
});

export default (() => {
  try {
    return ConfigSchema.parse(process.env);
  } catch (e) {
    console.log(`🚫 Configuration loading has failed: ${e}`);
    process.exit(1);
  }
})();
