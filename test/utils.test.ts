import { test, suite, assert } from 'vitest';
import { XError } from '../src/xerror.js';
import * as utils from '../src/utils.js';

suite('getDetail', function () {
	test('returns undefined if nil', function () {
		assert.equal(utils.getProperties(undefined), undefined);
		assert.equal(utils.getProperties(null), undefined);
	});


	test('can get detail from xerror', function () {
		class FooError extends XError { };
		const detail = { foo: 'bar' };
		const error = new FooError().setInfo(detail);

		assert.strictEqual(utils.getProperties(error), detail);
	});

	test('can get detail from error', function () {
		const error: any = new Error();
		error.name = 'foo';
		error.foo = 'bar';
		const data = utils.getProperties(error);

		assert.deepEqual(data, { foo: 'bar' });
	})
});

suite('toErrorJson', function() {
	test('can convert error json', function() {
		const error = new Error();
		const json = utils.toErrorJson(error);

		assert.equal(json.name, 'Error');
		assert.equal(json.message, '');
		assert.equal(json.info, undefined);
		assert.equal(json.cause, undefined);
		assert.equal(json.id, undefined);
		assert.isNotNaN(Date.parse(json.time));
	});

	test('can convert error with cause', function() {
		const cause = new Error('bar');
		const error = new Error('foo', { cause });
		const json = utils.toErrorJson(error);

		assert.equal(json.cause?.name, 'Error');
		assert.equal(json.cause?.message, 'bar');
		assert.equal(json.cause?.info, undefined);
		assert.equal(json.cause?.cause, undefined);
		assert.equal(json.cause?.id, undefined);
		assert.isNotNaN(Date.parse(json.time));
	});

	test('can convert empty error', function() {
		const error = new Error();
		(error as any).name = undefined;
		(error as any).message = undefined;
		(error as any).stack = undefined;

		const json = utils.toErrorJson(error);
		assert.equal(json.name, '');
		assert.equal(json.message, '');
		assert.equal(json.info, undefined);
		assert.equal(json.cause, undefined);
		assert.equal(json.id, undefined);
		assert.isNotNaN(Date.parse(json.time));
	});
});

suite('isType', function() {
	class FooError extends XError {};
	class BarError extends XError {};

	test('nil returns false', function() {
		assert.equal(utils.isType(null, Error), false);
		assert.equal(utils.isType(undefined, Error), false);
	});

	test('can check type', function() {
		const error = new Error();
		assert.equal(utils.isType(error, Error), true);
		assert.equal(utils.isType(error, FooError), false);

		const foo = new FooError();
		assert.equal(utils.isType(foo, Error), true);
		assert.equal(utils.isType(foo, FooError), true);
		assert.equal(utils.isType(foo, BarError), false);
	});
});

suite('errorf', function() {
	test('can create name and message', function() {
		const error = utils.errorf('foo', 'invalid');
		assert.equal(error.name, 'foo');
		assert.equal(error.message, 'invalid');
	});

	test('can create with detail', function() {
		const error = utils.errorf('foo', 'foo error', { foo: 'bar' });
		assert.equal(error.name, 'foo');
		assert.equal(error.message, 'foo error. foo=bar');
	});
});


suite('messagef', function() {
	test('can format message', function() {
		const message = utils.messagef('foo');
		assert.equal(message, 'foo');
	});

	test('can format message with multiple parts', function() {
		const message = utils.messagef(['foo', 'bar']);
		assert.equal(message, 'foo bar');
	});

	test('can format message detail', function() {
		const message = utils.messagef(['foo', 'bar'], { foo: 'bar' });
		assert.equal(message, 'foo bar. foo=bar');
	});
});
