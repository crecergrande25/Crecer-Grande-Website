(()=>{
const mats=[
 ['7.93','Stainless Steel 304'],['7.98','Stainless Steel 316 / 316L'],['7.75','Stainless Steel 410'],['7.70','Stainless Steel 430'],
 ['7.85','Mild Steel / Carbon Steel'],['7.85','EN8 / C45 Steel'],['7.85','EN19 / 4140 Alloy Steel'],['7.85','Typical Tool Steel'],
 ['2.70','Aluminium 6061'],['2.68','Aluminium 5052'],['2.81','Aluminium 7075'],
 ['8.96','Copper'],['8.50','Brass'],['8.80','Bronze'],['7.20','Cast Iron'],['7.14','Zinc'],['4.43','Titanium Grade 5'],['8.90','Nickel'],['8.44','Inconel (typical)'],['11.34','Lead'],
 ['1.15','Nylon / PA (typical)'],['1.41','POM / Acetal (typical)'],['1.18','Acrylic / PMMA'],['0.95','HDPE (typical)'],['1.40','PVC (typical)'],
 ['custom','Custom material']
];
const num=id=>Number(document.getElementById(id)?.value||0); const qty=id=>Math.max(1,num(id)||1);
function materialMarkup(key){return `<label>Material<select data-mat-select="${key}">${mats.map(m=>`<option value="${m[0]}">${m[1]}${m[0]!=='custom'?` — ${m[0]} g/cm³`:''}</option>`).join('')}</select></label><label>Density (g/cm³)<input data-mat-density="${key}" type="number" value="7.93" min="0.01" step="0.001" readonly></label>`}
function sync(sel){const k=sel.dataset.matSelect,d=document.querySelector(`[data-mat-density="${k}"]`); if(!d)return; if(sel.value==='custom'){d.readOnly=false;if(!d.value)d.value='7.85'}else{d.value=sel.value;d.readOnly=true}}
function dens(k){return Number(document.querySelector(`[data-mat-density="${k}"]`)?.value||0)}
function kgFromMm3(v,d){return v*d/1e6}
const set=(id,html)=>{const e=document.getElementById(id);if(e)e.innerHTML=html};
function store(key,text){sessionStorage.setItem('cg_calc_'+key,text)}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-material-block]').forEach(x=>x.innerHTML=materialMarkup(x.dataset.materialBlock));
  document.querySelectorAll('[data-mat-select]').forEach(s=>{sync(s);s.addEventListener('change',()=>sync(s))});
  const pm=document.getElementById('print-material'),pd=document.getElementById('print-density');
  if(pm&&pd)pm.addEventListener('change',()=>{if(pm.value==='custom'){pd.readOnly=false}else{pd.value=pm.value;pd.readOnly=true}});

  const swap=document.getElementById('currency-swap');
  if(swap) swap.addEventListener('click',()=>{const a=document.getElementById('currency-from'),b=document.getElementById('currency-to');if(!a||!b)return;const x=a.value;a.value=b.value;b.value=x;});
  const convert=document.getElementById('currency-convert');
  if(convert) convert.addEventListener('click',convertCurrency);
});

