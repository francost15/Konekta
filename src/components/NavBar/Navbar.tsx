import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
export const Navbar = () => {
  return (
    <motion.nav 
    className="fixed w-full z-50 transition-all duration-300"
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <div className="backdrop-blur-md bg-white/80 shadow-sm">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/" className="flex items-center">

          <Image
            src="/Konekta.png"
            alt="Logo de Konekta"
            width={120}
            height={30}
            priority
            className="object-contain"
          />
          </Link>
        </motion.div>
        <div className="hidden md:flex space-x-6 items-center">
          <a href="#beneficios" className="text-gray-600 hover:text-emerald-600 transition-colors">Beneficios</a>
          <a href="#como-funciona" className="text-gray-600 hover:text-emerald-600 transition-colors">Cómo Funciona</a>
          <a href="#testimonios" className="text-gray-600 hover:text-emerald-600 transition-colors">Testimonios</a>
        </div>
        <Link href="/auth/login">
        <motion.button 
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Iniciar Sesión
        </motion.button>
        </Link>

      </div>
    </div>
  </motion.nav>
  )
}
