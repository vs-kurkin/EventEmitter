'use strict';

var EventEmitter = require('../../EventEmitter');

/* globals describe, it, expect */

describe('Check exports', function () {
    it('EventEmitter', function () {
        return expect(typeof EventEmitter).toBe('function');
    });

    it('EventEmitter.Event', function () {
        return expect(typeof EventEmitter.Event).toBe('function');
    });
});
