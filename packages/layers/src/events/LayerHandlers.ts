import { Handlers } from "@craftjs/utils";
import { NodeId, Node } from "@craftjs/core";
import { LayerIndicator } from "interfaces";

export class LayerHandlers extends Handlers {
  name = "layer";
  id;
  layerStore;

  static draggedNode;
  static events: {
    indicator: LayerIndicator;
    currentCanvasHovered: Node;
  } = {
    indicator: null,
    currentCanvasHovered: null
  };
  static currentCanvasHovered;

  constructor(store, layerStore, layerId) {
    super(store);
    this.id = layerId;
    this.layerStore = layerStore;
  }

  getLayer(id) {
    return this.layerStore.getState().layers[id];
  }

  handlers() {
    const parentConnectors = this.parent.connectors();
    return {
      layer: {
        init: el => {
          parentConnectors.select(el, this.id);
          parentConnectors.hover(el, this.id);
          parentConnectors.drag(el, this.id);

          this.layerStore.actions.setDOM(this.id, {
            dom: el
          });
        },
        events: [
          [
            "mouseover",
            (e: MouseEvent, id) => {
              e.stopPropagation();
              this.layerStore.actions.setLayerEvent("hovered", id);
            }
          ],
          [
            "dragover",
            e => {
              e.preventDefault();
              e.stopPropagation();

              const { indicator, currentCanvasHovered } = LayerHandlers.events;

              if (
                currentCanvasHovered &&
                indicator &&
                currentCanvasHovered.data.nodes
              ) {
                const heading = this.getLayer(
                  currentCanvasHovered.id
                ).headingDom.getBoundingClientRect();

                if (
                  e.clientY > heading.top + 10 &&
                  e.clientY < heading.bottom - 10
                ) {
                  const currNode =
                    currentCanvasHovered.data.nodes[
                      currentCanvasHovered.data.nodes.length - 1
                    ];
                  if (!currNode) return;
                  indicator.placement.currentNode = this.editor.query
                    .node(currNode)
                    .get();
                  indicator.placement.index =
                    currentCanvasHovered.data.nodes.length;
                  indicator.placement.where = "after";
                  indicator.placement.parent = currentCanvasHovered;

                  LayerHandlers.events.indicator = {
                    ...indicator,
                    onCanvas: true
                  };

                  this.layerStore.actions.setIndicator(
                    LayerHandlers.events.indicator
                  );
                }
              }
            }
          ],
          [
            "dragenter",
            e => {
              e.preventDefault();
              e.stopPropagation();

              const dragId = LayerHandlers.draggedNode;

              if (!dragId) return;

              let target = this.id;

              const indicatorInfo = this.editor.query.getDropPlaceholder(
                dragId,
                target,
                { x: e.clientX, y: e.clientY },
                node => {
                  const layer = this.getLayer(node.id);
                  return layer && layer.dom;
                }
              );

              if (indicatorInfo) {
                const {
                  placement: { parent }
                } = indicatorInfo;
                const parentHeadingInfo = this.getLayer(
                  parent.id
                ).headingDom.getBoundingClientRect();

                LayerHandlers.events.currentCanvasHovered = null;
                if (this.editor.query.node(parent.id).isCanvas()) {
                  if (parent.data.parent) {
                    const grandparent = this.editor.query
                      .node(parent.data.parent)
                      .get();
                    if (this.editor.query.node(grandparent.id).isCanvas()) {
                      LayerHandlers.events.currentCanvasHovered = parent;
                      if (
                        (e.clientY > parentHeadingInfo.bottom - 10 &&
                          !this.getLayer(parent.id).expanded) ||
                        e.clientY < parentHeadingInfo.top + 10
                      ) {
                        indicatorInfo.placement.parent = grandparent;
                        indicatorInfo.placement.currentNode = parent;
                        indicatorInfo.placement.index = grandparent.data.nodes
                          ? grandparent.data.nodes.indexOf(parent.id)
                          : 0;
                        if (
                          e.clientY > parentHeadingInfo.bottom - 10 &&
                          !this.getLayer(parent.id).expanded
                        ) {
                          indicatorInfo.placement.where = "after";
                        } else if (e.clientY < parentHeadingInfo.top + 10) {
                          indicatorInfo.placement.where = "before";
                        }
                      }
                    }
                  }
                }

                LayerHandlers.events.indicator = {
                  ...indicatorInfo,
                  onCanvas: false
                };

                this.layerStore.actions.setIndicator(
                  LayerHandlers.events.indicator
                );
              }
            }
          ],
          [
            "dragend",
            (e: MouseEvent) => {
              e.stopPropagation();
              const events = LayerHandlers.events;

              if (events.indicator && !events.indicator.error) {
                const { placement } = events.indicator;
                const { parent, index, where } = placement;
                const { id: parentId } = parent;

                this.editor.actions.move(
                  LayerHandlers.draggedNode as NodeId,
                  parentId,
                  index + (where === "after" ? 1 : 0)
                );
              }

              LayerHandlers.draggedNode = null;
              this.layerStore.actions.setIndicator(null);
            }
          ]
        ]
      },
      layerHeader: {
        init: el => {
          this.layerStore.actions.setDOM(this.id, {
            headingDom: el
          });
        }
      },
      drag: {
        init: el => {
          el.setAttribute("draggable", true);

          return () => {
            el.removeAttribute("draggable");
          };
        },
        events: [
          [
            "dragstart",
            (e: MouseEvent) => {
              e.stopPropagation();

              LayerHandlers.draggedNode = this.id;
            }
          ]
        ]
      }
    };
  }
}
