
const D = window.SOLAR_DATA;
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
let LANG = localStorage.getItem('solar-lang') || 'en';
const T = k => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;
const fmt = n => Number(n).toLocaleString(LANG==='de'?'de-DE':'en-US');

const I18N = {
 en:{ overview:'Overview', map:'Spatial Map', analytics:'Analytics',
   crumb_pre:'Solar·München / ', brand_sub:'PV Potential Observatory',
   hero_tag:'ROOF-BY-ROOF ASSESSMENT', hero_h:'How much sun is<br>sleeping on these roofs?',
   hero_p:'A spatial photovoltaic audit of every qualified building in Maxvorstadt.',
   hero_u:'GWh / year unlockable',
   k_buildings:'buildings', k_panels:'panels', k_capacity:'capacity', k_per_year:'per year', k_homes:'homes',
   glance_k:'AT A GLANCE',
   lead:'Rooftops here hide <em>{gwh} GWh</em> a year — clean power for roughly <em>{homes} homes</em>.',
   m_eff:'median output density', m_eff_u:'kWh per m² of roof', m_top:'top 20% of roofs', m_top_u:'of all energy',
   m_avg:'average per roof', m_avg_u:'kWh / year', m_exc:'excellent roofs', m_exc_u:'> 10 MWh / year',
   map_k:'GEOSPATIAL', map_h:'Interactive Building Map',
   s_showing:'Showing', s_buildings:'buildings', s_output:'their output', s_of:'of', s_sample:'sampled roofs',
   sl_label:'Minimum annual output', lg_title:'Solar class',
   a_k:'DISTRIBUTION', a_h:'Six readings that actually mean something', read_t:'READING GUIDE',
   c_lorenz:'Inequality — Lorenz & Gini', w_lorenz:'How far the yield curve bows from perfect equality.',
   c_type:'Yield by building type', w_type:'Real OSM use-class, not roof area.',
   c_spatial:'Where the power lives', w_spatial:'Each dot a roof; brighter dots = higher annual yield.',
   c_dist:'Output distribution', w_dist:'The shape of the harvest — most roofs modest, a long tail of giants.',
   c_marg:'Marginal build-out', w_marg:'Cumulative capacity as you install the best roofs first.',
   c_top:'Top producers', w_top:'The rooftops worth a site visit tomorrow.',
   ax_roofs:'% of roofs', ax_output_pct:'% of total output', ax_type_x:'annual output (kWh)',
   ax_lon:'longitude', ax_lat:'latitude', ax_dist_x:'annual output (kWh)', ax_count:'buildings',
   ax_marg_x:'roofs installed (best first)', ax_marg_y:'cumulative capacity (MW)', ax_kwh:'kWh / year',
   cat_excellent:'Excellent', cat_moderate:'Moderate', cat_weak:'Weak',
   foot:'Data: OpenStreetMap · Radiation: EU PVGIS · Engine: Shapely + GeoPandas' },
 de:{ overview:'Übersicht', map:'Karte', analytics:'Analytik',
   crumb_pre:'Solar·München / ', brand_sub:'PV-Potenzial-Observatorium',
   hero_tag:'DACH-FÜR-DACH-ANALYSE', hero_h:'Wie viel Sonne schläft<br>auf diesen Dächern?',
   hero_p:'Ein räumliches Photovoltaik-Audit jedes qualifizierten Gebäudes in der Maxvorstadt.',
   hero_u:'GWh / Jahr erschließbar',
   k_buildings:'Gebäude', k_panels:'Module', k_capacity:'Leistung', k_per_year:'pro Jahr', k_homes:'Haushalte',
   glance_k:'AUF EINEN BLICK',
   lead:'Die Dächer hier verbergen <em>{gwh} GWh</em> pro Jahr — saubere Energie für rund <em>{homes} Haushalte</em>.',
   m_eff:'mittlere Ertragsdichte', m_eff_u:'kWh pro m² Dach', m_top:'oberste 20% der Dächer', m_top_u:'der gesamten Energie',
   m_avg:'Durchschnitt pro Dach', m_avg_u:'kWh / Jahr', m_exc:'exzellente Dächer', m_exc_u:'> 10 MWh / Jahr',
   map_k:'GEORÄUMLICH', map_h:'Interaktive Gebäudekarte',
   s_showing:'Anzeige', s_buildings:'Gebäude', s_output:'ihr Ertrag', s_of:'von', s_sample:'erfassten Dächern',
   sl_label:'Minimaler Jahresertrag', lg_title:'Solarklasse',
   a_k:'VERTEILUNG', a_h:'Sechs Lesarten, die wirklich etwas bedeuten', read_t:'LESEHILFE',
   c_lorenz:'Ungleichheit — Lorenz & Gini', w_lorenz:'Wie stark die Ertragskurve von der Gleichheit abweicht.',
   c_type:'Ertrag nach Gebäudetyp', w_type:'Echte OSM-Nutzungsklasse, nicht Dachfläche.',
   c_spatial:'Wo die Energie lebt', w_spatial:'Jeder Punkt ein Dach; hellere Punkte = höherer Jahresertrag.',
   c_dist:'Ertragsverteilung', w_dist:'Die Form der Ernte — die meisten Dächer moderat, ein langer Schwanz von Riesen.',
   c_marg:'Marginaler Ausbau', w_marg:'Kumulierte Leistung, wenn du zuerst die besten Dächer baust.',
   c_top:'Top-Erzeuger', w_top:'Die Dächer, die morgen einen Vor-Ort-Termin wert sind.',
   ax_roofs:'% der Dächer', ax_output_pct:'% des Gesamtertrags', ax_type_x:'Jahresertrag (kWh)',
   ax_lon:'Längengrad', ax_lat:'Breitengrad', ax_dist_x:'Jahresertrag (kWh)', ax_count:'Gebäude',
   ax_marg_x:'gebaute Dächer (beste zuerst)', ax_marg_y:'kumulierte Leistung (MW)', ax_kwh:'kWh / Jahr',
   cat_excellent:'Exzellent', cat_moderate:'Mittel', cat_weak:'Schwach',
   foot:'Daten: OpenStreetMap · Strahlung: EU PVGIS · Engine: Shapely + GeoPandas' }
};
const catName = k => T('cat_' + k);

