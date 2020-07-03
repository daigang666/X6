---
title: 快速上手
order: 1
redirect_from:
  - /zh/docs
  - /zh/docs/manual
---

## 安装

通过 npm 或 yarn 命令安装 X6。

```shell
# npm
$ npm install @antv/x6 --save

# yarn
$ yarn add @antv/x6
```

安装完成之后，使用 `import` 或 `require` 进行引用。需要特别注意的是，引入 X6 时同时需要通过 `import '@antv/x6/es/index.css'` 或 `import '@antv/x6/lib/index.css'` 引入预定义的基础样式。

```ts
import { Graph } from '@antv/x6';
import '@antv/x6/es/index.css'; 
```

## 开始使用

接下来我们就一起来创建一个最简单的 `Hello --> World` 应用。

### Step 1 创建容器

在页面中创建一个用于容纳 X6 绘图的容器，可以是一个 `div` 标签。

```html
<div id="container"></div>
```

### Step 2 准备数据

X6 支持 JSON 格式数据，该对象中需要有节点 `nodes` 和边 `edges` 字段，分别用数组表示：

```ts
const data = {
  // 节点
  nodes: [
    {
      id: 'node1', // String，可选，节点的唯一标识
      x: 100,      // Number，必选，节点位置的 x 值
      y: 200,      // Number，必选，节点位置的 y 值
      width: 80,   // Number，可选，节点大小的 width 值
      height: 40,  // Number，可选，节点大小的 height 值
      label: 'hello', // String，节点标签
    },
    {
      id: 'node2', // String，节点的唯一标识
      x: 300,      // Number，必选，节点位置的 x 值
      y: 200,      // Number，必选，节点位置的 y 值
      width: 80,   // Number，可选，节点大小的 width 值
      height: 40,  // Number，可选，节点大小的 height 值
      label: 'world', // String，节点标签
    },
  ],
  // 边
  edges: [
    {
      source: 'node1', // String，必须，起始节点 id
      target: 'node2', // String，必须，目标节点 id
    },
  ],
};
```

### Step 3 渲染画布

首先，我们需要创建一个 `Graph` 对象，并为其指定一个页面上的绘图容器，通常也会指定画布的大小。

```ts
import { Graph } from '@antv/x6';
import '@antv/x6/es/index.css';

const graph = new Graph({
  container: document.getElementById('container'),
  width: 800,
  height: 600,
});
```

然后，我们就可以使用刚刚创建的 `graph` 来渲染我们的节点和边。

```ts
graph.fromJSON(data)
```

到此，我们就得到一个最简单的 `Hello --> World` 示例，看下面的完整代码。

<iframe
  src="https://codesandbox.io/embed/condescending-driscoll-xkb6q?fontsize=14&hidenavigation=1&module=%2Fsrc%2Findex.ts&theme=light"
  style="width:100%; height:500px; border:1px solid #f0f0f0; border-radius: 4px; overflow:hidden;"
  title="x6-hello-world"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

## 画布

### 背景和网格

接下来，我们来给画布设置一个背景颜色和网格，另外还支持背景图片、网格类型等配置，点击查看完整的[背景配置](./tutorial/background)和[网格配置](./tutorial/grid)。

```ts
import { Graph } from '@antv/x6';
import '@antv/x6/es/index.css';

const graph = new Graph({
  container: document.getElementById('container'),
  width: 800,
  height: 600,
  background: {
    color: '#fffbe6', // 设置画布背景颜色
  },
  grid: {
    size: 10,      // 网格大小 10px
    visible: true, // 渲染网格背景
  },
});
```

<iframe
  src="https://codesandbox.io/embed/x6-hello-world-background-grid-jswsf?fontsize=14&hidenavigation=1&theme=light"
  style="width:100%; height:500px; border: 1px solid #f0f0f0; border-radius: 4px; overflow:hidden;"
  title="x6-hello-world-background-grid"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

### 缩放和平移

## 节点

### 使用图形

在上面示例中，我们使用了默认图形 `rect` 来渲染节点，除此之外，我们在 X6 中也内置了 `circle`，`ellipse`，`polygon` 等[基础图形]()，可以通过 `shape` 属性为节点指定渲染的图形，例如： 

```ts
const data = {
  // 节点
  nodes: [
    {
      id: 'node1',
      shape: 'rect',
      x: 100,
      y: 200,
      width: 80,
      height: 40,
      label: 'hello',
    },
    {
      id: 'node2',
      shape: 'ellipse',
      x: 300,
      y: 200,
      width: 80,
      height: 40,
      label: 'world',
    },
  ],
  // 边
  edges: [
    {
      source: 'node1',
      target: 'node2',
    },
  ],
};
```

<iframe
     src="https://codesandbox.io/embed/x6-hello-world-shape-ujvun?fontsize=14&hidenavigation=1&theme=light"
     style="width:100%; height:500px; border:1px solid #f0f0f0; border-radius: 4px; overflow:hidden;"
     title="x6-hello-world-shape"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### 配置样式


## 在 React 中使用 X6

如果你想在 React 中使用 X6，可以参考[这个 Demo]()。更多关于如何在 React 中使用 X6，请参考 React 中使用 X6 的文档。

有其他任何问题都可以通过页面底部的顶顶群和我们沟通，也非常欢迎给我们提 [issues](https://github.com/antvis/X6/issues/new/choose) 或 [PR](https://github.com/antvis/X6/pulls)。

## 更多

本章仅仅介绍了如何安装以及最简单的场景，在 X6 Tutorial 中其他的章节中我们会教会你：

- 实例化 Graph 的常见配置
- 设置节点/边的属性、样式


想了解更高阶的功能，请参见 [X6 核心概念]() 和 [X6 高级指引]()。

