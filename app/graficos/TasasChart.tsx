"use client";

import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, subDays, parseISO, isAfter, isBefore, startOfDay, parse } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos de datos
type RawData = {
  id: number;
  fecha_scraping: string;
  datos: any;
};

// Función auxiliar para parsear porcentajes
const parsePercent = (str: string | undefined) => {
  if (!str) return 0;
  return parseFloat(str.replace('%', '').replace(',', '.'));
};

export default function TasasChart({ rawData }: { rawData: RawData[] }) {
  const [filter, setFilter] = useState<'1W' | '1M' | '6M' | '1Y' | 'ALL' | 'CUSTOM'>('1M');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  
  // ESTADO PARA MANEJAR LA VISIBILIDAD DE LAS SERIES
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  // Función para ocultar/mostrar líneas al hacer click en la leyenda
  const handleLegendClick = (e: any) => {
    const dataKey = e.dataKey; // Obtenemos el ID de la línea clickeada
    setHiddenSeries((prev) => 
      prev.includes(dataKey) 
        ? prev.filter((key) => key !== dataKey) // Si estaba oculto, lo mostramos
        : [...prev, dataKey] // Si estaba visible, lo ocultamos
    );
  };

  // 1. Transformar datos
  const formattedData = useMemo(() => {
    return rawData
      .map((row) => {
        const t = row.datos.tasas;
        let dateStr = row.fecha_scraping; 

        const vigenciaRaw = t?.activa_judicial?.fecha_vigencia; 
        
        if (vigenciaRaw) {
          try {
            const parsedDate = parse(vigenciaRaw, 'dd/MM/yyyy', new Date());
            dateStr = parsedDate.toISOString(); 
          } catch (e) {
            console.error("Error parseando fecha vigencia:", vigenciaRaw);
          }
        }

        return {
          date: dateStr,
          activa_tna: parsePercent(t?.activa_judicial?.TNA),
          activa_tea: parsePercent(t?.activa_judicial?.TEA),
          activa_tem: parsePercent(t?.activa_judicial?.TEM),
          pasiva_tna: parsePercent(t?.pasiva_judicial?.TNA),
          pasiva_tea: parsePercent(t?.pasiva_judicial?.TEA),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [rawData]);

  // 2. Filtrar datos
  const chartData = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0); 

    if (filter === '1W') startDate = subDays(now, 7);
    if (filter === '1M') startDate = subDays(now, 30);
    if (filter === '6M') startDate = subDays(now, 180);
    if (filter === '1Y') startDate = subDays(now, 365);
    
    if (filter === 'CUSTOM') {
       return formattedData.filter(d => {
         const dDate = parseISO(d.date);
         const start = customStart ? startOfDay(parseISO(customStart)) : null;
         const end = customEnd ? startOfDay(parseISO(customEnd)) : null;
         
         if (start && isBefore(dDate, start)) return false;
         if (end && isAfter(dDate, end)) return false;
         return true;
       });
    }

    return formattedData.filter(d => isAfter(parseISO(d.date), startDate));
  }, [formattedData, filter, customStart, customEnd]);


  const FilterButton = ({ label, value }: { label: string, value: typeof filter }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
        filter === value 
          ? 'bg-slate-800 text-white shadow-md' 
          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 flex-wrap justify-center">
          <FilterButton label="1 Semana" value="1W" />
          <FilterButton label="1 Mes" value="1M" />
          <FilterButton label="6 Meses" value="6M" />
          <FilterButton label="1 Año" value="1Y" />
          <FilterButton label="Histórico" value="ALL" />
          <FilterButton label="Personalizado" value="CUSTOM" />
        </div>

        {filter === 'CUSTOM' && (
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <input 
              type="date" 
              className="bg-transparent text-xs text-slate-700 outline-none"
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date" 
              className="bg-transparent text-xs text-slate-700 outline-none"
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[500px] w-full relative">
        <h3 className="text-sm font-semibold text-slate-500 mb-6 absolute top-6 left-6 z-10">
          Evolución de Tasas (%)
        </h3>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(str) => format(parseISO(str), 'dd MMM', { locale: es })}
                stroke="#94a3b8"
                fontSize={12}
                tickMargin={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                domain={['auto', 'auto']} 
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(label) => format(parseISO(label), 'dd MMMM yyyy', { locale: es })}
              />
              
              {/* LEYENDA INTERACTIVA */}
              <Legend 
                wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }} 
                iconType="circle"
                onClick={handleLegendClick} // <--- AQUÍ ESTÁ LA MAGIA
                formatter={(value, entry: any) => {
                  const { dataKey } = entry;
                  const isHidden = hiddenSeries.includes(dataKey);
                  return (
                    <span style={{ 
                      color: isHidden ? '#cbd5e1' : '#334155', // Gris claro si está oculto
                      textDecoration: isHidden ? 'line-through' : 'none',
                      fontWeight: 500
                    }}>
                      {value}
                    </span>
                  );
                }}
              />
              
              {/* TASAS CON PROPIEDAD HIDE DINÁMICA */}
              <Line 
                type="monotone" name="Activa TEA" dataKey="activa_tea" 
                stroke="#1e3a8a" strokeWidth={3} dot={false} activeDot={{ r: 6 }} 
                hide={hiddenSeries.includes('activa_tea')} // <--- OCULTAR SI ESTÁ EN LA LISTA
              />
              <Line 
                type="monotone" name="Activa TNA" dataKey="activa_tna" 
                stroke="#3b82f6" strokeWidth={3} dot={false} 
                hide={hiddenSeries.includes('activa_tna')} 
              />
              <Line 
                type="monotone" name="Activa TEM" dataKey="activa_tem" 
                stroke="#93c5fd" strokeWidth={2} strokeDasharray="5 5" dot={false} 
                hide={hiddenSeries.includes('activa_tem')} 
              />

              <Line 
                type="monotone" name="Pasiva TEA" dataKey="pasiva_tea" 
                stroke="#14532d" strokeWidth={3} dot={false} 
                hide={hiddenSeries.includes('pasiva_tea')} 
              />
              <Line 
                type="monotone" name="Pasiva TNA" dataKey="pasiva_tna" 
                stroke="#22c55e" strokeWidth={3} dot={false} 
                hide={hiddenSeries.includes('pasiva_tna')} 
              />

            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            No hay datos para el rango seleccionado.
          </div>
        )}
      </div>
      
      <p className="text-center text-xs text-slate-400">
        Hacé click en las leyendas para ocultar/mostrar series.
      </p>
    </div>
  );
}
