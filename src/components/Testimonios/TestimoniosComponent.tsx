export const TestimoniosComponent = () => {
  return (
    <section id="testimonios" className="py-20 md:py-28 px-6 relative">
      <div className="container mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 animate-fadeInUp">
          Lo que dicen nuestros viajeros
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto animate-fadeInUp animate-delay-100">
          Experiencias reales de personas que han viajado con Konekta.
        </p>
      </div>
      
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { name: "María G.", location: "Barcelona", quote: "Konekta me permitió descubrir lugares que jamás hubiera encontrado por mi cuenta. ¡Una experiencia inolvidable!" },
          { name: "Carlos R.", location: "Ciudad de México", quote: "Los guías locales fueron increíbles, me mostraron la verdadera esencia de la ciudad y su cultura." },
          { name: "Laura S.", location: "Tokio", quote: "La personalización de la ruta fue perfecta, cada recomendación se adaptaba exactamente a mis intereses." }
        ].map((testimonial, index) => (
          <div 
            key={testimonial.name}
            className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeInUp"
            style={{animationDelay: `${index * 100}ms`}}
          >
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <svg className="h-6 w-6 text-emerald-500 mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-600 italic">{testimonial.quote}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
