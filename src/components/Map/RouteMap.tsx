'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RouteData } from '@/lib/api/geoapify';

interface RouteMapProps {
  routes: RouteData[];
  center?: [number, number];
  zoom?: number;
}

export default function RouteMap({ routes, center, zoom = 2 }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  // Inicializar el mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    try {
      // Calcular el centro del mapa (promedio de todas las coordenadas)
      let calculatedCenter: [number, number] = [0, 0];
      
      if (center) {
        calculatedCenter = center;
      } else if (routes.length > 0) {
        let sumLat = 0;
        let sumLon = 0;
        routes.forEach(route => {
          sumLat += route.coordinates.lat;
          sumLon += route.coordinates.lon;
        });
        calculatedCenter = [sumLon / routes.length, sumLat / routes.length];
      } else {
        calculatedCenter = [0, 0]; // Centro predeterminado (océano Atlántico)
      }
      
      // Inicializar el mapa
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`,
        center: calculatedCenter,
        zoom: zoom
      });
      
      // Añadir controles de navegación
      map.current.addControl(new maplibregl.NavigationControl());
      
      // Esperar a que el mapa cargue
      map.current.on('load', () => {
        setMapInitialized(true);
      });
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
    
    // Limpieza
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  // Importante: estas dependencias deben mantenerse aquí para evitar ciclos de actualización infinitos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Actualizar el área visible del mapa para mostrar todos los marcadores
  const updateMapBounds = useCallback(() => {
    if (!map.current || routes.length === 0) return;
    
    try {
      // Si solo hay una ruta, simplemente centramos el mapa en ella
      if (routes.length === 1) {
        map.current.flyTo({
          center: [routes[0].coordinates.lon, routes[0].coordinates.lat],
          zoom: 10,
          essential: true
        });
        return;
      }
      
      // Crear un bounds que incluya todas las rutas
      const bounds = new maplibregl.LngLatBounds();
      
      routes.forEach(route => {
        bounds.extend([route.coordinates.lon, route.coordinates.lat]);
      });
      
      // Ajustar el mapa para mostrar todos los puntos
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000
      });
    } catch (error) {
      console.error('Error al ajustar el área visible del mapa:', error);
    }
  }, [routes]);
  
  // Añadir marcadores cuando cambian las rutas o se inicializa el mapa
  const updateMarkers = useCallback(() => {
    if (!map.current || !mapInitialized) return;
    
    try {
      // Limpiar marcadores existentes
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Añadir nuevos marcadores
      routes.forEach((route) => {
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div>
            <h3 class="font-bold text-sm">${route.title}</h3>
            <p class="text-xs text-gray-500">${route.location}</p>
            <a href="/routes/${route.id}" class="text-xs text-emerald-600 mt-1 inline-block">Ver detalles</a>
          </div>
        `);
        
        const marker = new maplibregl.Marker({ color: "#10b981" })
          .setLngLat([route.coordinates.lon, route.coordinates.lat])
          .setPopup(popup)
          .addTo(map.current!);
        
        markersRef.current.push(marker);
      });
      
      // Ajustar la vista para que se vean todos los marcadores
      if (routes.length > 0 && !center) {
        updateMapBounds();
      }
    } catch (error) {
      console.error('Error al actualizar marcadores:', error);
    }
  }, [routes, mapInitialized, center, updateMapBounds]);
  
  // Actualizar marcadores cuando cambian las rutas
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);
  
  return (
    <div ref={mapContainer} className="h-full w-full" />
  );
} 