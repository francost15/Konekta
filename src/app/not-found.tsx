'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Home } from 'lucide-react'; // Iconos relevantes

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        {/* Icono o Ilustración */}
        <div className="mb-8 text-emerald-500">
          <Compass size={80} className="mx-auto opacity-80" strokeWidth={1.5} />
        </div>

        {/* Título */}
        <h1 className="text-5xl md:text-6xl font-bold text-emerald-700 mb-4">
          404
        </h1>

        {/* Mensaje Principal */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
          ¡Ups! Parece que te has perdido.
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 mb-8">
          La página que buscas no existe o ha sido movida. No te preocupes, puedes volver al inicio.
        </p>

        {/* Botón para volver al inicio */}
        <Link href="/" passHref>
          <motion.button
            className="inline-flex items-center bg-emerald-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-emerald-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={18} className="mr-2" />
            Volver al Inicio
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}