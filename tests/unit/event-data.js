'use strict';

var EventEmitter = require('../../EventEmitter');

/* globals describe, it, expect, beforeEach, jasmine */

describe('Check setEventData', function () {
    var TEST_EVENT_NAME = 'test';
    var TEST_EVENT_OTHER = 'other';
    var emitter;

    beforeEach(function () {
        emitter = new EventEmitter();
    });

    it('Check of the returned value', function () {
        emitter
            .on(TEST_EVENT_NAME, function () {
                expect(this).toBe(emitter);
                expect(this.setEventData()).toBe(this);
                expect(this.setEventData('foo')).toBe(this);
            })
            .emit(TEST_EVENT_NAME);

        expect(emitter.setEventData()).toBe(emitter);
    });

    it('Change a data for a current event', function () {
        emitter
            .on(TEST_EVENT_NAME, function (foo) {
                expect(arguments.length).toBe(1);
                expect(foo).toBe('foo');
                this.setEventData('bar', 'baz');
            })
            .on(TEST_EVENT_NAME, function (bar, baz) {
                expect(arguments.length).toBe(2);
                expect(bar).toBe('bar');
                expect(baz).toBe('baz');
            })
            .emit(TEST_EVENT_NAME, 'foo');
    });

    it('Change a data for a other event', function () {
        emitter
            .on(TEST_EVENT_NAME, function (foo) {
                expect(foo).toBe('foo');
                this.emit(TEST_EVENT_OTHER, 'bar');
            })
            .on(TEST_EVENT_OTHER, function (bar) {
                expect(bar).toBe('bar');
                this.setEventData('baz');
            })
            .on(TEST_EVENT_OTHER, function (baz) {
                expect(baz).toBe('baz');
            })
            .on(TEST_EVENT_NAME, function (foo) {
                expect(foo).toBe('foo');
            })
            .emit(TEST_EVENT_NAME, 'foo');
    });

    it('Clear a event data', function () {
        emitter
            .on(TEST_EVENT_NAME, function () {
                expect(arguments.length).toBe(1);
                this.setEventData();
            })
            .on(TEST_EVENT_NAME, function () {
                expect(arguments.length).toBe(0);
            })
            .emit(TEST_EVENT_NAME, 'foo');
    })
});
