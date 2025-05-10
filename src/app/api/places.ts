import { NextRequest, NextResponse } from 'next/server';

// Interfaz para la respuesta de lugares
interface PlaceResponse {
  id: string;
  name: string;
  address: string;
  photos: string[];
  rating: number;
  types: string[];
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
}

// Interfaz para el resultado de la API de Google Places
interface GooglePlacesResult {
  place_id: string;
  name: string;
  vicinity: string;
  photos?: Array<{
    photo_reference: string;
    html_attributions: string[];
    height: number;
    width: number;
  }>;
  rating?: number;
  types?: string[];
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
}

// Interfaz para la respuesta de la API de Google Places
interface GooglePlacesResponse {
  status: string;
  error_message?: string;
  results: GooglePlacesResult[];
}

/**
 * Busca lugares cercanos basados en palabras clave o ubicación
 * 
 * @param req - Solicitud NextJS que contiene parámetros de búsqueda
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '5000'; // Radio predeterminado: 5km
    const type = searchParams.get('type');

    // Validar parámetros requeridos
    if ((!query && (!lat || !lng)) || !process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'Parámetros faltantes o clave API no configurada' },
        { status: 400 }
      );
    }

    // Construir URL para Google Places API
    let url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
    
    if (query) {
      url += `keyword=${encodeURIComponent(query)}&`;
    }
    
    if (lat && lng) {
      url += `location=${lat},${lng}&`;
    }
    
    url += `radius=${radius}`;
    
    if (type) {
      url += `&type=${type}`;
    }
    
    url += `&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    // Realizar solicitud a Google Places API
    const response = await fetch(url);
    const data: GooglePlacesResponse = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { error: `Error de Google Places API: ${data.status}`, details: data.error_message },
        { status: 500 }
      );
    }

    // Formatear respuesta
    const places: PlaceResponse[] = (data.results || []).map((place: GooglePlacesResult) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      photos: place.photos ? place.photos.map((photo) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      ) : [],
      rating: place.rating || 0,
      types: place.types || [],
      opening_hours: place.opening_hours,
    }));

    return NextResponse.json({ places });
  } catch (error) {
    console.error('Error al procesar la solicitud de Places API:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 