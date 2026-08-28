---
title: React 面试题复习
date: 2025-08-15
description: 深入讲解 React 相关问题。
tags: ['面试题','React']
---

# React 面试题

# React Diff 算法详解（React 16 vs React 18）

React 的 diff 算法是虚拟 DOM 高效性的核心，它通过比较新旧两棵虚拟 DOM 树的差异，计算出最小化的 DOM 操作，从而提升渲染性能。React 16 和 React 18 在 diff 算法上的核心逻辑基本一致，但底层架构和调度方式发生了巨大变化。

---

## 一、React Diff 算法基础

React 的 diff 算法基于两个重要假设，将传统 O(n³) 的树比较复杂度优化为 O(n)：

1. **不同类型的元素会产生不同的树**：如果两个元素类型不同（如 `<div>` 变为 `<span>`），React 会直接销毁旧树并重新创建新树，不再深入比较其子节点。
2. **开发者可以通过 `key` 属性来标识子元素**：`key` 用于判断元素是否可以在不同渲染中保持稳定，从而复用已有 DOM 节点，避免不必要的重建。

在这两个假设下，React 的 diff 算法主要分为 **单节点 diff** 和 **多节点 diff**，并且依赖 `key` 和元素 `type` 来判断节点是否可复用。

---

## 二、React 16 的 Diff 算法

React 16 引入了 **Fiber 架构**，用链表结构描述组件树，使得渲染过程可以被拆分为多个小任务，能够中断和恢复（但 React 16 默认仍是同步渲染，只有开启 Concurrent Mode 才会异步）。Diff 发生在 **render 阶段**，通过对比新旧 Fiber 树生成 `effectTag`（副作用标记），最终在 **commit 阶段** 执行 DOM 操作。

### 1. Fiber 节点

每个 Fiber 节点对应一个 React 元素，保存了组件的类型、props、state、子节点、兄弟节点等信息，以及 `alternate` 属性指向旧 Fiber。Diff 的过程就是对比新旧 Fiber 节点，决定复用、更新或删除。

### 2. 单节点 Diff

当新的子节点只有一个元素时，React 会遍历旧子节点列表，寻找可复用的节点。判断条件为：
- `key` 相同（或都未设置）
- 元素 `type` 相同（如 `div`、自定义组件）

如果找到匹配的旧节点，则复用该 Fiber 节点并更新其 props，然后停止遍历。如果遍历完未找到匹配节点，则删除所有旧子节点，并创建新节点。若发现 `key` 相同但 `type` 不同，React 会认为类型变化，删除旧节点及其所有兄弟节点，然后创建新节点。

### 3. 多节点 Diff

当新的子节点是一个数组时，React 采用 **两轮遍历** 策略：

**第一轮遍历**：处理更新的节点（`key` 和 `type` 都相同）。
- 同时遍历新旧节点列表，从左到右逐一比较。
- 如果新旧节点 `key` 和 `type` 都相同，则复用旧节点并更新 props，继续比较下一对节点。
- 如果遇到 `key` 不同的节点，立即跳出第一轮循环。

**第二轮遍历**：处理剩余节点。
- 将剩余的旧节点放入一个 `Map`（键为 `key` 或 `index`，值为旧 Fiber）。
- 遍历剩余的新节点，通过 `key` 在 `Map` 中查找可复用的旧节点。
  - 如果找到，则复用旧节点，并标记 `Placement`（需要移动位置）。
  - 如果未找到，则创建新节点并标记 `Placement`。
- 遍历结束后，`Map` 中剩余的旧节点全部标记为 `Deletion` 删除。

### 4. Key 的作用

`key` 帮助 React 识别哪些子元素发生了变化（如增删、移动），从而最大化复用已有 DOM 节点。如果未提供 `key`，React 会使用数组索引作为默认 `key`，这在列表顺序变化时可能导致性能问题或状态错误。

### 5. EffectTag 标记

Diff 过程中会为 Fiber 节点打上不同的 `effectTag`：
- `Placement`：新增或移动节点
- `Update`：更新节点（如 props、state 变化）
- `Deletion`：删除节点
- `ContentReset`、`Ref` 等

这些标记在 commit 阶段统一处理，执行真实 DOM 操作。

### 6. 调度方式

React 16 的 Fiber 架构虽然支持可中断的异步渲染，但默认使用 `ReactDOM.render` 时仍是同步、不可中断的。整个 render 阶段（包括 diff）作为一个任务一次性完成，长时间执行会阻塞主线程。只有启用实验性的 Concurrent Mode 才能实现时间切片。

---

## 三、React 18 的 Diff 算法

