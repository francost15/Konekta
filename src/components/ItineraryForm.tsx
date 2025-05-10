'use client';

import { useState } from 'react';
import { ChevronDownIcon, MapPinIcon, CalendarIcon, SendIcon } from 'lucide-react';

interface FormData {
  destination: string;
  days: number;
  preferences: {
    adventures: number;
    interests: string[];
    budget: string;
    travelStyle: string;
    environmentalConsciousness: number;
  };
}

const interestOptions = [
  'Gastronomía',
  'Historia',
  'Cultura',
  'Naturaleza',
  'Aventura',
  'Playas',
  'Montañas',
  'Arte',
  'Festivales',
  'Vida nocturna',
  'Compras',
  'Deporte',
  'Gente local'
];

const budgetOptions = ['Bajo', 'Medio', 'Alto'];
const travelStyleOptions = ['Auténtico y local', 'Estándar', 'Premium', 'Lujoso'];

export const ItineraryForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    destination: '',
    days: 3,
    preferences: {
      adventures: 3,
      interests: [],
      budget: 'Medio',
      travelStyle: 'Auténtico y local',
      environmentalConsciousness: 3,
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof FormData] as Record<string, string | number | string[]>,
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'days' ? parseInt(value) : value,
      });
    }
  };

  const handleInterestChange = (interest: string) => {
    const interests = [...formData.preferences.interests];
    
    if (interests.includes(interest)) {
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          interests: interests.filter(i => i !== interest),
        },
      });
    } else {
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          interests: [...interests, interest],
        },
      });
    }
  };

  const handleSliderChange = (name: string, value: number) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof FormData] as Record<string, string | number | string[]>,
          [child]: value,
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validación básica
      if (!formData.destination || formData.preferences.interests.length === 0) {
        alert('Por favor completa todos los campos requeridos');
        setIsLoading(false);
        return;
      }
      
      // Llamar a la API de itinerarios
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al generar el itinerario');
      }
      
      // Aquí puedes redirigir al usuario a una página de resultados
      // o mostrar el itinerario generado
      console.log('Itinerario generado:', data.itinerary);
      
      // Ejemplo de redirección (implementar según sea necesario)
      // router.push(`/itinerary-results?id=${data.itinerary.id}`);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al generar tu itinerario. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Genera tu Itinerario Personalizado</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destino */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            ¿A dónde quieres ir?
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Ej. Oaxaca, México"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3"
              required
            />
          </div>
        </div>
        
        {/* Duración */}
        <div>
          <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
            ¿Cuántos días durará tu viaje?
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="days"
              name="days"
              value={formData.days}
              onChange={handleChange}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3 appearance-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 21].map(day => (
                <option key={day} value={day}>{day} día{day !== 1 ? 's' : ''}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Intereses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Qué te interesa descubrir? (selecciona al menos uno)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {interestOptions.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestChange(interest)}
                className={`py-2 px-3 rounded-full text-sm font-medium transition-colors ${
                  formData.preferences.interests.includes(interest)
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
        
        {/* Nivel de aventura */}
        <div>
          <label htmlFor="adventure-level" className="block text-sm font-medium text-gray-700 mb-2">
            Nivel de aventura: {formData.preferences.adventures}/5
          </label>
          <input
            type="range"
            id="adventure-level"
            name="preferences.adventures"
            min="1"
            max="5"
            value={formData.preferences.adventures}
            onChange={(e) => handleSliderChange('preferences.adventures', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Relajado</span>
            <span>Aventurero</span>
          </div>
        </div>
        
        {/* Presupuesto */}
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
            Presupuesto
          </label>
          <select
            id="budget"
            name="preferences.budget"
            value={formData.preferences.budget}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3"
          >
            {budgetOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        {/* Estilo de viaje */}
        <div>
          <label htmlFor="travelStyle" className="block text-sm font-medium text-gray-700 mb-1">
            Estilo de viaje
          </label>
          <select
            id="travelStyle"
            name="preferences.travelStyle"
            value={formData.preferences.travelStyle}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3"
          >
            {travelStyleOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        {/* Conciencia ambiental */}
        <div>
          <label htmlFor="environmental" className="block text-sm font-medium text-gray-700 mb-2">
            Conciencia ambiental: {formData.preferences.environmentalConsciousness}/5
          </label>
          <input
            type="range"
            id="environmental"
            name="preferences.environmentalConsciousness"
            min="1"
            max="5"
            value={formData.preferences.environmentalConsciousness}
            onChange={(e) => handleSliderChange('preferences.environmentalConsciousness', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Estándar</span>
            <span>Eco-consciente</span>
          </div>
        </div>
        
        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando...
            </>
          ) : (
            <>
              <SendIcon className="h-5 w-5 mr-2" />
              Generar Itinerario
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ItineraryForm; 