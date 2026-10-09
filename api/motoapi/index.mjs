const ALLOW_ORIGIN='https://leorbr27.github.io';
let sqlPromise;
async function sql(){
  if(!sqlPromise) sqlPromise=fetch('https://cdn.jsdelivr.net/npm/@neondatabase/serverless@1.0.2/index.mjs').then(r=>{if(!r.ok)throw new Error('Falha ao carregar driver Neon: '+r.status);return r.text()}).then(s=>import('data:text/javascript;base64,'+Buffer.from(s).toString('base64'))).then(m=>m.neon(process.env.DATABASE_URL));
  return sqlPromise;
}
function cors(){return {'Access-Control-Allow-Origin':ALLOW_ORIGIN,'Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS','Access-Control-Allow-Headers':'Content-Type, Prefer','Access-Control-Max-Age':'86400'}}
function json(d,s=200){return new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json; charset=utf-8',...cors()}})}
function err(m,s=400){return json({message:m},s)}
function idFrom(u){const x=u.searchParams.get('id');return x&&/^eq\.[0-9a-f-]{36}$/i.test(x)?x.slice(3):null}
async function ensureTables(q){
  await q`CREATE TABLE IF NOT EXISTS public.moto_expense (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data_despesa date NOT NULL,
    categoria text NOT NULL,
    descricao text NOT NULL,
    valor numeric(12,2) NOT NULL CHECK (valor >= 0),
    quilometragem integer,
    observacoes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await q`CREATE INDEX IF NOT EXISTS moto_expense_date_idx ON public.moto_expense (data_despesa DESC)`;
  await q`CREATE TABLE IF NOT EXISTS public.moto_maintenance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data_manutencao date NOT NULL,
    quilometragem integer NOT NULL DEFAULT 0,
    peca_servico text NOT NULL,
    preco numeric(12,2) NOT NULL DEFAULT 0,
    proxima_troca_km integer,
    loja text,
    telefone_loja text,
    observacoes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
}
export default {async fetch(request){
 try{
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors()});
  const u=new URL(request.url), path=u.pathname.replace(/\/$/,'')||'/';
  if(path==='/')return json({ok:true,service:'Moto API',routes:['/abastecimentos','/despesas','/manutencoes']});
  const q=await sql();
  if(path==='/abastecimentos'){
   if(request.method==='GET')return json(await q`SELECT id,data_abastecimento,quilometragem,litros,valor_total,preco_litro,combustivel,posto,observacoes,created_at,updated_at FROM public.abastecimentos ORDER BY data_abastecimento DESC,created_at DESC`);
   if(request.method==='POST'){const p=await request.json();for(const k of ['data_abastecimento','quilometragem','litros','valor_total','preco_litro','combustivel'])if(p[k]===undefined||p[k]===null||p[k]==='')return err('Campo obrigatório: '+k+'.');return json(await q`INSERT INTO public.abastecimentos (data_abastecimento,quilometragem,litros,valor_total,preco_litro,combustivel,posto,observacoes) VALUES (${p.data_abastecimento},${Number(p.quilometragem)},${Number(p.litros)},${Number(p.valor_total)},${Number(p.preco_litro)},${p.combustivel},${p.posto??null},${p.observacoes??null}) RETURNING *`,201)}
   const id=idFrom(u);if(!id)return err('ID inválido ou ausente.');
   if(request.method==='PATCH'){const p=await request.json();const r=await q`UPDATE public.abastecimentos SET data_abastecimento=${p.data_abastecimento},quilometragem=${Number(p.quilometragem)},litros=${Number(p.litros)},valor_total=${Number(p.valor_total)},preco_litro=${Number(p.preco_litro)},combustivel=${p.combustivel},posto=${p.posto??null},observacoes=${p.observacoes??null},updated_at=now() WHERE id=${id} RETURNING *`;if(!r.length)return err('Registro não encontrado.',404);return json(r)}
   if(request.method==='DELETE'){const r=await q`DELETE FROM public.abastecimentos WHERE id=${id} RETURNING id`;if(!r.length)return err('Registro não encontrado.',404);return new Response(null,{status:204,headers:cors()})}
  }
  if(path==='/despesas'||path==='/manutencoes'){
   await ensureTables(q);
   const expense=path==='/despesas', table=expense?'moto_expense':'moto_maintenance';
   if(request.method==='GET')return json(expense
    ?await q`SELECT * FROM public.moto_expense ORDER BY data_despesa DESC,created_at DESC`
    :await q`SELECT * FROM public.moto_maintenance ORDER BY data_manutencao DESC,created_at DESC`);
   if(request.method==='POST'){
    const p=await request.json();
    if(expense){
     for(const k of ['data_despesa','categoria','descricao','valor'])if(p[k]===undefined||p[k]===null||p[k]==='')return err('Campo obrigatório: '+k+'.');
     return json(await q`INSERT INTO public.moto_expense(data_despesa,categoria,descricao,valor,quilometragem,observacoes) VALUES(${p.data_despesa},${p.categoria},${p.descricao},${Number(p.valor)},${p.quilometragem===''||p.quilometragem==null?null:Number(p.quilometragem)},${p.observacoes??null}) RETURNING *`,201);
    }
    for(const k of ['data_manutencao','quilometragem','peca_servico','preco'])if(p[k]===undefined||p[k]===null||p[k]==='')return err('Campo obrigatório: '+k+'.');
    return json(await q`INSERT INTO public.moto_maintenance(data_manutencao,quilometragem,peca_servico,preco,proxima_troca_km,loja,telefone_loja,observacoes) VALUES(${p.data_manutencao},${Number(p.quilometragem)},${p.peca_servico},${Number(p.preco)},${p.proxima_troca_km===''||p.proxima_troca_km==null?null:Number(p.proxima_troca_km)},${p.loja??null},${p.telefone_loja??null},${p.observacoes??null}) RETURNING *`,201);
   }
   const id=idFrom(u);if(!id)return err('ID inválido ou ausente.');
   if(request.method==='PATCH'){
    const p=await request.json();
    const r=expense
     ?await q`UPDATE public.moto_expense SET data_despesa=${p.data_despesa},categoria=${p.categoria},descricao=${p.descricao},valor=${Number(p.valor)},quilometragem=${p.quilometragem===''||p.quilometragem==null?null:Number(p.quilometragem)},observacoes=${p.observacoes??null},updated_at=now() WHERE id=${id} RETURNING *`
     :await q`UPDATE public.moto_maintenance SET data_manutencao=${p.data_manutencao},quilometragem=${Number(p.quilometragem)},peca_servico=${p.peca_servico},preco=${Number(p.preco)},proxima_troca_km=${p.proxima_troca_km===''||p.proxima_troca_km==null?null:Number(p.proxima_troca_km)},loja=${p.loja??null},telefone_loja=${p.telefone_loja??null},observacoes=${p.observacoes??null},updated_at=now() WHERE id=${id} RETURNING *`;
    if(!r.length)return err('Registro não encontrado.',404);return json(r);
   }
   if(request.method==='DELETE'){
    const r=expense?await q`DELETE FROM public.moto_expense WHERE id=${id} RETURNING id`:await q`DELETE FROM public.moto_maintenance WHERE id=${id} RETURNING id`;
    if(!r.length)return err('Registro não encontrado.',404);return new Response(null,{status:204,headers:cors()});
   }
  }
  return err('Rota não encontrada.',404);
 }catch(e){console.error(e);return json({message:e?.message||String(e)},500)}
}};
