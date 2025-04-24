/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'network-blue': '#0adbe3',     // Azul claro (Elementos de rede)
        'storage-blue': '#0897e9',     // Azul (Elementos de storage)
        'neutral-gray': '#363636',     // Cinza escuro (Texto e elementos neutros)
        'computing-purple': '#6b48ff', // Roxo (Elementos de computação)
        'dependency-orange': '#feac0e', // Laranja (Elementos de dependência)
        'bg-white': '#ffffff',         // Branco (Backgrounds)
        'bg-gray': '#ededed',          // Cinza claro (Backgrounds alternativos)
      },
    },
  },
  plugins: [],
} 