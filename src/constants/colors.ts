// Marker colors
export const MARKER_COLORS = {
  active: '#2196F3',
  lost: '#FF9800',
  white: '#ffffff',
} as const;

// Cluster colors
export const CLUSTER_COLORS = {
  small: '#2196F3',
  smallMedium: '#ffc107',
  medium: '#ff9800',
  mediumLarge: '#ff5722',
  large: '#f44336',
} as const;

// Shadow and effects
export const EFFECTS = {
  shadowOpacity: 0.3,
  glowOpacityDefault: 0.2,
  glowOpacitySelected: 0.4,
  innerHighlightOpacity: 0.8,
} as const;

// Cluster thresholds for color changes
export const CLUSTER_THRESHOLDS = {
  small: 10,
  medium: 20,
  mediumLarge: 50,
  large: 100,
} as const;
