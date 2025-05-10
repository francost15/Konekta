import { MapPin, Star, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface GuideCardProps {
  name: string;
  location: string;
  specialty: string;
  rating?: number;
  imageUrl?: string;
  available?: boolean;
}

export const GuideCard = ({ 
  name, 
  location, 
  specialty, 
  rating = 4.8, 
  imageUrl,
  available = true
}: GuideCardProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
      <div className="flex items-start p-4">
        <div className="relative mr-3 flex-shrink-0">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white font-medium text-xl">
                {name.charAt(0)}
              </div>
            )}
          </div>
          
          {available && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" title="Disponible ahora"></div>
          )}
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">{name}</h3>
            <div className="flex items-center bg-gray-50 px-1.5 py-0.5 rounded-md">
              <Star size={12} className="text-yellow-500 fill-yellow-500 mr-0.5" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-1.5">
            <MapPin size={12} className="mr-1 text-gray-400" />
            <span>{location}</span>
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              {specialty}
            </span>
            
            <button className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center">
              <MessageCircle size={12} className="mr-1" />
              Contactar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 