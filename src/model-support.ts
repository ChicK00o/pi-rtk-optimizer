import { getActiveModelPatterns } from "./model-patterns.js";

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

	const patterns = getActiveModelPatterns();
	return patterns.some(pattern => id.includes(pattern));
}
