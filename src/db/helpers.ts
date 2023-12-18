import {DatabaseError} from 'pg';

export function isInvalidUuidError(e: unknown): boolean {
  return e instanceof DatabaseError && e.routine === 'string_to_uuid';
}
