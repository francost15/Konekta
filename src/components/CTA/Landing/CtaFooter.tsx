export const CtaFooter = () => {
  return (
    <section className="py-20 md:py-28 px-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 z-10"></div>
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full">
          <defs>
            <pattern id="grid-white" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-white)" />
        </svg>
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate-fadeInUp">
          ¿Listo para tu próxima aventura?
        </h2>
        <p className="text-xl text-emerald-50 max-w-2xl mx-auto mb-10 animate-fadeInUp animate-delay-100">
          Regístrate gratis y empieza a explorar las posibilidades que Konekta tiene para ti.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animate-delay-200">
          <button className="bg-white text-emerald-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
            Crear Perfil Gratis
          </button>
          <button className="bg-transparent text-white border border-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors hover:scale-105 active:scale-95">
            Saber Más
          </button>
        </div>
      </div>
    </section>
  )
}
