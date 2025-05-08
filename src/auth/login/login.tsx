'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Para el logo de Google
import Link from 'next/link'; // Para enlaces

// Variante de animación simple para la entrada
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" }
  }
};

const Login: React.FC = () => {
  // Placeholder para la función de inicio de sesión con Google
  const handleGoogleSignIn = () => {
    console.log("Iniciar sesión con Google");
    // Aquí iría la lógica para llamar a tu proveedor de autenticación (Firebase, NextAuth, etc.)
  };

  // Placeholder para el inicio de sesión con email/contraseña
  const handleEmailSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Iniciar sesión con Email/Contraseña");
    // Lógica de autenticación
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-subtle" // Sombra más sutil
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="text-center">
          {/* Puedes añadir tu logo aquí si quieres */}
          {/* <Image src="/Konekta.png" alt="Konekta Logo" width={150} height={40} className="mx-auto mb-4" /> */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Inicia sesión para continuar tu aventura.
          </p>
        </div>

        {/* Botón de Google */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Image
            src="/google-logo.svg" // Asegúrate de tener este SVG en tu carpeta public
            alt="Google logo"
            width={20}
            height={20}
            className="mr-3"
          />
          Iniciar sesión con Google
        </button>

        {/* Separador */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-400">
              O continúa con
            </span>
          </div>
        </div>

        {/* Formulario de Email/Contraseña */}
        <form onSubmit={handleEmailSignIn} className="space-y-5">
          <div>
            <label htmlFor="email" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Correo electrónico"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Contraseña"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-gray-700">
                Recordarme
              </label>
            </div>

            <Link href="/auth/forgot-password" // Ruta de ejemplo
                  className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div>
            <motion.button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Iniciar Sesión
            </motion.button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" // Ruta de ejemplo
                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
            Regístrate aquí
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

// Añade esta clase personalizada a tu archivo CSS global (ej. globals.css) si no la tienes:
/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .shadow-subtle {
    box-shadow: 0 4px 15px -1px rgba(0, 0, 0, 0.05), 0 2px 8px -2px rgba(0, 0, 0, 0.04);
  }
}
*/