React 18 全面启用 **并发特性**（Concurrent Features），默认通过 `createRoot` 开启并发模式。Diff 算法的核心逻辑（单节点、多节点比较、key 复用等）与 React 16 完全一致，但底层调度和渲染方式发生了本质变化：

### 1. 可中断的异步 Diff

React 18 的 render 阶段（包含 diff）可以被拆分成多个小任务，通过 **时间切片**（Time Slicing）在浏览器空闲时执行。每个时间片（默认 5ms）执行一部分工作，然后让出主线程，检查是否有更高优先级的任务（如用户输入、动画）需要处理，若有则暂停当前渲染。因此 diff 过程可以被打断，不会长时间阻塞 UI。

### 2. 优先级调度

React 18 引入了 **优先级** 的概念，不同的更新具有不同的优先级：
- 紧急更新（如点击、输入）具有高优先级
- 过渡更新（使用 `startTransition` 标记）具有低优先级
- 默认更新为普通优先级

Diff 过程中，高优先级的更新会中断低优先级的渲染，优先完成高优先级更新的 diff 和 commit，然后继续低优先级的工作。这保证了用户交互的流畅性。

### 3. 自动批处理

React 18 对所有更新（包括在 promise、setTimeout、原生事件等异步回调中的更新）自动进行批处理，即在一个事件循环内多次 `setState` 只会触发一次渲染，从而减少了 diff 的执行次数，提升了性能。

### 4. 新 Hook 与 API

- `startTransition`：标记非紧急更新为过渡更新，延迟其渲染。
- `useDeferredValue`：延迟某个值的更新，避免阻塞紧急渲染。
- `useSyncExternalStore` 等。

这些特性会影响 diff 的执行时机和优先级，但不会改变 diff 算法本身的比较逻辑。

### 5. 双缓冲树

React 18 在并发模式下维护两棵 Fiber 树：**current 树**（当前屏幕上显示的）和 **workInProgress 树**（正在构建的）。Diff 在 workInProgress 树上进行，每次更新时会基于 current 树创建 workInProgress 树，通过 `alternate` 指针复用旧 Fiber。Diff 完成后，workInProgress 树变为新的 current 树。这种双缓冲机制使得渲染可以中断而不影响屏幕显示。

### 6. 与 React 16 的差异总结

| 对比维度 | React 16（同步渲染） | React 18（并发渲染） |
|---------|---------------------|---------------------|
| **底层架构** | Fiber，但默认同步执行 | Fiber，并发可中断 |
| **diff 过程** | 一次性完成，不可中断 | 可分片执行，可中断 |
| **优先级** | 无优先级概念 | 多优先级，高优先级可打断低优先级 |
| **批处理** | 仅在事件处理函数中自动批处理 | 所有更新自动批处理 |
| **API** | `ReactDOM.render` | `createRoot`，支持并发特性 |
| **commit 阶段** | 同步，不可中断 | 同步（仍不可中断），但可被高优先级更新提前 |

---

## 四、核心算法的代码示例（多节点 Diff 简化逻辑）

以下为 React 中处理多节点 diff 的核心思路（简化版）：

```javascript
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
  let resultingFirstChild = null;
  let previousNewFiber = null;
  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;

  // 第一轮遍历：处理更新的节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);
    if (newFiber === null) {
      if (oldFiber === null) oldFiber = nextOldFiber;
      break;
    }
    if (oldFiber && newFiber.alternate === null) {
      // 删除旧节点
      deleteChild(returnFiber, oldFiber);
    }
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }

  // 如果新节点已遍历完，删除剩余旧节点
  if (newIdx === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }

  // 如果旧节点已遍历完，创建剩余新节点
  if (oldFiber === null) {
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx]);
      if (newFiber === null) continue;
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
    return resultingFirstChild;
  }

  // 第二轮遍历：将剩余旧节点存入 Map
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx]);
    if (newFiber !== null) {
      if (newFiber.alternate !== null) {
        // 从 Map 中删除已复用的旧节点
        existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key);
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }
  // 删除 Map 中剩余的旧节点
  existingChildren.forEach(child => deleteChild(returnFiber, child));
  return resultingFirstChild;
}
```

---

## 五、总结

- **React 16**：基于 Fiber 实现了可中断的架构，但默认同步渲染，diff 算法包含单节点和多节点比较，采用两轮遍历和 key 复用策略。
- **React 18**：核心 diff 算法不变，但通过并发模式和优先级调度，使 diff 过程可中断、可切片，并自动批处理所有更新，大幅提升了复杂应用下的响应速度和流畅度。
- **关键区别**：不在 diff 比较逻辑本身，而在 **调度方式** 和 **渲染模式** 上。React 18 真正利用了 Fiber 的并发能力，而 React 16 只是具备了这种能力但未默认启用。