EventEmitter
============

Расширенная обратносовместимая реализация модуля [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) из стандартной библиотеки `NodeJS`.
Дополнительное API направлено на повышение удобства разработки и читаемости кода.
Этого можно добиться, в первую очередь, за счет избавления от вынужденных замыканий.
Для этого были внедрены такие механизмы, как [контекст обработчиков событий](#context), [делегирование](#delegate) и [остановка выполнения обработчиков](#stopEmit).

##Отличия от оригинала:
### Стандартные события:
 * `EventEmitter.MAX_LISTENERS = 10`
 <br />Максимальное количество обработчиков события по-умолчанию.
 * `EventEmitter.EVENT_NEW_LISTENER = 'newListener'`
 <br />Имя события, которое срабатывает при добавлении нового обработчика.
 * `EventEmitter.EVENT_REMOVE_LISTENER = 'removeListener'`
 <br />Имя события, которое срабатывает при удалении обработчика.
 
В обработчик события `EventEmitter.EVENT_NEW_LISTENER` передается три аргумента:
 * `{String|Number} type`
 <br />Тип события, на которое был добавлен обработчик.
 * `{Function} callback`
 <br />Функция-обработчик события.
 * `{*} context`
 <br />Контекст, в котором будет вызвана функция-обработчик.
 
### <a name="context"></a>Расширенное API подписки на события
Методы подписки на события имеют расширенное API, а так же новый метод `EventEmitter#off`:

 * `{EventEmitter} EventEmitter#addListener(type, listener[, context])`
 * `{EventEmitter} EventEmitter#on(type, listener[, context])`
 * `{EventEmitter} EventEmitter#once(type, listener[, context])`
 * `{EventEmitter} EventEmitter#removeListener(type, listener)`
 * `{EventEmitter} EventEmitter#off(type, listener)`

Здесь:
 * `{String|Number} type`
 <br />Тип события.
 * `{Function|EventEmitter} listener`
 <br />Обработчик события. В отличии от оригинального `EventEmitter`,
  обработчиком события может быть другой экземпляр `EventEmitter`. В этом случае, вместо вызова функции,
  произойдет вызов одноименного события на объекте-слушателе с передачей всех аргументов оригинального события.
  На этом основано [делегирование событий](#delegate), описанное в методе `EventEmitter#delegate`. Что бы отвязать объект-слушатель,
  его нужно передать в соответствующий метод удаления обработчика.
 * `{Object|null} [context=this]`
 <br />Необязательный аргумент, задает контекст обработчика события.
 
### Объект события
При вызове метода `EventEmitter#emit`, переданные параметры (кроме типа события) сохраняются в массиве `EventEmitter#_eventData`.
Это означает, что по ходу выполнения события, можно изменять набор агрументов, которые передаются в обработчики:

```js
new EventEmitter()
  .on('event', function (foo) {
    foo === 'bar'; // true
    this._eventData[0] = 'baz';
  })
  .on('event', function (foo) {
    foo === 'baz'; // true
  })
  .emit('event', 'bar');
```

### <a name="delegate"></a>Делегирование событий
Делегирование удобно, если необходимо вызвать событие на одном объекте, когда происходит событие на другом.
В оригинальном API пришлось бы написать примерно это:

```js
var emitter = new EventEmitter();
var listener = new EventEmitter();

listener
  .on('otherEvent', function (foo) {
    foo === 'bar'; // true
  });

emitter
  .on('event', function (foo) {
    listener.emit('otherEvent', foo);
  })
  .emit('event', 'bar');
```

Для подобных ситуаций существует два метода:
 * `{EventEmitter} EventEmitter#delegate(type, emitter[, alias=type])`
 <br />Делегирует событие `type` на объект `emitter`.
  Необязательным аргументом задается имя события, которое будет вызвано на объекте `emitter`.
 * `{EventEmitter} EventEmitter#unDelegate(type, emitter)`
 <br />Снимает делегирование события `type` на объект `emitter`.
 
Вышепреведенный пример теперь можно записать так:

```js
var emitter = new EventEmitter();
var listener = new EventEmitter();

listener
  .on('someEvent', function (foo) {
    foo === 'bar'; // true
  });

emitter
  .delegate('event', listener, 'someEvent')
  .emit('event', 'bar');
```

Стоит добавить, что следующие строки:
```js
emitter.delegate('event', listener);
emitter.delegate('event', listener, 'event');
```
эквивалентны записи:
```js
emitter.on('event', listener);
```

### <a name="stopEmit"></a>Остановка выполнения обработчиков событий
Стандартное API предполагает безоговорочное выполнение всех обработчиков событий.
Возможность остановки выполнения дает дополнительную гибкость в написании логики обработчиков событий.

 * `{Boolean} EventEmitter#stopEmit([type])`
 <br />Останавливает выполнение обработчиков события текущего объекта.
 В этом методе так же доступна фильтрация по типу события.
 
Метод возвращает `true`, если выполнение обработчиков было остановлено, либо `false` в противном случае.
 
Несколько примеров:

```js
new EventEmitter()
  .on('event', function () {
    // Эта строка остановит любое событие,
    // не зависимо от типа или объекта, вызвавшего данное событие.
    this.stopEmit(); // true
  })
  .on('event', function () {
    // Этот обработчик никогда не будет вызван.
  })
  .emit('event');
  
function listener () {
  this.stopEmit('error'); // true, будет остановлено только событие error
  new EventEmitter().stopEmit(); // false, другой экземпляр не останавливает выполнение
}

new EventEmitter()
  .on('data', listener)
  .on('error', listener)
  .emit('data');
```

### Домены
Не реализованы.

### Тесты
Unit-тесты: `npm install; npm test`.
<br />
Сравнительные тесты производительности: `cd tests/benchmark; npm install; npm test`.
