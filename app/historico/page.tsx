import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// No cacheamos el histórico por mucho tiempo (ej: 5 min) para ver cambios recientes si los hubo
export const revalidate = 300;

async function getHistoricalData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Traemos todo ordenado por fecha descendente
  const { data } = await supabase
    .from('historial_tasas')
    .select('*')
    .order('id', { ascending: false });
    
  return data || [];
}

export default async function HistoricoPage() {
  const historial = await getHistoricalData();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-blue-600 transition">
            ← Volver al inicio
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Historial de Tasas</h1>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Fecha Extracción</th>
                  <th className="px-6 py-4 text-blue-800 bg-blue-50/50">Vigente Desde</th>
                  <th className="px-6 py-4">Activa TNA</th>
                  <th className="px-6 py-4">Activa TEA</th>
                  <th className="px-6 py-4 border-l border-slate-100">Pasiva TNA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historial.map((fila) => {
                  const tasas = fila.datos.tasas;
                  // Manejo de error por si algún día falla el scrape y guarda null
                  if (!tasas) return null;

                  return (
                    <tr key={fila.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {fila.fecha_scraping}
                      </td>
                      <td className="px-6 py-4 font-medium text-blue-700 bg-blue-50/30">
                        {tasas.activa_judicial?.fecha_vigencia || '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {tasas.activa_judicial?.TNA || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {tasas.activa_judicial?.TEA || '-'}
                      </td>
                      <td className="px-6 py-4 border-l border-slate-100 text-slate-600">
                        {tasas.pasiva_judicial?.TNA || '-'}
                      </td>
                    </tr>
                  );
                })}
                
                {historial.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No hay datos históricos aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-xs text-center text-slate-400">
          Mostrando {historial.length} registros almacenados en Supabase.
        </div>

      </div>
    </main>
  );
}
