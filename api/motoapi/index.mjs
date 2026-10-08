import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const ALLOW_ORIGIN = 'https://leorbr27.github.io';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Prefer',
    'Access-Control-Max-Age': '86400',
  };
}
function json(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {'Content-Type':'application/json; charset=utf-8', ...corsHeaders()},
  });
}
function err(message, status=400) { return json({message}, status); }
function idFrom(url) {
  const id = url.searchParams.get('id');
  if (!id || !/^eq\.[0-9a-f-]{36}$/i.test(id)) return null;
  return id.slice(3);
}

export default {
  async fetch(request) {
    try {
      if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:corsHeaders()});
      const url = new URL(request.url);
      if (url.pathname === '/' || url.pathname === '') return json({ok:true, service:'Moto API'});
      if (url.pathname !== '/abastecimentos') return err('Rota não encontrada.', 404);

      if (request.method === 'GET') {
        const rows = await sql`SELECT id, data_abastecimento, quilometragem, litros, valor_total, preco_litro, combustivel, posto, observacoes, created_at, updated_at FROM public.abastecimentos ORDER BY data_abastecimento DESC, created_at DESC`;
        return json(rows);
      }

      if (request.method === 'POST') {
        const p = await request.json();
        for (const k of ['data_abastecimento','quilometragem','litros','valor_total','preco_litro','combustivel']) {
          if (p[k] === undefined || p[k] === null || p[k] === '') return err(`Campo obrigatório: ${k}.`);
        }
        const rows = await sql`INSERT INTO public.abastecimentos (data_abastecimento, quilometragem, litros, valor_total, preco_litro, combustivel, posto, observacoes) VALUES (${p.data_abastecimento}, ${Number(p.quilometragem)}, ${Number(p.litros)}, ${Number(p.valor_total)}, ${Number(p.preco_litro)}, ${p.combustivel}, ${p.posto ?? null}, ${p.observacoes ?? null}) RETURNING *`;
        return json(rows, 201);
      }

      const id = idFrom(url);
      if (!id) return err('ID inválido ou ausente.');

      if (request.method === 'PATCH') {
        const p = await request.json();
        const rows = await sql`UPDATE public.abastecimentos SET data_abastecimento=${p.data_abastecimento}, quilometragem=${Number(p.quilometragem)}, litros=${Number(p.litros)}, valor_total=${Number(p.valor_total)}, preco_litro=${Number(p.preco_litro)}, combustivel=${p.combustivel}, posto=${p.posto ?? null}, observacoes=${p.observacoes ?? null}, updated_at=now() WHERE id=${id} RETURNING *`;
        if (!rows.length) return err('Registro não encontrado.', 404);
        return json(rows);
      }

      if (request.method === 'DELETE') {
        const rows = await sql`DELETE FROM public.abastecimentos WHERE id=${id} RETURNING id`;
        if (!rows.length) return err('Registro não encontrado.', 404);
        return new Response(null, {status:204, headers:corsHeaders()});
      }

      return err('Método não permitido.', 405);
    } catch (e) {
      console.error(e);
      return json({message: e?.message || String(e)}, 500);
    }
  }
};
