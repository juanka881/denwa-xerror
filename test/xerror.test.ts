import { test, suite, assert } from 'vitest';
import { XError } from '../src/xerror.js';
import { ErrorDTO } from '../src/types.js';

suite('XError', function() {
	class TestError extends XError {
		constructor(message?: string, properties?: any) {
			super(message ?? 'test error', properties);
			this.retryable = false;
		}
	}

	test('can create', function() {
		const error = new TestError();

		assert.instanceOf(error, Error);
		assert.instanceOf(error, TestError);
		assert.equal(error.name, 'TestError');
		assert.equal(error.message, 'test error');
	});

	test('can create with message', function() {
		const error = new TestError('foo');
		assert.equal(error.message, 'foo');
	});

	test('can create with message and detail', function() {
		const detail = { foo: 'bar' }
		const error = new TestError('foo', detail);
		assert.equal(error.message, 'foo');
		assert.strictEqual(error.properties, detail);
	});

	test('can set message', function() {
		const error = new TestError().setMessage('foo');
		assert.equal(error.message, 'foo');
	});

	test('can set id', function() {
		const error = new TestError().setId('123');
		assert.equal(error.id, '123');
	});

	test('can set code', function() {
		const error = new TestError().setCode('XYZ');
		assert.equal(error.code, 'XYZ');
	});

	test('can set detail', function() {
		const detail = { foo: 'bar' };
		const error = new TestError().setProperties(detail);
		assert.strictEqual(error.properties, detail);
	});

	test('can set cause', function() {
		const cause = new Error();
		const error = new TestError().setCause(cause);
		assert.strictEqual(error.cause, cause);
	});

	test('can set retryable', function() {
		const error = new TestError().setRetryable(false);
		assert.equal(error.retryable, false);
	});

	test('can convert error to dto', function() {
		const properties = { foo: 'bar' };
		const error = new TestError().setProperties(properties);
		const dto: ErrorDTO = JSON.parse(JSON.stringify(error));

		assert.equal(dto.name, TestError.name);
		assert.equal(dto.message, 'test error');
		assert.isTrue(Array.isArray(dto.stack));
		assert.isObject(dto.properties);
		assert.deepEqual(dto.properties, properties);
	});

	test('can check type', function() {
		class FooError extends XError {};
		const error = new FooError();
		assert.equal(error.isType(FooError), true);
		assert.equal(error.isType(TestError), false);
	});
});
