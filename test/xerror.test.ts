import { test, suite } from 'mocha';
import { assert } from 'chai';
import { XError } from '../src';

suite('xerror: XError', function() {
	class TestError extends XError {
		static message = 'test error';
		static transient = false;
	}

	test('can create', function() {
		class FooError extends XError {}
		const error = new FooError();

		assert.instanceOf(error, Error);
		assert.instanceOf(error, FooError);
		assert.equal(error.message, '');
	});

	test('can create with static message property1', function() {
		const error = new TestError();
		assert.equal(error.message, 'test error');
	});

	test('can create with static transient property', function() {
		const error = new TestError();
		assert.equal(error.transient, false);
	});

	test('can create and override message property', function() {
		const error = new TestError({ message: 'foo' });
		assert.equal(error.message, 'foo');
	});

	test('can create and override transient property', function() {
		class FooError extends XError {
			static transient = false;
		}
		const error = new FooError({ transient: true });
		assert.equal(error.transient, true);
	});

	test('can convert error to json', function() {
		const UUID = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
		const ISO8601 = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

		const data = { foo: 'bar' };
		const error = new TestError({ data });
		const jsonText = JSON.stringify(error);
		const dto = JSON.parse(jsonText);

		assert.equal(typeof dto.name, 'string');
		assert.equal(typeof dto.message, 'string');
		assert.equal(Array.isArray(dto.stack), true);
		assert.isObject(dto.data);
		assert.deepEqual(dto.data, data);
		assert.match(dto.id, UUID, 'id is uuid');
		assert.match(dto.time, ISO8601, 'time is isi8601');
	});

	test('can check type', function() {
		class FooError extends XError {};
		const error = new FooError();
		assert.equal(error.isType(FooError), true);
		assert.equal(error.isType(TestError), false);
	});
});
