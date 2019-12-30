import { NodeId, Node, Nodes, Options, NodeEvents } from "../interfaces";
import { EditorState, Indicator } from "../interfaces";
import { ERROR_INVALID_NODEID, ERROR_ROOT_CANVAS_NO_ID, ROOT_NODE, CallbacksFor, QueryCallbacksFor, ERROR_NOPARENT } from "@craftjs/utils";
import { QueryMethods } from "./query";
import { updateEventsNode } from "../utils/updateEventsNode";
import invariant from "tiny-invariant";

export const Actions = (state: EditorState, query: QueryCallbacksFor<typeof QueryMethods>) => {
  const _ = <T extends keyof CallbacksFor<typeof Actions>>(name: T) => Actions(state, query)[name];
  return {
    setOptions(cb: (options: Partial<Options>) => void) {
      cb(state.options);
    },
    setIndicator(indicator: Indicator | null) {
      if (indicator && (!indicator.placement.parent.dom || (indicator.placement.currentNode && !indicator.placement.currentNode.dom))) return;
      state.events.indicator = indicator;
    },
    setNodeEvent(eventType: NodeEvents, id: NodeId | null) {
      const current = state.events[eventType];
      if (current && id != current) {
        state.nodes[current].events[eventType] = false;
      }

      if (id) {
        state.nodes[id].events[eventType] = true
        state.events[eventType] = id;
      } else {
        state.events[eventType] = null;
      }
    },
    replaceNodes(nodes: Nodes) {
      state.nodes = nodes;
    },
    add(nodes: Node[] | Node, parentId?: NodeId ) {
      const isCanvas = (node: Node | NodeId) => node && (typeof node == 'string' ? node.startsWith("canvas-") : node.data.isCanvas)

      if (!Array.isArray(nodes)) nodes = [nodes];
      if (parentId && !state.nodes[parentId].data.nodes && isCanvas(parentId)) state.nodes[parentId].data.nodes = [];
      
      (nodes as Node[]).forEach(node => {
        const parent = parentId ? parentId : node.data.parent;
        invariant(parent != null, ERROR_NOPARENT);

        const parentNode = state.nodes[parent!];   
        
        if (parentNode && isCanvas(node) && !isCanvas(parentNode) ) {
          invariant(node.data.props.id, ERROR_ROOT_CANVAS_NO_ID);
          if (!parentNode.data._childCanvas) parentNode.data._childCanvas = {};
          node.data.parent = parentNode.id;
          parentNode.data._childCanvas[node.data.props.id] = node.id;
          delete node.data.props.id;
        } else {
          if ( parentId) {
            query.is(parentId).Droppable(node, (err) => {
              throw new Error(err);
            });

            if ( parentNode.data.props.children ) delete parentNode.data.props["children"];
            
            // if (parentId && !state.nodes[parentId].data.nodes) state.nodes[parentId].data.nodes = [];
            if (!parentNode.data.nodes) parentNode.data.nodes = [];
            const currentNodes = parentNode.data.nodes;
            currentNodes.splice((node.data.index !== undefined) ? node.data.index : currentNodes.length, 0, node.id);
            node.data.parent =  parent;
          }
        }        
        state.nodes[node.id] = node;
      });

     
    },
    reset() {
      state.nodes = {}
      state.events = {
          dragged: null,
          selected: null,
          hovered: null,
          indicator: null
        }
    },
    move(targetId: NodeId, newParentId: NodeId, index: number) {
      const targetNode = state.nodes[targetId],
        currentParentId = targetNode.data.parent!,
        newParent = state.nodes[newParentId],
        newParentNodes = newParent.data.nodes;

      query.is(newParentId).Droppable(targetNode, (err) => {
        throw new Error(err);
      });

      const currentParent = state.nodes[currentParentId],
            currentParentNodes = currentParent.data.nodes!;

      currentParentNodes[currentParentNodes.indexOf(targetId)] = "marked";

      if ( newParentNodes ) 
        newParentNodes.splice(index, 0, targetId);
      else 
        newParent.data.nodes = [targetId];
        
      state.nodes[targetId].data.parent = newParentId;
      state.nodes[targetId].data.index = index;
      currentParentNodes.splice(currentParentNodes.indexOf("marked"), 1);

      // updateEventsNode(state, targetId);

    },
    delete(id: NodeId) {
      invariant(id != ROOT_NODE, "Cannot delete Root node");
      const targetNode = state.nodes[id];
      if (query.is(targetNode.id).Canvas()) {
        invariant(!query.is(targetNode.id).TopLevelCanvas(), "Cannot delete a Canvas that is not a direct child of another Canvas");
        targetNode.data.nodes!.map((childId) => {
          _("delete")(childId);
        })
      }

      const parentNode = state.nodes[targetNode.data.parent],
            parentChildNodesId = parentNode.data.nodes!;

      if (parentNode && parentChildNodesId.indexOf(id) > -1) {
        parentChildNodesId.splice(parentChildNodesId.indexOf(id), 1);
      }
      updateEventsNode(state, id, true);
      delete state.nodes[id];
    },
    setProp(id: NodeId, cb: (props: any) => void) {
      invariant(state.nodes[id], ERROR_INVALID_NODEID);
      cb(state.nodes[id].data.props);
      // updateEventsNode(state, id);
    },
    setDOM(id: NodeId, dom: HTMLElement) {
      invariant(state.nodes[id], ERROR_INVALID_NODEID)
      state.nodes[id].dom = dom;
      // updateEventsNode(state, id);
    },
    setHidden(id: NodeId, bool: boolean) {
      state.nodes[id].data.hidden = bool;
    },
    setCustom<T extends NodeId>(id: T, cb: (data: EditorState['nodes'][T]['data']['custom']) => void) {
      cb(state.nodes[id].data.custom);
    }
  }
};
