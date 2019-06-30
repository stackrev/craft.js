import React, { useEffect, useRef } from "react";
import { Canvas } from "../nodes/Canvas";
import { PublicManagerMethods } from "../manager/methods";
import { isDOMComponent } from "../utils";
import { ConnectedPublicNode, connectNode } from "../nodes/connectors";

export type Render = {
  is: React.ComponentType<any>
} & ConnectedPublicNode

const Render: React.FC<any> = React.memo(({craft:{node, connectTarget}, is, ...injectedProps}: Render) => {
  let { type, props } = node;
  const {children, ...propsWithoutChildren} = props;

  let Comp = is ? is : type;

  if ( type === Canvas && !is ) {
    return <Canvas {...props} />;
  } 

  const availableProps = (type === Canvas) ? propsWithoutChildren : props;

  let render = React.cloneElement(<Comp {...availableProps} {...injectedProps} />);

  if ( isDOMComponent(Comp)) render = connectTarget(render);
  return render;
});

export const RenderNodeToElement = connectNode(Render);