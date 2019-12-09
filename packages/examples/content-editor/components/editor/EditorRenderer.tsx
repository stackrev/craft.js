import React, { useEffect, Ref, useRef, useMemo } from 'react';
import { useManager } from 'craftjs';
import cx from "classnames";

export const EditorRenderer = ({children, ...props}) => {
  const { actions, connectors, enabled } = useManager((state) => ({enabled: state.options.enabled}));


  return (  
    <div className="flex-1 h-full">
      <div className="w-full h-full">
        {/* <div className="w-full bg-light-gray-1 py-1">
          <h1>Dashboard</h1>
        </div> */}
        <div
          className={cx(["craftjs-renderer  w-full transition", {
            "overflow-auto" : enabled,
            "bg-renderer-gray": enabled,
            "h-screen": enabled,
            "h-full" : !enabled
          }])}
          // ref={ref => connectors.active(connectors.hover(ref, null), null)}
        >
          <div className="py-4 relative flex-col flex items-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}