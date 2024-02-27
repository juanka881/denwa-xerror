import { ErrorJson } from './types.js';
import { XError } from './xerror.js';

/**
 * get error properties from a Error object except
 * name, message and stack
 * @param error error object
 * @returns error properties object
 */
export function getDetail(error?: unknown): Record<string, any> | undefined {
	if (error === null || error == undefined) {
		return undefined;
	}

	if (error instanceof XError) {
		return error.detail;
	}

	let detail: any;
	for (const [key, value] of Object.entries(error)) {
		const skip = key === 'name'
			|| key === 'message'
			|| key === 'stack';

		if (skip) {
			continue;
		}

		if (!detail) {
			detail = {};
		}

		detail[key] = value;
	}

	return detail;
}

/**
 * Converts a Error object to a ErrorJson object,
 * if the error is not an XError then properties
 * are extracted via the getDetail fn
 * @param error error instance
 */
export function toErrorJson(error: Error | unknown): ErrorJson {
	const _error = error as any;
	/* c8 ignore next */
	const name = _error?.name ?? '';

	/* c8 ignore next */
	const message = _error?.message ?? '';

	/* c8 ignore next */
	const stack = _error?.stack?.split('\n') ?? [];

	const detail: any = error instanceof XError ? error.detail : getDetail(error);
	const transient = error instanceof XError ? error.transient : true;
	const cause = _error.cause ? toErrorJson(_error.cause) : undefined;
	const id = _error.id;
	const time = _error.time ?? new Date();

	return {
		name,
		message,
		stack,
		detail,
		cause,
		id,
		time,
		transient,
	};
}

/**
 * Checks if an error instance is the same type as a Error class
 * @param error error instance
 * @param type error class
 * @returns true if matches, false otherwise
 */
export function isType<TType extends Error | unknown>(error: unknown | undefined | null, type: TType): error is TType {
	if (error === null || error === undefined) {
		return false;
	}

	return error instanceof (type as any);
}
/**
  * creates a formatted error
  * @param name error name
  * @param message error reason
  * @param detail error context data
  */
export function errorf(name: string, message: string, detail?: Record<string, any>): Error {
	let fields: string | undefined;
	if (detail) {
		fields = Object.entries(detail).map(([k, v]) => `${k}=${v}`).join(', ');
		message = `${message}. ${fields}`;
	}

	const error = new Error(message);
	error.name = name;
	(error as any).detail = detail;

	return error;
}
