import React, { ReactNode } from "react";
import { defineReactiveProperty } from ".";
import { Canvas } from "../nodes/Canvas";
import { NodeId, Node, Nodes, CanvasNode } from "../interfaces";
import { TreeNode } from "~types";
import produce from "immer";

const shortid = require("shortid");

export const createNode = (component: React.ElementType, props: React.Props<any>, id: NodeId, parent?: NodeId): Node => {
  let node = produce({}, (node: Node) => {
    node.data = {
      type: component as React.ElementType,
      props: props,
      id: id,
      parent :parent,
      closestParent: parent,
      event: {
        active: false,
        dragging: false,
        hover: false
      }
    };
    node.ref = {
      dom: null
    }
  }) as Node;

  // node = {
  //   type: component as React.ElementType,
  //   props,
  //   id,
  //   parent,
  //   closestParent: parent
  // }
  return node;
};


export const mapChildrenToNodes = (children: ReactNode, parent?: NodeId, hardId?: string): Node[] => {
  return React.Children.toArray(children).reduce(
    (result: Node[], child: React.ReactElement | string) => {
      if (typeof (child) === "string") {
        child = React.createElement(TextNode, {text: child}, null);
      }
      let { type, props } = child;

      if ( ["string", "function"].includes(typeof(type))) { 
        const prefix = (type as Function) === Canvas ? "canvas" : "node";
        const id = hardId ? hardId : `${prefix}-${shortid.generate()}`;

        let node = createNode(type as React.ElementType, props, id, parent);
        result.push(node);
        return result;
      } else {
        throw new Error("Invalid <Canvas> child provided. Expected simple JSX element or React Component.");
      }
    },
    []
  ) as Node[]
};



export const makePropsReactive = (nodes: Nodes, cb: Function) => {
  Object.keys(nodes).forEach(id => {
    const node = nodes[id];
    let {props} = node.data;
    const reactiveProps = Object.keys(props).reduce((result: any, key) => {
      const value = (props as any)[key];
      if ( key !== "children" ) {
        defineReactiveProperty(result, key, value, () => {
          cb()
        });
      } else {
        result[key] = value
      }

      return result;
    }, {});
    node.data.props = reactiveProps;
  })
}

export class TextNode extends React.Component<{text: string}> {
  render() {
    const {text} = this.props;
    return React.createElement('span', null, text);
  }
}
  
export const nodesToTree = (nodes: Nodes, cur="rootNode", canvasName?: string): TreeNode => {
  let tree: any = {};
  const node = nodes[cur];
  if ( !node ) return null;
  const {id } = node.data;
  tree[id] = {
    ...node
  }
  if ( canvasName ) tree[id].canvasName = canvasName;

  if ( node.data._childCanvas || (node as CanvasNode).data.nodes ) tree[id].children = {};
  if ( node.data._childCanvas ) {
    Object.keys(node.data._childCanvas).forEach(canvasName => {
      const virtualId = node.data._childCanvas[canvasName]
      tree[id].children[virtualId] = nodesToTree(nodes, virtualId, canvasName);
    });
  } else if ( (node as CanvasNode).data.nodes ) {
    const childNodes = (node as CanvasNode).data.nodes;
    tree[id].nodes = childNodes;
    childNodes.forEach(nodeId => {
      tree[id].children[nodeId] = nodesToTree(nodes, nodeId);
    });
  }

  return tree[id];
}

export const getDeepChildrenNodes = (nodes: Nodes, id: NodeId, result: NodeId[] = []) => {
  result.push(id);
  const node = nodes[id];
  if ( node.data._childCanvas ) {
    Object.keys(node.data._childCanvas).map(canvasName => {
      const virtualId = node.data._childCanvas[canvasName];
      getDeepChildrenNodes(nodes, virtualId, result);
    })
  } else if ( (node as CanvasNode).data.nodes ) {
    const childNodes = (node as CanvasNode).data.nodes;
    childNodes.forEach(nodeId => {
      getDeepChildrenNodes(nodes, nodeId, result);
    });
  }

  return result;
}

export const getAllParents = (nodes: Nodes, nodeId: NodeId, result:NodeId[] = []) => {
  const node = nodes[nodeId];
  const parent = node.data.closestParent;
  if ( parent ) {
    result.push(parent);
    getAllParents(nodes, parent, result);
  }

  return result;
}