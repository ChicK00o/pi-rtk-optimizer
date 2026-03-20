type ModelLike = {
	provider?: unknown;
	id?: unknown;
};

const CODEX_TOKEN_PATTERN = /(^|[-_])codex([-_]|$)/;
const GEMINI_TOKEN_PATTERN = /(^|[-_])gemini([-_]|$)/;

function hasCodexToken(id: string): boolean {
	return CODEX_TOKEN_PATTERN.test(id);
}

function hasGeminiToken(id: string): boolean {
	return GEMINI_TOKEN_PATTERN.test(id);
}

function isOpenAiFamilyId(id: string): boolean {
	return id.startsWith("gpt-") || id.startsWith("o1-") || id.startsWith("o3-") || hasCodexToken(id);
}

function normalizeModelToken(value: unknown): string | null {
	if (typeof value !== "string") {
		return null;
	}

	const normalized = value.trim().toLowerCase();
	return normalized.length > 0 ? normalized : null;
}

export function isSupportedModel(model: ModelLike | undefined | null): boolean {
	if (!model) {
		return false;
	}

	const provider = normalizeModelToken(model.provider);
	const id = normalizeModelToken(model.id);

	if (!provider || !id) {
		return false;
	}

	switch (provider) {
		case "anthropic":
			return id.startsWith("claude-");
		case "openai":
			return isOpenAiFamilyId(id);
		case "openai-codex":
			return hasCodexToken(id);
		case "azure-openai-responses":
			return isOpenAiFamilyId(id);
		case "google":
		case "google-gemini-cli":
		case "google-vertex":
			return hasGeminiToken(id);
		default:
			return false;
	}
}
