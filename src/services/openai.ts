// Servicio para comunicarse con la API de OpenAI y generar itinerarios de viaje personalizados
import OpenAI from "openai";

interface GenerateItineraryParams {
  destination: string;
  preferences: {
    travelType?: string;
    duration?: string;
    budget?: string;
    activities?: string;
    accommodation?: string;
    adventureLevel?: number;
    budgetLevel?: number;
    travelCompanions?: string;
    travelStyle?: string;
    budgetPriorities?: string[];
    additionalRequests?: string;
  };
}

/**
 * Genera un itinerario personalizado basado en las preferencias del usuario
 * utilizando la API de OpenAI
 */
export async function generateItinerary({ 
  destination,
  preferences
}: GenerateItineraryParams): Promise<string> {
  try {
    // Construir un prompt más efectivo para OpenAI
    const prompt = `
      Actúa como un experto local de alto nivel y guía turístico profesional especializado en ${destination}. Necesito que me generes un itinerario detallado para un viaje a ${destination} con estas preferencias:
      
      ${preferences.travelType ? `- Tipo de viaje: ${preferences.travelType}` : ''}
      ${preferences.duration ? `- Duración: ${preferences.duration}` : ''}
      ${preferences.budget ? `- Presupuesto: ${preferences.budget}` : ''}
      ${preferences.budgetLevel ? `- Nivel de presupuesto (1-5): ${preferences.budgetLevel}` : ''}
      ${preferences.activities ? `- Actividades preferidas: ${preferences.activities}` : ''}
      ${preferences.accommodation ? `- Tipo de alojamiento: ${preferences.accommodation}` : ''}
      ${preferences.adventureLevel ? `- Nivel de aventura (1-5): ${preferences.adventureLevel}` : ''}
      ${preferences.travelCompanions ? `- Viajando con: ${preferences.travelCompanions}` : ''}
      ${preferences.travelStyle ? `- Estilo de viaje: ${preferences.travelStyle}` : ''}
      ${preferences.budgetPriorities?.length ? `- Prioridades de gasto: ${preferences.budgetPriorities.join(', ')}` : ''}
      ${preferences.additionalRequests ? `- Solicitudes adicionales: ${preferences.additionalRequests}` : ''}
      
      REQUISITOS IMPORTANTES:
      1. Incluye EXCLUSIVAMENTE lugares REALES y específicos de ${destination}, con sus nombres correctos y actuales.
      2. Para CADA recomendación incluye:
         - Nombre exacto del lugar/atracción/restaurante/alojamiento
         - Breve descripción que explique por qué es relevante (historia, características únicas)
         - Ubicación específica o barrio
         - Información práctica relevante: horarios, costos aproximados cuando sea apropiado
         - Al menos un consejo exclusivo de local para cada día
      3. INCLUYE ENLACES REALES siempre que sea posible usando formato markdown [Nombre](URL) para:
         - Sitios oficiales de atracciones
         - Restaurantes recomendados
         - Hoteles sugeridos
         - Tours o experiencias específicas
         - Mapas o recursos adicionales
      4. Organiza el itinerario con una estructura clara, fácil de seguir y atractiva visualmente

      El itinerario debe incluir:
      1. PLAN DÍA A DÍA: Para cada día especifica actividades para **Mañana**, **Tarde** y **Noche**, con tiempos estimados.
      2. ALOJAMIENTO: 2-3 opciones específicas con rango de precios y ubicaciones estratégicas.
      3. PRESUPUESTO ESTIMADO: Costos aproximados por categoría en moneda local.
      4. CONSEJOS PRÁCTICOS: Información sobre temporadas, movilidad, seguridad y costumbres locales.

      FORMATO:
      - Usa formato Markdown
      - Para cada día estructura claramente las secciones **Mañana**, **Tarde** y **Noche**
      - Incluye enlaces reales usando [Texto](URL)
      - Sé conciso pero informativo

      IMPORTANTE: Este itinerario será utilizado por viajeros reales, así que toda la información debe ser precisa, actualizada y realista, considerando tiempos de desplazamiento. Adapta el contenido al tipo específico de viaje solicitado y presupuesto indicado.
      
      Usa tu conocimiento para encontrar la información más actualizada sobre:
      - Atracciones turísticas en ${destination}
      - Restaurantes recomendados en ${destination}
      - Alojamientos disponibles en ${destination}
      - Eventos actuales o temporadas especiales en ${destination}
      - Información práctica de transporte en ${destination}
    `;
    
    // Obtener la API key de OpenAI
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('No se encontró la clave de API de OpenAI');
    }
    
    try {
      // Crear instancia del cliente OpenAI
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Solo para desarrollo, quitar en producción
      });
      
      // Nota: Inicialmente intentamos usar el modelo con búsqueda web (gpt-4o-search-preview),
      // pero algunos parámetros no eran compatibles. Por ahora, usamos gpt-4o que es más
      // estable y también muy potente, aunque no tenga la capacidad de búsqueda web.
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Modelo potente y estable
        messages: [
          {
            role: "system",
            content: "Eres un experto en viajes y turismo con conocimiento detallado de destinos específicos. Tu especialidad es crear itinerarios personalizados con lugares reales y actualizados. Proporcionas enlaces a sitios web oficiales siempre que sea posible y ofreces consejos prácticos que solo los locales conocerían."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 1,
        max_tokens: 10000,
        top_p: 1
      });
      
      return completion.choices[0].message.content || '';
        
    } catch (error: any) {
      console.error('Error al llamar a la API de OpenAI:', error);
      let errorMessage = 'No se pudo generar el itinerario. Por favor, intenta de nuevo más tarde.';
      
      // Extraer mensaje específico de error si está disponible
      if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      // Extraer error más específico de la API si está disponible
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = `Error de OpenAI: ${error.response.data.error.message || error.response.data.error}`;
      }
      
      throw new Error(errorMessage);
    }
    
  } catch (error) {
    console.error('Error en generateItinerary:', error);
    throw new Error('No pudimos generar tu itinerario en este momento. Por favor, verifica tu conexión e intenta de nuevo.');
  }
} 