import { motion } from 'framer-motion';
interface Props {
  fadeInUp: any;
}
export const CtaFooter = ({fadeInUp}:Props) => {
  return (
    <motion.section
    className="py-20 md:py-28 px-6 relative overflow-hidden"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={fadeInUp}
  >
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
      <motion.h2 
        className="text-3xl md:text-5xl font-bold text-white mb-6"
        variants={fadeInUp}
      >
        ¿Listo para tu próxima aventura?
      </motion.h2>
      <motion.p 
        className="text-xl text-emerald-50 max-w-2xl mx-auto mb-10"
        variants={fadeInUp}
      >
        Regístrate gratis y empieza a explorar las posibilidades que Konekta tiene para ti.
      </motion.p>
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center"
        variants={fadeInUp}
      >
        <motion.button
          className="bg-white text-emerald-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.4)" }}
          whileTap={{ scale: 0.95 }}
        >
          Crear Perfil Gratis
        </motion.button>
        <motion.button
          className="bg-transparent text-white border border-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Saber Más
        </motion.button>
      </motion.div>
    </div>
  </motion.section>
  )
}
