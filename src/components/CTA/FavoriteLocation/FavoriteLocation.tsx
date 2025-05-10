interface Props {
  fadeInUp?: any;
  staggerContainer?: any;
}
export const FavoriteLocation = ({fadeInUp,staggerContainer}:Props) => {
  return (
    <section className="py-20 md:py-28 px-6 relative overflow-hidden">
      <div className="container mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 animate-fadeInUp">
          Destinos Destacados
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto animate-fadeInUp animate-delay-100">
          Explora algunos de nuestros destinos más populares y sus experiencias únicas.
        </p>
      </div>
      
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {['Barcelona', 'Tokio', 'Ciudad de México'].map((city, index) => (
          <div 
            key={city}
            className="relative rounded-xl overflow-hidden h-80 group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 animate-fadeInUp"
            style={{animationDelay: `${index * 100}ms`}}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-emerald-500 mix-blend-color opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-10"></div>
            <div className="absolute bottom-0 left-0 p-6 z-20">
              <h3 className="text-white text-2xl font-bold mb-2">{city}</h3>
              <p className="text-white/80 text-sm mb-4">Descubre experiencias auténticas</p>
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
                Explorar
              </span>
            </div>
            <div className="absolute inset-0 bg-gray-300 -z-10 transform group-hover:scale-110 transition-transform duration-700">
              {/* Aquí irían las imágenes reales de los destinos */}
              {/* <Image src={`/destinations/${city.toLowerCase()}.jpg`} alt={city} fill className="object-cover transition-transform duration-500 group-hover:scale-110" /> */}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