function showView(name){
  $$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === name));
  $$('.nav button').forEach(b => b.classList.toggle('active', b.dataset.go === name));
  $('.crumb').innerHTML = T('crumb_pre') + '<b>' + T(name) + '</b>';
  if(name === 'map') setTimeout(initMap, 60);
  if(name === 'analytics'){ if(!window._charts) buildCharts(); else resizeAll(); }
}
$$('.nav button').forEach(b => b.onclick = () => showView(b.dataset.go));

const st = localStorage.getItem('solar-theme'); if(st) document.documentElement.dataset.theme = st;
$('#themeBtn').onclick = () => {
  const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = t; localStorage.setItem('solar-theme', t);
  if(window._map) setBasemap(); if(window._charts) restyleCharts();
};

function setLang(l){ LANG = l; localStorage.setItem('solar-lang', l);
  $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.l === l)); applyLang(); }
function applyLang(){
  document.documentElement.lang = LANG;
  $('.brand-sub').textContent = T('brand_sub');
  $$('.nav button').forEach(b => {
      // الحفاظ على الأيقونة وتحديث النص فقط
      const icon = b.querySelector('.nav-icon');
      b.innerHTML = '';
      b.appendChild(icon);
      b.appendChild(document.createTextNode(' ' + T(b.dataset.go)));
  });
  $('#heroTag').textContent = T('hero_tag'); $('#heroH').innerHTML = T('hero_h');
  $('#heroP').textContent = T('hero_p'); $('#heroU').textContent = T('hero_u');
  $('#glanceK').textContent = T('glance_k');
  $('#leadTxt').innerHTML = T('lead').replace('{gwh}', fmt(D.kpis[3].value)).replace('{homes}', fmt(D.kpis[4].value));
  $('#mEffK').textContent = T('m_eff'); $('#mEffU').textContent = T('m_eff_u');
  $('#mTopK').textContent = T('m_top'); $('#mTopU').textContent = T('m_top_u');
  $('#mAvgK').textContent = T('m_avg'); $('#mAvgU').textContent = T('m_avg_u');
  $('#mExcK').textContent = T('m_exc'); $('#mExcU').textContent = T('m_exc_u');
  $('#mapK').textContent = T('map_k'); $('#mapH').textContent = T('map_h');
  $('#slLabel').childNodes[0].nodeValue = T('sl_label') + ' '; $('#lgTitle').textContent = T('lg_title');
  $('#aK').textContent = T('a_k'); $('#aH').textContent = T('a_h'); $('#readT').textContent = T('read_t');
  $$('.ct[data-t]').forEach(e => e.textContent = T(e.dataset.t));
  $$('.cw[data-w]').forEach(e => e.textContent = T(e.dataset.w));
  $('#sShowing').textContent = T('s_showing'); $('#sBld').textContent = T('s_buildings');
  $('#sOutLbl').textContent = T('s_output'); $('#sOf').textContent = T('s_of'); $('#sSample').textContent = T('s_sample');
  renderKpis(); renderLegend(); renderGuide();
  if(window._charts){ window._charts = null; buildCharts(); }
  if(window._map) refreshMapStats();
}

