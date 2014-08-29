'use strict';
/**
 * @fileOverview EventEmitter.
 */

var _eventStack = [];
var _eventStackIndex = -1;
var _currentEvent = null;
var _currentEmitter = null;

/**
 * Наделяет объект событийной моделью.
 * @constructor
 */
function EventEmitter() {
    this._events = null;
    this._maxListeners = EventEmitter.MAX_LISTENERS;
    this._eventData = null;
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
 * Останавливает выполнение обработчиков события.
 * @param {String} [type]
 * @static
 * @example
 * var EventEmitter = require('EventEmitter');
 * var emitter = new EventEmitter();
 *
 * emitter
 *   .on('event', function () {
 *      // Останавливаем дальнейшее выполнение обработчиков.
 *      EventEmitter.stopEmit();
 *   })
 *   .on('event', function () {
 *      // Этот обработчик никогда не будет вызван.
 *   })
 *   .emit('event');
 *   @returns {Boolean} Возвращает true, если выполнение обработчиков события было остановлено.
 */
EventEmitter.stopEmit = function (type) {
    if (_eventStackIndex >= 0 && (!arguments.length || _currentEvent == type)) {
        return _eventStack[_eventStackIndex] = true;
    }

    return false;
};

/**
 * Объект, в котором хранятся обработчики событий.
 * @type {Object}
 * @default null
 * @protected
 */
EventEmitter.prototype._events = null;

/**
 * Максимальное количество обработчиков для одного события.
 * @type {Number}
 * @default 10
 * @private
 */
EventEmitter.prototype._maxListeners = 10;

/**
 * Аргументы текущего обработчика события.
 * @type {Array}
 * @default null
 * @readonly
 * @protected
 */
EventEmitter.prototype._eventData = null;

/**
 * @param {String} [type]
 * @returns {Boolean}
 */
EventEmitter.prototype.stopEmit = function (type) {
    return _currentEmitter === this ? EventEmitter.stopEmit(type) : false;
};

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
 * @param {String} type Тип события.
 * @param {Function|EventEmitter|Event} listener Обработчик события.
 * @param {Object} [context=this] Контекст выполнения обработчика.
 * @returns {EventEmitter}
 */
EventEmitter.prototype.on = function (type, listener, context) {
    var
        event = (listener instanceof Event) ? listener : new Event(type, listener, context),
        _events = this._events;

    if (!_events) {
        _events = this._events = {};
    }

    if (!_events[type]) {
        _events[type] = [];
    }

    if (_events.newListener) {
        this.emit('newListener', type, event.listener, event.context);
    }

    if (event.context === this) {
        event.context = null;
    }

    _events[type].push(event);

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
 * @param {Function|EventEmitter|Event} listener Обработчик события.
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
    var event = (listener instanceof Event) ? listener : new Event(type, listener, context);
    event.isOnce = true;

    return this.on(type, event);
};

/**
 * Удаляет обработчик события.
 * @param {String} type Тип события.
 * @param {Function|EventEmitter|Event} listener Обработчик, который необходимо удалить.
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

    if (typeof listener === 'function' || typeof listener.emit === 'function' || isEvent) {
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
        this.off(type, listeners[index]);
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
 *   .on('error', function (reason) {
 *     throw reason; // 'foo'
 *   })
 *   .emit('error', 'foo');
 * @throws {Error} Бросает исключение, если генерируется событие error и на него не подписан ни один обработчик.
 */
EventEmitter.prototype.emit = function (type, args) {
    var
        events = this._events && this._events[type],
        eventsLength = events ? events.length : 0,
        argsLength = arguments.length,
        index = argsLength-- && argsLength,
        event,
        context,
        listener,
        currentEvent = _currentEvent,
        currentEmitter = _currentEmitter,
        eventData = new Array(index);

    if (!eventsLength) {
        if (type === 'error') {
            if (args instanceof Error) {
                // Unhandled 'error' event
                throw args;
            } else {
                throw new Error('Uncaught, unspecified "error" event.');
            }
        } else {
            return false;
        }
    }

    while (index) {
        eventData[index - 1] = arguments[index--];
    }

    _eventStackIndex = _eventStack.push(false) - 1;
    _currentEmitter = this;

    while (index < eventsLength) {
        event = events[index];
        listener = event.listener;
        context = event.context == null ? this : event.context;

        _currentEvent = type;

        this._eventData = eventData;

        if (event.isOnce === true) {
            eventsLength--;
            this.off(type, event);
        } else {
            index++;
        }

        if (typeof listener === 'function') {
            if (argsLength) {
                listener.apply(context, eventData);
            } else {
                listener.call(context);
            }
        } else if (typeof listener.emit === 'function') {
            if (argsLength) {
                listener.emit.apply(listener, [event.type || type].concat(eventData));
            } else {
                listener.emit(event.type || type);
            }
        } else {
            throw new Error('Listener must be a function or EventEmitter');
        }

        if (_eventStack[_eventStackIndex]) {
            break;
        }
    }

    _eventStack.length = _eventStackIndex--;
    _currentEvent = currentEvent;
    _currentEmitter = currentEmitter;

    this._eventData = null;

    return true;
};

/**
 *
 * @param {Function|EventEmitter} emitter
 * @param {String} type
 * @param {String} [alias=type]
 * @returns {EventEmitter}
 */
EventEmitter.prototype.delegate = function (emitter, type, alias) {
    if (!alias || type === alias) {
        return this.on(type, emitter);
    } else {
        return this.on(type, new Event(alias, emitter));
    }
};

/**
 * Конструктор объекта события.
 * @param {String|Number|null} type {@link Event#type}
 * @param {Function|EventEmitter} listener {@link Event#listener}
 * @param {Object|null} [context=null] {@link Event#context}
 * @param {Boolean} [isOnce=false] {@link Event#isOnce}
 * @name Event
 * @constructor
 * @returns {Event}
 * @throws {Error} Бросает исключение, если обработчик события не является функцией или объектом {@link EventEmitter}.
 */
function Event(type, listener, context, isOnce) {
    if (typeof listener !== 'function' && typeof listener.emit !== 'function') {
        throw new Error('Listener must be a function or EventEmitter');
    }

    this.type = type;
    this.listener = listener;
    this.context = context || null;
    this.isOnce = isOnce || false;

    return this;
}

/**
 * Имя события.
 * @type {String}
 * @default null
 */
Event.prototype.type = null;

/**
 * Обработчик события.
 * @type {Function|EventEmitter}
 * @default null
 */
Event.prototype.listener = null;

/**
 * Контекст выполнения обработчика.
 * @type {Object|null}
 * @default null
 */
Event.prototype.context = null;

/**
 * Флаг, указывающий на то, что это событие одноразовое.
 * @type {Boolean}
 * @default false
 */
Event.prototype.isOnce = false;

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
