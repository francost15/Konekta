'use client';

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, MapPin, Calendar, Loader2, Globe, Navigation, ArrowRight, ExternalLink, Search, X, Printer, Mail, CheckCircle } from 'lucide-react';
import { generateItinerary } from '@/services/openai';

interface Route {
  id: string;
  title: string;
  description?: string;
  location: string;
  rating: number;
  imageUrl?: string;
  duration?: string;
  mapImageUrl?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

interface RoutesSectionProps {
  initialRoutes?: Route[];
}

// Quiz para personalizar itinerario
interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

// Lista extendida de destinos populares para selección aleatoria
const POPULAR_DESTINATIONS = [
  { name: 'Ciudad de México', lat: 19.4326, lon: -99.1332, imageUrl: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?q=80&w=1080&auto=format&fit=crop', description: 'Explora los mercados, museos y la rica gastronomía' },
  { name: 'Barcelona', lat: 41.3851, lon: 2.1734, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=1080&auto=format&fit=crop', description: 'Descubre la arquitectura de Gaudí y las playas mediterráneas' },
  { name: 'Tokio', lat: 35.6762, lon: 139.6503, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1080&auto=format&fit=crop', description: 'Sumérgete en la fascinante mezcla de tradición y modernidad' },
  { name: 'Lisboa', lat: 38.7223, lon: -9.1393, imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1080&auto=format&fit=crop', description: 'Recorre calles empedradas y disfruta del fado y los pasteles de nata' },
 { name: 'Nueva York', lat: 40.7128, lon: -74.0060, imageUrl: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?q=80&w=1080&auto=format&fit=crop', description: 'Descubre rascacielos, barrios emblemáticos y una escena cultural vibrante' },
  { name: 'Estambul', lat: 41.0082, lon: 28.9784, imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1080&auto=format&fit=crop', description: 'Descubre la ciudad donde se unen dos continentes con bazares y mezquitas' }
];

// Secciones y preguntas para el cuestionario de viaje detallado (versión condensada)
const TRAVEL_QUESTIONNAIRE = [
  {
    id: 'basics',
    title: '1. Perfil y Motivación',
    icon: 'user',
    questions: [
      {
        id: 'adventure-level',
        question: '¿Qué tan aventurero/a te consideras?',
        type: 'slider',
        min: 1,
        max: 5,
        minLabel: 'Relax total',
        maxLabel: '¡Listo/a para escalar volcanes!',
        required: true
      },
      {
        id: 'travel-motivations',
        question: '¿Qué te mueve más cuando viajas?',
        type: 'checkbox',
        maxSelections: 3,
        options: [
          { value: 'nature', label: 'Naturaleza', icon: '🌿' },
          { value: 'gastronomy', label: 'Gastronomía', icon: '🍽️' },
          { value: 'history-culture', label: 'Historia y cultura', icon: '🏛️' },
          { value: 'nightlife', label: 'Vida nocturna', icon: '🌃' },
          { value: 'art', label: 'Arte y creatividad', icon: '🎨' },
          { value: 'hiking', label: 'Caminatas y paisajes', icon: '🥾' },
          { value: 'local-people', label: 'Conectar con gente local', icon: '👋' },
          { value: 'relax', label: 'Descanso absoluto', icon: '🧘' }
        ],
        required: true
      },
      {
        id: 'trip-occasion',
        question: '¿Con quién viajas?',
        type: 'radio',
        options: [
          { value: 'solo', label: 'Viajo solo/a', icon: '🧳' },
          { value: 'couple', label: 'En pareja', icon: '💑' },
          { value: 'family', label: 'Con familia', icon: '👨‍👩‍👧‍👦' },
          { value: 'friends', label: 'Con amigos', icon: '👯' }
        ],
        required: false
      }
    ]
  },
  {
    id: 'preferences',
    title: '2. Estilo y Presupuesto',
    icon: 'wallet',
    questions: [
      {
        id: 'budget-level',
        question: '¿Qué tan suelta está tu billetera en este viaje?',
        type: 'slider',
        min: 1,
        max: 5,
        minLabel: 'Cuidando cada centavo',
        maxLabel: '¡Este viaje se celebra!',
        required: true
      },
      {
        id: 'budget-priority',
        question: '¿En qué prefieres invertir más?',
        type: 'checkbox',
        maxSelections: 2,
        options: [
          { value: 'food', label: 'Gastronomía', icon: '🍷' },
          { value: 'accommodation', label: 'Alojamiento', icon: '🏨' },
          { value: 'experiences', label: 'Experiencias únicas', icon: '✨' },
          { value: 'comfort', label: 'Comodidad', icon: '🛋️' },
          { value: 'activities', label: 'Actividades y tours', icon: '🎭' }
        ],
        required: true
      },
      {
        id: 'travel-style',
        question: '¿Cuál es tu ritmo ideal de viaje?',
        type: 'radio',
        options: [
          { value: 'explorer', label: 'Ver todo lo posible', icon: '🔍' },
          { value: 'balanced', label: 'Un balance entre ver y disfrutar', icon: '⚖️' },
          { value: 'relaxed', label: 'Tomarlo con calma, sin prisa', icon: '🧘‍♀️' },
          { value: 'spontaneous', label: 'Improvisación y aventura', icon: '🎲' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'experience',
    title: '3. Experiencias y Conciencia',
    icon: 'compass',
    questions: [
      {
        id: 'wake-up-time',
        question: '¿Qué tan temprano es demasiado temprano?',
        type: 'slider',
        min: 1,
        max: 5,
        minLabel: 'Después de las 9',
        maxLabel: '¡Amaneceres siempre!',
        required: false
      },
      {
        id: 'accommodation-type',
        question: '¿Qué tipo de alojamiento prefieres?',
        type: 'radio',
        options: [
          { value: 'hotel', label: 'Hotel estándar', icon: '🏨' },
          { value: 'boutique', label: 'Hotel boutique/con encanto', icon: '✨' },
          { value: 'apartment', label: 'Apartamento/Airbnb', icon: '🏠' },
          { value: 'unique', label: 'Alojamiento único (glamping, etc.)', icon: '⛺' },
          { value: 'hostel', label: 'Hostel/económico', icon: '🎒' }
        ],
        required: false
      },
      {
        id: 'sustainability',
        question: '¿Qué tan importante es la sostenibilidad en tu viaje?',
        type: 'slider',
        min: 1,
        max: 5,
        minLabel: 'No es prioridad',
        maxLabel: 'Muy importante',
        required: false
      }
    ]
  }
];

// Preguntas para el quiz de viaje (version simplificada anterior)
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'travel-type',
    question: '¿Qué tipo de viaje estás buscando?',
    options: [
      { value: 'cultural', label: 'Cultural y patrimonio' },
      { value: 'adventure', label: 'Aventura y naturaleza' },
      { value: 'relax', label: 'Relajación y bienestar' },
      { value: 'food', label: 'Gastronomía y vida nocturna' },
      { value: 'family', label: 'Familiar y actividades para niños' }
    ]
  },
  {
    id: 'duration',
    question: '¿Cuántos días durará tu viaje?',
    options: [
      { value: 'weekend', label: 'Fin de semana (2-3 días)' },
      { value: 'week', label: 'Una semana (4-7 días)' },
      { value: 'twoWeeks', label: 'Dos semanas (8-15 días)' },
      { value: 'month', label: 'Más de dos semanas' }
    ]
  },
  {
    id: 'budget',
    question: '¿Cuál es tu presupuesto aproximado por persona?',
    options: [
      { value: 'economic', label: 'Económico (menos de $500)' },
      { value: 'moderate', label: 'Moderado ($500-$1500)' },
      { value: 'luxury', label: 'Premium ($1500-$3000)' },
      { value: 'ultraluxury', label: 'Ultra Premium (más de $3000)' }
    ]
  },
  {
    id: 'activities',
    question: '¿Qué actividades te interesan más?',
    options: [
      { value: 'sightseeing', label: 'Visitar monumentos y museos' },
      { value: 'outdoor', label: 'Actividades al aire libre' },
      { value: 'gastronomy', label: 'Experiencias gastronómicas' },
      { value: 'shows', label: 'Espectáculos y entretenimiento' },
      { value: 'shopping', label: 'Compras y mercados locales' }
    ]
  },
  {
    id: 'accommodation',
    question: '¿Qué tipo de alojamiento prefieres?',
    options: [
      { value: 'hotel', label: 'Hotel' },
      { value: 'airbnb', label: 'Apartamento/Airbnb' },
      { value: 'hostel', label: 'Hostal/Albergue' },
      { value: 'eco', label: 'Ecoturismo/Glamping' },
      { value: 'luxury', label: 'Resort/Hotel boutique' }
    ]
  }
];

// Agregar el tipo para el handle de la ref
export interface RoutesSectionHandle {
  openItineraryModal: (initialDestination?: string) => void;
}

export const RoutesSection = forwardRef<RoutesSectionHandle, RoutesSectionProps>(
  ({ initialRoutes }, ref) => {
    const [routes, setRoutes] = useState<Route[]>(initialRoutes || []);
    const [isLoading, setIsLoading] = useState(!initialRoutes);
    const [searchLocation, setSearchLocation] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
    
    // Estado para el modal de itinerario personalizado
    const [showItineraryModal, setShowItineraryModal] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState('');
    const [currentQuestionnaireSection, setCurrentQuestionnaireSection] = useState(0);
    const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
    const [generatingItinerary, setGeneratingItinerary] = useState(false);
    const [generatedItinerary, setGeneratedItinerary] = useState<string | null>(null);

    // Nuevo estado para el modal de correo electrónico
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [email, setEmail] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    // Función para abrir el modal de itinerario personalizado
    const openItineraryModal = (initialDestination?: string) => {
      setShowItineraryModal(true);
      setCurrentQuestionnaireSection(0);
      setQuestionnaireAnswers({});
      setGeneratedItinerary(null);
      if (initialDestination) {
        setSelectedDestination(initialDestination);
        setCurrentQuestionnaireSection(1); // Saltar la sección de selección de destino
      } else {
        setSelectedDestination('');
      }
    };

    // Exponer métodos a través de la ref
    useImperativeHandle(ref, () => ({
      openItineraryModal
    }));

    // Seleccionar 3 destinos aleatorios de la lista
    const getRandomDestinations = useCallback(() => {
      // Mezclar el arreglo de destinos usando el algoritmo de Fisher-Yates
      const shuffled = [...POPULAR_DESTINATIONS];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // Tomar los primeros 3 destinos
      return shuffled.slice(0, 3);
    }, []);

    useEffect(() => {
      if (!initialRoutes) {
        fetchPopularDestinations();
      }
    }, [initialRoutes, getRandomDestinations]);

    // Función para obtener destinos populares
    const fetchPopularDestinations = async () => {
      setIsLoading(true);
      
      try {
        // Obtener 3 destinos aleatorios de nuestra lista preseleccionada
        const selectedDestinations = getRandomDestinations();
        
        // Crear rutas con datos enriquecidos
        const routesData = selectedDestinations.map(destination => {
          return {
            id: `route-${destination.name.toLowerCase().replace(/\s/g, '-')}`,
            title: `Explora ${destination.name}`,
            description: destination.description || `Descubre los lugares más emblemáticos de ${destination.name}`,
            location: destination.name,
            rating: 4.5 + Math.random() * 0.5, // Rating entre 4.5 y 5.0
            imageUrl: destination.imageUrl,
            duration: `${3 + Math.floor(Math.random() * 4)} días`, // Entre 3 y 6 días
            coordinates: {
              lat: destination.lat,
              lon: destination.lon
            }
          };
        });
        
        setRoutes(routesData);
      } catch (error) {
        console.error('Error al cargar destinos:', error);
        // Cargar datos de respaldo en caso de error
        setRoutes([
          {
            id: '1',
            title: 'Mercados locales de Ciudad de México',
            description: 'Explora los auténticos sabores y tradiciones en los mercados más emblemáticos',
            location: 'Ciudad de México',
            rating: 4.8,
            imageUrl: 'https://images.unsplash.com/photo-1605216953515-e8cca5887718?q=80&w=1080&auto=format&fit=crop',
            duration: '1 día'
          },
          {
            id: '2',
            title: 'Ruta de templos en Tokio',
            description: 'Un recorrido espiritual por los templos más importantes de Tokio',
            location: 'Tokio, Japón',
            rating: 4.9,
            imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1080&auto=format&fit=crop',
            duration: '2 días'
          },
          {
            id: '3',
            title: 'Arquitectura modernista en Barcelona',
            description: 'De Gaudí a la Barcelona contemporánea',
            location: 'Barcelona, España',
            rating: 4.7,
            imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=1080&auto=format&fit=crop',
            duration: '3 días'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    // Buscar destinos usando Geocoding API
    const searchDestinations = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!searchLocation.trim()) return;
      
      setIsLoading(true);
      try {
        // Usar Geocoding API para obtener coordenadas del lugar buscado
        const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchLocation)}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`;
        const geocodingResponse = await fetch(geocodingUrl);
        const geocodingData = await geocodingResponse.json();
        
        if (geocodingData.features && geocodingData.features.length > 0) {
          const location = geocodingData.features[0];
          const coords = location.geometry.coordinates;
          const placeName = location.properties.city || location.properties.state || location.properties.country || location.properties.name;
          
          // Intentar conseguir una imagen para el destino (en producción se podría usar una API de imágenes)
          let imageUrl = `https://source.unsplash.com/random/600x400/?${encodeURIComponent(placeName)},travel`;
          
          // Crear un nuevo objeto de ruta para el lugar buscado
          const newRoute = {
            id: `route-search-${Date.now()}`,
            title: `Explora ${placeName}`,
            description: `Descubre los lugares más fascinantes de ${placeName} con nuestras rutas personalizadas`,
            location: placeName,
            rating: 4.5 + Math.random() * 0.5,
            imageUrl,
            duration: `${3 + Math.floor(Math.random() * 4)} días`,
            coordinates: {
              lat: coords[1],
              lon: coords[0]
            }
          };
          
          // Reemplazar las rutas con el resultado de búsqueda y 2 populares
          const randomDestinations = getRandomDestinations().slice(0, 2);
          const additionalRoutes = randomDestinations.map(dest => ({
            id: `route-${dest.name.toLowerCase().replace(/\s/g, '-')}`,
            title: `Explora ${dest.name}`,
            description: dest.description || `Descubre los lugares más emblemáticos de ${dest.name}`,
            location: dest.name,
            rating: 4.5 + Math.random() * 0.5,
            imageUrl: dest.imageUrl,
            duration: `${3 + Math.floor(Math.random() * 4)} días`,
            coordinates: {
              lat: dest.lat,
              lon: dest.lon
            }
          }));
          
          setRoutes([newRoute, ...additionalRoutes]);
        } else {
          alert('No se encontraron resultados para esa ubicación');
        }
      } catch (error) {
        console.error('Error al buscar destino:', error);
        alert('Hubo un error al buscar el destino');
      } finally {
        setIsLoading(false);
        setSearchLocation('');
        setShowSearch(false);
      }
    };

    // Función para actualizar las respuestas del cuestionario
    const handleQuestionAnswer = (sectionId: string, questionId: string, answer: any) => {
      setQuestionnaireAnswers(prev => ({
        ...prev,
        [`${sectionId}_${questionId}`]: answer
      }));
    };

    // Función para avanzar a la siguiente sección del cuestionario
    const goToNextSection = () => {
      if (currentQuestionnaireSection < TRAVEL_QUESTIONNAIRE.length) {
        setCurrentQuestionnaireSection(prev => prev + 1);
      } else {
        // Cuestionario completado, generar itinerario
        generateItineraryWithOpenAI();
      }
    };

    // Función para volver a la sección anterior del cuestionario
    const goToPreviousSection = () => {
      setCurrentQuestionnaireSection(prev => Math.max(0, prev - 1));
    };

    // Función para generar itinerario con OpenAI
    const generateItineraryWithOpenAI = async () => {
      setGeneratingItinerary(true);
      
      try {
        // Preparar las preferencias basadas en las respuestas del cuestionario
        const preferences = {
          // Convertir las respuestas del cuestionario a un formato adecuado para la API
          destination: selectedDestination,
          travelType: questionnaireAnswers['basics_travel-motivations'] || [],
          adventureLevel: questionnaireAnswers['basics_adventure-level'] || 3,
          travelStyle: questionnaireAnswers['preferences_travel-style'] || '',
          budget: questionnaireAnswers['preferences_budget-level'] || 3,
          budgetPriorities: questionnaireAnswers['preferences_budget-priority'] || [],
          itineraryStyle: questionnaireAnswers['preferences_travel-style'] || 3,
          wakeUpTime: questionnaireAnswers['experience_wake-up-time'] || 3,
          environmentalImportance: questionnaireAnswers['experience_sustainability'] || 3,
          tripGoal: questionnaireAnswers['basics_trip-occasion'] || '',
          tripOccasion: questionnaireAnswers['basics_trip-occasion'] || '',
          travelCompanions: questionnaireAnswers['basics_trip-occasion'] || ''
        };
        
        // Llamar al servicio de OpenAI
        const itineraryContent = await generateItinerary({
          destination: selectedDestination,
          preferences
        });
        
        // Guardar en localStorage para que esté disponible en la página completa
        const storageKey = `itinerary-${selectedDestination}`;
        localStorage.setItem(storageKey, JSON.stringify({
          content: itineraryContent,
          timestamp: new Date().toISOString(),
          params: {
            ...preferences
          }
        }));
        
        setGeneratedItinerary(itineraryContent);
      } catch (error) {
        console.error('Error al generar itinerario:', error);
        alert('Hubo un error al generar tu itinerario personalizado');
      } finally {
        setGeneratingItinerary(false);
      }
    };

    // Renderizar un campo de respuesta basado en su tipo con mejor UI
    const renderAnswerField = (question: any, sectionId: string) => {
      const questionKey = `${sectionId}_${question.id}`;
      const currentValue = questionnaireAnswers[questionKey] || '';
      
      switch (question.type) {
        case 'text':
          return (
            <input 
              type="text"
              value={currentValue}
              onChange={(e) => handleQuestionAnswer(sectionId, question.id, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black"
              placeholder="Escribe tu respuesta aquí..."
            />
          );
          
        case 'slider':
          return (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{question.minLabel}</span>
                <span>{question.maxLabel}</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="range"
                  min={question.min}
                  max={question.max}
                  value={currentValue || question.min}
                  onChange={(e) => handleQuestionAnswer(sectionId, question.id, parseInt(e.target.value))}
                  className="w-full h-2 accent-emerald-500 cursor-pointer"
                />
                <span className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-full font-medium text-sm shadow-sm transform transition-all duration-200" 
                  style={{
                    transform: `scale(${1 + ((currentValue || question.min) - question.min) * 0.1})`,
                  }}
                >
                  {currentValue || question.min}
                </span>
              </div>
            </div>
          );
          
        case 'radio':
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {question.options.map((option: any) => (
                <label 
                  key={option.value}
                  className={`flex items-center p-3 ${currentValue === option.value 
                    ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-500 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30'} 
                    border rounded-lg cursor-pointer transition-all duration-200 transform ${currentValue === option.value ? 'scale-[1.02]' : 'scale-100'}`}
                >
                  <input 
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={currentValue === option.value}
                    onChange={() => handleQuestionAnswer(sectionId, question.id, option.value)}
                    className="sr-only" // Ocultar el radio original
                  />
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${currentValue === option.value ? 'bg-emerald-500 border-transparent' : 'border-2 border-gray-300'}`}>
                    {currentValue === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white animate-scale-in"></div>
                    )}
                  </div>
                  <div className="flex items-center">
                    {option.icon && <span className="mr-2 text-lg">{option.icon}</span>}
                    <span className="text-gray-800">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          );
          
        case 'checkbox':
          const selectedValues = Array.isArray(currentValue) ? currentValue : [];
          
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {question.options.map((option: any) => {
                const isChecked = selectedValues.includes(option.value);
                return (
                  <label 
                    key={option.value}
                    className={`flex items-center p-3 ${isChecked 
                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-500 shadow-sm' 
                      : 'bg-white border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30'} 
                      border rounded-lg cursor-pointer transition-all duration-200 transform ${isChecked ? 'scale-[1.02]' : 'scale-100'}`}
                  >
                    <input 
                      type="checkbox"
                      value={option.value}
                      checked={isChecked}
                      onChange={() => {
                        // Manejar selección múltiple con límite
                        const newValues = isChecked 
                          ? selectedValues.filter(v => v !== option.value)
                          : [...selectedValues, option.value];
                          
                        // Aplicar el límite máximo de selecciones si existe
                        if (!isChecked && question.maxSelections && newValues.length > question.maxSelections) {
                          // Si excede el límite, eliminar el primer elemento
                          newValues.shift();
                        }
                        
                        handleQuestionAnswer(sectionId, question.id, newValues);
                      }}
                      className="sr-only" // Ocultar el checkbox original
                    />
                    <div className={`flex-shrink-0 w-5 h-5 rounded-md mr-3 flex items-center justify-center ${isChecked ? 'bg-emerald-500 border-transparent' : 'border-2 border-gray-300'}`}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center">
                      {option.icon && <span className="mr-2 text-lg">{option.icon}</span>}
                      <span className="text-gray-800">{option.label}</span>
                    </div>
                  </label>
                );
              })}
              {question.maxSelections && (
                <p className="text-xs text-gray-500 col-span-full mt-1">
                  Selecciona hasta {question.maxSelections} opciones
                  {Array.isArray(currentValue) && (
                    <span className="ml-1 font-medium">
                      ({currentValue.length}/{question.maxSelections})
                    </span>
                  )}
                </p>
              )}
            </div>
          );
          
        default:
          return <p className="text-red-500">Tipo de pregunta no soportado: {question.type}</p>;
      }
    };

    // Verificar si una sección está completa (todas las preguntas requeridas respondidas)
    const isSectionComplete = (sectionIndex: number) => {
      if (sectionIndex < 0 || sectionIndex >= TRAVEL_QUESTIONNAIRE.length) return false;
      
      const section = TRAVEL_QUESTIONNAIRE[sectionIndex];
      return section.questions
        .filter(q => q.required)
        .every(q => {
          const answer = questionnaireAnswers[`${section.id}_${q.id}`];
          if (Array.isArray(answer)) return answer.length > 0;
          return answer !== undefined && answer !== '';
        });
    };

    // Renderizado del componente del cuestionario con mejor UI
    const renderItineraryModal = () => {
      if (!showItineraryModal) return null;
      
      // Calcular el progreso general del cuestionario
      const calculateProgress = () => {
        let answeredRequired = 0;
        let totalRequired = 0;
        
        TRAVEL_QUESTIONNAIRE.forEach(section => {
          section.questions.forEach(question => {
            if (question.required) {
              totalRequired++;
              const answer = questionnaireAnswers[`${section.id}_${question.id}`];
              if (
                (Array.isArray(answer) && answer.length > 0) ||
                (typeof answer === 'number') ||
                (typeof answer === 'string' && answer.trim() !== '')
              ) {
                answeredRequired++;
              }
            }
          });
        });
        
        return totalRequired > 0 ? (answeredRequired / totalRequired) * 100 : 0;
      };
      
      return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300">
          <div 
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto animate-modal-in"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                  <span className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"></path>
                    </svg>
                  </span>
                  Crea tu itinerario personalizado
                </h3>
                <button 
                  onClick={() => setShowItineraryModal(false)}
                  className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>
              
              {generatedItinerary ? (
                // Mostrar itinerario generado en un formato más atractivo
                <div className="prose max-w-none animate-fade-in">
                  <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                    <h4 className="text-emerald-800 font-medium mb-2">Tu itinerario para {selectedDestination}</h4>
                    <p className="text-sm text-emerald-700">Basado en tus preferencias, hemos creado un plan personalizado para tu viaje.</p>
                    <div className="flex items-center mt-2 bg-white/50 p-2 rounded text-xs">
                      <p className="text-emerald-600 font-medium">Incluye lugares reales en {selectedDestination} con detalles específicos</p>
                    </div>
                  </div>
                  
                  <div id="itinerary-modal-content" className="px-2">
                    {/* Extraer el título principal del itinerario */}
                    <h2 className="text-xl font-bold text-emerald-800 mb-4">
                      {generatedItinerary.match(/# (.*?)(?:\n|$)/) 
                        ? generatedItinerary.match(/# (.*?)(?:\n|$)/)![1] 
                        : `Itinerario Detallado para ${selectedDestination}`}
                    </h2>
                    
                    {/* Procesar y mostrar días del itinerario */}
                    {generatedItinerary.split(/\n(## .*)/g).map((part, index) => {
                      if (part.startsWith('## ')) {
                        // Es un encabezado de día u otra sección
                        const headingText = part.replace(/^## /, '').replace(/##/g, '');
                        return (
                          <div key={`section-${index}-heading`} className="mt-6 mb-3">
                            <h3 className="text-lg font-bold text-emerald-700 border-b border-emerald-200 pb-2">
                              {headingText}
                            </h3>
                          </div>
                        );
                      } else if (part.includes('**Mañana**') || part.includes('**Tarde**') || part.includes('**Noche**') || 
                                part.includes('### Mañana') || part.includes('### Tarde') || part.includes('### Noche') ||
                                part.includes('### Morning') || part.includes('### Afternoon') || part.includes('### Evening') ||
                                part.includes('### Night') || part.includes('##Mañana') || part.includes('##Tarde') || 
                                part.includes('##Noche') || part.includes('### Morning') || part.includes('### Afternoon')) {
                        // Es una sección con estructura de mañana/tarde/noche
                        return (
                          <div key={`section-${index}-day`} className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-100">
                            {part.split(/\n(###.*|\*\*.*\*\*:|##.*|#+ .*)/g).map((section, i) => {
                              if (section.startsWith('### ') || section.startsWith('##')) {
                                // Es un subencabezado
                                const headingText = section.replace(/^### |^## /, '');
                                return (
                                  <h4 key={`section-${index}-heading-${i}`} className="text-md font-semibold text-emerald-600 mt-4 mb-2">
                                    {headingText}
                                  </h4>
                                );
                              } else if (section.includes('**Mañana**') || section.match(/### Mañana|##Mañana/) || section.match(/### Morning/)) {
                                const morningContent = section.split(/\*\*Mañana\*\*:?|\*\*Morning\*\*:?|### Mañana|### Morning|##Mañana/)[1]?.trim() || '';
                                return (
                                  <div key={`section-${index}-morning-${i}`} className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="bg-emerald-100 p-1.5 rounded-full">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                                          <circle cx="12" cy="12" r="5"/>
                                          <line x1="12" y1="1" x2="12" y2="3"/>
                                          <line x1="12" y1="21" x2="12" y2="23"/>
                                        </svg>
                                      </span>
                                      <span className="font-medium text-emerald-700">Mañana</span>
                                    </div>
                                    <div className="text-sm leading-relaxed text-gray-700 ml-7" 
                                         dangerouslySetInnerHTML={{ 
                                           __html: morningContent
                                             .replace(/\*\*/g, '')
                                             .replace(/\n/g, '<br>')
                                             .replace(/- /g, '• ') 
                                         }} 
                                    />
                                  </div>
                                );
                              } else if (section.includes('**Tarde**') || section.match(/### Tarde|##Tarde/) || section.match(/### Afternoon/)) {
                                const afternoonContent = section.split(/\*\*Tarde\*\*:?|\*\*Afternoon\*\*:?|### Tarde|### Afternoon|##Tarde/)[1]?.trim() || '';
                                return (
                                  <div key={`section-${index}-afternoon-${i}`} className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="bg-orange-100 p-1.5 rounded-full">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                                          <circle cx="12" cy="12" r="5"/>
                                          <line x1="12" y1="1" x2="12" y2="3"/>
                                          <line x1="12" y1="21" x2="12" y2="23"/>
                                        </svg>
                                      </span>
                                      <span className="font-medium text-orange-500">Tarde</span>
                                    </div>
                                    <div className="text-sm leading-relaxed text-gray-700 ml-7" 
                                         dangerouslySetInnerHTML={{ 
                                           __html: afternoonContent
                                             .replace(/\*\*/g, '')
                                             .replace(/\n/g, '<br>')
                                             .replace(/- /g, '• ') 
                                         }} 
                                    />
                                  </div>
                                );
                              } else if (section.includes('**Noche**') || section.match(/### Noche|##Noche/) || section.match(/### Night/) || section.match(/### Evening/)) {
                                const eveningContent = section.split(/\*\*Noche\*\*:?|\*\*Night\*\*:?|\*\*Evening\*\*:?|### Noche|### Night|### Evening|##Noche/)[1]?.trim() || '';
                                return (
                                  <div key={`section-${index}-evening-${i}`} className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="bg-indigo-100 p-1.5 rounded-full">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                                        </svg>
                                      </span>
                                      <span className="font-medium text-indigo-500">Noche</span>
                                    </div>
                                    <div className="text-sm leading-relaxed text-gray-700 ml-7" 
                                         dangerouslySetInnerHTML={{ 
                                           __html: eveningContent
                                             .replace(/\*\*/g, '')
                                             .replace(/\n/g, '<br>')
                                             .replace(/- /g, '• ') 
                                         }} 
                                    />
                                  </div>
                                );
                              } else if (section.trim()) {
                                // Es texto normal - mejorar el formato del texto
                                const formattedText = part
                                  .replace(/\*\*/g, '')
                                  .replace(/\*/g, '')
                                  .replace(/##\s*/g, '')
                                  .replace(/##/g, '')
                                  .replace(/\n/g, '<br>')
                                  .replace(/- /g, '• ')
                                  // Destacar marcadores de tiempo
                                  .replace(/Mañana:/g, '<strong class="text-emerald-700">Mañana:</strong>')
                                  .replace(/Tarde:/g, '<strong class="text-orange-500">Tarde:</strong>')
                                  .replace(/Noche:/g, '<strong class="text-indigo-600">Noche:</strong>');
                                  
                                return (
                                  <div key={`section-${index}-text-${i}`} className="mb-5 text-sm leading-relaxed text-gray-700" 
                                       dangerouslySetInnerHTML={{ 
                                         __html: formattedText 
                                       }} 
                                  />
                                );
                              }
                              return null;
                            })}
                          </div>
                        );
                      } else if (part.trim()) {
                        // Es texto normal - mejorar el formato del texto
                        const formattedText = part
                          .replace(/\*\*/g, '')
                          .replace(/\*/g, '')
                          .replace(/##\s*/g, '')
                          .replace(/##/g, '')
                          .replace(/\n/g, '<br>')
                          .replace(/- /g, '• ')
                          // Destacar marcadores de tiempo
                          .replace(/Mañana:/g, '<strong class="text-emerald-700">Mañana:</strong>')
                          .replace(/Tarde:/g, '<strong class="text-orange-500">Tarde:</strong>')
                          .replace(/Noche:/g, '<strong class="text-indigo-600">Noche:</strong>');
                          
                        return (
                          <div key={`text-${index}`} className="mb-5 text-sm leading-relaxed text-gray-700" 
                               dangerouslySetInnerHTML={{ 
                                 __html: formattedText 
                               }} 
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <div className="flex justify-end mt-6 gap-2">
                    <button 
                      onClick={() => setShowEmailModal(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md flex items-center gap-2 hover:bg-emerald-700 transition-colors"
                    >
                      <Mail size={16} />
                      Enviar por correo
                    </button>
                    <button 
                      onClick={() => setShowItineraryModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : generatingItinerary ? (
                // Mejorar pantalla de carga
                <div className="flex flex-col items-center justify-center py-12 animate-pulse">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                      <MapPin size={20} />
                    </div>
                  </div>
                  <p className="text-gray-800 font-medium mt-6 mb-1">Creando tu plan perfecto para {selectedDestination}</p>
                  <p className="text-sm text-gray-500">Buscando lugares reales y consejos exclusivos...</p>
                  
                  <div className="mt-8 w-full max-w-md">
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 animate-progress-indeterminate rounded-full"></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <span className="block w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                        <span>Buscando mejores opciones</span>
                      </div>
                      <span className="text-emerald-500 font-medium animate-pulse">Por favor espera...</span>
                    </div>
                  </div>
                </div>
              ) : currentQuestionnaireSection === 0 ? (
                // Paso 1: Seleccionar destino (modernizado)
                <div className="animate-fade-in">
                  <div className="relative mb-8 overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-800 opacity-90"></div>
                    <div className="relative p-6">
                      <h4 className="text-white font-bold text-lg mb-3">¿A dónde quieres ir?</h4>
                      <p className="text-emerald-50 text-sm mb-4">Elige un destino para crear tu itinerario personalizado</p>
                      
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (selectedDestination) {
                          setCurrentQuestionnaireSection(1);
                        }
                      }} className="relative z-10">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin size={20} className="text-emerald-500" />
                          </div>
                          <input 
                            type="text" 
                            value={selectedDestination}
                            onChange={(e) => setSelectedDestination(e.target.value)}
                            placeholder="Ingresa tu destino (ej. Barcelona, Tokio...)" 
                            className="w-full py-3 pl-10 pr-4 border-none bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black text-lg font-medium"
                            required
                          />
                        </div>
                        
                        <button 
                          type="submit"
                          className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg text-sm font-bold transition-colors shadow-lg flex items-center justify-center"
                          disabled={!selectedDestination}
                        >
                          <span>Continuar</span>
                          <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Destinos populares:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {POPULAR_DESTINATIONS.map(dest => (
                        <button
                          key={dest.name}
                          onClick={() => {
                            setSelectedDestination(dest.name);
                            setCurrentQuestionnaireSection(1);
                          }}
                          className="group relative h-24 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          <div className="absolute inset-0">
                            <img 
                              src={dest.imageUrl} 
                              alt={dest.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                          </div>
                          <div className="absolute inset-0 flex items-end p-3">
                            <span className="text-white font-medium text-sm">{dest.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Mostrar sección actual del cuestionario detallado (con mejor UI)
                <div className="animate-fade-in">
                  {/* Progreso general del cuestionario */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-emerald-800 text-lg flex items-center">
                        {TRAVEL_QUESTIONNAIRE[currentQuestionnaireSection - 1].title}
                      </h4>
                      <div className="flex items-center">
                        <span className="text-sm bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                          {currentQuestionnaireSection}/{TRAVEL_QUESTIONNAIRE.length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                    
                    {/* Destino seleccionado */}
                    <div className="mt-3 flex items-center bg-emerald-50/50 py-2 px-3 rounded-lg">
                      <MapPin size={16} className="text-emerald-500 mr-2" />
                      <span className="text-emerald-700 text-sm font-medium">Destino: <strong>{selectedDestination}</strong></span>
                    </div>
                  </div>
                  
                  {/* Preguntas de la sección actual con animación */}
                  <div className="space-y-6">
                    {TRAVEL_QUESTIONNAIRE[currentQuestionnaireSection - 1].questions.map((question, qIndex) => (
                      <div 
                        key={`section-${currentQuestionnaireSection - 1}-question-${qIndex}`} 
                        className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm animate-slide-up"
                        style={{ animationDelay: `${qIndex * 100}ms` }}
                      >
                        <div className="flex items-start">
                          <div className="flex-grow">
                            <h5 className="font-medium text-gray-800 mb-1">{question.question}</h5>
                            {question.required && <span className="text-xs text-red-500">* Requerido</span>}
                          </div>
                        </div>
                        {renderAnswerField(question, TRAVEL_QUESTIONNAIRE[currentQuestionnaireSection - 1].id)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Botones de navegación */}
                  <div className="flex justify-between mt-8">
                    <button 
                      onClick={goToPreviousSection}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                      Atrás
                    </button>
                    
                    <button 
                      onClick={goToNextSection}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center
                        ${isSectionComplete(currentQuestionnaireSection - 1) 
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      disabled={!isSectionComplete(currentQuestionnaireSection - 1)}
                    >
                      {currentQuestionnaireSection === TRAVEL_QUESTIONNAIRE.length ? (
                        <>
                          <span>Generar itinerario</span>
                          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Continuar</span>
                          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    // Añadir la función para enviar correo electrónico
    const handleSendEmail = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      
      if (!email.trim() || !selectedDestination) {
        setEmailError('Por favor ingresa un correo electrónico válido');
        return;
      }
      
      // Validar correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Por favor ingresa un correo electrónico válido');
        return;
      }
      
      setSendingEmail(true);
      setEmailError(null);
      
      try {
        // Obtener el contenido HTML del itinerario
        const itineraryElement = document.getElementById('itinerary-modal-content');
        if (!itineraryElement) {
          throw new Error('No se pudo encontrar el contenido del itinerario');
        }
        
        // Crear una versión simplificada del HTML para el correo
        let itineraryHtml = '';
        
        // Obtener el contenido del modal y limpiarlo para el correo
        const content = itineraryElement.innerHTML;
        
        // Extraer título del itinerario si existe
        const titleMatch = content.match(/<h2[^>]*>(.*?)<\/h2>/i);
        if (titleMatch && titleMatch[1]) {
          itineraryHtml += `<h2 style="color: #10b981; margin-bottom: 15px;">${titleMatch[1]}</h2>`;
        }
        
        // Procesar el contenido por días
        const dayRegex = /<div class="[^"]*day-title[^"]*">(.*?)<\/div>/gi;
        let dayMatch;
        let dayIndex = 0;
        
        while ((dayMatch = dayRegex.exec(content)) !== null) {
          dayIndex++;
          itineraryHtml += `<div style="background-color: #f3f4f6; padding: 10px; margin: 15px 0; font-weight: bold; border-radius: 4px;">Día ${dayIndex}: ${dayMatch[1]}</div>`;
          
          // Buscar contenido para cada parte del día
          const morningRegex = new RegExp(`<div[^>]*>\\s*<div[^>]*>\\s*<span[^>]*>\\s*<svg[^>]*>.*?</svg>\\s*</span>\\s*<span[^>]*>Mañana</span>\\s*</div>\\s*<div[^>]*>(.*?)</div>\\s*</div>`, 'is');
          const morningMatch = content.match(morningRegex);
          
          if (morningMatch && morningMatch[1]) {
            itineraryHtml += `<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 10px 15px; margin-bottom: 10px;">
              <strong>Mañana</strong><br>
              ${morningMatch[1].replace(/<br>/g, '<br>').trim()}
            </div>`;
          }
          
          const afternoonRegex = new RegExp(`<div[^>]*>\\s*<div[^>]*>\\s*<span[^>]*>\\s*<svg[^>]*>.*?</svg>\\s*</span>\\s*<span[^>]*>Tarde</span>\\s*</div>\\s*<div[^>]*>(.*?)</div>\\s*</div>`, 'is');
          const afternoonMatch = content.match(afternoonRegex);
          
          if (afternoonMatch && afternoonMatch[1]) {
            itineraryHtml += `<div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 10px 15px; margin-bottom: 10px;">
              <strong>Tarde</strong><br>
              ${afternoonMatch[1].replace(/<br>/g, '<br>').trim()}
            </div>`;
          }
          
          const eveningRegex = new RegExp(`<div[^>]*>\\s*<div[^>]*>\\s*<span[^>]*>\\s*<svg[^>]*>.*?</svg>\\s*</span>\\s*<span[^>]*>Noche</span>\\s*</div>\\s*<div[^>]*>(.*?)</div>\\s*</div>`, 'is');
          const eveningMatch = content.match(eveningRegex);
          
          if (eveningMatch && eveningMatch[1]) {
            itineraryHtml += `<div style="background-color: #eef2ff; border-left: 4px solid #6366f1; padding: 10px 15px; margin-bottom: 10px;">
              <strong>Noche</strong><br>
              ${eveningMatch[1].replace(/<br>/g, '<br>').trim()}
            </div>`;
          }
        }
        
        // Si no se pudo extraer contenido estructurado, usar el contenido completo
        if (!itineraryHtml) {
          // Simplificar el HTML para el correo eliminando scripts y estilos
          itineraryHtml = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/class="[^"]*"/g, '')
            .replace(/id="[^"]*"/g, '');
        }
        
        console.log('Preparando envío de correo a:', email);
        
        // Enviar a la API
        const response = await fetch('/api/send-itinerary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            destination: selectedDestination,
            itineraryHtml,
            subject: `Tu itinerario personalizado para ${selectedDestination}` 
          }),
        });
        
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
        if (!response.ok) {
          const errorMsg = data.error || data.details || 'Error al enviar el correo';
          console.error('Error en la respuesta del servidor:', errorMsg);
          throw new Error(errorMsg);
        }
        
        setEmailSent(true);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSent(false);
        }, 3000);
        
      } catch (error) {
        console.error('Error al enviar correo:', error);
        setEmailError(error instanceof Error ? error.message : 'Error al enviar el correo. Por favor, intenta de nuevo más tarde.');
      } finally {
        setSendingEmail(false);
      }
    };

    // Agregar Modal de correo electrónico
    const renderEmailModal = () => {
      if (!showEmailModal) return null;
      
      return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-modal-in p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Recibe tu itinerario por correo</h3>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            {emailSent ? (
              <div className="py-8 text-center">
                <div className="bg-emerald-100 text-emerald-700 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">¡Correo enviado con éxito!</h4>
                <p className="text-gray-600">Tu itinerario ha sido enviado a {email}</p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>
                
                <p className="text-sm text-gray-600">
                  Recibirás un correo con tu itinerario personalizado para {selectedDestination}. Podrás acceder a él en cualquier momento.
                </p>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md mr-2 hover:bg-gray-200 transition-colors"
                    disabled={sendingEmail}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center"
                    disabled={sendingEmail}
                  >
                    {sendingEmail ? (
                      <>
                        <span className="animate-spin mr-2">
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail size={18} className="mr-2" />
                        Enviar
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Globe className="mr-2 text-emerald-600" size={22} />
              Destinos Destacados
            </h2>
            <p className="text-sm text-gray-500 mt-1">Inspiración para tu próxima aventura</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openItineraryModal()}
              className="text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center transition-colors font-medium shadow-md hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Crear itinerario personalizado
            </button>
            <Link 
              href="/routes" 
              className="text-sm bg-white border border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg flex items-center transition-colors font-medium"
            >
              Ver todos <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>

        {showSearch && (
          <form onSubmit={searchDestinations} className="mb-5 bg-gray-50 p-4 rounded-lg flex gap-2 animate-fadeIn shadow-inner">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={18} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="¿A dónde quieres ir?" 
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button 
              type="submit"
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              Buscar
            </button>
            <button 
              type="button"
              onClick={() => setShowSearch(false)}
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center">
              <Loader2 size={40} className="text-emerald-500 animate-spin mb-3" />
              <span className="text-gray-500">Descubriendo destinos increíbles...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {routes.slice(0, 3).map((route) => (
              <Link 
                key={route.id} 
                href={`/routes/${route.id}`} 
                className="group transform transition-all duration-300 hover:-translate-y-1"
                onMouseEnter={() => setHoveredRoute(route.id)}
                onMouseLeave={() => setHoveredRoute(null)}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100">
                  {route.imageUrl ? (
                    <div className="relative h-40 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                      <img 
                        src={route.imageUrl} 
                        alt={route.title} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute bottom-3 left-3 bg-black/30 backdrop-blur-sm text-white rounded-full px-3 py-1 text-xs font-medium z-20 flex items-center">
                        <Navigation size={12} className="mr-1" />
                        {route.location}
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 w-full bg-emerald-100 flex items-center justify-center">
                      <MapPin size={30} className="text-emerald-500" />
                    </div>
                  )}
                  
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={14} className="mr-1 text-emerald-500" />
                        <span>{route.duration || "3-5 días"}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Star size={16} className="mr-1 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{route.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{route.title}</h3>
                    
                    {route.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 flex-grow">{route.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          openItineraryModal(route.location);
                        }}
                        className="text-xs text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                      >
                        Crear itinerario
                      </button>
                      
                      <div className={`text-sm text-emerald-600 font-medium flex items-center transition-all duration-300 ${hoveredRoute === route.id ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openItineraryModal(route.location);
                          }}
                          className="flex items-center text-emerald-600 hover:text-emerald-700"
                        >
                          Detalles <ArrowRight size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Modal de itinerario personalizado */}
        {renderItineraryModal()}

        {/* Modal de correo electrónico */}
        {renderEmailModal()}
      </div>
    );
  }
); 