function countUp(el){
  const target = +el.dataset.target, suf = el.dataset.suffix || '', dur = 1400, t0 = performance.now();
  (function tick(now){ const p = Math.min((now-t0)/dur,1), e = 1-Math.pow(1-p,3);
    el.textContent = fmt(Math.floor(target*e)) + suf;
    if(p<1) requestAnimationFrame(tick); else el.textContent = fmt(target) + suf; })(t0);
}
function renderKpis(){
  $('#kpiRow').innerHTML = D.kpis.map(k =>
    `<div class="kpi" data-a="${k.accent}"><div class="stripe"></div><div class="ico">${k.ico}</div>
     <div class="num mono" data-target="${k.value}" data-suffix="${k.suffix}">0</div>
     <div class="lbl">${T('k_'+k.label)}</div></div>`).join('');
  $$('#kpiRow .num').forEach(countUp);
}

function cols(){ const light = document.documentElement.dataset.theme === 'light';
  return {text: light?'#1a1714':'#f2ede4', grid: light?'rgba(0,0,0,0.07)':'rgba(255,255,255,0.07)'}; }
const base = () => { const c = cols();
  return {paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
    font:{color:c.text, family:'DM Sans', size:13}, margin:{l:50,r:16,t:12,b:44},
    xaxis:{gridcolor:c.grid, zeroline:false, tickfont:{size:12.5}, titlefont:{size:13}},
    yaxis:{gridcolor:c.grid, zeroline:false, tickfont:{size:12.5}, titlefont:{size:13}}}; };
const CFG = {responsive:true, displayModeBar:false};
const SCALE = [[0,'#4fb0a8'],[0.5,'#f5a623'],[1,'#e8632a']];

