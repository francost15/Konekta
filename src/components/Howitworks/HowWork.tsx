import React from 'react';

interface StepItemProps {
  number: string;
  title: string;
  description: string;
}

interface HowWorkProps {
  fadeInUp?: any;
  staggerContainer?: any;
}

// Componente StepItem más limpio y tipado
const StepItem: React.FC<StepItemProps> = ({ number, title, description }) => (
  <div
    className="flex flex-col items-center text-center px-4 hover:scale-103 transition-transform duration-200 animate-fadeInUp"
  >
    <div className="flex items-center justify-center w-12 h-12 mb-4 bg-emerald-100 rounded-full">
      <span className="text-xl font-semibold text-emerald-600">{number}</span>
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Componente HowWork principal, tipado y simplificado
export const HowWork: React.FC<HowWorkProps> = ({ fadeInUp, staggerContainer }) => {
  const steps = [
    { number: "1", title: "Crea tu Perfil", description: "Cuéntanos tus intereses y estilo de viaje para personalizar tu experiencia." },
    { number: "2", title: "Explora y Conecta", description: "Descubre rutas únicas y contacta directamente con guías locales." },
    { number: "3", title: "Viaja y Disfruta", description: "Vive experiencias auténticas y gana puntos para futuros viajes." },
  ];

  return (
    <section
      id="como-funciona"
      className="py-20 md:py-28 px-6 bg-white"
    >
      <div className="container mx-auto text-center mb-16">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 animate-fadeInUp"
        >
          ¿Cómo Funciona?
        </h2>
        <p
          className="text-base md:text-lg text-gray-600 max-w-xl mx-auto animate-fadeInUp animate-delay-100"
        >
          Simple, intuitivo y diseñado para tu comodidad en solo 3 pasos.
        </p>
      </div>

      <div
        className="container mx-auto grid md:grid-cols-3 gap-10 md:gap-12"
      >
        {steps.map((step, index) => (
          <StepItem
            key={step.number}
            number={step.number}
            title={step.title}
            description={step.description}
          />
        ))}
      </div>
    </section>
  );
};