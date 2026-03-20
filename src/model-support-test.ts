import assert from "node:assert/strict";
import { runTest } from "./test-helpers.ts";
import { isSupportedModel } from "./model-support.ts";

runTest("claude-3-opus with anthropic provider returns true", () => {
	const model = { provider: "anthropic", id: "claude-3-opus" };
	assert.equal(isSupportedModel(model), true);
});

runTest("claude-3-sonnet with anthropic provider returns true", () => {
	const model = { provider: "anthropic", id: "claude-3-sonnet" };
	assert.equal(isSupportedModel(model), true);
});

runTest("claude-3-haiku with anthropic provider returns true", () => {
	const model = { provider: "anthropic", id: "claude-3-haiku" };
	assert.equal(isSupportedModel(model), true);
});

runTest("claude-2.1 with anthropic provider returns true", () => {
	const model = { provider: "anthropic", id: "claude-2.1" };
	assert.equal(isSupportedModel(model), true);
});

runTest("gpt-4 with openai provider returns true", () => {
	const model = { provider: "openai", id: "gpt-4" };
	assert.equal(isSupportedModel(model), true);
});

runTest("gpt-4-turbo with openai provider returns true", () => {
	const model = { provider: "openai", id: "gpt-4-turbo" };
	assert.equal(isSupportedModel(model), true);
});

runTest("gpt-3.5-turbo with openai provider returns true", () => {
	const model = { provider: "openai", id: "gpt-3.5-turbo" };
	assert.equal(isSupportedModel(model), true);
});

runTest("o1-preview with openai provider returns true", () => {
	const model = { provider: "openai", id: "o1-preview" };
	assert.equal(isSupportedModel(model), true);
});

runTest("o1-mini with openai provider returns true", () => {
	const model = { provider: "openai", id: "o1-mini" };
	assert.equal(isSupportedModel(model), true);
});

runTest("o3-mini with openai provider returns true", () => {
	const model = { provider: "openai", id: "o3-mini" };
	assert.equal(isSupportedModel(model), true);
});

runTest("codex-002 with openai provider returns true", () => {
	const model = { provider: "openai", id: "codex-002" };
	assert.equal(isSupportedModel(model), true);
});

runTest("my-codex-model with openai provider returns true", () => {
	const model = { provider: "openai", id: "my-codex-model" };
	assert.equal(isSupportedModel(model), true);
});

runTest("codex-end with openai provider returns true", () => {
	const model = { provider: "openai", id: "some-model-codex" };
	assert.equal(isSupportedModel(model), true);
});

runTest("codex substring without token boundaries with openai provider returns false", () => {
	const model = { provider: "openai", id: "decodexed" };
	assert.equal(isSupportedModel(model), false);
});

runTest("codex id with openai-codex provider returns true", () => {
	const model = { provider: "openai-codex", id: "codex-legacy" };
	assert.equal(isSupportedModel(model), true);
});

runTest("custom model with openai-codex provider returns true", () => {
	const model = { provider: "openai-codex", id: "my-custom-codex-model" };
	assert.equal(isSupportedModel(model), true);
});

runTest("non-codex model with openai-codex provider returns false", () => {
	const model = { provider: "openai-codex", id: "my-custom-model" };
	assert.equal(isSupportedModel(model), false);
});

runTest("openai-family id with azure-openai-responses provider returns true", () => {
	const model = { provider: "azure-openai-responses", id: "gpt-4.1" };
	assert.equal(isSupportedModel(model), true);
});

runTest("gpt-4 with azure-openai-responses provider returns true", () => {
	const model = { provider: "azure-openai-responses", id: "gpt-4" };
	assert.equal(isSupportedModel(model), true);
});

runTest("non-openai family id with azure-openai-responses provider returns false", () => {
	const model = { provider: "azure-openai-responses", id: "anything" };
	assert.equal(isSupportedModel(model), false);
});

runTest("gemini-pro with google provider returns true", () => {
	const model = { provider: "google", id: "gemini-pro" };
	assert.equal(isSupportedModel(model), true);
});

runTest("gemini-1.5-pro with google provider returns true", () => {
	const model = { provider: "google", id: "gemini-1.5-pro" };
	assert.equal(isSupportedModel(model), true);
});

runTest("gemini-2.0-flash with google-gemini-cli provider returns true", () => {
	const model = { provider: "google-gemini-cli", id: "gemini-2.0-flash" };
	assert.equal(isSupportedModel(model), true);
});

runTest("gemini-ultra with google-vertex provider returns true", () => {
	const model = { provider: "google-vertex", id: "gemini-ultra" };
	assert.equal(isSupportedModel(model), true);
});

runTest("llama3 with ollama provider returns false", () => {
	const model = { provider: "ollama", id: "llama3" };
	assert.equal(isSupportedModel(model), false);
});

runTest("deepseek-coder with local provider returns false", () => {
	const model = { provider: "local", id: "deepseek-coder" };
	assert.equal(isSupportedModel(model), false);
});

runTest("qwen2 with unsupported provider returns false", () => {
	const model = { provider: "unknown", id: "qwen2" };
	assert.equal(isSupportedModel(model), false);
});

