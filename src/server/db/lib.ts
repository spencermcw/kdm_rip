import { pgTableCreator} from "drizzle-orm/pg-core";

// https://orm.drizzle.team/docs/goodies#multi-project-schema
export const pgTable = pgTableCreator((name) => `kdm_rip_${name}`);
