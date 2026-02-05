import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Inicializar cliente (fuera del handler para reusar conexión si es posible)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tiempo de caché en segundos (12 horas = 43200 segundos)
const CACHE_TTL = 43200; 

export async function GET() {
  try {
    // 1. Buscar el registro más reciente ordenado por ID descendente
    const { data, error } = await supabase
      .from('historial_tasas')
      .select('datos, fecha_scraping')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    // 2. Preparar respuesta
    const responseData = {
      fecha_dato: data.fecha_scraping,
      ...data.datos // Desempaquetamos el JSON que guardó Python
    };

    // 3. Configurar Headers de Caché (CRÍTICO PARA TU PLAN GRATUITO)
    // s-maxage: Tiempo que vive en la CDN de Vercel (Público)
    // stale-while-revalidate: Si el dato es viejo, sirve el viejo y busca el nuevo en background
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=600`,
        'Access-Control-Allow-Origin': '*', // CORS: Permite que cualquiera use tu API
        'Access-Control-Allow-Methods': 'GET',
      },
    });

  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}