// Valores usados en props que no aceptan className (ej: color= de Ionicons, sombras con StyleSheet)

export const colors = {
  primary:  '#458EFF',
  neutral:  '#121535',
  success:  '#2ABC79',
  warning:  '#FF9F29',
  danger:   '#EF4444',
  info:     '#3B82F6',
  white:    '#ffffff',
  gray400:  '#999999',
  gray500:  '#808080',
  gray800:  '#333333',
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;
