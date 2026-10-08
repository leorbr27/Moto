import { Pool } from "pg";

const ALLOW_ORIGIN = "https://leorbr27.github.io";
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

function cors() {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Prefer",
    "Access-Control-Max-Age": "86400"
  };
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors() }
  });
}
function err(message, status = 400) { return json({ message }, status); }
function idFrom(url) {
  const x = url.searchParams.get("id");
  return x && /^eq\.[0-9a-f-]{36}$/i.test(x) ? x.slice(3) : null;
}

export default {
  async fetch(request) {
    try {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
      const url = new URL(request.url);
      if (url.pathname === "/" || url.pathname === "") return json({ ok: true, service: "Moto API" });
      if (url.pathname !== "/abastecimentos") return err("Rota não encontrada.", 404);

      if (request.method === "GET") {
        const { rows } = await pool.query("SELECT id,data_abastecimento,quilometragem,litros,valor_total,preco_litro,combustivel,posto,observacoes,created_at,updated_at FROM public.abastecimentos ORDER BY data_abastecimento DESC,created_at DESC");
        return json(rows);
      }

      if (request.method === "POST") {
        const p = await request.json();
        for (const k of ["data_abastecimento","quilometragem","litros","valor_total","preco_litro","combustivel"]) {
          if (p[k] === undefined || p[k] === null || p[k] === "") return err("Campo obrigatório: " + k + ".");
        }
        const { rows } = await pool.query(
          "INSERT INTO public.abastecimentos (data_abastecimento,quilometragem,litros,valor_total,preco_litro,combustivel,posto,observacoes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
          [p.data_abastecimento, Number(p.quilometragem), Number(p.litros), Number(p.valor_total), Number(p.preco_litro), p.combustivel, p.posto ?? null, p.observacoes ?? null]
        );
        return json(rows, 201);
      }

      const id = idFrom(url);
      if (!id) return err("ID inválido ou ausente.");

      if (request.method === "PATCH") {
        const p = await request.json();
        const { rows } = await pool.query(
          "UPDATE public.abastecimentos SET data_abastecimento=$1,quilometragem=$2,litros=$3,valor_total=$4,preco_litro=$5,combustivel=$6,posto=$7,observacoes=$8,updated_at=now() WHERE id=$9 RETURNING *",
          [p.data_abastecimento, Number(p.quilometragem), Number(p.litros), Number(p.valor_total), Number(p.preco_litro), p.combustivel, p.posto ?? null, p.observacoes ?? null, id]
        );
        if (!rows.length) return err("Registro não encontrado.", 404);
        return json(rows);
      }

      if (request.method === "DELETE") {
        const { rows } = await pool.query("DELETE FROM public.abastecimentos WHERE id=$1 RETURNING id", [id]);
        if (!rows.length) return err("Registro não encontrado.", 404);
        return new Response(null, { status: 204, headers: cors() });
      }

      return err("Método não permitido.", 405);
    } catch (e) {
      console.error(e);
      return json({ message: e?.message || String(e) }, 500);
    }
  }
};