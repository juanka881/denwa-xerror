import { ErrorDTO } from './types.js';
import { XError } from './xerror.js';

/**
 * get error properties from a Error object except
 * name, message and stack
 * @param error error object
 * @returns error properties object
 */
export function getErrorProperties(error?: unknown): Record<string, any> | undefined {
	if (error === null || error == undefined) {
		return undefined;
	}

	if (error instanceof XError) {
		return error.properties;
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
export function toErrorDTO(error: Error | unknown): ErrorDTO {
	const _error = error as any;
	const name = _error?.name ?? '';
	const message = _error?.message ?? '';
	const stack = _error?.stack?.split('\n') ?? [];

	const info: any = error instanceof XError ? error.properties : getErrorProperties(error);
	const retryable = error instanceof XError ? error.retryable : true;
	const cause = _error.cause ? toErrorDTO(_error.cause) : undefined;
	const id = _error.id;
	const time = _error.time ?? new Date();

	return {
		name,
		message,
		stack,
		properties: info,
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
export function isErrorType<TType extends Error | unknown>(error: unknown | undefined | null, type: TType): error is TType {
	if (error === null || error === undefined) {
		return false;
	}

	return error instanceof (type as any);
}
/**
  * creates a formatted error
  * @param name error name
  * @param message error reason
  * @param properties error properties
  */
export function formattedError(name: string, message: string, properties?: Record<string, any>): Error {
	let fields: string | undefined;
	if (properties) {
		fields = Object.entries(properties).map(([k, v]) => `${k}=${v}`).join(', ');
		message = `${message}. ${fields}`;
	}

	const error = new Error(message);
	error.name = name;
	(error as any).properties = properties;

	return error;
}

/**
 * creates a formatted error message
 * joining the message parts, along with a
 * list of key value pairs passed in the properties
 * @param message message parts
 * @param properties message properties
 * @returns message text
 */
export function messageFormat(message: string | string[], properties?: Record<string, any>): string {
	let text = '';
	if(Array.isArray(message)) {
		text = message.join(' ');
	}
	else {
		text = message;
	}

	let fields: string | undefined;
	if (properties) {
		fields = Object.entries(properties).map(([k, v]) => `${k}=${v}`).join(', ');
		text = `${text}. ${fields}`;
	}

	return text;
}
