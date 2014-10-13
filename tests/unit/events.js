'use strict';

var EventEmitter = require('../../EventEmitter');

/* global describe, it, expect, beforeEach, jasmine */

describe('Checking events', function () {
    var emitter;
    var eName = 'event';
    var eNewListener = EventEmitter.EVENT_NEW_LISTENER;
    var eRemoveListener = EventEmitter.EVENT_REMOVE_LISTENER;
    var listener;

    beforeEach(function () {
        emitter = new EventEmitter();
        listener = jasmine.createSpy('listener');
    });

    it('Checking the constants', function () {
        expect(typeof eNewListener).toBe('string');
        expect(typeof eRemoveListener).toBe('string');
        expect(eRemoveListener !== eNewListener).toBe(true);
    });

    it('Emit the \'newListener\' event with default context', function () {
        var arg1 = function () {
        };

        emitter
            .on(eNewListener, listener)
            .on(eName, arg1);

        expect(listener.calls.count()).toBe(1);
        expect(listener).toHaveBeenCalledWith(eName, arg1, emitter);
    });

    it('Emit the \'newListener\' event with custom context', function () {
        var arg1 = function () {
        };
        var arg2 = false;

        emitter
            .on(eNewListener, listener)
            .on(eName, arg1, arg2);

        expect(listener.calls.count()).toBe(1);
        expect(listener).toHaveBeenCalledWith(eName, arg1, arg2);
    });

    it('Emit the \'removeListener\' event', function () {
        var arg1 = function () {
        };
        var arg2 = function () {
        };

        emitter
            .on(eRemoveListener, listener)
            .on(eName, arg1)
            .on(eName, arg2)
            .off(eName, arg1);

        expect(listener.calls.count()).toBe(1);
        expect(listener).toHaveBeenCalledWith(eName, arg1);
    });

    it('Don`t emit the \'removeListener\' event, if no of the listener', function () {
        var arg1 = function () {
        };

        emitter
            .on(eRemoveListener, listener)
            .off(eName, arg1);

        expect(listener.calls.any()).toBe(false);
    });

    it('Don`t emit the \'removeListener\' event, if remove latest the listeners of the this event', function () {
        emitter
            .on(eRemoveListener, listener)
            .on(eRemoveListener, listener)
            .off(eRemoveListener, listener)
            .off(eRemoveListener, listener);

        expect(listener.calls.count()).toBe(1);
    });

    it('Emit the \'removeListener\' event, when removes all listeners', function () {
        var arg1 = function () {
        };
        var arg2 = function () {
        };

        emitter
            .on(eRemoveListener, listener)
            .on(eName, arg1)
            .on(eName, arg2)
            .removeAllListeners();

        expect(listener.calls.count()).toBe(2);
    })
});
