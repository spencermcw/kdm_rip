// import { relations } from "drizzle-orm";
// import { type AdapterAccount } from "next-auth/adapters";
import { serial, text, timestamp, index } from "drizzle-orm/pg-core";
import { pgTable } from "~/server/db/lib";

export const posts = pgTable("post", {
  id: serial("id").primaryKey(),
  name: text("name"),
  createdById: text("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
  (example) => ({
    createdByIdIndex: index("created_by_id_index").on(example.createdById),
  })
);
