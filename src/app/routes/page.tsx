'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, MapPin, Calendar, Star, Search, Map as MapIcon, Navigation, Filter } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { getPopularDestinations, searchRoutes, RouteData } from '@/lib/api/geoapify';

// Carga dinámica del componente de mapa para evitar problemas con SSR
const RouteMap = dynamic(() => import('@/components/Map/RouteMap'), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-full">
      <Loader2 size={30} className="text-emerald-500 animate-spin" />
      <span className="ml-2 text-gray-500">Cargando mapa...</span>
    </div>
  )
});

export default function RoutesPage() {
  // Estados para controlar datos y UI
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  
  // Usando refs para evitar problemas de actualización
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cargar rutas iniciales solo una vez al montar
  useEffect(() => {
    // Función para obtener las rutas iniciales
    const loadInitialRoutes = async () => {
      if (!isMountedRef.current) return;
      
      setIsLoading(true);
      
      try {
        const destinations = await getPopularDestinations();
        
        if (isMountedRef.current) {
          setRoutes(destinations);
          setFilteredRoutes(destinations);
        }
      } catch (error) {
        console.error('Error al obtener rutas populares:', error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadInitialRoutes();

    // Limpieza al desmontar
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []); // Solo se ejecuta al montar el componente

  // Función para buscar rutas
  const handleSearch = useCallback((term: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      if (!term.trim()) {
        setIsSearching(true);
        try {
          const destinations = await getPopularDestinations();
          if (isMountedRef.current) {
            setRoutes(destinations);
          }
        } catch (error) {
          console.error('Error al obtener destinos:', error);
        } finally {
          if (isMountedRef.current) {
            setIsSearching(false);
          }
        }
        return;
      }
      
      setIsSearching(true);
      
      try {
        const searchResults = await searchRoutes(term);
        if (isMountedRef.current) {
          setRoutes(searchResults);
        }
      } catch (error) {
        console.error('Error al buscar rutas:', error);
      } finally {
        if (isMountedRef.current) {
          setIsSearching(false);
        }
      }
    }, 500);
  }, []);

  // Actualizar término de búsqueda y ejecutar la búsqueda
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  }, [handleSearch]);

  // Filtrar rutas cuando cambia el filtro o las rutas
  useEffect(() => {
    if (!isMountedRef.current || routes.length === 0) return;
    
    if (selectedFilter === 'all') {
      setFilteredRoutes(routes);
      return;
    }
    
    // Aplicamos filtros por región basados en coordenadas aproximadas
    const filtered = routes.filter(route => {
      if (selectedFilter === 'europa' && 
          route.coordinates.lat > 35 && route.coordinates.lat < 70 && 
          route.coordinates.lon > -10 && route.coordinates.lon < 40) {
        return true;
      }
      
      if (selectedFilter === 'asia' && 
          route.coordinates.lat > 0 && route.coordinates.lat < 60 && 
          route.coordinates.lon > 60 && route.coordinates.lon < 150) {
        return true;
      }
      
      if (selectedFilter === 'america' && 
          route.coordinates.lon < -30 && route.coordinates.lon > -170) {
        return true;
      }
      
      return false;
    });
    
    setFilteredRoutes(filtered);
  }, [routes, selectedFilter]);

  // Función para resetear filtros
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedFilter('all');
    // Esto solo resetea la UI - no necesitamos volver a cargar las rutas aquí
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Descubre Rutas Increíbles</h1>
          <p className="text-gray-600 max-w-3xl">
            Explora nuestras rutas cuidadosamente seleccionadas por todo el mundo. 
            Cada una incluye lugares de interés, recomendaciones y mapas interactivos.
          </p>
        </div>
        
        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por destino o ciudad..."
                className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
            </div>
            
            <div className="flex items-center">
              <div className="mr-3 text-gray-500 flex items-center">
                <Filter size={18} className="mr-1" />
                <span className="text-sm">Filtrar:</span>
              </div>
              <select
                className="p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">Todas las regiones</option>
                <option value="europa">Europa</option>
                <option value="asia">Asia</option>
                <option value="america">América</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Contenido principal: Mapa y lista de rutas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa con todas las rutas */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-4 overflow-hidden mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <MapIcon size={20} className="mr-2 text-emerald-500" />
              Mapa de Destinos
            </h2>
            <div className="h-80 md:h-96 relative rounded-lg overflow-hidden bg-gray-100 mb-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 size={30} className="text-emerald-500 animate-spin" />
                  <span className="ml-2 text-gray-500">Cargando mapa...</span>
                </div>
              ) : (
                filteredRoutes.length > 0 && <RouteMap routes={filteredRoutes} />
              )}
            </div>
            <p className="text-sm text-gray-500 text-center">
              Interactúa con el mapa y haz clic en los marcadores para ver detalles de cada destino
            </p>
          </div>
          
          {/* Lista de rutas */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Navigation size={20} className="mr-2 text-emerald-500" />
                Rutas disponibles
              </h2>
              <p className="text-sm text-gray-500">
                Mostrando {filteredRoutes.length} {filteredRoutes.length === 1 ? 'ruta' : 'rutas'}
                {searchTerm && ` para "${searchTerm}"`}
              </p>
            </div>
            
            {isLoading || isSearching ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 size={40} className="text-emerald-500 animate-spin" />
                <span className="ml-3 text-gray-600 text-lg">
                  {isSearching ? 'Buscando destinos...' : 'Cargando rutas...'}
                </span>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <h3 className="text-xl font-medium text-gray-800 mb-2">No se encontraron rutas</h3>
                <p className="text-gray-600 mb-6">
                  Intenta con diferentes términos de búsqueda o filtros
                </p>
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Mostrar todas las rutas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoutes.map((route) => (
                  <Link key={route.id} href={`/routes/${route.id}`} className="group">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                      {route.imageUrl ? (
                        <div className="relative h-40 w-full overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                          <Image 
                            src={route.imageUrl} 
                            alt={route.title} 
                            width={500}
                            height={300}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-40 w-full bg-emerald-100 flex items-center justify-center">
                          <MapPin size={30} className="text-emerald-500" />
                        </div>
                      )}
                      
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin size={14} className="mr-1 text-emerald-500" />
                          <span>{route.location}</span>
                          {route.duration && (
                            <>
                              <span className="mx-1">•</span>
                              <Calendar size={14} className="mr-1 text-emerald-500" />
                              <span>{route.duration}</span>
                            </>
                          )}
                        </div>
                        
                        <h3 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{route.title}</h3>
                        
                        {route.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2 flex-grow">{route.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Star size={16} className="mr-1 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{route.rating.toFixed(1)}</span>
                          </div>
                          
                          <span className="text-xs text-emerald-600 font-medium">Ver detalles</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 