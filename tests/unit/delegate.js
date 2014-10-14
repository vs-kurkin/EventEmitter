'use strict';

var EventEmitter = require('../../EventEmitter');

/* globals describe, it, expect, beforeEach, jasmine */

describe('Check delegate/unDelegate', function () {
    var TEST_EVENT_NAME = 'test';
    var TEST_EVENT_OTHER = 'other';
    var lOne;
    var lTwo;
    var emitter;
    var oEmitter;

    beforeEach(function () {
        emitter = new EventEmitter();
        oEmitter = new EventEmitter();

        lOne = jasmine.createSpy('lOne');
        lTwo = jasmine.createSpy('lTwo');
    });

    it('EventEmitter objects export \'delegate\' and \'unDelegate\' methods', function () {
        expect(typeof emitter.delegate).toBe('function');
        expect(typeof emitter.unDelegate).toBe('function');
    });

    describe('Check \'delegate\' method', function () {
        it('Delegates an emitted event to another emitter', function () {
            emitter.addListener(TEST_EVENT_NAME, lOne);
            oEmitter.addListener(TEST_EVENT_NAME, lTwo);

            emitter.emit(TEST_EVENT_NAME);

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.any()).toBe(false);

            lOne.calls.reset();

            emitter.delegate(TEST_EVENT_NAME, oEmitter);
            emitter.emit(TEST_EVENT_NAME);

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.count()).toBe(1);
        });

        it('Delegates an emitted event to another emitter with a specified alias', function () {
            emitter.addListener(TEST_EVENT_NAME, lOne);
            oEmitter.addListener(TEST_EVENT_OTHER, lTwo);

            var lOther = jasmine.createSpy('lOther');

            oEmitter.addListener(TEST_EVENT_NAME, lOther);

            emitter.delegate(TEST_EVENT_NAME, oEmitter, TEST_EVENT_OTHER);
            emitter.emit(TEST_EVENT_NAME);

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.count()).toBe(1);

            // doesn't call lOther, even though it's type is identical to the type of lOne
            expect(lOther.calls.any()).toBe(false);
        });

        it('Passes call arguments to the callback of the event to be delegated to', function () {
            emitter.addListener(TEST_EVENT_NAME, lOne);
            oEmitter.addListener(TEST_EVENT_OTHER, lTwo);

            var args = [1, false, 'foo', { bar: function baz() {}}];

            emitter.delegate(TEST_EVENT_NAME, oEmitter, TEST_EVENT_OTHER);

            emitter.emit.apply(emitter, [TEST_EVENT_NAME].concat(args));

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.count()).toBe(1);

            expect(lOne.calls.mostRecent().args).toEqual(args);
            expect(lTwo.calls.mostRecent().args).toEqual(args);
        });
    });

    describe('Check \'unDelegate\' method', function () {
        it('Stops delegation of an emitted event to another emitter', function () {
            emitter.addListener(TEST_EVENT_NAME, lOne);
            oEmitter.addListener(TEST_EVENT_OTHER, lTwo);

            emitter.delegate(TEST_EVENT_NAME, oEmitter, TEST_EVENT_OTHER);
            emitter.delegate(TEST_EVENT_OTHER, oEmitter);

            emitter.emit(TEST_EVENT_NAME);

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.count()).toBe(1);

            emitter.unDelegate(TEST_EVENT_NAME, oEmitter);

            emitter.emit(TEST_EVENT_NAME);

            expect(lOne.calls.count()).toBe(2);

            //stops delegation of TEST_EVENT_NAME to oEmitter as TEST_EVENT_OTHER
            expect(lTwo.calls.count()).toBe(1);

            emitter.emit(TEST_EVENT_OTHER);

            expect(lOne.calls.count()).toBe(2);

            //it still delegates the original TEST_EVENT_OTHER event
            expect(lTwo.calls.count()).toBe(2);

        });
    });

});
