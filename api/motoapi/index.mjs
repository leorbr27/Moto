let sqlPromise;
async function sql(){
  if(!sqlPromise) sqlPromise=fetch('https://cdn.jsdelivr.net/npm/@neondatabase/serverless@1.0.2/index.mjs').then(r=>{if(!r.ok)throw new Error('Falha ao carregar driver Neon: '+r.status);return r.text()}).then(s=>import('data:text/javascript;base64,'+Buffer.from(s).toString('base64'))).then(m=>m.neon(process.env.DATABASE_URL));
  return sqlPromise;
}
function cors(){return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS','Access-Control-Allow-Headers':'Content-Type, Prefer','Access-Control-Max-Age':'86400'}}
function json(d,s=200){return new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json; charset=utf-8',...cors()}})}
function err(m,s=400){return json({message:m},s)}
function idFrom(u){const x=u.searchParams.get('id');return x&&/^eq\.[0-9a-f-]{36}$/i.test(x)?x.slice(3):null}
function nullableNumber(v){return v===''||v===null||v===undefined?null:Number(v)}
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
  if(path==='/despesas'){
   if(request.method==='GET')return json(await q`SELECT id,data_despesa,categoria,descricao,valor,quilometragem,observacoes,created_at,updated_at FROM public.moto_expense ORDER BY data_despesa DESC,created_at DESC`);
   if(request.method==='POST'){
    const p=await request.json();for(const k of ['data_despesa','categoria','descricao','valor'])if(p[k]===undefined||p[k]===null||p[k]==='')return err('Campo obrigatório: '+k+'.');
    return json(await q`INSERT INTO public.moto_expense(data_despesa,categoria,descricao,valor,quilometragem,observacoes) VALUES(${p.data_despesa},${p.categoria},${p.descricao},${Number(p.valor)},${nullableNumber(p.quilometragem)},${p.observacoes??null}) RETURNING id,data_despesa,categoria,descricao,valor,quilometragem,observacoes,created_at,updated_at`,201);
   }
   const id=idFrom(u);if(!id)return err('ID inválido ou ausente.');
   if(request.method==='PATCH'){
    const p=await request.json();const r=await q`UPDATE public.moto_expense SET data_despesa=${p.data_despesa},categoria=${p.categoria},descricao=${p.descricao},valor=${Number(p.valor)},quilometragem=${nullableNumber(p.quilometragem)},observacoes=${p.observacoes??null},updated_at=now() WHERE id=${id} RETURNING id,data_despesa,categoria,descricao,valor,quilometragem,observacoes,created_at,updated_at`;
    if(!r.length)return err('Registro não encontrado.',404);return json(r);
   }
   if(request.method==='DELETE'){const r=await q`DELETE FROM public.moto_expense WHERE id=${id} RETURNING id`;if(!r.length)return err('Registro não encontrado.',404);return new Response(null,{status:204,headers:cors()})}
  }
  if(path==='/manutencoes'||path==='/moto_maintenance'){
   if(request.method==='GET')return json(await q`SELECT id,entry_date,km,item,price,maintenance_type,store,phone,next_km,next_date,notes,created_at,updated_at FROM public.moto_maintenance ORDER BY entry_date DESC,created_at DESC`);
   if(request.method==='POST'){
    const p=await request.json();for(const k of ['entry_date','km','item','price'])if(p[k]===undefined||p[k]===null||p[k]==='')return err('Campo obrigatório: '+k+'.');
    return json(await q`INSERT INTO public.moto_maintenance(entry_date,km,item,price,next_km,store,phone,notes) VALUES(${p.entry_date},${Number(p.km)},${p.item},${Number(p.price)},${nullableNumber(p.next_km)},${p.store??null},${p.phone??null},${p.notes??null}) RETURNING id,entry_date,km,item,price,maintenance_type,store,phone,next_km,next_date,notes,created_at,updated_at`,201);
   }
   const id=idFrom(u);if(!id)return err('ID inválido ou ausente.');
   if(request.method==='PATCH'){
    const p=await request.json();const r=await q`UPDATE public.moto_maintenance SET entry_date=${p.entry_date},km=${Number(p.km)},item=${p.item},price=${Number(p.price)},next_km=${nullableNumber(p.next_km)},store=${p.store??null},phone=${p.phone??null},notes=${p.notes??null},updated_at=now() WHERE id=${id} RETURNING id,entry_date,km,item,price,maintenance_type,store,phone,next_km,next_date,notes,created_at,updated_at`;
    if(!r.length)return err('Registro não encontrado.',404);return json(r);
   }
   if(request.method==='DELETE'){const r=await q`DELETE FROM public.moto_maintenance WHERE id=${id} RETURNING id`;if(!r.length)return err('Registro não encontrado.',404);return new Response(null,{status:204,headers:cors()})}
  }
  return err('Rota não encontrada.',404);
 }catch(e){console.error(e);return json({message:e?.message||String(e)},500)}
}};