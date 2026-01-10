import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "Reading List Dashboard",
	description: "Save and manage articles to read later",
	icons: [
		{ rel: "icon", url: "/icon.svg", type: "image/svg+xml" },
		{ rel: "apple-touch-icon", url: "/icon.svg" },
	],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={`${geist.variable}`} lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					disableTransitionOnChange
					enableSystem
				>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
