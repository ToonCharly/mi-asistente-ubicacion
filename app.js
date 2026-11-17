'use strict';
const $=s=>document.querySelector(s);
let pos=null,foto=null,stream=null,map,capa,marcaActual,urls=[];
const DB='asistente-ubicacion',ST='registros';
/* ---------- IndexedDB ---------- */
const abrir=()=>new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(ST,{keyPath:'id',autoIncrement:true});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function tx(modo,fn){const db=await abrir();return new Promise((ok,no)=>{const t=db.transaction(ST,modo);const q=fn(t.objectStore(ST));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error)})}
const todos=()=>tx('readonly',s=>s.getAll()),agregar=r=>tx('readwrite',s=>s.add(r)),quitar=id=>tx('readwrite',s=>s.delete(id)),limpiar=()=>tx('readwrite',s=>s.clear());
/* ---------- Utilidades ---------- */
function msg(el,t,err){el.textContent=t;el.classList.toggle('err',!!err)}
async function permiso(nombre,chip,etq){try{const p=await navigator.permissions.query({name:nombre});const f=()=>{chip.textContent=etq+': '+({granted:'permitido',denied:'denegado',prompt:'sin decidir'}[p.state]||p.state)};f();p.onchange=f}catch{chip.textContent=etq+': según uso'}}
function redChip(){const c=$('#red');c.textContent=navigator.onLine?'En línea':'Sin conexión'}
/* ---------- Privacidad ---------- */
function iniciar(){
  let ok=false;try{ok=localStorage.getItem('consentimiento')==='1'}catch{}
  if(ok)arrancar();else{$('#privacidad').hidden=false;$('#aceptar').onclick=()=>{try{localStorage.setItem('consentimiento','1')}catch{}$('#privacidad').hidden=true;arrancar()}}
}
function arrancar(){
  $('#app').hidden=false;
  map=L.map('map').setView([20.9674,-89.5926],12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  capa=L.layerGroup().addTo(map);setTimeout(()=>map.invalidateSize(),300);
  permiso('geolocation',$('#pGeo'),'Ubicación');permiso('camera',$('#pCam'),'Cámara');
  redChip();addEventListener('online',redChip);addEventListener('offline',redChip);
  if(!window.isSecureContext)msg($('#geoInfo'),'Esta página no es un contexto seguro: geolocalización y cámara requieren HTTPS o localhost.',true);
  pintar();
}
/* ---------- Geolocalización ---------- */
$('#btnGeo').onclick=()=>{
  const i=$('#geoInfo');
  if(!('geolocation' in navigator))return msg(i,'Tu navegador no soporta geolocalización.',true);
  msg(i,'Solicitando ubicación…');$('#btnGeo').disabled=true;
  navigator.geolocation.getCurrentPosition(p=>{
    pos={lat:p.coords.latitude,lng:p.coords.longitude,precision:Math.round(p.coords.accuracy)};
    msg(i,`Lat ${pos.lat.toFixed(5)}, Lng ${pos.lng.toFixed(5)} (±${pos.precision} m)`);
    if(marcaActual)marcaActual.remove();
    marcaActual=L.marker([pos.lat,pos.lng]).addTo(map).bindPopup('Estás aquí').openPopup();map.setView([pos.lat,pos.lng],16);
    $('#btnGeo').disabled=false;habilitar();
  },e=>{
    $('#btnGeo').disabled=false;
    msg(i,{1:'Permiso de ubicación denegado. Actívalo en el candado de la barra de direcciones (o en Ajustes del sitio) y vuelve a intentar. La app sigue funcionando sin ubicación, pero no podrás guardar registros.',2:'No se pudo determinar la posición (GPS o red no disponibles).',3:'Se agotó el tiempo de espera. Intenta de nuevo.'}[e.code]||'Error de ubicación.',true);
  },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
};
/* ---------- Cámara ---------- */
async function abrirCamara(){
  const i=$('#camInfo');
  if(!navigator.mediaDevices?.getUserMedia)return msg(i,'Tu navegador no soporta cámara web. Usa el botón de selección de archivo.',true);
  try{cerrarCamara();const id=$('#camSel').value;stream=await navigator.mediaDevices.getUserMedia({video:id?{deviceId:{exact:id}}:{facingMode:{ideal:'environment'}},audio:false});
    const ds=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput'),sel=$('#camSel');
    if(ds.length>1){sel.replaceChildren(...ds.map((d,k)=>new Option(d.label||'Cámara '+(k+1),d.deviceId)));sel.value=stream.getVideoTracks()[0].getSettings().deviceId||'';sel.hidden=false}
    const v=$('#video');v.srcObject=stream;v.hidden=false;await v.play();$('#preview').hidden=true;$('#btnFoto').disabled=false;msg(i,'Cámara activa.');
  }catch(e){msg(i,e.name==='NotAllowedError'?'Permiso de cámara denegado. Actívalo en los ajustes del sitio o usa la selección de archivo.':e.name==='NotFoundError'?'No se encontró ninguna cámara.':'No se pudo abrir la cámara ('+e.name+').',true)}
}
function cerrarCamara(){stream?.getTracks().forEach(t=>t.stop());stream=null;$('#video').hidden=true;$('#btnFoto').disabled=true}
function setFoto(b){foto=b;const p=$('#preview');if(p.src)URL.revokeObjectURL(p.src);p.src=URL.createObjectURL(b);p.hidden=false;$('#btnQuitar').disabled=false;habilitar()}
$('#btnCam').onclick=abrirCamara;$('#camSel').onchange=abrirCamara;
$('#btnFoto').onclick=()=>{const v=$('#video'),c=document.createElement('canvas');if(!v.videoWidth)return msg($('#camInfo'),'La cámara no envía imagen (video negro). Elige otra cámara en la lista.',true);const k=Math.min(1,1280/v.videoWidth);c.width=v.videoWidth*k;c.height=v.videoHeight*k;c.getContext('2d').drawImage(v,0,0,c.width,c.height);
  c.toBlob(b=>{setFoto(b);cerrarCamara();msg($('#camInfo'),'Foto capturada.')},'image/jpeg',.8)};
$('#fileIn').onchange=e=>{const f=e.target.files[0];if(f&&f.type.startsWith('image/')){cerrarCamara();setFoto(f);msg($('#camInfo'),'Imagen seleccionada.')}};
$('#btnQuitar').onclick=()=>{foto=null;$('#preview').hidden=true;$('#btnQuitar').disabled=true;$('#fileIn').value='';habilitar()};
addEventListener('pagehide',cerrarCamara);
function habilitar(){$('#btnGuardar').disabled=!pos}
/* ---------- Guardar / mostrar ---------- */
$('#btnGuardar').onclick=async()=>{
  try{await agregar({fecha:new Date().toISOString(),...pos,nota:$('#nota').value.trim(),foto});
    msg($('#msg'),'Registro guardado en este dispositivo.');$('#nota').value='';$('#btnQuitar').click();await pintar();
  }catch{msg($('#msg'),'No se pudo guardar (almacenamiento lleno o bloqueado).',true)}
};
async function pintar(){
  urls.forEach(URL.revokeObjectURL);urls=[];capa.clearLayers();
  let rs=[];try{rs=await todos()}catch{msg($('#msg'),'IndexedDB no disponible.',true)}
  $('#n').textContent=rs.length;const ul=$('#lista');ul.replaceChildren();
  rs.reverse().forEach(r=>{
    const li=document.createElement('li');
    if(r.foto){const im=new Image();im.alt='Foto del registro';im.src=URL.createObjectURL(r.foto);urls.push(im.src);li.append(im)}
    const d=document.createElement('div');d.className='d';
    d.append(new Date(r.fecha).toLocaleString('es-MX'),document.createElement('br'),`${r.lat.toFixed(5)}, ${r.lng.toFixed(5)} (±${r.precision} m)`);
    if(r.nota){d.append(document.createElement('br'),r.nota)}
    d.append(document.createElement('br'));
    const v=document.createElement('button');v.textContent='Ver en mapa';v.onclick=()=>map.setView([r.lat,r.lng],17);
    const x=document.createElement('button');x.textContent='Eliminar';x.className='danger';x.onclick=async()=>{await quitar(r.id);pintar()};
    d.append(v,x);li.append(d);ul.append(li);
    L.marker([r.lat,r.lng]).addTo(capa).bindPopup((r.nota||'Registro')+'<br>'+new Date(r.fecha).toLocaleString('es-MX'));
  });
}
$('#btnBorrar').onclick=async()=>{if(confirm('¿Borrar TODOS los registros y fotos de este dispositivo? No se puede deshacer.')){await limpiar();try{localStorage.removeItem('consentimiento')}catch{}pintar();msg($('#msg'),'Datos eliminados.')}};
$('#btnExp').onclick=async()=>{const rs=(await todos()).map(({foto,...r})=>({...r,tieneFoto:!!foto}));
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(rs,null,2)],{type:'application/json'}));a.download='registros.json';a.click()};
/* ---------- PWA ---------- */
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
iniciar();
