import { createClient } from '@supabase/supabase-js';

// Revalidación ISR: Next.js regenerará esta página estática cada 1 hora máximo
export const revalidate = 3600;

async function getTasas() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await supabase
    .from('historial_tasas')
    .select('datos')
    .order('id', { ascending: false })
    .limit(1)
    .single();
    
  return data?.datos;
}

export default async function Home() {
  const data = await getTasas();
  const tasas = data?.tasas;
  const fecha = data?.metadata?.timestamp;

  if (!tasas) return <div className="p-10">Cargando datos o error de conexión...</div>;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-blue-900">
            Tasas BNA
          </h1>
          <p className="text-slate-500">
            Datos extraídos automáticamente del Banco de la Nación Argentina.
          </p>
          <div className="text-xs font-mono text-slate-400">
            Última actualización: {fecha}
          </div>
        </header>

        {/* Grid de Tarjetas */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Card: Plazo Fijo */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
              <span className="mr-2">📈</span> {tasas.pasiva_judicial.referencia}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline border-b pb-2">
                <span className="text-slate-500 text-sm">TNA (Nominal)</span>
                <span className="text-2xl font-bold text-slate-800">{tasas.pasiva_judicial.TNA}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-sm">TEA (Efectiva)</span>
                <span className="text-xl font-semibold text-slate-700">{tasas.pasiva_judicial.TEA}</span>
              </div>
            </div>
          </div>

          {/* Card: Judicial / Activa */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
              <span className="mr-2">⚖️</span> Tasa Activa Judicial
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline border-b pb-2">
                <span className="text-slate-500 text-sm">TNA (Nominal)</span>
                <span className="text-2xl font-bold text-slate-800">{tasas.activa_judicial.TNA}</span>
              </div>
              <div className="flex justify-between items-baseline border-b pb-2">
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

        {/* Sección para Desarrolladores (API) */}
        <section className="mt-12 bg-slate-900 text-slate-300 rounded-xl p-6 md:p-8">
          <h3 className="text-white text-xl font-semibold mb-4">👨‍💻 API para Desarrolladores</h3>
          <p className="mb-4 text-sm">
            Puedes consumir estos datos libremente en tus aplicaciones. Respuesta en formato JSON.
          </p>
          
          <div className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-slate-700">
            <div className="flex justify-between mb-2 text-xs text-slate-500">
              <span>GET</span>
              <span>JSON</span>
            </div>
            <code className="text-green-400">
              https://tu-proyecto.vercel.app/api/tasas/latest
            </code>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            * Caché público de 12 horas. CORS habilitado.
          </div>
        </section>

      </div>
    </main>
  );
}