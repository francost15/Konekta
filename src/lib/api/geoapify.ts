import { cache } from 'react';

export interface Location {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
  formatted?: string;
}

export interface PlaceOfInterest {
  name: string;
  description?: string;
  category?: string;
  address?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  rating?: number;
  imageUrl?: string;
}

export interface RouteData {
  id: string;
  title: string;
  description?: string;
  location: string;
  rating: number;
  imageUrl?: string;
  duration?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  places?: PlaceOfInterest[];
}

const PLACES_CATEGORIES = 'tourism.sights,catering.restaurant,tourism.attraction,accommodation.hotel,entertainment';

// Agregar interfaces para las estructuras de datos de la API de Geoapify
interface GeoapifyFeatureProperties {
  name?: string;
  city?: string;
  country?: string;
  state?: string;
  lat: number;
  lon: number;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  categories?: string[];
}

interface GeoapifyFeature {
  properties: GeoapifyFeatureProperties;
  geometry: {
    coordinates: number[];
    type: string;
  };
}

/**
 * Verifica si la clave de API está disponible
 */
const apiKeyAvailable = (): boolean => {
  return !!process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
};

/**
 * Busca lugares por texto usando la API de Geoapify Places
 */
export const searchPlacesByText = cache(async (text: string): Promise<Location[]> => {
  try {
    // Verificar que la clave API esté disponible
    if (!apiKeyAvailable()) {
      console.error('API Key de Geoapify no disponible');
      return [];
    }
    
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    const encodedText = encodeURIComponent(text);
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodedText}&limit=5&apiKey=${apiKey}`;
    
    const response = await fetch(url, { 
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache durante 1 hora
    });
    
    if (!response.ok) {
      throw new Error(`Error al buscar lugares: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
    return data.features.map((feature: GeoapifyFeature) => ({
      name: feature.properties.name || feature.properties.city || feature.properties.country || 'Lugar desconocido',
      lat: feature.properties.lat,
      lon: feature.properties.lon,
      country: feature.properties.country,
      state: feature.properties.state,
      formatted: feature.properties.formatted
    }));
  } catch (error) {
    console.error('Error en searchPlacesByText:', error);
    return [];
  }
});

/**
 * Obtiene lugares de interés cerca de unas coordenadas
 */
