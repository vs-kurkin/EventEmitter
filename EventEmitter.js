'use strict';
/**
 * @fileOverview EventEmitter.
 */
var LISTENER_TYPE_ERROR = 'Listener must be a function or EventEmitter';

/**
 * Наделяет объект событийной моделью.
 * @constructor
 */
function EventEmitter() {
    this._events = null;
    this._maxListeners = this._maxListeners;
    this._event = null;
}

/**
 * Количество обработчиков одного события по-умолчанию.
 * @static
 * @const
 * @default 10
 * @type {Number}
 */
EventEmitter.MAX_LISTENERS = 10;

/**
 * Имя события добавления нового обработчика.
 * @static
 * @const
 * @default 'newListener'
 * @type {String}
 */
EventEmitter.EVENT_NEW_LISTENER = 'newListener';

/**
 * Имя события добавления нового обработчика.
 * @static
 * @const
 * @default 'newListener'
 * @type {String}
 */
EventEmitter.EVENT_REMOVE_LISTENER = 'removeListener';

/**
 * Возвращает количество обработчиков определенного события.
 * @param {EventEmitter} emitter Объект {@link EventEmitter}.
 * @param {String} type Тип события.
 * @returns {number}
 */
EventEmitter.listenerCount = function (emitter, type) {
    var listeners = emitter._events && emitter._events[type];

    return listeners ? listeners.length : 0;
};

/**
 * Объект, в котором хранятся обработчики событий.
 * @type {Object}
 * @default null
 * @protected
 */
EventEmitter.prototype._events = null;

/**
 * Объект события.
 * @type {Event}
 * @default null
 * @protected
 */
EventEmitter.prototype._event = null;

/**
 * Максимальное количество обработчиков для одного события.
 * @type {Number}
 * @default 10
 * @private
 */
EventEmitter.prototype._maxListeners = EventEmitter.MAX_LISTENERS;

/**
 * Останавливает выполение обработчиков события.
 * @param {String|Number} [type] Если передан тип и он не соответствует типу выполняемого события,
 *                               выполнение не будет остановлено.
 * @example
 * var EventEmitter = require('EventEmitter');
 *
 * new EventEmitter()
 *   .on('event', function () {
 *      new EventEmitter().stopEmit(); // false
 *      this.stopEmit(); // true
 *   })
 *   .emit('event');
 * @returns {Boolean} Возвращает true, если выполнение обработчиков события было остановлено.
 */
EventEmitter.prototype.stopEmit = function (type) {
    var _event = this._event;

    if (_event && (!arguments.length || _event.type == type)) {
        return _event.stop = true;
    }

    return false;
};

/**
 * Заменяет данные события, если оно есть.
 * @param {...*} [args]
 * @example
 * new EventEmitter()
 *   .on('event', function (data) {
 *     data; // 'foo'
 *     this.updateEventData('bar');
 *   })
 *   .on('event', function (data) {
 *     data; // 'bar'
 *   })
 *   .emit('event', 'foo');
 */
EventEmitter.prototype.setEventData = function (args) {
    var length = arguments.length;
    var data = this._event && this._event.data;

    if (data) {
        data.length = length;

        while (length) {
            data[--length] = arguments[length];
        }
    }

    return this;
};

/**
 * Устанавливает максимальное количество обработчиков одного события.
 * @param {Number} count Новое количество обработчиков.
 * @throws {Error} Бросает исключение при некорректном значении count.
 */
EventEmitter.prototype.setMaxListeners = function (count) {
    if (typeof count !== 'number' || count < 0 || isNaN(count)) {
        throw new Error('Count must be a positive number');
    }

    this._maxListeners = count;
};

