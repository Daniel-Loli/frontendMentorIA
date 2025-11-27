/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial MentorIA
        primary: {
          DEFAULT: '#2A9E9C', // Teal SJL - Sidebar/Headers
          hover: '#228583',
          light: '#E0F2F1'    // Fondo suave
        },
        secondary: {
          DEFAULT: '#E8AA32', // Amarillo Mostaza - Botones Acción
          hover: '#C99126'
        },
        accent: {
          DEFAULT: '#E42289', // Magenta - Alertas/IA
          hover: '#BE1C72'
        },
        background: '#F8FAFC', // Gris muy claro para fondos
        surface: '#FFFFFF',    // Blanco puro para tarjetas
        text: {
          main: '#1E293B',     // Gris oscuro casi negro
          muted: '#64748B'     // Gris medio para subtítulos
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}