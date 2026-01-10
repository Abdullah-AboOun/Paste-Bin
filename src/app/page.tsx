"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");

	const utils = api.useUtils();
	const { data: articles, isLoading } = api.article.getAll.useQuery(undefined, {
		staleTime: 1000 * 60 * 5,
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
					<div className="text-center flex-1">
						<h1 className="text-4xl font-bold tracking-tight">Reading List Dashboard</h1>
						<p className="mt-2 text-muted-foreground">Save articles to read later</p>
					</div>
					<ModeToggle />
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Add New Article</CardTitle>
						<CardDescription>Save a link to read later</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Input
									type="text"
									placeholder="Article title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									disabled={createArticle.isPending}
								/>
							</div>
							<div className="space-y-2">
								<Input
									type="url"
									placeholder="https://example.com/article"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									disabled={createArticle.isPending}
								/>
							</div>
							<Button type="submit" disabled={createArticle.isPending} className="w-full">
								{createArticle.isPending ? "Adding..." : "Add Article"}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="space-y-4">
					<h2 className="text-2xl font-semibold">Your Articles</h2>
					{isLoading ? (
						<p className="text-center text-muted-foreground">Loading...</p>
					) : articles && articles.length > 0 ? (
						<div className="space-y-3">
							{articles.map((article) => (
								<Card key={article.id} className={article.isRead ? "opacity-60" : ""}>
									<CardContent className="p-6">
										<div className="flex items-start gap-6">
											<div className="flex-1 min-w-0 space-y-2">
												<a
													href={article.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-lg font-semibold hover:underline break-words block"
												>
													{article.title}
												</a>
												<a
													href={article.url}
													target="_blank"
													rel="noopener noreferrer"
													className="block text-sm text-muted-foreground hover:underline break-all"
												>
													{article.url}
												</a>
												<p className="text-xs text-muted-foreground">
													Added {new Date(article.createdAt).toLocaleDateString()}
												</p>
											</div>
											<div className="flex flex-col items-end gap-3 flex-shrink-0">
												<div className="flex items-center gap-2">
													<span className="text-sm text-muted-foreground whitespace-nowrap">
														{article.isRead ? "Read" : "Unread"}
													</span>
													<Switch
														checked={article.isRead}
														onCheckedChange={() =>
															toggleRead.mutate({ id: article.id, currentState: article.isRead })
														}
														disabled={toggleRead.isPending}
													/>
												</div>
												<Button
													variant="destructive"
													size="sm"
													onClick={() => deleteArticle.mutate({ id: article.id })}
													disabled={deleteArticle.isPending}
													className="w-20"
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
								<p className="text-muted-foreground">No articles saved yet. Add one above!</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</main>
	);
}
