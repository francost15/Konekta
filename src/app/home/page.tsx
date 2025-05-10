'use client';

import { useEffect, useState, useRef } from 'react';
import { SearchHeader } from '@/components/Dashboard/SearchHeader';

import { GuidesSection } from '@/components/Dashboard/GuidesSection';
import { ProfileSection } from '@/components/Dashboard/ProfileSection';
import { BookingsSection } from '@/components/Dashboard/BookingsSection';
import { useUser } from '@clerk/nextjs';
import { MapSection } from '@/components/Dashboard/MapSection';
import { RoutesSection } from '@/components/Dashboard/RoutesSection';

// Definir la interfaz para la referencia
interface RoutesSectionHandle {
  openItineraryModal: () => void;
}

export default function Dashboard() {
  const [userName, setUserName] = useState('viajero');
  const { isLoaded, user } = useUser();
  
  // Referencias para el modal de itinerarios con tipo específico
  const routesSectionRef = useRef<RoutesSectionHandle>(null);
  
  useEffect(() => {
    // Actualizar el nombre del usuario cuando Clerk haya cargado los datos
    if (isLoaded && user) {
      setUserName(user.firstName || 'viajero');
    }
  }, [isLoaded, user]);

  // Función para abrir el modal de itinerarios desde el encabezado de búsqueda
  const handleOpenItineraryModal = () => {
    if (routesSectionRef.current && typeof routesSectionRef.current.openItineraryModal === 'function') {
      routesSectionRef.current.openItineraryModal();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <SearchHeader 
        userName={userName} 
        onOpenItineraryModal={handleOpenItineraryModal}
      />
      
      {/* Contenido principal */}
      <main className="px-4 mt-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-8 space-y-6">
            <RoutesSection 
              ref={routesSectionRef}
            />
            <GuidesSection />
          </div>
          
          {/* Columna lateral */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileSection />
            <BookingsSection bookings={[
              {title: "Tour gastronómico", location: "Barcelona", date: "15 Oct"}
            ]} />
            <MapSection />
          </div>
        </div>
      </main>
    </div>
  );
}