/**
 * Устанавливает обработчик события.
 * @param {String} type Тип события.
 * @param {Function|EventEmitter} listener Обработчик события.
 * @param {Object} [context=this] Контекст выполнения обработчика.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.on = function (type, listener, context) {
    if (!(isFunction(listener) || isFunction(listener.emit))) {
        throw new Error(LISTENER_TYPE_ERROR);
    }

    var _events = this._events || (this._events = {});
    var listeners = _events[type] || (_events[type] = new Array(0));

    if (_events.newListener) {
        this.emit('newListener', type, listener, context == null ? this : context);
    }

    listeners[listeners.length] = {
        type: type,
        callback: listener,
        context: context,
        isOnce: false
    };

    return this;
};


/**
 * То же, что и {@link EventEmitter#on}.
 * @param {String} type Тип события.
 * @param {Function|EventEmitter} listener Обработчик события.
 * @param {Object|null} [context] Контекст выполнения обработчика.
 * @function
 * @returns {EventEmitter}
 */
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

/**
 * Устанавливает одноразовый обработчик события.
 * @param {String} type Тип события.
 * @param {Function|EventEmitter} listener Обработчик события.
 * @param {Object|null} [context=this] Контекст выполнения обработчика.
 * @returns {EventEmitter}
 * @example
 * new EventEmitter()
 *   .once('type', function () {
 *     // Обработчик выполнится только один раз
 *   })
 *   .emit('type')
 *   .emit('type');
 */
EventEmitter.prototype.once = function (type, listener, context) {
    this.on(type, listener, context);

    getLastListener(this, type).isOnce = true;

    return this;
};

/**
 * Удаляет обработчик события.
 * @param {String} type Тип события.
 * @param {Function|EventEmitter} listener Обработчик, который необходимо удалить.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.off = function (type, listener) {
    var _events = this._events;
    var listeners = _events && _events[type];

    if (!listeners) {
        return this;
    }

    if (isFunction(listener) || isFunction(listener.emit)) {
        var length = listeners.length;
        var index = length;

        while (index--) {
            if (listeners[index].callback === listener) {
                break;
            }
        }

        if (index < 0) {
            return this;
        }

        if (length === 1) {
            listeners.length = 0;
            delete listeners[type];
        } else {
            listeners.splice(index, 1);
        }

        if (_events.removeListener) {
            this.emit('removeListener', type, listener);
        }
    } else {
        throw new Error(LISTENER_TYPE_ERROR);
    }

    return this;
};

/**
 * То же, что и {@link EventEmitter#off}.
 * @param {String} type Тип события.
 * @param {Function|EventEmitter} [listener] Обработчик, который необходимо удалить.
 * @function
 * @returns {EventEmitter}
 */
EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

/**
 * Если был передан тип события, метод работает аналогично {@link EventEmitter#off}, иначе удаляет все обработчики для всех событий.
 * @param {String} [type] Тип события.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.removeAllListeners = function (type) {
    var _events = this._events;
    var key;
    var listeners;
    var index;
    var callback;

    if (!_events) {
        return this;
    }

    if (!_events.removeListener) {
        if (arguments.length === 0) {
            this._events = {};
        } else if (_events[type]) {
            delete _events[type];
        }

        return this;
    }

    if (arguments.length === 0) {
        for (key in _events) {
            if (key === 'removeListener') {
                continue;
            }

            this.removeAllListeners(key);
        }

        this.removeAllListeners('removeListener');
        this._events = {};

        return this;
    }

    listeners = _events[type];
    index = listeners.length;

    while (index) {
        callback = listeners[--index].callback;
        listeners.length = index;

        this.emit('removeListener', type, callback);
    }

    delete _events[type];

    return this;
};

/**
 * Возвращает массив обработчиков события.
 * @param {String|Number} [type] Тип события.
 * @returns {Array} Массив объектов события.
 */
EventEmitter.prototype.listeners = function (type) {
    var _events = this._events;
    var listeners = _events && _events[type];

    if (listeners) {
        var length = listeners.length;
        var res = new Array(length);

        while (length) {
            res[--length] = listeners[length].callback;
        }

        return res;
    } else {
        return new Array(0);
    }
};

