import { SideSection } from './SideSection';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BookingsSectionProps {
  bookings: Array<{
    title: string;
    location: string;
    date: string;
  }>;
}

export const BookingsSection = ({ bookings }: BookingsSectionProps) => {
  return (
    <SideSection title="Próximas reservas">
      <div className="space-y-3">
        {bookings.length > 0 ? (
          <>
            {bookings.map((booking, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-sm text-gray-800 mb-1">{booking.title}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    <span>{booking.date}</span>
                  </div>
                </div>
              </div>
            ))}
            <Link 
              href="/bookings" 
              className="flex items-center justify-between w-full text-xs py-2 px-3 mt-1 bg-white border border-gray-200 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
            >
              <span className="text-gray-600 group-hover:text-emerald-600">Ver todas las reservas</span>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </Link>
          </>
        ) : (
          <p className="text-sm text-gray-500">No tienes reservas próximas.</p>
        )}
      </div>
    </SideSection>
  );
}; 