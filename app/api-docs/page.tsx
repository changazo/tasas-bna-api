import Link from 'next/link';
import { ArrowLeft, Terminal, AlertTriangle, Calendar, FileJson } from 'lucide-react';

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Documentación de API</h1>
          <p className="text-lg text-slate-600">
            Accede a los datos históricos y actuales de tasas judiciales del Banco Nación Argentina de forma programática.
          </p>
        </div>

        {/* Endpoint Principal */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Terminal className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Endpoint Base</h2>
          </div>
          
          <div className="bg-slate-900 text-slate-50 p-4 rounded-xl font-mono text-sm overflow-x-auto">
            GET https://tudominio.vercel.app/api/tasas
          </div>
        </section>

        {/* Parámetros */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Parámetros de Consulta (Query Params)</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4 font-semibold">Parámetro</th>
                  <th className="p-4 font-semibold">Tipo</th>
                  <th className="p-4 font-semibold">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="p-4 font-mono text-blue-600">date</td>
                  <td className="p-4 text-slate-500">String (ISO)</td>
                  <td className="p-4">
                    <p>Filtra por fecha de extracción del dato.</p>
                    <p className="mt-1 text-xs text-slate-500">Formato requerido: <code className="bg-slate-100 px-1 rounded">YYYY-MM-DD</code></p>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-blue-600">field</td>
                  <td className="p-4 text-slate-500">String</td>
                  <td className="p-4">
                    <p>Permite extraer un valor específico del JSON anidado.</p>
                    <p className="mt-1 text-xs text-slate-500">Ejemplo: <code className="bg-slate-100 px-1 rounded">tasas.activa_judicial.TNA</code></p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Aclaraciones Importantes */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          <div className="space-y-2 text-sm text-amber-900">
            <h3 className="font-semibold text-amber-800">Consideraciones sobre las Fechas</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Fecha de Scraping vs. Vigencia:</strong> El parámetro <code>date</code> busca por la fecha en la que nuestro sistema extrajo el dato (scraping), no necesariamente por la fecha de vigencia legal de la tasa.
              </li>
              <li>
                <strong>Formato ISO:</strong> Utiliza siempre el formato internacional <code className="font-mono bg-amber-100 px-1 rounded">YYYY-MM-DD</code> (Año-Mes-Día). Ejemplo: 2026-02-05.
              </li>
            </ul>
          </div>
        </section>

        {/* Ejemplos Prácticos */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Ejemplos de Uso</h2>

          {/* Ejemplo 1 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Obtener datos de un día específico</span>
            </div>
            <div className="p-4 bg-slate-900 text-green-400 font-mono text-sm overflow-x-auto">
              GET /api/tasas?date=2026-02-05
            </div>
          </div>

          {/* Ejemplo 2 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Obtener solo la TNA Activa de hoy</span>
            </div>
            <div className="p-4 bg-slate-900 text-green-400 font-mono text-sm overflow-x-auto">
              GET /api/tasas?field=tasas.activa_judicial.TNA
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-2">Respuesta:</p>
              <pre className="text-xs text-slate-600 font-mono">
{`{
  "fecha_dato": "2026-02-06",
  "campo_solicitado": "tasas.activa_judicial.TNA",
  "valor": "37,42%"
}`}
              </pre>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