/**
 * Генерирует событие.
 * @param {String} type Тип события.
 * @param {...*} [args] Аргументы, которые будут переданы в обработчик события.
 * @returns {Boolean} Вернет true, если был отработан хотя бы один обработчик события.
 * @example
 * new EventEmitter()
 *   .on('error', function (reason) {
 *     throw reason; // 'foo'
 *   })
 *   .emit('error', 'foo');
 * @throws {Error} Бросает исключение, если генерируется событие error и на него не подписан ни один обработчик.
 */
EventEmitter.prototype.emit = function (type, args) {
    var events = this._events && this._events[type];
    var length = events && events.length;
    var index;
    var data;
    var listener;
    var callback;
    var listeners;
    var currentEvent;
    var _event;

    if (!length) {
        if (type === 'error') {
            throw (args instanceof Error) ? args : new Error('Uncaught, unspecified "error" event.');
        } else {
            return false;
        }
    }

    index = arguments.length && arguments.length - 1;
    data  = new Array(index);

    while (index) {
        data[index - 1] = arguments[index--];
    }

    index = length;
    listeners = new Array(length);
    currentEvent = this._event;
    _event = this._event = {
        type: type,
        data: data,
        stop: false
    };

    while (index) {
        listeners[--index] = events[index];
    }

    while (index < length) {
        listener = listeners[index++];
        callback = listener.callback;

        if (listener.isOnce === true) {
            this.off(type, callback);
        }

        if (isFunction(callback)) {
            call(callback, listener.context == null ? this : listener.context, _event.data);
        } else {
            emit(callback, listener.type || type, _event.data);
        }

        if (_event.stop) {
            break;
        }
    }

    this._event = currentEvent;

    return true;
};

/**
 * Назначает делегирование события на другой экземпляр {@link EventEmitter}.
 * @param {String} type Тип события, которое должно делегироваться.
 * @param {EventEmitter} emitter Объект, на который необходимо делегировать событие type.
 * @param {String} [alias=type] Тип события, которое должно возникать на объекте emitter.
 * @example
 * var emitter1 = new EventEmitter();
 * var emitter2 = new EventEmitter();
 *
 * emitter2
 *   .on('some', function (result) {
 *     // result is 'foo'
 *   });
 *
 * emitter1
 *   .delegate(emitter2, 'event', 'some')
 *   .emit('event', 'foo');
 *
 * @returns {EventEmitter}
 */
EventEmitter.prototype.delegate = function (type, emitter, alias) {
    this.on(type, emitter);

    if (!(alias == null || alias === type)) {
        getLastListener(this, type).type = alias;

        return this;
    }
};

/**
 * Останавливает делегирование события на другой экземпляр {@link EventEmitter}.
 * @param {String} type Тип события.
 * @param {EventEmitter} emitter Объект, на который необходимо прекратить делегирование.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.unDelegate = EventEmitter.prototype.off;

/**
 * Exports: {@link EventEmitter}
 * @exports EventEmitter
 */
module.exports = EventEmitter;

function call(listener, context, data) {
    switch (data.length) {
        case 0:
            listener.call(context);
            break;
        case 1:
            listener.call(context, data[0]);
            break;
        case 2:
            listener.call(context, data[0], data[1]);
            break;
        case 3:
            listener.call(context, data[0], data[1], data[2]);
            break;
        default:
            listener.apply(context, data);
    }
}

function emit(emitter, type, data) {
    switch (data.length) {
        case 0:
            emitter.emit(type);
            break;
        case 1:
            emitter.emit(type, data[0]);
            break;
        case 2:
            emitter.emit(type, data[0], data[1]);
            break;
        case 3:
            emitter.emit(type, data[0], data[1], data[2]);
            break;
        default:
            var a = new Array(1);
            a[0] = type;
            emitter.emit.apply(emitter, a.concat(data));
    }
}

function isFunction(fnc) {
    return typeof fnc === 'function';
}

function getLastListener(emitter, type) {
    var listeners = emitter._events[type];

    return listeners[listeners.length - 1];
}
