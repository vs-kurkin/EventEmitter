'use strict';

var EventEmitter = require('../../EventEmitter');

/* globals describe, it, expect */

describe('Stopping the execution of event handlers', function () {
    var lOne;
    var lTwo;
    var emitter1;
    var emitter2;
    var EVENT_NAME = 'event';
    var OTHER_EVENT_NAME = 'ready';

    beforeEach(function () {
        emitter1 = new EventEmitter();
        emitter2 = new EventEmitter();

        lOne = jasmine.createSpy('lOne');
        lTwo = jasmine.createSpy('lTwo');
    });

    it('Stopping events', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter1.stopEmit()).toBe(true);
            })
            .on(EVENT_NAME, lOne)
            .emit(EVENT_NAME);

        expect(lOne.calls.any()).toBe(false);
    });

    it('Stopping events with specified type', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter1.stopEmit(EVENT_NAME)).toBe(true);
            })
            .on(EVENT_NAME, lOne)
            .emit(EVENT_NAME);

        expect(lOne.calls.any()).toBe(false);
    });

    it('Event should not stop, if the passed type does not match the current', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter1.stopEmit(OTHER_EVENT_NAME)).toBe(false);
            })
            .on(EVENT_NAME, lOne)
            .emit(EVENT_NAME);

        expect(lOne.calls.count()).toBe(1);
    });

    it('Event should not stop unless method is called by another instance', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter2.stopEmit()).toBe(false);
            })
            .on(EVENT_NAME, lOne);

        emitter1.emit(EVENT_NAME);

        expect(lOne.calls.count()).toBe(1);
    });

    it('Event should not stop unless method is called by another instance with indication of type of event', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter2.stopEmit(EVENT_NAME)).toBe(false);
            })
            .on(EVENT_NAME, lOne);

        emitter1.emit(EVENT_NAME);

        expect(lOne.calls.count()).toBe(1);
    });

    it('Specifying a custom name of the event, which must be stopped', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter1.stopEmit('other')).toBe(false);
            })
            .on(EVENT_NAME, lOne)
            .emit(EVENT_NAME);

        expect(lOne.calls.count()).toBe(1);
    });

    it('Stop only current event call stack', function () {
        emitter1
            .on(OTHER_EVENT_NAME, function () {
                expect(emitter1.stopEmit()).toBe(true);
                expect(emitter1.stopEmit(OTHER_EVENT_NAME)).toBe(true);
                expect(emitter1.stopEmit(EVENT_NAME)).toBe(false);

                this.emit(EVENT_NAME);
            })
            .on(EVENT_NAME, lOne)
            .on(EVENT_NAME, lOne)
            .on(OTHER_EVENT_NAME, lTwo)
            .emit(OTHER_EVENT_NAME);

        expect(lOne.calls.count()).toBe(2);
        expect(lTwo.calls.any()).toBe(false);
    });
});
