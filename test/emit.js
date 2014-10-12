'use strict';

var EventEmitter = require('../EventEmitter');

/* global describe, it, expect, beforeEach, jasmine */

describe('Checking emitting', function () {
    var emitter,
        name = 'TEST_EVENT',
        oName = 'TEST_EVENT_OTHER',
        noName = 'TEST_EVENT_NONE',
        lOne,
        lTwo,
        oOne;

    beforeEach(function () {
        emitter = new EventEmitter();

        lOne = jasmine.createSpy('lOne');
        lTwo = jasmine.createSpy('lTwo');

        oOne = jasmine.createSpy('oOne');

        emitter.on(name, lOne);
        emitter.on(name, lTwo);

        emitter.on(oName, oOne);
    });

    it('Has an \'emit\' method', function () {
        expect(typeof emitter.emit).toBe('function');
    });

    it('\'Emit\' returns true if an event has listeners and false otherwise', function () {
        expect(emitter.emit(name)).toBe(true);
        expect(emitter.emit(noName)).toBe(false);
    });

    it('Triggers listeners by invoking \'emit\'', function () {
        expect(lOne.calls.any()).toBe(false);
        expect(lTwo.calls.any()).toBe(false);

        emitter.emit(name);

        expect(lOne.calls.count()).toBe(1);
        expect(lTwo.calls.count()).toBe(1);
    });

    it('Triggers only listeners with specified name, by invoking \'emit(name)\'', function () {
        expect(lOne.calls.any()).toBe(false);
        expect(lTwo.calls.any()).toBe(false);
        expect(oOne.calls.any()).toBe(false);

        emitter.emit(name);

        //triggers listeners of name
        expect(lOne.calls.count()).toBe(1);
        expect(lTwo.calls.count()).toBe(1);

        // doesn't trigger other listeners
        expect(oOne.calls.any()).toBe(false);
    });

    it('Passes argument to listeners as the second parameter of \'emit\'', function () {
        var arg1 = { foo: 'bar', baz: 123, xyz: false},
            arg2 = 'simple string';

        emitter.emit(name, arg1);

        expect(lOne).toHaveBeenCalledWith(arg1);
        expect(lTwo).toHaveBeenCalledWith(arg1);

        emitter.emit(name, arg2);

        expect(lOne).toHaveBeenCalledWith(arg2);
        expect(lTwo).toHaveBeenCalledWith(arg2);

        emitter.emit(name);
    });

    it('Passes several arguments to listeners as parameters of \'emit\'', function () {
        var arg1 = { foo: 'bar', baz: 123, xyz: false},
            arg2 = 'simple string',
            arg3 = 12345;

        emitter.emit(name, arg1, arg2, arg3);

        expect(lOne).toHaveBeenCalledWith(arg1, arg2, arg3);
        expect(lTwo).toHaveBeenCalledWith(arg1, arg2, arg3);
    });

});
