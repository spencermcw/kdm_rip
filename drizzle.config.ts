import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema/index.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: env.DATABASE_URL
  },
  tablesFilter: ["kdm_rip_*"],
} satisfies Config;
