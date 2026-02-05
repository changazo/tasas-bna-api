import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tasas BNA | API & Histórico",
  description: "Consulta automática de tasas judiciales y plazos fijos del BNA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* El contenido de la página se renderiza aquí */}
        <div className="flex-1 w-full">
            {children}
        </div>

        {/* --- FOOTER CON CAFECITO --- */}
        <footer className="py-8 text-center border-t border-slate-200 mt-auto bg-white w-full">
          <div className="flex flex-col items-center gap-4 px-4">
            <p className="text-slate-500 text-sm font-sans">
              ¿Te sirvió el dato? Ayudame a mantener el servidor:
            </p>
            
            <a 
              href='https://cafecito.app/changazo' 
              rel='noopener noreferrer' 
              target='_blank' 
              className="hover:scale-105 transition-transform duration-200"
            >
              <img 
                srcSet='https://cdn.cafecito.app/imgs/buttons/button_2.png 1x, https://cdn.cafecito.app/imgs/buttons/button_2_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_2_3.75x.png 3.75x' 
                src='https://cdn.cafecito.app/imgs/buttons/button_2.png' 
                alt='Invitame un café en cafecito.app' 
              />
            </a>
            
            <p className="text-xs text-slate-400 mt-4 font-mono">
              Desarrollado por Juan Cruz Changazo
            </p>
          </div>
        </footer>
        {/* --------------------------- */}

      </body>
    </html>
  );
}