function buildCharts(){
  const L = base();
  // (1) LORENZ + GINI
  Plotly.newPlot('pLor',[{x:D.lorenz.x, y:D.lorenz.y, type:'scatter', mode:'lines', fill:'tozeroy', showlegend:false,
     line:{color:'#f5a623', width:2.6}, fillcolor:'rgba(245,166,35,0.13)',
     hovertemplate:'%{x:.0f}% '+T('ax_roofs')+' → %{y:.0f}% '+T('ax_output_pct')+'<extra></extra>'}],
    {...L, xaxis:{...L.xaxis, title:T('ax_roofs'), range:[0,100]}, yaxis:{...L.yaxis, title:T('ax_output_pct'), range:[0,100]},
     shapes:[{type:'line', x0:0, y0:0, x1:100, y1:100, line:{color:'rgba(155,147,132,0.5)', width:1.4, dash:'dot'}}],
     annotations:[{x:62, y:24, text:'Gini = '+D.gini, showarrow:false, font:{size:17, color:'#e8632a', family:'Space Grotesk'}}]}, CFG);
  // (2) BY BUILDING TYPE
  if(D.by_type.length){
    const bt = D.by_type.slice().reverse();
    Plotly.newPlot('pType',[{x:bt.map(b=>b.output), y:bt.map(b=>b.type), type:'bar', orientation:'h', showlegend:false,
      marker:{color:bt.map((_,i)=>i), colorscale:SCALE, showscale:false},
      hovertemplate:'%{y}<br>%{x:,} '+T('ax_kwh')+'<extra></extra>'}],
      {...L, xaxis:{...L.xaxis, title:T('ax_type_x')}, yaxis:{...L.yaxis, automargin:true, tickfont:{size:12.5}}, margin:{...L.margin, l:96}}, CFG);
  } else { $('#pType').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--faint);font-size:13px">building-type tags unavailable</div>'; }
  // (3) SPATIAL DENSITY
  Plotly.newPlot('pSpa',[{x:D.spatial.lon, y:D.spatial.lat, mode:'markers', type:'scatter', showlegend:false,
    marker:{color:D.spatial.out, colorscale:SCALE, size:5, opacity:0.72, colorbar:{thickness:8, len:0.6, tickfont:{size:10}, outlinewidth:0}},
    hovertemplate:'%{y:.3f}, %{x:.3f}<br>%{marker.color:,} '+T('ax_kwh')+'<extra></extra>'}],
    {...L, xaxis:{...L.xaxis, title:T('ax_lon'), tickformat:'.2f'}, yaxis:{...L.yaxis, title:T('ax_lat'), tickformat:'.2f', scaleanchor:'x'}}, CFG);
  // (4) DISTRIBUTION + median + threshold
  Plotly.newPlot('pDist',[{x:D.hist.bins, y:D.hist.counts, type:'bar', showlegend:false, marker:{color:'#4fb0a8'},
    hovertemplate:'~%{x:,} '+T('ax_kwh')+'<br>%{y} '+T('ax_count')+'<extra></extra>'}],
    {...L, xaxis:{...L.xaxis, title:T('ax_dist_x')}, yaxis:{...L.yaxis, title:T('ax_count')},
     shapes:[{type:'line', x0:D.median_out, x1:D.median_out, y0:0, y1:1, yref:'paper', line:{color:'#f5a623', width:1.8, dash:'dash'}},
             {type:'line', x0:D.excellent_thr, x1:D.excellent_thr, y0:0, y1:1, yref:'paper', line:{color:'#e8632a', width:1.8, dash:'dash'}}],
     annotations:[{x:D.median_out, y:1, yref:'paper', text:'median', showarrow:false, yanchor:'bottom', font:{size:11, color:'#f5a623'}},
                  {x:D.excellent_thr, y:1, yref:'paper', text:'excellent', showarrow:false, yanchor:'bottom', font:{size:11, color:'#e8632a'}}]}, CFG);
  // (5) MARGINAL BUILD-OUT
  Plotly.newPlot('pMarg',[{x:D.marginal.x, y:D.marginal.y, type:'scatter', mode:'lines', fill:'tozeroy', showlegend:false,
    line:{color:'#4fb0a8', width:2.4}, fillcolor:'rgba(79,176,168,0.12)',
    hovertemplate:'%{x:,} roofs → %{y} MW<extra></extra>'}],
    {...L, xaxis:{...L.xaxis, title:T('ax_marg_x')}, yaxis:{...L.yaxis, title:T('ax_marg_y')},
     annotations:[{x:D.marginal_note.n, y:D.marginal_note.mw, text:'top 10% → '+D.marginal_note.mw+' MW',
       showarrow:true, arrowcolor:'#e8632a', arrowhead:2, ax:34, ay:-26, font:{size:12, color:'#e8632a', family:'Space Grotesk'}}]}, CFG);
  // (6) TOP PRODUCERS
  const t10 = D.top.slice(0,10);
  Plotly.newPlot('pTop',[{x:t10.map(t=>t.output_kwh), y:t10.map((_,i)=>'#'+(i+1)), type:'bar', orientation:'h', showlegend:false,
    marker:{color:'#e8632a'}, hovertemplate:'#%{y}<br>%{x:,} '+T('ax_kwh')+'<extra></extra>'}],
    {...L, xaxis:{...L.xaxis, title:T('ax_kwh')}, yaxis:{...L.yaxis, autorange:'reversed'}, margin:{...L.margin, l:34}}, CFG);
  window._charts = true; observeResize();
}

// ✅ دالة إعادة تعيين الشارتات
function resetCharts() {
    const btn = $('#resetChartsBtn');
    if(!btn) return;
    btn.classList.add('resetting');

    const ids = ['pLor','pType','pSpa','pDist','pMarg','pTop'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el && el.data) {
            Plotly.relayout(el, {
                'xaxis.autorange': true,
                'yaxis.autorange': true,
                'xaxis.range': null,
                'yaxis.range': null
            });
        }
    });

    setTimeout(() => btn.classList.remove('resetting'), 600);
}

function restyleCharts(){ ['pLor','pType','pSpa','pDist','pMarg','pTop'].forEach(id=>{const e=document.getElementById(id); if(e&&e.data) Plotly.relayout(e, base());}); }
function resizeAll(){ ['pLor','pType','pSpa','pDist','pMarg','pTop'].forEach(id=>{const e=document.getElementById(id); if(e&&e.data) Plotly.Plots.resize(e);}); }
let _ro; function observeResize(){ if(_ro) return; _ro = new ResizeObserver(()=>{ if($('.view[data-view=analytics]').classList.contains('active')) resizeAll(); });
  $$('.cell .plot').forEach(p=>_ro.observe(p)); }

