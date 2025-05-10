'use client';

import { useState, useEffect } from 'react';
import { GuideCard } from './GuideCard';
import Link from 'next/link';
import { ChevronRight, Search, Loader2 } from 'lucide-react';

interface Guide {
  id: string;
  name: string;
  location: string;
  specialty: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  available?: boolean;
}

interface GuidesSectionProps {
  initialGuides?: Guide[];
}

export const GuidesSection = ({ initialGuides }: GuidesSectionProps) => {
  const [guides, setGuides] = useState<Guide[]>(initialGuides || []);
  const [isLoading, setIsLoading] = useState(!initialGuides);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!initialGuides) {
      fetchRecommendedGuides();
    }
  }, [initialGuides]);

  const fetchRecommendedGuides = async () => {
    setIsLoading(true);
    // Simulamos obtener guías recomendados (en una implementación real, esto consumiría la API)
    setTimeout(() => {
      setGuides([
        {
          id: '1',
          name: 'Laura Gómez',
          location: 'Barcelona',
          specialty: 'Gastronomía',
          rating: 4.9,
          reviewCount: 28,
          imageUrl: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=200&auto=format&fit=crop',
          available: true
        },
        {
          id: '2',
          name: 'Carlos Ruiz',
          location: 'Ciudad de México',
          specialty: 'Historia',
          rating: 4.8,
          reviewCount: 32,
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
          available: false
        },
        {
          id: '3',
          name: 'Akira Tanaka',
          location: 'Tokio',
          specialty: 'Cultura',
          rating: 4.7,
          reviewCount: 19,
          imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
          available: true
        },
        {
          id: '4',
          name: 'Sofia Mendez',
          location: 'Lisboa',
          specialty: 'Arte',
          rating: 4.6,
          reviewCount: 15,
          imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
          available: true
        }
      ]);
      setIsLoading(false);
    }, 1200);
  };

  const filteredGuides = guides.filter(guide => 
    guide.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    guide.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Guías locales</h2>
          <p className="text-sm text-gray-500 mt-1">Conecta con expertos locales para vivir experiencias auténticas</p>
        </div>
        <Link 
          href="/guides" 
          className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center transition-colors font-medium"
        >
          Ver todos <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>

      <div className="flex items-center mb-4 bg-gray-50 rounded-lg p-2">
        <Search size={18} className="text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Buscar por nombre, ubicación o especialidad..."
          className="bg-transparent border-none outline-none p-1 pl-2 w-full text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={30} className="text-emerald-500 animate-spin" />
          <span className="ml-2 text-gray-500">Buscando guías locales...</span>
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No se encontraron guías que coincidan con &ldquo;{searchTerm}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuides.map((guide) => (
            <Link key={guide.id} href={`/guides/${guide.id}`}>
              <GuideCard {...guide} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}; 