var Benchmark = require('benchmark');
var EventEmitter = require('../../EventEmitter');
var NativeEventEmitter = require('events').EventEmitter;

var EVENT_NAME = 'event';
var emitter;

var suits = [
    {
        name: 'Create instance',
        native: function () {
            new NativeEventEmitter();
        },
        custom: function () {
            new EventEmitter();
        }
    },
    {
        name: 'Create & basic subscription',
        native: createNativeEmitter,
        custom: createEmitter
    },
    {
        name: 'Create & once subscription',
        native: function () {
            new NativeEventEmitter().once(EVENT_NAME, listener);
        },
        custom: function () {
            new EventEmitter().once(EVENT_NAME, listener);
        }
    },
    {
        name: 'Create, subscribe & unsubscribe',
        native: function () {
            new NativeEventEmitter()
                .on(EVENT_NAME, listener)
                .removeListener(EVENT_NAME, listener);
        },
        custom: function () {
            new EventEmitter()
                .on(EVENT_NAME, listener)
                .removeListener(EVENT_NAME, listener);
        }
    },
    {
        name: 'Create, subscribe & all unsubscribe',
        native: function () {
            new NativeEventEmitter()
                .on(EVENT_NAME, listener)
                .removeAllListeners(EVENT_NAME);
        },
        custom: function () {
            new EventEmitter()
                .on(EVENT_NAME, listener)
                .removeAllListeners(EVENT_NAME);
        }
    },
    {
        name: 'Emit one listener without params',
        fn: function () {
            emitter.emit(EVENT_NAME);
        },
        native: {
            onStart: createNativeEmitter
        },
        custom: {
            onStart: createEmitter
        }
    },
    {
        name: 'Emit one listener with two params',
        fn: function () {
            emitter.emit(EVENT_NAME, 1, 2);
        },
        native: {
            onStart: createNativeEmitter
        },
        custom: {
            onStart: createEmitter
        }
    },
    {
        name: 'Emit three listeners without params',
        fn: function () {
            emitter.emit(EVENT_NAME);
        },
        native: {
            onStart: createNativeWithThreeListeners
        },
        custom: {
            onStart: createWithTreeListeners
        }
    },
    {
        name: 'Emit three listeners with two params',
        fn: function () {
            emitter.emit(EVENT_NAME, 1, 2);
        },
        native: {
            onStart: createNativeWithThreeListeners
        },
        custom: {
            onStart: createWithTreeListeners
        }
    },
    {
        name: 'Emit three listeners with five params',
        fn: function () {
            emitter.emit(EVENT_NAME, 1, 2, 3, 4, 5);
        },
        native: {
            onStart: createNativeWithThreeListeners
        },
        custom: {
            onStart: createWithTreeListeners
        }
    },
    {
        name: 'Get one listener',
        fn: function () {
            emitter.listeners(EVENT_NAME);
        },
        native: {
            onStart: createNativeEmitter
        },
        custom: {
            onStart: createEmitter
        }
    },
    {
        name: 'Get several listeners',
        fn: function () {
            emitter.listeners(EVENT_NAME);
        },
        native: {
            onStart: function () {
                emitter = new NativeEventEmitter()
                    .on(EVENT_NAME, listener)
                    .on(EVENT_NAME, listener);
            }
        },
        custom: {
            onStart: function () {
                emitter = new EventEmitter()
                    .on(EVENT_NAME, listener)
                    .on(EVENT_NAME, listener);
            }
        }
    },
    {
        name: 'Get listeners count',
        native: {
            fn: function () {
                NativeEventEmitter.listenerCount(emitter, EVENT_NAME);
            },
            onStart: createNativeEmitter
        },
        custom: {
            fn: function () {
                EventEmitter.listenerCount(emitter, EVENT_NAME);
            },
            onStart: createEmitter
        }
    }
];

function createEmitter() {
    return emitter = new EventEmitter().on(EVENT_NAME, listener);
}

function createNativeEmitter() {
    return emitter = new NativeEventEmitter().on(EVENT_NAME, listener);
}

function createWithTreeListeners() {
    createEmitter()
        .on(EVENT_NAME, listener)
        .on(EVENT_NAME, listener);
}

function createNativeWithThreeListeners() {
    createNativeEmitter()
        .on(EVENT_NAME, listener)
        .on(EVENT_NAME, listener);
}

function onStart() {
    console.log(this.name + ':');
}

function onCycle(event) {
    console.log('\t' + String(event.target));
}

function onComplete() {
    console.log('\tFastest is "' + this.filter('fastest').pluck('name') + '"\n');
}

function listener() {

}

var length = suits.length;
var index = 0;

while (index < length) {
    var suit = suits[index++];

    new Benchmark.Suite(suit.name)
        .add('Custom', suit.fn || suit.custom, suit.custom)
        .add('Native', suit.fn || suit.native, suit.native)
        .on('start', onStart)
        .on('cycle', onCycle)
        .on('complete', onComplete)
        .run();
}
