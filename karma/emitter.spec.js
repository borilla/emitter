describe('Emitter', function() {

	var sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('should exist and be a function', function() {
		expect(Emitter).is.a('function');
	});
});
