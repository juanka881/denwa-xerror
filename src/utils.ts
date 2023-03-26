import { XErrorDTO, XErrorData } from './types';
import { XError } from './xerror';

/**
 * get error properties from a Error object except
 * name, message and stack
 * @param error error object
 * @returns error properties object
 */
export function getErrorData(error: Error | unknown | undefined | null): XErrorData | undefined {
	if(error === null || error == undefined) {
		return undefined;
	}

	if(error instanceof XError) {
		return error.data;
	}

	let data: XErrorData | undefined;
	for (const [key, value] of Object.entries(error)) {
		if(key === 'name' || key === 'message' || key === 'stack') {
			continue;
		}

		if(!data) {
			data = {};
		}

		data[key] = value;
	}

	return data;
}

/**
 * Converts a Error object to a ErrorDTO,
 * if the error is not an XError then properties
 * are extracted via the getProps fn
 * @param error XError or Error instance
 * @returns ErrorDTO
 */
export function toErrorDTO(error: Error | unknown): XErrorDTO {
	const _error = error as any;
	/* c8 ignore next */
	const name = _error?.name ?? '';

	/* c8 ignore next */
	const message = _error?.message ?? '';

	/* c8 ignore next */
	const stack = _error?.stack?.split('\n') ?? [];

	let data: XErrorData | undefined;
	if(error instanceof XError) {
		data = error.data;
	}
	else {
		data = getErrorData(error);
	}

	let transient = true;
	if(error instanceof XError) {
		transient = error.transient;
	}	

	const cause = _error.cause ? toErrorDTO(_error.cause) : undefined;
	const id = _error.id ? _error.id : '';
	const time = _error.time ? _error.time : new Date();

	return {
		name,
		message,
		stack,
		data,
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
export function isErrorType<TType extends Error | unknown>(error: unknown | undefined | null, type: TType): error is TType {
	if (error === null || error === undefined) {
		return false;
	}

	return error instanceof (type as any);
}

/**
 * checks if a error is transient.
 * error can be a XError or a regular Error.
 * will use error filters if defined for the error type
 * @param error XError or node Error
 * @returns true if transient otherwise false
 */
export function isErrorTransient(error: unknown | undefined | null): boolean {
	// if undefined, not transient
	if(error === null || error == undefined) {
		return false;
	}

	// if instance of xerror then return transient flag
	if(typeof (error as any).transient === 'boolean') {
		return (error as any).transient;
	}	

	// default to always transient
	// for all other errors
	return true;
}

/**
 * creates a formatted error
 * @param name error name
 * @param data error context data
 * @returns error instance
 */
export function errorf(name: string, data: { [key: string]: any }): Error;

/**
  * creates a formatted error
  * @param name error name
  * @param reason error reason
  * @returns error instance
  */
export function errorf(name: string, reason: string): Error;

/**
  * creates a formatted error
  * @param name error name
  * @param reason error reason
  * @param data error context data
  */
export function errorf(name: string, reason: string, data: { [key: string]: any }): Error;
export function errorf(...args: any[]): Error {
	const name = args[0];
	let reason: string | undefined;
	let data: { [key: string]: any } | undefined;

	switch (args.length) {
		case 2: {
			if (typeof args[1] === 'string') {
				reason = args[1];
			}
			else if (typeof args[1] === 'object') {
				data = args[1];
			}
			break;
		}

		case 3: {
			reason = args[1];
			data = args[2];
			break;
		}
	}

	let values: string | undefined;
	if (data) {
		values = Object.entries(data).map(([k, v]) => `${k}=${v}`).join(', ');
	}

	let message: string = '';
	if(name) {
		message += `${name}:`;
	}

	if(reason && data) {
		message += ` ${reason}. ${values}`;
	}
	else {
		message += ` ${reason ?? values}`;
	}

	return new Error(message);
}