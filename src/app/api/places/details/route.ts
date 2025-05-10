import { NextRequest, NextResponse } from 'next/server';

/**
 * Obtiene detalles completos de un lugar específico mediante su ID
 * 
 * @param req - Solicitud NextJS que contiene el ID del lugar
 */

// Definir tipos específicos para reemplazar 'any'
type PlaceDetailsResponse = {
  status: string;
  error_message?: string;
  result: {
    place_id: string;
    name: string;
    formatted_address?: string;
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    url?: string;
    geometry?: {
      location: {
        lat: number;
        lng: number;
      }
    };
    photos?: Array<{
      photo_reference: string;
      html_attributions: string[];
      height: number;
      width: number;
    }>;
    types?: string[];
    rating?: number;
    price_level?: number;
    opening_hours?: {
      open_now?: boolean;
      periods?: unknown[];
      weekday_text?: string[];
    };
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
      time: number;
      profile_photo_url: string;
    }>;
    user_ratings_total?: number;
  };
};

// También definimos un tipo para la foto formateada
type FormattedPhoto = {
  url: string;
  attribution: string[];
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('placeId');
    
    // Validar parámetros requeridos
    if (!placeId || !process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'ID de lugar no proporcionado o clave API no configurada' },
        { status: 400 }
      );
    }
    
    // Construir URL para Google Places Details API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,reviews,price_level,photos,geometry,type,international_phone_number,url&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    
    // Realizar solicitud a Google Places API
    const response = await fetch(url);
    const data: PlaceDetailsResponse = await response.json();
    
    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: `Error de Google Places API: ${data.status}`, details: data.error_message },
        { status: 500 }
      );
    }
    
    const place = data.result;
    
    // Formatear las fotos si existen
    let photos: FormattedPhoto[] = [];
    if (place.photos && place.photos.length > 0) {
      photos = place.photos.map((photo) => ({
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`,
        attribution: photo.html_attributions
      }));
    }
    
    // Formatear información para el frontend
    const formattedPlace = {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phoneNumber: place.formatted_phone_number || place.international_phone_number,
      website: place.website,
      rating: place.rating,
      priceLevel: place.price_level,
      location: place.geometry?.location,
      types: place.types,
      photos: photos,
      openingHours: place.opening_hours,
      reviews: place.reviews?.map((review) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time,
        profilePhoto: review.profile_photo_url
      })),
      googleMapsUrl: place.url
    };
    
    return NextResponse.json({ place: formattedPlace });
  } catch (error) {
    console.error('Error al procesar la solicitud de detalles del lugar:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 