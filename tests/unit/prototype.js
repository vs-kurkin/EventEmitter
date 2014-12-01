'use strict';

var EventEmitter = require('../../EventEmitter');

/* globals describe, it, expect */

describe('Inheritance from native EventEmitter', function () {
    var EE;

    try {
        EE = require('events').EventEmitter;
    } catch (error) {
        return;
    }

    it('Check prototype', function () {
        expect(EventEmitter.prototype instanceof EE).toBe(true);
        expect(EventEmitter.prototype.constructor).toBe(EventEmitter);
    });

    it('Check instance', function () {
        expect((new EventEmitter()) instanceof EventEmitter).toBe(true);
        expect((new EventEmitter()) instanceof EE).toBe(true);
    });
});
