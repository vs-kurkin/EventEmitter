'use strict';

var EventEmitter = require('../EventEmitter');

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

        it('Can call the \'addListener\' method with event type and handler', function () {
            function subscribe() {
                emitter.addListener(name, lOne);
            }

            expect(subscribe).not.toThrow();
        });

        it('Subscription method returns its EventEmitter object (allows chaining)', function () {
            expect(emitter.addListener(name, lOne)).toBe(emitter);
        });

        it('A subscribed method is invoked on emit', function () {
            emitter.addListener(name, lOne);
            emitter.emit(name);

            expect(lOne.calls.count()).toBe(1);
        });

        it('All subscribed methods are invoked on emit', function () {

            emitter.addListener(name, lOne);
            emitter.addListener(name, lTwo);

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

            emitter.addListener(name, lOne);
            emitter.addListener(name, lTwo);
        });

        it('Can call the \'removeListener\' method with event type and handler', function () {
            function unsubscribe() {
                emitter.removeListener(name, lOne);
            }

            expect(unsubscribe).not.toThrow();
        });

        it('Can call the \'removeAllListeners\' method with event type', function () {
            function unsubscribe() {
                emitter.removeAllListeners(name);
            }

            expect(unsubscribe).not.toThrow();
        });

        it('Can call the \'removeAllListeners\' method with no arguments', function () {
            function unsubscribe() {
                emitter.removeAllListeners();
            }

            expect(unsubscribe).not.toThrow();
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

    describe('Passing invocation context in subscription', function () {
        var name = 'TEST_EVENT',
            ctxOne = {foo: 'bar'},
            ctxTwo = {baz: 'foo'},
            lOne,
            lTwo;

        beforeEach(function () {
            lOne = jasmine.createSpy('lOne');
            lTwo = jasmine.createSpy('lTwo');
        });

        it('Can invoke the \'addListener\' method with a 3rd argument (context)', function () {
            function subscribe() {
                emitter.addListener(name, lOne, ctxOne);
            }

            expect(subscribe).not.toThrow();
        });

        it('Invokes handler with the context specified as the 3rd argument of the \'addListener\' method', function () {
            emitter.addListener(name, lOne, ctxOne);
            emitter.addListener(name, lTwo, ctxTwo);

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

