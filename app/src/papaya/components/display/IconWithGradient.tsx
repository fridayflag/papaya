import { Icon, IconProps } from '@mui/material'
import { CSSProperties } from 'react'

interface IconWithGradientProps extends IconProps {
  // icon: string;
  primaryColor: string
  secondaryColor: string
}

export const IconWithGradient = (props: IconWithGradientProps) => {
  const { primaryColor, secondaryColor, style, ...rest } = props

  return (
    <Icon
      style={
        {
          background: `-webkit-linear-gradient(left, ${primaryColor} 25%, ${secondaryColor} 75%)`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        } as CSSProperties
      }
      {...rest}
    />
  )
}
