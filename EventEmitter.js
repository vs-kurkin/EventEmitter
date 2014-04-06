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
        throw new Error('count must be a positive number');
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
 * @param {String|EventEmitter.Event} type Тип события.
 * @param {Function} [listener] Обработчик события.
 * @param {Object|null} [context] Контекст выполнения обработчика.
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
 * @param {Function} listener Обработчик события.
 * @param {Object|null} [context] Контекст выполнения обработчика.
 * @function
 * @returns {EventEmitter}
 */
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

/**
 * Устанавливает одноразовый обработчик события.
 * @param {String|EventEmitter.Event} type Тип события.
 * @param {Function} [listener] Обработчик события.
 * @param {Object|null} [context] Контекст выполнения обработчика.
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
        isEmitter = listener instanceof EventEmitter,
        isEvent = listener instanceof Event,
        isFunction = typeof listener === 'function';

    if (isFunction || isEvent || isEmitter) {
        while (index--) {
            event = isFunction ? events[index].listener : isEvent ? events[index] : events[index].delegate;

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
        throw new Error('listener must be a function, EventEmitter or EventEmitter.Event');
    }

    return this;
};

/**
 * То же, что и {@link EventEmitter#off}.
 * @param {String} type Тип события.
 * @param {Function|EventEmitter|EventEmitter.Event} [listener] Обработчик, который необходимо удалить.
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
 * Возвращает массив объектов события {@link EventEmitter.Event}.
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

    while (index < length) {
        event = events[index++];

        EventEmitter.event = event;

        if (event.isOnce === true) {
            this.removeListener(type, event);
        }

        context = event.context instanceof Object ? event.context : this;
        listener = event.listener;

        EventEmitter._context = context;

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

        if (event.stopping === true) {
            break;
        }
    }

    EventEmitter.event = null;
    EventEmitter._context = null;

    return true;
};

/**
 * Делегирует событие на другой экземпляр {@link EventEmitter}.
 * Другими словами, каждый раз при возникновении события <i>type</i> на исходном объекте,
 * автоматически будет генерироваться событие <i>alias</i> на объекте <i>delegate</i> с аргументами из исходного события.
 * @param {EventEmitter} emitter Объект, на котором нужно генерировать делегированное событие.
 * @param {String} type Имя события, которое нужно делегировать.
 * @param {String} [alias=type] Имя события, которое будет сгенерировано на объекте delegate. По-умолчанию имя совпадает со значением, переданным в type.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.delegate = function (emitter, type, alias) {
    if (typeof type === 'string') {
        this.on(new Event(type, delegate, this, false, emitter, alias));
    }

    return this;
};

EventEmitter.prototype._events = null;
EventEmitter.prototype._maxListeners = null;

/**
 * Конструктор объекта события.
 * @param {String} type {@link EventEmitter.Event#type}
 * @param {Function} listener {@link EventEmitter.Event#listener}
 * @param {Object|null} [context] {@link EventEmitter.Event#context}
 * @param {Boolean} [isOnce] {@link EventEmitter.Event#isOnce}
 * @param {EventEmitter} [delegate] {@link EventEmitter.Event#delegate}
 * @param {String} [alias] {@link EventEmitter.Event#alias}
 * @name EventEmitter.Event
 * @constructor
 * @returns {EventEmitter.Event}
 * @throws {Error} Бросает исключение, если обработчик события не является функцией.
 */
function Event(type, listener, context, isOnce, delegate, alias) {
    if (typeof listener !== 'function') {
        throw new Error('listener must be a function');
    }

    /**
     * Имя события.
     * @type {String}
     */
    this.type = type;
    /**
     * Функция - обработчик события.
     * @type {Function}
     */
    this.listener = listener;
    /**
     * Контекст выполнения обработчика.
     * @type {Object|null}
     */
    this.context = context;
    /**
     * Объект, на который будет делегироваться событие.
     * @type {EventEmitter}
     */
    this.delegate = delegate;
    /**
     * Флаг, указывающий на то, что это событие одноразовое.
     * @type {Boolean}
     */
    this.isOnce = isOnce;
    /**
     * Алиас имени делегируемого события.
     * @type {String}
     */
    this.alias = alias;
    /**
     * Флаг, указывающий на то, что необходимо остановить дальнейший вызов обработчиков текущего события.
     * @type {Boolean}
     */
    this.stopping = false;

    return this;
}

EventEmitter.Event = Event;

/**
 * Exports: {@link EventEmitter}
 * @exports EventEmitter
 */
module.exports = EventEmitter;

function delegate() {
    var args;
    var event = EventEmitter.event;
    var emitter = event instanceof Event && event.delegate;
    var type;
    var argsLength;
    var index = 0;
    var arg;

    argsLength = arguments.length;
    type = typeof event.alias === 'string' ? event.alias : event.type;

    if (argsLength) {
        args = new Array(argsLength + 1);
        args[index] = type;

        while (index < argsLength) {
            arg = arguments[index++];
            args[index] = arg;
        }

        emitter.emit.apply(emitter, args);
    } else {
        emitter.emit(type);
    }
}
