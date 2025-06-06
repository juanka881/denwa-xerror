import { ErrorJson } from './types.js';
import { XError } from './xerror.js';

/**
 * get error properties from a Error object except
 * name, message and stack
 * @param error error object
 * @returns error properties object
 */
export function getProperties(error?: unknown): Record<string, any> | undefined {
	if (error === null || error == undefined) {
		return undefined;
	}

	if (error instanceof XError) {
		return error.info;
	}

	let properties: any;
	for (const [key, value] of Object.entries(error)) {
		const skip = key === 'name'
			|| key === 'message'
			|| key === 'stack';

		if (skip) {
			continue;
		}

		if (!properties) {
			properties = {};
		}

		properties[key] = value;
	}

	return properties;
}

/**
 * Converts a Error object to a ErrorJson object,
 * if the error is not an XError then properties
 * are extracted via the getDetail fn
 * @param error error instance
 */
export function toErrorJson(error: Error | unknown): ErrorJson {
	const _error = error as any;
	const name = _error?.name ?? '';
	const message = _error?.message ?? '';
	const stack = _error?.stack?.split('\n') ?? [];

	const info: any = error instanceof XError ? error.info : getProperties(error);
	const retryable = error instanceof XError ? error.retryable : true;
	const cause = _error.cause ? toErrorJson(_error.cause) : undefined;
	const id = _error.id;
	const time = _error.time ?? new Date();

	return {
		name,
		message,
		stack,
		info,
		cause,
		id,
		time,
		retryable,
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
  * @param info error context data
  */
export function errorf(name: string, message: string, info?: Record<string, any>): Error {
	let fields: string | undefined;
	if (info) {
		fields = Object.entries(info).map(([k, v]) => `${k}=${v}`).join(', ');
		message = `${message}. ${fields}`;
	}

	const error = new Error(message);
	error.name = name;
	(error as any).info = info;

	return error;
}

/**
 * creates a formatted error message
 * joining the message parts, along with a
 * list of key value pairs passed in the detail
 * @param message message parts
 * @param info message detail
 * @returns message text
 */
export function messagef(message: string | string[], info?: Record<string, any>): string {
	let text = '';
	if(Array.isArray(message)) {
		text = message.join(' ');
	}
	else {
		text = message;
	}

	let fields: string | undefined;
	if (info) {
		fields = Object.entries(info).map(([k, v]) => `${k}=${v}`).join(', ');
		text = `${text}. ${fields}`;
	}

	return text;
}
