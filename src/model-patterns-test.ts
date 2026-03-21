// @ts-ignore - Node.js types not available in this project
import assert from "node:assert/strict";
// @ts-ignore - Node.js types not available in this project
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
// @ts-ignore - Node.js types not available in this project
import { tmpdir } from "node:os";
// @ts-ignore - Node.js types not available in this project
import { join } from "node:path";

import {
	DEFAULT_MODEL_PATTERNS,
	getActiveModelPatterns,
	loadModelPatterns,
	refreshModelPatterns,
} from "./model-patterns.ts";
import { runTest } from "./test-helpers.ts";

function createTempDir(): string {
	return mkdtempSync(join(tmpdir(), "model-patterns-test-"));
}

function cleanup(dir: string): void {
	try {
		rmSync(dir, { recursive: true, force: true });
	} catch {
		// Ignore cleanup errors
	}
}

runTest("DEFAULT_MODEL_PATTERNS is correct", () => {
	assert.deepEqual(DEFAULT_MODEL_PATTERNS, [
		"claude",
		"gpt",
		"codex",
		"gemini",
		"o1",
		"o3",
	]);
});

runTest("loadModelPatterns returns defaults when file doesn't exist", () => {
	const tempDir = createTempDir();
	const nonExistentPath = join(tempDir, "nonexistent.json");

	const result = loadModelPatterns(nonExistentPath);

	assert.deepEqual(result.patterns, DEFAULT_MODEL_PATTERNS);
	assert.equal(result.warning, undefined);

	cleanup(tempDir);
});

runTest("loadModelPatterns returns patterns from valid file", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");
	const customPatterns = ["custom1", "custom2", "custom3"];

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(customPatterns));

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, customPatterns);
	assert.equal(result.warning, undefined);

	cleanup(tempDir);
});

runTest("loadModelPatterns returns empty array when file contains empty array", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify([]));

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, []);
	assert.equal(result.warning, undefined);

	cleanup(tempDir);
});

runTest("loadModelPatterns returns defaults + warning on malformed JSON", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");

	// @ts-ignore
	writeFileSync(filePath, "{ invalid json }");

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, DEFAULT_MODEL_PATTERNS);
	assert.ok(result.warning);
	assert.ok(result.warning.includes("Failed to parse"));
	assert.ok(result.warning.includes(filePath));

	cleanup(tempDir);
});

runTest("loadModelPatterns returns defaults + warning when file is object instead of array", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify({ patterns: ["test"] }));

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, DEFAULT_MODEL_PATTERNS);
	assert.ok(result.warning);
	assert.ok(result.warning.includes("not an array"));

	cleanup(tempDir);
});

runTest("loadModelPatterns returns defaults + warning when file is string instead of array", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify("not an array"));

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, DEFAULT_MODEL_PATTERNS);
	assert.ok(result.warning);
	assert.ok(result.warning.includes("not an array"));

	cleanup(tempDir);
});

runTest("loadModelPatterns returns defaults + warning when file is null", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(null));

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, DEFAULT_MODEL_PATTERNS);
	assert.ok(result.warning);
	assert.ok(result.warning.includes("not an array"));

	cleanup(tempDir);
});

runTest("loadModelPatterns filters to strings only", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");
	const mixedArray = ["valid", 123, "another", null, true, "third"];

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(mixedArray));

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, ["valid", "another", "third"]);
	assert.equal(result.warning, undefined);

	cleanup(tempDir);
});

runTest("loadModelPatterns trims whitespace from strings", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");
	const arrayWithWhitespace = ["  claude  ", "\tgpt\n", "  codex  "];

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(arrayWithWhitespace));

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, ["claude", "gpt", "codex"]);
	assert.equal(result.warning, undefined);

	cleanup(tempDir);
});

runTest("loadModelPatterns filters out empty strings after trimming", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");
	const arrayWithEmpty = ["claude", "", "  ", "\t\n", "gpt", "   "];

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(arrayWithEmpty));

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, ["claude", "gpt"]);
	assert.equal(result.warning, undefined);

	cleanup(tempDir);
});

runTest("loadModelPatterns handles mixed normalization (non-strings, whitespace, empty)", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");
	const complexArray = [
		"  valid1  ",
		123,
		"",
		"  valid2  ",
		null,
		"   ",
		"valid3",
		true,
		"\t\n",
	];

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(complexArray));

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, ["valid1", "valid2", "valid3"]);
	assert.equal(result.warning, undefined);

	cleanup(tempDir);
});

runTest("loadModelPatterns lowercases mixed-case user entries", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(["Claude", "GPT", "Gemini-Pro"]));

	const result = loadModelPatterns(filePath);

	assert.deepEqual(result.patterns, ["claude", "gpt", "gemini-pro"]);
	assert.equal(result.warning, undefined);

	cleanup(tempDir);
});

runTest("getActiveModelPatterns returns cached patterns after load", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");
	const customPatterns = ["test1", "test2"];

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(customPatterns));

	loadModelPatterns(filePath);
	const active = getActiveModelPatterns();

	assert.deepEqual(active, customPatterns);

	cleanup(tempDir);
});

runTest("refreshModelPatterns updates cache with new patterns", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");

	// Initial load
	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(["initial"]));
	loadModelPatterns(filePath);
	assert.deepEqual(getActiveModelPatterns(), ["initial"]);

	// Update file and refresh
	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(["updated", "patterns"]));
	refreshModelPatterns(filePath);

	assert.deepEqual(getActiveModelPatterns(), ["updated", "patterns"]);

	cleanup(tempDir);
});

runTest("refreshModelPatterns with no path uses last loaded path", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(["first"]));
	loadModelPatterns(filePath);

	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(["second"]));
	refreshModelPatterns();

	assert.deepEqual(getActiveModelPatterns(), ["second"]);

	cleanup(tempDir);
});

runTest("refreshModelPatterns returns warning on error and falls back to defaults", () => {
	const tempDir = createTempDir();
	const filePath = join(tempDir, "patterns.json");

	// Initial valid load
	// @ts-ignore
	writeFileSync(filePath, JSON.stringify(["valid"]));
	loadModelPatterns(filePath);
	assert.deepEqual(getActiveModelPatterns(), ["valid"]);

	// Corrupt file
	// @ts-ignore
	writeFileSync(filePath, "{ invalid }");
	const result = refreshModelPatterns(filePath);

	// Should have warning and cache should fall back to defaults
	assert.ok(result.warning);
	assert.deepEqual(getActiveModelPatterns(), DEFAULT_MODEL_PATTERNS);

	cleanup(tempDir);
});

console.log("All model-patterns tests passed.");
