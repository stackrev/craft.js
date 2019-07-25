import React, { useContext } from "react";
import { PlaceholderInfo } from "../dnd/interfaces";
import { RootContext } from "../RootContext";
import { CSSObject } from "styled-components";

export type Placeholder = {
  placeholder: PlaceholderInfo,
  suggestedStyles: CSSObject
}

export const defaultPlaceholder: React.FC<Placeholder> = ({ placeholder: { error }, suggestedStyles}) => {

  return (
    <div
      style={{
        position: 'fixed',
        display: 'block',
        opacity: 1,
        background: error ? 'red': 'rgb(98, 196, 98)',
        borderColor: 'rgb(98, 196, 98)',
        borderStyle: 'solid',
        borderWidth: '0px',
        ...suggestedStyles
      }}
    >
    </div>
  )
}


export const RenderPlaceholder: React.FC<Placeholder> = ({ placeholder, suggestedStyles }) => {
  const { options: { renderPlaceholder} } = useContext(RootContext);
  return React.createElement(renderPlaceholder, { placeholder, suggestedStyles });
}