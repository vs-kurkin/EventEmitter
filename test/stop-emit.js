'use strict';

var EventEmitter = require('../EventEmitter');

/* globals describe, it, expect */

describe('Остановка выполнения обработчиков события', function () {
    var lOne;
    var lTwo;
    var emitter1;
    var emitter2;

    beforeEach(function () {
        emitter1 = new EventEmitter();
        emitter2 = new EventEmitter();

        lOne = jasmine.createSpy('lOne');
        lTwo = jasmine.createSpy('lTwo');
    });

    it('Остановка события', function () {
        emitter1
            .on('event', function () {
                expect(emitter1.stopEmit()).toBe(true);
                expect(emitter1.stopEmit('event')).toBe(true);
            })
            .on('event', lOne)
            .emit('event');

        expect(lOne.calls.any()).toBe(false);
    });

    it('Событие не должно останавливаться, если метод был вызван другим экземпляром', function () {
        emitter1
            .on('event', function () {
                expect(emitter2.stopEmit()).toBe(false);
                expect(emitter2.stopEmit('event')).toBe(false);
            })
            .on('event', lOne);

        emitter1.emit('event');

        expect(lOne.calls.count()).toBe(1);
    });

    it('Указание конкретного имени события, которое необходимо остановить', function () {
        emitter1
            .on('event', function () {
                expect(emitter1.stopEmit('other')).toBe(false);
            })
            .on('event', lOne)
            .emit('event');

        expect(lOne.calls.count()).toBe(1);
    });

    it('Остановка текущего стека выполнения', function () {
        emitter1
            .on('ready', function () {
                expect(emitter1.stopEmit()).toBe(true);
                expect(emitter1.stopEmit('ready')).toBe(true);
                expect(emitter1.stopEmit('event')).toBe(false);

                this.emit('event');
            })
            .on('event', lOne)
            .on('event', lOne)
            .on('ready', lTwo)
            .emit('ready');

        expect(lOne.calls.count()).toBe(2);
        expect(lTwo.calls.any()).toBe(false);
    });
});
