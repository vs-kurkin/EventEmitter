'use strict';

var EventEmitter = require('../EventEmitter');

/* globals describe, it, expect */

describe('Экспорт API', function () {
    it('EventEmitter', function () {
        return expect(typeof EventEmitter).toBe('function');
    });

    it('EventEmitter.Event', function () {
        return expect(typeof EventEmitter.Event).toBe('function');
    });

    it('EventEmitter.EVENT_NEW_LISTENER', function () {
        return expect(EventEmitter.EVENT_NEW_LISTENER).toBe('newListener');
    });

    it('EventEmitter.EVENT_REMOVE_LISTENER', function () {
        return expect(EventEmitter.EVENT_REMOVE_LISTENER).toBe('removeListener');
    });
});

describe('Остановка выполнения обработчиков события', function () {
    it('Остановка выполнения текущего события', function () {
        var emitter = new EventEmitter();
        var emitter2 = new EventEmitter();
        var r;

        emitter
            .on('event', function () {
                expect(EventEmitter.stopEmit()).toBe(true);
                expect(this.stopEmit()).toBe(true);
                expect(this.stopEmit('event')).toBe(true);

                expect(emitter2.stopEmit()).toBe(false);
                expect(emitter2.stopEmit('event')).toBe(false);

                r = true;
            })
            .on('event', function () {
                r = false;
            })
            .emit('event');

        expect(r).toBe(true);
    });

    it('Остановка выполнения другого события', function () {
        var emitter = new EventEmitter();
        var r;

        emitter
            .on('event', function () {
                expect(EventEmitter.stopEmit('some')).toBe(false);
                expect(this.stopEmit('some')).toBe(false);

                r = true;
            })
            .on('event', function () {
                r = false;
            })
            .emit('event');

        expect(r).toBe(false);
    });

    it('Остановка текущего стека выполнения', function () {
        var emitter = new EventEmitter();
        var r = '';

        emitter
            .on('ready', function () {
                expect(EventEmitter.stopEmit()).toBe(true);
                expect(EventEmitter.stopEmit('ready')).toBe(true);
                expect(EventEmitter.stopEmit('event')).toBe(false);

                expect(this.stopEmit()).toBe(true);
                expect(this.stopEmit('ready')).toBe(true);
                expect(this.stopEmit('event')).toBe(false);

                this.emit('event');
            })
            .on('event', function () {
                r += 'a';
            })
            .on('event', function () {
                r += 'b';
            })
            .on('ready', function () {
                r += 'c';
            })
            .emit('ready');

        return expect(r).toBe('ab');
    });

    it('Остановка текущего стека выполнения', function () {
        var emitter = new EventEmitter();
        var r = '';

        emitter
            .on('ready', function () {
                this.emit('event');
            })
            .on('event', function () {
                r += 'a';
                expect(EventEmitter.stopEmit()).toBe(true);
            })
            .on('event', function () {
                r += 'b';
            })
            .on('ready', function () {
                r += 'c';
            })
            .emit('ready');

        return expect(r).toBe('ac');
    });
});
