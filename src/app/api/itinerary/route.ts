import { NextRequest, NextResponse } from 'next/server';

// Interfaz para la solicitud de itinerario
interface ItineraryRequest {
  destination: string;
  days: number;
  preferences: {
    adventures: number; // 1-5
    interests: string[]; // ["gastronomía", "historia", "cultura", "naturaleza", etc.]
    budget: string; // "bajo", "medio", "alto"
    travelStyle: string; // "auténtico", "lujoso", "básico"
    environmentalConsciousness: number; // 1-5
  };
}

/**
 * Genera un itinerario personalizado usando OpenAI
 * @param req - Solicitud NextJS con datos para el itinerario
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar la clave API
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API de OpenAI no configurada' },
        { status: 500 }
      );
    }
    
    // Obtener los datos del cuerpo de la petición
    const data: ItineraryRequest = await req.json();
    
    // Validar datos requeridos
    if (!data.destination || !data.days || !data.preferences) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }
    
    // Construir el prompt para OpenAI
    const prompt = `
    Eres un planificador de viajes experto. Genera un itinerario detallado basado en las siguientes preferencias:
    
    Destino: ${data.destination}
    Duración: ${data.days} días
    Nivel de aventura: ${data.preferences.adventures}/5
    Intereses: ${data.preferences.interests.join(', ')}
    Presupuesto: ${data.preferences.budget}
    Estilo de viaje: ${data.preferences.travelStyle}
    Conciencia ambiental: ${data.preferences.environmentalConsciousness}/5
    
    El itinerario debe incluir:
    1. Un plan día por día con actividades específicas
    2. Recomendaciones de lugares para visitar adaptados a los intereses
    3. Opciones de alojamiento que se ajusten al estilo y presupuesto
    4. Recomendaciones de comidas y restaurantes
    5. Consejos de transporte local
    
    Formato de respuesta: JSON con la siguiente estructura:
    {
      "title": "Título del itinerario",
      "days": [
        {
          "day": 1,
          "title": "Título del día",
          "activities": [
            {
              "time": "Hora aproximada",
              "description": "Descripción de la actividad",
              "location": "Nombre del lugar",
              "type": "Tipo de actividad (comida, visita, transporte, etc.)"
            }
          ]
        }
      ],
      "accommodationSuggestions": [...],
      "transportationTips": [...],
      "sustainabilityTips": [...]
    }
    `;
    
    // Realizar la solicitud a OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // O el modelo más adecuado disponible
        messages: [
          { role: 'system', content: 'Eres un planificador de viajes experto que genera itinerarios detallados en formato JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error de OpenAI:', result);
      return NextResponse.json(
        { error: 'Error al generar el itinerario' },
        { status: 500 }
      );
    }
    
    // Procesar la respuesta
    const itineraryContent = result.choices[0].message.content;
    const itinerary = JSON.parse(itineraryContent);
    
    return NextResponse.json({ itinerary });
    
  } catch (error) {
    console.error('Error al procesar la solicitud de itinerario:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 