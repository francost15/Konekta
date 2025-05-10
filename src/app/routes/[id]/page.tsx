'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Calendar, Star, Map as MapIcon, Navigation, Globe, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getRouteDetails, RouteData, PlaceOfInterest, getFallbackDestinations } from '@/lib/api/geoapify';
import dynamic from 'next/dynamic';

// Carga dinámica del componente de mapa para evitar problemas con SSR
const RouteDetailMap = dynamic(() => import('@/components/Map/RouteDetailMap'), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-full">
      <Loader2 size={30} className="text-emerald-500 animate-spin" />
      <span className="ml-2 text-gray-500">Cargando mapa...</span>
    </div>
  )
});

export default function RouteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [routeDetails, setRouteDetails] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceOfInterest | null>(null);

  useEffect(() => {
    if (id) {
      // Definir la función fetchRouteDetails dentro del useEffect
      const fetchRouteDetails = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          // Intentamos obtener los detalles de la ruta
          const routeData = await getRouteDetails(id as string);
          
          if (routeData) {
            setRouteDetails(routeData);
          } else {
            // Si no se encuentra la ruta específica, intentamos usar un destino predefinido
            const fallbackDestinations = getFallbackDestinations();
            const fallbackId = id as string;
            
            // Buscamos un destino cuyo ID coincida con el formato esperado
            const matchingDestination = fallbackDestinations.find(dest => 
              fallbackId === `route-${dest.location.toLowerCase().replace(/\s/g, '-')}`
            );
            
            if (matchingDestination) {
              setRouteDetails({
                ...matchingDestination,
                id: fallbackId,
                places: [] // No tenemos lugares de interés para destinos predefinidos
              });
            } else {
              // Si no encontramos coincidencia, configuramos un error
              setError('No se pudo encontrar información para este destino.');
            }
          }
        } catch (error) {
          console.error('Error al obtener detalles de la ruta:', error);
          setError('Ocurrió un error al cargar los detalles de la ruta. Por favor, intenta nuevamente.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchRouteDetails();
    }
  }, [id]);

  const handlePlaceSelect = (place: PlaceOfInterest) => {
    setSelectedPlace(place);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <Loader2 size={40} className="text-emerald-500 animate-spin" />
            <span className="ml-3 text-gray-600 text-lg">Cargando detalles de la ruta...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !routeDetails) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <AlertTriangle size={50} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Ruta no encontrada</h1>
            <p className="text-gray-600 mb-6">
              {error || 'Lo sentimos, no pudimos encontrar la ruta que estás buscando.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/routes" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center justify-center">
                <ChevronLeft size={16} className="mr-1" />
                Volver a rutas
              </Link>
              <button 
                onClick={() => router.refresh()}
                className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/home" className="text-gray-500 hover:text-emerald-600 transition-colors mr-3">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">{routeDetails.title}</h1>
          </div>
          
          <div className="flex flex-wrap items-center text-gray-600 gap-4 mb-2">
            <div className="flex items-center">
              <MapPin size={18} className="mr-1 text-emerald-500" />
              <span>{routeDetails.location}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={18} className="mr-1 text-emerald-500" />
              <span>{routeDetails.duration || '3-5 días'}</span>
            </div>
            <div className="flex items-center">
              <Star size={18} className="mr-1 text-yellow-400 fill-yellow-400" />
              <span>{routeDetails.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 max-w-3xl">{routeDetails.description}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 overflow-hidden">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <MapIcon size={20} className="mr-2 text-emerald-500" />
              Mapa interactivo
            </h2>
            <div className="h-96 relative rounded-lg overflow-hidden bg-gray-100">
              <RouteDetailMap 
                route={routeDetails}
                selectedPlace={selectedPlace}
              />
            </div>
          </div>
          
          {/* Lista de lugares */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Navigation size={20} className="mr-2 text-emerald-500" />
              Lugares para visitar
            </h2>
            
            <div className="space-y-3 mt-2 max-h-[30rem] overflow-y-auto pr-2">
              {routeDetails.places && routeDetails.places.length > 0 ? (
                routeDetails.places.map((place, index) => (
                  <div 
                    key={index} 
                    className={`border-b border-gray-100 pb-3 last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors ${
                      selectedPlace === place ? 'bg-emerald-50 border-emerald-100' : ''
                    }`}
                    onClick={() => handlePlaceSelect(place)}
                  >
                    <h3 className="font-medium text-gray-800">{place.name}</h3>
                    {place.address && (
                      <p className="text-sm text-gray-500 mt-1">{place.address}</p>
                    )}
                    {place.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 mt-2 inline-block">
                        {place.category.charAt(0).toUpperCase() + place.category.slice(1)}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No se encontraron lugares destacados para esta ruta.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Prueba con otra ubicación o intenta nuevamente más tarde.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button className="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center">
                <Globe size={18} className="mr-2" />
                Iniciar navegación
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Esta ruta incluye {routeDetails.places?.length || 0} lugares de interés
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 