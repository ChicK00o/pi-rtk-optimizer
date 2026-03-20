type ModelLike = {
	provider?: unknown;
	id?: unknown;
};

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

	const id = normalizeModelToken(model.id);

	if (!id) {
		return false;
	}

	return (
		id.includes("claude") ||
		id.includes("gpt") ||
		id.includes("codex") ||
		id.includes("gemini") ||
		id.includes("o1") ||
		id.includes("o3")
	);
}
