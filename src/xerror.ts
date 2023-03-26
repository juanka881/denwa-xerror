import { XErrorData, XErrorDTO } from './types';
import { randomUUID } from 'node:crypto';
import { isErrorType, toErrorDTO } from './utils';

/**
 * Error options used when creating a new XError instance.
 */
export interface XErrorOptions<TData = XErrorData> {
	/**
	 * set error message, 
	 * if not set defaults to constructor static message property
	 * or '' if not set
	 */
	message?: string; 

	/**
	 * override error name;
	 */
	name?: string;

	/**
	 * sets addtional error data properties,
	 * if type.data is defined, properties are merged
	 * with this data
	 */
	data?: TData;

	/**
	 * sets error that caused this error
	 * to be thrown
	 */
	cause?: Error;

	/**
	 * override error id,
	 * if not set defaults to uuid.v1()
	 */
	id?: string;

	/**
	 * override error time,
	 * if not set defaults to new Date()
	 */
	time?: Date;

	/**
	 * override transient flag,
	 * if not set defaults to constructor static transient property
	 * or true if not set
	 */
	transient?: boolean;
}

/**
 * XError class allows to created custom errors
 * without having to redefine new classes for each
 * error type.
 *
 * errors can capture data, id, time, and transient flag
 * to allow better inspection and retry handling.
 */
export class XError<TData extends XErrorData = XErrorData> extends Error {
	/**
	 * error data
	 */
	data?: TData;

	/**
	 * error cause
	 */
	cause?: Error;

	/**
	 * error id
	 */
	id: string;

	/**
	 * error time
	 */
	time: Date;

	/**
	 * error transient flag
	 */
	transient: boolean;

	/**
	 * creates a new xerror instance
	 * @param options xerror options
	 */
	constructor(options?: XErrorOptions<TData>) {
		super(options?.message);
		Object.setPrototypeOf(this, new.target.prototype);

		if(!this.message && (this.constructor as any).message) {
			this.message = (this.constructor as any).message;
		}
		
		this.name = options?.name ?? this.constructor.name;

		// capturing the stack trace keeps the reference to your error class
		if(typeof (Error as any).captureStackTrace === 'function') {
			(Error as any).captureStackTrace(this, this.constructor);
		}

		this.data = options?.data;
		this.cause = options?.cause;
		this.transient = options?.transient ?? ('transient' in this.constructor ? this.constructor.transient as boolean : true);
		this.id = options?.id ?? randomUUID();
		this.time = options?.time ?? new Date();
	}

	/**
	 * converts xerror instance to json object
	 * @returns error dto
	 */
	toJSON(): XErrorDTO {
		return toErrorDTO(this);
	}

	/**
	 * checks if this error is the same as the given
	 * type
	 * @param type error type
	 * @returns true if same, false otherwise
	 */
	isType<TType extends Error | unknown>(type: TType): this is TType {
		return isErrorType(this, type);
	}
}