// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `app_${name}`);

export const articles = createTable(
	"article",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		title: d.varchar({ length: 512 }).notNull(),
		url: d.text().notNull(),
		isRead: d.boolean().notNull().default(false),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => /* @__PURE__ */ new Date())
			.notNull(),
	}),
	(t) => [index("article_created_idx").on(t.createdAt)],
);
