import { divIcon } from 'leaflet';
import { useMemo } from 'react';

import { EFFECTS, MARKER_COLORS } from '../../constants';

interface MarkerIconProps {
  heading: number;
  status: 'active' | 'lost';
  isSelected?: boolean;
}

export const useMarkerIcon = ({ heading, status, isSelected = false }: MarkerIconProps) => {
  const markerIcon = useMemo(() => {
    const color = status === 'active' ? MARKER_COLORS.active : MARKER_COLORS.lost;
    const iconSize = isSelected ? 56 : 48;
    const strokeWidth = isSelected ? 2.5 : 2;

    // Modern marker design with arrow pointing in heading direction
    const svg = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Glow effect for selected object -->
        ${isSelected ? `<circle cx="24" cy="24" r="22" fill="none" stroke="${color}" stroke-width="3" opacity="0.3" filter="url(#glow)"/>` : ''}

        <!-- Outer glow -->
        <circle cx="24" cy="24" r="20" fill="none" stroke="${color}" stroke-width="${strokeWidth}" opacity="${isSelected ? EFFECTS.glowOpacitySelected : EFFECTS.glowOpacityDefault}"/>

        <!-- Main body with gradient effect -->
        <g transform="translate(24, 24) rotate(${heading})">
          <!-- Arrow shape pointing up -->
          <path d="M 0,-14 L 8,-2 L 4,10 Q 0,14 -4,10 L -8,-2 Z"
                fill="${color}"
                stroke="white"
                stroke-width="${strokeWidth}"
                filter="url(#shadow)"/>

          <!-- Inner highlight -->
          <path d="M 0,-12 L 6,-3 L 3,8"
                fill="none"
                stroke="white"
                stroke-width="1.5"
                opacity="${EFFECTS.innerHighlightOpacity}"/>
        </g>

        <!-- Center point -->
        <circle cx="24" cy="24" r="${isSelected ? 5 : 4}" fill="${MARKER_COLORS.white}" stroke="${color}" stroke-width="${strokeWidth}"/>
      </svg>
    `;

    return divIcon({
      html: svg,
      iconSize: [iconSize, iconSize],
      className: `modern-marker ${isSelected ? 'selected' : ''}`,
      iconAnchor: [iconSize / 2, iconSize / 2],
    });
  }, [heading, status, isSelected]);

  return markerIcon;
};
