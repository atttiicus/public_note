---
title: JS 面试题复习
date: 2025-08-15
description: 深入讲解 JavaScript 相关问题。
tags: ['面试题','JavaScript']
---

# 闭包

闭包（Closure）是 JavaScript 中非常重要且常用的机制。简单说，**闭包是指一个函数能够记住并访问其定义时所在的词法作用域，即使这个函数是在其词法作用域之外被调用**。

下面从机制、原理、创建方式、常见用途、注意事项几个方面详细展开。

---

## 1. 闭包的定义

MDN 对闭包的定义是：

> 闭包是由函数以及声明该函数的词法环境组合而成的。这个环境包含了这个闭包创建时作用域内的任何局部变量。

换句话说：

- 当一个函数内部定义了另一个函数；
- 内部函数引用了外部函数的变量；
- 内部函数被返回出去，或者在外部函数之外被调用；
- 即使外部函数已经执行完毕，内部函数仍然可以访问那些变量。

这种“函数 + 它引用的外部变量环境”的组合，就是闭包。

---

## 2. 词法作用域是闭包的基础

JavaScript 使用**词法作用域**（也叫静态作用域），也就是说，函数的作用域在**定义时**就已经确定，而不是在调用时确定。

```javascript
let a = 1;

function outer() {
  let b = 2;

  function inner() {
    let c = 3;
    console.log(a, b, c); // 可以访问 a、b、c
  }

  return inner;
}
```

`inner` 定义在 `outer` 内部，所以它的作用域链包括：

1. 自己的作用域：`c`
2. `outer` 的作用域：`b`
3. 全局作用域：`a`

即使我们把 `inner` 拿出来单独调用，它的作用域链仍然保持定义时的结构。

```javascript
const fn = outer();
fn(); // 1 2 3
```

此时 `outer` 已经执行完了，但 `fn` 依然能访问 `b`，这就是闭包。

---

## 3. 底层机制：执行上下文与作用域链

要真正理解闭包，需要了解 JavaScript 执行模型。

### 3.1 执行上下文

每当函数被调用时，JavaScript 引擎都会创建一个**执行上下文**，其中包含：

- 变量对象 / 环境记录：存放函数的参数、局部变量、函数声明等；
- `this` 值；
- 外部环境的引用：指向定义时的父级作用域，即 `[[Environment]]`。

执行上下文会被压入调用栈，函数执行完毕后弹出。

### 3.2 作用域链

函数在创建时，会保存一个内部属性 `[[Environment]]`，它指向当前执行上下文的词法环境。

当函数被调用时，会创建一个新的执行上下文，并创建新的词法环境，这个环境的 `outer` 指向函数创建时的 `[[Environment]]`。

于是形成一条链：

```
当前环境 → 外部环境 → 外部环境的外部环境 → ... → 全局环境
```

这就叫**作用域链**。

### 3.3 为什么外部函数执行完还能访问变量？

正常情况下，函数执行完毕后，其执行上下文会从调用栈弹出，变量对象如果没有被引用，就会被垃圾回收。

但如果外部函数中定义了一个内部函数，并且这个内部函数被返回并保存到外部变量中，那么：

- 内部函数的 `[[Environment]]` 仍然引用着外部函数的词法环境；
- 外部函数的变量对象就无法被垃圾回收；
- 所以内部函数之后调用时，仍然可以通过作用域链找到那些变量。

这就是闭包能“记住”变量的根本原因。

---

## 4. 闭包的创建方式

### 4.1 返回函数

最常见：

```javascript
function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

`count` 变量被返回的函数持续引用，因此不会被销毁，状态得以保留。

### 4.2 函数作为参数传递

```javascript
function foo() {
  let message = 'hello';

  setTimeout(function () {
    console.log(message);
  }, 1000);
}

foo();
```

`setTimeout` 的回调函数在 1 秒后才执行，但依然可以访问 `message`，因为回调形成了一个闭包。

### 4.3 事件监听

```javascript
function setupButton() {
  let clickCount = 0;

  document.getElementById('btn').addEventListener('click', function () {
    clickCount++;
    console.log(clickCount);
  });
}
```

事件处理函数保留了对 `clickCount` 的引用。

### 4.4 IIFE 创建闭包

```javascript
const module = (function () {
  let privateValue = 0;

  return {
    increment() {
      privateValue++;
    },
    get() {
      return privateValue;
    },
  };
})();

