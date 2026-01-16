import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import React, { lazy, Suspense } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

import {
  CLUSTER_COLORS,
  CLUSTER_DISABLE_AT_ZOOM,
  CLUSTER_MAX_RADIUS,
  CLUSTER_THRESHOLDS,
  MAP_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_FOLLOW_ZOOM,
} from '../constants';
import { ObjectInfoPanel } from './ObjectInfoPanel';
import { ObjectMarker } from './ObjectMarker';
import { StyledMapContainer } from './styled/StyledComponents';

const MarkerClusterGroup = lazy(() => import('react-leaflet-cluster'));

interface ClusterMarker {
  getChildCount: () => number;
}

const createClusterCustomIcon = (cluster: ClusterMarker): L.DivIcon => {
  const count: number = cluster.getChildCount();
  let size: number = 40;
  let colorClass: string = 'cluster-small';
  let bgColor: string = CLUSTER_COLORS.small;
  const textColor: string = '#fff';

  if (count >= CLUSTER_THRESHOLDS.large) {
    size = 60;
    colorClass = 'cluster-large';
    bgColor = CLUSTER_COLORS.large;
  } else if (count >= CLUSTER_THRESHOLDS.mediumLarge) {
    size = 55;
    colorClass = 'cluster-medium-large';
    bgColor = CLUSTER_COLORS.mediumLarge;
  } else if (count >= CLUSTER_THRESHOLDS.medium) {
    size = 50;
    colorClass = 'cluster-medium';
    bgColor = CLUSTER_COLORS.medium;
  } else if (count >= CLUSTER_THRESHOLDS.small) {
    size = 45;
    colorClass = 'cluster-small-medium';
    bgColor = CLUSTER_COLORS.smallMedium;
  }

  return L.divIcon({
    html: `
      <div style="
        background: ${bgColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 14px rgba(0,0,0,0.4);
        border: 3px solid #fff;
        font-weight: bold;
        color: ${textColor};
        font-size: ${size > 50 ? '16px' : '14px'};
      ">
        ${count}
      </div>
    `,
    className: `custom-cluster-icon ${colorClass}`,
    iconSize: L.point(size, size, true),
  });
};

interface MapObject {
  id: string;
  lat: number;
  lon: number;
  heading: number;
  speed: number;
  status: 'active' | 'lost';
}

interface MapControllerProps {
  center: [number, number] | null;
  followingObject: MapObject | null;
  isFollowing: boolean;
  onStopFollowing: () => void;
}

const MapController = ({
  center,
  followingObject,
  isFollowing,
  onStopFollowing,
}: MapControllerProps) => {
  const map = useMap();

  React.useEffect(() => {
    if (center) {
      const currentZoom = map.getZoom();
      const targetZoom = currentZoom < MAP_FOLLOW_ZOOM ? MAP_FOLLOW_ZOOM : currentZoom;
      map.flyTo(center, targetZoom, { duration: 0.5 });
    }
  }, [center, map]);

  React.useEffect(() => {
    if (followingObject && isFollowing) {
      map.panTo([followingObject.lat, followingObject.lon], {
        animate: true,
        duration: 0.3,
        easeLinearity: 0.5,
      });
    }
  }, [followingObject, isFollowing, map]);

  React.useEffect(() => {
    const handleDragStart = () => {
      if (isFollowing) {
        onStopFollowing();
      }
    };

    map.on('dragstart', handleDragStart);
    return () => {
      map.off('dragstart', handleDragStart);
    };
  }, [isFollowing, map, onStopFollowing]);

  return null;
};

interface MapViewerProps {
  objects: MapObject[];
  selectedObjectId: string | null;
  mapCenter: [number, number] | null;
  onObjectClick: (objectId: string) => void;
  onStopFollowing: () => void;
}

export const MapViewer = ({
  objects,
  selectedObjectId,
  mapCenter,
  onObjectClick,
  onStopFollowing,
}: MapViewerProps) => {
  const followingObject = selectedObjectId
    ? (objects.find((o) => o.id === selectedObjectId) ?? null)
    : null;

  return (
    <StyledMapContainer>
      <MapContainer
        center={[MAP_CENTER.LAT, MAP_CENTER.LON]}
        zoom={MAP_DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapController
          center={mapCenter}
          followingObject={followingObject}
          isFollowing={!!selectedObjectId}
          onStopFollowing={onStopFollowing}
        />
        <Suspense fallback={null}>
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={CLUSTER_MAX_RADIUS}
            disableClusteringAtZoom={CLUSTER_DISABLE_AT_ZOOM}
            spiderfyOnMaxZoom
            iconCreateFunction={createClusterCustomIcon}
            showCoverageOnHover={true}
            spiderLegPolylineOptions={{
              weight: 2,
              color: '#2196F3',
              opacity: 0.6,
            }}
          >
            {objects.map((obj) => (
              <ObjectMarker
                key={obj.id}
                object={obj}
                onClick={onObjectClick}
                isSelected={selectedObjectId === obj.id}
              />
            ))}
          </MarkerClusterGroup>
        </Suspense>
      </MapContainer>

      {/* Info Panel */}
      <ObjectInfoPanel objectId={selectedObjectId || ''} object={followingObject} />
    </StyledMapContainer>
  );
};