export const getPlacesNearby = cache(async (lon: number, lat: number, radius: number = 5000, limit: number = 15): Promise<PlaceOfInterest[]> => {
  try {
    // Verificar que la clave API esté disponible
    if (!apiKeyAvailable()) {
      console.error('API Key de Geoapify no disponible');
      return [];
    }
    
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    const url = `https://api.geoapify.com/v2/places?categories=${PLACES_CATEGORIES}&filter=circle:${lon},${lat},${radius}&limit=${limit}&apiKey=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache durante 1 hora
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener lugares cercanos: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      // Crear algunos lugares de ejemplo en caso de que la API no devuelva resultados
      return generateFallbackPlaces(lon, lat);
    }
    
    return data.features.map((feature: GeoapifyFeature) => ({
      name: feature.properties.name || 'Lugar de interés',
      description: feature.properties.address_line2 || '',
      category: feature.properties.categories?.[0]?.split('.').pop() || 'Atracción',
      address: feature.properties.address_line1 || '',
      coordinates: {
        lat: feature.properties.lat,
        lon: feature.properties.lon
      },
      rating: 3 + Math.random() * 2 // Simulamos rating para demo
    }));
  } catch (error) {
    console.error('Error en getPlacesNearby:', error);
    // En caso de error, devolver lugares de ejemplo
    return generateFallbackPlaces(lon, lat);
  }
});

/**
 * Genera lugares de interés de ejemplo para un punto dado
 */
const generateFallbackPlaces = (lon: number, lat: number): PlaceOfInterest[] => {
  // Crear algunos lugares de ejemplo alrededor de las coordenadas proporcionadas
  const places: PlaceOfInterest[] = [];
  
  // Agregar 5 lugares de ejemplo
  for (let i = 0; i < 5; i++) {
    // Generar coordenadas cercanas (+-0.01 grados)
    const placeLat = lat + (Math.random() * 0.02 - 0.01);
    const placeLon = lon + (Math.random() * 0.02 - 0.01);
    
    // Tipos de lugares comunes
    const placeTypes = ['Restaurante', 'Museo', 'Mirador', 'Plaza', 'Monumento', 'Parque'];
    const placeType = placeTypes[Math.floor(Math.random() * placeTypes.length)];
    
    places.push({
      name: `${placeType} Local ${i+1}`,
      description: 'Lugar de interés en esta zona',
      category: placeType.toLowerCase(),
      address: 'Dirección local',
      coordinates: {
        lat: placeLat,
        lon: placeLon
      },
      rating: 3.5 + Math.random() * 1.5
    });
  }
  
  return places;
};

/**
 * Obtiene destinos populares de todo el mundo
 */
export const getPopularDestinations = cache(async (): Promise<RouteData[]> => {
  try {
    // Verificar que la clave API esté disponible
    if (!apiKeyAvailable()) {
      console.error('API Key de Geoapify no disponible');
      return getFallbackDestinations();
    }
    
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    // Modificando la consulta para obtener ciudades importantes en lugar de atracciones específicas
    const url = `https://api.geoapify.com/v2/places?categories=tourism&limit=15&apiKey=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 86400 } // Cache durante 24 horas
    });
    
    if (!response.ok) {
      console.warn(`Error al obtener destinos populares: ${response.status} ${response.statusText}`);
      return getFallbackDestinations();
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return getFallbackDestinations();
    }
    
    // Transformamos la respuesta a nuestro formato
    const destinations = data.features.map((feature: GeoapifyFeature) => {
      const name = feature.properties.city || feature.properties.name || feature.properties.formatted?.split(',')[0] || 'Lugar desconocido';
      const lat = feature.properties.lat;
      const lon = feature.properties.lon;
      
      // Obtenemos URL para mapa estático
      const mapImageUrl = getStaticMapUrl(lon, lat);
      
      return {
        id: `route-${name.toLowerCase().replace(/\s/g, '-')}`,
        title: `Explora ${name}`,
        description: `Descubre los mejores lugares para visitar en ${name}. Esta ruta incluye monumentos históricos, restaurantes locales y atracciones culturales.`,
        location: name,
        rating: 4.5 + Math.random() * 0.5,
        imageUrl: mapImageUrl,
        duration: '3-5 días',
        coordinates: { lat, lon }
      };
    });
    
    return destinations;
  } catch (error) {
    console.error('Error en getPopularDestinations:', error);
    // Si falla, devolvemos al menos algunas ciudades para que la app funcione
    return getFallbackDestinations();
  }
});

/**
 * Destinos predeterminados en caso de fallo de la API
 */
export const getFallbackDestinations = (): RouteData[] => {
  const destinations = [
    { name: 'Ciudad de México', lat: 19.4326, lon: -99.1332 },
    { name: 'Barcelona', lat: 41.3851, lon: 2.1734 },
    { name: 'Tokio', lat: 35.6762, lon: 139.6503 },
    { name: 'Lisboa', lat: 38.7223, lon: -9.1393 },
    { name: 'París', lat: 48.8566, lon: 2.3522 },
    { name: 'Roma', lat: 41.9028, lon: 12.4964 },
    { name: 'Nueva York', lat: 40.7128, lon: -74.0060 },
    { name: 'Londres', lat: 51.5074, lon: -0.1278 },
    { name: 'Río de Janeiro', lat: -22.9068, lon: -43.1729 },
    { name: 'Sídney', lat: -33.8688, lon: 151.2093 }
  ];
  
  return destinations.map(destination => {
    const mapImageUrl = getStaticMapUrl(destination.lon, destination.lat);
    
    return {
      id: `route-${destination.name.toLowerCase().replace(/\s/g, '-')}`,
      title: `Explora ${destination.name}`,
      description: `Descubre los mejores lugares para visitar en ${destination.name}. Esta ruta incluye monumentos históricos, restaurantes locales y atracciones culturales.`,
      location: destination.name,
      rating: 4.5 + Math.random() * 0.5,
      imageUrl: mapImageUrl,
      duration: '3-5 días',
      coordinates: {
        lat: destination.lat,
        lon: destination.lon
      }
    };
  });
};

