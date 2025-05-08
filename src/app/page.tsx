'use client';

import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { useRef } from 'react';
import { CtaFooter, FavoriteLocation, FooterComponent, HowWork, Navbar, TestimoniosComponent, ValueProposition } from "@/components";

// Animaciones refinadas para mayor suavidad
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeInOut" } // Replaced array with string
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Ligero aumento en stagger
      delayChildren: 0.1
    }
  }
};

const wordAnimation: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: "easeInOut" // Replaced array with string
    }
  })
};

const Home = () => {
  const headerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  // Ajuste de la animación de scroll para ser más sutil
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]); // Desvanece más rápido
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.95]); // Escala menos

  const titleText = "Conecta con lo real de viajar";
  const titleWords = titleText.split(" ");

  return (
    // Fondo blanco simple
    <div className="antialiased text-gray-800 overflow-x-hidden bg-white">

      <Navbar/>

      <header ref={headerRef} className="pt-32 pb-20 md:pt-40 md:pb-32 text-center relative overflow-hidden px-6">
        {/* Aplicar animación de scroll directamente al contenedor */}
        <motion.div
          style={{ opacity: headerOpacity, scale: headerScale }}
          className="container mx-auto relative z-10"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-gray-900" // Color base para el título
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordAnimation}
                style={{ display: 'inline-block', marginRight: '0.25em' }}
                // Aplicar gradiente solo a la primera palabra si se desea, o quitar para consistencia
                className={i === 0 ? "bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-orange-400" : ""}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10"
            // Usar la variante fadeInUp directamente
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={1} // Puedes usar custom para delays si es necesario dentro de un stagger
            transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }} // Ensure easing is consistent here too
          >
            Explora rutas únicas, conéctate con locales apasionados, viaja con impacto.
          </motion.p>

          {/* Contenedor para los botones con stagger */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerContainer} // Aplicar stagger a los botones
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.7 }} // Retrasar la animación de los botones
          >
            <motion.button
              variants={fadeInUp} // Animar cada botón
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.03, y: -2, boxShadow: "0 8px 20px -5px rgba(16, 185, 129, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              Descubre tu Próxima Aventura
            </motion.button>
            <motion.button
              variants={fadeInUp} // Animar cada botón
              className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full font-semibold shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Ver Destinos
            </motion.button>
          </motion.div>
        </motion.div>
      </header>

      {/* Pasar las variantes refinadas a los componentes hijos */}
      <ValueProposition fadeInUp={fadeInUp} staggerContainer={staggerContainer}/>
      <FavoriteLocation fadeInUp={fadeInUp} staggerContainer={staggerContainer}/>
      <HowWork fadeInUp={fadeInUp} staggerContainer={staggerContainer}/>
      <TestimoniosComponent fadeInUp={fadeInUp} staggerContainer={staggerContainer} />
      <CtaFooter fadeInUp={fadeInUp} />
      <FooterComponent />
    </div>
  );
};

export default Home;