module.increment();
module.get(); // 1
```

IIFE 用来创建私有作用域，返回的对象方法形成闭包，可以访问私有变量。

---

## 5. 闭包的实际应用

### 5.1 数据私有化 / 封装

JavaScript 没有传统意义上的私有属性，但闭包可以模拟私有变量：

```javascript
function Person(name) {
  let age = 0;

  return {
    getName() {
      return name;
    },
    getAge() {
      return age;
    },
    growOlder() {
      age++;
    },
  };
}

const p = Person('Alice');
p.growOlder();
console.log(p.getAge()); // 1
console.log(p.age); // undefined
```

外部无法直接访问 `age`，只能通过暴露的方法操作。

### 5.2 函数工厂 / 柯里化

利用闭包可以创建带有预设参数的函数：

```javascript
function multiply(a) {
  return function (b) {
    return a * b;
  };
}

const double = multiply(2);
console.log(double(5)); // 10
console.log(double(7)); // 14
```

`a` 的值被保存在闭包中。

### 5.3 防抖与节流

```javascript
function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

`timer` 保存在闭包中，每次调用都能访问并更新它。

### 5.4 缓存 / 记忆化

```javascript
function memoize(fn) {
  const cache = {};

  return function (key) {
    if (key in cache) {
      return cache[key];
    }
    const result = fn(key);
    cache[key] = result;
    return result;
  };
}
```

`cache` 对象被闭包保留，避免重复计算。

### 5.5 迭代器

```javascript
function createIterator(arr) {
  let index = 0;

  return {
    next() {
      if (index < arr.length) {
        return { value: arr[index++], done: false };
      }
      return { done: true };
    },
  };
}
```

`index` 被保存，每次 `next` 调用都会更新。

---

## 6. 闭包与循环的经典问题

### 6.1 `var` 的问题

```javascript
for (var i = 1; i <= 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 1000);
}
// 输出：4 4 4
```

原因：

- `var` 声明的 `i` 是函数作用域；
- 循环结束后 `i` 变成 4；
- 三个回调共享同一个 `i`，执行时都输出 4。

### 6.2 使用闭包解决

```javascript
for (var i = 1; i <= 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j);
    }, 1000);
  })(i);
}
// 输出：1 2 3
```

每次循环，IIFE 都会创建一个新的作用域，并把当前的 `i` 值作为参数传入，于是每个回调都捕获各自的 `j`。

### 6.3 使用 `let`

```javascript
for (let i = 1; i <= 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 1000);
}
// 输出：1 2 3
```

`let` 具有块级作用域，每次迭代都会创建一个新的绑定，因此每个回调捕获不同的 `i`。

---

## 7. 闭包的注意事项

### 7.1 内存占用

闭包会导致外部函数的变量无法被垃圾回收，如果大量创建闭包或闭包持有大对象，可能造成内存泄漏。

例如：

```javascript
function createHeavy() {
  const hugeData = new Array(1000000).fill('*');
  return function () {
    console.log('do something');
  };
}

const fn = createHeavy();
```

虽然返回的函数没有使用 `hugeData`，但在某些旧引擎中，闭包会保留整个外部词法环境，导致 `hugeData` 无法释放。

**优化**：及时解除引用，或在不需要时置为 `null`：

```javascript
let fn = createHeavy();
fn = null; // 允许垃圾回收
```

不过现代 V8 引擎对此做了优化，如果闭包没有引用某个变量，该变量可能不会长期保留。但编写时仍应避免不必要的闭包。

### 7.2 多个闭包共享同一个外部变量

```javascript
function createCounters() {
  let count = 0;

  return [
    function () {
      count++;
    },
    function () {
      console.log(count);
    },
  ];
}

const [increment, log] = createCounters();
increment();
increment();
log(); // 2，两个闭包共享同一个 count
```

这既是闭包的特性，也可能带来意料之外的状态共享，使用时需要注意。

### 7.3 `this` 指向

闭包中的 `this` 并不一定指向外部函数的 `this`，因为它取决于调用方式。

```javascript
const obj = {
  name: 'Alice',
  getName: function () {
    return function () {
      return this.name; // 这里的 this 指向全局对象或 undefined
    };
  },
};

const fn = obj.getName();
console.log(fn()); // undefined（严格模式下会报错）
```

