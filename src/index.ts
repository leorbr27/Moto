import { Pool } from "pg";
import { attachDatabasePool } from "@neon/functions";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});
attachDatabasePool(pool);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers });

const bad = (message: string, status = 400) => json({ error: message }, status);

async function body(request: Request) {
  try { return await request.json(); } catch { return null; }
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    const url = new URL(request.url);
    const path = url.pathname.replace(/^\\/+|\\/+$/g, "");
    const parts = path ? path.split("/") : [];

    try {
      if (request.method === "GET" && path === "health") {
        const r = await pool.query("SELECT now() AS server_time");
        return json({ ok: true, database: true, server_time: r.rows[0].server_time });
      }

      if (request.method === "GET" && path === "bootstrap") {
        const [vehicle, fuel, maintenance, expense] = await Promise.all([
          pool.query("SELECT * FROM public.moto_vehicle ORDER BY updated_at DESC LIMIT 1"),
          pool.query("SELECT * FROM public.moto_fuel ORDER BY km ASC"),
          pool.query("SELECT * FROM public.moto_maintenance ORDER BY km ASC"),
          pool.query("SELECT * FROM public.moto_expense ORDER BY entry_date ASC, created_at ASC"),
        ]);
        return json({
          vehicle: vehicle.rows[0] ?? null,
          fuel: fuel.rows,
          maint: maintenance.rows,
          exp: expense.rows,
        });
      }

      if (request.method === "POST" && path === "vehicle") {
        const b = await body(request);
        if (!b?.brand || !b?.model) return bad("Marca e modelo são obrigatórios.");
        await pool.query("DELETE FROM public.moto_vehicle");
        const r = await pool.query(
          `INSERT INTO public.moto_vehicle
          (brand, model, year_fabrication, year_model, plate, initial_km, fuel_type, notes)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [b.brand,b.model,b.yf,b.ym,b.plate||null,Number(b.ikm||0),b.ft||null,b.notes||null]
        );
        return json(r.rows[0], 201);
      }

      const collection = parts[0];
      const id = parts[1] || null;
      const tables: Record<string,string> = {
        fuel: "public.moto_fuel",
        maintenance: "public.moto_maintenance",
        expense: "public.moto_expense"
      };
      if (!tables[collection]) return bad("Endpoint não encontrado.", 404);

      if (request.method === "GET") {
        const r = await pool.query(`SELECT * FROM ${tables[collection]} ORDER BY created_at DESC`);
        return json(r.rows);
      }

      if (request.method === "DELETE" && id) {
        const r = await pool.query(`DELETE FROM ${tables[collection]} WHERE id=$1 RETURNING id`, [id]);
        if (!r.rowCount) return bad("Registro não encontrado.", 404);
        return json({ ok: true, id });
      }

      if (request.method === "POST") {
        const b = await body(request);
        let r;
        if (collection === "fuel") {
          const total=Number(b.total||0), pl=Number(b.pl||0);
          if (!b.date || !b.km || !total || !pl) return bad("Dados do abastecimento incompletos.");
          const previous=await pool.query("SELECT km, liters FROM public.moto_fuel ORDER BY km DESC LIMIT 1");
          const prev=previous.rows[0];
          const liters=total/pl;
          const distance=prev ? Number(b.km)-Number(prev.km) : null;
          const consumption=prev && liters ? distance/liters : null;
          r=await pool.query(
            `INSERT INTO public.moto_fuel
            (entry_date,km,total_amount,price_per_liter,liters,fuel_type,station,notes,distance_km,consumption_km_l)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [b.date,Number(b.km),total,pl,liters,b.type||null,b.station||null,b.notes||null,distance,consumption]
          );
        } else if (collection === "maintenance") {
          r=await pool.query(
            `INSERT INTO public.moto_maintenance
            (entry_date,km,item,price,maintenance_type,store,phone,next_km,next_date,notes)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [b.date,Number(b.km||0),b.item,Number(b.price||0),b.type||null,b.store||null,b.phone||null,b.nextKm?Number(b.nextKm):null,b.nextDate||null,b.notes||null]
          );
        } else {
          r=await pool.query(
            `INSERT INTO public.moto_expense
            (entry_date,km,category,price,description,notes)
            VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [b.date,Number(b.km||0),b.cat,b.price,b.desc,b.notes||null]
          );
        }
        return json(r.rows[0], 201);
      }

      if (request.method === "PUT" && id) {
        const b = await body(request);
        if (collection === "fuel") {
          const total=Number(b.total||0), pl=Number(b.pl||0), liters=total/pl;
          const r=await pool.query(
            `UPDATE public.moto_fuel SET entry_date=$1,km=$2,total_amount=$3,price_per_liter=$4,liters=$5,fuel_type=$6,station=$7,notes=$8,updated_at=now() WHERE id=$9 RETURNING *`,
            [b.date,Number(b.km),total,pl,liters,b.type||null,b.station||null,b.notes||null,id]
          );
          return r.rowCount ? json(r.rows[0]) : bad("Registro não encontrado.",404);
        }
        if (collection === "maintenance") {
          const r=await pool.query(
            `UPDATE public.moto_maintenance SET entry_date=$1,km=$2,item=$3,price=$4,maintenance_type=$5,store=$6,phone=$7,next_km=$8,next_date=$9,notes=$10,updated_at=now() WHERE id=$11 RETURNING *`,
            [b.date,Number(b.km||0),b.item,Number(b.price||0),b.type||null,b.store||null,b.phone||null,b.nextKm?Number(b.nextKm):null,b.nextDate||null,b.notes||null,id]
          );
          return r.rowCount ? json(r.rows[0]) : bad("Registro não encontrado.",404);
        }
        const r=await pool.query(
          `UPDATE public.moto_expense SET entry_date=$1,km=$2,category=$3,price=$4,description=$5,notes=$6,updated_at=now() WHERE id=$7 RETURNING *`,
          [b.date,Number(b.km||0),b.cat,b.price,b.desc,b.notes||null,id]
        );
        return r.rowCount ? json(r.rows[0]) : bad("Registro não encontrado.",404);
      }

      return bad("Método não suportado.",405);
    } catch (error) {
      console.error(error);
      return json({ error: "Erro interno no servidor." }, 500);
    }
  }
};
