import { MapPin, Clock, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchHeaderProps {
  userName: string;
  onOpenItineraryModal?: (destination?: string) => void;
}

// Número máximo de búsquedas recientes a almacenar
const MAX_RECENT_SEARCHES = 5;

export const SearchHeader = ({ userName, onOpenItineraryModal }: SearchHeaderProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar búsquedas recientes al montar el componente
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error('Error cargando búsquedas recientes:', e);
      }
    }
  }, []);

  // Guardar búsqueda en localStorage
  const saveSearchTerm = (term: string) => {
    if (!term.trim() || term.length < 2) return;
    
    const updatedSearches = [
      term,
      ...recentSearches.filter(item => item.toLowerCase() !== term.toLowerCase())
    ].slice(0, MAX_RECENT_SEARCHES);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Limpiar historial de búsquedas
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || isSubmitting) return;
    
    // Guardar la búsqueda
    saveSearchTerm(searchTerm);
    
    setIsSubmitting(true);
    
    // Si hay un destino y función para abrir el modal, abrirlo con el destino
    if (onOpenItineraryModal) {
      // Pasar el destino al modal para que ya venga precargado
      onOpenItineraryModal(searchTerm);
    } else {
      // Redirigir directamente a la página de itinerario con el destino
      router.push(`/itinerary?destination=${encodeURIComponent(searchTerm)}`);
    }
    
    // Restaurar el estado después de un breve retraso
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSearchItemClick = (term: string) => {
    setSearchTerm(term);
    saveSearchTerm(term);
    setIsSubmitting(true);
    
    if (onOpenItineraryModal) {
      // Pasar el destino directamente al modal
      onOpenItineraryModal(term);
    } else {
      // Redirigir directamente a la página de itinerario
      router.push(`/itinerary?destination=${encodeURIComponent(term)}`);
    }
    setShowRecentSearches(false);
    
    // Restaurar el estado después de un breve retraso
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  // Manejar el clic en los destinos populares
  const handlePopularDestinationClick = (destination: string) => {
    setSearchTerm(destination);
    saveSearchTerm(destination);
    setIsSubmitting(true);
    
    // Redirigir directamente a la página de itinerario con el destino
    if (onOpenItineraryModal) {
      onOpenItineraryModal(destination);
    } else {
      router.push(`/itinerary?destination=${encodeURIComponent(destination)}`);
    }
    
    // Restaurar el estado después de un breve retraso
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <header className="bg-gradient-to-r from-emerald-500 to-emerald-800 pt-4 pb-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/5 z-0"></div>
      <div className="absolute right-0 top-0 w-1/3 h-full bg-white/5 -skew-x-12 transform origin-top"></div>
      <div className="container mx-auto relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Bienvenido de nuevo, {userName}</h1>
        <p className="text-emerald-50 mb-6 text-sm md:text-base">¿Cuál será tu próxima aventura?</p>
        
        <div className="relative max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white p-1.5 rounded-full shadow-lg flex items-center">
            <div className="text-emerald-600 mx-2.5">
              <MapPin size={18} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowRecentSearches(true)}
              placeholder="¿A dónde quieres viajar?" 
              className="flex-1 py-1.5 px-1 outline-none text-black font-medium text-sm"
              style={{ caretColor: '#059669', color: '#000000' }}
            />
            {searchTerm && (
              <button 
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
              >
                <X size={16} />
              </button>
            )}
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`${isSubmitting ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white py-1.5 px-5 rounded-full text-sm font-medium transition-colors ml-1 flex items-center`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </>
              ) : 'Buscar'}
            </button>
          </form>
          
          {/* Panel de búsquedas recientes */}
          {showRecentSearches && recentSearches.length > 0 && (
            <div 
              className="absolute z-20 top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-2 border border-gray-100 overflow-hidden"
              onMouseLeave={() => setShowRecentSearches(false)}
            >
              <div className="flex items-center justify-between py-2 px-4 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500 flex items-center">
                  <Clock size={14} className="mr-1" /> Búsquedas recientes
                </span>
                <button 
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-emerald-600"
                >
                  Borrar historial
                </button>
              </div>
              <ul className="py-1">
                {recentSearches.map((term, index) => (
                  <li key={index}>
                    <button 
                      onClick={() => handleSearchItemClick(term)}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-emerald-50 flex items-center"
                    >
                      <Clock size={14} className="mr-2 text-gray-400" />
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Sugerencias de destinos populares */}
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2 overflow-x-auto max-w-xl pb-1">
            {['Barcelona', 'Tokio', 'Ciudad de México', 'Nueva York', 'París'].map((destination) => (
              <button
                key={destination}
                onClick={() => handlePopularDestinationClick(destination)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-medium transition-colors whitespace-nowrap"
              >
                {destination}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}; 