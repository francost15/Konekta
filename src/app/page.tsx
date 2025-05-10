'use client';

import { useRef } from 'react';
import { CtaFooter, FavoriteLocation, FooterComponent, HowWork, TestimoniosComponent, ValueProposition } from "@/components";
import Link from 'next/link';

const Home = () => {
  const headerRef = useRef<HTMLElement>(null);

  return (
    <div className="antialiased text-gray-800 overflow-x-hidden bg-white">

      <header ref={headerRef} className="pt-32 pb-20 md:pt-40 md:pb-32 text-center relative overflow-hidden px-6">
        <div className="container mx-auto relative z-10 transition-all duration-500">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-gray-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-orange-400 animate-fadeInUp">
              Konekta
            </span>{' '}
            <span className="animate-fadeInUp animate-delay-100 inline-block">con lo</span>{' '}
            <span className="animate-fadeInUp animate-delay-200 inline-block">real</span>{' '}
            <span className="animate-fadeInUp animate-delay-300 inline-block">de viajar</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 animate-fadeInUp animate-delay-400">
            Explora rutas únicas, conéctate con locales apasionados, viaja con impacto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/home">
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInUp animate-delay-500 hover:scale-105 active:scale-95">
              Descubre tu Próxima Aventura
            </button>
            </Link>
          </div>
        </div>
      </header>

      <ValueProposition />
      <FavoriteLocation />
      <HowWork />
      <TestimoniosComponent />
      <CtaFooter />
      <FooterComponent />
    </div>
  );
};

export default Home;