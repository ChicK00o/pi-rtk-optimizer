import { existsSync, readFileSync } from "node:fs";

import { MODEL_PATTERNS_PATH } from "./constants.js";

export const DEFAULT_MODEL_PATTERNS = [
	"claude",
	"gpt",
	"codex",
	"gemini",
	"o1",
	"o3",
];

export interface ModelPatternsLoadResult {
	patterns: string[];
	warning?: string;
}

let cachedPatterns: string[] = [...DEFAULT_MODEL_PATTERNS];
let lastLoadPath: string = MODEL_PATTERNS_PATH;

function normalizePatterns(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.filter((item): item is string => typeof item === "string")
		.map((s) => s.trim().toLowerCase())
		.filter((s) => s.length > 0);
}

export function loadModelPatterns(
	path: string = MODEL_PATTERNS_PATH
): ModelPatternsLoadResult {
	lastLoadPath = path;

	if (!existsSync(path)) {
		cachedPatterns = [...DEFAULT_MODEL_PATTERNS];
		return { patterns: cachedPatterns };
	}

	try {
		const rawText = readFileSync(path, "utf-8");
		const parsed = JSON.parse(rawText) as unknown;

		if (!Array.isArray(parsed)) {
			cachedPatterns = [...DEFAULT_MODEL_PATTERNS];
			return {
				patterns: cachedPatterns,
				warning: `Failed to parse ${path}: not an array`,
			};
		}

		const normalized = normalizePatterns(parsed);
		cachedPatterns = normalized;
		return { patterns: normalized };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		cachedPatterns = [...DEFAULT_MODEL_PATTERNS];
		return {
			patterns: cachedPatterns,
			warning: `Failed to parse ${path}: ${message}`,
		};
	}
}

export function getActiveModelPatterns(): string[] {
	return [...cachedPatterns];
}

export function refreshModelPatterns(
	path: string = lastLoadPath
): ModelPatternsLoadResult {
	return loadModelPatterns(path);
}