async function convertCurrency(){
  const from=document.getElementById('currency-from')?.value||'INR';
  const to=document.getElementById('currency-to')?.value||'USD';
  const amount=Number(document.getElementById('currency-amount')?.value||0);
  const box=document.getElementById('currency-result');
  if(!box)return;
  if(!Number.isFinite(amount)||amount<0){box.textContent='Enter a valid amount.';return;}
  if(from===to){box.innerHTML=`<b>${amount.toLocaleString('en-IN')} ${from}</b> = <b>${amount.toLocaleString('en-IN')} ${to}</b><br><small>Same currency.</small>`;return;}
  box.textContent='Loading live reference rate…';
  try{
    const url=`https://api.frankfurter.dev/v2/rate/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;
    const r=await fetch(url,{headers:{'Accept':'application/json'}});
    if(!r.ok)throw new Error('Rate service unavailable');
    const d=await r.json();
    const rate=Number(d.rate);
    if(!Number.isFinite(rate))throw new Error('Invalid rate response');
    const converted=amount*rate;
    const date=d.date||'latest available working day';
    box.innerHTML=`<b>${amount.toLocaleString('en-IN',{maximumFractionDigits:4})} ${from}</b> ≈ <b>${converted.toLocaleString('en-IN',{maximumFractionDigits:4})} ${to}</b><br><small>1 ${from} = ${rate.toLocaleString('en-IN',{maximumFractionDigits:6})} ${to} • Reference date: ${date}</small>`;
    store('currency',`${amount} ${from} ≈ ${converted.toFixed(4)} ${to} at ${rate} (${date})`);
    if(window.CGTrack)window.CGTrack('estimate_used',{calculator:'currency',from,to});
  }catch(err){
    box.innerHTML='Live rate could not be loaded. Please check your internet connection and try again.<br><small>No rate is hard-coded in this calculator.</small>';
  }
}

document.addEventListener('click',e=>{const b=e.target.closest('[data-calc]');if(!b)return;const k=b.dataset.calc;let text='';
 if(k==='sheet'){const per=kgFromMm3(num('sheet-l')*num('sheet-w')*num('sheet-t'),dens('sheet'));const q=qty('sheet-q');text=`Sheet/plate: ${per.toFixed(4)} kg/pc; ${(per*q).toFixed(4)} kg total (${q} pcs)`;set('sheet-result',`Per piece: <b>${per.toFixed(4)} kg</b><br>Total: <b>${(per*q).toFixed(4)} kg</b>`)}
 if(k==='round'){const per=kgFromMm3(Math.PI*Math.pow(num('round-d'),2)/4*num('round-l'),dens('round'));const q=qty('round-q');text=`Round bar: ${per.toFixed(4)} kg/pc; ${(per*q).toFixed(4)} kg total (${q} pcs)`;set('round-result',`Per piece: <b>${per.toFixed(4)} kg</b><br>Total: <b>${(per*q).toFixed(4)} kg</b>`)}
 if(k==='pipe'){const od=num('pipe-od'),t=num('pipe-t'),id=Math.max(0,od-2*t),per=kgFromMm3(Math.PI*(od*od-id*id)/4*num('pipe-l'),dens('pipe')),q=qty('pipe-q');text=`Pipe/tube: ${per.toFixed(4)} kg/pc; ${(per*q).toFixed(4)} kg total (${q} pcs)`;set('pipe-result', t*2>=od?'Check wall thickness versus OD.':`ID: <b>${id.toFixed(2)} mm</b><br>Per piece: <b>${per.toFixed(4)} kg</b><br>Total: <b>${(per*q).toFixed(4)} kg</b>`)}
 if(k==='flat'){const per=kgFromMm3(num('flat-w')*num('flat-t')*num('flat-l'),dens('flat')),q=qty('flat-q');text=`Flat bar: ${per.toFixed(4)} kg/pc; ${(per*q).toFixed(4)} kg total (${q} pcs)`;set('flat-result',`Per piece: <b>${per.toFixed(4)} kg</b><br>Total: <b>${(per*q).toFixed(4)} kg</b>`)}
 if(k==='nest'){const sl=num('nest-sl'),sw=num('nest-sw'),pl=num('nest-pl'),pw=num('nest-pw'),g=num('nest-g');const count=(L,W,l,w)=>Math.max(0,Math.floor((L+g)/(l+g)))*Math.max(0,Math.floor((W+g)/(w+g)));const a=count(sl,sw,pl,pw),r=count(sl,sw,pw,pl),best=Math.max(a,r);text=`Rectangular nesting estimate: ${best} pcs/sheet (normal ${a}, rotated ${r})`;set('nest-result',`Estimated maximum: <b>${best} pcs/sheet</b><br>Normal: ${a} • Rotated: ${r}<br><small>Simple rectangular grid; excludes margins and irregular nesting.</small>`)}
 if(k==='bend'){const t=num('bend-t'),r=num('bend-r'),a=num('bend-a'),kf=num('bend-k'),ba=Math.PI/180*a*(r+kf*t);text=`Bend allowance: ${ba.toFixed(3)} mm at ${a}°, R${r}, t${t}, K=${kf}`;set('bend-result',`Bend allowance: <b>${ba.toFixed(3)} mm</b>`)}
 if(k==='print'){const d=num('print-density'),v=num('print-vol'),fill=num('print-fill')/100,q=qty('print-q'),allow=1+num('print-a')/100,total=v*d*fill*q*allow;text=`3D print material estimate: ${total.toFixed(1)} g total (${q} pcs)`;set('print-result',`Planning material: <b>${total.toFixed(1)} g</b><br><small>Before machine/slicer-specific corrections.</small>`)}
 if(k==='convert'){const v=num('conv-val'),t=document.getElementById('conv-type').value;let out=0,u='';if(t==='mm-in'){out=v/25.4;u='in'}if(t==='in-mm'){out=v*25.4;u='mm'}if(t==='kg-lb'){out=v*2.2046226218;u='lb'}if(t==='lb-kg'){out=v/2.2046226218;u='kg'}if(t==='bar-psi'){out=v*14.5037738;u='psi'}if(t==='psi-bar'){out=v/14.5037738;u='bar'}if(t==='c-f'){out=v*9/5+32;u='°F'}if(t==='f-c'){out=(v-32)*5/9;u='°C'}text=`${v} → ${out.toFixed(4)} ${u}`;set('convert-result',`Result: <b>${out.toFixed(4)} ${u}</b>`)}
 if(text)store(k,text);if(window.CGTrack)window.CGTrack('estimate_used',{calculator:k});
});

document.addEventListener('click',e=>{const b=e.target.closest('[data-rfq]');if(!b)return;const text=sessionStorage.getItem('cg_calc_'+b.dataset.rfq)||'Calculator result not yet generated.';const msg=encodeURIComponent(`Hello Crecer Grande, I used your ${b.dataset.rfq} calculator. Result: ${text}. I would like a review / quotation.`);window.open(`https://wa.me/916291001781?text=${msg}`,'_blank','noopener')});
})();
