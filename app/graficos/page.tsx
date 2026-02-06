import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import TasasChart from './TasasChart';

// Revalidar cada 60 segundos
export const revalidate = 60;

async function getAllData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Obtenemos TODO el historial (para que el cliente filtre)
  const { data } = await supabase
    .from('historial_tasas')
    .select('*')
    .order('fecha_scraping', { ascending: true });
    
  return data || [];
}

export default async function GraficosPage() {
  const data = await getAllData();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-blue-600 transition font-medium">
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Visión Interactiva</h1>
          </div>
          <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            {data.length} registros analizados
          </div>
        </div>

        {/* Componente Cliente del Gráfico */}
        <TasasChart rawData={data} />

      </div>
    </main>
  );
}
