import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, AlertCircle, Trash2, ChevronUp, ChevronDown, Star, Settings, Play, CheckCircle, XCircle, Lock, ChevronRight, Building2, Info, Layout, Users, FolderOpen, FlaskConical, GraduationCap, Calendar, MessageSquare, Handshake, Mail, User, Briefcase } from "lucide-react";

// ─── IDENTIFIANTS ADMIN ───────────────────────────────────────────────────────
const ADMIN_EMAIL    = "admin@africaingenierie.com";
const ADMIN_PASSWORD = "Africa2025!";
const SESSION_KEY    = "ai_admin_auth";

// ─── GLOBAL DEBUG LOG ─────────────────────────────────────────────────────────
const _debugLogs = { list: [], listeners: [] };
const pushDebugLog = (entry) => {
  _debugLogs.list = [entry, ..._debugLogs.list].slice(0, 20);
  _debugLogs.listeners.forEach(fn => fn([..._debugLogs.list]));
};
const useDebugLogs = () => {
  const [logs, setLogs] = useState([..._debugLogs.list]);
  useEffect(() => {
    _debugLogs.listeners.push(setLogs);
    return () => { _debugLogs.listeners = _debugLogs.listeners.filter(f => f !== setLogs); };
  }, []);
  return logs;
};

// ─── BASE URL & ENDPOINTS ─────────────────────────────────────────────────────
const BASE = "https://api.ingenierieafrica.com";
const API = {
  domaines:          `${BASE}/domaines`,
  members:           `${BASE}/members`,
  projects:          `${BASE}/projects`,
  formations:        `${BASE}/formations`,
  directeur:         `${BASE}/directeur`,
  etudes:            `${BASE}/etudes`,
  quiSommesNous:     `${BASE}/qui-sommes-nous`,
  avis:              `${BASE}/avis`,
  formationsAvenir:  `${BASE}/formations-avenir`,
  contact:           `${BASE}/contact`,
  partenaires:       `${BASE}/partenaires`,
  videos:            `${BASE}/videos`,
};

// ── REST helpers ──────────────────────────────────────────────────────────────
// ── Auth token helpers ───────────────────────────────────────────────────────
const TOKEN_KEY = "ai_admin_jwt";
const getToken  = () => sessionStorage.getItem(TOKEN_KEY);
const setToken  = (t) => sessionStorage.setItem(TOKEN_KEY, t);
const clearToken= () => sessionStorage.removeItem(TOKEN_KEY);

const API_KEY = "africa_api_key_2025";

