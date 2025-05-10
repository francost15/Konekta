'use client';

import { useState } from 'react';
import { User, Map, Heart, Calendar, Edit, ChevronRight, LogOut, Settings, Badge } from 'lucide-react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';

export const ProfileSection = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Nombre de usuario por defecto si no está cargado o no tiene firstName
  const userName = isLoaded && user ? (user.firstName || 'Viajero') : 'Viajero';
  
  // Intereses del usuario (esto se podría obtener de la base de datos)
  const userInterests = ['Gastronomía', 'Cultura', 'Fotografía', 'Naturaleza'];
  
  // Stats de usuario
  const userStats = [
    { icon: Map, label: 'Viajes', value: 3 },
    { icon: Heart, label: 'Favoritos', value: 7 },
    { icon: Calendar, label: 'Reservas', value: 2 },
  ];
  
  const handleSignOut = () => {
    if (signOut) signOut();
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 overflow-hidden">
      {/* Cabecera de perfil con menú desplegable */}
      <div className="relative">
        <div 
          className="absolute top-0 right-0 p-1 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Settings size={16} />
        </div>
        
        {/* Menú desplegable */}
        {isMenuOpen && (
          <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg py-2 z-10 min-w-40 border border-gray-100">
            <Link href="/user-profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <Edit size={14} className="mr-2" />
              Editar perfil
            </Link>
            <button 
              onClick={handleSignOut} 
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              <LogOut size={14} className="mr-2" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
      
      {/* Información del perfil */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm overflow-hidden">
            {user && user.imageUrl ? (
              <img src={user.imageUrl} alt={userName} className="h-full w-full object-cover" />
            ) : (
              <User size={32} className="text-white" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-100 rounded-full p-1 border-2 border-white">
            <Badge size={14} className="text-emerald-600" />
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900">
          {userName} {user?.lastName && user.lastName}
        </h3>
        
        <div className="mt-1 flex items-center justify-center">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            Explorador Nivel 2
          </span>
        </div>
      </div>
      
      {/* Estadísticas de usuario */}
      <div className="grid grid-cols-3 gap-2 mt-5">
        {userStats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
            <stat.icon size={16} className="mx-auto mb-1 text-emerald-500" />
            <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Intereses */}
      <div className="mt-5">
        <h4 className="text-xs font-medium text-gray-500 mb-2">MIS INTERESES</h4>
        <div className="flex flex-wrap gap-1.5">
          {userInterests.map((interest, index) => (
            <span 
              key={index} 
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800"
            >
              {interest}
            </span>
          ))}
          <Link 
            href="/user-profile" 
            className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-dashed border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <Edit size={10} className="inline mr-1" /> Editar
          </Link>
        </div>
      </div>
      
      {/* Enlaces rápidos */}
      <div className="mt-5 space-y-2">
        <Link 
          href="/itinerary" 
          className="flex items-center justify-between w-full text-sm py-2.5 px-3 bg-emerald-50 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-all group font-medium"
        >
          <span>Crear itinerario con IA</span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
        
        <Link 
          href="/user-profile" 
          className="flex items-center justify-between w-full text-sm py-2.5 px-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-all group"
        >
          <span>Ver perfil completo</span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}; 