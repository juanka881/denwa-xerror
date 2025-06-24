import { test, suite, assert } from 'vitest';
import { XError } from '../src/xerror.js';
import * as utils from '../src/utils.js';

suite('getErrorProperties', function () {
	test('returns undefined if nil', function () {
		assert.equal(utils.getErrorProperties(undefined), undefined);
		assert.equal(utils.getErrorProperties(null), undefined);
	});


	test('can get properties from xerror', function () {
		class FooError extends XError { };
		const properties = { foo: 'bar' };
		const error = new FooError().setProperties(properties);

		assert.strictEqual(utils.getErrorProperties(error), properties);
	});

	test('can get properties from error', function () {
		const error: any = new Error();
		error.name = 'foo';
		error.foo = 'bar';
		const data = utils.getErrorProperties(error);

		assert.deepEqual(data, { foo: 'bar' });
	})
});

suite('toErrorDTO', function() {
	test('can convert error to dto', function() {
		const error = new Error();
		const json = utils.toErrorDTO(error);

		assert.equal(json.name, 'Error');
		assert.equal(json.message, '');
		assert.equal(json.properties, undefined);
		assert.equal(json.cause, undefined);
		assert.equal(json.id, undefined);
		assert.isNotNaN(Date.parse(json.time));
	});

	test('can convert error with cause', function() {
		const cause = new Error('bar');
		const error = new Error('foo', { cause });
		const json = utils.toErrorDTO(error);

		assert.equal(json.cause?.name, 'Error');
		assert.equal(json.cause?.message, 'bar');
		assert.equal(json.cause?.properties, undefined);
		assert.equal(json.cause?.cause, undefined);
		assert.equal(json.cause?.id, undefined);
		assert.isNotNaN(Date.parse(json.time));
	});

	test('can convert empty error', function() {
		const error = new Error();
		(error as any).name = undefined;
		(error as any).message = undefined;
		(error as any).stack = undefined;

		const json = utils.toErrorDTO(error);
		assert.equal(json.name, '');
		assert.equal(json.message, '');
		assert.equal(json.properties, undefined);
		assert.equal(json.cause, undefined);
		assert.equal(json.id, undefined);
		assert.isNotNaN(Date.parse(json.time));
	});
});

suite('isType', function() {
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

suite('formattedError', function() {
	test('can create name and message', function() {
		const error = utils.formattedError('foo', 'invalid');
		assert.equal(error.name, 'foo');
		assert.equal(error.message, 'invalid');
	});

	test('can create with properties', function() {
		const error = utils.formattedError('foo', 'foo error', { foo: 'bar' });
		assert.equal(error.name, 'foo');
		assert.equal(error.message, 'foo error. foo=bar');
	});
});


suite('messageFormat', function() {
	test('can format message', function() {
		const message = utils.messageFormat('foo');
		assert.equal(message, 'foo');
	});

	test('can format message with multiple parts', function() {
		const message = utils.messageFormat(['foo', 'bar']);
		assert.equal(message, 'foo bar');
	});

	test('can format message properties', function() {
		const message = utils.messageFormat(['foo', 'bar'], { foo: 'bar' });
		assert.equal(message, 'foo bar. foo=bar');
	});
});
