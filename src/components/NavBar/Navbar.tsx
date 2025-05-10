import Image from 'next/image';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <nav className="fixed w-full z-50 transition-all duration-300 animate-fadeIn">
      <div className="backdrop-blur-md bg-white/80 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="transition-transform hover:scale-105 active:scale-95 duration-200">
            <Image
              src="/Konekta.png"
              alt="Konekta"
              width={120}
              height={30}
              priority
              className="object-contain"
            />
          </Link>
          
          <div className="hidden md:flex space-x-6 items-center">
            <a href="#beneficios" className="text-gray-600 hover:text-emerald-600 transition-colors">Beneficios</a>
            <a href="#como-funciona" className="text-gray-600 hover:text-emerald-600 transition-colors">Cómo Funciona</a>
            <a href="#testimonios" className="text-gray-600 hover:text-emerald-600 transition-colors">Testimonios</a>
          </div>
          
          <Link href="/auth/login">
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all hover:scale-105 active:scale-95">
              Iniciar Sesión
            </button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
