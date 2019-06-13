import React from "react";
import ReactDOM from "react-dom";

import { NodeInfo, Node, BuilderContextState, Nodes, CanvasNode, DOMInfo } from "~types";
import BuilderContext from "../Builder/BuilderContext";
import RenderNodeWithContext from "./RenderNodeWithContext";
import NodeContext from "./NodeContext";
import TestRender from "./TestRender";
export default class RenderDraggableNode extends React.PureComponent<any> {
  dom: HTMLElement = null;
  node: Node = null;
  info: NodeInfo = {};
  clickWrapper: EventListenerOrEventListenerObject = this.click.bind(this);
  dragStartWrapper: EventListenerOrEventListenerObject = this.dragStart.bind(this);
  dragWatchWrapper: EventListenerOrEventListenerObject = this.dragWatch.bind(this);
  dragEndWrapper: EventListenerOrEventListenerObject = this.dragEnd.bind(this);
  blockSelectionWrapper: EventListenerOrEventListenerObject = this.blockSelection.bind(this);
  blockSelection(e: MouseEvent) {
    const selection = window.getSelection ? window.getSelection() : (document as any).selection ? (document as any).selection : null;
    if(!!selection) selection.empty ? selection.empty() : selection.removeAllRanges();
    e.preventDefault();
  }

  click(e: MouseEvent) {
    console.log("clicked.")
    e.stopPropagation();
    if (e.which !== 1) return;
    const { node, builder} = this.context;
    const { setActive } = builder;
    // Active element, now we'll be able to edit its' props
    setActive(node.id);
  }

  dragStart(e: MouseEvent) {
    e.stopPropagation();
    if (e.which !== 1) return;
    console.log('drag start.')
    window.addEventListener("mousemove", this.dragWatchWrapper);
    window.addEventListener("mouseup", this.dragEndWrapper);
    window.addEventListener("selectstart", this.blockSelectionWrapper);
  }

  dragWatch(e: MouseEvent) {
    const {node, builder} = this.context;
    const { active, dragging, setDragging } = builder;
    const { dom } = builder.nodesInfo[node.id]
    if ( !active ) return;
    if (
      !(
        e.clientX >= dom.left &&
        e.clientX <= dom.right &&
        e.clientY >= dom.top &&
        e.clientY <= dom.bottom
      ) &&
      !dragging
    ) {
      // Element being dragged
      setDragging(active.id);
    }
  }

  dragEnd(e: MouseEvent) {
    window.removeEventListener("mouseup", this.dragEndWrapper);
    window.removeEventListener("mousemove", this.dragWatchWrapper);
    window.removeEventListener("selectstart", this.blockSelectionWrapper);

    const {node, builder} = this.context;
    const { active, dragging, placeholder, setDragging, setNodes }: BuilderContextState = builder;
    if (!dragging) return;

    const { id: dragId, parent: dragParentId } = dragging;
    const { placement } = placeholder;
    const { parent, index, where } = placement;
    const { id: parentId, nodes } = parent;

    setNodes((stateNodes: Nodes) => {
      const currentParentNodes = (stateNodes[dragParentId] as CanvasNode).nodes,
        newParentNodes = (stateNodes[parentId] as CanvasNode).nodes;

      currentParentNodes.splice(currentParentNodes.indexOf(dragId), 1);
      newParentNodes.splice(index + (where === "after" ? 1 : 0), 0, dragId);
      stateNodes[dragId].parent = parentId;
      return stateNodes;
    });

    setDragging(null);
  }

  componentDidMount() {
    if ( this.dom ) {
      this.dom.addEventListener("click", this.clickWrapper)
    }
  }
  attachClickHandler(target: HTMLElement) {
    target.addEventListener("mousedown", this.clickWrapper);
  }
  attachDragHandler(target: HTMLElement) {
    target.addEventListener("mousedown", this.dragStartWrapper);
  }

  render() {
   
    return (
      <NodeContext.Consumer>
        {({node, builder}) => {
          const {active, dragging} = builder;
          return (
            <TestRender 
              Component={RenderNodeWithContext} 
              nodeState={{
                active: active && active.id === node.id,
                dragging: dragging && dragging.id === node.id
              }}
              handlers={{
                clickHandler: (target: HTMLElement) => this.attachClickHandler(target),
                dragHandler: (target: HTMLElement) => this.attachDragHandler(target)
              }}
            />
          )
        }}
      </NodeContext.Consumer>
    )
  }
}



RenderDraggableNode.contextType = NodeContext;