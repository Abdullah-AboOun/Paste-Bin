"use client";

import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";

export default function Home() {
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");

	const utils = api.useUtils();
	const { data: articles, isLoading } = api.article.getAll.useQuery(undefined, {
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false,
	});

	const createArticle = api.article.create.useMutation({
		onSuccess: () => {
			setTitle("");
			setUrl("");
			void utils.article.getAll.invalidate();
		},
	});

	const toggleRead = api.article.toggleRead.useMutation({
		onSuccess: () => {
			void utils.article.getAll.invalidate();
		},
	});

	const deleteArticle = api.article.delete.useMutation({
		onSuccess: () => {
			void utils.article.getAll.invalidate();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (title.trim() && url.trim()) {
			createArticle.mutate({ title, url });
		}
	};

	return (
		<main className="min-h-screen bg-background p-4 md:p-8">
			<div className="mx-auto max-w-4xl space-y-8">
				<div className="flex items-center justify-between">
					<div className="flex-1 text-center">
						<h1 className="font-bold text-4xl tracking-tight">
							Reading List Dashboard
						</h1>
						<p className="mt-2 text-muted-foreground">
							Save articles to read later
						</p>
					</div>
					<ModeToggle />
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Add New Article</CardTitle>
						<CardDescription>Save a link to read later</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="space-y-2">
								<Input
									disabled={createArticle.isPending}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Article title"
									type="text"
									value={title}
								/>
							</div>
							<div className="space-y-2">
								<Input
									disabled={createArticle.isPending}
									onChange={(e) => setUrl(e.target.value)}
									placeholder="https://example.com/article"
									type="url"
									value={url}
								/>
							</div>
							<Button
								className="w-full"
								disabled={createArticle.isPending}
								type="submit"
							>
								{createArticle.isPending ? "Adding..." : "Add Article"}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="space-y-4">
					<h2 className="font-semibold text-2xl">Your Articles</h2>
					{isLoading ? (
						<p className="text-center text-muted-foreground">Loading...</p>
					) : articles && articles.length > 0 ? (
						<div className="space-y-3">
							{articles.map((article) => (
								<Card
									className={article.isRead ? "opacity-60" : ""}
									key={article.id}
								>
									<CardContent className="p-6">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1 space-y-2">
												<div className="flex items-center gap-2">
													<a
														className="font-semibold text-lg hover:underline"
														href={article.url}
														rel="noopener noreferrer"
														target="_blank"
													>
														{article.title}
													</a>
													{article.isRead ? (
														<Badge variant="secondary">Read</Badge>
													) : (
														<Badge>Unread</Badge>
													)}
												</div>
												<a
													className="block truncate text-muted-foreground text-sm hover:underline"
													href={article.url}
													rel="noopener noreferrer"
													target="_blank"
												>
													{article.url}
												</a>
												<p className="text-muted-foreground text-xs">
													Added{" "}
													{new Date(article.createdAt).toLocaleDateString()}
												</p>
											</div>
											<div className="flex flex-shrink-0 items-center gap-3">
												<div className="flex items-center gap-2">
													<span className="text-muted-foreground text-sm">
														{article.isRead ? "Read" : "Unread"}
													</span>
													<Switch
														checked={article.isRead}
														disabled={toggleRead.isPending}
														onCheckedChange={() =>
															toggleRead.mutate({
																id: article.id,
																currentState: article.isRead,
															})
														}
													/>
												</div>
												<Button
													disabled={deleteArticle.isPending}
													onClick={() =>
														deleteArticle.mutate({ id: article.id })
													}
													size="sm"
													variant="destructive"
												>
													Delete
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<Card>
							<CardContent className="p-12 text-center">
								<p className="text-muted-foreground">
									No articles saved yet. Add one above!
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</main>
	);
}
