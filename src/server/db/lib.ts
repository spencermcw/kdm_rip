import { pgTableCreator} from "drizzle-orm/pg-core";

// https://orm.drizzle.team/docs/goodies#multi-project-schema
export const pgTable = pgTableCreator((name) => `kdm_rip_${name}`);

export const passwordToSalt = (password: string): string => {
  // base64 encode the password
  const salt = Buffer.from(password).toString("base64");
  return salt;
}
