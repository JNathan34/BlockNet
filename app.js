/* BlockNet Pro dashboard demo. All data is simulated in the browser.
   This file deliberately contains no remote API calls or real DNS management. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const icon = (name, extra = '') => `<svg class="ico ${extra}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const fmt = (n) => Math.max(0, Math.round(n)).toLocaleString('en-GB');
  const bounded = (n, a, b) => Math.max(a, Math.min(b, n));
  const random = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const safe = (s) => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const hourFormat = new Intl.DateTimeFormat('en-GB', {hour: '2-digit', minute: '2-digit', hour12: false});
  const timeString = (date = new Date()) => hourFormat.format(date);
  const readJSON = (key, fallback) => { try { const result = JSON.parse(localStorage.getItem(key)); return result === null ? fallback : result; } catch { return fallback; } };

  const modelProfiles = {
    mini: {label:'Mini',kind:'basic',queries:12438,blocked:2931,threats:0,devices:5,firmware:'v1.0.3',ip:'192.168.1.2',dns:'ESP32-C3 open-source firmware',network:'HomeWiFi',connection:'2.4 GHz Wi-Fi',lists:1,domains:18320,subtitle:'Simple. Private. A Cleaner Internet for Your Network.'},
    lite: {label:'Lite',kind:'basic',queries:12438,blocked:2931,threats:0,devices:5,firmware:'v1.0.3',ip:'192.168.1.3',dns:'Pi-hole DNS engine',network:'Wired Ethernet',connection:'Ethernet',lists:6,domains:1243785,subtitle:'Simple. Private. A Cleaner Internet for Your Network.'},
    home: {label:'Home',kind:'advanced',queries:42593,blocked:9241,threats:178,devices:12,firmware:'v2.0.0',ip:'192.168.1.4',dns:'Pi-hole DNS engine',network:'Wired Ethernet',connection:'Ethernet',lists:7,domains:1243785,subtitle:'Advanced Network Protection. Greater Control. Deeper Insights.'},
    pro: {label:'Pro',kind:'advanced',queries:52318,blocked:14293,threats:312,devices:12,firmware:'v2.1.0',ip:'192.168.1.5',dns:'Pi-hole DNS engine',network:'Wired Ethernet',connection:'Ethernet',lists:8,domains:1243785,subtitle:'Advanced Network Protection. Greater Control. Deeper Insights.'},
  };
  const storedModel = readJSON('blocknet-demo-model','pro');
  const initialModel = Object.hasOwn(modelProfiles,storedModel)?storedModel:'pro';
  const deviceBlueprints = [
    ['Living Room TV','tv','192.168.1.101',12482,3921],
    ['MacBook Pro','laptop','192.168.1.102',8341,1203],
    ['iPhone 15','phone','192.168.1.103',6892,2441],
    ['Windows PC','monitor','192.168.1.104',5421,1012],
    ['iPad','phone','192.168.1.105',4218,892],
    ['Galaxy S24','phone','192.168.1.106',3614,1056],
    ['Office Laptop','laptop','192.168.1.107',3267,710],
    ['Gaming Console','tv','192.168.1.108',2563,650],
    ['Smart Speaker','server','192.168.1.109',1987,598],
    ['Kitchen Display','monitor','192.168.1.110',1437,503],
    ['Security Camera','server','192.168.1.111',1153,319],
    ['Printer','server','192.168.1.112',943,222],
  ];
  const baseDomains = [
    ['pagead2.googlesyndication.com',3482],['doubleclick.net',2941],
    ['google-analytics.com',1827],['googletagmanager.com',1644],
    ['media.facebook.com',1203],['app-measurement.com',892],
    ['tracking.example.com',743],['ads.tiktok.com',621],
    ['bing.com',518],['youtube.com',496]
  ];
  const eventPool = [
    ['malwarecdn.info','Threat','block'],['phishing-site.net','Phishing','block'],
    ['cryptominer.org','Cryptominer','block'],['bad-ads.com','Ads','block'],
    ['tracker.example','Tracking','block'],['suspicious-domain.ru','Threat','block'],
    ['api.github.com','Allowed','allow'],['exploit-kit.net','Threat','block'],
    ['updates.microsoft.com','Allowed','allow'],['doubleclick.net','Ads','block'],
    ['google-analytics.com','Tracking','block'],['cloudflare.com','Allowed','allow'],
    ['apple.com','Allowed','allow'],['ads.tiktok.com','Ads','block'],
    ['example.org','Allowed','allow'],['pagead2.googlesyndication.com','Ads','block']
  ];
  const filterBlueprints = [
    {id:'ads',name:'Block Ads & Trackers',desc:'Block known advertising and tracking domains.',icon:'ban'},
    {id:'malware',name:'Malware Protection',desc:'Filter domains associated with malware distribution.',icon:'shield'},
    {id:'phishing',name:'Phishing Protection',desc:'Protect against known phishing destinations.',icon:'lock'},
    {id:'social',name:'Social Media Filters',desc:'Block selected social-media tracking domains.',icon:'globe'},
    {id:'adult',name:'Adult Content Filter',desc:'Filter domains on adult-content blocklists.',icon:'filter'},
  ];
  const storedPolicies = readJSON('blocknet-demo-policies', {});
  const storedRules = readJSON('blocknet-demo-rules', null);
  const defaultRules = [
    {id:'r1',domain:'ads.example.net',type:'block'},
    {id:'r2',domain:'telemetry.example.org',type:'block'},
    {id:'r3',domain:'trusted.example.com',type:'allow'}
  ];
  const initialChartBlocked = [2250,2750,3350,2850,2350,2450,3050,2800,3450,3130,4200,5100,4300,3510,3780,3370,3950,4890,4140,4450,4250,4880,3970,3580];
  const initialChartAllowed = [1130,1360,1710,1380,1220,1300,1650,1530,1810,1650,2090,2250,2530,2100,1760,1830,1680,1960,2260,2440,2070,2310,1800,1660];
  const makeState = (model=initialModel) => ({
    model,page:'overview',queries:modelProfiles[model].queries,blocked:modelProfiles[model].blocked,threats:modelProfiles[model].threats,online:true,
    live:readJSON('blocknet-demo-live',true),
    theme:readJSON('blocknet-demo-theme','light'),
    lastCheck:new Date(),
    chartAllowed:[...initialChartAllowed], chartBlocked:[...initialChartBlocked],
    devices:deviceBlueprints.slice(0,modelProfiles[model].devices).map((d,i)=>({id:`d${i}`,name:d[0],kind:d[1],ip:d[2],queries:modelProfiles[model].kind==='basic'?Math.floor(d[3]*0.55):d[3],blocked:modelProfiles[model].kind==='basic'?Math.floor(d[4]*0.55):d[4],filtering:true})),
    domains:baseDomains.map(([name,count])=>({name,count})),
    filters:filterBlueprints.map(f=>({...f,enabled:typeof storedPolicies[f.id]==='boolean'?storedPolicies[f.id]:true})),
    customRules:Array.isArray(storedRules)?storedRules:defaultRules,
    events:[],selectedDevice:null
  });
  let state = makeState();
  let toastTimeout;
  const toast = message => {
    const target=$('#toast');target.textContent=message;target.classList.add('visible');
    clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>target.classList.remove('visible'),3000);
  };
  function persist(){
    try{
      localStorage.setItem('blocknet-demo-policies', JSON.stringify(Object.fromEntries(state.filters.map(f=>[f.id,f.enabled]))));
      localStorage.setItem('blocknet-demo-rules',JSON.stringify(state.customRules));
      localStorage.setItem('blocknet-demo-theme',JSON.stringify(state.theme));
      localStorage.setItem('blocknet-demo-live',JSON.stringify(state.live));
      localStorage.setItem('blocknet-demo-model',JSON.stringify(state.model));
    }catch{/* The demo still runs in browsers that block storage. */}
  }
  function setPage(page){
    const p = modelProfiles[state.model];
    if(p.kind==='basic' && (page==='security'||page==='reports')) page='overview';
    if(!$('#page-'+page)) return;
    state.page=page;
    $$('.page-section').forEach(s=>s.classList.toggle('active',s.id==='page-'+page));
    $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
    $$('.bottom-nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===(['security','reports','updates','settings','more'].includes(page)?'more':page)));
    const basic=p.kind==='basic';
    const titles={overview:[`BlockNet ${p.label} Dashboard`,p.subtitle],devices:[basic?'Network':'Devices',basic?'Devices and network information.':'Connected devices and their network activity.'],filters:[basic?'Domain Rules':'Filters',basic?'Manage supported blocking rules in this simulated firmware.':'Manage ad, tracking and security filtering policies.'],security:['Security','Track suspicious DNS activity.'],reports:['Reports','Traffic insights and data exports.'],updates:['Updates','Blocklist and software update status.'],settings:['Settings','Dashboard preferences and demonstration controls.'],more:['More','Additional BlockNet tools and settings.']};
    $('#page-title').textContent=titles[page][0];$('#page-subtitle').textContent=titles[page][1];
    $('#device-dropdown').hidden=true;$('#device-menu-trigger').setAttribute('aria-expanded','false');
    refresh();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function updateModelUI(){
    const p=modelProfiles[state.model], basic=p.kind==='basic';
    document.body.dataset.model=state.model;
    document.body.classList.toggle('basic-mode',basic);
    document.title=`BlockNet ${p.label} | Dashboard Demo`;
    $$('[data-model-wordmark]').forEach(el=>el.textContent=p.label.toUpperCase());
    $$('[data-model-name]').forEach(el=>el.textContent=p.label);
    $('.device-title').firstChild.textContent=`BlockNet ${p.label}`;
    $('#dropdown-device-label').textContent=`BlockNet ${p.label} · ${p.ip}`;
    $('#model-selector').value=state.model;
    $('#firmware-version').textContent=`Version ${p.firmware}`;
    $('#about-backend').textContent=`Simulated ${p.dns}`;
    $('#active-lists-label').textContent=`${p.lists} active list${p.lists===1?'':'s'}`;
    $('#update-list-count').textContent=`${fmt(p.domains)} active domains`;
    $('#blocklist-domain-count').textContent=`${fmt(p.domains)} domains`;
    $('#basic-blocklist-count').textContent=fmt(p.domains);
    $('#basic-network-title').textContent=state.model==='mini'?'Wi-Fi Network':'Wired Network';
    $('#basic-network-name').textContent=p.network;
    $('#basic-network-ip').textContent=p.ip;
    $('#basic-network-firmware').textContent=p.firmware;
    $$('.sidebar-nav .nav-btn').forEach(btn=>{
      const page=btn.dataset.page;
      btn.hidden=basic && ['security','reports'].includes(page);
      const label=$('span',btn);
      if(label){if(page==='devices')label.textContent=basic?'Network':'Devices';if(page==='filters')label.textContent=basic?'Domain Rules':'Filters';}
    });
    $$('.bottom-nav-btn').forEach(btn=>{
      const label=$('span',btn);
      if(btn.dataset.page==='devices')label.textContent=basic?'Network':'Devices';
      if(btn.dataset.page==='filters')label.textContent=basic?'Rules':'Filters';
    });
    $$('.mobile-shortcuts .shortcut-row[data-page="devices"] strong').forEach(el=>el.textContent=basic?'Network':'Devices');
    $$('.mobile-shortcuts .shortcut-row[data-page="filters"] strong').forEach(el=>el.textContent=basic?'Domain Rules':'Filters');
    $$('.mobile-shortcuts .shortcut-row[data-page="security"]').forEach(el=>el.hidden=basic);
    $('.about-panel .section-panel-heading p').textContent=`Responsive ${p.label} dashboard prototype.`;
    $('#page-devices .section-intro h2').textContent=basic?'Network Devices':'Connected Devices';
    $('#page-filters .section-intro h2').textContent=basic?'Domain Rules':'Filters & Blocking';
    $('#page-filters .section-intro p').textContent=state.model==='mini'?'Basic Mini firmware concept. Actual filtering features depend on the tested open-source firmware.':'Manage the categories your simulated network blocks.';
    $('#automatic-updates').textContent='Enabled (demo)';
  }
  function switchModel(model){
    if(!Object.hasOwn(modelProfiles,model) || model===state.model)return;
    const theme=state.theme,live=state.live,filters=state.filters.map(x=>({...x})),rules=state.customRules;
    state=makeState(model);state.theme=theme;state.live=live;state.filters=filters;state.customRules=rules;
    seedEvents();updateModelUI();persist();setPage('overview');
    toast(`Showing BlockNet ${modelProfiles[model].label} demo`);
  }
  function seedEvents(){
    state.events=[];
    for(let i=0;i<14;i++){
      const e=eventPool[i%eventPool.length];
      state.events.push({id:i,domain:e[0],category:e[1],action:e[2],time:new Date(Date.now()-(i+1)*60*1000),device:state.devices[i%state.devices.length].name});
    }
  }
  function renderSparks(){
    ['dns-spark','block-spark','threat-spark'].forEach((id,idx)=>{
      const bars=Array.from({length:idx===0?10:idx===1?10:9},(_,i)=>`<i style="height:${Math.round(bounded(5+i*2.3+Math.sin(i*1.1+idx)*5,4,28))}px"></i>`).join('');
      $('#'+id).innerHTML=bars;
    });
  }
  function updateCounters(){
    $('#metric-queries').textContent=fmt(state.queries);
    $('#metric-blocked').textContent=fmt(state.blocked);
    $('#metric-devices').textContent=fmt(state.online?state.devices.length:0);
    $('#metric-threats').textContent=fmt(state.threats);
    $('#security-threat-value').textContent=fmt(state.threats);
    $('#security-event-count').textContent=`${fmt(state.threats)} threats blocked today`;
    $('#security-ratio-value').textContent=`${(100*state.blocked/Math.max(1,state.queries)).toFixed(1)}%`;
    $('#report-allowed').textContent=fmt(state.queries-state.blocked);
    $('#report-blocked').textContent=fmt(state.blocked);
    $('#ratio-allowed-bar').style.width=`${((state.queries-state.blocked)/state.queries)*100}%`;
    $('#ratio-blocked-bar').style.width=`${(state.blocked/state.queries)*100}%`;
    $('#devices-active-label').textContent=`${state.online?state.devices.length:0} online`;
  }
  function updateConnection(){
    const isOnline=state.online;
    $('#top-device-status').textContent=isOnline?'Online':'Offline';
    $('#top-status-dot').classList.toggle('offline',!isOnline);
    $('#hero-status').textContent=isOnline?'Protected':'Device offline';
    $('#hero-description').textContent=isOnline?(modelProfiles[state.model].kind==='basic'?'Supported advertising and tracking domains are being filtered in this simulated network.':'Supported ad, tracker and malicious-domain requests are being filtered in this simulated network.'):'Demo appliance disconnected. Simulated traffic updates are paused until reconnected.';
    $('#hero-status').style.color=isOnline?'':'var(--accent)';
    $('#security-state-label').textContent=isOnline?'Protected':'Offline';
    $('#connection-btn span').textContent=isOnline?'Simulate offline status':'Reconnect demo appliance';
    $('#settings-offline span').textContent=isOnline?'Simulate offline':'Reconnect demo';
    $('#live-data-setting').checked=state.live;
    $('#dark-theme-setting').checked=state.theme==='dark';
    $('#update-check-time').textContent=timeString(state.lastCheck);
    $('.hero-panel').classList.toggle('offline',!isOnline);
  }
  function updateTheme(){
    document.body.classList.toggle('dark',state.theme==='dark');
    document.documentElement.style.colorScheme=state.theme;
    $('#theme-toggle').innerHTML=icon(state.theme==='dark'?'sun':'moon');
    $('#dark-theme-setting').checked=state.theme==='dark';
  }
  function renderChart(){
    const svg=$('#traffic-chart'),W=480,H=236,L=37,R=8,T=12,B=26;
    const h=H-T-B,w=W-L-R,max=6000;
    const x=i=>L+i*w/(state.chartAllowed.length-1);
    const y=v=>T+h*(1-v/max);
    const path = data => data.map((v,i)=>`${i===0?'M':'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const area = data => `${path(data)} L${x(data.length-1).toFixed(1)},${(H-B).toFixed(1)} L${L},${H-B} Z`;
    const grid=[0,2000,4000,6000].map(v=>`<line class="chart-gridline" x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}"/><text class="chart-axis-label" x="${L-7}" y="${y(v)+3}" text-anchor="end">${v===0?'0':v/1000+'K'}</text>`).join('');
    const ticks=[0,4,8,12,16,20,23].map(i=>`<text class="chart-axis-label" x="${x(i)}" y="${H-6}" text-anchor="middle">${String(i).padStart(2,'0')}:00</text>`).join('');
    svg.innerHTML=`<defs><linearGradient id="redGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#ff2243" stop-opacity=".20"/><stop offset="100%" stop-color="#ff2243" stop-opacity="0"/></linearGradient><linearGradient id="greenGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#08bc6a" stop-opacity=".18"/><stop offset="100%" stop-color="#08bc6a" stop-opacity="0"/></linearGradient></defs>${grid}<line class="chart-gridline" x1="${L}" y1="${T}" x2="${L}" y2="${H-B}"/><path d="${area(state.chartBlocked)}" fill="url(#redGradient)"/><path d="${area(state.chartAllowed)}" fill="url(#greenGradient)"/><path class="chart-blocked-line" d="${path(state.chartBlocked)}"/><path class="chart-allowed-line" d="${path(state.chartAllowed)}"/>${ticks}`;
  }
  function renderOverviewEvents(){
    $('#overview-events').innerHTML=state.events.slice(0,9).map(e=>`<tr><td>${timeString(e.time)}</td><td><span class="event-state ${e.action==='block'?'blocked':'allowed'}"><i class="dot ${e.action==='block'?'red':'green'}"></i>${e.action==='block'?'Blocked':'Allowed'}</span></td><td title="${safe(e.domain)}">${safe(e.domain)}</td></tr>`).join('');
  }
  function domainMultiplier(){return {today:1,week:7,month:30}[$('#domain-timeframe').value]||1;}
  function renderOverviewDomains(){
    const domains=[...state.domains].sort((a,b)=>b.count-a.count).slice(0,10),max=domains[0].count*domainMultiplier();
    $('#overview-domains').innerHTML=domains.map((d,i)=>{
      const count=Math.round(d.count*domainMultiplier()*(1+0.04*Math.sin(i)));
      return `<tr><td>${i+1}</td><td title="${safe(d.name)}">${safe(d.name)}</td><td><span class="domain-bar" style="width:${Math.max(3,count/max*100)}%"></span></td><td>${fmt(count)}</td></tr>`;
    }).join('');
  }
  function renderOverviewDevices(){
    $('#overview-devices').innerHTML=state.devices.slice(0,5).map(d=>`<tr><td><span class="device-mini-name">${icon(d.kind)}<span>${safe(d.name)}</span></span></td><td>${fmt(d.queries)}</td><td class="red-number">${fmt(d.blocked)}</td><td><span class="online-status"><i class="dot ${state.online?'green':'red'}"></i>${state.online?'Online':'Offline'}</span></td></tr>`).join('');
  }
  function renderOverviewFilters(){
    $('#overview-filters').innerHTML=state.filters.filter(f=>state.model==='mini'?f.id==='ads':state.model==='lite'?['ads','malware','phishing'].includes(f.id):true).map(f=>`<div class="filter-mini-row">${icon(f.icon)}<span>${safe(f.name)}</span><span class="filter-state ${f.enabled?'':'off'}">${f.enabled?'Enabled':'Disabled'}</span><button class="filter-toggle ${f.enabled?'on':''}" data-filter="${f.id}" aria-label="Toggle ${safe(f.name)}" aria-pressed="${f.enabled}"></button></div>`).join('');
    $('#custom-rule-count').textContent=`${state.customRules.length} rules`;
  }
  function renderHealth(){
    const cpu=state.online?random(11,19):0,mem=state.online?random(24,34):0,temp=state.online?random(39,46):0;
    const rows=[['CPU Usage',`${cpu}%`,cpu],['Memory Usage',`${mem}%`,mem],['Temperature',`${temp}°C`,temp],['Uptime','12d 6h 24m',null],['DNS Resolver',state.online?'Running':'Offline',null],['Blocklist Updates','6 minutes ago',null],['System Version','v2.1.0',null]];
    $('#overview-health').innerHTML=rows.map(r=>`<div class="health-row"><i class="dot ${state.online?'green':'red'}"></i><span class="health-name">${r[0]}</span><span class="health-value">${r[1]}</span>${r[2]!==null?`<span class="health-track"><span style="width:${r[2]}%"></span></span>`:r[0]==='System Version'?icon('check-circle','green-check'):''}</div>`).join('');
  }
  function renderDevices(){
    const term=$('#device-search').value.trim().toLowerCase();
    const visible=state.devices.filter(d=>d.name.toLowerCase().includes(term)||d.ip.includes(term));
    $('#device-list').innerHTML=visible.length?visible.map(d=>`<button class="device-list-item ${state.selectedDevice===d.id?'selected':''}" data-device="${d.id}"><span class="device-list-icon">${icon(d.kind)}</span><span class="device-list-name"><strong>${safe(d.name)}</strong><small>${d.ip} · <span style="color:${state.online?'var(--green)':'var(--accent)'}">${state.online?'Online':'Offline'}</span></small></span><span class="device-list-numbers"><span><strong>${fmt(d.queries)}</strong><small>Requests</small></span><span><strong class="red-number">${fmt(d.blocked)}</strong><small>Blocked</small></span></span>${icon('chevron')}</button>`).join(''):'<div class="empty-detail"><p>No devices match that search.</p></div>';
    renderDeviceDetail();
  }
  function renderDeviceDetail(){
    const panel=$('#device-detail-panel'),d=state.devices.find(d=>d.id===state.selectedDevice);
    if(!d){panel.innerHTML=`<div class="empty-detail">${icon('monitor')}<p>Select a device above to see its demo activity.</p></div>`;return;}
    panel.innerHTML=`<div class="device-detail-head"><div><h3>${safe(d.name)}</h3><p>Sample IP: ${d.ip} · Simulated activity</p></div>${state.model==='mini'?'<span class="soft-tag">Per-device rules not included in Mini demo</span>':`<button class="secondary-button" data-device-toggle="${d.id}">${icon(d.filtering?'pause':'play')}${d.filtering?'Disable filtering':'Enable filtering'}</button>`}</div><div class="detail-stats"><div class="detail-stat"><span>DNS queries</span><strong>${fmt(d.queries)}</strong></div><div class="detail-stat"><span>Queries blocked</span><strong>${fmt(d.blocked)}</strong></div><div class="detail-stat"><span>Block rate</span><strong>${(100*d.blocked/Math.max(1,d.queries)).toFixed(1)}%</strong></div></div>`;
  }
  function renderFullFilters(){
    $('#full-filter-list').innerHTML=state.filters.filter(f=>state.model==='mini'?f.id==='ads':state.model==='lite'?['ads','malware','phishing'].includes(f.id):true).map(f=>`<div class="full-filter-row"><span class="full-filter-icon">${icon(f.icon)}</span><div class="full-filter-copy"><strong>${safe(f.name)}</strong><small>${safe(f.desc)}</small></div><button class="filter-toggle ${f.enabled?'on':''}" data-filter="${f.id}" aria-label="Toggle ${safe(f.name)}" aria-pressed="${f.enabled}"></button></div>`).join('');
    $('#custom-domains-list').innerHTML=state.customRules.length?state.customRules.map(r=>`<div class="custom-rule-item">${icon('globe')}<div><strong>${safe(r.domain)}</strong><small>Custom ${r.type} rule</small></div><span class="rule-pill ${r.type==='allow'?'allow':''}">${r.type==='allow'?'Allowed':'Blocked'}</span><button class="delete-rule" aria-label="Delete ${safe(r.domain)}" data-rule-delete="${safe(r.id)}">${icon('x')}</button></div>`).join(''):'<p style="color:var(--muted)">No custom rules. Add one above.</p>';
  }
  function renderSecurityEvents(){
    $('#security-full-events').innerHTML=state.events.slice(0,22).map(e=>`<div class="security-event-row"><span class="security-event-icon ${e.action==='allow'?'allowed':''}">${icon(e.action==='allow'?'check':'ban')}</span><span class="security-event-info"><strong>${safe(e.domain)}</strong><small>${e.action==='allow'?'Allowed query':'Blocked · '+safe(e.category)} · ${safe(e.device)}</small></span><time>${timeString(e.time)}</time></div>`).join('');
  }
  function renderBasic(){
    const p=modelProfiles[state.model];
    $('#basic-connection-status').textContent=state.online?'Connected':'Offline';
    $('#basic-network-devices').textContent=state.online?String(state.devices.length):'0';
    $('#basic-last-update').textContent=timeString(state.lastCheck);
    $('#basic-domains').innerHTML=state.domains.slice(0,5).map((d,i)=>`<div class="basic-domain-row"><span title="${safe(d.name)}">${safe(d.name)}</span><small>${i%2?'Analytics':'Advertising'}</small><time>${i*3+2} min ago</time></div>`).join('');
    $('#basic-events').innerHTML=state.events.slice(0,6).map(e=>`<div class="basic-event-row"><time>${timeString(e.time)}</time><span class="event-state ${e.action==='block'?'blocked':'allowed'}"><i class="dot ${e.action==='block'?'red':'green'}"></i>${e.action==='block'?'Blocked':'Allowed'}</span><span title="${safe(e.domain)}">${safe(e.domain)}</span></div>`).join('');
  }
  function refresh(){
    updateCounters();updateConnection();
    if(state.page==='overview'){
      if(modelProfiles[state.model].kind==='basic')renderBasic();
      else {renderChart();renderOverviewEvents();renderOverviewDomains();renderOverviewDevices();renderOverviewFilters();renderHealth();}
    }else if(state.page==='devices') renderDevices();
    else if(state.page==='filters') renderFullFilters();
    else if(state.page==='security') renderSecurityEvents();
  }
  function tick(){
    if(!state.live||!state.online)return;
    const newQueries=state.model==='mini'?random(4,14):state.model==='lite'?random(10,28):random(22,65);
    const enabledCount=state.filters.filter(f=>f.enabled).length;
    const maxCount=state.model==='mini'?1:state.model==='lite'?3:5;
    const active=state.filters.filter(f=>f.enabled && (state.model==='mini'?f.id==='ads':state.model==='lite'?['ads','malware','phishing'].includes(f.id):true)).length;
    const rate=(active/maxCount)*0.23+0.03;
    const newBlocks=bounded(Math.round(newQueries*rate)+random(-2,3),0,newQueries);
    state.queries+=newQueries;state.blocked+=newBlocks;state.threats+=Math.floor(newBlocks*random(4,17)/100);
    for(const d of state.devices){
      const q=random(0,10);
      d.queries+=q;
      d.blocked+=d.filtering?Math.round(q*rate):0;
    }
    for(let i=0;i<random(1,3);i++){
      let event=eventPool[random(0,eventPool.length-1)];
      if(!state.filters.some(f=>f.enabled)&&event[2]==='block')event=eventPool[8];
      const device=state.devices[random(0,state.devices.length-1)];
      const rule=state.customRules.find(r=>r.domain===event[0]);
      const action=rule?(rule.type==='block'?'block':'allow'):(device.filtering?event[2]:'allow');
      state.events.unshift({id:Date.now()+i,domain:event[0],category:event[1],action,time:new Date(),device:device.name});
      if(action==='block'){
        const match=state.domains.find(d=>d.name===event[0]);
        if(match)match.count+=random(1,8);
      }
    }
    state.events=state.events.slice(0,60);
    state.chartBlocked[state.chartBlocked.length-1]=bounded(state.chartBlocked.at(-1)+random(-180,190),1900,5400);
    state.chartAllowed[state.chartAllowed.length-1]=bounded(state.chartAllowed.at(-1)+random(-110,140),700,2600);
    refresh();
  }
  function changeFilter(id){
    const f=state.filters.find(f=>f.id===id);
    if(!f)return;
    f.enabled=!f.enabled;persist();refresh();toast(`${f.name} ${f.enabled?'enabled':'disabled'} in demo`);
  }
  function toggleConnection(){
    state.online=!state.online;refresh();toast(state.online?'Demo appliance reconnected':'Demo appliance set to offline');
  }
  function resetDemo(){
    const savedTheme=state.theme,savedLive=state.live,model=state.model;
    state=makeState(model);state.theme=savedTheme;state.live=savedLive;
    state.filters=filterBlueprints.map(f=>({...f,enabled:true}));
    state.customRules=[...defaultRules];seedEvents();
    $('#device-search').value='';$('#domain-timeframe').value='today';
    updateModelUI();persist();setPage('overview');toast('Demo data reset to original values');
  }
  function download(name,content,mime){
    const url=URL.createObjectURL(new Blob([content],{type:mime}));
    const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  function csv(rows){return '\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n');}
  function exportData(type){
    const date=new Date().toISOString().slice(0,10);
    if(type==='domains'){
      download(`blocknet-demo-domains-${date}.csv`,csv([['Domain','Blocked requests','Data type'],...state.domains.map(d=>[d.name,d.count,'Simulated'])]),'text/csv;charset=utf-8');
      toast('Simulated blocked-domains CSV downloaded');return;
    }
    if(type==='queries'){
      download(`blocknet-demo-query-log-${date}.csv`,csv([['Time','Domain','Action','Category','Device','Data type'],...state.events.map(e=>[e.time.toISOString(),e.domain,e.action,e.category,e.device,'Simulated'])]),'text/csv;charset=utf-8');
      toast('Simulated query-log CSV downloaded');return;
    }
    const days=type==='30day'?30:7;
    const rows=Array.from({length:days},(_,i)=>{
      const dateObj=new Date();dateObj.setDate(dateObj.getDate()-days+1+i);
      const q=Math.round(state.queries*(0.68+0.3*Math.sin(i*1.34+1)));
      const b=Math.round(q*(state.blocked/state.queries)*(0.85+0.1*Math.sin(i*.7)));
      return [dateObj.toISOString().slice(0,10),q,b,q-b,(100*b/q).toFixed(1)+'%'];
    });
    const name=`BlockNet ${modelProfiles[state.model].label} · ${days}-Day Report`;
    const doc=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${name}</title><style>body{font:14px Arial,sans-serif;color:#182134;max-width:850px;margin:35px auto;padding:20px}h1{color:#f01838}small{color:#74849d}.stats{display:flex;gap:16px;margin:25px 0}.stats div{padding:18px;border:1px solid #e7e9ee;border-radius:12px;flex:1}.stats strong{display:block;font-size:26px;margin-top:6px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border-bottom:1px solid #e5eaf0;text-align:left}th{background:#f6f7fa}footer{margin-top:35px;color:#8b96a5;font-size:12px}@media print{body{margin:0}}</style></head><body><small>BLOCKNET · INTERACTIVE DASHBOARD DEMO</small><h1>${name}</h1><p>Created ${date} · All values in this report are simulated and do not reflect real DNS traffic.</p><div class="stats"><div>DNS queries<strong>${fmt(state.queries)}</strong></div><div>Ads blocked<strong>${fmt(state.blocked)}</strong></div><div>Devices<strong>${state.devices.length}</strong></div></div><h2>Sample daily figures</h2><table><thead><tr><th>Date</th><th>Queries</th><th>Blocked</th><th>Allowed</th><th>Block rate</th></tr></thead><tbody>${rows.map(row=>`<tr>${row.map(item=>`<td>${item}</td>`).join('')}</tr>`).join('')}</tbody></table><footer>BlockNet concept demonstration · For design and testing only</footer></body></html>`;
    download(`blocknet-demo-${days}-day-report-${date}.html`,doc,'text/html;charset=utf-8');
    toast('Sample HTML report generated — open it to view or print to PDF');
  }
  function addRule(form){
    const data=new FormData(form),raw=String(data.get('domain')||'').toLowerCase().trim().replace(/^https?:\/\//,'').replace(/\/$/,'');
    const domain=raw.split('/')[0];
    const valid=/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain);
    if(!valid||raw!==domain){toast('Enter a valid domain such as example.com (no path)');return;}
    if(state.customRules.some(r=>r.domain===domain)){toast('That domain already has a custom rule');return;}
    state.customRules.unshift({id:'r'+Date.now(),domain,type:data.get('rule')==='allow'?'allow':'block'});
    form.reset();persist();renderFullFilters();toast(`Demo ${state.customRules[0].type} rule added for ${domain}`);
  }
  document.addEventListener('click',event=>{
    const nav=event.target.closest('[data-page]');
    if(nav){setPage(nav.dataset.page);return;}
    const filter=event.target.closest('[data-filter]');
    if(filter){changeFilter(filter.dataset.filter);return;}
    const device=event.target.closest('[data-device]');
    if(device){state.selectedDevice=device.dataset.device;renderDevices();return;}
    const deviceToggle=event.target.closest('[data-device-toggle]');
    if(deviceToggle){const d=state.devices.find(d=>d.id===deviceToggle.dataset.deviceToggle);if(d){d.filtering=!d.filtering;renderDeviceDetail();toast(`Demo filtering ${d.filtering?'enabled':'disabled'} for ${d.name}`);}return;}
    const ruleDelete=event.target.closest('[data-rule-delete]');
    if(ruleDelete){state.customRules=state.customRules.filter(r=>r.id!==ruleDelete.dataset.ruleDelete);persist();renderFullFilters();toast('Custom demo rule removed');return;}
    const exportButton=event.target.closest('[data-export]');
    if(exportButton){exportData(exportButton.dataset.export);return;}
    if(event.target.closest('#device-menu-trigger')){const dd=$('#device-dropdown');dd.hidden=!dd.hidden;$('#device-menu-trigger').setAttribute('aria-expanded',String(!dd.hidden));return;}
    if(event.target.closest('#connection-btn')||event.target.closest('#settings-offline')){toggleConnection();$('#device-dropdown').hidden=true;return;}
    if(event.target.closest('#theme-toggle')){state.theme=state.theme==='dark'?'light':'dark';updateTheme();persist();return;}
    if(event.target.closest('#reset-demo')){resetDemo();return;}
    if(event.target.closest('#check-updates')||event.target.closest('#check-software')||event.target.closest('#basic-check-updates')){state.lastCheck=new Date();$('#update-check-time').textContent=timeString(state.lastCheck);toast('Demo check complete. All systems are up to date.');return;}
    if(!event.target.closest('.device-menu-wrap')){$('#device-dropdown').hidden=true;$('#device-menu-trigger').setAttribute('aria-expanded','false');}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#device-dropdown').hidden=true;$('#device-menu-trigger').setAttribute('aria-expanded','false');}});
  $('#model-selector').addEventListener('change',event=>switchModel(event.target.value));
  $('#device-search').addEventListener('input',()=>renderDevices());
  $('#domain-timeframe').addEventListener('change',()=>renderOverviewDomains());
  $('#add-domain-form').addEventListener('submit',event=>{event.preventDefault();addRule(event.target);});
  $('#dark-theme-setting').addEventListener('change',event=>{state.theme=event.target.checked?'dark':'light';updateTheme();persist();});
  $('#live-data-setting').addEventListener('change',event=>{state.live=event.target.checked;persist();toast(state.live?'Simulated live data resumed':'Simulated live data paused');});
  seedEvents();renderSparks();updateTheme();updateModelUI();setPage('overview');
  window.setInterval(tick,2700);
})();
