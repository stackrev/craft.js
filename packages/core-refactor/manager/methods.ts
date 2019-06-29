import { NodeId, Node, CanvasNode } from "../nodes";
import { ManagerState } from ".";
import { CallbacksFor } from "use-methods";

const PublicManagerMethods = (state: ManagerState) => {
  return {
    add(parentId: NodeId, nodes: Node[] | Node) {
      if (parentId && !(state.nodes[parentId] as CanvasNode).nodes) (state.nodes[parentId] as CanvasNode).nodes = []
  
      if (Array.isArray(nodes)) {
        (nodes as Node[]).forEach(node => {
          state.nodes[node.id] = node;
          if (parentId) (state.nodes[parentId] as CanvasNode).nodes.push(node.id);
        });
      } else {
        const node = nodes as Node;
        state.nodes[node.id] = node;
        if (parentId) (state.nodes[parentId] as CanvasNode).nodes.push(node.id);
      }
    },
    move(targetId: NodeId, newParentId: NodeId, index: number) {
      const targetNode = state.nodes[targetId],
        currentParentNodes = (state.nodes[targetNode.parent] as CanvasNode).nodes,
        newParentNodes = (state.nodes[newParentId] as CanvasNode).nodes;
  
      currentParentNodes[currentParentNodes.indexOf(targetId)] = "marked";
      newParentNodes.splice(index, 0, targetId);
      state.nodes[targetId].parent = newParentId;
      state.nodes[targetId].closestParent = newParentId;
      currentParentNodes.splice(currentParentNodes.indexOf("marked"), 1);
    }
  }
};

const ManagerMethods = (state: ManagerState) => ({
  pushChildCanvas(id: NodeId, canvasName: string, newNode: Node) {
    if (!state.nodes[id]._childCanvas) state.nodes[id]._childCanvas = {};
    state.nodes[id]._childCanvas[canvasName] = newNode.id;
    state.nodes[newNode.id] = newNode;
  },
  setNodeEvent(eventType: "active" | "hover" | "dragging", node: Node) {
    if (!["active", "hover", "dragging"].includes(eventType)) throw new Error(`Undefined event "${eventType}, expected either "active", "hover" or "dragging".`);
    if (node) {
      state.events[eventType] = node;
    } else {
      state.events[eventType] = null;
    }
  },
  ...PublicManagerMethods(state)
});

export type PublicManagerMethods = CallbacksFor<typeof PublicManagerMethods>
export type ManagerMethods = CallbacksFor<typeof ManagerMethods>

export default ManagerMethods;