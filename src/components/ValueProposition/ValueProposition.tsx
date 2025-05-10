import React from 'react';
import { MapPin, Users, Leaf, Sparkles } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType; 
  title: string;
  children: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, children }) => {
  return (
    <div className="bg-white rounded-xl p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fadeInUp">
      <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4">
        <Icon className="w-6 h-6 text-emerald-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
};

export const ValueProposition = () => {
  const features = [
    { icon: Sparkles, title: "Personalización Inteligente", description: "Rutas adaptadas a tus intereses y estilo de viaje." },
    { icon: Users, title: "Conexión con Guías", description: "Comunícate con guías locales sin intermediarios." },
    { icon: Leaf, title: "Experiencias Sostenibles", description: "Negocios y prácticas que cuidan el planeta y comunidades." },
    { icon: MapPin, title: "Lugares Únicos", description: "Experiencias fuera de las rutas turísticas tradicionales." },
  ];

  return (
    <section
      id="beneficios"
      className="py-20 md:py-28 px-6 bg-gradient-to-b from-white to-gray-50/50"
    >
      <div className="container mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 animate-fadeInUp">
          ¿Por qué Konekta?
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto animate-fadeInUp animate-delay-100">
          Te conectamos con la esencia de cada destino de manera única, responsable y personalizada.
        </p>
      </div>

      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            children={feature.description}
          />
        ))}
      </div>
    </section>
  );
};