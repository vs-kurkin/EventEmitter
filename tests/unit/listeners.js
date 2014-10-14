'use strict';

var EventEmitter = require('../../EventEmitter');

/* globals describe, it, expect, beforeEach */
describe('Check listeners method', function () {
    var TEST_EVENT_NAME = 'test';
    var OTHER_EVENT_NAME = 'other';

    function stub () { }
    var ctx = {};
    var emitter;

    beforeEach(function () {
        emitter = new EventEmitter();
    });

    it('Has a \'listeners\' method', function () {
        expect(typeof emitter.listeners).toBe('function');
    });

    it('Returns an empty array if called without arguments', function () {
        var l = emitter.listeners();

        expect(l instanceof Array).toBe(true);
        expect(l.length).toBe(0);
    });

    it('Returns an empty array if no listeners are assigned to emitter (for the specified event type)', function () {
        var l = emitter.listeners(TEST_EVENT_NAME);

        expect(l instanceof Array).toBe(true);
        expect(l.length).toBe(0);
    });

    it('Returns an empty array if some listeners are assigned to emitter, but none for the specified event type', function () {
        emitter.on(OTHER_EVENT_NAME, stub);

        var listeners = emitter.listeners(TEST_EVENT_NAME);

        expect(listeners instanceof Array).toBe(true);
        expect(listeners.length).toBe(0);
    });

    it('Returns an array of correct length', function () {
        emitter.on(TEST_EVENT_NAME, stub);

        var listeners = emitter.listeners(TEST_EVENT_NAME);

        expect(listeners instanceof Array).toBe(true);
        expect(listeners.length).toBe(1);

        //Adding the same callback again
        emitter.on(TEST_EVENT_NAME, stub);

        listeners = emitter.listeners(TEST_EVENT_NAME);

        expect(listeners instanceof Array).toBe(true);
        expect(listeners.length).toBe(2);
    });

    describe('Functions in return array', function () {
        var listeners;
        var listener;

        beforeEach(function () {
            emitter.on(TEST_EVENT_NAME, stub, ctx);
            listeners = emitter.listeners(TEST_EVENT_NAME);
            listener = listeners ? listeners[0] : null;
        });

        it('Returns an array Function objects', function () {
            expect(typeof listener).toBe('function');
        });
    });

});
