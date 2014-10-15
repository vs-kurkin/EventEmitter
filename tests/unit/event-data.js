'use strict';

var EventEmitter = require('../../EventEmitter');

/* globals describe, it, expect, beforeEach */

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

    it('Change the data for the current event', function () {
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

    it('Change the data for the other event', function () {
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

    it('Clear the data of the event', function () {
        emitter
            .on(TEST_EVENT_NAME, function () {
                expect(arguments.length).toBe(1);
                this.setEventData();
            })
            .on(TEST_EVENT_NAME, function () {
                expect(arguments.length).toBe(0);
            })
            .emit(TEST_EVENT_NAME, 'foo');
    });

    it('Get the data of the event', function () {
        var arg1 = 'foo';
        var arg2 = {};
        var arg3 = 123;

        emitter
            .on(TEST_EVENT_NAME, function () {
                expect(this).toBe(emitter);

                var data = this.getEventData();

                expect(data instanceof Array).toBe(true);
                expect(data.length).toBe(3);
                expect(data[0]).toBe(arg1);
                expect(data[1]).toBe(arg2);
                expect(data[2]).toBe(arg3);
            })
            .emit('event', arg1, arg2, arg3);
    });

    it('Get the data of the event after changes', function () {
        var arg1 = 'foo';
        var arg2 = {};
        var arg3 = 123;

        emitter
            .on(TEST_EVENT_NAME, function () {
                this.setEventData('bar');

                var data = this.getEventData();

                expect(data instanceof Array).toBe(true);
                expect(data.length).toBe(1);
                expect(data[0]).toBe('bar');
            })
            .emit('event', arg1, arg2, arg3);
    });

    it('Get the empty data of the event', function () {
        expect(emitter.getEventData()).toBeNull();
    });
});
