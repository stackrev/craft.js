import { EditorState, Node, NodeId } from '../interfaces';
import invariant from 'tiny-invariant';
import {
  deprecationWarning,
  ERROR_CANNOT_DRAG,
  ERROR_DUPLICATE_NODEID,
  ERROR_INVALID_NODE_ID,
  ERROR_MOVE_INCOMING_PARENT,
  ERROR_MOVE_NONCANVAS_CHILD,
  ERROR_MOVE_OUTGOING_PARENT,
  ERROR_MOVE_TO_DESCENDANT,
  ERROR_MOVE_TO_NONCANVAS_PARENT,
  ERROR_MOVE_TOP_LEVEL_NODE,
  ERROR_MOVE_CANNOT_DROP,
  ROOT_NODE,
} from '@craftjs/utils';
import { serializeNode } from '../utils/serializeNode';

export function NodeHelpers(state: EditorState, id: NodeId) {
  invariant(typeof id == 'string', ERROR_INVALID_NODE_ID);

  const node = state.nodes[id];

  const nodeHelpers = (id) => NodeHelpers(state, id);

  const getNodeFromIdOrNode = (node: NodeId | Node) =>
    typeof node === 'string' ? state.nodes[node] : node;

  return {
    isCanvas() {
      return !!node.data.isCanvas;
    },
    isRoot() {
      return node.id === ROOT_NODE;
    },
    isLinkedNode() {
      return (
        node.data.parent &&
        nodeHelpers(node.data.parent).linkedNodes().includes(node.id)
      );
    },
    isTopLevelNode() {
      return this.isRoot() || this.isLinkedNode();
    },
    isDeletable() {
      return !this.isTopLevelNode();
    },
    isParentOfTopLevelNodes: () => !!node.data.linkedNodes,
    isParentOfTopLevelCanvas() {
      deprecationWarning('query.node(id).isParentOfTopLevelCanvas', {
        suggest: 'query.node(id).isParentOfTopLevelNodes',
      });
      return this.isParentOfTopLevelNodes();
    },
    get() {
      return node;
    },
    ancestors(deep = false): NodeId[] {
      function appendParentNode(
        id: NodeId,
        ancestors: NodeId[] = [],
        depth: number = 0
      ) {
        const node = state.nodes[id];
        if (!node) {
          return ancestors;
        }

        ancestors.push(id);

        if (!node.data.parent) {
          return ancestors;
        }

        if (deep || (!deep && depth === 0)) {
          ancestors = appendParentNode(node.data.parent, ancestors, depth + 1);
        }
        return ancestors;
      }
      return appendParentNode(node.data.parent);
    },
    descendants(
      deep = false,
      includeOnly?: 'linkedNodes' | 'childNodes'
    ): NodeId[] {
      function appendChildNode(
        id: NodeId,
        descendants: NodeId[] = [],
        depth: number = 0
      ) {
        if (deep || (!deep && depth === 0)) {
          const node = state.nodes[id];

          if (!node) {
            return descendants;
          }

          if (includeOnly !== 'childNodes') {
            // Include linkedNodes if any
            const linkedNodes = nodeHelpers(id).linkedNodes();

            linkedNodes.forEach((nodeId) => {
              descendants.push(nodeId);
              descendants = appendChildNode(nodeId, descendants, depth + 1);
            });
          }

          if (includeOnly !== 'linkedNodes') {
            const childNodes = node.data.nodes;

            // Include child Nodes if any
            if (childNodes) {
              childNodes.forEach((nodeId) => {
                descendants.push(nodeId);
                descendants = appendChildNode(nodeId, descendants, depth + 1);
              });
            }
          }

          return descendants;
        }
        return descendants;
      }
      return appendChildNode(id);
    },
    linkedNodes() {
      return Object.values(node.data.linkedNodes || {});
    },
    isDraggable(onError?: (err: string) => void) {
      try {
        const targetNode = node;
        invariant(!this.isTopLevelNode(), ERROR_MOVE_TOP_LEVEL_NODE);
        invariant(
          NodeHelpers(state, targetNode.data.parent).isCanvas(),
          ERROR_MOVE_NONCANVAS_CHILD
        );
        invariant(
          targetNode.rules.canDrag(targetNode, nodeHelpers),
          ERROR_CANNOT_DRAG
        );
        return true;
      } catch (err) {
        if (onError) {
          onError(err);
        }
        return false;
      }
    },
    isDroppable(target: NodeId | Node, onError?: (err: string) => void) {
      const isNewNode = typeof target == 'object' && !state.nodes[target.id];
      const targetNode = getNodeFromIdOrNode(target),
        newParentNode = node;
      try {
        //  If target is a NodeId (thus it's already in the state), check if it's a top-level node
        if (typeof target === 'string') {
          invariant(
            !nodeHelpers(target).isTopLevelNode(),
            ERROR_MOVE_TOP_LEVEL_NODE
          );
        }

        invariant(this.isCanvas(), ERROR_MOVE_TO_NONCANVAS_PARENT);
        invariant(
          newParentNode.rules.canMoveIn(targetNode, newParentNode, nodeHelpers),
          ERROR_MOVE_INCOMING_PARENT
        );

        invariant(
          targetNode.rules.canDrop(newParentNode, targetNode, nodeHelpers),
          ERROR_MOVE_CANNOT_DROP
        );

        if (isNewNode) {
          return true;
        }

        const targetDeepNodes = nodeHelpers(targetNode.id).descendants(true);

        invariant(
          !targetDeepNodes.includes(newParentNode.id) &&
            newParentNode.id !== targetNode.id,
          ERROR_MOVE_TO_DESCENDANT
        );

        const currentParentNode =
          targetNode.data.parent && state.nodes[targetNode.data.parent];

        invariant(currentParentNode.data.isCanvas, ERROR_MOVE_NONCANVAS_CHILD);

        invariant(
          currentParentNode ||
            (!currentParentNode && !state.nodes[targetNode.id]),
          ERROR_DUPLICATE_NODEID
        );

        // If the Node we're checking for is not the same as the currentParentNode
        // Check if the currentParentNode allows the targetNode to be dragged out
        if (node !== currentParentNode) {
          invariant(
            currentParentNode.rules.canMoveOut(
              targetNode,
              currentParentNode,
              nodeHelpers
            ),
            ERROR_MOVE_OUTGOING_PARENT
          );
        }

        return true;
      } catch (err) {
        if (onError) {
          onError(err);
        }
        return false;
      }
    },
    toSerializedNode() {
      return serializeNode(node.data, state.options.resolver);
    },
    toNodeTree(includeOnly?: 'linkedNodes' | 'childNodes') {
      const nodes = [id, ...this.descendants(true, includeOnly)].reduce(
        (accum, descendantId) => {
          accum[descendantId] = nodeHelpers(descendantId).get();
          return accum;
        },
        {}
      );

      return {
        rootNodeId: id,
        nodes,
      };
    },

    /**
     Deprecated NodeHelpers
     **/

    decendants(deep = false) {
      deprecationWarning('query.node(id).decendants', {
        suggest: 'query.node(id).descendants',
      });
      return this.descendants(deep);
    },
    isTopLevelCanvas() {
      return !this.isRoot() && !node.data.parent;
    },
  };
}
