/**
 * Error DTO that can be safetly serialized to json,
 * used to capture the data from a Error or XError
 * object and serialize for storage and logging
 */
export interface XErrorDTO {
	/**
	 * error code, unique error code use to identify
	 * the type of error
	 */
	code?: string;
	/**
	 * error name, used to identify typeof error
	 */
	name: string;

	/**
	 * error message, used to describe why this
	 * error has occured
	 */
	message: string;

	/**
	 * error stack, lines are parsed into an array
	 * for easy viewing
	 */
	stack: string[];

	/**
	 * data related to the error being thrown
	 */
	data?: Record<string, any>;

	/**
	 * internal error that cause this error to
	 * occured
	 */
	cause?: XErrorDTO;

	/**
	 * error unique id
	 */
	id: string;

	/**
	 * timestamp when error ocurred
	 */
	time: Date;

	/**
	 * transient flag, use to denote if this error can be retried.
	 * a transient error is a intermittent failure cause by something
	 * in the environment, usually some kind of connectivity issue
	 * and attempting to retry it with some delay might fix the
	 * issue.
	 *
	 * a non-transient error is a terminal condition that always ends up
	 * with the error being generated either due to a programming error
	 * or a fixed state in the environment.
	 */
	transient: boolean;
}

/**
 * error data type used to capture
 * context related error data. should always be an object
 * with key value pairs
 */
export type XErrorData = Record<string, any>;