/**
 * Obtiene los detalles de una ruta específica, incluyendo lugares de interés
 */
export const getRouteDetails = cache(async (routeId: string): Promise<RouteData | null> => {
  try {
    // Extraemos el nombre de la ubicación del ID
    let locationName = '';
    let lat = 0;
    let lon = 0;
    
    // Verificar si es un destino predefinido primero (más rápido)
    const predefinedDestinations = getFallbackDestinations();
    const predefinedRoute = predefinedDestinations.find(dest => 
      `route-${dest.location.toLowerCase().replace(/\s/g, '-')}` === routeId
    );
    
    if (predefinedRoute) {
      // Es un destino predefinido, usamos sus datos
      locationName = predefinedRoute.location;
      lat = predefinedRoute.coordinates.lat;
      lon = predefinedRoute.coordinates.lon;
    } else {
      // Analizar el ID para extraer el lugar (si es posible)
      const idParts = routeId.split('-');
      if (idParts.length > 1) {
        locationName = idParts.slice(1).join(' ');
        
        // Buscamos las coordenadas exactas con la API de geocodificación
        const locations = await searchPlacesByText(locationName);
        
        if (locations.length > 0) {
          locationName = locations[0].name;
          lat = locations[0].lat;
          lon = locations[0].lon;
        }
      }
    }
    
    // Si no pudimos obtener la ubicación, devolvemos null
    if (!locationName || lat === 0 || lon === 0) {
      console.warn('No se pudo obtener información de la ubicación para:', routeId);
      return null;
    }
    
    // Obtener lugares de interés cercanos
    const places = await getPlacesNearby(lon, lat);
    
    // Crear objeto de detalles de ruta
    const routeData: RouteData = {
      id: routeId,
      title: `Explora ${locationName}`,
      description: `Descubre los mejores lugares para visitar en ${locationName}. Esta ruta incluye monumentos históricos, restaurantes locales y atracciones culturales.`,
      location: locationName,
      rating: 4.7 + Math.random() * 0.3,
      duration: '3-5 días',
      coordinates: { lat, lon },
      places
    };
    
    return routeData;
  } catch (error) {
    console.error('Error en getRouteDetails:', error);
    return null;
  }
});

/**
 * Genera URL de mapa con marcadores para vista estática
 */
export const getStaticMapUrl = (lon: number, lat: number, places?: PlaceOfInterest[]): string => {
  if (!apiKeyAvailable()) {
    // Si no hay API key, devolver una URL de imagen genérica
    return `https://placehold.co/600x400/10b981/ffffff?text=Mapa+no+disponible`;
  }
  
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  const markers = places?.slice(0, 10).map((place, i) => 
    `&marker=lonlat:${place.coordinates.lon},${place.coordinates.lat};color:%2310b981;size:medium;text:${i+1}`
  ).join('') || '';
  
  return `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${lon},${lat}&zoom=12${markers}&apiKey=${apiKey}`;
};

/**
 * Busca rutas por término de búsqueda
 */
export const searchRoutes = cache(async (searchTerm: string): Promise<RouteData[]> => {
  try {
    if (!searchTerm.trim()) {
      return getFallbackDestinations();
    }
    
    const locations = await searchPlacesByText(searchTerm);
    
    if (locations.length === 0) {
      console.log('No se encontraron ubicaciones para:', searchTerm);
      return [];
    }
    
    // Convertimos las ubicaciones encontradas en objetos de ruta
    const routes = locations.map((location) => {
      const mapImageUrl = getStaticMapUrl(location.lon, location.lat);
      
      return {
        id: `route-${location.name.toLowerCase().replace(/\s/g, '-')}`,
        title: `Explora ${location.name}`,
        description: `Descubre los mejores lugares para visitar en ${location.name}. Esta ruta incluye monumentos históricos, restaurantes locales y atracciones culturales.`,
        location: location.name,
        rating: 4.5 + Math.random() * 0.5,
        imageUrl: mapImageUrl,
        duration: '3-5 días',
        coordinates: {
          lat: location.lat,
          lon: location.lon
        }
      };
    });
    
    return routes;
  } catch (error) {
    console.error('Error en searchRoutes:', error);
    return [];
  }
}); 