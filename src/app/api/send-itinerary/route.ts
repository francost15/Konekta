import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializar el cliente de Resend con la API key
// La key se maneja como una variable de entorno para mayor seguridad
const RESEND_API_KEY = 're_Kbystzji_BBYHrkd9YqshGop2wMkjv6FX';
const resend = new Resend(RESEND_API_KEY);

export async function POST(request: Request) {
  console.log('API route /api/send-itinerary iniciada');
  
  try {
    // Obtener los datos de la solicitud
    const body = await request.json();
    const { email, destination, itineraryHtml, subject } = body;
    
    console.log('Datos recibidos:', { email, destination, subjectProvided: !!subject, htmlLength: itineraryHtml?.length || 0 });
    
    if (!email || !itineraryHtml || !destination) {
      console.error('Faltan campos requeridos:', { email: !!email, destination: !!destination, itineraryHtml: !!itineraryHtml });
      return NextResponse.json(
        { error: 'Email, destination y itineraryHtml son campos requeridos' },
        { status: 400 }
      );
    }
    
    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Formato de correo inválido:', email);
      return NextResponse.json(
        { error: 'El formato del correo electrónico es inválido' },
        { status: 400 }
      );
    }
    
    console.log('Intentando enviar correo a:', email);
    
    // Preparar el correo
    const emailSubject = subject || `Tu itinerario personalizado para ${destination}`;
    
    // Enviar el correo
    try {
      // Usar resend.dev en lugar de gmail.com como dominio remitente
      // Este dominio ya está verificado por defecto en Resend
      const data = await resend.emails.send({
        from: 'Konekta Itinerarios <onboarding@resend.dev>',
        to: email,
        subject: emailSubject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Tu Itinerario Personalizado</title>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background-color: #10b981;
                  color: white;
                  padding: 20px;
                  border-radius: 8px 8px 0 0;
                  text-align: center;
                }
                .content {
                  padding: 20px;
                  background-color: #f9fafb;
                  border-radius: 0 0 8px 8px;
                }
                .footer {
                  margin-top: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #6b7280;
                }
                h1 {
                  margin: 0;
                  font-weight: 600;
                }
                p {
                  margin-bottom: 1em;
                }
                .btn {
                  display: inline-block;
                  background-color: #10b981;
                  color: white;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 4px;
                  font-weight: 500;
                }
                .morning {
                  background-color: #ecfdf5;
                  border-left: 4px solid #10b981;
                  padding: 10px 15px;
                  margin-bottom: 10px;
                }
                .afternoon {
                  background-color: #fff7ed;
                  border-left: 4px solid #f97316;
                  padding: 10px 15px;
                  margin-bottom: 10px;
                }
                .evening {
                  background-color: #eef2ff;
                  border-left: 4px solid #6366f1;
                  padding: 10px 15px;
                  margin-bottom: 10px;
                }
                .day-title {
                  background-color: #f3f4f6;
                  padding: 10px;
                  font-weight: 600;
                  border-radius: 4px;
                  margin-top: 20px;
                  margin-bottom: 10px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Tu Itinerario para ${destination}</h1>
              </div>
              <div class="content">
                <p>¡Hola!</p>
                <p>Aquí tienes tu itinerario personalizado para tu viaje a <strong>${destination}</strong>. 
                   Hemos seleccionado los mejores lugares y experiencias para que disfrutes al máximo tu visita.</p>
                
                <div class="itinerary">
                  ${itineraryHtml}
                </div>
                
                <p>Para una mejor experiencia, puedes acceder a tu itinerario completo en nuestra plataforma:</p>
                <p style="text-align: center;">
                  <a href="https://konekta.vercel.app/itinerary?destination=${encodeURIComponent(destination)}" class="btn">Ver Itinerario Completo</a>
                </p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Konekta. Todos los derechos reservados.</p>
                <p>Si tienes alguna pregunta, contáctanos a: <a href="mailto:soporte@konekta.com">soporte@konekta.com</a></p>
              </div>
            </body>
          </html>
        `,
        // Opcional: añadir texto plano como fallback para clientes de correo que no soportan HTML
        text: `Tu itinerario personalizado para ${destination}\n\nPara ver tu itinerario completo, visita: https://konekta.vercel.app/itinerary?destination=${encodeURIComponent(destination)}`
      });
      
      if (data.error) {
        throw data.error;
      }
      
      console.log('Correo enviado exitosamente:', data);
      return NextResponse.json({ 
        success: true, 
        data,
        message: 'Correo enviado exitosamente' 
      });
    } catch (emailError: any) {
      console.error('Error específico de Resend:', emailError);
      
      // Manejar errores específicos de Resend
      let errorMessage = 'Error al enviar el correo electrónico';
      let statusCode = 500;
      
      if (emailError.statusCode === 403) {
        errorMessage = 'No tienes permiso para enviar correos desde esta dirección';
        statusCode = 403;
      } else if (emailError.statusCode === 429) {
        errorMessage = 'Has excedido el límite de envíos permitidos';
        statusCode = 429;
      } else if (emailError.message) {
        errorMessage = emailError.message;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: emailError.message || 'Sin detalles adicionales',
          code: emailError.statusCode || 'unknown',
          success: false
        },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    console.error('Error general en el endpoint de envío de correo:', error);
    return NextResponse.json(
      { 
        error: 'Hubo un error al procesar la solicitud', 
        details: error.message || 'Sin detalles disponibles',
        success: false
      },
      { status: 500 }
    );
  }
} 