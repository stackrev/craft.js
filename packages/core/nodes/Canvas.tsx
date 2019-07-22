import React, { useEffect, useMemo } from "react";
import { NodeId, Node } from "../interfaces";
import { NodeElement } from "./NodeElement";
import { SimpleElement } from "../render/RenderNode";
import { mapChildrenToNodes} from "../nodes";
import { useInternalNode } from "./useInternalNode";
import { useManager } from "../connectors";
const shortid = require("shortid");
const invariant = require("invariant");

export interface Canvas extends React.Props<any> {
  id?: NodeId,
  style?: any,
  className?: any,
  is?: React.ElementType
}


export const isCanvas = (node: Node) => node.data.type === Canvas

export const Canvas = ({id, is="div", children, ...props}: Canvas) => {
  const { actions: { add, pushChildCanvas}, query } = useManager();
  const {node, nodeId}  = useInternalNode((node) => ({node: node.data, nodeId: node.id}));
  // console.log(33, node);
  const internal = React.useRef({ id: null });
  useEffect(() => {
    let canvasId = `canvas-${shortid.generate()}`;

    if (node.type === Canvas) {
      if ( !node.nodes ) {  // don't recreate nodes from children after initial hydration
        canvasId = internal.current.id = nodeId;
        const childNodes = mapChildrenToNodes(children, (data, id) => {
          return query.createNode(data, id);
        }, {parent: canvasId});
        // console.log("addding...", nodeId)
        add(nodeId, childNodes);
      }
    } else {
      invariant(id, 'Root canvas cannot ommit `id` prop')
      if (!node._childCanvas || (node._childCanvas && !node._childCanvas[id])) {
        const rootNode = query.createNode({
          type: Canvas,
          props: {is, children, ...props},
        }, canvasId);
        internal.current.id = canvasId;
        pushChildCanvas(nodeId, id, rootNode);
      } else {
       internal.current.id = node._childCanvas[id];
      }
    }
  }, []);

  return (
    <React.Fragment>
       {
        node.type === Canvas ? (
          <SimpleElement render={React.createElement(node.subtype, props, (
            <React.Fragment>
              {
                node.nodes && node.nodes.map(((id: NodeId) => (
                  <NodeElement id={id} key={id} />
                )))
              }
            </React.Fragment>
          ))
            } />
        ) : (
            internal.current.id ? (
              <NodeElement id={internal.current.id} />
            ) : null
          )
      }
    </React.Fragment>
  )
}

// Canvas.name = 'Canvas'