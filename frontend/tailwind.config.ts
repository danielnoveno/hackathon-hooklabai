import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // PERBAIKAN: Hapus 'src/' karena folder kamu langsung 'app'
    "./app/**/*.{js,ts,jsx,tsx,mdx}", 
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['var(--font-roboto)'],
        poppins: ['var(--font-poppins)'],
      },
    },
  },
  plugins: [],
};
export default config;