function renderGuide(){
  $('#readList').innerHTML = D.guide.map(g => {
    const o = g[LANG] || g.en; let txt = o.x;
    if(g.v !== '' && g.v !== undefined) txt = txt.replace('{v}', fmt(g.v));
    txt = txt.replace('{n}', fmt(D.marginal_note.n)).replace('{mw}', D.marginal_note.mw);
    return `<div class="it"><div class="ic">${g.icon}</div><div><div class="tt">${o.t}</div><div class="xx">${txt}</div></div></div>`;
  }).join('');
}
function renderLegend(){
  $('#legend').innerHTML = '<div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:6px">'+T('lg_title')+'</div>' +
    D.categories.map(c => `<div class="li"><span class="sw" style="background:${c.color}"></span>${catName(c.key)}<b>${fmt(c.count)}</b></div>`).join('');
}

let _geoLayer, _sliderMax;
const darkTiles  = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:19,attribution:'&copy; OSM &copy; CARTO'});
const lightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:19,attribution:'&copy; OSM &copy; CARTO'});
function setBasemap(){ const light = document.documentElement.dataset.theme==='light';
  if(window._map){ window._map.eachLayer(l=>{ if(l._url && l._url.includes('basemaps.cartocdn')) window._map.removeLayer(l);}); (light?lightTiles:darkTiles).addTo(window._map); } }
function initMap(){
  if(window._map){ window._map.invalidateSize(); return; }
  const m = L.map('map',{zoomControl:false}).setView([48.148,11.566],14);
  window._map = m; setBasemap(); L.control.zoom({position:'bottomright'}).addTo(m);
  _sliderMax = Math.max(...window.BUILDINGS.features.map(f=>f.properties.o));
  _geoLayer = L.geoJSON(window.BUILDINGS, {
    style: f => { const c = D.cat_colors[f.properties.c]; return {color:c, weight:.6, fillColor:c, fillOpacity:.55}; },
    onEachFeature: (f, layer) => {
      layer.bindTooltip(`<b>${catName(f.properties.c)}</b><br>${fmt(f.properties.o)} kWh/yr`, {sticky:true, direction:'top'});
      layer.on('mouseover', e => e.target.setStyle({weight:2.2, fillOpacity:.85}));
      layer.on('mouseout',  e => _geoLayer.resetStyle(e.target));
    }
  }).addTo(m);
  try{ m.fitBounds(_geoLayer.getBounds(), {padding:[30,30]}); }catch(e){}
  const sl = $('#slider'); sl.max = _sliderMax; sl.value = 0; sl.step = Math.max(50, Math.round(_sliderMax/200));
  sl.oninput = () => applySlider(+sl.value);
  $('#baseBtn').onclick = () => { document.documentElement.dataset.theme = document.documentElement.dataset.theme==='light'?'dark':'light'; localStorage.setItem('solar-theme',document.documentElement.dataset.theme); setBasemap(); if(window._charts) restyleCharts(); };
  $('#fitBtn').onclick = () => m.fitBounds(_geoLayer.getBounds(), {padding:[30,30]});
  applySlider(0);
}
function applySlider(min){
  $('#slVal').textContent = fmt(min) + ' kWh'; let n=0, sum=0;
  _geoLayer.eachLayer(l => { const o = l.feature.properties.o, on = o >= min;
    l.setStyle({fillOpacity: on?.55:.04, opacity: on?1:.12, weight: on?.6:.2}); if(on){ n++; sum += o; } });
  $('#stN').textContent = fmt(n); $('#stOut').textContent = fmt(Math.round(sum/1000)) + ' MWh';
}
function refreshMapStats(){ if($('#slider')) applySlider(+$('#slider').value); }

$$('.lang button').forEach(b => b.onclick = () => setLang(b.dataset.l));
// ✅ ربط زر الـ Reset بالدالة
$('#resetChartsBtn').onclick = resetCharts;

renderKpis(); renderLegend(); renderGuide();
$('#heroNum').textContent = fmt(D.kpis[3].value);
$('#mEffV').textContent = D.glance.eff; $('#mTopV').textContent = D.glance.top20 + '%';
$('#mAvgV').textContent = D.glance.avg; $('#mExcV').textContent = D.glance.exc + '%';
setLang(LANG); showView('overview');
