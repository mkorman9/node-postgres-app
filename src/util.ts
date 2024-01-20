import {z} from 'zod';

export function isUUID(value: string): boolean {
  return z.string().uuid().safeParse(value).success;
}
