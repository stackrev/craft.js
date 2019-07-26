import React, { useMemo, useContext, useLayoutEffect } from "react";
import { NodeElement, Canvas, mapChildrenToNodes } from "../nodes";
import DNDManager from "../dnd";
import { useManager } from "../connectors";
import { RootContext } from "../root/RootContext";
import { ROOT_NODE } from "../utils/constants";
const invariant = require("invariant");

export const Renderer: React.FC = ({
  children
}) => {
  const { options:{nodes, resolver, onRender, renderPlaceholder }} = useContext(RootContext);
  const { rootNode, actions: { add, replaceNodes }, query: { deserialize, createNode } } = useManager((state) => ({ rootNode: state.nodes[ROOT_NODE]}));

  useLayoutEffect(() => {
    if (!nodes) {
      const rootCanvas = React.Children.only(children) as React.ReactElement;
      invariant(rootCanvas.type && rootCanvas.type == Canvas, "The immediate child of <Renderer /> has to be a Canvas");
      let node = mapChildrenToNodes(rootCanvas, { hardId: ROOT_NODE});
      add(node);
    } else {
      const rehydratedNodes = deserialize(nodes, resolver);
      replaceNodes(rehydratedNodes);
    }
  }, []);

  return useMemo(() => (
      <DNDManager>
        {
          rootNode ? (
          <NodeElement id={ROOT_NODE} />
          ) : null
        }
      </DNDManager>
  ), [rootNode])
}

