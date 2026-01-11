"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	if (!mounted) {
		return null;
	}

	const isDark = theme === "dark";

	return (
		<button
			aria-checked={isDark}
			aria-label="Toggle theme"
			className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
			data-state={isDark ? "checked" : "unchecked"}
			onClick={toggleTheme}
			role="switch"
			type="button"
		>
			<span
				className={`pointer-events-none flex size-5 items-center justify-center rounded-full bg-background shadow-lg ring-0 transition-transform ${
					isDark ? "translate-x-5" : "translate-x-0"
				}`}
				data-state={isDark ? "checked" : "unchecked"}
			>
				{isDark ? <Moon className="size-3" /> : <Sun className="size-3" />}
			</span>
		</button>
	);
}
