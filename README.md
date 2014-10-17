EventEmitter
============

Расширенная, кросс-платформенная, обратносовместимая реализация модуля [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) из стандартной библиотеки `NodeJS`.
Дополнительное API призвано повысить удобство разработки и читаемость кода.
Для этого были внедрены следующие механизмы:
 * [Контекст обработчиков событий](#context)
 * [Данные события](#data)
 * [Делегирование](#delegate)
 * [Остановка выполнения обработчиков](#stopEmit)

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

 * `{Function|EventEmitter} callback`
 <br />Функция или объект-обработчик события.

 * `{*} context`
 <br />Контекст, в котором будет вызвана функция-обработчик.
 
### <a name="context"></a>Расширенное API подписки на события
Методы подписки на события имеют расширенный интерфейс, а так же новый метод `EventEmitter#off`:

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
  произойдет вызов одноименного события на объекте-слушателе с передачей всех аргументов оригинального события (см. [делегирование событий](#delegate)). Что бы отвязать объект-слушатель, его нужно передать в соответствующий метод удаления обработчика.

 * `{Object|null} [context=this]`
 <br />Необязательный аргумент, задает контекст обработчика события.
 
### <a name="data"></a>Данные события
Данными события являются все параметры (кроме первого, типа события), переданные в метод `EventEmitter#emit`. Любой обработчик события может динамически менять набор этих данных.

 * `{EventEmitter} EventEmitter#setEventData([...*] args)`
<br />Устанавливает новые данные события. Все переданные аргументы будут доступны в последующих обработчиках текущего события. Если ни одного аргумента не было передано, данные события будут удалены.

 * `{Array|null} EventEmitter#getEventData()`
<br />Возвращает текущие данные события в виде массива.

 * `{String|Number|null} EventEmitter#getEventType()`
<br />Возвращает тип текущего события.

```js
new EventEmitter()
  .on('event', function (foo) {
    foo === 'bar'; // true
    this.setEventData('baz');
  })
  .on('event', function (foo) {
    foo === 'baz'; // true
    this.setEventData();
  })
  .on('event', function () {
    arguments.length; // 0
    this.getEventType(); // 'event'
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
 * `{EventEmitter} EventEmitter#delegate(emitter, type[, alias=type])`
 <br />Делегирует событие `type` на объект `emitter`. Необязательным аргументом задается имя события, которое будет вызвано на объекте `emitter`.

 * `{EventEmitter} EventEmitter#unDelegate(emitter, type)`
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
  .delegate(listener, 'event', 'someEvent')
  .emit('event', 'bar');
```

Следующие строки:
```js
emitter.delegate(listener, 'event');
emitter.delegate(listener, 'event', 'event');
```
эквивалентны:
```js
emitter.on('event', listener);
```
, a эта строка:
```js
emitter.delegate(listener, 'event');
```
эквивалентна:
```js
emitter.off('event', listener);
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

## Тесты
Тесты в NodeJS и во всех браузерах:
<br />`npm install; npm test`.
<br />
<br />Сравнение производительности с нативным EventEmitter-ом:
<br />`cd tests/benchmark; npm install; npm test`.
