import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Inicializar cliente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Función auxiliar para extraer valores anidados (ej: "tasas.activa_judicial.TNA")
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // 1. OBTENER PARÁMETROS
  const dateParam = searchParams.get('date'); // Formato YYYY-MM-DD
  const fieldParam = searchParams.get('field'); // Ej: tasas.activa_judicial.TNA

  try {
    let query = supabase
      .from('historial_tasas')
      .select('datos, fecha_scraping');

    // 2. LÓGICA DE FILTRADO POR FECHA
    if (dateParam) {
      // Si piden una fecha específica, buscamos esa
      // Nota: asume que fecha_scraping es tipo DATE o TIMESTAMP en Supabase
      // Si es timestamp, podría requerir ajustes (ej: .gte y .lt)
      query = query.eq('fecha_scraping', dateParam).limit(1);
    } else {
      // Si no hay fecha, traemos la última (comportamiento default)
      query = query.order('id', { ascending: false }).limit(1);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 es "no rows found"
       throw error;
    }

    if (!data) {
      return NextResponse.json({ error: 'No se encontraron datos para la fecha solicitada' }, { status: 404 });
    }

    // Desempaquetamos la data base
    let finalResponse = {
      fecha_dato: data.fecha_scraping,
      ...data.datos
    };

    // 3. LÓGICA DE SUBSET (EXTRAER SOLO UN CAMPO)
    if (fieldParam) {
      const subsetValue = getNestedValue(finalResponse, fieldParam);
      
      if (subsetValue === null) {
        return NextResponse.json({ error: `El campo '${fieldParam}' no existe en los datos.` }, { status: 400 });
      }

      // Devolvemos una respuesta simplificada
      finalResponse = {
        fecha_dato: data.fecha_scraping,
        campo_solicitado: fieldParam,
        valor: subsetValue
      };
    }

    // 4. RETORNAR RESPUESTA
    // Usamos caché diferente: si es una fecha histórica, cacheamos por mucho tiempo (1 año).
    // Si es "latest" (sin fecha), cacheamos poco tiempo.
    const cacheTime = dateParam ? 31536000 : 3600; // 1 año vs 1 hora

    return NextResponse.json(finalResponse, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${cacheTime}, stale-while-revalidate=600`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
