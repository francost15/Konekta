'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Globe, MapPin, Share2, Bookmark, Printer, Info, Utensils, Bed, Banknote, Car, Camera, Sun, Umbrella, Moon, Link as LinkIcon, Tag, CheckCircle, Compass, ChevronRight, Shield, Users, ExternalLink, Mail, X } from 'lucide-react';
import Link from 'next/link';
import { generateItinerary } from '@/services/openai';

interface ItineraryParams {
  destination?: string;
  travelType?: string;
  duration?: string;
  budget?: string;
  activities?: string;
  accommodation?: string;
}

// Componente para mostrar un tipo de día específico
const ItineraryDay = ({ title, content, index }: { title: string, content: string, index: number }) => {
  const [isOpen, setIsOpen] = useState(index === 0);
  
  // Procesar el contenido para separar mañana, tarde y noche con patrones más flexibles
  const extractTimeContent = (timeKey: string) => {
    // Patrones posibles para encontrar las secciones
    const patterns = [
      new RegExp(`\\*\\*${timeKey}\\*\\*:\\s*([\\s\\S]*?)(?=\\*\\*(?:Mañana|Tarde|Noche)\\*\\*|$)`, 'i'),
      new RegExp(`\\*\\*${timeKey}\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*(?:Mañana|Tarde|Noche)\\*\\*|$)`, 'i'),
      new RegExp(`\\*\\*${timeKey}:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*(?:Mañana|Tarde|Noche)\\*\\*|$)`, 'i'),
      new RegExp(`${timeKey}:\\s*([\\s\\S]*?)(?=(?:Mañana|Tarde|Noche):|$)`, 'i'),
      // Nuevos patrones para capturar más formatos
      new RegExp(`##\\s*${timeKey}\\s*##\\s*([\\s\\S]*?)(?=##\\s*(?:Mañana|Tarde|Noche)|$)`, 'i'),
      new RegExp(`##\\s*${timeKey}:\\s*([\\s\\S]*?)(?=##\\s*(?:Mañana|Tarde|Noche)|$)`, 'i'),
      new RegExp(`##\\s*${timeKey}\\s*([\\s\\S]*?)(?=##\\s*(?:Mañana|Tarde|Noche)|$)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Si no encontramos el patrón específico, intentar dividir el contenido en partes iguales
    if (!content.includes('**Mañana**') && !content.includes('**Tarde**') && !content.includes('**Noche**') &&
        !content.includes('## Mañana') && !content.includes('## Tarde') && !content.includes('## Noche')) {
      const lines = content.split('\n').filter(line => line.trim() !== '');
      const totalLines = lines.length;
      
      if (totalLines > 0) {
        const partSize = Math.ceil(totalLines / 3);
        
        if (timeKey === 'Mañana' && totalLines > 0) {
          return lines.slice(0, partSize).join('\n');
        } else if (timeKey === 'Tarde' && totalLines > partSize) {
          return lines.slice(partSize, partSize * 2).join('\n');
        } else if (timeKey === 'Noche' && totalLines > partSize * 2) {
          return lines.slice(partSize * 2).join('\n');
        }
      }
    }
    
    return '';
  };
  
  const morning = extractTimeContent('Mañana');
  const afternoon = extractTimeContent('Tarde');
  const evening = extractTimeContent('Noche');
  
  // Si no se pudo extraer ninguna sección, mostrar todo el contenido en una tarjeta
  const hasNoTimeContent = !morning && !afternoon && !evening;
    
  // Función para extraer enlaces del texto
  const extractLinks = (text: string) => {
    if (!text) return [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: {text: string, url: string}[] = [];
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
      links.push({
        text: match[1],
        url: match[2]
      });
    }
    
    return links;
  };
  
  // Función para formatear el texto con enlaces
  const formatTextWithLinks = (text: string) => {
    if (!text) return '';
    
    const links = extractLinks(text);
    let formattedText = text;
    
    links.forEach(link => {
      formattedText = formattedText.replace(
        `[${link.text}](${link.url})`,
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-700 hover:underline">${link.text}</a>`
      );
    });
    
    // Eliminar marcadores Markdown adicionales
    formattedText = formattedText
      .replace(/\*\*/g, '') // Eliminar negrita
      .replace(/\*/g, '')   // Eliminar itálica
      .replace(/##\s*/g, '') // Eliminar títulos nivel 2 con espacio
      .replace(/##/g, '')   // Eliminar títulos nivel 2 sin espacio
      .replace(/\n/g, '<br />'); // Convertir saltos de línea
    
    return formattedText;
  };
    
  return (
    <div className="border-b border-gray-100 pb-8 last:border-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-0.5 rounded-full text-xs font-semibold shadow-sm">
            Día {index + 1}
          </span>
          <span className="text-xl font-bold text-emerald-800">{title.replace(/^## /, '').replace(/##/g, '')}</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-700'} hover:bg-emerald-100`}
          aria-label={isOpen ? 'Cerrar día' : 'Abrir día'}
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      
      {isOpen && (
        <>
          {hasNoTimeContent ? (
            // Si no hay secciones de tiempo, mostrar todo el contenido en una sola tarjeta
            <div className="bg-emerald-50 rounded-xl p-5 shadow-sm border border-emerald-100">
              <div className="text-gray-800 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: formatTextWithLinks(content) }} />
            </div>
          ) : (
            // Mostrar las secciones de tiempo si existen
            <div className="grid md:grid-cols-3 gap-6">
              {morning && (
                <div className="bg-emerald-50 rounded-xl p-5 flex flex-col gap-2 shadow-sm border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white p-2 rounded-full shadow-sm"><Sun size={18} className="text-emerald-500" /></span>
                    <span className="text-emerald-700 font-semibold text-base">Mañana</span>
                  </div>
                  <div className="text-gray-800 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: formatTextWithLinks(morning) }} />
                </div>
              )}
              {afternoon && (
                <div className="bg-orange-50 rounded-xl p-5 flex flex-col gap-2 shadow-sm border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white p-2 rounded-full shadow-sm"><Sun size={18} className="text-orange-400" /></span>
                    <span className="text-orange-500 font-semibold text-base">Tarde</span>
                  </div>
                  <div className="text-gray-800 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: formatTextWithLinks(afternoon) }} />
                </div>
              )}
              {evening && (
                <div className="bg-indigo-50 rounded-xl p-5 flex flex-col gap-2 shadow-sm border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white p-2 rounded-full shadow-sm"><Moon size={18} className="text-indigo-500" /></span>
                    <span className="text-indigo-500 font-semibold text-base">Noche</span>
                  </div>
                  <div className="text-gray-800 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: formatTextWithLinks(evening) }} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Componente para mostrar una recomendación con enlaces
const Recommendation = ({ title, description, link }: { title: string, description: string, link?: string }) => {
  return (
    <div className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all bg-white mb-3">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-black">{title}</h4>
        {link && (
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 flex items-center text-sm"
          >
            <LinkIcon size={14} className="mr-1" /> Sitio web
          </a>
        )}
      </div>
      <p className="text-gray-700 mt-1">{description}</p>
    </div>
  );
};

export default function ItineraryPage() {
  const searchParams = useSearchParams();
  const [itineraryContent, setItineraryContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [destination, setDestination] = useState('');
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [showRawContent, setShowRawContent] = useState(false);
  
  // Para mostrar el itinerario formateado
  const [days, setDays] = useState<{title: string, content: string}[]>([]);
  const [accommodation, setAccommodation] = useState('');
  const [practicalInfo, setPracticalInfo] = useState('');
  const [budget, setBudget] = useState('');
  const [gastronomy, setGastronomy] = useState('');
  const [links, setLinks] = useState<{title: string, url: string}[]>([]);
  const [sources, setSources] = useState<{title: string, url: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setIsLoading(true);
        // Obtener parámetros de la URL
        const params: ItineraryParams = {
          destination: searchParams.get('destination') || undefined,
          travelType: searchParams.get('travelType') || undefined,
          duration: searchParams.get('duration') || undefined,
          budget: searchParams.get('budget') || undefined,
          activities: searchParams.get('activities') || undefined,
          accommodation: searchParams.get('accommodation') || undefined
        };
        
        if (!params.destination) {
          throw new Error('No se especificó un destino');
        }
        
        setDestination(params.destination);
        setPreferences({
          travelType: params.travelType || '',
          duration: params.duration || '',
          budget: params.budget || '',
          activities: params.activities || '',
          accommodation: params.accommodation || ''
        });
        
        // Intentar recuperar del localStorage primero
        const storageKey = `itinerary-${params.destination}`;
        const savedItinerary = localStorage.getItem(storageKey);
        
        if (savedItinerary) {
          try {
            const parsedData = JSON.parse(savedItinerary);
            console.log("Itinerario recuperado de localStorage:", parsedData);
            
            // Limpiamos y preparamos el contenido para su visualización
            const cleanedContent = cleanupContent(parsedData.content);
            setItineraryContent(cleanedContent);
            
            // Procesamos el contenido para extraer las secciones
            processItineraryContent(cleanedContent);
            setIsLoading(false);
            return; // Si tenemos datos en localStorage, no seguimos con la petición a OpenAI
          } catch (e) {
            console.warn('Error al parsear itinerario guardado:', e);
            // Continuamos con la generación si hay error al recuperar
          }
        }
        
        // Generar el itinerario utilizando nuestro servicio de OpenAI
        const content = await generateItinerary({
          destination: params.destination,
          preferences: {
            travelType: params.travelType,
            duration: params.duration,
            budget: params.budget,
            activities: params.activities,
            accommodation: params.accommodation
          }
        });
        
        if (!content || content.trim() === '') {
          throw new Error('No se pudo generar contenido para el itinerario');
        }
        
        // Limpiamos y preparamos el contenido para su visualización
        const cleanedContent = cleanupContent(content);
        
        // Guardar en localStorage para futuras visitas
        localStorage.setItem(storageKey, JSON.stringify({
          content: cleanedContent,
          timestamp: new Date().toISOString(),
          params
        }));
        
        setItineraryContent(cleanedContent);
        
        // Procesar el contenido para mostrar formateado
        processItineraryContent(cleanedContent);
      } catch (error) {
        console.error('Error al cargar el itinerario:', error);
        setItineraryContent('');
        setDays([]);
        setAccommodation('');
        setPracticalInfo('');
        setBudget('');
        setGastronomy('');
        setLinks([]);
        setSources([]);
        // Establecer el mensaje de error en el estado en lugar de mostrar una alerta
        setError(error instanceof Error ? error.message : 'Error desconocido al generar el itinerario');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItinerary();
  }, [searchParams]);
  
  // Función para limpiar y preparar el contenido del itinerario
  const cleanupContent = (content: string) => {
    // Asegurar que hay saltos de línea después de cada encabezado
    let cleanedContent = content
      .replace(/## ([^\n]+)(?!\n)/g, '## $1\n') // Agregar salto después de ## si no existe
      .replace(/\n{3,}/g, '\n\n') // Normalizar múltiples saltos de línea
      .trim();
    
    // Normalizar marcadores de tiempo (mañana, tarde, noche)
    const timeMarkers = ['Mañana', 'Tarde', 'Noche'];
    timeMarkers.forEach(marker => {
      // Normalizar **Mañana** o **Mañana:** a **Mañana**:
      cleanedContent = cleanedContent
        .replace(new RegExp(`\\*\\*${marker}\\*\\*(?!:)`, 'g'), `**${marker}**:`)
        .replace(new RegExp(`\\*\\*${marker}:\\*\\*`, 'g'), `**${marker}**:`);
    });
    
    return cleanedContent;
  };
  
  // Función para procesar el contenido del itinerario y separarlo en secciones
  const processItineraryContent = (content: string) => {
    // Extraer los días del itinerario
    // Intentar varios patrones para encontrar los días
    const dayPatterns = [
      /## Día (\d+):.*?\n([\s\S]*?)(?=## |$)/g,
      /## Día (\d+).*?\n([\s\S]*?)(?=## |$)/g,
      /##Día (\d+):.*?\n([\s\S]*?)(?=## |$)/g,
      /##Día (\d+).*?\n([\s\S]*?)(?=## |$)/g,
      /## (?:Día|Day|Dia) ?(\d+).*?\n([\s\S]*?)(?=## (?:Día|Day|Dia)|$)/gi
    ];
    
    let daysArray: {title: string, content: string}[] = [];
    
    // Intentar cada patrón hasta encontrar días
    for (const pattern of dayPatterns) {
      let dayMatch;
      const tempDaysArray: {title: string, content: string}[] = [];
      const tempContent = content.slice(); // Crear una copia para cada intento
      
      while ((dayMatch = pattern.exec(tempContent)) !== null) {
        const dayNumber = dayMatch[1];
        const dayContent = dayMatch[2]?.trim() || dayMatch[0]?.trim();
        
        const fullTitle = dayMatch[0].split('\n')[0].trim();
        tempDaysArray.push({
          title: fullTitle,
          content: dayContent
        });
      }
      
      if (tempDaysArray.length > 0) {
        daysArray = tempDaysArray;
        break;
      }
    }
    
    // Si aún no se encontró ningún día, intentar una división simple por ## 
    if (daysArray.length === 0) {
      const sections = content.split(/(?=## )/g);
      
      sections.forEach((section, index) => {
        if (section.trim() && section.toLowerCase().includes('día') || section.toLowerCase().includes('day')) {
          const lines = section.split('\n');
          const title = lines[0].trim();
          const sectionContent = lines.slice(1).join('\n').trim();
          
          daysArray.push({
            title: title,
            content: sectionContent
          });
        }
      });
    }
    
    // Si aún así no hay días, dividir el contenido en secciones iguales
    if (daysArray.length === 0) {
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
      const numberOfDays = Math.min(3, paragraphs.length); // Asumir máximo 3 días o el número de párrafos disponibles
      
      for (let i = 0; i < numberOfDays; i++) {
        const startIdx = Math.floor(i * paragraphs.length / numberOfDays);
        const endIdx = Math.floor((i + 1) * paragraphs.length / numberOfDays);
        const dayContent = paragraphs.slice(startIdx, endIdx).join('\n\n');
        
        daysArray.push({
          title: `Día ${i + 1}`,
          content: dayContent
        });
      }
    }
    
    console.log("Días procesados:", daysArray);
    setDays(daysArray);
    
    // Extraer otras secciones de interés con patrones más flexibles
    const extractSection = (sectionName: string) => {
      const patterns = [
        new RegExp(`## ${sectionName}\\n([\\s\\S]*?)(?=## |$)`, 'i'),
        new RegExp(`##${sectionName}\\n([\\s\\S]*?)(?=## |$)`, 'i'),
        new RegExp(`## ${sectionName}:?\\n([\\s\\S]*?)(?=## |$)`, 'i'),
        new RegExp(`${sectionName}:\\s*([\\s\\S]*?)(?=## |$)`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) return match[1].trim();
      }
      
      return '';
    };
    
    const accommodationMatch = extractSection('Recomendaciones de alojamiento');
    if (accommodationMatch) {
      setAccommodation(accommodationMatch);
    }
    
    const practicalMatch = extractSection('Consejos prácticos');
    if (practicalMatch) {
      setPracticalInfo(practicalMatch);
    }
    
    const budgetMatch = extractSection('Presupuesto estimado');
    if (budgetMatch) {
      setBudget(budgetMatch);
    }
    
    // Intentar encontrar sugerencias gastronómicas si existen
    const gastronomyMatch = extractSection('Sugerencias gastronómicas');
    if (gastronomyMatch) {
      setGastronomy(gastronomyMatch);
    }
    
    // Extraer enlaces si existen
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    const linksArray: {title: string, url: string}[] = [];
    
    while ((linkMatch = linkRegex.exec(content)) !== null) {
      linksArray.push({
        title: linkMatch[1],
        url: linkMatch[2]
      });
    }
    
    if (linksArray.length > 0) {
      setLinks(linksArray);
    }
    
    // Extraer fuentes consultadas si existen
    const sourcesMatch = extractSection('Fuentes consultadas');
    if (sourcesMatch) {
      const sourcesContent = sourcesMatch;
      const sourcesArray: {title: string, url: string}[] = [];
      const sourceRegex = /- \[([^\]]+)\]\(([^)]+)\)/g;
      let sourceMatch;
      
      while ((sourceMatch = sourceRegex.exec(sourcesContent)) !== null) {
        sourcesArray.push({
          title: sourceMatch[1],
          url: sourceMatch[2]
        });
      }
      
      if (sourcesArray.length > 0) {
        setSources(sourcesArray);
      }
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Itinerario de viaje a ${destination}`,
        text: `Mira este increíble itinerario para tu viaje a ${destination}`,
        url: window.location.href
      }).catch(err => {
        console.error('Error al compartir:', err);
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      alert('Comparte este enlace: ' + window.location.href);
    }
  };
  
  // Función para obtener un ícono según el tipo de viaje
  const getTravelTypeIcon = () => {
    const type = preferences.travelType;
    
    if (type?.includes('cultural')) return <Camera size={18} className="mr-2" />;
    if (type?.includes('adventure')) return <Umbrella size={18} className="mr-2" />;
    if (type?.includes('relax')) return <Sun size={18} className="mr-2" />;
    
    return <Globe size={18} className="mr-2" />;
  };
  
  const retryItineraryGeneration = () => {
    setError(null);
    setIsLoading(true);
    
    const fetchItinerary = async () => {
      try {
        // Obtener parámetros de la URL
        const params: ItineraryParams = {
          destination: searchParams.get('destination') || undefined,
          travelType: searchParams.get('travelType') || undefined,
          duration: searchParams.get('duration') || undefined,
          budget: searchParams.get('budget') || undefined,
          activities: searchParams.get('activities') || undefined,
          accommodation: searchParams.get('accommodation') || undefined
        };
        
        if (!params.destination) {
          throw new Error('No se especificó un destino');
        }
        
        // Limpiar el localStorage para forzar una nueva generación
        const storageKey = `itinerary-${params.destination}`;
        localStorage.removeItem(storageKey);
        
        // Generar el itinerario utilizando nuestro servicio de OpenAI
        const content = await generateItinerary({
          destination: params.destination,
          preferences: {
            travelType: params.travelType,
            duration: params.duration,
            budget: params.budget,
            activities: params.activities,
            accommodation: params.accommodation
          }
        });
        
        if (!content || content.trim() === '') {
          throw new Error('No se pudo generar contenido para el itinerario');
        }
        
        // Guardar el nuevo contenido en localStorage
        localStorage.setItem(storageKey, JSON.stringify({
          content,
          timestamp: new Date().toISOString(),
          params
        }));
        
        setItineraryContent(content);
        
        // Procesar el contenido para mostrar formateado
        processItineraryContent(content);
      } catch (error) {
        console.error('Error al reintentar la generación del itinerario:', error);
        setItineraryContent('');
        setDays([]);
        setAccommodation('');
        setPracticalInfo('');
        setBudget('');
        setGastronomy('');
        setLinks([]);
        setSources([]);
        setError(error instanceof Error ? error.message : 'Error desconocido al generar el itinerario');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItinerary();
  };
  
  // Añadir función para enviar el itinerario por correo
  const handleSendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email.trim() || !destination) {
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
      const itineraryElement = document.getElementById('itinerary-content');
      if (!itineraryElement) {
        throw new Error('No se pudo encontrar el contenido del itinerario');
      }
      
      // Crear una versión simplificada del HTML para el correo
      let itineraryHtml = '';
      
      // Añadir días
      days.forEach((day, index) => {
        itineraryHtml += `<div class="day-title">Día ${index + 1}: ${day.title.replace(/^## /, '').replace(/##/g, '')}</div>`;
        
        // Extrae mañana, tarde y noche para un mejor formato
        const extractTimeContent = (timeKey: string, className: string) => {
          const patterns = [
            new RegExp(`\\*\\*${timeKey}\\*\\*:\\s*([\\s\\S]*?)(?=\\*\\*(?:Mañana|Tarde|Noche)\\*\\*|$)`, 'i'),
            new RegExp(`\\*\\*${timeKey}\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*(?:Mañana|Tarde|Noche)\\*\\*|$)`, 'i'),
            new RegExp(`\\*\\*${timeKey}:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*(?:Mañana|Tarde|Noche)\\*\\*|$)`, 'i'),
            new RegExp(`${timeKey}:\\s*([\\s\\S]*?)(?=(?:Mañana|Tarde|Noche):|$)`, 'i'),
            new RegExp(`##\\s*${timeKey}\\s*##\\s*([\\s\\S]*?)(?=##\\s*(?:Mañana|Tarde|Noche)|$)`, 'i'),
            new RegExp(`##\\s*${timeKey}:\\s*([\\s\\S]*?)(?=##\\s*(?:Mañana|Tarde|Noche)|$)`, 'i')
          ];
          
          for (const pattern of patterns) {
            const match = day.content.match(pattern);
            if (match && match[1]) {
              const content = match[1].trim()
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/##/g, '')
                .replace(/\n/g, '<br>')
                .replace(/- /g, '• ');
              
              return `<div class="${className}">
                <strong>${timeKey}</strong><br>
                ${content}
              </div>`;
            }
          }
          
          return '';
        };
        
        itineraryHtml += extractTimeContent('Mañana', 'morning');
        itineraryHtml += extractTimeContent('Tarde', 'afternoon');
        itineraryHtml += extractTimeContent('Noche', 'evening');
      });
      
      // Añadir recomendaciones de alojamiento si existen
      if (accommodation) {
        itineraryHtml += `<div class="day-title">Recomendaciones de alojamiento</div>`;
        itineraryHtml += `<p>${accommodation.replace(/\n/g, '<br>')}</p>`;
      }
      
      // Añadir consejos prácticos si existen
      if (practicalInfo) {
        itineraryHtml += `<div class="day-title">Consejos prácticos</div>`;
        itineraryHtml += `<p>${practicalInfo.replace(/\n/g, '<br>')}</p>`;
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
          destination,
          itineraryHtml,
          subject: `Tu itinerario personalizado para ${destination}` 
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
                Recibirás un correo con tu itinerario personalizado para {destination}. Podrás acceder a él en cualquier momento.
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
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Encabezado */}
      <header className="bg-gradient-to-r from-emerald-600 to-emerald-800 py-10 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Link href="/home" className="inline-flex items-center text-white/90 mb-6 hover:text-white transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Volver al dashboard
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Tu itinerario para {destination}
          </h1>
          
          <p className="text-emerald-50 opacity-90 text-lg mb-4">Descubre lugares especiales y experiencias únicas</p>
          
          {/* Mostrar las preferencias seleccionadas como etiquetas */}
          <div className="flex flex-wrap gap-2 mt-5">
            {preferences.travelType && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm text-white flex items-center">
                {getTravelTypeIcon()}
                {preferences.travelType.charAt(0).toUpperCase() + preferences.travelType.slice(1)}
              </div>
            )}
            
            {preferences.duration && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm text-white flex items-center">
                <Calendar size={18} className="mr-2" />
                {preferences.duration.charAt(0).toUpperCase() + preferences.duration.slice(1)}
              </div>
            )}
            
            {preferences.budget && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm text-white flex items-center">
                <Banknote size={18} className="mr-2" />
                {preferences.budget.charAt(0).toUpperCase() + preferences.budget.slice(1)}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-500 border-opacity-50 border-t-transparent mb-6"></div>
            <p className="text-gray-900 font-medium text-lg">Generando tu itinerario personalizado...</p>
            <p className="text-gray-600 mt-2">Buscando lugares reales y actualizados en {destination}</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6 text-red-500 flex justify-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12" y2="16" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No pudimos generar tu itinerario</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-center">
              <button 
                onClick={retryItineraryGeneration}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                Intentar de nuevo
              </button>
              <Link href="/home" className="border border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors inline-flex items-center">
                <ArrowLeft size={18} className="mr-2" />
                Volver al inicio
              </Link>
            </div>
          </div>
        ) : days.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6 text-amber-500 flex justify-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12" y2="16" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay suficiente información</h2>
            <p className="text-gray-600 mb-6">Lo sentimos, no pudimos crear un itinerario detallado para {destination}. Por favor intenta con otro destino o proporciona más detalles.</p>
            <div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-center">
              <Link href="/home" className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center">
                <ArrowLeft size={18} className="mr-2" />
                Volver al inicio
              </Link>
              {itineraryContent && (
                <button 
                  onClick={() => setShowRawContent(!showRawContent)}
                  className="border border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                >
                  {showRawContent ? 'Ocultar contenido raw' : 'Ver contenido raw'}
                </button>
              )}
            </div>
            
            {showRawContent && itineraryContent && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-left">
                <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
                  {itineraryContent}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Vista de itinerario formateado */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
              {/* Barra de acciones */}
              <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center text-gray-900">
                  <Compass size={20} className="text-emerald-600 mr-2" />
                  <span className="font-medium">Itinerario personalizado con lugares reales</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleShare}
                    className="text-gray-700 hover:text-emerald-600 p-2 rounded-full hover:bg-emerald-50 transition-colors"
                    title="Compartir"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="text-gray-700 hover:text-emerald-600 p-2 rounded-full hover:bg-emerald-50 transition-colors"
                    title="Imprimir"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    className="text-gray-700 hover:text-emerald-600 p-2 rounded-full hover:bg-emerald-50 transition-colors"
                    title="Guardar"
                  >
                    <Bookmark size={18} />
                  </button>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="text-gray-700 hover:text-emerald-600 p-2 rounded-full hover:bg-emerald-50 transition-colors"
                    title="Enviar por correo"
                  >
                    <Mail size={18} />
                  </button>
                  <button
                    onClick={() => setShowRawContent(!showRawContent)}
                    className="text-gray-700 hover:text-emerald-600 p-2 rounded-full hover:bg-emerald-50 transition-colors"
                    title={showRawContent ? "Ocultar contenido original" : "Ver contenido original"}
                  >
                    <Info size={18} />
                  </button>
                </div>
              </div>
              
              {/* Mostrar contenido original en formato markdown si está habilitado */}
              {showRawContent && (
                <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Contenido original del itinerario:</h3>
                  <pre className="whitespace-pre-wrap text-xs bg-white p-4 rounded border border-gray-200 overflow-auto max-h-96">
                    {itineraryContent}
                  </pre>
                </div>
              )}
              
              {/* Mostrar itinerario formateado por secciones */}
              <div className="p-8" id="itinerary-content">
                {/* Introducción o resumen si existe */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Descubre {destination}</h2>
                  <p className="text-gray-800 leading-relaxed">Hemos creado un itinerario detallado basado en tus preferencias, con lugares reales y recomendaciones específicas para hacer de tu viaje una experiencia inolvidable.</p>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Enlaces útiles */}
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                      <h4 className="text-emerald-800 font-medium mb-3 flex items-center">
                        <LinkIcon size={16} className="mr-2" /> 
                        Enlaces útiles
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {links.length > 0 ? (
                          links.slice(0, 6).map((link, idx) => (
                            <a 
                              key={`link-${idx}-${link.url.substring(0, 10)}`}
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center text-sm bg-white px-3 py-2 rounded border border-emerald-100"
                            >
                              <LinkIcon size={14} className="mr-2 flex-shrink-0" />
                              <span className="truncate">{link.title}</span>
                            </a>
                          ))
                        ) : (
                          <>
                            <a 
                              href={`https://www.google.com/maps/search/${encodeURIComponent(destination)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center text-sm bg-white px-3 py-2 rounded border border-emerald-100"
                            >
                              <LinkIcon size={14} className="mr-2 flex-shrink-0" />
                              <span className="truncate">Google Maps: {destination}</span>
                            </a>
                            <a 
                              href={`https://www.tripadvisor.com/Search?q=${encodeURIComponent(destination)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center text-sm bg-white px-3 py-2 rounded border border-emerald-100"
                            >
                              <LinkIcon size={14} className="mr-2 flex-shrink-0" />
                              <span className="truncate">TripAdvisor: {destination}</span>
                            </a>
                            <a 
                              href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center text-sm bg-white px-3 py-2 rounded border border-emerald-100"
                            >
                              <LinkIcon size={14} className="mr-2 flex-shrink-0" />
                              <span className="truncate">Booking: Alojamiento en {destination}</span>
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Información rápida */}
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                      <h4 className="text-emerald-800 font-medium mb-3 flex items-center">
                        <Info size={16} className="mr-2" />
                        Información rápida
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="bg-white p-2 rounded-full mr-3">
                            <Calendar size={14} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Mejor época para visitar</p>
                            <p className="text-sm text-gray-600">Primavera (marzo a mayo) y otoño (septiembre a noviembre)</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-white p-2 rounded-full mr-3">
                            <Banknote size={14} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Moneda local</p>
                            <p className="text-sm text-gray-600">Peso Mexicano (MXN)</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-white p-2 rounded-full mr-3">
                            <Globe size={14} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Idioma</p>
                            <p className="text-sm text-gray-600">Español (principal)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Días del itinerario */}
                <div className="mb-12 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-emerald-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Calendar size={20} className="mr-2" />
                      Plan día a día
                    </h3>
                  </div>
                  <div className="p-6 divide-y divide-gray-100">
                    {days.map((day, index) => (
                      <ItineraryDay 
                        key={index} 
                        title={day.title} 
                        content={day.content} 
                        index={index}
                      />
                    ))}
                  </div>
                </div>

                {/* Alojamiento */}
                {accommodation && (
                  <div className="mb-12 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Bed size={20} className="mr-2" />
                        Dónde alojarse
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-emerald max-w-none">
                        {accommodation.split('\n').map((line, index) => {
                          if (line.startsWith('- ')) {
                            return (
                              <div key={`accom-line-${index}`} className="flex items-start mb-3">
                                <div className="bg-emerald-50 p-1 rounded-full mr-3 mt-1">
                                  <CheckCircle size={14} className="text-emerald-600" />
                                </div>
                                <p className="text-gray-700">{line.replace('- ', '')}</p>
                              </div>
                            );
                          }
                          return <p key={`accom-text-${index}`} className="text-gray-700 mb-3">{line}</p>;
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Gastronomía si existe */}
                {gastronomy && (
                  <div className="mb-12 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                    <div className="bg-emerald-600 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Utensils size={20} className="mr-2" />
                        Experiencias gastronómicas
                      </h3>
                    </div>
                    <div className="p-6 text-gray-900">
                      <div className="whitespace-pre-line">{gastronomy}</div>
                    </div>
                  </div>
                )}

                {/* Presupuesto */}
                {budget && (
                  <div className="mb-12 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Banknote size={20} className="mr-2" />
                        Presupuesto estimado
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {budget.split('\n').map((line, index) => {
                          if (line.startsWith('- ')) {
                            const [category, amount] = line.replace('- ', '').split(':');
                            return (
                              <div key={`budget-line-${index}`} className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 mb-1">{category}</p>
                                <p className="text-emerald-600 font-semibold">{amount}</p>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Consejos prácticos */}
                {practicalInfo && (
                  <div className="mb-8 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Info size={20} className="mr-2" />
                        Consejos prácticos
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {practicalInfo.split('\n').map((line, index) => {
                          if (line.startsWith('- ')) {
                            const [category, info] = line.replace('- ', '').split(':');
                            return (
                              <div key={`practical-line-${index}`} className="flex items-start">
                                <div className="bg-emerald-50 p-2 rounded-full mr-3">
                                  {category.toLowerCase().includes('transporte') && <Car size={16} className="text-emerald-600" />}
                                  {category.toLowerCase().includes('seguridad') && <Shield size={16} className="text-emerald-600" />}
                                  {category.toLowerCase().includes('costumbres') && <Users size={16} className="text-emerald-600" />}
                                  {!category.toLowerCase().includes('transporte') && 
                                   !category.toLowerCase().includes('seguridad') && 
                                   !category.toLowerCase().includes('costumbres') && 
                                   <Info size={16} className="text-emerald-600" />}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 mb-1">{category}</p>
                                  <p className="text-sm text-gray-600">{info}</p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fuentes consultadas */}
                {sources.length > 0 && (
                  <div className="mb-8 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <LinkIcon size={20} className="mr-2" />
                        Fuentes consultadas
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sources.map((source, index) => (
                          <a 
                            key={`source-${index}-${source.url.substring(0, 10)}`}
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center p-3 bg-white rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
                          >
                            <div className="bg-emerald-50 p-2 rounded-full mr-3">
                              <Globe size={16} className="text-emerald-600" />
                            </div>
                            <span className="text-gray-800 line-clamp-1">{source.title}</span>
                            <ExternalLink size={14} className="ml-auto text-emerald-500" />
                          </a>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-4">Fuentes consultadas automáticamente para generar este itinerario con información actualizada.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contenido del itinerario en formato Markdown (oculto por defecto) */}
            <div className="hidden">
              <div className="prose prose-emerald max-w-none">
                <div className="whitespace-pre-line">
                  {itineraryContent}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Sugerencias adicionales */}
        {!isLoading && (
          <div className="mt-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-8 border border-emerald-200 shadow-sm">
            <h2 className="text-xl font-bold text-emerald-900 mb-2">¿Quieres mejorar tu experiencia?</h2>
            <p className="text-emerald-800 mb-6">Personaliza aún más tu viaje a {destination} con estas opciones exclusivas:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all border border-emerald-100">
                <div className="flex items-center text-emerald-700 mb-3">
                  <div className="bg-emerald-50 p-2 rounded-full mr-3">
                    <MapPin size={18} />
                  </div>
                  <h3 className="font-medium">Guías locales verificados</h3>
                </div>
                <p className="text-gray-700 mb-4">Conecta con guías locales de {destination} que te mostrarán lugares secretos y experiencias auténticas.</p>
                <button className="text-emerald-700 font-medium hover:text-emerald-800 flex items-center text-sm">
                  Explorar guías <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all border border-emerald-100">
                <div className="flex items-center text-emerald-700 mb-3">
                  <div className="bg-emerald-50 p-2 rounded-full mr-3">
                    <Calendar size={18} />
                  </div>
                  <h3 className="font-medium">Reservas premium</h3>
                </div>
                <p className="text-gray-700 mb-4">Accede a reservas exclusivas con descuentos especiales en hoteles y actividades en {destination}.</p>
                <button className="text-emerald-700 font-medium hover:text-emerald-800 flex items-center text-sm">
                  Ver reservas <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all border border-emerald-100">
                <div className="flex items-center text-emerald-700 mb-3">
                  <div className="bg-emerald-50 p-2 rounded-full mr-3">
                    <CheckCircle size={18} />
                  </div>
                  <h3 className="font-medium">Konekta Premium</h3>
                </div>
                <p className="text-gray-700 mb-4">Desbloquea itinerarios personalizados ilimitados, asistencia 24/7 y beneficios exclusivos.</p>
                <button className="text-emerald-700 font-medium hover:text-emerald-800 flex items-center text-sm">
                  Activar Premium <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Añadir modal de email */}
      {renderEmailModal()}
    </div>
  );
} 