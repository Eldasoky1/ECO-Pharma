import { useTheme } from './theme-provider'
import SpecularButtonBase from './react-bits/SpecularButton'

const VARIANTS = {
  primary: {
    light: {
      tint: '#00685b',
      tintOpacity: 0.94,
      textColor: '#ffffff',
      lineColor: '#9ef8e0',
      baseColor: '#00564a'
    },
    dark: {
      tint: '#64dac4',
      tintOpacity: 0.94,
      textColor: '#00382f',
      lineColor: '#d9fff4',
      baseColor: '#00564a'
    }
  },
  glass: {
    light: {
      tint: '#ffffff',
      tintOpacity: 0.1,
      blur: 12,
      textColor: '#191c1b',
      lineColor: '#00685b',
      baseColor: '#00685b'
    },
    dark: {
      tint: '#ffffff',
      tintOpacity: 0.08,
      blur: 12,
      textColor: '#e1e3e0',
      lineColor: '#64dac4',
      baseColor: '#64dac4'
    }
  },
  ghost: {
    light: {
      tint: '#ffffff',
      tintOpacity: 0,
      textColor: '#00685b',
      lineColor: '#00685b',
      baseColor: '#00685b'
    },
    dark: {
      tint: '#ffffff',
      tintOpacity: 0,
      textColor: '#64dac4',
      lineColor: '#64dac4',
      baseColor: '#64dac4'
    }
  },
  neutral: {
    light: {
      tint: '#e8ebe9',
      tintOpacity: 0.92,
      textColor: '#191c1b',
      lineColor: '#00685b',
      baseColor: '#bec9c5'
    },
    dark: {
      tint: '#272b29',
      tintOpacity: 0.92,
      textColor: '#e1e3e0',
      lineColor: '#64dac4',
      baseColor: '#3f4946'
    }
  },
  danger: {
    light: {
      tint: '#ba1a1a',
      tintOpacity: 0.92,
      textColor: '#ffffff',
      lineColor: '#ffb4ab',
      baseColor: '#8c0f0f'
    },
    dark: {
      tint: '#ffb4ab',
      tintOpacity: 0.92,
      textColor: '#690005',
      lineColor: '#ffd9d4',
      baseColor: '#93000a'
    }
  }
}

export function SpecularButton({
  variant = 'primary',
  size = 'md',
  radius = 18,
  children,
  className = '',
  ...props
}) {
  const { theme } = useTheme()
  const palette = VARIANTS[variant]?.[theme] ?? VARIANTS.primary[theme]

  return (
    <SpecularButtonBase
      size={size}
      radius={radius}
      tint={palette.tint}
      tintOpacity={palette.tintOpacity}
      blur={palette.blur ?? 0}
      textColor={palette.textColor}
      lineColor={palette.lineColor}
      baseColor={palette.baseColor}
      className={className}
      {...props}
    >
      {children}
    </SpecularButtonBase>
  )
}

export { VARIANTS }
