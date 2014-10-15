'use strict';

var EventEmitter = require('../../EventEmitter');

/* global describe, xdescribe, it, expect, beforeEach, afterEach, jasmine */

describe('Maximum Listeners', function () {
    var emitter;
    var listeners = EventEmitter.MAX_LISTENERS;

    beforeEach(function () {
        emitter = new EventEmitter();
    });

    afterEach(function () {
        EventEmitter.MAX_LISTENERS = listeners;
    });

    it('EventEmitter exports \'MAX_LISTENERS\' property', function () {
        expect(EventEmitter.MAX_LISTENERS).toBeDefined();
        expect(EventEmitter.MAX_LISTENERS).toBeGreaterThan(-1);
    });

    it('EventEmitter instance has \'setMaxListeners\' method', function () {
        expect(typeof emitter.setMaxListeners).toBe('function');
    });

    it('\'setMaxListeners\' allows non-negative integer args', function () {
        function setMaxListenersTo(a) {
            return function () {
                return emitter.setMaxListeners(a);
            };
        }

        expect(setMaxListenersTo('foo')).toThrow();
        expect(setMaxListenersTo({ foo: 'bar'})).toThrow();
        expect(setMaxListenersTo(null)).toThrow();
        expect(setMaxListenersTo(false)).toThrow();
        expect(setMaxListenersTo(NaN)).toThrow();
        expect(setMaxListenersTo(-1)).toThrow();

        expect(setMaxListenersTo(0)).not.toThrow();
        expect(setMaxListenersTo(12)).not.toThrow();

    });

});
