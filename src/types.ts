/**
 * ErrorJson use to structure the error data
 * so it can be easily serialized into json
 */
export interface ErrorJson {
	/**
	 * error id
	 */
	id?: string;

	/**
	 * time when error ocurred
	 */
	time: string;

	/**
	 * underlying error that caused this error to occur
	 */
	cause?: ErrorJson;

	/**
	 * error code
	 */
	code?: string;

	/**
	 * error name
	 */
	name: string;

	/**
	 * error message
	 */
	message: string;

	/**
	 * error stack
	 */
	stack: string[];

	/**
	 * data related to the error being thrown
	 */
	info?: Record<string, any>;

	/**
	 * error retryable flag
	 */
	retryable: boolean;
}
