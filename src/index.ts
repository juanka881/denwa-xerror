import * as uuid from 'uuid';

export interface ErrorData {
	[key: string]: any;
}

export interface XError<TData extends ErrorData = ErrorData>  {
	// core
	name: string;
	message: string;

	// ext
	data?: TData;
	transient?: boolean;
}

export interface XErrorParams<TError extends XError> {
	type?: TError;
	name?: string;
	message?: string;

	// ext
	data?: TError['data'];
	cause?: Error;
	id?: string;
	time?: Date;
	transient?: boolean;
}

export interface ErrorInfo {
	// core
	name: string;
	message: string;
	stack: string[];
  
	// ext
	data?: any;
	cause?: ErrorInfo;
	id: string;
	time: Date;
	transient: boolean;
}
  
export class XErrorInstance extends Error {
	data?: ErrorData;
	cause?: Error;
	id: string;
	time: Date;
	transient: boolean;

	constructor(params: XErrorParams<XError>) {
		const message = params.message ?? params.type?.message ?? 'unknown error';
		super(message);
		(Error as any).captureStackTrace && (Error as any).captureStackTrace(this, this.constructor);

		this.name = params.name ?? params.type?.name ?? 'XError';
		this.message = message;
		if(params.type?.data || params.data) {
			this.data = {
				...params.type?.data,
				...params.data,
			};
		}		
		this.cause = params.cause;
		this.id = params.id ?? uuid.v4();
		this.time = params.time ?? new Date();
		this.transient = params.type?.transient ?? params.transient ?? true;
	}
}

export function errorType<TData>(defaults: XError<TData>): XError<TData> {
	return defaults;
}

export function xerror<TError extends XError>(params: XErrorParams<TError>) {
	return new XErrorInstance(params);
}

export function getErrorInfo(error: Error): ErrorInfo {
	const name = error.name;
	const message = error.message;
	const stack = error.stack?.split('\n') ?? [];
	const data = error instanceof XErrorInstance ? error.data : undefined;
	const cause = error instanceof XErrorInstance && error.cause ? getErrorInfo(error.cause) : undefined;
	const id = error instanceof XErrorInstance ? error.id : '';
	const time = error instanceof XErrorInstance ? error.time : new Date();
	const transient = error instanceof XErrorInstance ? error.transient : true;

	return {
		name,
		message,
		stack,
		data,
		cause,
		id,
		time,
		transient
	}
}

export function isErrorType(error: Error | undefined, type: XError | Error): boolean {
	if(!error) {
		return false;
	}

	if(typeof type === 'function')  {
		return error instanceof type;
	}

	return error.name === type.name;
}