需要保存 `this` 或使用箭头函数：

```javascript
const obj = {
  name: 'Alice',
  getName: function () {
    const self = this;
    return function () {
      return self.name;
    };
  },
};
```

或者：

```javascript
const obj = {
  name: 'Alice',
  getName: function () {
    return () => this.name; // 箭头函数继承外层 this
  },
};
```

---

## 8. 总结

- **闭包 = 函数 + 定义时的词法环境**；
- 它依赖 JavaScript 的词法作用域和作用域链；
- 内部函数保存了对父级词法环境的引用，因此父函数执行完后变量仍可访问；
- 闭包常用于：数据私有化、函数工厂、柯里化、防抖节流、缓存、模块模式等；
- 使用时要注意内存占用、变量共享以及 `this` 指向问题。

闭包是 JavaScript 实现模块化、函数式编程和许多设计模式的基础，深入理解它对写出高质量 JS 代码非常重要。

在 JavaScript 中，深拷贝和浅拷贝是处理对象和数组时经常遇到的概念。要理解它们的区别，首先要了解 JavaScript 中数据的存储方式。

---

# 深拷贝与浅拷贝

## 1. 数据存储方式：基本类型与引用类型

- **基本类型**（`number`、`string`、`boolean`、`null`、`undefined`、`symbol`、`bigint`）：直接存储在栈内存中，变量保存的是实际的值。拷贝时直接复制值，互不影响。
- **引用类型**（`object`、`array`、`function` 等）：数据存储在堆内存中，变量保存的是指向该内存地址的引用（指针）。拷贝时如果只复制引用，那么两个变量会指向同一个对象。

```javascript
let a = 10;
let b = a;
b = 20;
console.log(a); // 10，基本类型互不影响

let obj1 = { name: 'Alice' };
let obj2 = obj1;
obj2.name = 'Bob';
console.log(obj1.name); // 'Bob'，因为 obj1 和 obj2 指向同一个对象
```

---

## 2. 浅拷贝（Shallow Copy）

**浅拷贝**只复制对象的第一层属性。如果属性是基本类型，则复制其值；如果属性是引用类型（如嵌套对象、数组），则复制其引用，也就是说**内部的对象仍然与原对象共享同一份内存地址**。

### 示例

```javascript
const original = {
  name: 'Alice',
  address: {
    city: 'Beijing',
    zip: '100000'
  }
};

// 使用扩展运算符进行浅拷贝
const shallowCopy = { ...original };

shallowCopy.name = 'Bob';        // 修改第一层基本类型，不影响原对象
shallowCopy.address.city = 'Shanghai'; // 修改嵌套对象，会影响原对象！

console.log(original.name);          // 'Alice'，没变
console.log(original.address.city);  // 'Shanghai'，变了！
```

可以看到，浅拷贝后，修改拷贝对象的第一层基本类型属性不会影响原对象，但修改嵌套的引用类型属性会同时影响原对象，因为它们指向同一个内部对象。

### 常见的浅拷贝方法

- `Object.assign({}, obj)`
- 扩展运算符 `{ ...obj }` 或 `[ ...arr ]`
- `Array.prototype.slice()`、`Array.prototype.concat()`（用于数组）
- `Array.from()`（用于数组）

---

## 3. 深拷贝（Deep Copy）

**深拷贝**会递归复制对象的所有层级。无论属性是基本类型还是引用类型，都会创建一份全新的独立副本。修改拷贝后的对象（包括嵌套对象）不会影响原对象。

### 示例

```javascript
const original = {
  name: 'Alice',
  address: {
    city: 'Beijing',
    zip: '100000'
  }
};

// 使用 JSON 方法进行深拷贝（仅适用于可序列化的对象）
const deepCopy = JSON.parse(JSON.stringify(original));

deepCopy.name = 'Bob';
deepCopy.address.city = 'Shanghai';

console.log(original.name);          // 'Alice'，没变
console.log(original.address.city);  // 'Beijing'，没变
```

深拷贝后，原对象和拷贝对象完全独立，任何修改都不会互相影响。

### 常见的深拷贝方法

- **JSON 方法**：`JSON.parse(JSON.stringify(obj))`
  - 优点：简单快捷。
  - 缺点：无法处理函数、`undefined`、`Symbol`、循环引用、`Date`、`RegExp`、`Map`、`Set` 等特殊对象。
