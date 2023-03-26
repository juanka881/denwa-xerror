import { assert } from 'chai';
import { test, suite } from 'mocha';
import { XError } from '../src';
import * as utils from '../src/utils';

suite('utils: getErrorData', function () {
	test('returns undefined if nil', function () {
		assert.equal(utils.getErrorData(undefined), undefined);
		assert.equal(utils.getErrorData(null), undefined);
	});

	test('can get error data from xerror', function () {
		class FooError extends XError { };
		const data = { foo: 'bar' };
		const error = new FooError({ data });

		assert.strictEqual(utils.getErrorData(error), data);
	});

	test('can get error from plain error', function () {
		const error: any = new Error();
		error.name = 'foo';
		error.foo = 'bar';
		const data = utils.getErrorData(error);

		assert.deepEqual(data, {
			foo: 'bar'
		});
	})
});

suite('utils: toErrorDTO', function() {
	test('can convert error to dto', function() {
		const error = new Error();
		const dto = utils.toErrorDTO(error);

		assert.equal(dto.name, 'Error');
		assert.equal(dto.message, '');
		assert.equal(dto.data, undefined);
		assert.equal(dto.cause, undefined);
		assert.equal(dto.id, '');
		assert.equal(dto.time instanceof Date, true);
	});

	test('can covnert error with cause', function() {
		const cause = new Error('bar');
		const error = new Error('foo', { cause });
		const dto = utils.toErrorDTO(error);

		assert.equal(dto.cause?.name, 'Error');
		assert.equal(dto.cause?.message, 'bar');
		assert.equal(dto.cause?.data, undefined);
		assert.equal(dto.cause?.cause, undefined);
		assert.equal(dto.cause?.id, '');
		assert.equal(dto.cause?.time instanceof Date, true);
	});
}); 

suite('utils: isErrorType', function() {
	class FooError extends XError {};
	class BarError extends XError {};

	test('nil returns false', function() {
		assert.equal(utils.isErrorType(null, Error), false);
		assert.equal(utils.isErrorType(undefined, Error), false);
	});

	test('can check type', function() {
		const error = new Error();
		assert.equal(utils.isErrorType(error, Error), true);
		assert.equal(utils.isErrorType(error, FooError), false);

		const foo = new FooError();
		assert.equal(utils.isErrorType(foo, Error), true);
		assert.equal(utils.isErrorType(foo, FooError), true);
		assert.equal(utils.isErrorType(foo, BarError), false);
	});
}); 

suite('utils: isErrorTransient', function() {
	class FooError extends XError {};
	class BarError extends XError {};

	test('nil returns false', function() {
		assert.equal(utils.isErrorTransient(null), false);
		assert.equal(utils.isErrorTransient(undefined), false);
	});

	test('returns transient property if set', function() {
		const error = new Error();
		(error as any).transient = false;
		assert.equal(utils.isErrorTransient(error), false);

		const foo = new FooError();
		assert.equal(utils.isErrorTransient(foo), true);
	});

	test('returns true if not set', function() {
		const error = new Error();
		assert.equal(utils.isErrorTransient(error), true);
	});
}); 

suite('utils: errorf', function() {
	test('can create with name and data', function() {
		const error = utils.errorf('foo', { foo: 'bar' });
		assert.equal(error.message, 'foo: foo=bar');
	});

	test('can create with name, and reason', function() {
		const error = utils.errorf('foo', 'invalid');
		assert.equal(error.message, 'foo: invalid');
	});

	test('can create with name, reason, data', function() {
		const error = utils.errorf('foo', 'invalid', { foo: 'bar' });
		assert.equal(error.message, 'foo: invalid. foo=bar');
	});
}); 
