import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { articles } from "@/server/db/schema";

export const articleRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				title: z.string().min(1).max(512),
				url: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Auto-prepend https:// if no protocol is specified
			const url = input.url.match(/^https?:\/\//)
				? input.url
				: `https://${input.url}`;

			return ctx.db.insert(articles).values({
				title: input.title,
				url: url,
				isRead: false,
			});
		}),

	getAll: publicProcedure.query(async ({ ctx }) => {
		return ctx.db.select().from(articles).orderBy(desc(articles.createdAt));
	}),

	toggleRead: publicProcedure
		.input(z.object({ id: z.number(), currentState: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db
				.update(articles)
				.set({ isRead: !input.currentState })
				.where(eq(articles.id, input.id));
		}),

	delete: publicProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.delete(articles).where(eq(articles.id, input.id));
		}),
});
