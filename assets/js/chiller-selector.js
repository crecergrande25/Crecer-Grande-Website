
document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('chiller-selector'),out=document.getElementById('chiller-result'); if(!form||!out)return;
 const ref={1000:'CWFL-1000',1500:'CWFL-1500',2000:'CWFL-2000',3000:'CWFL-3000',4000:'CWFL-4000',6000:'CWFL-6000'};
 form.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form).entries()),power=Number(d.power||0),type=d.type||'Fiber laser',circuits=d.circuits||'Unknown',supply=d.supply||'Unknown';let cls=power?`${(power/1000).toFixed(power%1000?1:0)} kW ${type.toLowerCase()} cooling class`:`${type} cooling system`;
  let reference=(d.brand==='TEYU / S&A'&&ref[power])?ref[power]:'';
  out.innerHTML=`<div class="subhead">Preliminary selection route</div><h3>${cls}</h3>${reference?`<span class="ref">Reference family: TEYU / S&A ${reference}</span>`:''}<p>This is a requirement-classification result, not a final chiller selection. The laser-source manufacturer's required coolant temperature, flow and pressure take priority.</p><ul><li>Cooling circuits requested: <b>${circuits}</b></li><li>Site electrical supply: <b>${supply}</b></li><li>Confirm laser source make/model and cutting/welding head cooling requirement.</li><li>Confirm coolant/water specification, ambient conditions, alarm/interlock needs and existing port sizes.</li></ul><a class="btn primary" href="/request-quote.html?requirement=${encodeURIComponent('Laser Chiller - '+cls)}&machine_model=${encodeURIComponent(d.machine||'')}&message=${encodeURIComponent(`Laser type: ${type}\nLaser power: ${power||'unknown'} W\nCircuits: ${circuits}\nElectrical: ${supply}\nPreferred/reference brand: ${d.brand||'Open'}\nExisting chiller: ${d.machine||'Not provided'}`)}">Send this requirement to CG →</a>`;
 });
});
