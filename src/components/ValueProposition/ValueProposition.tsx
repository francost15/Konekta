import React from 'react'; // Importa React para tipar FC
import { motion, Variants } from 'framer-motion'; // Importa Variants para tipado
import { MapPin, Users, Leaf, Sparkles } from 'lucide-react'; // Importa los iconos necesarios

// --- Tipos ---
interface FeatureCardProps {
  icon: React.ElementType; // Tipo para componentes de icono
  title: string;
  children: React.ReactNode;
  variants: Variants; // Tipo específico para las variantes
}

interface ValuePropositionProps {
  fadeInUp: Variants;
  staggerContainer: Variants;
}

// --- Componente FeatureCard Refinado ---
const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, children, variants }) => {
  return (
    <motion.div
      className="bg-white rounded-xl p-6 text-center shadow-sm transition-shadow duration-300 hover:shadow-md" // UI más limpia, hover sutil
      variants={variants} // Aplica la variante pasada
      whileHover={{ y: -4, scale: 1.02 }} // Animación hover más discreta
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4">
        <Icon className="w-6 h-6 text-emerald-600" /> {/* Tamaño de icono ajustado */}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
    </motion.div>
  );
};

// --- Componente ValueProposition Principal ---
export const ValueProposition: React.FC<ValuePropositionProps> = ({ fadeInUp, staggerContainer }) => {
  // Datos de las características definidos en un array
  const features = [
    { icon: Sparkles, title: "Personalización Inteligente", description: "Rutas y sugerencias adaptadas a tus intereses y estilo de viaje." },
    { icon: Users, title: "Conexión Directa con Guías", description: "Comunícate y reserva con guías locales apasionados sin intermediarios." },
    { icon: Leaf, title: "Experiencias Sostenibles", description: "Priorizamos negocios y prácticas que cuidan el planeta y las comunidades." },
    { icon: MapPin, title: "Descubrimientos Únicos", description: "Accede a lugares y experiencias fuera de las rutas turísticas tradicionales." },
  ];

  return (
    <motion.section
      id="beneficios"
      className="py-20 md:py-28 px-6 bg-gradient-to-b from-white to-gray-50/50" // Fondo muy sutil
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Animar una vez
      variants={staggerContainer} // Contenedor para stagger
    >
      <div className="container mx-auto text-center mb-16">
        {/* Título y descripción con animación */}
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          variants={fadeInUp}
        >
          ¿Por qué Konekta?
        </motion.h2>
        <motion.p
          className="text-base md:text-lg text-gray-600 max-w-xl mx-auto"
          variants={fadeInUp}
        >
          Te conectamos con la esencia de cada destino de una manera única, responsable y personalizada.
        </motion.p>
      </div>

      {/* Grid para las FeatureCards */}
      <motion.div // Contenedor explícito para aplicar stagger a los hijos directos
        className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        variants={staggerContainer} // Asegura que las FeatureCard se animen secuencialmente
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index} // Usa el índice como key si los títulos no son únicos, o preferiblemente un id si lo tuvieran
            icon={feature.icon}
            title={feature.title}
            variants={fadeInUp} // Pasa la variante a cada tarjeta
          >
            {feature.description}
          </FeatureCard>
        ))}
      </motion.div>
    </motion.section>
  );
};