import assert from "node:assert/strict";
import { mock } from "bun:test";

import { cloneDefaultConfig, runTest } from "./test-helpers.ts";
import { isSupportedModel } from "./model-support.ts";

mock.module("./config-store.js", () => ({
	ensureConfigExists: () => ({ success: true }),
	getRtkIntegrationConfigPath: () => "/tmp/pi-rtk-config.json",
	loadRtkIntegrationConfig: () => ({ config: cloneDefaultConfig(), warning: undefined }),
	normalizeRtkIntegrationConfig: <T>(value: T) => value,
	saveRtkIntegrationConfig: () => ({ success: true }),
}));

mock.module("@mariozechner/pi-coding-agent", () => ({
	getSettingsListTheme: () => ({}),
	isToolCallEventType: (toolName: string, event: Record<string, unknown>) => event.toolName === toolName,
}));

mock.module("@mariozechner/pi-tui", () => ({
	Box: class {},
	Container: class {
		addChild(): void {}
		render(): string[] {
			return [];
		}
		invalidate(): void {}
	},
	SettingsList: class {
		handleInput(): void {}
		updateValue(): void {}
	},
	Spacer: class {},
	Text: class {},
	truncateToWidth: (text: string) => text,
	visibleWidth: (text: string) => text.length,
}));

const { createBoundedNoticeTracker } = await import("./index.ts");

function createTestContext(model: unknown) {
	return {
		hasUI: false,
		cwd: "/tmp",
		ui: {
			notify: () => {
				return;
			},
		},
		model,
	};
}

async function runAsyncTest(name: string, testFn: () => Promise<void>): Promise<void> {
	await testFn();
	console.log(`[PASS] ${name}`);
}

runTest("bounded notice tracker evicts old entries and supports reset", () => {
	const tracker = createBoundedNoticeTracker(2);

	assert.equal(tracker.remember("first"), true);
	assert.equal(tracker.remember("second"), true);
	assert.equal(tracker.remember("first"), false);

	assert.equal(tracker.remember("third"), true);
	assert.equal(tracker.remember("second"), false);
	assert.equal(tracker.remember("first"), true);

	tracker.reset();
	assert.equal(tracker.remember("third"), true);
});

runTest("bounded notice tracker coerces invalid limits to a safe minimum", () => {
	const tracker = createBoundedNoticeTracker(0);
	assert.equal(tracker.remember("alpha"), true);
	assert.equal(tracker.remember("beta"), true);
	assert.equal(tracker.remember("alpha"), true);
});

runTest("isSupportedModel returns false for ollama provider (integration guard)", () => {
	const model = { provider: "ollama", id: "llama3" };
	assert.equal(isSupportedModel(model), false);
});

runTest("isSupportedModel returns true for anthropic claude (integration guard)", () => {
	const model = { provider: "anthropic", id: "claude-3-opus" };
	assert.equal(isSupportedModel(model), true);
});

runTest("isSupportedModel returns false for undefined model (integration guard)", () => {
	assert.equal(isSupportedModel(undefined), false);
});

runTest("isSupportedModel returns false for null model (integration guard)", () => {
	assert.equal(isSupportedModel(null), false);
});

runTest("isSupportedModel returns false for malformed model object (integration guard)", () => {
	const model = { provider: 123, id: null };
	assert.equal(isSupportedModel(model), false);
});

runTest("isSupportedModel returns false for non-codex openai-codex id (integration guard)", () => {
	const model = { provider: "openai-codex", id: "random-model" };
	assert.equal(isSupportedModel(model), false);
});

runTest("isSupportedModel returns false for non-openai-family azure id (integration guard)", () => {
	const model = { provider: "azure-openai-responses", id: "random-model" };
	assert.equal(isSupportedModel(model), false);
});

await runAsyncTest("tool_call skips rewrite for unsupported model via index handler", async () => {
	const handlers = new Map<
		string,
		(
			event: Record<string, unknown>,
			ctx: {
				hasUI: boolean;
				cwd?: string;
				ui: { notify(message: string, level: "info" | "warning" | "error"): void };
				model: unknown;
			},
		) => Promise<Record<string, unknown> | void> | Record<string, unknown> | void
	>();
	const pi = {
		exec: async () => ({ code: 0, stdout: "rtk 1.0.0", stderr: "" }),
		on: (
			eventName: string,
			handler: (event: Record<string, unknown>, ctx: unknown) => Promise<Record<string, unknown> | void> | Record<string, unknown> | void,
		) => {
			handlers.set(eventName, handler);
		},
		registerCommand: () => {
			return;
		},
	} as unknown as import("@mariozechner/pi-coding-agent").ExtensionAPI;

	const { default: rtkIntegrationExtension } = await import("./index.ts");
	rtkIntegrationExtension(pi);

	const toolCallHandler = handlers.get("tool_call");
	assert.ok(toolCallHandler);

	const event = {
		toolName: "bash",
		input: { command: "cat README.md" },
	};

	const result = await toolCallHandler(event, createTestContext({ provider: "ollama", id: "llama3" }));
	assert.deepEqual(result, {});
	assert.equal(event.input.command, "cat README.md");
});

await runAsyncTest("tool_result skips compaction for unsupported model via index handler", async () => {
	const handlers = new Map<
		string,
		(
			event: Record<string, unknown>,
			ctx: {
				hasUI: boolean;
				cwd?: string;
				ui: { notify(message: string, level: "info" | "warning" | "error"): void };
				model: unknown;
			},
		) => Promise<Record<string, unknown> | void> | Record<string, unknown> | void
	>();

	const pi = {
		exec: async () => ({ code: 0, stdout: "rtk 1.0.0", stderr: "" }),
		on: (
			eventName: string,
			handler: (event: Record<string, unknown>, ctx: unknown) => Promise<Record<string, unknown> | void> | Record<string, unknown> | void,
		) => {
			handlers.set(eventName, handler);
		},
		registerCommand: () => {
			return;
		},
	} as unknown as import("@mariozechner/pi-coding-agent").ExtensionAPI;

	const { default: rtkIntegrationExtension } = await import("./index.ts");
	rtkIntegrationExtension(pi);

	const toolResultHandler = handlers.get("tool_result");
	assert.ok(toolResultHandler);

	const originalContent = [{ type: "text", text: "line 1\nline 2\n" }];
	const event = {
		toolName: "read",
		input: { filePath: "README.md" },
		content: originalContent,
	};

	const result = await toolResultHandler(event, createTestContext({ provider: "ollama", id: "llama3" }));
	assert.deepEqual(result, {});
	assert.deepEqual(event.content, originalContent);
});

console.log("All index tests passed.");
