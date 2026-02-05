import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const revalidate = 300;

async function getHistoricalData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await supabase
    .from('historial_tasas')
    .select('*')
    .order('id', { ascending: false });
    
  return data || [];
}

export default async function HistoricoPage() {
  const historial = await getHistoricalData();

  return (
    <main className="bg-slate-50 text-slate-900 px-4 pt-4 pb-2 md:px-12 md:pt-12 md:pb-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
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
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-blue-800 bg-blue-50/50">Vigencia Activa</th>
                  {/* Grupo Activa */}
                  <th className="px-6 py-4 font-semibold text-slate-700">Activa TNA</th>
                  <th className="px-6 py-4 text-slate-700">Activa TEA</th>
                  {/* Grupo Pasiva */}
                  <th className="px-6 py-4 border-l border-slate-200 font-semibold text-green-700 bg-green-50/30">Pasiva TNA</th>
                  <th className="px-6 py-4 text-green-700 bg-green-50/30">Pasiva TEA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historial.map((fila) => {
                  const tasas = fila.datos.tasas;
                  if (!tasas) return null;

                  return (
                    <tr key={fila.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-mono text-slate-500 whitespace-nowrap">
                        {fila.fecha_scraping}
                      </td>
                      <td className="px-6 py-4 font-medium text-blue-700 bg-blue-50/20 whitespace-nowrap">
                        {tasas.activa_judicial?.fecha_vigencia || '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {tasas.activa_judicial?.TNA || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {tasas.activa_judicial?.TEA || '-'}
                      </td>
                      {/* Columnas Pasivas */}
                      <td className="px-6 py-4 border-l border-slate-100 font-bold text-slate-700 bg-green-50/10">
                        {tasas.pasiva_judicial?.TNA || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 bg-green-50/10">
                        {tasas.pasiva_judicial?.TEA || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
