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
    this._maxListeners = EventEmitter.MAX_LISTENERS;
    this.event = null;
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
    if (emitter instanceof EventEmitter && emitter._events && emitter._events[type]) {
        return emitter._events[type].length;
    } else {
        return 0;
    }
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
EventEmitter.prototype.event = null;

/**
 * Максимальное количество обработчиков для одного события.
 * @type {Number}
 * @default 10
 * @private
 */
EventEmitter.prototype._maxListeners = 10;

/**
 * Останавливает выполение обработчиков текущего события, если оно произошло на текущем объекте.
 * @param {String|Number} [type] Если передан тип и он не соответствует текущему типу события, выполнение не будет остановлено.
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
    var event = this.event;

    if (event && (!arguments.length || event.type == type)) {
        return event.stop = true;
    }

    return false;
};

/**
 * Заменяет данные события, если оно есть.
 * @param {Array} data
 * @example
 * new EventEmitter()
 *   .on('event', function (data) {
 *     data; // 'foo'
 *     this.setEventData(['bar']);
 *   })
 *   .on('event', function (data) {
 *     data; // 'bar'
 *   })
 *   .emit('event', 'foo');
 */
EventEmitter.prototype.setEventData = function (data) {
    var event = this.event;

    if (event && typeof data === 'object' && typeof data.length === 'number') {
        event.data = data;
    }

    return this;
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
EventEmitter.prototype.updateEventData = function (args) {
    var length = arguments.length;
    var data = this.event && this.event.data;

    if (data) {
        data.length = length;

        while (length--) {
            data[length] = arguments[length];
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
 * @param {Function|EventEmitter|Listener} listener Обработчик события.
 * @param {Object} [context=this] Контекст выполнения обработчика.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.on = function (type, listener, context) {
    var
        _listener = (listener instanceof Listener) ? listener : new Listener(type, listener, context),
        _events = this._events;

    if (!_events) {
        _events = this._events = {};
    }

    if (!_events[type]) {
        _events[type] = [];
    }

    if (_events.newListener) {
        this.emit('newListener', type, _listener.callback, _listener.context || this);
    }

    if (_listener.context === this) {
        _listener.context = null;
    }

    _events[type].push(_listener);

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
 * @param {Function|EventEmitter|Listener} listener Обработчик события.
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
    var _listener = (listener instanceof Listener) ? listener : new Listener(type, listener, context);
    _listener.isOnce = true;

    return this.on(type, _listener);
};

/**
 * Удаляет обработчик события.
 * @param {String} type Тип события.
 * @param {Function|EventEmitter|Listener} listener Обработчик, который необходимо удалить.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.off = function (type, listener) {
    var _events = this._events;

    if (!(_events && _events[type])) {
        return this;
    }

    var
        events = _events[type],
        _listener,
        length = events.length,
        index = length,
        position = -1,
        isListener = listener instanceof Listener;

    if (typeof listener === 'function' || typeof listener.emit === 'function' || isListener) {
        while (index--) {
            _listener = isListener ? events[index] : events[index].callback;

            if (_listener === listener) {
                position = index;
                break;
            }
        }

        if (position < 0) {
            return this;
        }

        if (length === 1) {
            events.length = 0;
            delete _events[type];
        } else {
            events.splice(position, 1);
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
 * @param {Function|EventEmitter|Listener} [listener] Обработчик, который необходимо удалить.
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
    var
        _events = this._events,
        key,
        listeners,
        index;

    if (!_events) {
        return this;
    }

    if (!this._events.removeListener) {
        if (arguments.length === 0) {
            this._events = {};
        } else if (this._events[type]) {
            delete this._events[type];
        }

        return this;
    }

    if (arguments.length === 0) {
        for (key in _events) {
            if (key !== 'removeListener' && _events.hasOwnProperty(key)) {
                this.removeAllListeners(key);
            }
        }

        this.removeAllListeners('removeListener');
        this._events = {};

        return this;
    }

    listeners = this._events[type];
    index = listeners.length;

    while (index--) {
        this.off(type, listeners[index]);
    }

    return this;
};

/**
 * Возвращает массив объектов события {@link Listener}.
 * @param {String} [type] Тип события.
 * @returns {Array} Массив объектов события.
 */
EventEmitter.prototype.listeners = function (type) {
    var _events = this._events;

    if (!_events) {
        _events = this._events = {};
    }

    if (typeof type === 'string' && !_events[type]) {
        _events[type] = [];
    }

    return _events[type];
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
    var event;

    if (length === 0) {
        if (type === 'error') {
            if (args instanceof Error) {
                throw args;
            } else {
                throw new Error('Uncaught, unspecified "error" event.');
            }
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
    event = this.event = new Event(type, data);

    while (index) {
        listeners[--index] = events[index];
    }

    while (index < length) {
        listener = listeners[index++];
        callback = listener.callback;

        if (listener.isOnce === true) {
            this.off(type, listener);
        }

        if (typeof callback === 'function') {
            call(callback, listener.context == null ? this : listener.context, event.data);
        } else {
            emit(callback, listener.type || type, event.data);
        }

        if (event.stop) {
            break;
        }
    }

    this.event = null;

    return true;
};

/**
 * Назначает делегирование события на другой экземпляр {@link EventEmitter}.
 * @param {Function|EventEmitter} emitter Объект, на который необходимо делегировать событие type.
 * @param {String} type Тип события, которое должно делегироваться.
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
EventEmitter.prototype.delegate = function (emitter, type, alias) {
    if (alias == null || alias === type) {
        return this.on(type, emitter);
    } else {
        return this.on(type, new Listener(alias, emitter));
    }
};

/**
 * Останавливает делегирование события на другой экземпляр {@link EventEmitter}.
 * @param {Function|EventEmitter} emitter Объект, на который необходимо прекратить делегирование.
 * @param {String} type Тип события.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.unDelegate = function (emitter, type) {
    return this.off(type, emitter);
};

/**
 * Конструктор обработчика события.
 * @param {String|Number|null} type {@link Listener#type}
 * @param {Function|EventEmitter} callback {@link Listener#callback}
 * @param {Object|null} [context=null] {@link Listener#context}
 * @param {Boolean} [isOnce=false] {@link Listener#isOnce}
 * @name Listener
 * @constructor
 * @returns {Listener}
 * @throws {Error} Бросает исключение, если обработчик события не является функцией или объектом {@link EventEmitter}.
 */
function Listener(type, callback, context, isOnce) {
    if (typeof callback !== 'function' && typeof callback.emit !== 'function') {
        throw new Error(LISTENER_TYPE_ERROR);
    }

    this.type = type;
    this.callback = callback;
    this.context = context || null;
    this.isOnce = isOnce || false;

    return this;
}

/**
 * Имя события.
 * @type {String}
 * @default null
 */
Listener.prototype.type = null;

/**
 * Обработчик события.
 * @type {Function|EventEmitter}
 * @default null
 */
Listener.prototype.callback = null;

/**
 * Контекст выполнения обработчика.
 * @type {Object|null}
 * @default null
 */
Listener.prototype.context = null;

/**
 * Флаг, указывающий на то, что это событие одноразовое.
 * @type {Boolean}
 * @default false
 */
Listener.prototype.isOnce = false;

/**
 * @name {EventEmitter.Listener}
 * @type {Listener}
 */
EventEmitter.Listener = Listener;

function Event(type, data) {
    this.type = type;
    this.data = data;
    this.stop = false;
}

/**
 *
 * @type {String|Number}
 */
Event.prototype.type = null;

/**
 *
 * @type {Array}
 */
Event.prototype.data = null;

/**
 *
 * @type {Boolean}
 * @default false
 */
Event.prototype.stop = false;

/**
 * @name {EventEmitter.Event}
 * @type {Event}
 */
EventEmitter.Event = Event;

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
