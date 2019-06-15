import { BuilderContextState, NodeElementState, NodeElementProps, NodeId } from "~types";
import React from "react";
import NodeContext from "./NodeContext";
import BuilderContext from "../Builder/BuilderContext";
import NodeCanvasContext from "./NodeCanvasContext";

export default class NodeElement extends React.Component<NodeElementProps> {
  loopInfo = {
    index: 0
  }
  state: NodeElementState = {
    childCanvas: {},
  }
  componentDidUpdate() {
    this.loopInfo.index = 0;
  }
  constructor(props, context) {
    super(props);
    if (this.props.node && this.props.node.childCanvas) this.state.childCanvas = this.props.node.childCanvas;
  }
  render() {
    const { node } = this.props;
    const { childCanvas } = this.state;
    return (
      <BuilderContext.Consumer>
        {(builder: BuilderContextState) => {
          const state =  {
            active: builder.active && builder.active.id === node.id,
            dragging: builder.dragging && builder.dragging.id === node.id
          };
          return (
            <NodeContext.Provider value={{
              node,
              state,
              builder
            }}>
              <NodeCanvasContext.Provider value={{
                 node,
                 builder,
                 childCanvas,
                 pushChildCanvas: (canvasId: string, canvasNodeId: NodeId) => {
                  if (!node.childCanvas) node.childCanvas = {};
                  this.setState((state: NodeElementState) => {
                    state.childCanvas[canvasId] = node.childCanvas[canvasId] = canvasNodeId;
                    return state;
                  });
                }
              }}> 
                {
                  this.props.children
                }
              </NodeCanvasContext.Provider>
            </NodeContext.Provider>
          )
        }}
      </BuilderContext.Consumer>
    )
  }
}

