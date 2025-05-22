import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class'], 
  safelist: ['dark'], 
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '375px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        'main-section': "url('/assets/mainsection.png')",
      },
      float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }, // Moves up by 10px
        },
        animation: {
        float: 'float 3s ease-in-out infinite', // Apply the float keyframe over 3 seconds, ease-in-out, infinite
      }
    },
  },
  plugins: [],
} satisfies Config;
