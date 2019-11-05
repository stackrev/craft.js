import React, { useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Grid, Slider, makeStyles, RadioGroup } from '@material-ui/core'
import { useNode } from 'craftjs';
import { ToolbarTextInput } from './ToolbarTextInput'
import { ToolbarDropdown } from './ToolbarDropdown'
import { withStyles } from '@material-ui/styles';
const iOSBoxShadow =
  '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const SliderStyled = withStyles({
  root: {
    color: '#3880ff',
    height: 2,
    padding: '5px 0',
    width: "100%"
  },
  thumb: {
    height: 14,
    width: 14,
    backgroundColor: '#fff',
    boxShadow: iOSBoxShadow,
    marginTop: -7,
    marginLeft: -7,
    '&:focus,&:hover,&$active': {
      boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        boxShadow: iOSBoxShadow,
      },
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 11px)',
    top: -22,
    '& *': {
      background: 'transparent',
      color: '#000',
    },
  },
  track: {
    height: 2,
  },
  rail: {
    height: 2,
    opacity: 0.5,
    backgroundColor: '#bfbfbf',
  },
  mark: {
    backgroundColor: '#bfbfbf',
    height: 8,
    width: 1,
    marginTop: -3,
  },
  markActive: {
    opacity: 1,
    backgroundColor: 'currentColor',
  },
})(Slider);

export type ToolbarItem = {
  prefix?: string;
  label?: string;
  full?: boolean;
  propKey?: string;  
  children?: React.ReactNode;  
  type: string;
  onChange?: (value: any) => any
}
export const ToolbarItem = ({  full = false, propKey, type, onChange, ...props }: ToolbarItem) => {

  const { actions, value } = useNode((node) => ({ value: node.data.props[propKey] }));
    return (
        <Grid item xs={full ? 12 : 6}>
          <div className='mb-2'>
           {
             ['text', 'color', 'bg', 'number'].includes(type) ? (
            <ToolbarTextInput {...props} type={type} value={value} onChange={(value) => {
              actions.setProp((props: any) => {
                props[propKey] = onChange ? onChange(value) : value
              })
            
            }} />
             ) : type == 'slider' ? (
              <>
                {
                  props.label ? <h4 className='text-sm text-light-gray-2'>{props.label}</h4> : null
                }
                <SliderStyled value={value || 0} onChange={(e, value: number) => {
                
                  actions.setProp((props: any) => {
                    // console.log("updating", propKey, value)
                    props[propKey] = onChange ? onChange(value) : value;
                  })
                }} />
              </>
             ) : type == 'radio' ? (
              <>
                {
                  props.label ? <h4 className='text-sm text-light-gray-2'>{props.label}</h4> : null
                }
                <RadioGroup value={value || 0} onChange={(e) => {
                  const value = e.target.value;
                  actions.setProp((props: any) => {
                    // console.log("updating", propKey, value)
                    props[propKey] = onChange ? onChange(value) : value;
                  })
                }}>
                  {props.children}
                </RadioGroup>
              </>
             ) : type == 'select' ? (
               <ToolbarDropdown value={value || ''} onChange={(value) => actions.setProp((props: any) => props[propKey] = onChange ? onChange(value) : value)}  {...props} />
             ) : null
           }
           </div>
        </Grid>
    )
}
