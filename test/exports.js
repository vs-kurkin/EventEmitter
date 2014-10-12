'use strict';

var EventEmitter = require('../EventEmitter');

/* globals describe, it, expect */

describe('Экспорт API', function () {
    it('EventEmitter', function () {
        return expect(typeof EventEmitter).toBe('function');
    });

    it('EventEmitter.Listener', function () {
        return expect(typeof EventEmitter.Listener).toBe('function');
    });

    it('EventEmitter.Listener', function () {
        return expect(typeof EventEmitter.Event).toBe('function');
    });

    it('EventEmitter.EVENT_NEW_LISTENER', function () {
        return expect(EventEmitter.EVENT_NEW_LISTENER).toBe('newListener');
    });

    it('EventEmitter.EVENT_REMOVE_LISTENER', function () {
        return expect(EventEmitter.EVENT_REMOVE_LISTENER).toBe('removeListener');
    });
});
