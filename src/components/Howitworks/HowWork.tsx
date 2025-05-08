import { motion, Variants } from 'framer-motion'; // Importa Variants para tipado
import React from 'react'; // Importa React para tipar FC

// Define tipos más específicos para las props
interface StepItemProps {
  number: string;
  title: string;
  description: string;
  variants: Variants; // Tipo específico para las variantes de animación
}

interface HowWorkProps {
  fadeInUp: Variants;
  staggerContainer: Variants;
}

// Componente StepItem más limpio y tipado
const StepItem: React.FC<StepItemProps> = ({ number, title, description, variants }) => (
  <motion.div
    variants={variants} // Usa las variantes pasadas como prop
    className="flex flex-col items-center text-center px-4"
    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }} // Animación hover más sutil
  >
    {/* Círculo minimalista para el número */}
    <div className="flex items-center justify-center w-12 h-12 mb-4 bg-emerald-100 rounded-full">
      <span className="text-xl font-semibold text-emerald-600">{number}</span>
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

// Componente HowWork principal, tipado y simplificado
export const HowWork: React.FC<HowWorkProps> = ({ fadeInUp, staggerContainer }) => {
  const steps = [
    { number: "1", title: "Crea tu Perfil", description: "Cuéntanos tus intereses y estilo de viaje para personalizar tu experiencia." },
    { number: "2", title: "Explora y Conecta", description: "Descubre rutas únicas y contacta directamente con guías locales." },
    { number: "3", title: "Viaja y Disfruta", description: "Vive experiencias auténticas y gana puntos para futuros viajes." },
  ];

  return (
    <motion.section
      id="como-funciona"
      className="py-20 md:py-28 px-6 bg-white" // Fondo limpio, sin blur
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Animar una vez cuando el 20% sea visible
      variants={staggerContainer} // Aplica el contenedor stagger
    >
      <div className="container mx-auto text-center mb-16">
        {/* Título y descripción con animación */}
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          variants={fadeInUp} // Aplica animación fadeInUp
        >
          ¿Cómo Funciona?
        </motion.h2>
        <motion.p
          className="text-base md:text-lg text-gray-600 max-w-xl mx-auto"
          variants={fadeInUp} // Aplica animación fadeInUp
        >
          Simple, intuitivo y diseñado para tu comodidad en solo 3 pasos.
        </motion.p>
      </div>

      {/* Grid para los pasos */}
      <motion.div // Contenedor para aplicar stagger a los StepItem
        className="container mx-auto grid md:grid-cols-3 gap-10 md:gap-12"
        variants={staggerContainer} // Asegura que los hijos se animen secuencialmente
      >
        {steps.map((step) => (
          <StepItem
            key={step.number}
            number={step.number}
            title={step.title}
            description={step.description}
            variants={fadeInUp} // Pasa la variante fadeInUp a cada StepItem
          />
        ))}
      </motion.div>
    </motion.section>
  );
};