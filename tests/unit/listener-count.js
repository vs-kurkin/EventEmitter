'use strict';

var EventEmitter = require('../../EventEmitter');

/* globals describe, it, expect, beforeEach */

describe('Check listenerCount', function () {
    var TEST_EVENT_NAME = 'test';
    var OTHER_EVENT_NAME = 'other';
    var emitter;

    beforeEach(function () {
        emitter = new EventEmitter();
    });

    it('EventEmitter exports a static \'listenerCount\' method', function () {
        expect(typeof EventEmitter.listenerCount).toBe('function');
    });

    it('The \'listenersCount\' method returns zero for absent events', function () {
        expect(EventEmitter.listenerCount(emitter, TEST_EVENT_NAME)).toEqual(0);
    });

    it('The \'listenersCount\' method returns a correct number of listeners for an event', function () {
        function foo () { }
        function bar() { }

        emitter.addListener(OTHER_EVENT_NAME, foo);
        emitter.addListener(OTHER_EVENT_NAME, bar);

        emitter.addListener(TEST_EVENT_NAME, foo);
        expect(EventEmitter.listenerCount(emitter, TEST_EVENT_NAME)).toBe(1);
        emitter.addListener(TEST_EVENT_NAME, bar);
        expect(EventEmitter.listenerCount(emitter, TEST_EVENT_NAME)).toBe(2);

        emitter.removeListener(TEST_EVENT_NAME, foo);
        expect(EventEmitter.listenerCount(emitter, TEST_EVENT_NAME)).toBe(1);
        emitter.removeListener(TEST_EVENT_NAME, bar);
        expect(EventEmitter.listenerCount(emitter, TEST_EVENT_NAME)).toBe(0);
    });
});
