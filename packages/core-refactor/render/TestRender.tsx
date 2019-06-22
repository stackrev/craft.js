import React from "react";
import ReactDOM from "react-dom";
import cx from "classnames";
import ActiveHandler from "./handlers/ActiveHandler";
import DragHandler from "./handlers/DragHandler";

class Toolbar extends React.PureComponent<any> {
 render() {
    const {node, events, editor, Component} = this.props;
    const { type } = node;
    const {hover, active } = events;
    const info = (hover || active).info;
    
    return ReactDOM.createPortal(
      <div onMouseDown={(e: React.MouseEvent) => {
        e.stopPropagation();
        return false;

      }} className={`toolbar`} style={{
        position:'fixed',
        minWidth: `${info.width}px`,
        top: `${info.top - 41}px`,
        left: `${info.left}px`
      }}>
        <span className={'tag'}>{typeof type === "string" ? type : type.name }</span>
        <div className={'actions'}>
          <DragHandler is="a">
            Move
          </DragHandler>
        {/* {connectDragStart(<a>Move</a>)} */}
        </div>
      </div>,
      document.getElementById("canvasTools")
    )
  }
}
export default class TestRender extends React.PureComponent<any> {
  dom:HTMLElement = null
 
  render() {
      const {events, handlers, Editor, Component} = this.props;
      const { hover, active } = events;

      return (
          <React.Fragment>
            {(hover || active) && <Toolbar  {...this.props} /> }
              <Component
                className={
                  cx(['node-el'], {
                    hover,
                  })
                }
              />
            {/* {active && Editor && (
              <div style={{float:"left", width:"100%", padding: "20px 30px"}} onMouseDown={(e: React.MouseEvent) => {
                e.stopPropagation();
                return false;
              }} >
                <Editor />
              </div>
            )} */}
          </React.Fragment>
        )
  }
}