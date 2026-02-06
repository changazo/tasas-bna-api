import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Revalidación: cada 5 minutos chequea si hay datos nuevos
export const revalidate = 300;

async function getTasas() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await supabase
    .from('historial_tasas')
    .select('datos, fecha_scraping')
    .order('id', { ascending: false })
    .limit(1)
    .single();
    
  return data;
}

export default async function Home() {
  const record = await getTasas();
  const tasas = record?.datos?.tasas;
  const fechaScraping = record?.fecha_scraping; // Fecha en que corrió el bot

  if (!tasas) return <div className="p-10 text-center">Cargando datos o base vacía...</div>;

  return (
    <main className="bg-slate-50 text-slate-900 px-4 pt-4 pb-2 md:px-12 md:pt-12 md:pb-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header con Navegación */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 pb-6 border-b border-slate-200">
  <div className="text-center md:text-left">
    <h1 className="text-3xl font-bold tracking-tight text-blue-900">
      Tasas BNA
    </h1>
    <p className="text-slate-500 text-sm">
      Extracción automática diaria. Último run: {fechaScraping}
    </p>
  </div>
  
  <div className="flex gap-3">
    <Link 
      href="/graficos"
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm shadow-blue-200"
    >
      📊 Visión interactiva
    </Link>
    
    <Link 
      href="/historico"
      className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-blue-700 transition flex items-center gap-2"
    >
      📅 Tabla simple
    </Link>
  </div>
</header>

        {/* Grid de Tarjetas */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Card: Plazo Fijo */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-lg font-mono">
              PASIVA
            </div>
            <h2 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
              <span>📈</span> <span className="ml-2">{tasas.pasiva_judicial.referencia}</span>
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-sm">TNA (Nominal)</span>
                <span className="text-3xl font-bold text-slate-800">{tasas.pasiva_judicial.TNA}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-sm">TEA (Efectiva)</span>
                <span className="text-xl font-semibold text-slate-700">{tasas.pasiva_judicial.TEA}</span>
              </div>
            </div>
          </div>

          {/* Card: Judicial / Activa */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-bl-lg font-mono">
              ACTIVA
            </div>
            <h2 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
              <span>⚖️</span> <span className="ml-2">Tasa Activa Judicial</span>
            </h2>
            
            {/* NUEVO: Fecha de Vigencia */}
            <div className="mb-4 bg-blue-50 text-blue-800 text-xs inline-block px-2 py-1 rounded border border-blue-100">
              Vigente desde: <strong>{tasas.activa_judicial.fecha_vigencia}</strong>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-sm">TNA (Nominal)</span>
                <span className="text-3xl font-bold text-slate-800">{tasas.activa_judicial.TNA}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-sm">TEA (Efectiva)</span>
                <span className="text-xl font-semibold text-slate-700">{tasas.activa_judicial.TEA}</span>
              </div>
               <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-sm">TEM (Mensual)</span>
                <span className="text-lg text-slate-600">{tasas.activa_judicial.TEM}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección API (sin cambios, solo visual) */}
        <section className="bg-slate-900 text-slate-300 rounded-xl p-6 text-sm">
           <p>Para desarrolladores: <code className="text-green-400 bg-black/30 px-2 py-1 rounded">/api/tasas/latest</code></p>
        </section>

      </div>
    </main>
  );
}
