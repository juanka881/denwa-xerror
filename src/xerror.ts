import { ErrorJson } from './types.js';
import { isType, toErrorJson } from './utils.js';

/**
 * Create custom error types by extending XErrror. 
 * XError has a uniform structure and can be easily 
 * serialized to json to capture all error details 
 * for troubleshooting.
 */
export class XError<TDetail = any> extends Error {
	/**
	 * error id
	 */
	id?: string;

	/**
	 * time when error ocurred
	 */
	time: Date;

	/**
	 * error which cause this error to occur
	 */
	cause?: unknown;	

	/**
	 * error code
	 */
	code?: string;

	/**
	 * error details
	 */
	detail?: TDetail;	

	/**
	 * error transient flag
	 */
	transient: boolean;

	/**
	 * creates a new xerror instance
	 * @param message error message
	 * @param detail addtional error detail data
	 * @param cause error which cause this error
	 */
	constructor(message?: string, detail?: TDetail) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
		this.message = message ?? '';

		// capturing the stack trace keeps the reference to your error class
		// for nodejs
		if(typeof (Error as any).captureStackTrace === 'function') {
			(Error as any).captureStackTrace(this, this.constructor);
		}

		this.detail = detail;		
		this.transient = true;
		this.time = new Date();
	}

	/**
	 * converts xerror instance to json object
	 * @returns error dto
	 */
	toJSON(): ErrorJson {
		return toErrorJson(this);
	}

	/**
	 * checks if this error is the same as the given
	 * type
	 * @param type error type
	 * @returns true if same, false otherwise
	 */
	isType<TType extends Error | unknown>(type: TType): this is TType {
		return isType(this, type);
	}

	/**
	 * set error message
	 * @param message error message
	 * @returns self
	 */
	setMessage(message: string): this {
		this.message = message;
		return this;	
	}

	/**
	 * set error id
	 * @param id error id
	 * @returns self
	 */
	setId(id: string): this {
		this.id = id;
		return this;
	}

	/**
	 * set error code
	 * @param code error code
	 * @returns self
	 */
	setCode(code: string): this {
		this.code = code;
		return this;
	}

	/**
	 * set error cause
	 * @param cause error cause
	 * @returns self
	 */
	setCause(cause: unknown): this {
		this.cause = cause;
		return this;
	}

	/**
	 * set error detail
	 * @param detail error detail
	 * @returns self
	 */
	setDetail(detail: TDetail): this {
		this.detail = detail;
		return this;	
	}

	/**
	 * set transient flag
	 * @param transient transient flag
	 * @returns self
	 */
	setTransient(transient: boolean): this {
		this.transient = transient;
		return this;
	}
}