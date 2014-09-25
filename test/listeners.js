'use strict';

var EventEmitter = require('../EventEmitter');

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

    it('Returns \'undefined\' if called without arguments', function () {
        var l = emitter.listeners();

        expect(typeof l).toBe('undefined');
    });

    it('Returns an empty array if no listeners are assigned to emitter (for the specified event type)', function () {
        var l = emitter.listeners(TEST_EVENT_NAME);

        expect(l instanceof Array).toBe(true);
        expect(l.length).toBe(0);
    });

    it('Returns an empty array if some listeners are assigned to emitter, but none for the specified event type', function () {

        emitter.on(OTHER_EVENT_NAME, stub);

        var l = emitter.listeners(TEST_EVENT_NAME);

        expect(l instanceof Array).toBe(true);
        expect(l.length).toBe(0);
    });

    it('Returns an array of correct length', function () {

        emitter.on(TEST_EVENT_NAME, stub);

        var l = emitter.listeners(TEST_EVENT_NAME);

        expect(l instanceof Array).toBe(true);
        expect(l.length).toBe(1);

        //Adding the same listener again
        emitter.on(TEST_EVENT_NAME, stub);

        l = emitter.listeners(TEST_EVENT_NAME);

        expect(l instanceof Array).toBe(true);
        expect(l.length).toBe(2);

    });

    describe('Objects in return array', function () {
        var listeners,
            listener;

        beforeEach(function () {
            emitter.on(TEST_EVENT_NAME, stub, ctx);
            listeners = emitter.listeners(TEST_EVENT_NAME);
            listener = listeners ? listeners[0] : null;
        });

        it('Returns an array EventEmitter.Event objects', function () {
            expect(listener instanceof EventEmitter.Event).toBe(true);
        });

        it('EventEmitter.Event object has the type property with the right value', function () {
            expect(listener.type).toBe(TEST_EVENT_NAME);
        });

        it('EventEmitter.Event object has the listener property with the right value', function () {
            expect(listener.listener).toBe(stub);
        });

        it('EventEmitter.Event object has the context property with the right value', function () {
            expect(listener.context).toBe(ctx);
        });

        it('Returns \'once\' listeners for \'once\' and normal event for normal subscription', function () {

            emitter.once(OTHER_EVENT_NAME, stub);

            var oListeners = emitter.listeners(OTHER_EVENT_NAME);
            var oListener = oListeners ? oListeners[0] : null;

            expect(oListener instanceof EventEmitter.Event).toBe(true);
            expect(oListener.isOnce).toBe(true);

            expect(listener.isOnce).toBe(false);

        });
    });

});