- **手写递归函数**：手动遍历对象，对每个属性进行递归拷贝。
- **使用第三方库**：如 Lodash 的 `_.cloneDeep()`。
- **原生 `structuredClone`**：现代浏览器和 Node.js 提供的全局方法，支持更多类型（如 `Date`、`Map`、`Set`、循环引用等），但不支持函数和 `Symbol`。

---

## 4. 深拷贝与浅拷贝的核心区别

| 对比项       | 浅拷贝                               | 深拷贝                               |
| ------------ | ------------------------------------ | ------------------------------------ |
| 复制层级     | 只复制第一层                         | 递归复制所有层级                     |
| 嵌套对象     | 与原对象共享引用                     | 创建独立副本                         |
| 修改嵌套对象 | 会影响原对象                         | 不会影响原对象                       |
| 内存占用     | 较小（共享内部对象）                 | 较大（每个层级都复制）               |
| 实现复杂度   | 简单，内置方法即可                   | 较复杂，需要递归或特殊处理           |
| 性能         | 较快                                 | 较慢，尤其是大对象或深层嵌套时       |

---

## 5. 手写实现示例

### 5.1 浅拷贝实现

```javascript
function shallowCopy(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const newObj = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key]; // 直接赋值，引用类型仍然是同一个引用
    }
  }
  return newObj;
}
```

### 5.2 深拷贝实现（简易版，不考虑特殊类型）

```javascript
function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const newObj = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepCopy(obj[key]); // 递归拷贝
    }
  }
  return newObj;
}
```

注意：这个简易版无法处理循环引用、`Date`、`RegExp`、`Map`、`Set` 等特殊对象，实际项目中推荐使用 `structuredClone` 或 Lodash。

### 5.3 处理循环引用的深拷贝（使用 WeakMap）

```javascript
function deepClone(obj, hash = new WeakMap()) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (hash.has(obj)) return hash.get(obj); // 处理循环引用

  const newObj = Array.isArray(obj) ? [] : {};
  hash.set(obj, newObj);

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepClone(obj[key], hash);
    }
  }
  return newObj;
}
```

---

## 6. 特殊情况与注意事项

### 6.1 JSON 方法的局限性

```javascript
const obj = {
  func: function () {},
  undef: undefined,
  sym: Symbol('sym'),
  date: new Date(),
  reg: /abc/,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  circular: null
};
obj.circular = obj; // 循环引用

const copy = JSON.parse(JSON.stringify(obj));
console.log(copy);
// 输出：
// {
//   date: "2024-01-01T00:00:00.000Z", // Date 变成了字符串
//   reg: {}, // 正则变成空对象
//   map: {}, // Map 变成空对象
//   set: {}, // Set 变成空对象
// }
// func、undef、sym 被丢失，circular 会导致报错
```

所以使用 JSON 方法时，要确保对象是可序列化的纯数据（如普通对象、数组、字符串、数字、布尔值、null）。

### 6.2 函数和 Symbol 的深拷贝

大多数深拷贝方法（包括 `structuredClone` 和 Lodash）在处理函数和 `Symbol` 时会有特殊行为：

- 函数：通常不会被拷贝，而是保持原引用（因为函数一般不需要复制）。
- `Symbol` 作为键值：可能被忽略或保留引用。

如果需要完整复制函数或 `Symbol`，需要自己编写特殊逻辑。

### 6.3 性能考虑

深拷贝会递归遍历所有属性，对于大型对象或深层嵌套结构，性能开销较大。如果不需要完全独立的副本，可以考虑使用浅拷贝或按需拷贝（例如只拷贝需要修改的部分）。

---

## 7. 总结

- **浅拷贝**只复制对象的第一层，内部引用类型仍然共享，修改嵌套对象会影响原对象。
- **深拷贝**递归复制所有层级，创建完全独立的副本，修改任何部分都不会影响原对象。
- 选择哪种拷贝方式取决于实际需求：如果确定对象只有一层，或者希望共享内部数据，用浅拷贝；如果需要完全独立的副本，用深拷贝。
- 深拷贝实现要注意特殊类型、循环引用和性能问题，建议使用 `structuredClone` 或 Lodash 等成熟工具。

理解深浅拷贝的本质，有助于避免在开发中因对象共享而导致的意外数据修改问题。