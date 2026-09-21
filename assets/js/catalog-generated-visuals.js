(() => {
  'use strict';
  const cutting=['raytools-bm111', 'raytools-bm110', 'raytools-bm114', 'raytools-bt240s', 'precitec-procutter-2', 'precitec-procutter-prime', 'precitec-procutter-zoom', 'precitec-procutter-thunder', 'precitec-minicutter', 'precitec-solidcutter', 'wsx-cutting-head', 'boci-cutting-head', 'ospri-cutting-head', 'au3tech-cutting-head'];
  const other=['co2-laser-tube', 'co2-psu', 'znse-focus-lens', 'co2-mirror', 'co2-mirror-mount', 'co2-head-nozzle', 'co2-motion', 'co2-controller', 'welding-nozzle', 'welding-protective-lens', 'welding-ceramic', 'wire-feeder-spare', 'cleaning-head-consumable'];
  window.CG_GENERATED_VISUAL_CLASS=(slug)=>{
    const key=String(slug||'').trim();
    if(cutting.includes(key)) return `cg-generated-visual cg-gen-cut cg-gen-${key}`;
    if(other.includes(key)) return `cg-generated-visual cg-gen-other cg-gen-${key}`;
    return '';
  };
})();