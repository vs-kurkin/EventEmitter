'use strict';

var EventEmitter = require('../../EventEmitter');

/* globals describe, it, expect, beforeEach */

describe('Check getEventType', function () {
    var TEST_EVENT_NAME = 'test';
    var TEST_OTHER_EVENT_NAME = 'other';
    var emitter;

    beforeEach(function () {
        emitter = new EventEmitter();
    });

    it('EventEmitter objects export \'getEventType\' method', function () {
        expect(typeof emitter.getEventType).toBe('function');
    });

    it('Get the name of the event', function () {
        emitter
            .on(TEST_EVENT_NAME, function () {
                expect(this.getEventType()).toBe(TEST_EVENT_NAME);
            })
            .emit(TEST_EVENT_NAME);
    });

    it('Get the name of the event after the other event', function () {
        emitter
            .on(TEST_EVENT_NAME, function () {
                this.emit(TEST_OTHER_EVENT_NAME);
            })
            .on(TEST_OTHER_EVENT_NAME, function () {
                expect(this.getEventType()).toBe(TEST_OTHER_EVENT_NAME);
            })
            .on(TEST_EVENT_NAME, function () {
                expect(this.getEventType()).toBe(TEST_EVENT_NAME);
            })
            .emit(TEST_EVENT_NAME);
    });

    it('Get the name of the event handler is not', function () {
        expect(emitter.getEventType()).toBeNull();
    });
});
