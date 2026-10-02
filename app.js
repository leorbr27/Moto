const KEY="moto_v2";
const API="https://br-noisy-resonance-b594p7s8-api.compute.c-7.us-east-2.aws.neon.tech";
const empty={vehicle:null,fuel:[],maint:[],exp:[]};
let db={vehicle:null,fuel:[],maint:[],exp:[]};
let legacy=empty;
try{legacy=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem("moto_v1"))||empty}catch(e){}
function save(){}
function today(){return new Date().toISOString().slice(0,10)}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function money(n){return Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
function dateBR(s){return s?new Date(s+"T12:00:00").toLocaleDateString("pt-BR"):"—"}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function currentKm(){return Math.max(db.vehicle?.ikm||0,...db.fuel.map(x=>+x.km||0),...db.maint.map(x=>+x.km||0),...db.exp.map(x=>+x.km||0))}
function toast(s){const x=document.getElementById("toast");if(!x)return;x.textContent=s;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1600)}
function nav(active){document.querySelectorAll(".nav a").forEach(a=>a.classList.toggle("on",a.dataset.p===active))}
function fuelFromApi(x){return{id:x.id,date:x.entry_date,km:+x.km,total:+x.total_amount,pl:+x.price_per_liter,liters:+x.liters,type:x.fuel_type||"",station:x.station||"",notes:x.notes||"",distance:x.distance_km==null?null:+x.distance_km,consumption:x.consumption_km_l==null?null:+x.consumption_km_l}}
function maintFromApi(x){return{id:x.id,date:x.entry_date,km:+x.km,item:x.item,price:+x.price,type:x.maintenance_type||"",store:x.store||"",phone:x.phone||"",nextKm:x.next_km==null?null:+x.next_km,nextDate:x.next_date||"",notes:x.notes||""}}
function expFromApi(x){return{id:x.id,date:x.entry_date,km:+x.km,cat:x.category,price:+x.price,desc:x.description,notes:x.notes||""}}
function vehicleFromApi(x){return x?{brand:x.brand,model:x.model,yf:+x.year_fabrication,ym:+x.year_model,plate:x.plate||"",ikm:+x.initial_km,ft:x.fuel_type||"Gasolina",notes:x.notes||""}:null}
async function api(path,options={}){const r=await fetch(API+"/"+path,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||"Falha na API");return data}
async function migrateLocal(local){
  if(local.vehicle){const r=await api("vehicle",{method:"POST",body:JSON.stringify(local.vehicle)});db.vehicle=vehicleFromApi(r)}
  for(const x of local.fuel){const r=await api("fuel",{method:"POST",body:JSON.stringify(x)});db.fuel.push(fuelFromApi(r))}
  for(const x of local.maint){const r=await api("maintenance",{method:"POST",body:JSON.stringify(x)});db.maint.push(maintFromApi(r))}
  for(const x of local.exp){const r=await api("expense",{method:"POST",body:JSON.stringify(x)});db.exp.push(expFromApi(r))}
}
async function loadRemote(){
  try{
    const remote=await api("bootstrap");
    const hasRemote=!!remote.vehicle||remote.fuel.length||remote.maint.length||remote.exp.length;
    const hasLegacy=!!legacy.vehicle||legacy.fuel.length||legacy.maint.length||legacy.exp.length;
    if(!hasRemote&&hasLegacy){db={vehicle:null,fuel:[],maint:[],exp:[]};await migrateLocal(legacy)}
    else db={vehicle:vehicleFromApi(remote.vehicle),fuel:remote.fuel.map(fuelFromApi),maint:remote.maint.map(maintFromApi),exp:remote.exp.map(expFromApi)};
    localStorage.removeItem(KEY);localStorage.removeItem("moto_v1");
    window.dispatchEvent(new CustomEvent("moto:ready"));return true
  }catch(e){console.error("Neon:",e);window.dispatchEvent(new CustomEvent("moto:error",{detail:e}));return false}
}
async function saveVehicle(v){const r=await api("vehicle",{method:"POST",body:JSON.stringify(v)});db.vehicle=vehicleFromApi(r)}
async function createFuel(v){const r=await api("fuel",{method:"POST",body:JSON.stringify(v)});const x=fuelFromApi(r);db.fuel.push(x);db.fuel.sort((a,b)=>a.km-b.km);return x}
async function createMaintenance(v){const r=await api("maintenance",{method:"POST",body:JSON.stringify(v)});const x=maintFromApi(r);db.maint.push(x);db.maint.sort((a,b)=>a.km-b.km);return x}
async function createExpense(v){const r=await api("expense",{method:"POST",body:JSON.stringify(v)});const x=expFromApi(r);db.exp.push(x);return x}
async function del(type,id){if(!confirm("Excluir este registro?"))return;const endpoint=type==="fuel"?"fuel":type==="maint"?"maintenance":"expense";try{await api(endpoint+"/"+encodeURIComponent(id),{method:"DELETE"});db[type]=db[type].filter(x=>x.id!==id);location.reload()}catch(e){toast("Não foi possível excluir")}}
loadRemote();