const authHeaders = (extra = {}) => {
  const token = getToken();
  const h = { ...extra, "x-api-key": API_KEY };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

const req = async (url, opts = {}) => {
  const method = opts.method || "GET";
  try {
    const headers = { "Content-Type": "application/json", ...authHeaders(), ...(opts.headers||{}) };
    const r = await fetch(url, { ...opts, headers });
    if (!r.ok) {
      const errText = await r.text().catch(() => r.statusText);
      const err = `${r.status} — ${errText}`;
      pushDebugLog({ time: new Date().toLocaleTimeString("fr-FR"), method, url, error: err });
      throw new Error(err);
    }
    return await r.json().catch(() => ({}));
  } catch(e) {
    if (e.message.includes("Failed to fetch") || e.message.includes("NetworkError")) {
      const err = "Impossible de joindre l'API — vérifiez CORS ou l'URL";
      pushDebugLog({ time: new Date().toLocaleTimeString("fr-FR"), method, url, error: err });
      throw new Error(err);
    }
    throw e;
  }
};
const api = {
  get:    url      => req(url),
  post:   (url, b) => req(url, { method: "POST",  body: JSON.stringify(b) }),
  put:    (url, b) => req(url, { method: "PUT",   body: JSON.stringify(b) }),
  patch:  (url, b) => req(url, { method: "PATCH", body: JSON.stringify(b) }),
  delete: url      => req(url, { method: "DELETE" }),
};

// Login API
const loginApi = async (email, password) => {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error("Email ou mot de passe incorrect");
  const data = await r.json();
  setToken(data.token);
  return data;
};

// ── ROUTE CONFIG ──────────────────────────────────────────────────────────────
const ROUTE_CFG_KEY = "ai_admin_route_cfg";
const loadRouteCfg = () => { try { return JSON.parse(localStorage.getItem(ROUTE_CFG_KEY) || "{}"); } catch { return {}; } };
const saveRouteCfg = (cfg) => { try { localStorage.setItem(ROUTE_CFG_KEY, JSON.stringify(cfg)); } catch {} };

const DELETE_STRATEGIES = [
  { key: "auto",            label: "Auto-détection" },
  { key: "DELETE/:id",      label: "DELETE /endpoint/:id  (REST standard)" },
  { key: "DELETE/",         label: "DELETE /endpoint  + body {id}" },
  { key: "POST/delete",     label: "POST /endpoint/delete  + body {id}" },
  { key: "POST/:id/delete", label: "POST /endpoint/:id/delete" },
  { key: "POST/_method",    label: "POST /endpoint/:id  + _method:DELETE" },
  { key: "PATCH/active",    label: "PATCH /endpoint/:id  + {active:false}" },
];
const UPDATE_STRATEGIES = [
  { key: "auto",             label: "Auto-détection" },
  { key: "PUT/:id",          label: "PUT /endpoint/:id  (REST standard)" },
  { key: "PATCH/:id",        label: "PATCH /endpoint/:id" },
  { key: "POST/update",      label: "POST /endpoint/update  + body {id,...}" },
  { key: "POST/:id/update",  label: "POST /endpoint/:id/update" },
  { key: "PUT/",             label: "PUT /endpoint  + body {id,...}" },
];

const execDelete = async (stratKey, base, id) => {
  const h = { "Content-Type": "application/json", ...authHeaders() };
  let r;
  switch (stratKey) {
    case "DELETE/:id":      r = await fetch(`${base}/${id}`, { method:"DELETE", headers:h }); break;
    case "DELETE/":         r = await fetch(base, { method:"DELETE", headers:h, body:JSON.stringify({id}) }); break;
    case "POST/delete":     r = await fetch(`${base}/delete`, { method:"POST", headers:h, body:JSON.stringify({id}) }); break;
    case "POST/:id/delete": r = await fetch(`${base}/${id}/delete`, { method:"POST", headers:h }); break;
    case "POST/_method":    r = await fetch(`${base}/${id}`, { method:"POST", headers:h, body:JSON.stringify({_method:"DELETE",id}) }); break;
    case "PATCH/active":    r = await fetch(`${base}/${id}`, { method:"PATCH", headers:h, body:JSON.stringify({active:false,deleted:true}) }); break;
    default: throw new Error("Stratégie inconnue");
  }
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json().catch(() => ({}));
};

const execUpdate = async (stratKey, base, id, body) => {
  const h = { "Content-Type": "application/json", ...authHeaders() };
  let r;
  switch (stratKey) {
    case "PUT/:id":         r = await fetch(`${base}/${id}`, { method:"PUT",   headers:h, body:JSON.stringify(body) }); break;
    case "PATCH/:id":       r = await fetch(`${base}/${id}`, { method:"PATCH", headers:h, body:JSON.stringify(body) }); break;
    case "POST/update":     r = await fetch(`${base}/update`, { method:"POST", headers:h, body:JSON.stringify({id,...body}) }); break;
    case "POST/:id/update": r = await fetch(`${base}/${id}/update`, { method:"POST", headers:h, body:JSON.stringify(body) }); break;
    case "PUT/":            r = await fetch(base, { method:"PUT", headers:h, body:JSON.stringify({id,...body}) }); break;
    default: throw new Error("Stratégie inconnue");
  }
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json().catch(() => ({}));
};

const _deleteRouteCache = {};
const smartDelete = async (base, id) => {
  const forced = loadRouteCfg().delete;
  if (forced && forced !== "auto") {
    try { const res = await execDelete(forced, base, id); _deleteRouteCache[base] = forced; return res; }
    catch(e) { throw new Error(`[${forced}] Suppression échouée : ${e.message}`); }
  }
  if (_deleteRouteCache[base]) { try { return await execDelete(_deleteRouteCache[base], base, id); } catch {} }
  for (const s of DELETE_STRATEGIES.filter(s => s.key !== "auto")) {
    try { const res = await execDelete(s.key, base, id); _deleteRouteCache[base] = s.key; saveRouteCfg({...loadRouteCfg(), delete:s.key}); return res; } catch {}
  }
  throw new Error("Aucune route DELETE ne fonctionne. Configurez dans Paramètres API.");
};

const _putRouteCache = {};
const smartPut = async (base, id, body) => {
  const forced = loadRouteCfg().update;
  if (forced && forced !== "auto") {
    try { const res = await execUpdate(forced, base, id, body); _putRouteCache[base] = forced; return res; }
    catch(e) { throw new Error(`[${forced}] Modification échouée : ${e.message}`); }
  }
  if (_putRouteCache[base]) { try { return await execUpdate(_putRouteCache[base], base, id, body); } catch {} }
  for (const s of UPDATE_STRATEGIES.filter(s => s.key !== "auto")) {
    try { const res = await execUpdate(s.key, base, id, body); _putRouteCache[base] = s.key; saveRouteCfg({...loadRouteCfg(), update:s.key}); return res; } catch {}
  }
  throw new Error("Aucune route PUT/PATCH ne fonctionne.");
};

const multipartHeaders = () => {
  // Ne PAS inclure Content-Type — le navigateur le définit automatiquement avec le boundary pour FormData
  const h = { "x-api-key": API_KEY };
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

const postMultipart = async (url, body, files = {}) => {
  const fd = new FormData();
  Object.entries(body).forEach(([k,v]) => { if (v != null && !String(v).startsWith("blob:")) fd.append(k, String(v)); });
  Object.entries(files).forEach(([k,v]) => { if (v) fd.append(k, v); });
  const r = await fetch(url, { method:"POST", body:fd, headers:multipartHeaders() });
  if (!r.ok) { const t = await r.text(); throw new Error(`${r.status} — ${t}`); }
  return r.json().catch(() => ({}));
};

const putMultipart = async (url, body, files = {}) => {
  const fd = new FormData();
  Object.entries(body).forEach(([k,v]) => { if (v != null && !String(v).startsWith("blob:")) fd.append(k, String(v)); });
  Object.entries(files).forEach(([k,v]) => { if (v) fd.append(k, v); });
  let r = await fetch(url, { method:"PUT", body:fd, headers:multipartHeaders() });
  if (r.status === 404 || r.status === 405) r = await fetch(url, { method:"PATCH", body:fd, headers:multipartHeaders() });
  if (!r.ok) { const t = await r.text(); throw new Error(`${r.status} — ${t}`); }
  return r.json().catch(() => ({}));
};

// ── Misc helpers ──────────────────────────────────────────────────────────────
const initials    = (n="") => n.split(" ").filter(w=>w.length>1).slice(0,2).map(w=>w[0].toUpperCase()).join("");
const COLORS      = ["#2563EB","#1D9E75","#378ADD","#60A5FA","#7F77DD","#D4537E"];
const avatarColor = (n="") => COLORS[(n.charCodeAt(0)||0) % COLORS.length];
const fmtDate     = iso => iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";
const toDateVal   = iso => iso ? iso.slice(0,10) : "";
const imgSrc      = v => !v ? null : (v.startsWith("http") || v.startsWith("blob")) ? v : `${BASE}${v}`;

// ── TRASH local ───────────────────────────────────────────────────────────────
const TRASH_KEY = "ai_admin_projects_trash";
const loadTrash = () => { try { return JSON.parse(localStorage.getItem(TRASH_KEY) || "[]"); } catch { return []; } };
const saveTrash = (t) => { try { localStorage.setItem(TRASH_KEY, JSON.stringify(t.slice(0,50))); } catch {} };

// ═════════════════════════════════════════════════════════════════════════════
// CSS
// ═════════════════════════════════════════════════════════════════════════════
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{-webkit-text-size-adjust:100%;}
  @keyframes spin    {to{transform:rotate(360deg);}}
  @keyframes fadeUp  {from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn  {from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
  @keyframes drawerIn{from{opacity:0;transform:translateX(100%);}to{opacity:1;transform:translateX(0);}}
  @keyframes shimmer {0%{background-position:-400px 0}100%{background-position:400px 0}}
  input,textarea,select,button{font-family:inherit;}
  button:focus{outline:none;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-thumb{background:#d0cdc4;border-radius:99px;}

  /* Layout */
  .app-layout{display:flex;min-height:100vh;min-height:100dvh;}
  .sidebar{width:220px;flex-shrink:0;background:#0d1b35;display:flex;flex-direction:column;
    position:fixed;top:0;left:0;bottom:0;z-index:300;transition:transform .25s ease;overflow-y:auto;}
  .main-area{margin-left:220px;flex:1;min-width:0;}

  /* Grilles */
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;}
  .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .table-wrap table{min-width:520px;}

  /* Drawer */
  .drawer-overlay{position:fixed;inset:0;background:rgba(0,10,30,.55);z-index:500;display:flex;justify-content:flex-end;}
  .drawer-panel{width:min(480px,100vw);background:#fff;height:100vh;height:100dvh;display:flex;flex-direction:column;
    animation:drawerIn .28s cubic-bezier(.32,0,.67,0) forwards;box-shadow:-8px 0 40px rgba(0,0,0,.18);overflow:hidden;}
  .drawer-panel.wide{width:min(620px,100vw);}
  .drawer-header{padding:18px 22px;border-bottom:1px solid #ebe9e3;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
  .drawer-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:22px 22px 32px;}

  /* Nav */
  .nav-item{display:flex;align-items:center;gap:11px;padding:10px 16px;border-radius:10px;margin:2px 10px;
    cursor:pointer;transition:background .15s,color .15s;color:rgba(255,255,255,.55);font-size:13.5px;font-weight:500;
    border:none;background:none;width:calc(100% - 20px);text-align:left;}
  .nav-item:hover{background:rgba(37,99,235,.15);color:rgba(255,255,255,.85);}
  .nav-item.active{background:#2563EB;color:#fff;}
  .nav-item .nav-count{margin-left:auto;font-size:11px;font-weight:600;background:rgba(255,255,255,.12);padding:1px 7px;border-radius:99px;}
  .nav-item.active .nav-count{background:rgba(255,255,255,.25);}

  /* Tabs */
  .tab-bar{display:flex;gap:2px;background:#eff6ff;border-radius:10px;padding:3px;margin-bottom:20px;flex-wrap:wrap;}
  .tab-btn{flex:1;min-width:72px;padding:8px 10px;border:none;border-radius:8px;cursor:pointer;font-size:12.5px;
    font-weight:500;background:none;color:#888;transition:all .18s;white-space:nowrap;text-align:center;}
  .tab-btn.active{background:#fff;color:#0d1b35;box-shadow:0 1px 4px rgba(0,0,0,.1);}
  .tab-btn:hover:not(.active){background:rgba(255,255,255,.5);color:#555;}

  /* Badges statut */
  .badge-active  {display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;
    font-size:11px;font-weight:600;background:#eff6ff;color:#1D4ED8;border:1px solid #bfdbfe;}
  .badge-inactive{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;
    font-size:11px;font-weight:600;background:#eff6ff;color:#888;border:1px solid #e0dfd8;}
  .badge-deleted {display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;
    font-size:11px;font-weight:600;background:#eff6ff;color:#1D4ED8;border:1px solid #bfdbfe;}

  /* Directeur */
  .dir-photo-wrap{position:relative;width:110px;height:110px;border-radius:50%;overflow:hidden;
    border:3px solid #2563EB;flex-shrink:0;box-shadow:0 4px 18px rgba(37,99,235,.25);}
  .dir-photo-wrap img{width:100%;height:100%;object-fit:cover;display:block;}
  .dir-avatar-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#2563EB,#60A5FA);font-size:36px;font-weight:700;color:#fff;}
  .dir-badge{display:inline-flex;align-items:center;gap:5px;background:linear-gradient(90deg,#2563EB,#60A5FA);
    color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;letter-spacing:.06em;text-transform:uppercase;}

  /* Avant/Après toggle */
  .avap-toggle{display:inline-flex;border-radius:6px;overflow:hidden;border:1px solid #e0dfd8;}
  .avap-btn{padding:3px 10px;border:none;background:#f8faff;cursor:pointer;font-size:11px;
    font-weight:500;color:#888;transition:all .15s;}
  .avap-btn.active{background:#0d1b35;color:#fff;}

  /* Trash */
  .trash-row{display:flex;align-items:center;gap:12px;padding:10px 16px;
    border-bottom:1px solid #fef5f0;transition:background .15s;}
  .trash-row:hover{background:#fffaf8;}
  .trash-row:last-child{border-bottom:none;}

  /* Sous-desc */
  .subdesc-item{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;
    background:#f8faff;border-radius:8px;margin-bottom:6px;border:1px solid #e2e8f0;}

  /* Bouton statut inline */
  .status-toggle{cursor:pointer;border:none;font-family:inherit;padding:3px 10px;border-radius:99px;
    font-size:11px;font-weight:600;transition:all .15s;}

  /* ── RESPONSIVE ── */
  @media(max-width:900px){
    .sidebar{transform:translateX(-100%);}
    .sidebar.open{transform:translateX(0);box-shadow:4px 0 24px rgba(0,0,0,.35);}
    .main-area{margin-left:0;}
  }
  @media(max-width:820px){
    .col-hide-md{display:none!important;}
  }
  @media(max-width:640px){
    .col-hide-sm{display:none!important;}
    .trash-row{flex-wrap:wrap;gap:8px;}
  }
  @media(max-width:560px){
    .topbar-url{display:none!important;}
    .drawer-panel,.drawer-panel.wide{width:100vw!important;}
    .drawer-body{padding:16px 14px 28px!important;}
    .dir-photo-wrap{width:80px!important;height:80px!important;}
    .dir-avatar-fallback{font-size:26px!important;}
  }
  @media(max-width:480px){
    .grid-2{grid-template-columns:1fr!important;}
    .tab-btn{font-size:11px!important;padding:7px 5px!important;min-width:60px!important;}
  }

  /* ══ RESPONSIVE DASHBOARD COMPLET ═══════════════════════════════════════ */
  @media(max-width:900px){
    .main-area{margin-left:0;width:100%;}
    .app-layout{flex-direction:column;}
  }
  @media(max-width:768px){
    /* Topbar */
    .topbar-title{font-size:12px!important;}
    /* Sections */
    .section-header{flex-direction:column;align-items:flex-start!important;gap:10px!important;}
    /* Stats accueil */
    .dash-stats{grid-template-columns:repeat(2,1fr)!important;}
    /* Table scroll */
    .table-wrap{border-radius:12px;}
    /* Drawer large = plein écran */
    .drawer-panel.wide{width:100vw!important;}
    /* Form grids en colonne */
    .form-row-2{grid-template-columns:1fr!important;}
  }
  @media(max-width:560px){
    .drawer-panel{width:100vw!important;}
    .drawer-body{padding:14px 12px 28px!important;}
    .drawer-header{padding:14px 16px!important;}
    /* Topbar boutons */
    .topbar-url{display:none!important;}
    /* Table compacte */
    .table-wrap table{font-size:12px!important;}
    .table-wrap th,.table-wrap td{padding:8px 10px!important;}
    /* Nav items */
    .nav-item{font-size:13px!important;padding:9px 12px!important;}
    /* Image picker */
    .img-picker-label{font-size:11px!important;}
  }
  @media(max-width:400px){
    .grid-2{grid-template-columns:1fr!important;}
    .tab-bar{gap:1px;}
    .tab-btn{min-width:50px!important;font-size:10px!important;}
    .drawer-body{padding:12px 10px 24px!important;}
  }
  /* ══ FIN RESPONSIVE DASHBOARD ═══════════════════════════════════════════ */
`;

// ═════════════════════════════════════════════════════════════════════════════
// SKELETON
// ═════════════════════════════════════════════════════════════════════════════
const Sk = ({h=40,w="100%",mb=10,r=8}) => (
  <div style={{height:h,width:w,borderRadius:r,marginBottom:mb,
    background:"linear-gradient(90deg,#e8f0fe 25%,#dbeafe 50%,#e8f0fe 75%)",
    backgroundSize:"800px 100%",animation:"shimmer 1.4s infinite linear"}}/>
);
const TableSkeleton = ({rows=4}) => (
  <div style={{padding:"16px 20px"}}>
    {Array.from({length:rows}).map((_,i)=>(
      <div key={i} style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}>
        <Sk h={42} w={54} r={6} mb={0}/>
        <div style={{flex:1}}><Sk h={13} w="55%" mb={6}/><Sk h={11} w="35%" mb={0}/></div>
        <Sk h={30} w={130} mb={0}/>
      </div>
    ))}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// IMAGE PICKER
// ═════════════════════════════════════════════════════════════════════════════
function ImagePicker({ value, onChange, onFileChange, label="Photo / Image", maxH=200 }) {
  const [preview, setPreview] = useState(value ? imgSrc(value) : null);
  const [drag,    setDrag]    = useState(false);
  const [err,     setErr]     = useState("");
  const inputRef              = useRef();
  useEffect(() => { setPreview(value ? imgSrc(value) : null); }, [value]);

  const process = file => {
    if (!file || !file.type.startsWith("image/")) { setErr("Fichier invalide."); return; }
    setErr("");
    const local = URL.createObjectURL(file);
    setPreview(local);
    if (onFileChange) onFileChange(file);
    onChange(local);
  };
  const onFile = e => { process(e.target.files[0]); e.target.value=""; };
  const onDrop = e => { e.preventDefault(); setDrag(false); process(e.dataTransfer.files[0]); };
  const clear  = e => { e.stopPropagation(); setPreview(null); setErr(""); onChange(""); };

  return (
    <div style={{marginBottom:16}}>
      <label style={{fontSize:12,color:"#888",marginBottom:6,display:"block",fontWeight:500}}>{label}</label>
      <div onClick={()=>inputRef.current.click()}
        onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={onDrop}
        style={{border:`2px dashed ${drag?"#2563EB":"#ddd"}`,borderRadius:12,background:drag?"#eff6ff":"#faf9f7",
          cursor:"pointer",transition:"all .2s",overflow:"hidden",minHeight:preview?"auto":95,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {preview ? (
          <div style={{position:"relative",width:"100%"}}>
            <img src={preview} alt="" onError={e=>e.target.style.display="none"}
              style={{width:"100%",maxHeight:maxH,objectFit:"cover",display:"block"}}/>
            <div style={{position:"absolute",inset:0,opacity:0,transition:"all .2s",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
              onMouseEnter={e=>e.currentTarget.style.opacity=1}
              onMouseLeave={e=>e.currentTarget.style.opacity=0}>
              <button type="button" onClick={e=>{e.stopPropagation();inputRef.current.click();}}
                style={{padding:"6px 14px",background:"white",border:"none",borderRadius:99,fontSize:12,fontWeight:500,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.2)"}}>Changer</button>
              <button type="button" onClick={clear}
                style={{padding:"6px 14px",background:"#1D4ED8",color:"white",border:"none",borderRadius:99,fontSize:12,fontWeight:500,cursor:"pointer"}}>Supprimer</button>
            </div>
          </div>
        ) : (
          <div style={{padding:"18px",textAlign:"center"}}>
            <div style={{marginBottom:5,display:"flex",justifyContent:"center"}}><Camera size={24} color="#aaa"/></div>
            <div style={{fontSize:12,color:"#888"}}>Glisser ou <span style={{color:"#2563EB",textDecoration:"underline"}}>parcourir</span></div>
          </div>
        )}
      </div>
      {err && <div style={{fontSize:11,color:"#1D4ED8",marginTop:4}}>{err}</div>}
      <input ref={inputRef} type="file" accept="image/*,video/*,*/*" onChange={onFile} style={{display:"none"}}/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SHARED UI
// ═════════════════════════════════════════════════════════════════════════════
function Toast({ toasts }) {
  return (
    <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8,maxWidth:"calc(100vw - 40px)"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{background:t.type==="error"?"#1e3a8a":"#1C1C1A",color:"#fff",
          padding:"12px 18px",borderRadius:10,fontSize:13,display:"flex",alignItems:"center",gap:10,
          boxShadow:"0 4px 20px rgba(0,0,0,.25)",animation:"fadeIn .2s ease"}}>
          <span style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:t.type==="error"?"#F09595":"#1D9E75"}}/>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function DebugBar() {
  const logs = useDebugLogs();
  const [open,setOpen] = useState(true);
  if (!logs.length) return null;
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:8000,background:"#1a0a0a",
      borderTop:"2px solid #1D4ED8",fontFamily:"monospace",maxHeight:open?220:36,overflow:"hidden",transition:"max-height .3s ease"}}>
      <div style={{padding:"6px 14px",background:"#1D4ED8",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setOpen(v=>!v)}>
        <span style={{fontSize:12,color:"#fff",fontWeight:600,display:"flex",alignItems:"center",gap:5}}><AlertCircle size={12} color="#f87171"/>Erreurs API ({logs.length})</span>
        <span style={{fontSize:14,color:"#fff"}}>{open?"▼":"▲"}</span>
      </div>
      <div style={{maxHeight:180,overflowY:"auto"}}>
        {logs.map((l,i)=>(
          <div key={i} style={{padding:"4px 14px",fontSize:11,borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",flexWrap:"wrap",gap:"0 8px"}}>
            <span style={{color:"#888"}}>{l.time}</span>
            <span style={{color:"#60A5FA"}}>[{l.method}]</span>
            <span style={{color:"#fff",flex:1,wordBreak:"break-all"}}>{l.url}</span>
            <span style={{color:"#93c5fd"}}>{l.error?.slice(0,80)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, wide=false }) {
  useEffect(() => {
    const h = e => { if(e.key==="Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow=""; };
  }, [onClose]);
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className={`drawer-panel${wide?" wide":""}`} onClick={e=>e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{fontSize:15,fontWeight:600,color:"#1C1C1A"}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#bbb",width:32,height:32,borderRadius:8}}>×</button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
}

function Confirm({ msg, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:14,padding:"28px 24px",width:"min(340px,100%)",boxShadow:"0 10px 40px rgba(0,0,0,.22)",textAlign:"center"}}>
        <div style={{marginBottom:10,display:"flex",justifyContent:"center"}}><Trash2 size={32} color="#aaa"/></div>
        <div style={{fontSize:15,fontWeight:600,marginBottom:8}}>Confirmer la suppression</div>
        <div style={{fontSize:13,color:"#888",marginBottom:22,lineHeight:1.6}}>{msg}</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={onCancel} style={{padding:"9px 22px",borderRadius:99,border:"1px solid #ddd",background:"none",cursor:"pointer",fontSize:13}}>Annuler</button>
          <button onClick={onConfirm} style={{padding:"9px 22px",borderRadius:99,border:"none",background:"#1D4ED8",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:500}}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

const iS = {width:"100%",padding:"9px 12px",border:"1px solid #dbeafe",borderRadius:8,fontSize:13,color:"#1C1C1A",fontFamily:"inherit",outline:"none",background:"#f8faff",boxSizing:"border-box"};
const lS = {fontSize:12,color:"#888",marginBottom:5,display:"block",fontWeight:500};

const FInput = ({label,...p}) => (
  <div style={{marginBottom:13}}>
    <label style={lS}>{label}</label>
    <input style={iS} {...p} onFocus={e=>e.target.style.borderColor="#2563EB"} onBlur={e=>e.target.style.borderColor="#e0dfd8"}/>
  </div>
);
const FArea = ({label,rows=3,...p}) => (
  <div style={{marginBottom:13}}>
    <label style={lS}>{label}</label>
    <textarea rows={rows} style={{...iS,resize:"vertical",minHeight:72}} {...p}
      onFocus={e=>e.target.style.borderColor="#2563EB"} onBlur={e=>e.target.style.borderColor="#e0dfd8"}/>
  </div>
);

function StatusToggle({ actif, onToggle }) {
  return (
    <button onClick={onToggle}
      className={actif !== false ? "badge-active" : "badge-inactive"}
      style={{cursor:"pointer",border:"none",fontFamily:"inherit"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:actif!==false?"#1D9E75":"#bbb",flexShrink:0}}/>
      {actif !== false ? "Actif" : "Inactif"}
    </button>
  );
}

function SubmitBtn({ saving, label, onClick }) {
  return (
    <button type="button" onClick={onClick} disabled={saving} style={{
      width:"100%",padding:12,background:saving?"#93c5fd":"#2563EB",color:"#fff",
      border:"none",borderRadius:99,fontSize:14,fontWeight:500,cursor:saving?"not-allowed":"pointer",
      marginTop:8,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background .2s"}}>
      {saving ? <><div style={{width:16,height:16,border:"2px solid rgba(255,255,255,.4)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Enregistrement…</> : label}
    </button>
  );
}

function resolveIcon(icon, size=17) {
  const map = {
    domaines: <Building2 size={size} color="#2563EB"/>,
    projets: <Briefcase size={size} color="#60A5FA"/>,
    etudes: <FlaskConical size={size} color="#D4537E"/>,
    membres: <Users size={size} color="#7F77DD"/>,
    formations: <GraduationCap size={size} color="#2563EB"/>,
    calendrier: <Calendar size={size} color="#378ADD"/>,
    avis: <Star size={size} color="#60A5FA"/>,
    mail: <Mail size={size} color="#1D9E75"/>,
    partenaires: <Handshake size={size} color="#7F77DD"/>,
    directeur: <User size={size} color="#2563EB"/>,
    info: <Info size={size} color="#378ADD"/>,
    settings: <Settings size={size} color="#666"/>,
  };
  return map[icon] || <Layout size={size} color="#aaa"/>;
}

function Section({ title, icon, count, onAdd, addLabel="Ajouter", loading, children }) {
  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden",marginBottom:20}}>
      <div style={{padding:"13px 18px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {resolveIcon(icon)}
          <span style={{fontSize:14,fontWeight:600,color:"#1C1C1A"}}>{title}</span>
          <span style={{fontSize:11,color:"#aaa",background:"#eff6ff",padding:"2px 8px",borderRadius:99}}>{count}</span>
        </div>
        {onAdd && (
          <button onClick={onAdd} style={{padding:"7px 16px",background:"#2563EB",color:"#fff",border:"none",borderRadius:99,fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:16,lineHeight:1}}>+</span>{addLabel}
          </button>
        )}
      </div>
      {loading ? <TableSkeleton/> : children}
    </div>
  );
}

const Thumb = ({v,fallback}) => v
  ? <img src={imgSrc(v)} alt="" style={{width:48,height:38,objectFit:"cover",borderRadius:6,border:"1px solid #e2e8f0",display:"block"}} onError={e=>e.target.style.opacity=".15"}/>
  : <div style={{width:48,height:38,background:"#eff6ff",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{fallback}</div>;

function Table({ cols, rows, onEdit, onDelete }) {
  if (!rows.length) return (
    <div style={{textAlign:"center",padding:"44px 20px",color:"#ccc"}}>
      <div style={{fontSize:32,marginBottom:8}}>📭</div>
      <div style={{fontSize:13}}>Aucun élément. Cliquez sur + Ajouter.</div>
    </div>
  );
  return (
    <div className="table-wrap">
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:480}}>
        <thead>
          <tr style={{background:"#f8faff"}}>
            {cols.map(c=>(
              <th key={c.key} className={c.hideOn==="sm"?"col-hide-sm":c.hideOn==="md"?"col-hide-md":""}
                style={{padding:"9px 14px",textAlign:"left",fontWeight:500,color:"#999",fontSize:11,borderBottom:"1px solid #e2e8f0",textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}}>{c.label}</th>
            ))}
            <th style={{padding:"9px 14px",textAlign:"right",fontWeight:500,color:"#999",fontSize:11,borderBottom:"1px solid #e2e8f0",textTransform:"uppercase",letterSpacing:".05em"}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={row.id??i} style={{borderBottom:"1px solid #f5f3ef"}}
              onMouseEnter={e=>e.currentTarget.style.background="#fdfcfb"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {cols.map(c=>(
                <td key={c.key} className={c.hideOn==="sm"?"col-hide-sm":c.hideOn==="md"?"col-hide-md":""}
                  style={{padding:"10px 14px",verticalAlign:"middle",color:"#1C1C1A"}}>
                  {c.render ? c.render(row[c.key],row) : (row[c.key]??"—")}
                </td>
              ))}
              <td style={{padding:"10px 14px",textAlign:"right",whiteSpace:"nowrap"}}>
                <button onClick={()=>onEdit(row)} style={{padding:"5px 12px",marginRight:5,border:"1px solid #dbeafe",borderRadius:6,background:"none",fontSize:12,cursor:"pointer",color:"#1C1C1A"}}>Modifier</button>
                <button onClick={()=>onDelete(row)} style={{padding:"5px 12px",border:"1px solid #bfdbfe",borderRadius:6,background:"none",fontSize:12,cursor:"pointer",color:"#1D4ED8"}}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HOOK GÉNÉRIQUE CRUD
// ═════════════════════════════════════════════════════════════════════════════
function useCrud(endpoint, addToast, { imageField="image" }={}) {
  const [items,  setItems]  = useState(null);
  const [loading,setLoading]= useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (quiet=false) => {
    if (!quiet) setLoading(true);
    try {
      const data = await api.get(endpoint);
      setItems(Array.isArray(data) ? data : data?.data ?? data?.items ?? []);
    } catch(e) { addToast("Erreur chargement : "+e.message,"error"); setItems([]); }
    finally { setLoading(false); }
  }, [endpoint, addToast]);

  useEffect(() => { if(items===null) load(); }, [load]);

  const create = useCallback(async (body) => {
    setSaving(true);
    try {
      const {_imageFile,_imageFileBefore,_imageFileAfter,...fields} = body;
      const files = {};
      if (_imageFile) files[imageField] = _imageFile;
      if (_imageFileBefore) files["photoBefore"] = _imageFileBefore;
      if (_imageFileAfter)  files["photoAfter"]  = _imageFileAfter;
      let created;
      if (Object.keys(files).length) created = await postMultipart(endpoint, fields, files);
      else created = await api.post(endpoint, fields);
      setItems(prev=>[created,...(prev??[])]);
      addToast("Ajouté avec succès");
      return true;
    } catch(e) { addToast("Erreur ajout : "+e.message,"error"); load(true); return false; }
    finally { setSaving(false); }
  }, [endpoint, addToast, load, imageField]);

  const update = useCallback(async (id, body) => {
    setSaving(true);
    try {
      const {_imageFile,_imageFileBefore,_imageFileAfter,...fields} = body;
      const files = {};
      if (_imageFile) files[imageField] = _imageFile;
      if (_imageFileBefore) files["photoBefore"] = _imageFileBefore;
      if (_imageFileAfter)  files["photoAfter"]  = _imageFileAfter;
      let updated;
      if (Object.keys(files).length) updated = await putMultipart(`${endpoint}/${id}`, fields, files);
      else updated = await smartPut(endpoint, id, fields);
      setItems(prev=>(prev??[]).map(it=>it.id===id?{...it,...fields,...updated}:it));
      addToast("Mis à jour");
      return true;
    } catch(e) { addToast("Erreur modification : "+e.message,"error"); load(true); return false; }
    finally { setSaving(false); }
  }, [endpoint, addToast, load, imageField]);

  const remove = useCallback(async (id) => {
    try {
      await smartDelete(endpoint, id);
      setItems(prev=>(prev??[]).filter(it=>it.id!==id));
      addToast("Supprimé");
      return true;
    } catch(e) { addToast("Erreur suppression : "+e.message,"error"); load(true); return false; }
  }, [endpoint, addToast, load]);

  const toggleStatus = useCallback(async (id, newActif) => {
    try {
      await smartPut(endpoint, id, {actif:newActif});
      setItems(prev=>(prev??[]).map(it=>it.id===id?{...it,actif:newActif}:it));
      addToast(newActif?"Activé":"Désactivé");
    } catch(e) { addToast("Erreur : "+e.message,"error"); }
  }, [endpoint, addToast]);

  return { items:items??[], loading:loading||items===null, saving, load, create, update, remove, toggleStatus };
}

// ═════════════════════════════════════════════════════════════════════════════
// HOOK SINGLETON Directeur
// ═════════════════════════════════════════════════════════════════════════════
function useDirecteur(addToast) {
  const [data,   setData]   = useState(undefined);
  const [loading,setLoading]= useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await api.get(API.directeur);
      if (Array.isArray(raw))   setData(raw[0]||null);
      else if (raw?.id)         setData(raw);
      else if (raw?.data)       setData(Array.isArray(raw.data)?raw.data[0]:raw.data||null);
      else                      setData(null);
    } catch(e) { addToast("Erreur chargement directeur : "+e.message,"error"); setData(null); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (body) => {
    setSaving(true);
    try {
      const {_imageFile,...fields} = body;
      let result;
      if (data?.id) {
        if (_imageFile) {
          try { result = await putMultipart(`${API.directeur}/${data.id}`, fields, {photo:_imageFile}); }
          catch { try { result = await postMultipart(`${API.directeur}/${data.id}`, fields, {photo:_imageFile}); } catch { result = fields; } }
        } else {
          try { result = await api.put(`${API.directeur}/${data.id}`, fields); }
          catch { try { result = await api.patch(`${API.directeur}/${data.id}`, fields); } catch { result = fields; } }
        }
        setData(prev=>({...prev,...fields,...(result||{})}));
        addToast("Directeur mis à jour");
      } else {
        if (_imageFile) {
          try { result = await postMultipart(API.directeur, fields, {photo:_imageFile}); }
          catch { try { result = await api.post(API.directeur, fields); } catch { result = fields; } }
        } else {
          try { result = await api.post(API.directeur, fields); } catch { result = fields; }
        }
        setData(result||fields);
        addToast("Directeur enregistré");
      }
      return true;
    } catch(e) { addToast("Enregistré avec avertissement","error"); load(); return true; }
    finally { setSaving(false); }
  }, [data, addToast, load]);

  const remove = useCallback(async () => {
    if (!data?.id) return false;
    try { await smartDelete(API.directeur, data.id); setData(null); addToast("Directeur supprimé"); return true; }
    catch(e) { addToast("Erreur : "+e.message,"error"); return false; }
  }, [data, addToast]);

  return { data, loading, saving, save, remove };
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE HEADER
// ═════════════════════════════════════════════════════════════════════════════
function PageHeader({ title, icon, subtitle, onAdd, addLabel }) {
  return (
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:22,width:"100%"}}>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:4}}>
          <span style={{fontSize:22}}>{resolveIcon(icon, 22)}</span>
          <h1 style={{fontSize:20,fontWeight:600,color:"#1C1C1A"}}>{title}</h1>
        </div>
        {subtitle && <p style={{fontSize:12,color:"#bbb",paddingLeft:31}}>{subtitle}</p>}
      </div>
      {onAdd && (
        <button onClick={onAdd} style={{padding:"10px 22px",background:"#2563EB",color:"#fff",border:"none",borderRadius:99,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 14px rgba(37,99,235,.35)",fontFamily:"inherit"}}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
          onMouseLeave={e=>e.currentTarget.style.transform=""}>
          <span style={{fontSize:18,lineHeight:1}}>+</span>{addLabel||"Ajouter"}
        </button>
      )}
    </div>
  );
}

// ─── Bouton statut formulaire ─────────────────────────────────────────────────
function StatusSelector({ value, onChange }) {
  return (
    <div style={{marginBottom:16}}>
      <label style={lS}>Statut</label>
      <div style={{display:"flex",gap:10}}>
        {[{v:true,l:"Actif"},{v:false,l:"Inactif"}].map(opt=>(
          <button key={String(opt.v)} type="button" onClick={()=>onChange(opt.v)}
            style={{padding:"8px 20px",borderRadius:99,border:"2px solid",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:500,transition:"all .15s",
              borderColor:value===opt.v?"#2563EB":"#e0dfd8",background:value===opt.v?"#eff6ff":"transparent",color:value===opt.v?"#2563EB":"#888"}}>
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Sous-descriptions dynamiques ─────────────────────────────────────────────
function SousDescriptions({ value=[], onChange }) {
  const add    = () => onChange([...value, {titre:"",texte:""}]);
  const remove = i  => onChange(value.filter((_,j)=>j!==i));
  const upd    = (i,k,v) => onChange(value.map((item,j)=>j===i?{...item,[k]:v}:item));
  const move   = (i,dir) => {
    const arr=[...value]; const j=i+dir;
    if(j<0||j>=arr.length) return;
    [arr[i],arr[j]]=[arr[j],arr[i]]; onChange(arr);
  };
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <label style={lS}>Points clés / Sous-descriptions</label>
        <button type="button" onClick={add}
          style={{padding:"4px 12px",background:"#2563EB",color:"#fff",border:"none",borderRadius:99,fontSize:11,fontWeight:600,cursor:"pointer"}}>+ Ajouter</button>
      </div>
      {value.length===0 && (
        <div style={{textAlign:"center",padding:"14px",background:"#f8faff",borderRadius:8,border:"1px dashed #ddd",fontSize:12,color:"#bbb"}}>
          Aucun point — cliquez "+ Ajouter" pour démarrer
        </div>
      )}
      {value.map((item,i)=>(
        <div key={i} className="subdesc-item">
          <div style={{flex:1}}>
            <input value={item.titre} onChange={e=>upd(i,"titre",e.target.value)}
              placeholder={`Point ${i+1} — Titre`}
              style={{...iS,marginBottom:6,padding:"7px 10px",fontSize:12}}
              onFocus={e=>e.target.style.borderColor="#2563EB"} onBlur={e=>e.target.style.borderColor="#e0dfd8"}/>
            <textarea value={item.texte} onChange={e=>upd(i,"texte",e.target.value)}
              placeholder="Détail, bénéfice, explication…" rows={2}
              style={{...iS,resize:"vertical",minHeight:50,padding:"7px 10px",fontSize:12}}
              onFocus={e=>e.target.style.borderColor="#2563EB"} onBlur={e=>e.target.style.borderColor="#e0dfd8"}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
            <button type="button" onClick={()=>move(i,-1)} disabled={i===0}
              style={{padding:"3px 8px",background:"#eff6ff",border:"1px solid #dbeafe",borderRadius:5,cursor:"pointer",fontSize:11,color:"#666",display:"inline-flex",alignItems:"center"}}><ChevronUp size={13}/></button>
            <button type="button" onClick={()=>move(i,1)} disabled={i===value.length-1}
              style={{padding:"3px 8px",background:"#eff6ff",border:"1px solid #dbeafe",borderRadius:5,cursor:"pointer",fontSize:11,color:"#666",display:"inline-flex",alignItems:"center"}}><ChevronDown size={13}/></button>
            <button type="button" onClick={()=>remove(i)}
              style={{padding:"3px 8px",background:"#fff0f0",border:"1px solid #bfdbfe",borderRadius:5,cursor:"pointer",fontSize:11,color:"#1D4ED8"}}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── DOMAINES  (statut + sous-descriptions + vidéo) ──────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function DomainesSection({ addToast, onCountChange }) {
  const { items, loading, saving, create, update, remove, toggleStatus } = useCrud(API.domaines, addToast);
  const [modal,  setModal]  = useState(null);
  const [confirm,setConf]   = useState(null);
  const [tab,    setTab]    = useState("actifs");

  const blank = { name:"", description:"", imageUrl:"", videoUrl:"", actif:true, sousDescriptions:[], _imageFile:null };
  const [form, setForm] = useState(blank);
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const actifs   = items.filter(it=>it.actif!==false);
  const inactifs = items.filter(it=>it.actif===false);
  const displayed = tab==="actifs" ? actifs : inactifs;

  useEffect(()=>{ if(onCountChange) onCountChange(actifs.length); },[actifs.length]);

  const openAdd  = () => { setForm({...blank}); setModal({mode:"add"}); };
  const openEdit = row => {
    let subs = [];
    try { subs = Array.isArray(row.sousDescriptions) ? row.sousDescriptions : JSON.parse(row.sousDescriptions||"[]"); } catch {}
    setForm({ name:row.name||"", description:row.description||"", imageUrl:row.imageUrl||"",
      videoUrl:row.videoUrl||"", actif:row.actif!==false, sousDescriptions:subs, _imageFile:null });
    setModal({mode:"edit",data:row});
  };

  const save = async () => {
    if (!form.name.trim()) return addToast("Le nom est requis","error");
    const payload = { ...form, sousDescriptions:JSON.stringify(form.sousDescriptions) };
    const ok = modal.mode==="add" ? await create(payload) : await update(modal.data.id, payload);
    if (ok) setModal(null);
  };

  const cols = [
    { key:"imageUrl",        label:"Photo",       render:v=><Thumb v={v} fallback={<Building2 size={20} color="#ddd"/>}/> },
    { key:"name",            label:"Nom",          render:v=><strong>{v}</strong> },
    { key:"actif",           label:"Statut",       render:(_,row)=><StatusToggle actif={row.actif} onToggle={()=>toggleStatus(row.id,row.actif===false)}/> },
    { key:"sousDescriptions",label:"Points", hideOn:"sm",
      render:v=>{let n=0;try{n=Array.isArray(v)?v.length:JSON.parse(v||"[]").length;}catch{}return <span style={{color:"#aaa",fontSize:11}}>{n} pt{n>1?"s":""}</span>;} },
    { key:"description",     label:"Description",  hideOn:"md",
      render:v=><span style={{color:"#888"}}>{(v||"").slice(0,45)}{(v?.length??0)>45?"…":""}</span> },
  ];

  return (
    <>
      <PageHeader title="Domaines d'activité" icon="domaines" onAdd={openAdd} addLabel="Nouveau domaine"
        subtitle="Gérez les domaines avec statut actif/inactif, points clés et vidéo."/>

      <div className="tab-bar">
        <button className={`tab-btn${tab==="actifs"?" active":""}`}  onClick={()=>setTab("actifs")}>Actifs ({actifs.length})</button>
        <button className={`tab-btn${tab==="inactifs"?" active":""}`} onClick={()=>setTab("inactifs")}>Inactifs ({inactifs.length})</button>
      </div>

      <Section title="Domaines d'activité" icon="domaines" count={displayed.length} loading={loading}>
        <Table cols={cols} rows={displayed} onEdit={openEdit} onDelete={setConf}/>
      </Section>

      {modal && (
        <Modal title={modal.mode==="add"?"Nouveau domaine":"Modifier le domaine"} onClose={()=>setModal(null)} wide>
          <ImagePicker value={form.imageUrl} onChange={url=>setForm(f=>({...f,imageUrl:url}))} onFileChange={file=>setForm(f=>({...f,_imageFile:file}))}/>
          <FInput label="Nom *" value={form.name} onChange={F("name")} placeholder="Ex: Maintenance industrielle"/>
          <FArea  label="Description principale" value={form.description} onChange={F("description")} placeholder="Vue d'ensemble du domaine…"/>
          <SousDescriptions value={form.sousDescriptions} onChange={v=>setForm(f=>({...f,sousDescriptions:v}))}/>
          <FInput label="URL Vidéo (optionnel)" value={form.videoUrl} onChange={F("videoUrl")} placeholder="https://youtube.com/embed/..."/>
          <StatusSelector value={form.actif} onChange={v=>setForm(f=>({...f,actif:v}))}/>
          <SubmitBtn saving={saving} label={modal.mode==="add"?"Créer le domaine":"Enregistrer"} onClick={save}/>
        </Modal>
      )}

      {confirm && <Confirm msg={`Supprimer "${confirm.name}" ?`} onConfirm={async()=>{const ok=await remove(confirm.id);if(ok)setConf(null);}} onCancel={()=>setConf(null)}/>}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── PROJETS  (statut + historique des supprimés) ─────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function ProjetsSection({ addToast, onCountChange }) {
  const { items, loading, saving, create, update, remove, toggleStatus } = useCrud(API.projects, addToast);
  const [modal,        setModal]        = useState(null);
  const [confirm,      setConf]         = useState(null);
  const [tab,          setTab]          = useState("actifs");
  const [trash,        setTrash]        = useState(loadTrash);
  const [trashConfirm, setTrashConfirm] = useState(null);

  const actifs   = items.filter(it=>it.actif!==false);
  const inactifs = items.filter(it=>it.actif===false);
  const displayed = tab==="actifs" ? actifs : tab==="inactifs" ? inactifs : [];

  useEffect(()=>{ if(onCountChange) onCountChange(actifs.length); },[actifs.length]);

  const blank = { title:"", description:"", date:"", imageUrl:"", actif:true, _imageFile:null };
  const [form, setForm] = useState(blank);
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const openAdd  = () => { setForm({...blank}); setModal({mode:"add"}); };
  const openEdit = row => {
    setForm({ title:row.title||"", description:row.description||"",
      date:toDateVal(row.date), imageUrl:row.imageUrl||"", actif:row.actif!==false, _imageFile:null });
    setModal({mode:"edit",data:row});
  };

  const save = async () => {
    if (!form.title.trim()) return addToast("Le titre est requis","error");
    const ok = modal.mode==="add" ? await create({...form,date:form.date||null}) : await update(modal.data.id,{...form,date:form.date||null});
    if (ok) setModal(null);
  };

  // Supprimer → ajouter en corbeille locale
  const handleDelete = async () => {
    const item = confirm;
    const ok = await remove(item.id);
    if (ok) {
      const newTrash = [{...item, _deletedAt:new Date().toISOString()}, ...trash].slice(0,50);
      setTrash(newTrash); saveTrash(newTrash); setConf(null);
    }
  };

  const purgeOne  = idx => { const t=trash.filter((_,i)=>i!==idx); setTrash(t); saveTrash(t); setTrashConfirm(null); };
  const purgeAll  = ()  => { if(window.confirm("Vider tout l'historique ?")){ setTrash([]); saveTrash([]); } };
  const restoreItem = async item => {
    const {_deletedAt,...body} = item;
    const ok = await create({...body, id:undefined});
    if (ok) { const t=trash.filter(t=>t!==item); setTrash(t); saveTrash(t); }
  };

  const cols = [
    { key:"imageUrl",    label:"Photo",  render:v=><Thumb v={v} fallback={<Briefcase size={20} color="#ddd"/>}/> },
    { key:"title",       label:"Titre",  render:v=><strong>{v}</strong> },
    { key:"actif",       label:"Statut", render:(_,row)=><StatusToggle actif={row.actif} onToggle={()=>toggleStatus(row.id,row.actif===false)}/> },
    { key:"description", label:"Desc.",  hideOn:"sm", render:v=><span style={{color:"#888"}}>{(v||"").slice(0,40)}{(v?.length??0)>40?"…":""}</span> },
    { key:"date",        label:"Date",   hideOn:"md", render:v=><span style={{color:"#888",whiteSpace:"nowrap"}}>{fmtDate(v)}</span> },
  ];

  return (
    <>
      <PageHeader title="Projets" icon="projets" onAdd={openAdd} addLabel="Nouveau projet"
        subtitle="Statut actif/inactif et historique complet des projets supprimés."/>

      <div className="tab-bar">
        <button className={`tab-btn${tab==="actifs"?" active":""}`}   onClick={()=>setTab("actifs")}>Actifs ({actifs.length})</button>
        <button className={`tab-btn${tab==="inactifs"?" active":""}`}  onClick={()=>setTab("inactifs")}>Inactifs ({inactifs.length})</button>
        <button className={`tab-btn${tab==="trash"?" active":""}`}     onClick={()=>setTab("trash")}>🗂 Historique ({trash.length})</button>
      </div>

      {tab !== "trash" ? (
        <Section title="Projets" icon="projets" count={displayed.length} loading={loading}>
          <Table cols={cols} rows={displayed} onEdit={openEdit} onDelete={setConf}/>
        </Section>
      ) : (
        /* ── CORBEILLE ── */
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"13px 18px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:17}}>🗂</span>
            <span style={{fontSize:14,fontWeight:600,color:"#1C1C1A"}}>Historique des projets supprimés</span>
            <span style={{fontSize:11,color:"#aaa",background:"#eff6ff",padding:"2px 8px",borderRadius:99}}>{trash.length}</span>
            {trash.length>0 && <button onClick={purgeAll} style={{marginLeft:"auto",padding:"5px 12px",border:"1px solid #bfdbfe",borderRadius:99,background:"none",fontSize:11,cursor:"pointer",color:"#1D4ED8"}}>Tout vider</button>}
          </div>
          {trash.length===0 ? (
            <div style={{textAlign:"center",padding:"44px 20px",color:"#ccc"}}>
              <div style={{fontSize:32,marginBottom:8}}>🗂</div>
              <div style={{fontSize:13}}>Aucun projet supprimé pour l'instant.</div>
            </div>
          ) : trash.map((item,i)=>(
            <div key={i} className="trash-row">
              <Thumb v={item.imageUrl} fallback={<Briefcase size={20} color="#ddd"/>}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:"#666",textDecoration:"line-through"}}>{item.title}</div>
                <div style={{fontSize:11,color:"#bbb",marginTop:2}}>
                  Supprimé le {new Date(item._deletedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})}
                  {item.date && ` · Projet du ${fmtDate(item.date)}`}
                </div>
              </div>
              <span className="badge-deleted" style={{display:"inline-flex",alignItems:"center",gap:4}}><Trash2 size={11}/>Supprimé</span>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>restoreItem(item)}
                  style={{padding:"5px 12px",border:"1px solid #c6f0db",borderRadius:6,background:"none",fontSize:11,cursor:"pointer",color:"#1D9E75",fontWeight:500}}>↩ Restaurer</button>
                <button onClick={()=>setTrashConfirm(i)}
                  style={{padding:"5px 10px",border:"1px solid #bfdbfe",borderRadius:6,background:"none",fontSize:11,cursor:"pointer",color:"#1D4ED8"}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal.mode==="add"?"Nouveau projet":"Modifier le projet"} onClose={()=>setModal(null)}>
          <ImagePicker value={form.imageUrl} onChange={url=>setForm(f=>({...f,imageUrl:url}))} onFileChange={file=>setForm(f=>({...f,_imageFile:file}))}/>
          <FInput label="Titre *" value={form.title} onChange={F("title")} placeholder="Ex: Humidification en égrenage"/>
          <FArea  label="Description" value={form.description} onChange={F("description")} placeholder="Résultats, contexte, client…"/>
          <FInput label="Date du projet" type="date" value={form.date} onChange={F("date")}/>
          <StatusSelector value={form.actif} onChange={v=>setForm(f=>({...f,actif:v}))}/>
          <SubmitBtn saving={saving} label={modal.mode==="add"?"Créer le projet":"Enregistrer"} onClick={save}/>
        </Modal>
      )}

      {confirm && <Confirm msg={`Supprimer "${confirm.title}" ? Il sera conservé dans l'historique.`} onConfirm={handleDelete} onCancel={()=>setConf(null)}/>}
      {trashConfirm!==null && <Confirm msg={`Supprimer définitivement "${trash[trashConfirm]?.title}" de l'historique ?`} onConfirm={()=>purgeOne(trashConfirm)} onCancel={()=>setTrashConfirm(null)}/>}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── ÉTUDES DE CAS & RÉALISATIONS  (avant / après) ───────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function EtudesSection({ addToast, onCountChange }) {
  const { items, loading, saving, create, update, remove } = useCrud(API.etudes, addToast);
  const [modal,    setModal]    = useState(null);
  const [confirm,  setConf]     = useState(null);
  const [avapView, setAvapView] = useState({});

  useEffect(()=>{ if(onCountChange) onCountChange(items.length); },[items.length]);

  const blank = { titre:"", description:"", client:"", categorie:"", date:"",
    imageAvant:"", imageApres:"", _imageFileBefore:null, _imageFileAfter:null };
  const [form, setForm] = useState(blank);
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const openAdd  = () => { setForm({...blank}); setModal({mode:"add"}); };
  const openEdit = row => {
    setForm({ titre:row.titre||row.title||"", description:row.description||"",
      client:row.client||"", categorie:row.categorie||"", date:toDateVal(row.date),
      imageAvant:row.imageAvant||row.photoBefore||"",
      imageApres:row.imageApres||row.photoAfter||"",
      _imageFileBefore:null, _imageFileAfter:null });
    setModal({mode:"edit",data:row});
  };

  const save = async () => {
    if (!form.titre.trim()) return addToast("Le titre est requis","error");
    const payload = { ...form, title:form.titre, photoBefore:form.imageAvant, photoAfter:form.imageApres, date:form.date||null };
    const ok = modal.mode==="add" ? await create(payload) : await update(modal.data.id, payload);
    if (ok) setModal(null);
  };

  // Avant/Après toggle dans le tableau
  const AvapCell = ({row}) => {
    const view = avapView[row.id]||"avant";
    const src  = view==="avant" ? (row.imageAvant||row.photoBefore) : (row.imageApres||row.photoAfter);
    return (
      <div>
        <div className="avap-toggle" style={{marginBottom:4}}>
          <button className={`avap-btn${view==="avant"?" active":""}`} onClick={e=>{e.stopPropagation();setAvapView(v=>({...v,[row.id]:"avant"}))}}>Avant</button>
          <button className={`avap-btn${view==="apres"?" active":""}`} onClick={e=>{e.stopPropagation();setAvapView(v=>({...v,[row.id]:"apres"}))}}>Après</button>
        </div>
        <Thumb v={src} fallback={view==="avant"?"📸":"✨"}/>
      </div>
    );
  };

  const cols = [
    { key:"imageAvant", label:"Avant / Après", render:(_,row)=><AvapCell row={row}/> },
    { key:"titre",      label:"Titre",          render:v=><strong>{v||"—"}</strong> },
    { key:"client",     label:"Client",         hideOn:"sm", render:v=><span style={{color:"#888"}}>{v||"—"}</span> },
    { key:"categorie",  label:"Catégorie",      hideOn:"md",
      render:v=>v ? <span style={{fontSize:11,padding:"2px 8px",background:"#eff6ff",color:"#2563EB",borderRadius:99,border:"1px solid #bfdbfe"}}>{v}</span>
                  : <span style={{color:"#ddd"}}>—</span> },
    { key:"date",       label:"Date",           hideOn:"md",
      render:v=><span style={{color:"#888",whiteSpace:"nowrap"}}>{fmtDate(v)}</span> },
  ];

  return (
    <>
      <PageHeader title="Études de cas & Réalisations" icon="etudes" onAdd={openAdd} addLabel="Nouvelle étude"
        subtitle="Avant / après avec photo, titre, description, client et catégorie."/>

      <Section title="Études de cas" icon="etudes" count={items.length} loading={loading}>
        <Table cols={cols} rows={items} onEdit={openEdit} onDelete={setConf}/>
      </Section>

      {modal && (
        <Modal title={modal.mode==="add"?"Nouvelle étude de cas":"Modifier l'étude"} onClose={()=>setModal(null)} wide>

          {/* Aperçu avant/après */}
          {(form.imageAvant||form.imageApres) && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[{key:"imageAvant",label:"📸 AVANT"},{key:"imageApres",label:"✨ APRÈS"}].map(side=>(
                <div key={side.key} style={{background:"#eff6ff",borderRadius:10,overflow:"hidden",border:"1px solid #e2e8f0"}}>
                  <div style={{padding:"5px 10px",fontSize:10,fontWeight:700,color:"#888",letterSpacing:".06em",background:"#f8faff",borderBottom:"1px solid #e2e8f0"}}>{side.label}</div>
                  {form[side.key]
                    ? <img src={imgSrc(form[side.key])} alt={side.label} style={{width:"100%",height:90,objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>
                    : <div style={{height:90,display:"flex",alignItems:"center",justifyContent:"center",color:"#ddd"}}>{side.key==="imageAvant"?<Camera size={22} color="#ddd"/>:<FolderOpen size={22} color="#ddd"/>}</div>
                  }
                </div>
              ))}
            </div>
          )}

          <div className="grid-2">
            <ImagePicker label="📸 Photo AVANT" value={form.imageAvant}
              onChange={url=>setForm(f=>({...f,imageAvant:url}))}
              onFileChange={file=>setForm(f=>({...f,_imageFileBefore:file}))} maxH={130}/>
            <ImagePicker label="✨ Photo APRÈS" value={form.imageApres}
              onChange={url=>setForm(f=>({...f,imageApres:url}))}
              onFileChange={file=>setForm(f=>({...f,_imageFileAfter:file}))} maxH={130}/>
          </div>

          <FInput label="Titre *" value={form.titre} onChange={F("titre")} placeholder="Ex: Rénovation du système de refroidissement"/>
          <FArea  label="Description" rows={4} value={form.description} onChange={F("description")}
            placeholder="Contexte, défi rencontré, approche adoptée, résultats obtenus…"/>
          <div className="grid-2">
            <FInput label="Client / Entreprise" value={form.client} onChange={F("client")} placeholder="Ex: Cotivo SA"/>
            <FInput label="Catégorie"           value={form.categorie} onChange={F("categorie")} placeholder="Ex: Maintenance, Génie civil…"/>
          </div>
          <FInput label="Date de réalisation" type="date" value={form.date} onChange={F("date")}/>

          <div style={{background:"#f0f9f5",border:"1px solid #c6f0db",borderRadius:8,padding:"10px 13px",marginBottom:14,fontSize:12,color:"#1D6E4A",lineHeight:1.6}}>
            <strong>📡 Images envoyées :</strong>{" "}
            <code style={{background:"rgba(0,0,0,.06)",padding:"1px 5px",borderRadius:3}}>photoBefore</code> +{" "}
            <code style={{background:"rgba(0,0,0,.06)",padding:"1px 5px",borderRadius:3}}>photoAfter</code>{" "}(multipart/form-data)
          </div>

          <SubmitBtn saving={saving} label={modal.mode==="add"?"Créer l'étude de cas":"Enregistrer les modifications"} onClick={save}/>
        </Modal>
      )}

      {confirm && <Confirm msg={`Supprimer l'étude "${confirm.titre||confirm.title}" ?`} onConfirm={async()=>{const ok=await remove(confirm.id);if(ok)setConf(null);}} onCancel={()=>setConf(null)}/>}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── MEMBRES ──────────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function MembresSection({ addToast, onCountChange }) {
  const { items, loading, saving, create, update, remove } = useCrud(API.members, addToast);
  const [modal, setModal]   = useState(null);
  const [confirm, setConf]  = useState(null);
  const blank = { name:"", role:"", department:"", email:"", phone:"", imageUrl:"", bio:"", _imageFile:null };
  const [form, setForm] = useState(blank);
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(()=>{ if(onCountChange) onCountChange(items.length); },[items.length]);

  const openAdd  = () => { setForm({...blank}); setModal({mode:"add"}); };
  const openEdit = row => {
    setForm({ name:row.name||"", role:row.role||"", department:row.department||"",
      email:row.email||"", phone:row.phone||"", imageUrl:row.imageUrl||"", bio:row.bio||"", _imageFile:null });
    setModal({mode:"edit",data:row});
  };

  const save = async () => {
    if (!form.name.trim()||!form.role.trim()) return addToast("Nom et rôle requis","error");
    const ok = modal.mode==="add" ? await create(form) : await update(modal.data.id,form);
    if (ok) setModal(null);
  };

  const cols = [
    { key:"imageUrl", label:"Photo", render:(v,row)=>v
      ? <img src={imgSrc(v)} alt="" style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",border:"2px solid #ebe9e3"}} onError={e=>e.target.style.display="none"}/>
      : <div style={{width:34,height:34,borderRadius:"50%",background:avatarColor(row.name||""),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff"}}>{initials(row.name||"")}</div>
    },
    { key:"name",       label:"Membre", render:v=><strong>{v}</strong> },
    { key:"role",       label:"Rôle" },
    { key:"department", label:"Dept",  hideOn:"sm", render:v=><span style={{color:"#888"}}>{v||"—"}</span> },
    { key:"email",      label:"Email", hideOn:"md", render:v=><span style={{color:"#378ADD",fontSize:12}}>{v||"—"}</span> },
  ];

  return (
    <>
      <PageHeader title="Membres de l'équipe" icon="membres" onAdd={openAdd} addLabel="Nouveau membre"
        subtitle="Gérez les profils de l'équipe affichés sur le site."/>
      <Section title="Membres de l'équipe" icon="membres" count={items.length} loading={loading}>
        <Table cols={cols} rows={items} onEdit={openEdit} onDelete={setConf}/>
      </Section>
      {modal && (
        <Modal title={modal.mode==="add"?"Nouveau membre":"Modifier le membre"} onClose={()=>setModal(null)}>
          <ImagePicker value={form.imageUrl} onChange={url=>setForm(f=>({...f,imageUrl:url}))} onFileChange={file=>setForm(f=>({...f,_imageFile:file}))}/>
          <div className="grid-2">
            <div style={{gridColumn:"1/-1"}}><FInput label="Nom complet *" value={form.name} onChange={F("name")} placeholder="Ex: Dr. Koné Didier"/></div>
            <FInput label="Rôle / Poste *"  value={form.role}       onChange={F("role")}       placeholder="Ex: Ingénieur Civil"/>
            <FInput label="Département"     value={form.department} onChange={F("department")} placeholder="Ex: Maintenance"/>
            <FInput label="Email" type="email" value={form.email}   onChange={F("email")}     placeholder="nom@africa-ingenierie.com"/>
            <FInput label="Téléphone"       value={form.phone}      onChange={F("phone")}      placeholder="+221 77 XXX XX XX"/>
          </div>
          <FArea label="Description du profil" rows={4} value={form.bio} onChange={F("bio")} placeholder="Parcours, expertises…"/>
          <SubmitBtn saving={saving} label={modal.mode==="add"?"Ajouter le membre":"Enregistrer"} onClick={save}/>
        </Modal>
      )}
      {confirm && <Confirm msg={`Supprimer le membre "${confirm.name}" ?`} onConfirm={async()=>{const ok=await remove(confirm.id);if(ok)setConf(null);}} onCancel={()=>setConf(null)}/>}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── FORMATIONS ───────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function FormationsSection({ addToast, onCountChange }) {
  const { items, loading, saving, create, update, remove } = useCrud(API.formations, addToast);
  const [modal,    setModal]   = useState(null);
  const [confirm,  setConf]    = useState(null);
  const [domaines, setDomaines]= useState([]);

  const blank = { title:"", description:"", date:"", imageUrl:"", domaineId:"", _imageFile:null };
  const [form, setForm] = useState(blank);
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(()=>{ if(onCountChange) onCountChange(items.length); },[items.length]);

  // Charger la liste des domaines pour le select
  useEffect(()=>{
    api.get(API.domaines)
      .then(data => setDomaines(Array.isArray(data) ? data : data?.data ?? []))
      .catch(()=>{});
  },[]);

  const openAdd  = () => { setForm({...blank}); setModal({mode:"add"}); };
  const openEdit = row => {
    setForm({
      title:       row.title||"",
      description: row.description||"",
      date:        toDateVal(row.date),
      imageUrl:    row.imageUrl||"",
      domaineId:   row.domaineId||row.domaine?.id||"",
      _imageFile:  null,
    });
    setModal({mode:"edit",data:row});
  };

  const save = async () => {
    if (!form.title.trim()) return addToast("Le titre est requis","error");
    const payload = { ...form, date:form.date||null, domaineId:form.domaineId||null };
    const ok = modal.mode==="add" ? await create(payload) : await update(modal.data.id, payload);
    if (ok) setModal(null);
  };

  const cols = [
    { key:"imageUrl",    label:"Photo",   render:v=><Thumb v={v} fallback={<GraduationCap size={20} color="#ddd"/>}/> },
    { key:"title",       label:"Titre",   render:v=><strong>{v}</strong> },
    { key:"domaine",     label:"Domaine", hideOn:"sm",
      render:(v,row)=> {
        const nom = v?.name || domaines.find(d=>d.id===row.domaineId)?.name;
        return nom
          ? <span style={{fontSize:11,padding:"2px 9px",background:"#eff6ff",color:"#2563EB",
              borderRadius:99,border:"1px solid #bfdbfe",fontWeight:500}}>{nom}</span>
          : <span style={{color:"#ddd",fontSize:11}}>—</span>;
      }
    },
    { key:"description", label:"Description", hideOn:"md",
      render:v=><span style={{color:"#888"}}>{(v||"").slice(0,45)}{(v?.length??0)>45?"…":""}</span> },
    { key:"date", label:"Date", hideOn:"md",
      render:v=><span style={{color:"#888",whiteSpace:"nowrap"}}>{fmtDate(v)}</span> },
  ];

  return (
    <>
      <PageHeader title="Formations" icon="formations" onAdd={openAdd} addLabel="Nouvelle formation"
        subtitle="Chaque formation est rattachée à un domaine d'activité."/>
      <Section title="Formations" icon="formations" count={items.length} loading={loading}>
        <Table cols={cols} rows={items} onEdit={openEdit} onDelete={setConf}/>
      </Section>

      {modal && (
        <Modal title={modal.mode==="add"?"Nouvelle formation":"Modifier la formation"} onClose={()=>setModal(null)}>
          <ImagePicker value={form.imageUrl}
            onChange={url=>setForm(f=>({...f,imageUrl:url}))}
            onFileChange={file=>setForm(f=>({...f,_imageFile:file}))}/>

          <FInput label="Titre *" value={form.title} onChange={F("title")}
            placeholder="Ex: Optimisation de la maintenance"/>
          <FArea  label="Description" value={form.description} onChange={F("description")}
            placeholder="Programme, objectifs, résultats attendus…"/>
          <FInput label="Date" type="date" value={form.date} onChange={F("date")}/>

          {/* Select domaine */}
          <div style={{marginBottom:13}}>
            <label style={lS}>Domaine d'appartenance</label>
            <select value={form.domaineId} onChange={F("domaineId")} style={iS}>
              <option value="">— Aucun domaine —</option>
              {domaines.filter(d=>d.actif!==false).map(d=>(
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {domaines.length===0 && (
              <div style={{fontSize:11,color:"#bbb",marginTop:4}}>
                Aucun domaine disponible — créez d'abord un domaine.
              </div>
            )}
          </div>

          <SubmitBtn saving={saving}
            label={modal.mode==="add"?"Créer la formation":"Enregistrer"}
            onClick={save}/>
        </Modal>
      )}

      {confirm && <Confirm msg={`Supprimer "${confirm.title}" ?`}
        onConfirm={async()=>{const ok=await remove(confirm.id);if(ok)setConf(null);}}
        onCancel={()=>setConf(null)}/>}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── DIRECTEUR ─────────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function DirecteurSection({ addToast }) {
  const { data, loading, saving, save, remove } = useDirecteur(addToast);
  const [modal,   setModal]   = useState(false);
  const [confirm, setConfirm] = useState(false);
  const blank = { nom:"", titre:"", presentation:"", imageUrl:"", _imageFile:null };
  const [form, setForm] = useState(blank);
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const openModal = () => {
    if (data) setForm({ nom:data.nom||data.name||"", titre:data.titre||data.title||data.role||"",
      presentation:data.presentation||data.bio||data.description||"",
      imageUrl:data.imageUrl||data.photo||data.image||"", _imageFile:null });
    else setForm({...blank});
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.nom.trim()) return addToast("Le nom est requis","error");
    const ok = await save(form);
    if (ok) setModal(false);
  };

  const photoSrc = data ? imgSrc(data.imageUrl||data.photo||data.image||"") : null;
  const nom = data ? (data.nom||data.name||"Directeur") : "";
  const titre = data ? (data.titre||data.title||data.role||"Directeur Général") : "";
  const presentation = data ? (data.presentation||data.bio||data.description||"") : "";

  return (
    <>
      <PageHeader title="Directeur de l'entreprise" icon="directeur" onAdd={openModal} addLabel={data?"Modifier":"Configurer"}
        subtitle="Photo, nom et présentation du directeur affichés sur le site."/>

      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden",marginBottom:20}}>
        <div style={{padding:"13px 18px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:8}}>
          <User size={17} color="#2563EB"/>
          <span style={{fontSize:14,fontWeight:600,color:"#1C1C1A"}}>Directeur</span>
          <span style={{fontSize:11,color:"#aaa",background:"#eff6ff",padding:"2px 8px",borderRadius:99}}>{loading?"…":data?"1":"0"}</span>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            {data && !loading && (
              <>
                <button onClick={openModal} style={{padding:"6px 14px",border:"1px solid #dbeafe",borderRadius:8,background:"none",fontSize:12,cursor:"pointer"}}>Modifier</button>
                <button onClick={()=>setConfirm(true)} style={{padding:"6px 14px",border:"1px solid #bfdbfe",borderRadius:8,background:"none",fontSize:12,cursor:"pointer",color:"#1D4ED8"}}>Supprimer</button>
              </>
            )}
            {!data && !loading && (
              <button onClick={openModal} style={{padding:"7px 16px",background:"#2563EB",color:"#fff",border:"none",borderRadius:99,fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:16,lineHeight:1}}>+</span>Configurer
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div style={{padding:"28px 24px"}}><div style={{display:"flex",gap:22}}><Sk h={110} w={110} r={55} mb={0}/><div style={{flex:1}}><Sk h={22} w="60%" mb={10}/><Sk h={14} w="35%" mb={18}/><Sk h={12} w="90%" mb={7}/><Sk h={12} w="75%" mb={0}/></div></div></div>
        ) : data ? (
          <div style={{padding:"28px 24px"}}>
            <div style={{display:"flex",gap:24,alignItems:"flex-start",flexWrap:"wrap"}}>
              <div className="dir-photo-wrap">
                {photoSrc ? <img src={photoSrc} alt={nom} onError={e=>e.target.style.display="none"}/> : <div className="dir-avatar-fallback">{initials(nom)}</div>}
              </div>
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
                  <h2 style={{fontSize:20,fontWeight:700,color:"#1C1C1A"}}>{nom}</h2>
                  <span className="dir-badge" style={{display:"inline-flex",alignItems:"center",gap:4}}><Star size={11}/>{titre}</span>
                </div>
                {presentation
                  ? <p style={{fontSize:13.5,lineHeight:1.75,color:"#555",whiteSpace:"pre-wrap",borderLeft:"3px solid #f0ede8",paddingLeft:14}}>{presentation}</p>
                  : <p style={{fontSize:13,color:"#ccc",fontStyle:"italic"}}>Aucune présentation renseignée.</p>}
              </div>
            </div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"52px 20px",textAlign:"center",gap:12}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,border:"2px dashed #ddd"}}><User size={30} color="#bbb"/></div>
            <div style={{fontSize:14,fontWeight:600,color:"#1C1C1A"}}>Aucun directeur configuré</div>
            <div style={{fontSize:12,color:"#bbb",maxWidth:280,lineHeight:1.6}}>Ajoutez la photo, le nom et la présentation.</div>
            <button onClick={openModal} style={{padding:"10px 24px",background:"#2563EB",color:"#fff",border:"none",borderRadius:99,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"inherit"}}>
              <span style={{fontSize:18,lineHeight:1}}>+</span>Configurer le directeur
            </button>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={data?"Modifier le directeur":"Configurer le directeur"} onClose={()=>setModal(false)}>
          {(form.imageUrl||form.nom) && (
            <div style={{background:"linear-gradient(135deg,#fff8f5,#fff)",border:"1px solid #f5e0d8",borderRadius:12,padding:"16px",marginBottom:18,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:56,height:56,borderRadius:"50%",overflow:"hidden",border:"2px solid #2563EB",flexShrink:0}}>
                {form.imageUrl
                  ? <img src={imgSrc(form.imageUrl)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                  : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#2563EB,#60A5FA)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff"}}>{initials(form.nom||"?")}</div>
                }
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#1C1C1A"}}>{form.nom||<span style={{color:"#ccc"}}>Nom</span>}</div>
                <div style={{fontSize:11,color:"#2563EB",marginTop:2}}>{form.titre||"Titre / Fonction"}</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:10,color:"#bbb",fontStyle:"italic"}}>Aperçu live</div>
            </div>
          )}
          <ImagePicker value={form.imageUrl} onChange={url=>setForm(f=>({...f,imageUrl:url}))} onFileChange={file=>setForm(f=>({...f,_imageFile:file}))}/>
          <FInput label="Nom complet *" value={form.nom} onChange={F("nom")} placeholder="Ex: M. Koné Ibrahim"/>
          <FInput label="Titre / Fonction" value={form.titre} onChange={F("titre")} placeholder="Ex: Directeur Général, PDG…"/>
          <FArea  label="Présentation" rows={6} value={form.presentation} onChange={F("presentation")} placeholder="Parcours, vision, expérience, message aux clients…"/>
          <SubmitBtn saving={saving} label={data?"Enregistrer les modifications":"Créer le directeur"} onClick={handleSave}/>
        </Modal>
      )}

      {confirm && <Confirm msg={`Supprimer le profil de "${nom}" ?`} onConfirm={async()=>{const ok=await remove();if(ok)setConfirm(false);}} onCancel={()=>setConfirm(false)}/>}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE CONNEXION
// ═════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async e => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await loginApi(email.trim(), password);
      sessionStorage.setItem(SESSION_KEY,"1");
      onLogin();
    } catch(err) {
      setError(err.message || "Email ou mot de passe incorrect.");
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"#0d1b35",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif",padding:20,position:"relative",overflow:"hidden"}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{position:"absolute",top:-120,right:-120,width:350,height:350,borderRadius:"50%",background:"rgba(37,99,235,.08)",pointerEvents:"none"}}/>
      <div style={{background:"#fff",borderRadius:18,padding:"36px 32px",width:"min(400px,100%)",animation:"fadeUp .4s ease",boxShadow:"0 20px 60px rgba(0,10,30,.55)"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:28}}>
          <img src="/logo.jpeg" alt="Africa Ingénierie" style={{height:64,maxWidth:240,objectFit:"contain",marginBottom:14}}/>
          <div style={{fontSize:12,color:"#aaa"}}>Accès administrateur</div>
        </div>
        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={lS}>Adresse email</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:14,pointerEvents:"none"}}><Mail size={14} color="#aaa"/></span>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"
                style={{...iS,paddingLeft:36}} onFocus={e=>e.target.style.borderColor="#2563EB"} onBlur={e=>e.target.style.borderColor="#e0dfd8"}/>
            </div>
          </div>
          <div>
            <label style={lS}>Mot de passe</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:14,pointerEvents:"none"}}><Lock size={14} color="#aaa"/></span>
              <input type={showPwd?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"
                style={{...iS,paddingLeft:36,paddingRight:40}} onFocus={e=>e.target.style.borderColor="#2563EB"} onBlur={e=>e.target.style.borderColor="#e0dfd8"}/>
              <button type="button" onClick={()=>setShowPwd(v=>!v)} style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#aaa",padding:0}}>{showPwd?"🙈":"👁"}</button>
            </div>
          </div>
          {error && <div style={{background:"#fff5f5",border:"1px solid #fcc",borderRadius:8,padding:"9px 13px",fontSize:13,color:"#1D4ED8",display:"flex",alignItems:"center",gap:7}}><span>⚠️</span>{error}</div>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"12px",background:loading?"#93c5fd":"#2563EB",color:"#fff",border:"none",borderRadius:99,fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:"inherit"}}>
            {loading?<><div style={{width:16,height:16,border:"2px solid rgba(255,255,255,.4)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Connexion…</>:"Se connecter"}
          </button>
        </form>
        <div style={{marginTop:24,textAlign:"center",fontSize:12,color:"#ccc"}}>Accès réservé aux administrateurs</div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PARAMÈTRES API
// ═════════════════════════════════════════════════════════════════════════════
function ApiSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [cfg,    setCfg]    = useState(loadRouteCfg);
  const [probe,  setProbe]  = useState(null);
  const [probeId,setProbeId]= useState("11");
  const [probeEp,setProbeEp]= useState(API.domaines);
  const [saved,  setSaved]  = useState(false);

  const saveCfg = () => {
    saveRouteCfg(cfg);
    Object.keys(_deleteRouteCache).forEach(k=>delete _deleteRouteCache[k]);
    Object.keys(_putRouteCache).forEach(k=>delete _putRouteCache[k]);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  const runProbe = async () => {
    setProbe("running");
    const tests = [
      ...DELETE_STRATEGIES.filter(s=>s.key!=="auto").map(s=>({...s,type:"DELETE",fn:()=>execDelete(s.key,probeEp,probeId)})),
      ...UPDATE_STRATEGIES.filter(s=>s.key!=="auto").map(s=>({...s,type:"UPDATE",fn:()=>execUpdate(s.key,probeEp,probeId,{_probe:true})})),
    ];
    const results = [];
    for (const t of tests) {
      try { await t.fn(); results.push({...t,status:"OK"}); }
      catch(e) { results.push({...t,status:`Erreur: ${e.message}`}); }
    }
    setProbe(results);
  };

  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,marginBottom:20,overflow:"hidden"}}>
      <div onClick={()=>setIsOpen(v=>!v)} style={{padding:"13px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",background:isOpen?"#faf9f7":"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <Settings size={17}/>
          <span style={{fontSize:14,fontWeight:600,color:"#1C1C1A"}}>Paramètres API</span>
          <span style={{fontSize:11,color:"#2563EB",background:"#eff6ff",padding:"2px 8px",borderRadius:99,border:"1px solid #bfdbfe"}}>Configuration des routes</span>
        </div>
        <span style={{fontSize:18,color:"#aaa"}}>{isOpen?"▲":"▼"}</span>
      </div>
      {isOpen && (
        <div style={{padding:"20px 20px 24px",borderTop:"1px solid #ebe9e3"}}>
          <div className="grid-2">
            <div><label style={lS}>Route DELETE</label>
              <select value={cfg.delete||"auto"} onChange={e=>setCfg(c=>({...c,delete:e.target.value}))} style={iS}>
                {DELETE_STRATEGIES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div><label style={lS}>Route UPDATE</label>
              <select value={cfg.update||"auto"} onChange={e=>setCfg(c=>({...c,update:e.target.value}))} style={iS}>
                {UPDATE_STRATEGIES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={saveCfg} style={{padding:"9px 22px",background:saved?"#1D9E75":"#2563EB",color:"#fff",border:"none",borderRadius:99,fontSize:13,fontWeight:500,cursor:"pointer",marginTop:8,marginBottom:24,transition:"background .3s",fontFamily:"inherit"}}>
            {saved?"✓ Sauvegardé":"Enregistrer"}
          </button>
          <div style={{borderTop:"1px solid #f0ede8",paddingTop:18}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1C1C1A",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><FlaskConical size={13}/>Sondage des routes</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end",marginBottom:14}}>
              <div><label style={lS}>Endpoint</label>
                <select value={probeEp} onChange={e=>setProbeEp(e.target.value)} style={{...iS,width:"auto"}}>
                  {Object.entries(API).map(([k,v])=><option key={k} value={v}>{k}</option>)}
                </select>
              </div>
              <div><label style={lS}>ID test</label><input value={probeId} onChange={e=>setProbeId(e.target.value)} style={{...iS,width:80}} placeholder="11"/></div>
              <button onClick={runProbe} disabled={probe==="running"} style={{padding:"9px 18px",background:"#0d1b35",color:"#fff",border:"none",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:500,height:38,whiteSpace:"nowrap"}}>
                {probe==="running"?"Test en cours…":"Lancer"}
              </button>
            </div>
            {Array.isArray(probe) && probe.map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 12px",borderRadius:7,fontSize:12,fontFamily:"monospace",marginBottom:3,background:r.status === "OK"?"#f0fff8":"#fdf5f5",border:`1px solid ${r.status === "OK"?"#c6f0db":"#f5e0e0"}`}}>
                <span style={{width:48,flexShrink:0,fontSize:11,color:r.type==="DELETE"?"#1D4ED8":"#378ADD",fontWeight:600}}>{r.type}</span>
                <span style={{flex:1,color:"#444"}}>{r.label}</span>
                <span style={{color:r.status === "OK"?"#1D9E75":"#1D4ED8",fontWeight:600}}>{r.status}</span>
                {r.status === "OK" && (
                  <button onClick={()=>{if(r.type==="DELETE") setCfg(c=>({...c,delete:r.key})); else setCfg(c=>({...c,update:r.key}));}}
                    style={{padding:"3px 10px",background:"#2563EB",color:"#fff",border:"none",borderRadius:99,fontSize:11,cursor:"pointer"}}>Utiliser</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── PAGE D'ACCUEIL ────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function AccueilPage({ onNavigate, counts }) {
  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const cards = [
    { id:"directeur",        icon:"directeur", label:"Directeur",           color:"#2563EB", desc:"Profil du directeur" },
    { id:"quiSommesNous",    icon:"info", label:"Qui sommes-nous",     color:"#378ADD", desc:"Présentation entreprise" },
    { id:"domaines",         icon:"domaines", label:"Domaines",             color:"#1D9E75", desc:"Domaines d'activité",      count:counts.domaines },
    { id:"membres",          icon:"membres", label:"Membres",              color:"#7F77DD", desc:"Équipe & collaborateurs",   count:counts.membres },
    { id:"projets",          icon:"projets", label:"Projets",              color:"#60A5FA", desc:"Projets réalisés",          count:counts.projets },
    { id:"etudes",           icon:"etudes", label:"Études de cas",        color:"#D4537E", desc:"Avant / après",            count:counts.etudes },
    { id:"formations",       icon:"formations", label:"Formations",           color:"#2563EB", desc:"Formations proposées",      count:counts.formations },
    { id:"formationsAvenir", icon:"calendrier", label:"Formations à venir",   color:"#378ADD", desc:"Prochaines formations",     count:counts.formationsAvenir },
    { id:"avis",             icon:"avis", label:"Avis clients",         color:"#60A5FA", desc:"Témoignages & avis",        count:counts.avis },
    { id:"contact",          icon:"mail", label:"Messages contact",     color:"#1D9E75", desc:"Messages reçus",            count:counts.contact },
    { id:"partenaires",      icon:"partenaires", label:"Partenaires",           color:"#7F77DD", desc:"Logos & liens partenaires", count:counts.partenaires },
  ];

  return (
    <div style={{animation:"fadeUp .4s ease"}}>
      {/* Hero bienvenue */}
      <div className="accueil-hero" style={{background:"linear-gradient(135deg,#1C1C1A 0%,#2d2d2a 100%)",borderRadius:18,padding:"clamp(20px,4vw,36px) clamp(18px,4vw,32px)",marginBottom:28,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:"rgba(37,99,235,.12)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-40,left:80,width:140,height:140,borderRadius:"50%",background:"rgba(96,165,250,.08)",pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:8,letterSpacing:".06em",textTransform:"uppercase"}}>
            {now.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </div>
          <h1 style={{fontSize:"clamp(22px,4vw,32px)",fontWeight:700,color:"#fff",marginBottom:10,lineHeight:1.2}}>
            {greeting} 👋
          </h1>
          <p style={{fontSize:15,color:"rgba(255,255,255,.55)",maxWidth:480,lineHeight:1.7,marginBottom:24}}>
            Bienvenue sur le tableau de bord <strong style={{color:"#2563EB"}}>Africa Ingénierie</strong>.
            Gérez le contenu de votre site web en toute simplicité — directeur, domaines, membres, projets et formations.
          </p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button onClick={()=>onNavigate("domaines")}
              style={{padding:"10px 22px",background:"#2563EB",color:"#fff",border:"none",borderRadius:99,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 14px rgba(37,99,235,.4)"}}>
              Gérer le contenu
            </button>
            <button onClick={()=>onNavigate("settings")}
              style={{padding:"10px 22px",background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.7)",border:"1px solid rgba(255,255,255,.12)",borderRadius:99,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              Paramètres API
            </button>
          </div>
        </div>
      </div>

      {/* Grille des sections */}
      <div style={{fontSize:13,fontWeight:600,color:"#888",marginBottom:14,letterSpacing:".05em",textTransform:"uppercase"}}>
        Sections du site
      </div>
      <div className="accueil-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:28}}>
        {cards.map(card=>(
          <button key={card.id} onClick={()=>onNavigate(card.id)}
            style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px 18px",
              cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all .2s",display:"flex",flexDirection:"column",gap:10}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,.1)`;e.currentTarget.style.borderColor=card.color;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor="#ebe9e3";}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{width:42,height:42,borderRadius:12,background:`${card.color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {resolveIcon(card.icon, 20)}
              </div>
              {card.count !== undefined && (
                <span style={{fontSize:20,fontWeight:700,color:card.color}}>{card.count}</span>
              )}
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:"#1C1C1A",marginBottom:3}}>{card.label}</div>
              <div style={{fontSize:12,color:"#aaa",lineHeight:1.5}}>{card.desc}</div>
            </div>
            <div style={{fontSize:11,color:card.color,fontWeight:600,marginTop:"auto"}}><ChevronRight size={11}/>Gérer</div>
          </button>
        ))}
      </div>


    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// ── QUI SOMMES-NOUS (singleton) ──────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function QuiSommesNousSection({ addToast }) {
  const [data,   setData]   = useState(null);
  const [loading,setLoading]= useState(true);
  const [saving, setSaving] = useState(false);
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState({ texte:"", videoUrl:"" });
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(()=>{
    api.get(API.quiSommesNous)
      .then(d=>{ setData(d); if(d) setForm({texte:d.texte||"",videoUrl:d.videoUrl||""}); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  const openModal = () => {
    if(data) setForm({texte:data.texte||"",videoUrl:data.videoUrl||""});
    else setForm({texte:"",videoUrl:""});
    setModal(true);
  };

  const save = async () => {
    if(!form.texte.trim()) return addToast("Le texte est requis","error");
    setSaving(true);
    try {
      const result = await api.post(API.quiSommesNous, form);
      setData(result);
      addToast("Enregistré");
      setModal(false);
    } catch(e) { addToast("Erreur : "+e.message,"error"); }
    finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader title="Qui sommes-nous" icon="info" onAdd={openModal}
        addLabel={data?"Modifier":"Configurer"}
        subtitle="Texte de présentation et vidéo affichés sur le site."/>

      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden",marginBottom:20}}>
        <div style={{padding:"13px 18px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:17}}>ℹ️</span>
          <span style={{fontSize:14,fontWeight:600,color:"#1C1C1A"}}>Qui sommes-nous</span>
          <div style={{marginLeft:"auto"}}>
            {!loading && (
              <button onClick={openModal} style={{padding:"6px 16px",background:"#2563EB",color:"#fff",
                border:"none",borderRadius:99,fontSize:12,fontWeight:500,cursor:"pointer"}}>
                {data?"Modifier":"Configurer"}
              </button>
            )}
          </div>
        </div>
        {loading ? <TableSkeleton rows={2}/> : data ? (
          <div style={{padding:"24px"}}>
            <p style={{fontSize:14,lineHeight:1.8,color:"#444",whiteSpace:"pre-wrap",marginBottom:data.videoUrl?16:0}}>
              {data.texte}
            </p>
            {data.videoUrl && (
              <div style={{marginTop:12}}>
                <span style={{fontSize:11,color:"#888",fontWeight:500}}>🎬 Vidéo : </span>
                <a href={data.videoUrl} target="_blank" rel="noreferrer"
                  style={{fontSize:12,color:"#378ADD",wordBreak:"break-all"}}>{data.videoUrl}</a>
              </div>
            )}
          </div>
        ) : (
          <div style={{textAlign:"center",padding:"44px 20px",color:"#ccc"}}>
            <div style={{fontSize:32,marginBottom:8}}>ℹ️</div>
            <div style={{fontSize:13}}>Aucun contenu. Cliquez sur Configurer.</div>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={data?"Modifier — Qui sommes-nous":"Configurer — Qui sommes-nous"} onClose={()=>setModal(false)}>
          <FArea label="Texte de présentation *" rows={8} value={form.texte} onChange={F("texte")}
            placeholder="Parlez de votre entreprise, votre histoire, vos valeurs, votre mission…"/>
          <FInput label="URL Vidéo (YouTube / Vimeo)" value={form.videoUrl} onChange={F("videoUrl")}
            placeholder="https://youtube.com/embed/..."/>
          <SubmitBtn saving={saving} label="Enregistrer" onClick={save}/>
        </Modal>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── FORMATIONS À VENIR ───────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function FormationsAvenirSection({ addToast, onCountChange }) {
  const { items, loading, saving, create, update, remove, toggleStatus } = useCrud(API.formationsAvenir, addToast);
  const [modal,  setModal]  = useState(null);
  const [confirm,setConf]   = useState(null);
  const [tab,    setTab]    = useState("actif");

  const actifs   = items.filter(it=>it.statut!=="inactif");
  const inactifs = items.filter(it=>it.statut==="inactif");
  const displayed = tab==="actif" ? actifs : inactifs;

  useEffect(()=>{ if(onCountChange) onCountChange(actifs.length); },[actifs.length]);

  const blank = { titre:"", texte:"", videoUrl:"", imageUrl:"", statut:"actif", date:"", _imageFile:null };
  const [form, setForm] = useState(blank);
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const openAdd  = () => { setForm({...blank}); setModal({mode:"add"}); };
  const openEdit = row => {
    setForm({ titre:row.titre||"", texte:row.texte||"", videoUrl:row.videoUrl||"",
      imageUrl:row.imageUrl||"", statut:row.statut||"actif", date:toDateVal(row.date), _imageFile:null });
    setModal({mode:"edit",data:row});
  };

  const save = async () => {
    if(!form.titre.trim()) return addToast("Le titre est requis","error");
    const ok = modal.mode==="add" ? await create({...form,date:form.date||null}) : await update(modal.data.id,{...form,date:form.date||null});
    if(ok) setModal(null);
  };

  const cols = [
    { key:"imageUrl", label:"Photo",   render:v=><Thumb v={v} fallback="📅"/> },
    { key:"titre",    label:"Titre",   render:v=><strong>{v}</strong> },
    { key:"statut",   label:"Statut",  render:(_,row)=>(
      <button onClick={()=>toggleStatus(row.id, row.statut==="inactif")}
        className={row.statut!=="inactif"?"badge-active":"badge-inactive"}
        style={{cursor:"pointer",border:"none",fontFamily:"inherit"}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:row.statut!=="inactif"?"#1D9E75":"#bbb",flexShrink:0}}/>
        {row.statut!=="inactif"?"Actif":"Inactif"}
      </button>
    )},
    { key:"date", label:"Date", hideOn:"sm", render:v=><span style={{color:"#888",whiteSpace:"nowrap"}}>{fmtDate(v)}</span> },
    { key:"videoUrl", label:"Vidéo", hideOn:"md", render:v=>v
      ? <a href={v} target="_blank" rel="noreferrer" style={{color:"#378ADD",fontSize:11}}>🎬 Voir</a>
      : <span style={{color:"#ddd"}}>—</span> },
  ];

  return (
    <>
      <PageHeader title="Formations à venir" icon="calendrier" onAdd={openAdd} addLabel="Nouvelle formation"
        subtitle="Prochaines formations avec statut, vidéo et image."/>

      <div className="tab-bar">
        <button className={`tab-btn${tab==="actif"?" active":""}`}  onClick={()=>setTab("actif")}>Actives ({actifs.length})</button>
        <button className={`tab-btn${tab==="inactif"?" active":""}`} onClick={()=>setTab("inactif")}>Inactives ({inactifs.length})</button>
      </div>

      <Section title="Formations à venir" icon="calendrier" count={displayed.length} loading={loading}>
        <Table cols={cols} rows={displayed} onEdit={openEdit} onDelete={setConf}/>
      </Section>

      {modal && (
        <Modal title={modal.mode==="add"?"Nouvelle formation à venir":"Modifier"} onClose={()=>setModal(null)}>
          <ImagePicker value={form.imageUrl} onChange={url=>setForm(f=>({...f,imageUrl:url}))} onFileChange={file=>setForm(f=>({...f,_imageFile:file}))}/>
          <FInput label="Titre *" value={form.titre} onChange={F("titre")} placeholder="Ex: Formation en génie civil avancé"/>
          <FArea  label="Description" rows={4} value={form.texte} onChange={F("texte")} placeholder="Programme, objectifs, prérequis…"/>
          <FInput label="URL Vidéo (optionnel)" value={form.videoUrl} onChange={F("videoUrl")} placeholder="https://youtube.com/embed/..."/>
          <FInput label="Date prévue" type="date" value={form.date} onChange={F("date")}/>
          <StatusSelector value={form.statut==="actif"} onChange={v=>setForm(f=>({...f,statut:v?"actif":"inactif"}))}/>
          <SubmitBtn saving={saving} label={modal.mode==="add"?"Créer":"Enregistrer"} onClick={save}/>
        </Modal>
      )}
      {confirm && <Confirm msg={`Supprimer "${confirm.titre}" ?`} onConfirm={async()=>{const ok=await remove(confirm.id);if(ok)setConf(null);}} onCancel={()=>setConf(null)}/>}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── AVIS CLIENTS ─────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function AvisSection({ addToast, onCountChange }) {
  const { items, loading, saving, create, update, remove } = useCrud(API.avis, addToast);
  const [modal,   setModal]  = useState(null);
  const [confirm, setConf]   = useState(null);
  const [filterNote,   setFilterNote]   = useState("");
  const [filterStatut, setFilterStatut] = useState("");

  const filtered = items.filter(it =>
    (!filterNote   || String(it.note)   === filterNote) &&
    (!filterStatut || it.statut         === filterStatut)
  );

  useEffect(()=>{ if(onCountChange) onCountChange(items.filter(i=>i.statut==="publie").length); },[items]);

  const blank = { nom:"", email:"", message:"", note:5, statut:"cache" };
  const [form, setForm] = useState(blank);
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const openAdd  = () => { setForm({...blank}); setModal({mode:"add"}); };
  const openEdit = row => {
    setForm({ nom:row.nom||"", email:row.email||"", message:row.message||"", note:row.note||5, statut:row.statut||"cache" });
    setModal({mode:"edit",data:row});
  };

  const save = async () => {
    if(!form.nom.trim()||!form.message.trim()) return addToast("Nom et message requis","error");
    const ok = modal.mode==="add" ? await create(form) : await update(modal.data.id,form);
    if(ok) setModal(null);
  };

  const Stars = ({note}) => (
    <span style={{color:"#60A5FA",fontSize:13,letterSpacing:1}}>
      {Array.from({length:note||0},(_,i)=><Star key={i} size={14} color="#60A5FA" fill="#60A5FA"/>)}
    </span>
  );

  const cols = [
    { key:"nom",     label:"Nom",     render:v=><strong>{v}</strong> },
    { key:"note",    label:"Note",    render:v=><Stars note={v}/> },
    { key:"message", label:"Message", hideOn:"sm",
      render:v=><span style={{color:"#888"}}>{(v||"").slice(0,55)}{(v?.length??0)>55?"…":""}</span> },
    { key:"statut",  label:"Statut",
      render:(v,row)=>(
        <button onClick={async()=>{
            const ns = v==="publie"?"cache":"publie";
            await update(row.id,{statut:ns});
          }}
          className={v==="publie"?"badge-active":"badge-inactive"}
          style={{cursor:"pointer",border:"none",fontFamily:"inherit"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:v==="publie"?"#1D9E75":"#bbb",flexShrink:0}}/>
          {v==="publie"?"Publié":"Caché"}
        </button>
      )},
    { key:"createdAt", label:"Date", hideOn:"md",
      render:v=><span style={{color:"#888",whiteSpace:"nowrap"}}>{fmtDate(v)}</span> },
  ];

  return (
    <>
      <PageHeader title="Avis clients" icon="avis" onAdd={openAdd} addLabel="Nouvel avis"
        subtitle="Gérez les témoignages clients avec filtrage par note et statut."/>

      {/* Filtres */}
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <select value={filterNote} onChange={e=>setFilterNote(e.target.value)}
          style={{...iS,width:"auto",minWidth:140}}>
          <option value="">Toutes les notes</option>
          {[5,4,3,2,1].map(n=><option key={n} value={n}>{"★".repeat(n)} ({n} étoiles)</option>)}
        </select>
        <select value={filterStatut} onChange={e=>setFilterStatut(e.target.value)}
          style={{...iS,width:"auto",minWidth:140}}>
          <option value="">Tous les statuts</option>
          <option value="publie">Publié</option>
          <option value="cache">Caché</option>
        </select>
        {(filterNote||filterStatut) && (
          <button onClick={()=>{setFilterNote("");setFilterStatut("");}}
            style={{padding:"9px 14px",border:"1px solid #dbeafe",borderRadius:8,background:"none",fontSize:12,cursor:"pointer"}}>
            Réinitialiser
          </button>
        )}
      </div>

      <Section title="Avis clients" icon="avis" count={filtered.length} loading={loading}>
        <Table cols={cols} rows={filtered} onEdit={openEdit} onDelete={setConf}/>
      </Section>

      {modal && (
        <Modal title={modal.mode==="add"?"Nouvel avis":"Modifier l'avis"} onClose={()=>setModal(null)}>
          <div className="grid-2">
            <FInput label="Nom *"  value={form.nom}   onChange={F("nom")}   placeholder="Ex: Jean Dupont"/>
            <FInput label="Email"  value={form.email} onChange={F("email")} placeholder="jean@email.com" type="email"/>
          </div>
          <FArea label="Message *" rows={4} value={form.message} onChange={F("message")} placeholder="Témoignage du client…"/>

          {/* Note étoiles */}
          <div style={{marginBottom:13}}>
            <label style={lS}>Note</label>
            <div style={{display:"flex",gap:6}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} type="button" onClick={()=>setForm(f=>({...f,note:n}))}
                  style={{fontSize:24,background:"none",border:"none",cursor:"pointer",
                    color:form.note>=n?"#60A5FA":"#ddd",padding:"2px",transition:"color .15s"}}>
                  ★
                </button>
              ))}
              <span style={{fontSize:13,color:"#888",alignSelf:"center",marginLeft:4}}>{form.note}/5</span>
            </div>
          </div>

          {/* Statut */}
          <div style={{marginBottom:16}}>
            <label style={lS}>Statut de publication</label>
            <div style={{display:"flex",gap:10}}>
              {[{v:"publie",l:"Publié"},{v:"cache",l:"Caché"}].map(opt=>(
                <button key={opt.v} type="button" onClick={()=>setForm(f=>({...f,statut:opt.v}))}
                  style={{padding:"8px 20px",borderRadius:99,border:"2px solid",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:500,
                    borderColor:form.statut===opt.v?"#2563EB":"#e0dfd8",
                    background:form.statut===opt.v?"#eff6ff":"transparent",
                    color:form.statut===opt.v?"#2563EB":"#888"}}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <SubmitBtn saving={saving} label={modal.mode==="add"?"Ajouter l'avis":"Enregistrer"} onClick={save}/>
        </Modal>
      )}
      {confirm && <Confirm msg={`Supprimer l'avis de "${confirm.nom}" ?`} onConfirm={async()=>{const ok=await remove(confirm.id);if(ok)setConf(null);}} onCancel={()=>setConf(null)}/>}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── MESSAGES CONTACT ─────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function ContactSection({ addToast, onCountChange }) {
  const { items, loading, remove } = useCrud(API.contact, addToast);
  const [selected, setSelected] = useState(null);
  const [confirm,  setConf]     = useState(null);
  const [filterLu, setFilterLu] = useState("");

  const filtered = items.filter(it => filterLu==="" ? true : filterLu==="lu" ? it.lu : !it.lu);
  const nonLus   = items.filter(i=>!i.lu).length;

  useEffect(()=>{ if(onCountChange) onCountChange(nonLus); },[nonLus]);

  const markRead = async (item) => {
    if(item.lu) return;
    try {
      await api.patch(`${API.contact}/${item.id}/lu`, {});
      addToast("Marqué comme lu");
    } catch(e) { addToast("Erreur : "+e.message,"error"); }
  };

  const Stars = ({n}) => <span style={{color:"#60A5FA"}}>{Array.from({length:n||0},(_,i)=><Star key={i} size={14} color="#60A5FA" fill="#60A5FA"/>)}</span>;

  return (
    <>
      <PageHeader title="Messages de contact" icon="mail"
        subtitle={`${nonLus} message${nonLus>1?"s":""} non lu${nonLus>1?"s":""}`}/>

      {/* Filtres */}
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <select value={filterLu} onChange={e=>setFilterLu(e.target.value)} style={{...iS,width:"auto",minWidth:160}}>
          <option value="">Tous les messages</option>
          <option value="nonlu">Non lus</option>
          <option value="lu">Lus</option>
        </select>
      </div>

      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden",marginBottom:20}}>
        <div style={{padding:"13px 18px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:17}}><Mail size={14} color="#aaa"/></span>
          <span style={{fontSize:14,fontWeight:600,color:"#1C1C1A"}}>Messages reçus</span>
          <span style={{fontSize:11,color:"#aaa",background:"#eff6ff",padding:"2px 8px",borderRadius:99}}>{filtered.length}</span>
          {nonLus>0 && <span style={{fontSize:11,background:"#2563EB",color:"#fff",padding:"2px 8px",borderRadius:99,fontWeight:600}}>{nonLus} nouveaux</span>}
        </div>
        {loading ? <TableSkeleton/> : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"44px 20px",color:"#ccc"}}>
            <div style={{fontSize:32,marginBottom:8}}>✉️</div>
            <div style={{fontSize:13}}>Aucun message.</div>
          </div>
        ) : filtered.map((msg,i)=>(
          <div key={msg.id||i} onClick={()=>{setSelected(msg);markRead(msg);}}
            style={{padding:"14px 18px",borderBottom:"1px solid #f5f3ef",cursor:"pointer",
              background:msg.lu?"#fff":"#fffbf8",transition:"background .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#fdfcfb"}
            onMouseLeave={e=>e.currentTarget.style.background=msg.lu?"#fff":"#fffbf8"}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:msg.lu?"#ddd":"#2563EB",flexShrink:0}}/>
              <span style={{fontSize:13,fontWeight:msg.lu?500:700,color:"#1C1C1A",flex:1}}>{msg.nom}</span>
              <span style={{fontSize:11,color:"#bbb",whiteSpace:"nowrap"}}>{fmtDate(msg.createdAt)}</span>
              <button onClick={e=>{e.stopPropagation();setConf(msg);}}
                style={{padding:"3px 8px",border:"1px solid #bfdbfe",borderRadius:6,background:"none",fontSize:11,cursor:"pointer",color:"#1D4ED8"}}>✕</button>
            </div>
            <div style={{fontSize:12,color:"#888",paddingLeft:18}}>
              <span style={{color:"#378ADD"}}>{msg.email}</span>
              {msg.sujet && <span style={{marginLeft:8,color:"#aaa"}}>· {msg.sujet}</span>}
            </div>
            <div style={{fontSize:12,color:"#aaa",paddingLeft:18,marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {(msg.message||"").slice(0,80)}{(msg.message?.length||0)>80?"…":""}
            </div>
          </div>
        ))}
      </div>

      {/* Détail message */}
      {selected && (
        <Modal title={`Message de ${selected.nom}`} onClose={()=>setSelected(null)}>
          <div style={{background:"#f8faff",borderRadius:10,padding:"16px",marginBottom:16}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
              <span style={{fontSize:12,color:"#888"}}>De :</span>
              <span style={{fontSize:12,fontWeight:600}}>{selected.nom}</span>
              <a href={`mailto:${selected.email}`} style={{fontSize:12,color:"#378ADD"}}>{selected.email}</a>
            </div>
            {selected.sujet && <div style={{fontSize:12,color:"#555",marginBottom:4}}><strong>Sujet :</strong> {selected.sujet}</div>}
            <div style={{fontSize:11,color:"#bbb"}}>{fmtDate(selected.createdAt)}</div>
          </div>
          <div style={{fontSize:14,lineHeight:1.8,color:"#333",whiteSpace:"pre-wrap",padding:"0 4px"}}>
            {selected.message}
          </div>
          <div style={{marginTop:20,display:"flex",gap:10}}>
            <a href={`mailto:${selected.email}?subject=Re: ${selected.sujet||""}`}
              style={{flex:1,padding:"11px",background:"#2563EB",color:"#fff",borderRadius:99,
                fontSize:13,fontWeight:500,textAlign:"center",textDecoration:"none",display:"block"}}>
              ↩ Répondre par email
            </a>
            <button onClick={()=>{setConf(selected);setSelected(null);}}
              style={{padding:"11px 18px",border:"1px solid #bfdbfe",borderRadius:99,background:"none",fontSize:13,cursor:"pointer",color:"#1D4ED8"}}>
              Supprimer
            </button>
          </div>
        </Modal>
      )}

      {confirm && <Confirm msg={`Supprimer le message de "${confirm.nom}" ?`}
        onConfirm={async()=>{const ok=await remove(confirm.id);if(ok)setConf(null);}}
        onCancel={()=>setConf(null)}/>}
    </>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// ── PARTENAIRES ──────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function PartenairesSection({ addToast, onCountChange }) {
  const { items, loading, saving, create, update, remove } = useCrud(API.partenaires, addToast);
  const [modal,   setModal]  = useState(null);
  const [confirm, setConf]   = useState(null);
  const blank = { nom:"", logoUrl:"", siteWeb:"", description:"", _imageFile:null };
  const [form, setForm] = useState(blank);
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(()=>{ if(onCountChange) onCountChange(items.length); },[items.length]);

  const openAdd  = () => { setForm({...blank}); setModal({mode:"add"}); };
  const openEdit = row => {
    setForm({ nom:row.nom||"", logoUrl:row.logoUrl||"", siteWeb:row.siteWeb||"",
      description:row.description||"", _imageFile:null });
    setModal({mode:"edit",data:row});
  };

  const save = async () => {
    if(!form.nom.trim()) return addToast("Le nom est requis","error");
    const payload = {...form};
    const ok = modal.mode==="add" ? await create(payload) : await update(modal.data.id, payload);
    if(ok) setModal(null);
  };

  const cols = [
    { key:"logoUrl",     label:"Logo",        render:v=><Thumb v={v} fallback="🤝"/> },
    { key:"nom",         label:"Nom",          render:v=><strong>{v}</strong> },
    { key:"siteWeb",     label:"Site web",     hideOn:"sm",
      render:v=>v ? <a href={v} target="_blank" rel="noreferrer"
        style={{color:"#378ADD",fontSize:12,wordBreak:"break-all"}}>{v}</a>
        : <span style={{color:"#ddd"}}>—</span> },
    { key:"description", label:"Description",  hideOn:"md",
      render:v=><span style={{color:"#888"}}>{(v||"").slice(0,50)}{(v?.length??0)>50?"…":""}</span> },
  ];

  return (
    <>
      <PageHeader title="Partenaires" icon="🤝" onAdd={openAdd} addLabel="Nouveau partenaire"
        subtitle="Gérez les partenaires affichés sur le site avec logo et lien."/>

      <Section title="Partenaires" icon="🤝" count={items.length} loading={loading}>
        <Table cols={cols} rows={items} onEdit={openEdit} onDelete={setConf}/>
      </Section>

      {modal && (
        <Modal title={modal.mode==="add"?"Nouveau partenaire":"Modifier le partenaire"} onClose={()=>setModal(null)}>
          <ImagePicker label="Logo du partenaire" value={form.logoUrl}
            onChange={url=>setForm(f=>({...f,logoUrl:url}))}
            onFileChange={file=>setForm(f=>({...f,_imageFile:file}))}/>
          <FInput label="Nom *" value={form.nom} onChange={F("nom")} placeholder="Ex: Total Énergie, OCP Group…"/>
          <FInput label="Site web" value={form.siteWeb} onChange={F("siteWeb")} placeholder="https://www.partenaire.com"/>
          <FArea  label="Description" rows={3} value={form.description} onChange={F("description")}
            placeholder="Type de partenariat, domaine de collaboration…"/>
          <SubmitBtn saving={saving} label={modal.mode==="add"?"Ajouter le partenaire":"Enregistrer"} onClick={save}/>
        </Modal>
      )}

      {confirm && <Confirm msg={`Supprimer le partenaire "${confirm.nom}" ?`}
        onConfirm={async()=>{const ok=await remove(confirm.id);if(ok)setConf(null);}}
        onCancel={()=>setConf(null)}/>}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── VIDÉOS ──────────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function VideosSection({ addToast, onCountChange }) {
  const { items, loading, saving, create, update, remove } = useCrud(API.videos, addToast);
  const [modal,   setModal]  = useState(null);
  const [confirm, setConf]   = useState(null);

  useEffect(()=>{ if(onCountChange) onCountChange(items.length); },[items.length]);

  const blank = { titre:"", description:"", url:"", thumbnailUrl:"", categorie:"general", actif:true, ordre:0, _videoFile:null };
  const [form, setForm] = useState(blank);
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const openAdd  = ()    => { setForm({...blank}); setModal({mode:"add"}); };
  const openEdit = row   => {
    setForm({ titre:row.titre||"", description:row.description||"", url:row.url||"",
      thumbnailUrl:row.thumbnailUrl||"", categorie:row.categorie||"general",
      actif:row.actif!==false, ordre:row.ordre||0, _videoFile:null });
    setModal({mode:"edit",data:row});
  };

  const save = async () => {
    if(!form.titre.trim()) return addToast("Le titre est requis","error");
    if(!form.url.trim() && !form._videoFile) return addToast("L'URL ou un fichier vidéo est requis","error");
    const { _videoFile, ...fields } = form;
    const files = _videoFile ? { video: _videoFile } : {};
    const ok = modal.mode==="add"
      ? await create(fields, files)
      : await update(modal.data.id, fields, files);
    if(ok) setModal(null);
  };

  const CATS = ["general","formation","projet","realisation","evenement"];

  const VideoThumb = ({url, titre}) => {
    const ytId = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([^&\n?#]+)/)?.[1];
    const vmId = url?.match(/vimeo\.com\/(\d+)/)?.[1];
    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
    return (
      <div style={{width:80,height:52,borderRadius:10,overflow:"hidden",background:"#1e293b",flexShrink:0,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {thumb ? <img src={thumb} alt={titre} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{fontSize:20}}>🎬</span>}
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:20,height:20,background:"rgba(255,255,255,.9)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderLeft:"8px solid #1e293b",marginLeft:2}}/>
          </div>
        </div>
      </div>
    );
  };

  const cols = [
    { key:"url",         label:"Aperçu",      render:(v,row)=><VideoThumb url={v} titre={row.titre}/> },
    { key:"titre",       label:"Titre",        render:v=><strong style={{fontSize:13}}>{v}</strong> },
    { key:"categorie",   label:"Catégorie",    hideOn:"md", render:v=><span style={{padding:"2px 10px",background:"#eff6ff",color:"#2563EB",borderRadius:99,fontSize:11,fontWeight:600}}>{v}</span> },
    { key:"ordre",       label:"Ordre",        hideOn:"md", render:v=><span style={{color:"#888",fontSize:12}}>{v}</span> },
    { key:"actif",       label:"Statut",
      render:(v,row)=>(
        <button onClick={async()=>{ await update(row.id,{actif:!v}); }}
          className={v?"badge-active":"badge-inactive"}
          style={{cursor:"pointer",border:"none",fontFamily:"inherit"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:v?"#1D9E75":"#bbb",flexShrink:0}}/>
          {v?"Visible":"Masqué"}
        </button>
      )},
  ];

  return (
    <>
      <PageHeader title="Vidéos remarquables" icon="🎬" onAdd={openAdd} addLabel="Nouvelle vidéo"
        subtitle="Gérez les vidéos affichées sur le site public (YouTube, Vimeo, etc.)."/>

      <Section title="Vidéos" icon="🎬" count={items.length} loading={loading}>
        <Table cols={cols} rows={items} onEdit={openEdit} onDelete={setConf}/>
      </Section>

      {modal && (
        <Modal title={modal.mode==="add"?"Nouvelle vidéo":"Modifier la vidéo"} onClose={()=>setModal(null)}>
          <FInput label="Titre *" value={form.titre} onChange={F("titre")} placeholder="Ex: Présentation Africa Ingénierie"/>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6,fontWeight:500}}>Source de la vidéo</label>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <label style={{flex:1,border:"1.5px solid #e2e8f0",borderRadius:10,padding:"10px 14px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:8,background:form._videoFile?"#f8faff":"#eff6ff"}}>
                <input type="radio" name="vid-source" checked={!form._videoFile} onChange={()=>setForm(f=>({...f,_videoFile:null}))} style={{accentColor:"#2563EB"}}/>
                Lien URL (YouTube, Vimeo...)
              </label>
              <label style={{flex:1,border:"1.5px solid #e2e8f0",borderRadius:10,padding:"10px 14px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:8,background:form._videoFile?"#eff6ff":"#f8faff"}}>
                <input type="radio" name="vid-source" checked={!!form._videoFile} onChange={()=>{}} style={{accentColor:"#2563EB"}}/>
                Fichier vidéo
              </label>
            </div>
            {!form._videoFile ? (
              <input value={form.url} onChange={F("url")} placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                style={{width:"100%",padding:"10px 13px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,fontFamily:"inherit",background:"#f8faff"}}/>
            ) : (
              <div style={{padding:"12px 14px",border:"1.5px dashed #2563EB",borderRadius:10,background:"#eff6ff",fontSize:13,color:"#2563EB",display:"flex",alignItems:"center",gap:8}}>
                <Play size={14}/>{form._videoFile.name}
              </div>
            )}
            <label style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:8,cursor:"pointer",fontSize:12,color:"#2563EB",fontWeight:600}}>
              <input type="file" accept="video/*" style={{display:"none"}} onChange={e=>{
                const f=e.target.files?.[0];
                if(f) setForm(prev=>({...prev,_videoFile:f,url:""}));
              }}/>
              Choisir un fichier vidéo
            </label>
          </div>
          {form.url && (() => {
            const ytId = form.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([^&\n?#]+)/)?.[1];
            return ytId ? (
              <div style={{marginBottom:14,borderRadius:12,overflow:"hidden",aspectRatio:"16/9",background:"#000"}}>
                <iframe src={`https://www.youtube.com/embed/${ytId}`} style={{width:"100%",height:"100%",border:"none"}} allowFullScreen title="preview"/>
              </div>
            ) : null;
          })()}
          <FArea label="Description" rows={3} value={form.description} onChange={F("description")} placeholder="Décrivez le contenu de la vidéo…"/>
          <div className="grid-2">
            <div>
              <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6,fontWeight:500}}>Catégorie</label>
              <select value={form.categorie} onChange={F("categorie")} style={{width:"100%",padding:"10px 13px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,fontFamily:"inherit",background:"#f8faff"}}>
                {CATS.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <FInput label="Ordre d'affichage" value={form.ordre} onChange={F("ordre")} type="number" placeholder="0"/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <input type="checkbox" id="vid-actif" checked={form.actif} onChange={e=>setForm(f=>({...f,actif:e.target.checked}))} style={{width:16,height:16}}/>
            <label htmlFor="vid-actif" style={{fontSize:13,fontWeight:500,cursor:"pointer"}}>Visible sur le site</label>
          </div>
          <SubmitBtn saving={saving} label={modal.mode==="add"?"Ajouter la vidéo":"Enregistrer"} onClick={save}/>
        </Modal>
      )}

      {confirm && <Confirm msg={`Supprimer la vidéo "${confirm.titre}" ?`}
        onConfirm={async()=>{const ok=await remove(confirm.id);if(ok)setConf(null);}}
        onCancel={()=>setConf(null)}/>}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ═════════════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id:"accueil",           label:"Accueil",              icon:"🏠" },
  { id:"directeur",         label:"Directeur",            icon:"directeur" },
  { id:"quiSommesNous",     label:"Qui sommes-nous",      icon:"info" },
  { id:"domaines",          label:"Domaines",             icon:"domaines" },
  { id:"membres",           label:"Membres",              icon:"membres" },
  { id:"projets",           label:"Projets",              icon:"projets" },
  { id:"etudes",            label:"Études de cas",        icon:"etudes" },
  { id:"formations",        label:"Formations",           icon:"formations" },
  { id:"formationsAvenir",  label:"Formations à venir",   icon:"calendrier" },
  { id:"avis",              label:"Avis clients",         icon:"avis" },
  { id:"contact",           label:"Messages contact",     icon:"mail" },
  { id:"partenaires",       label:"Partenaires",          icon:"partenaires" },
  { id:"videos",            label:"Vidéos",               icon:"🎬" },
  { id:"settings",          label:"Paramètres API",       icon:"settings" },
];

function Sidebar({ active, onSelect, counts, sidebarOpen, onClose, onLogout }) {
  return (
    <>
      {sidebarOpen && <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:299}}/>}
      <aside className={`sidebar${sidebarOpen?" open":""}`}>
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(37,99,235,.15)"}}>
          <img src="/logo.jpeg" alt="Africa Ingénierie" style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,.15)"}}/>
          <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:6,letterSpacing:".05em"}}>TABLEAU DE BORD</div>
        </div>
        <nav style={{flex:1,paddingTop:10,overflowY:"auto"}}>
          {NAV_ITEMS.map((item,i)=>(
            <button key={item.id} className={`nav-item${active===item.id?" active":""}`}
              onClick={()=>{onSelect(item.id);onClose();}} style={{animationDelay:`${i*40}ms`}}>
              {resolveIcon(item.icon, 16)}
              <span>{item.label}</span>
              {counts[item.id]!==undefined && <span className="nav-count">{counts[item.id]}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 10px",borderTop:"1px solid rgba(37,99,235,.15)"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,.25)",padding:"0 6px",marginBottom:8}}>api.ingenierieafrica.com</div>
          <button onClick={onLogout} className="nav-item" style={{color:"rgba(255,100,80,.7)"}}>
            <span>🚪</span><span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═════════════════════════════════════════════════════════════════════════════
export default function AdminApp() {
  const [authed,      setAuthed]      = useState(()=>sessionStorage.getItem(SESSION_KEY)==="1");
  const [toasts,      setToasts]      = useState([]);
  const [activePage,  setActivePage]  = useState("accueil");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts,      setCounts]      = useState({});

  const addToast = useCallback((msg,type="success")=>{
    const id = Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4200);
  },[]);

  const updateCount = useCallback((key,n)=>{ setCounts(c=>({...c,[key]:n})); },[]);

  if (!authed) return <LoginPage onLogin={()=>setAuthed(true)}/>;

  return (
    <div className="app-layout" style={{fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active={activePage} onSelect={setActivePage} counts={counts}
        sidebarOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)}
        onLogout={()=>{sessionStorage.removeItem(SESSION_KEY);clearToken();setAuthed(false);}}/>

      <div className="main-area" style={{background:"#F0F4FF",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        {/* Topbar */}
        <div style={{position:"sticky",top:0,zIndex:200,background:"rgba(255,255,255,.98)",backdropFilter:"blur(10px)",borderBottom:"1px solid #e8e5de",padding:"0 16px",height:50,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setSidebarOpen(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",padding:6,borderRadius:8,display:"flex",flexDirection:"column",gap:4,flexShrink:0}} aria-label="Menu">
            {[0,1,2].map(i=><span key={i} style={{display:"block",width:20,height:2,background:"#0d1b35",borderRadius:2}}/>)}
          </button>
          <div style={{fontSize:13,fontWeight:500,color:"#1C1C1A"}}>{activePage==="accueil"?"🏠 Accueil":NAV_ITEMS.find(n=>n.id===activePage)?.label}</div>
          <a href="/" style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",background:"#eff6ff",borderRadius:99,fontSize:11,fontWeight:600,color:"#2563EB",textDecoration:"none",border:"1px solid #bfdbfe",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background="#dbeafe"}} onMouseLeave={e=>{e.currentTarget.style.background="#eff6ff"}}>← Site</a>
          <code className="topbar-url" style={{fontSize:10,background:"#eff6ff",padding:"3px 9px",borderRadius:6,color:"#2563EB"}}>api.ingenierieafrica.com</code>
        </div>

        {/* Content */}
        <div style={{flex:1,padding:"20px 16px 80px",maxWidth:980,width:"100%",margin:"0 auto"}}>
          {activePage==="accueil"          && <AccueilPage          onNavigate={setActivePage} counts={counts}/>}
          {activePage==="directeur"        && <DirecteurSection        addToast={addToast}/>}
          {activePage==="quiSommesNous"    && <QuiSommesNousSection    addToast={addToast}/>}
          {activePage==="domaines"         && <DomainesSection         addToast={addToast} onCountChange={n=>updateCount("domaines",n)}/>}
          {activePage==="membres"          && <MembresSection          addToast={addToast} onCountChange={n=>updateCount("membres",n)}/>}
          {activePage==="projets"          && <ProjetsSection          addToast={addToast} onCountChange={n=>updateCount("projets",n)}/>}
          {activePage==="etudes"           && <EtudesSection           addToast={addToast} onCountChange={n=>updateCount("etudes",n)}/>}
          {activePage==="formations"       && <FormationsSection       addToast={addToast} onCountChange={n=>updateCount("formations",n)}/>}
          {activePage==="formationsAvenir" && <FormationsAvenirSection addToast={addToast} onCountChange={n=>updateCount("formationsAvenir",n)}/>}
          {activePage==="avis"             && <AvisSection             addToast={addToast} onCountChange={n=>updateCount("avis",n)}/>}
          {activePage==="contact"          && <ContactSection          addToast={addToast} onCountChange={n=>updateCount("contact",n)}/>}
          {activePage==="partenaires"      && <PartenairesSection addToast={addToast} onCountChange={n=>updateCount("partenaires",n)}/>}
          {activePage==="videos"           && <VideosSection       addToast={addToast} onCountChange={n=>updateCount("videos",n)}/>}
          {activePage==="settings"         && <ApiSettings/>}
        </div>
      </div>

      <Toast toasts={toasts}/>
      <DebugBar/>
    </div>
  );
}
