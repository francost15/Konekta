# Integración de APIs en Konekta

Este documento proporciona instrucciones para configurar y utilizar las APIs integradas en la plataforma Konekta.

## APIs Implementadas

### 1. Google Places API

La API de Google Places permite acceder a información detallada sobre lugares en todo el mundo, incluyendo:
- Búsqueda de lugares por texto o categorías
- Detalles completos de lugares (dirección, horarios, fotos, opiniones, etc.)
- Búsqueda de lugares a lo largo de una ruta

### 2. OpenAI API

La API de OpenAI se utiliza para generar itinerarios personalizados basados en las preferencias de los usuarios mediante modelos de lenguaje avanzados.

## Configuración de las APIs

### Requisitos Previos

1. Cuenta en Google Cloud Platform con acceso a la API de Places
2. Cuenta en OpenAI con acceso a la API

### Pasos para Configurar

#### Google Places API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Activa la API de Places:
   - En el panel lateral, navega a "APIs y servicios" > "Biblioteca"
   - Busca "Places API" y actívala
4. Crea una clave de API:
   - En "APIs y servicios" > "Credenciales", haz clic en "Crear credenciales" > "Clave de API"
   - Restringe la clave para mayor seguridad (opcional pero recomendado)
   - Copia la clave generada

#### OpenAI API

1. Ve al [Dashboard de OpenAI](https://platform.openai.com/dashboard)
2. Crea una cuenta o inicia sesión
3. Navega a "API Keys" y crea una nueva clave
4. Copia la clave generada

### Configuración de Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```
# API Keys de servicios externos

# Google Places API
GOOGLE_PLACES_API_KEY=tu_clave_de_google_places

# OpenAI API
OPENAI_API_KEY=tu_clave_de_openai
```

2. Reemplaza `tu_clave_de_google_places` y `tu_clave_de_openai` con tus claves reales

## Endpoints Disponibles

### Google Places API

#### 1. Búsqueda de Lugares

- **Endpoint**: `/api/places`
- **Método**: GET
- **Parámetros**:
  - `query`: Texto para buscar lugares (opcional)
  - `lat`: Latitud (opcional, requerido si no se proporciona query)
  - `lng`: Longitud (opcional, requerido si no se proporciona query)
  - `radius`: Radio de búsqueda en metros (predeterminado: 5000)
  - `type`: Tipo de lugar según categorías de Google (opcional)

#### 2. Detalles de un Lugar

- **Endpoint**: `/api/places/details`
- **Método**: GET
- **Parámetros**:
  - `placeId`: ID único del lugar proporcionado por Google

### API de Itinerarios (OpenAI)

- **Endpoint**: `/api/itinerary`
- **Método**: POST
- **Cuerpo de la Solicitud**:
  ```json
  {
    "destination": "Nombre del destino",
    "days": 5,
    "preferences": {
      "adventures": 3,
      "interests": ["gastronomía", "historia", "cultura"],
      "budget": "medio",
      "travelStyle": "auténtico y local",
      "environmentalConsciousness": 4
    }
  }
  ```

## Consideraciones de Seguridad

- Nunca expongas tus claves API al frontend
- Configura restricciones apropiadas para tus claves API
- Considera implementar un sistema de caché para reducir el número de solicitudes a las APIs
- Monitorea el uso de las APIs para evitar costos inesperados

## Ejemplos de Uso

### Ejemplo: Buscar Restaurantes en una Ubicación

```javascript
// Frontend
const fetchNearbyRestaurants = async (lat, lng) => {
  const response = await fetch(`/api/places?lat=${lat}&lng=${lng}&type=restaurant`);
  const data = await response.json();
  return data.places;
};
```

### Ejemplo: Generar un Itinerario

```javascript
// Frontend
const generateItinerary = async (formData) => {
  const response = await fetch('/api/itinerary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  const data = await response.json();
  return data.itinerary;
};
```

## Recursos Adicionales

- [Documentación de Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Documentación de OpenAI API](https://platform.openai.com/docs/api-reference)
- [Repositorio de Konekta](https://github.com/tu-usuario/konekta) 