import { SideSection } from './SideSection';
import { Map } from 'lucide-react';

export const MapSection = () => {
  return (
    <SideSection title="Explora el mapa">
      <div className="rounded-lg bg-gray-100 h-40 flex items-center justify-center">
        <div className="text-center">
          <Map size={24} className="text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            Descubre lugares cerca de ti
          </p>
          <button className="mt-2 bg-emerald-500 text-white text-xs py-1 px-3 rounded-full hover:bg-emerald-600 transition-colors">
            Abrir mapa
          </button>
        </div>
      </div>
    </SideSection>
  );
}; 