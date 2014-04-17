'use strict';
/**
 * @fileOverview EventEmitter.
 */

/**
 * Наделяет объект событийной моделью.
 * @constructor
 */
function EventEmitter() {
    /**
     * Объект, в котором хранятся обработчики событий.
     * @type {Object}
     * @default null
     * @private
     */
    this._events = null;

    /**
     * Максимальное количество обработчиков для одного события.
     * @type {Number}
     * @default 10
     * @private
     */
    this._maxListeners = EventEmitter.MAX_LISTENERS;
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
 * Останавливает дальнейшее выполнение обработчиков события.
 * @param {Object|EventEmitter} [context] Если аргумент был передан, выполнение будет остановлено только если контекст текущего события будет совпадать с этим объектом.
 * @static
 * @example
 * var EventEmitter = require('EventEmitter');
 * var emitter = new EventEmitter();
 *
 * emitter
 *   .on('event', function () {
 *      // Останавливаем дальнейшее выполнение обработчиков.
 *      EventEmitter.stop();
 *   })
 *   .on('event', function () {
 *      // Этот обработчик никогда не будет вызван.
 *   })
 *   .emit('event');
 *   @returns {Boolean} Возвращает true, если выполнение обработчиков события было остановлено.
 */
EventEmitter.stop = function (context) {
    var event = EventEmitter.event;

    if (context instanceof Object && context !== EventEmitter._context) {
        return false;
    }

    if (event instanceof Event) {
        return event.stopping = true;
    }

    return false;
};

/**
 * Контекст выполнения обработчиков текущего события.
 * @default null
 * @type {Object}
 * @private
 */
EventEmitter._context = null;

/**
 * Устанавливает максимальное количество обработчиков одного события.
 * @param {Number} count
 * @throws {Error} Бросает исключение при некорректном значении count
 */
EventEmitter.prototype.setMaxListeners = function(count) {
    if (typeof count !== 'number' || count < 0 || isNaN(count)) {
        throw new Error('Count must be a positive number');
    }

    this._maxListeners = count;
};

/**
 * Возвращает количество обработчиков определенного события.
 * @param {EventEmitter} emitter Объект {@link EventEmitter}.
 * @param {String} type Тип события
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
 * Устанавливает обработчик события.
 * @param {String|Event} type Тип события.
 * @param {Function|EventEmitter} [listener] Обработчик события.
 * @param {Object} [context=this] Контекст выполнения обработчика.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.on = function (type, listener, context) {
    var
        event,
        _events = this._events,
        _type = type;

    if (!_events) {
        _events = this._events = {};
    }

    if (_type instanceof Event) {
        event = _type;
        _type = event.type;
    } else {
        event = new Event(_type, listener, context);
    }

    if (!_events[_type]) {
        _events[_type] = [];
    }

    if (_events.newListener) {
        this.emit('newListener', _type, event.listener, event.context);
    }

    if (event.context === this) {
        event.context = null;
    }

    _events[_type].push(event);

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
 * @param {String|Event} type Тип события.
 * @param {Function|EventEmitter} [listener] Обработчик события.
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
    return this.on(type instanceof Event ? type : new Event(type, listener, context, true));
};

/**
 * Удаляет обработчик события.
 * @param {String} type Тип события.
 * @param {Function|Event|EventEmitter} [listener] Обработчик, который необходимо удалить.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.off = function (type, listener) {
    var
        _events = this._events,
        events = _events[type],
        event,
        length = events ? events.length : 0,
        index = length,
        position = -1,
        isEvent = listener instanceof Event;

    if (typeof listener === 'function' || listener instanceof EventEmitter || isEvent) {
        while (index--) {
            event = isEvent ? events[index] : events[index].listener;

            if (event === listener) {
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
        throw new Error('Listener must be a function, EventEmitter or EventEmitter.Event');
    }

    return this;
};

/**
 * То же, что и {@link EventEmitter#off}.
 * @param {String} type Тип события.
 * @param {Function|EventEmitter|Event} [listener] Обработчик, который необходимо удалить.
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
        this.removeListener(type, listeners[index]);
    }

    return this;
};

/**
 * Возвращает массив объектов события {@link Event}.
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
 * Генерирует событие. Аргументы, которые были переданы после имени события, будут переданы в обработчики событий.
 * @param {String} type Тип события.
 * @param {...*} [args] Аргументы, передаваемые в обработчик события.
 * @returns {Boolean} Вернет true, если был успешно отработан хотя бы один обработчик события.
 * @example
 * new EventEmitter()
 *   .on('error', function (error) {
 *     throw error; // 'foo'
 *   })
 *   .emit('error', 'foo');
 *   @throws {Error} Бросает исключение, если генерируется событие error и на него не подписан ни один обработчик.
 */
EventEmitter.prototype.emit = function (type, args) {
    var
        _events = this._events,
        events = _events && _events[type],
        length = events ? events.length : 0,
        index = 0,
        argsLength = arguments.length - 1,
        event,
        currentEvent,
        context,
        listener,
        arg,
        error = arguments[1];

    if (type === 'error' && !(events && length)) {
        if (error instanceof Error) {
            // Unhandled 'error' event
            throw error;
        } else {
            throw new Error('Uncaught, unspecified "error" event.');
        }
    }

    if (typeof events === 'undefined') {
        return false;
    }

    if (length && argsLength > 2) {
        arg = new Array(argsLength);

        while (index < argsLength) {
            arg[index++] = arguments[index];
        }

        index = 0;
    }

    currentEvent = EventEmitter.event;

    while (index < length) {
        event = events[index++];

        EventEmitter.event = event;

        if (event.isOnce === true) {
            this.removeListener(type, event);
        }

        context = event.context == null ? this : event.context;
        listener = event.listener;

        EventEmitter._context = context;

        if (typeof listener === 'function') {
            switch (argsLength) {
                // fast cases
                case 0:
                    listener.call(context);
                    break;
                case 1:
                    listener.call(context, arguments[1]);
                    break;
                case 2:
                    listener.call(context, arguments[1], arguments[2]);
                    break;
                // slower
                default:
                    listener.apply(context, arg);
            }
        } else if (listener === this) {
            throw new Error('Can\'t emit on itself');
        } else {
            listener.emit.apply(listener, arguments);
        }

        if (event.stopping === true) {
            break;
        }
    }

    EventEmitter.event = currentEvent;
    EventEmitter._context = null;

    return true;
};

EventEmitter.prototype._events = null;
EventEmitter.prototype._maxListeners = null;

/**
 * Конструктор объекта события.
 * @param {String} type {@link Event#type}
 * @param {Function|EventEmitter} listener {@link Event#listener}
 * @param {Object|null} [context] {@link Event#context}
 * @param {Boolean} [isOnce] {@link Event#isOnce}
 * @name Event
 * @constructor
 * @returns {Event}
 * @throws {Error} Бросает исключение, если обработчик события не является функцией или объектом {@link EventEmitter}.
 */
function Event(type, listener, context, isOnce) {
    if (!(typeof listener === 'function' && (listener instanceof EventEmitter))) {
        throw new Error('Listener must be a function');
    }

    /**
     * Имя события.
     * @type {String}
     */
    this.type = type;
    /**
     * Функция - обработчик события.
     * @type {Function|EventEmitter}
     */
    this.listener = listener;
    /**
     * Контекст выполнения обработчика.
     * @type {Object|null}
     */
    this.context = context;
    /**
     * Флаг, указывающий на то, что это событие одноразовое.
     * @type {Boolean}
     */
    this.isOnce = isOnce;
    /**
     * Флаг, указывающий на то, что необходимо остановить дальнейший вызов обработчиков текущего события.
     * @type {Boolean}
     */
    this.stopping = false;

    return this;
}

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
