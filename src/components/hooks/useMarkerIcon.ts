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
    const iconSize = isSelected ? 48 : 32;
    const strokeWidth = isSelected ? 2.5 : 2;

    const svg = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        ${isSelected ? `<circle cx="24" cy="24" r="22" fill="none" stroke="${color}" stroke-width="3" filter="url(#glow)"/>` : ''}

        // <circle cx="24" cy="24" r="20" fill="none" stroke="${color}" stroke-width="${strokeWidth}" opacity="${isSelected ? EFFECTS.glowOpacitySelected : EFFECTS.glowOpacityDefault}"/>

        <g transform="rotate(${heading} 24 24)">
          <path d="M19.74 30.7L6.5 42.43L24 5.57001M28.26 30.7L41.5 42.43L24 5.57001" fill="${color}" filter="url(#shadow)"/>
          <path d="M19.74 30.7L6.5 42.43L24 5.57001L41.5 42.43L28.26 30.7" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19.74 30.7H28.26L24 5.57001L19.74 30.7Z" fill="black" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
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
