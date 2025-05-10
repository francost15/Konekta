'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RouteData, PlaceOfInterest } from '@/lib/api/geoapify';

interface RouteDetailMapProps {
  route: RouteData;
  selectedPlace: PlaceOfInterest | null;
}

export default function RouteDetailMap({ route, selectedPlace }: RouteDetailMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const mainMarker = useRef<maplibregl.Marker | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Inicializar el mapa solo una vez
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    try {
      // Inicializar el mapa
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`,
        center: [route.coordinates.lon, route.coordinates.lat],
        zoom: 13
      });
      
      // Añadir controles de navegación
      map.current.addControl(new maplibregl.NavigationControl());
      
      // Añadir marcador principal para la ubicación de la ruta
      mainMarker.current = new maplibregl.Marker({ color: "#047857" })
        .setLngLat([route.coordinates.lon, route.coordinates.lat])
        .addTo(map.current);
      
      // Esperar a que el mapa cargue
      map.current.on('load', () => {
        setMapInitialized(true);
      });
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
    
    // Limpieza
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  // Importante: esta dependencia debe ejecutarse solo una vez al montar el componente
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Actualizar el centro del mapa cuando cambian las coordenadas de la ruta
  useEffect(() => {
    if (!map.current || !mapInitialized) return;
    
    try {
      map.current.flyTo({
        center: [route.coordinates.lon, route.coordinates.lat],
        zoom: 13,
        essential: true
      });
      
      // Actualizar marcador principal
      if (mainMarker.current) {
        mainMarker.current.setLngLat([route.coordinates.lon, route.coordinates.lat]);
      }
    } catch (error) {
      console.error('Error al actualizar el centro del mapa:', error);
    }
  }, [route.coordinates.lat, route.coordinates.lon, mapInitialized]);
  
  // Efecto para añadir marcadores de lugares
  const addPlaceMarkers = useCallback(() => {
    if (!map.current || !route.places || !mapInitialized) return;
    
    try {
      // Limpiar marcadores existentes
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      // Añadir marcadores para cada lugar
      route.places.forEach((place) => {
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div>
            <h3 class="font-bold text-sm">${place.name}</h3>
            ${place.address ? `<p class="text-xs text-gray-500">${place.address}</p>` : ''}
            ${place.category ? `<span class="text-xs text-emerald-600">${place.category}</span>` : ''}
          </div>
        `);
        
        const marker = new maplibregl.Marker({ color: "#10b981" })
          .setLngLat([place.coordinates.lon, place.coordinates.lat])
          .setPopup(popup)
          .addTo(map.current!);
        
        markers.current.push(marker);
      });
    } catch (error) {
      console.error('Error al añadir marcadores:', error);
    }
  }, [route.places, mapInitialized]);
  
  // Añadir marcadores cuando cambian los lugares o se inicializa el mapa
  useEffect(() => {
    addPlaceMarkers();
  }, [addPlaceMarkers]);
  
  // Efecto para resaltar un lugar seleccionado
  useEffect(() => {
    if (!map.current || !selectedPlace || !mapInitialized) return;
    
    try {
      // Centrar el mapa en el lugar seleccionado
      map.current.flyTo({
        center: [selectedPlace.coordinates.lon, selectedPlace.coordinates.lat],
        zoom: 15,
        essential: true
      });
      
      // Encontrar y abrir el popup del marcador seleccionado
      markers.current.forEach(marker => {
        const markerLngLat = marker.getLngLat();
        
        if (Math.abs(markerLngLat.lng - selectedPlace.coordinates.lon) < 0.0001 && 
            Math.abs(markerLngLat.lat - selectedPlace.coordinates.lat) < 0.0001) {
          // Solo abrir el popup si no está ya abierto
          const popup = marker.getPopup();
          if (popup && !popup.isOpen()) {
            marker.togglePopup();
          }
        }
      });
    } catch (error) {
      console.error('Error al manejar lugar seleccionado:', error);
    }
  }, [selectedPlace, mapInitialized]);
  
  return (
    <div ref={mapContainer} className="h-full w-full" />
  );
} 