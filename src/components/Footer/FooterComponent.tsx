import { Facebook, Instagram, X } from 'lucide-react'
import React from 'react'

export const FooterComponent = () => {
  return (
    <footer className="py-12 bg-gray-900 text-gray-400 text-sm px-6">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">Konekta</h3>
          <p className="mb-4">Conectando viajeros con experiencias auténticas y sostenibles alrededor del mundo.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Explora</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Destinos</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Guías Locales</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Experiencias</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog de Viajes</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Compañía</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Sostenibilidad</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Trabaja con Nosotros</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Prensa</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Soporte</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            <li><a href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</a></li>
            <li><a href="/terminos" className="hover:text-white transition-colors">Términos de Servicio</a></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-gray-800 text-center md:flex md:justify-between">
        <p>&copy; {new Date().getFullYear()} Konekta. Todos los derechos reservados.</p>
        <p className="mt-4 md:mt-0">Hecho con ❤️ para viajeros auténticos</p>
      </div>
    </div>
  </footer>
  )
}
