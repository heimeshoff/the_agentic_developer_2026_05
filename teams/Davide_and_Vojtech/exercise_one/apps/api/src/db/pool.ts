import postgres, { type Sql } from "postgres";

export function createPool(databaseUrl: string): Sql {
  return postgres(databaseUrl, {
    max: 10,
    onnotice: () => {},
  });
}
