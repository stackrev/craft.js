
<div align="center" style={{d}}>
<h1>craft.js</h1>
<img src="https://img.shields.io/npm/v/@craftjs/core?color=%232680eb&style=for-the-badge">
<img src="https://img.shields.io/npm/l/@craftjs/core?color=%23000&style=for-the-badge">
<img src="https://img.shields.io/github/workflow/status/prevwong/craft.js/deploy-gh?color=%23000&style=for-the-badge">
</div>

<div align="center" style={{d}}>
  <img src="https://craft.js.org/screenshots/readme-core-demo.gif"/>
</div>

<p align="center">
  <strong>
    <a href="https://prevwong.github.io/craft.js/">Live Demo</a>
  </strong>
</p>

Page editors are a great way to provide an excellent user experience. However, to build one is often a pretty dreadful task.

There're existing libraries that come with a fully working page editor out of the box with a user interface and editable components. However, if you wish to make customisations such as modifying the user interface and its behavior, it will most definitely involve modifying the library itself. 

Craft.js solves this problem by providing the building blocks of a page editor. It ships with a drag-n-drop system and handles the way user components should be rendered, updated and moved - among other things. With this, you'll be able to focus on building the page editor according to your own specifications and needs.

## Docs
- [Core concepts](https://prevwong.github.io/craft.js/r/docs/concepts/nodes)
- [Tutorial](https://prevwong.github.io/craft.js/r/docs/guides/basic-tutorial)
- [API Reference](https://prevwong.github.io/craft.js/r/docs/api/editor-state)

## Examples
- [Landing](https://prevwong.github.io/craft.js)
- [Basic](https://prevwong.github.io/craft.js/examples/basic)


## Features :sparkles:
### It's just React 
No need for complicated plugin systems. Design your editor from top to bottom the same way as you would design any other frontend application in React.

A simple user component can easily be defined as such:
```jsx
import {useNode} from "@craftjs/core";

const TextComponent = ({text}) => {
  const { connectors:{drag} } = useNode();

  return (
    <div ref={drag}>
      <h2>{text}</h2>
    </div>
  )
}
```

Heck, the entire UI of your page editor is built using just React. 
```jsx
import React from "react";
import {Craft, Frame, Canvas, Selector} from "@craftjs/core";
const App = () => {
  return (
    <div>
      <header>Some fancy header or whatever</header>
      <Editor>
        // Editable area starts here
        <Frame resolver={TextComponent, Container}>  
          <Canvas>
            <TextComponent text="I'm already rendered here" />
          </Canvas>
        </Frame>
      </Editor>
    </div>
  )
}
```

### Control how your components are edited
An obvious requirement for page editors is that they need to allow users to edit components. With Craft.js, you control the process of which these components should be edited. 

In the following example, when the user clicks on a component, we'll display a modal that requires the user to input a value for the `text` prop. As the input value changes, the component will be re-rendered with updated prop. 

```jsx
import {useNode} from "@craftjs/core";

const TextComponent = ({text}) => {
  const { connectors:{ connect, drag }, isClicked, setProp } = useNode(
    (state) => ({ 
      isClicked: state.event.selected,
    })
  );

  return (
    <div ref={connect(drag)}>
      <h2>{text}</h2>
      {
        isClicked ? (
          <Modal>
            <input 
              type="text" 
              value={text} 
              onChange={e => setProp(e.target.value)} 
            />
          </Modal>
        )
      }
    </div>
  )
}
```
With this, you could easily implement content editable text or drag-to-resize components, just as any modern page editor would have.

### User components with droppable regions
Let's say we need a "Container" component which users can drop into the editor. Additionally, we would also like them to be able to drag and drop other components into the Container. 

In Craft.js, it's as simple as calling the `<Canvas />`

```jsx
import {useNode} from "@craftjs/core";
const Container = () => {
  const { connectors: {drag} } = useNode();

  return (
    <div ref={drag}>
      <Canvas id="drop_section">
         // Now users will be able to drag/drop components into this section
        <TextComponent />
      </Canvas>
    </div>
  )
}
```

### Extensible
Craft.js provides an expressive API which allows you to easily read and manipulate the editor state. Let's say you would like to implement a copy function for a component:
```jsx
import {useEditor, useNode} from "@craftjs/core";
const Container = () => {
  const { actions: {add}, query: { createNode, getNode } } = useEditor();
  const { id, connectors: {drag, connect}} = useNode();
  return (
    <div ref={connect(drag)}>
      ...
      <a onClick={() => {
        const { data: {type, props}} = getNode(id);
        add(
          createNode(React.createElement(type, props));
        );
      }}>
        Make a copy of me
      </a>
    </div>
  )
}

```

### Serializable state
The editor's state can be serialized into JSON which you can then apply a compression technique of your choice for storage.

```jsx
const SaveButton = () => {
  const { query } = useManager();
  return <a onClick={() => console.log(query.serialize()) }>Get JSON</a>
}
```

Of course, Craft.js will also able to recreate the entire state from the JSON string.
```jsx
const App = () => {
  const jsonString = /* retrieve JSON from server */
  return (
    <Editor>
      <Frame json={jsonString}>
        ...
      </Frame>
    </Editor>
  )
}
```

## Additional Packages :tada:
- **[@craftjs/layers](https://github.com/prevwong/craft.js/tree/master/packages/layers)** A Photoshop-like layers editor

## Acknowledgements :raised_hands:

- **[react-dnd](https://github.com/react-dnd/react-dnd)** The React drag-n-drop library. 
Although it is not actually used here, many aspects of Craft.js are written with react-dnd as a reference along with some utilities and functions being borrowed. 
- **[Grape.js](https://github.com/artf/grapesjs)** The HTML web builder framework. This has served as an inspiration for Craft.js. The element positioning logic used in Craft.js is borrowed from Grape.js
- **[use-methods](https://github.com/pelotom/use-methods)** A super handy hook when dealing with reducers. Craft.js uses a modified version of `useMethods` that works with Redux instead of `useReducer`


## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/prevwong"><img src="https://avatars3.githubusercontent.com/u/16416929?v=4" width="100px;" alt=""/><br /><sub><b>Prev Wong</b></sub></a><br /><a href="https://github.com/prevwong/craft.js/commits?author=prevwong" title="Code">💻</a> <a href="#design-prevwong" title="Design">🎨</a> <a href="https://github.com/prevwong/craft.js/commits?author=prevwong" title="Documentation">📖</a> <a href="#ideas-prevwong" title="Ideas, Planning, & Feedback">🤔</a> <a href="#example-prevwong" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/azreenashah"><img src="https://avatars0.githubusercontent.com/u/26489181?v=4" width="100px;" alt=""/><br /><sub><b>azreenashah</b></sub></a><br /><a href="https://github.com/prevwong/craft.js/commits?author=azreenashah" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!