runTest("unsupported model id with anthropic provider returns false", () => {
	const model = { provider: "anthropic", id: "not-claude" };
	assert.equal(isSupportedModel(model), false);
});

runTest("non-gpt model with openai provider returns false", () => {
	const model = { provider: "openai", id: "dall-e-3" };
	assert.equal(isSupportedModel(model), false);
});

runTest("non-gemini model with google provider returns false", () => {
	const model = { provider: "google", id: "palm-2" };
	assert.equal(isSupportedModel(model), false);
});

runTest("undefined model returns false", () => {
	assert.equal(isSupportedModel(undefined), false);
});

runTest("null model returns false", () => {
	assert.equal(isSupportedModel(null), false);
});

runTest("ANTHROPIC (uppercase) provider matches case-insensitively", () => {
	const model = { provider: "ANTHROPIC", id: "claude-3-opus" };
	assert.equal(isSupportedModel(model), true);
});

runTest("Anthropic (mixed case) provider matches case-insensitively", () => {
	const model = { provider: "Anthropic", id: "claude-3-sonnet" };
	assert.equal(isSupportedModel(model), true);
});

runTest("OPENAI (uppercase) provider matches case-insensitively", () => {
	const model = { provider: "OPENAI", id: "gpt-4" };
	assert.equal(isSupportedModel(model), true);
});

runTest("OpenAI (mixed case) provider matches case-insensitively", () => {
	const model = { provider: "OpenAI", id: "gpt-4-turbo" };
	assert.equal(isSupportedModel(model), true);
});

runTest("uppercase model id with openai provider matches case-insensitively", () => {
	const model = { provider: "openai", id: "GPT-4" };
	assert.equal(isSupportedModel(model), true);
});

runTest("mixed-case model id with anthropic provider matches case-insensitively", () => {
	const model = { provider: "anthropic", id: "Claude-3-Sonnet" };
	assert.equal(isSupportedModel(model), true);
});

runTest("mixed-case model id with google provider matches case-insensitively", () => {
	const model = { provider: "google", id: "Gemini-1.5-Pro" };
	assert.equal(isSupportedModel(model), true);
});

runTest("GOOGLE (uppercase) provider matches case-insensitively", () => {
	const model = { provider: "GOOGLE", id: "gemini-pro" };
	assert.equal(isSupportedModel(model), true);
});

runTest("Google-Gemini-CLI (mixed case) provider matches case-insensitively", () => {
	const model = { provider: "Google-Gemini-CLI", id: "gemini-1.5-pro" };
	assert.equal(isSupportedModel(model), true);
});

runTest("AZURE-OPENAI-RESPONSES (uppercase) provider matches case-insensitively", () => {
	const model = { provider: "AZURE-OPENAI-RESPONSES", id: "gpt-4" };
	assert.equal(isSupportedModel(model), true);
});

runTest("OPENAI-CODEX (uppercase) provider matches case-insensitively", () => {
	const model = { provider: "OPENAI-CODEX", id: "codex-001" };
	assert.equal(isSupportedModel(model), true);
});

runTest("GOOGLE-VERTEX (uppercase) provider matches case-insensitively", () => {
	const model = { provider: "GOOGLE-VERTEX", id: "gemini-ultra" };
	assert.equal(isSupportedModel(model), true);
});

runTest("empty string provider returns false", () => {
	const model = { provider: "", id: "claude-3" };
	assert.equal(isSupportedModel(model), false);
});

runTest("empty string id with anthropic returns false", () => {
	const model = { provider: "anthropic", id: "" };
	assert.equal(isSupportedModel(model), false);
});

runTest("whitespace provider returns false", () => {
	const model = { provider: "   ", id: "claude-3" };
	assert.equal(isSupportedModel(model), false);
});

runTest("provider undefined returns false", () => {
	const model = { id: "claude-3" };
	assert.equal(isSupportedModel(model), false);
});

runTest("id undefined returns false", () => {
	const model = { provider: "anthropic" };
	assert.equal(isSupportedModel(model), false);
});

runTest("non-string provider returns false", () => {
	const model = { provider: 123, id: "claude-3" };
	assert.equal(isSupportedModel(model), false);
});

runTest("non-string id returns false", () => {
	const model = { provider: "openai", id: 42 };
	assert.equal(isSupportedModel(model), false);
});

runTest("whitespace-only id returns false", () => {
	const model = { provider: "openai", id: "   " };
	assert.equal(isSupportedModel(model), false);
});

runTest("partial match 'claude' not at start returns false", () => {
	const model = { provider: "anthropic", id: "my-claude-model" };
	assert.equal(isSupportedModel(model), false);
});

runTest("partial match 'gpt' not at start returns false", () => {
	const model = { provider: "openai", id: "my-gpt-model" };
	assert.equal(isSupportedModel(model), false);
});

runTest("partial match 'gemini' not included returns false", () => {
	const model = { provider: "google", id: "geminai-pro" };
	assert.equal(isSupportedModel(model), false);
});

console.log("All model-support tests passed.");
