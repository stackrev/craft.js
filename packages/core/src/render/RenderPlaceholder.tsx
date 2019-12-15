import React, { useContext } from "react";
import { Indicator } from "craftjs";
import { useEditor } from "../connectors";

export type Placeholder = {
  placeholder: Indicator,
  suggestedStyles: any
}

export const RenderPlaceholder: React.FC<Placeholder> = ({ placeholder, suggestedStyles }) => {
  const { indicator } = useEditor((state) => ({ 
    indicator: state.options.indicator 
  }));
  
  return (
    <div
      style={{
        position: 'fixed',
        display: 'block',
        opacity: 1,
        borderColor: placeholder.error ? indicator.error : indicator.success,
        borderStyle: 'solid',
        borderWidth: '1px',
        zIndex: "99999",
        ...suggestedStyles
      }}
    >
    </div>
  )
}