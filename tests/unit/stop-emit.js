'use strict';

var EventEmitter = require('../../EventEmitter');

/* globals describe, it, expect */

describe('Остановка выполнения обработчиков события', function () {
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

    it('Остановка события', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter1.stopEmit()).toBe(true);
            })
            .on(EVENT_NAME, lOne)
            .emit(EVENT_NAME);

        expect(lOne.calls.any()).toBe(false);
    });

    it('Остановка события с указаниет типа', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter1.stopEmit(EVENT_NAME)).toBe(true);
            })
            .on(EVENT_NAME, lOne)
            .emit(EVENT_NAME);

        expect(lOne.calls.any()).toBe(false);
    });

    it('Событие не должно останавливаться, если переданный тип не соответствует текущему', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter1.stopEmit(OTHER_EVENT_NAME)).toBe(false);
            })
            .on(EVENT_NAME, lOne)
            .emit(EVENT_NAME);

        expect(lOne.calls.count()).toBe(1);
    });

    it('Событие не должно останавливаться, если метод был вызван другим экземпляром', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter2.stopEmit()).toBe(false);
            })
            .on(EVENT_NAME, lOne);

        emitter1.emit(EVENT_NAME);

        expect(lOne.calls.count()).toBe(1);
    });

    it('Событие не должно останавливаться, если метод был вызван другим экземпляром с типом события', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter2.stopEmit(EVENT_NAME)).toBe(false);
            })
            .on(EVENT_NAME, lOne);

        emitter1.emit(EVENT_NAME);

        expect(lOne.calls.count()).toBe(1);
    });

    it('Указание конкретного имени события, которое необходимо остановить', function () {
        emitter1
            .on(EVENT_NAME, function () {
                expect(emitter1.stopEmit('other')).toBe(false);
            })
            .on(EVENT_NAME, lOne)
            .emit(EVENT_NAME);

        expect(lOne.calls.count()).toBe(1);
    });

    it('Остановка текущего стека выполнения', function () {
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
