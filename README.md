EventEmitter
============

Расширенная обратносовместимая реализация модуля [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) из стандартной библиотеки `NodeJS`.
Дополнительное API призвано повысить удобство разработки и читаемости кода.
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
 * `{Function} callback`
 <br />Функция-обработчик события.
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

`{EventEmitter} EventEmitter#setEventData([args])`

Здесь:
* `{...*} [args]` Новые данные события. Все переданные аргументы станут данными события и будут переданы в последующие обработчики текущего события. Если ни одного аргумента не было передано, данные события будут удалены.

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
  .on('event', function (foo) {
    argiments.length; // 0
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
