'use strict';

var EventEmitter = require('../EventEmitter.js');

/* global describe, it, expect, beforeEach, jasmine */

describe('Check subscription/unsubscription', function() {
    var emitter;

    beforeEach(function () {
        emitter = new EventEmitter();
    });

    it('Has \'addListener\' method with alias \'on\' ', function () {
        expect(typeof emitter.addListener).toBe('function');
        expect(emitter.addListener).toBe(emitter.on);
    });

    it('Has \'removeListener\' method with alias \'off\' ', function () {
        expect(typeof emitter.removeListener).toBe('function');
        expect(emitter.removeListener).toBe(emitter.off);
    });

    it('Has \'removeAllListeners method\'', function () {
        expect(typeof emitter.removeAllListeners).toBe('function');
    });

    describe('Check subscription ', function () {
        var name = 'TEST_EVENT',
            lOne,
            lTwo;

        beforeEach(function () {
            lOne = jasmine.createSpy('lOne');
            lTwo = jasmine.createSpy('lTwo');
        });

        it('Can add a subscriber and then call it', function () {
            emitter.on(name, lOne);
            emitter.emit(name);

            expect(lOne.calls.count()).toBe(1);
        });

        it('Can add more than one subscriber to an event', function () {

            emitter.on(name, lOne);
            emitter.on(name, lTwo);

            emitter.emit(name);

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.count()).toBe(1);
        });

    });

    describe('Check unsubscription', function () {
        var name = 'TEST_EVENT',
            lOne,
            lTwo;

        beforeEach(function () {
            lOne = jasmine.createSpy('lOne');
            lTwo = jasmine.createSpy('lTwo');

            emitter.on(name, lOne);
            emitter.on(name, lTwo);
        });

        it('Can remove a subscriber and it won\'t be subsequently called', function () {
            emitter.emit(name);

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.count()).toBe(1);

            emitter.off(name, lOne);
            emitter.emit(name);

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.count()).toBe(2);
        });

        it('Can remove all subscribers for a given event type', function () {
            emitter.emit(name);

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.count()).toBe(1);

            emitter.removeAllListeners(name);
            emitter.emit(name);

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.count()).toBe(1);
        });

        it('Removing all subscribers for a given type doesn\'t remove anything else', function () {
            var oName = 'TEST_EVENT_OTHER',
                oListener = jasmine.createSpy('oListener');

            emitter.on(oName, oListener);

            emitter.removeAllListeners(name);
            emitter.emit(name);

            expect(oListener.calls.any()).toBe(false);

            emitter.emit(oName);

            expect(oListener.calls.count()).toBe(1);
        });

        it('Can remove all subscribers', function() {
            var oName = 'TEST_EVENT_OTHER',
                oListener = jasmine.createSpy('oListener');

            emitter.on(oName, oListener);

            emitter.removeAllListeners();

            emitter.emit(name);
            emitter.emit(oName);

            expect(lOne.calls.any()).toBe(false);
            expect(lTwo.calls.any()).toBe(false);
            expect(oListener.calls.any()).toBe(false);
        });
    });

    describe('Check invocation context', function () {
        var name = 'TEST_EVENT',
            ctxOne = {foo: 'bar'},
            ctxTwo = {baz: 'foo'},
            lOne,
            lTwo;

        beforeEach(function () {
            lOne = jasmine.createSpy('lOne');
            lTwo = jasmine.createSpy('lTwo');
        });

        it('Allows to pass an invocation context as an argument to event subscription', function () {
            function subscribe() {
                emitter.on(name, lOne, ctxOne);
            }

            expect(subscribe).not.toThrow();
        });

        it('Invokes handler with the context specified in subscription', function () {
            emitter.on(name, lOne, ctxOne);
            emitter.on(name, lTwo, ctxTwo);

            expect(lOne.calls.any()).toBe(false);
            expect(lTwo.calls.any()).toBe(false);

            emitter.emit(name);

            expect(lOne.calls.count()).toBe(1);
            expect(lTwo.calls.count()).toBe(1);

            expect(lOne.calls.mostRecent().object).toBe(ctxOne);
            expect(lTwo.calls.mostRecent().object).toBe(ctxTwo);
        });
    });

});

