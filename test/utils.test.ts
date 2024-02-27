import { test, suite, assert } from 'vitest';
import { XError } from '../src/xerror.js';
import * as utils from '../src/utils.js';

suite('getDetail', function () {
	test('returns undefined if nil', function () {
		assert.equal(utils.getDetail(undefined), undefined);
		assert.equal(utils.getDetail(null), undefined);
	});
	

	test('can get detail from xerror', function () {
		class FooError extends XError { };
		const detail = { foo: 'bar' };
		const error = new FooError().setDetail(detail);

		assert.strictEqual(utils.getDetail(error), detail);
	});

	test('can get detail from error', function () {
		const error: any = new Error();
		error.name = 'foo';
		error.foo = 'bar';
		const data = utils.getDetail(error);

		assert.deepEqual(data, { foo: 'bar' });
	})
});

suite('toErrorJson', function() {
	test('can convert error json', function() {
		const error = new Error();
		const json = utils.toErrorJson(error);

		assert.equal(json.name, 'Error');
		assert.equal(json.message, '');
		assert.equal(json.detail, undefined);
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
		assert.equal(json.cause?.detail, undefined);
		assert.equal(json.cause?.cause, undefined);
		assert.equal(json.cause?.id, undefined);
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
