import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronRight, Star, CheckCircle, AlertCircle, Settings, Info, ArrowUp, MapPin, Phone, Mail, Award, Users, Briefcase, Wrench, Zap, Shield, BookOpen, BarChart2, Heart } from "lucide-react";

const API_BASE = "https://api.ingenierieafrica.com";
const API_KEY  = "africa_api_key_2025";

const apiFetch = async (ep) => {
  const r = await fetch(`${API_BASE}${ep}`, { headers:{"x-api-key":API_KEY,"Content-Type":"application/json"} });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
};

const imgSrc  = v => !v ? null : (v.startsWith("http")||v.startsWith("blob")) ? v : `${API_BASE}${v}`;
const fmtDate = iso => iso ? new Date(iso).toLocaleDateString("fr-FR",{year:"numeric",month:"long",day:"numeric"}) : "";

function useApi(ep) {
  const [data,setData]=useState(null);const [loading,setLoading]=useState(true);
  useEffect(()=>{apiFetch(ep).then(setData).catch(()=>setData([])).finally(()=>setLoading(false));},[ep]);
  return {data,loading};
}

function useReveal(threshold=0.12) {
  const ref=useRef(null);const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setVisible(true);},{threshold});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[threshold]);
  return {ref,visible};
}

function useCounter(target,duration=1800,active=false) {
  const [count,setCount]=useState(0);
  useEffect(()=>{
    if(!active)return;
    let s=0;const step=target/(duration/16);
    const t=setInterval(()=>{s+=step;if(s>=target){setCount(target);clearInterval(t);}else setCount(Math.floor(s));},16);
    return()=>clearInterval(t);
  },[target,duration,active]);
  return count;
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{font-family:'Plus Jakarta Sans',sans-serif;color:#1a1a2e;background:#fff;overflow-x:hidden;}
  img{max-width:100%;display:block;}a{text-decoration:none;color:inherit;}button{font-family:inherit;cursor:pointer;border:none;outline:none;}
  :root{
    --orange:#2563EB;--dark:#0d1b35;--gold:#60A5FA;
    --cream:#F0F5FF;--light:#F8FAFF;--gray:#6b7280;--border:#E5EAFF;
    --accent:#F59E0B;--success:#10B981;--purple:#7C3AED;
    --shadow-sm:0 2px 8px rgba(37,99,235,.08);
    --shadow-md:0 8px 32px rgba(37,99,235,.12);
    --shadow-lg:0 24px 64px rgba(37,99,235,.16);
    --r-sm:12px;--r-md:20px;--r-lg:28px;--r-xl:36px;
  }

  @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeLeft{from{opacity:0;transform:translateX(-32px)}to{opacity:1;transform:translateX(0)}}
  @keyframes fadeRight{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-800px 0}100%{background-position:800px 0}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
  @keyframes slideCarousel{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes borderAnim{0%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}}
  @keyframes underlineGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  @keyframes blobPulse{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.08) rotate(3deg)}}

  .reveal{opacity:0;transform:translateY(40px);transition:opacity .7s ease,transform .7s ease;}
  .reveal.visible{opacity:1;transform:translateY(0);}
  .reveal-left{opacity:0;transform:translateX(-40px);transition:opacity .7s ease,transform .7s ease;}
  .reveal-left.visible{opacity:1;transform:translateX(0);}
  .reveal-right{opacity:0;transform:translateX(40px);transition:opacity .7s ease,transform .7s ease;}
  .reveal-right.visible{opacity:1;transform:translateX(0);}
  .reveal-scale{opacity:0;transform:scale(.92);transition:opacity .6s ease,transform .6s ease;}
  .reveal-scale.visible{opacity:1;transform:scale(1);}

  .section{padding:100px 5%;}.section-sm{padding:60px 5%;}
  .section-dark{background:#0d1b35;color:#fff;}.section-cream{background:var(--cream);} .section-blue{background:linear-gradient(135deg,#eff6ff,#dbeafe);}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:32px;}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;}
  .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;}
  @media(max-width:1024px){.grid-3{grid-template-columns:repeat(2,1fr);}.grid-4{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:640px){.grid-2,.grid-3,.grid-4{grid-template-columns:1fr;}}

  .section-tag{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--orange);margin-bottom:13px;display:flex;align-items:center;gap:10px;}
  .section-tag::before{display:none;}
  .section-title{font-family:'Playfair Display',serif;font-size:clamp(28px,3.5vw,50px);font-weight:900;line-height:1.1;margin-bottom:16px;color:#0f172a;}
  .section-title em{color:var(--orange);font-style:normal;}
  .divider{width:60px;height:3px;background:linear-gradient(90deg,var(--orange),var(--gold));border-radius:2px;margin:18px 0;}

  .btn-primary{position:relative;overflow:hidden;padding:14px 34px;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;border-radius:99px;font-size:15px;font-weight:700;transition:transform .25s,box-shadow .25s;display:inline-flex;align-items:center;gap:9px;letter-spacing:.01em;box-shadow:0 4px 20px rgba(37,99,235,.35);}
  .btn-primary::after{content:'';position:absolute;inset:0;background:rgba(255,255,255,.18);transform:translateX(-100%);transition:transform .35s ease;}
  .btn-primary:hover::after{transform:translateX(0);}
  .btn-primary:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(37,99,235,.45);}
  .btn-outline{padding:14px 34px;border:2px solid rgba(255,255,255,.35);color:#fff;border-radius:99px;font-size:15px;font-weight:600;transition:all .25s;display:inline-flex;align-items:center;gap:9px;backdrop-filter:blur(4px);}
  .btn-outline:hover{border-color:#fff;background:rgba(255,255,255,.12);transform:translateY(-2px);}
  .btn-dark{padding:12px 28px;border:1.5px solid var(--border);color:var(--dark);border-radius:99px;font-size:13.5px;font-weight:600;transition:all .25s;display:inline-flex;align-items:center;gap:7px;box-shadow:var(--shadow-sm);}
  .btn-dark:hover{background:var(--dark);color:#fff;border-color:var(--dark);transform:translateY(-2px);box-shadow:var(--shadow-md);}

  /* NAVBAR */
  .navbar{position:fixed;top:0;left:0;right:0;z-index:1000;padding:0 5%;display:flex;align-items:center;justify-content:space-between;height:72px;transition:all .35s ease;}
  .navbar.scrolled{background:rgba(255,255,255,.97);backdrop-filter:blur(20px);box-shadow:0 4px 30px rgba(37,99,235,.1),0 1px 0 rgba(37,99,235,.06);}
  .nav-logo{transition:all .35s;}
  .nav-logo img{width:46px;height:46px;border-radius:50%;object-fit:cover;display:block;transition:all .35s;flex-shrink:0;}
  .navbar:not(.scrolled) .nav-logo img{border:2px solid rgba(255,255,255,.35);box-shadow:0 0 0 4px rgba(255,255,255,.08);}
  .navbar.scrolled .nav-logo img{border:2px solid rgba(37,99,235,.3);box-shadow:0 0 0 4px rgba(37,99,235,.08);}
  .nav-links{display:flex;align-items:center;gap:34px;}
  .nav-links a{font-size:13.5px;font-weight:600;color:rgba(255,255,255,.9);position:relative;transition:color .2s;cursor:pointer;}
  .navbar.scrolled .nav-links a{color:#334155;}
  .nav-links a::after{content:'';position:absolute;bottom:-5px;left:0;right:0;height:2.5px;background:linear-gradient(90deg,var(--orange),var(--gold));border-radius:99px;transform:scaleX(0);transform-origin:left;transition:transform .28s ease;}
  .nav-links a:hover::after,.nav-links a.active::after{transform:scaleX(1);}
  .nav-links a:hover,.navbar.scrolled .nav-links a:hover{color:var(--orange);}
  .nav-cta{padding:10px 24px;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff!important;border-radius:99px;font-weight:700;font-size:13px;transition:all .25s!important;box-shadow:0 4px 16px rgba(37,99,235,.4)!important;}
  .nav-cta:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(37,99,235,.55)!important;}
  .nav-cta::after{display:none!important;}
  .burger{display:none;flex-direction:column;gap:5px;background:none;padding:6px;}
  .burger span{display:block;width:24px;height:2.5px;background:#fff;border-radius:99px;transition:all .3s;}
  .navbar.scrolled .burger span{background:var(--dark);}
  @media(max-width:960px){.nav-links{display:none;}.burger{display:flex;}}
  .nav-mobile{display:none;position:fixed;inset:0;background:linear-gradient(160deg,#0d1b35 0%,#0f2460 100%);flex-direction:column;align-items:center;justify-content:center;gap:28px;z-index:999;}
  .nav-mobile.open{display:flex;}
  .nav-mobile a{font-size:22px;font-weight:700;color:rgba(255,255,255,.9);cursor:pointer;transition:color .2s;}
  .nav-mobile a:hover{color:var(--gold);}
  .nav-mobile .nav-cta{background:linear-gradient(135deg,#2563EB,#1D4ED8);padding:14px 40px;border-radius:99px;font-size:16px;}
  .nav-close{position:absolute;top:24px;right:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:22px;line-height:1;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;}
  .nav-close:hover{background:rgba(255,255,255,.18);}

  /* HERO */
  .hero{min-height:100vh;position:relative;display:flex;align-items:center;overflow:hidden;background:var(--dark);}
  .hero-bg{position:absolute;inset:0;background:url('/hero-industry.jpg') center center/cover no-repeat;}
  .hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(5,13,31,.82) 0%,rgba(13,27,62,.75) 45%,rgba(15,36,96,.65) 100%);}
  .hero-grid{display:none;}
  .hero-orb1{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.28) 0%,transparent 65%);top:-120px;right:-80px;animation:float 7s ease-in-out infinite;}
  .hero-orb2{position:absolute;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.18) 0%,transparent 65%);bottom:40px;left:3%;animation:float 9s ease-in-out infinite reverse;}
  .hero-orb3{position:absolute;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(245,158,11,.12) 0%,transparent 65%);top:30%;left:40%;animation:float 5s ease-in-out 2s infinite;}
  .hero-content{position:relative;z-index:2;padding:0 5%;max-width:800px;width:100%;}
  .hero-badge{display:inline-flex;align-items:center;gap:9px;background:rgba(37,99,235,.14);border:1px solid rgba(37,99,235,.3);color:#93c5fd;padding:9px 20px;border-radius:99px;font-size:11.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:30px;animation:fadeUp .6s .1s ease both;backdrop-filter:blur(8px);}
  .hero-dot{width:8px;height:8px;border-radius:50%;background:#60A5FA;animation:pulse 1.8s infinite;box-shadow:0 0 8px rgba(96,165,250,.6);}
  .hero h1{font-family:'Playfair Display',serif;font-size:clamp(38px,5.8vw,76px);font-weight:900;color:#fff;line-height:1.08;margin-bottom:24px;animation:fadeUp .7s .2s ease both;}
  .hero h1 em{color:#60A5FA;font-style:normal;position:relative;}
  .hero h1 em::after{content:'';position:absolute;bottom:2px;left:0;right:0;height:4px;background:linear-gradient(90deg,#2563EB,#60A5FA,#7C3AED);border-radius:99px;transform:scaleX(0);transform-origin:left;animation:underlineGrow 1s .9s forwards;opacity:.7;}
  .hero p{font-size:clamp(15px,1.8vw,17.5px);color:rgba(255,255,255,.6);max-width:560px;line-height:1.9;margin-bottom:40px;animation:fadeUp .7s .3s ease both;}
  .hero-actions{display:flex;gap:14px;flex-wrap:wrap;animation:fadeUp .7s .4s ease both;}
  .hero-scroll{position:absolute;bottom:36px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(255,255,255,.25);font-size:10px;letter-spacing:.14em;text-transform:uppercase;animation:fadeUp .8s 1.2s ease both;}
  .hero-scroll-line{width:1px;height:48px;background:linear-gradient(to bottom,rgba(255,255,255,.3),transparent);animation:pulse 2s infinite;}
  .hero-stats{position:absolute;right:5%;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:14px;animation:fadeLeft .8s .5s ease both;z-index:2;}
  @media(max-width:900px){.hero-stats{display:none;}}
  .hero-stat{background:rgba(255,255,255,.06);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:22px 26px;min-width:150px;text-align:center;transition:all .3s;box-shadow:0 8px 32px rgba(0,0,0,.2);}
  .hero-stat:hover{background:rgba(255,255,255,.1);transform:scale(1.05) translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,.25);}
  .hero-stat-num{font-family:'Playfair Display',serif;font-size:38px;font-weight:900;background:linear-gradient(135deg,#60A5FA,#93c5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;}
  .hero-stat-label{font-size:10.5px;color:rgba(255,255,255,.45);margin-top:5px;letter-spacing:.07em;text-transform:uppercase;}

  /* MARQUEE */
  .marquee-wrap{overflow:hidden;padding:20px 0;background:linear-gradient(90deg,#eff6ff,#f0f5ff,#eff6ff);border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
  .marquee-track{display:flex;width:max-content;animation:slideCarousel 32s linear infinite;}
  .marquee-item{display:flex;align-items:center;gap:10px;padding:0 36px;white-space:nowrap;font-size:13.5px;font-weight:700;color:#475569;letter-spacing:.02em;}
  .marquee-dot{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,var(--orange),var(--gold));box-shadow:0 0 4px rgba(37,99,235,.3);}

  /* DOMAINE CARDS */
  .domaine-card{border-radius:32px;overflow:hidden;position:relative;height:320px;cursor:pointer;transition:transform .4s cubic-bezier(.34,1.56,.64,1),box-shadow .4s;}
  .domaine-card:hover{transform:translateY(-12px) scale(1.02);box-shadow:0 32px 70px rgba(0,0,0,.28);}
  .domaine-card-img{position:absolute;inset:0;}
  .domaine-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .7s ease;}
  .domaine-card:hover .domaine-card-img img{transform:scale(1.12);}
  .domaine-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(7,14,40,.92) 0%,rgba(7,14,40,.35) 55%,transparent 100%);}
  .domaine-num{position:absolute;top:16px;right:18px;font-family:'Playfair Display',serif;font-size:56px;font-weight:900;color:rgba(255,255,255,.06);line-height:1;transition:all .35s;}
  .domaine-card:hover .domaine-num{color:rgba(96,165,250,.2);font-size:68px;}
  .domaine-body{position:absolute;bottom:0;left:0;right:0;padding:26px;transform:translateY(10px);transition:transform .35s;}
  .domaine-card:hover .domaine-body{transform:translateY(0);}
  .domaine-tag{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#93c5fd;margin-bottom:6px;}
  .domaine-title{font-size:18px;font-weight:800;color:#fff;line-height:1.25;margin-bottom:8px;}
  .domaine-desc{font-size:12.5px;color:rgba(255,255,255,.6);line-height:1.65;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;opacity:0;transition:opacity .3s .1s;}
  .domaine-card:hover .domaine-desc{opacity:1;}
  .domaine-arrow{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#93c5fd;margin-top:8px;opacity:0;transform:translateX(-10px);transition:all .3s .15s;}
  .domaine-card:hover .domaine-arrow{opacity:1;transform:translateX(0);}

  /* EXPERTISE GRID */
  .expertise-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
  @media(max-width:768px){.expertise-grid{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:480px){.expertise-grid{grid-template-columns:1fr;}}
  .expertise-card{background:#fff;border:1.5px solid var(--border);border-radius:28px;padding:28px 24px;cursor:pointer;transition:all .35s cubic-bezier(.34,1.56,.64,1);display:flex;flex-direction:column;gap:13px;position:relative;overflow:hidden;box-shadow:var(--shadow-sm);}
  .expertise-card::before{content:'';position:absolute;inset:0;background:linear-gradient(140deg,rgba(37,99,235,.06),transparent 60%);opacity:0;transition:opacity .3s;}
  .expertise-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--orange),var(--gold));border-radius:0 0 24px 24px;transform:scaleX(0);transform-origin:left;transition:transform .35s ease;}
  .expertise-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(37,99,235,.14);border-color:rgba(37,99,235,.25);}
  .expertise-card:hover::before{opacity:1;}
  .expertise-card:hover::after{transform:scaleX(1);}
  .exp-icon{width:54px;height:54px;border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:24px;transition:transform .35s;box-shadow:0 4px 12px rgba(0,0,0,.06);}
  .expertise-card:hover .exp-icon{transform:scale(1.18) rotate(-6deg);}
  .exp-title{font-size:16px;font-weight:800;line-height:1.3;color:#1e293b;}
  .exp-desc{font-size:13.5px;color:#64748b;line-height:1.7;}
  .exp-link{font-size:12.5px;font-weight:700;color:var(--orange);display:flex;align-items:center;gap:5px;margin-top:auto;transition:gap .25s;}
  .expertise-card:hover .exp-link{gap:9px;}

  /* IMAGE HOVER ZOOM */
  .img-zoom{overflow:hidden;border-radius:inherit;}
  .img-zoom img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease;}
  .img-zoom:hover img{transform:scale(1.08);}

  /* DIRECTEUR BLOB */
  .dir-blob{position:relative;width:100%;aspect-ratio:3/4;max-width:400px;}
  .dir-blob-shape{position:absolute;inset:0;background:linear-gradient(135deg,#2563EB,#60A5FA);border-radius:60% 40% 30% 70%/60% 30% 70% 40%;animation:borderAnim 8s ease-in-out infinite;overflow:hidden;}
  .dir-blob-shape img{width:100%;height:100%;object-fit:cover;}
  .dir-blob-border{position:absolute;inset:-8px;border:2px solid var(--orange);border-radius:60% 40% 30% 70%/60% 30% 70% 40%;animation:borderAnim 8s ease-in-out infinite reverse;opacity:.25;}
  .dir-quote-card{position:absolute;bottom:-20px;right:-20px;background:#fff;border-radius:20px;padding:18px 22px;box-shadow:0 12px 40px rgba(0,0,0,.15);max-width:220px;border-left:4px solid var(--orange);}
  .dir-quote-text{font-size:12.5px;font-style:italic;color:#555;line-height:1.6;}
  .dir-quote-name{font-size:10.5px;font-weight:700;color:var(--orange);margin-top:8px;text-transform:uppercase;letter-spacing:.06em;}

  /* STATS */
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
  @media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
  .stat-item{background:#fff;padding:40px 24px;text-align:center;transition:all .35s cubic-bezier(.34,1.56,.64,1);border-radius:28px;border:1.5px solid var(--border);box-shadow:var(--shadow-sm);position:relative;overflow:hidden;}
  .stat-item::before{content:'';position:absolute;inset:0;background:linear-gradient(140deg,rgba(37,99,235,.05),transparent);opacity:0;transition:opacity .3s;}
  .stat-item:hover{background:var(--light);transform:translateY(-6px);box-shadow:var(--shadow-md);border-color:rgba(37,99,235,.2);}
  .stat-item:hover::before{opacity:1;}
  .stat-num{font-family:'Playfair Display',serif;font-size:52px;font-weight:900;background:linear-gradient(135deg,#2563EB,#60A5FA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;}
  .stat-sfx{font-size:30px;}
  .stat-label{font-size:13px;color:#64748b;margin-top:10px;line-height:1.5;font-weight:500;}

  /* PROJET CARD */
  .projet-card{border-radius:32px;overflow:hidden;background:#fff;border:1.5px solid var(--border);transition:all .35s cubic-bezier(.34,1.56,.64,1);box-shadow:var(--shadow-sm);}
  .projet-card:hover{transform:translateY(-10px);box-shadow:0 28px 64px rgba(37,99,235,.15);border-color:rgba(37,99,235,.2);}
  .projet-img{height:230px;overflow:hidden;position:relative;background:var(--cream);}
  .projet-img img{width:100%;height:100%;object-fit:cover;transition:transform .65s ease;}
  .projet-card:hover .projet-img img{transform:scale(1.12);}
  .projet-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:52px;background:linear-gradient(135deg,var(--cream),#e0eaff);}
  .projet-tag{position:absolute;top:14px;left:14px;background:rgba(7,14,40,.7);color:#fff;padding:5px 14px;border-radius:99px;font-size:11px;font-weight:600;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);}
  .projet-body{padding:26px;}
  .projet-title{font-size:17.5px;font-weight:800;margin-bottom:10px;line-height:1.3;color:#1e293b;}
  .projet-desc{font-size:13.5px;color:#64748b;line-height:1.7;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}

  /* ÉTUDE CARD */
  .etude-card{border-radius:32px;overflow:hidden;background:#fff;border:1.5px solid var(--border);transition:all .35s cubic-bezier(.34,1.56,.64,1);box-shadow:var(--shadow-sm);}
  .etude-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(37,99,235,.14);border-color:rgba(37,99,235,.2);}
  .etude-avap{display:grid;grid-template-columns:1fr 1fr;height:210px;}
  .etude-side{position:relative;overflow:hidden;}
  .etude-side img{width:100%;height:100%;object-fit:cover;transition:transform .55s ease;}
  .etude-card:hover .etude-side img{transform:scale(1.1);}
  .etude-lbl{position:absolute;top:12px;left:12px;padding:4px 12px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;backdrop-filter:blur(6px);}
  .etude-body{padding:22px;}
  .etude-chip{font-size:11px;font-weight:600;padding:4px 12px;border-radius:99px;}

  /* FORMATION CARD */
  .formation-card{border-radius:32px;overflow:hidden;background:#fff;border:1.5px solid var(--border);transition:all .35s cubic-bezier(.34,1.56,.64,1);display:flex;flex-direction:column;box-shadow:var(--shadow-sm);}
  .formation-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(37,99,235,.14);border-color:rgba(37,99,235,.25);}
  .formation-img{height:195px;overflow:hidden;position:relative;background:linear-gradient(135deg,var(--cream),#e0eaff);}
  .formation-img img{width:100%;height:100%;object-fit:cover;transition:transform .55s ease;}
  .formation-card:hover .formation-img img{transform:scale(1.1);}
  .formation-body{padding:24px;flex:1;display:flex;flex-direction:column;gap:9px;}

  /* AVIS SLIDER */
  .avis-card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:32px;padding:40px;transition:all .35s;backdrop-filter:blur(8px);}
  .avis-card:hover{background:rgba(255,255,255,.1);box-shadow:0 16px 48px rgba(0,0,0,.2);}
  .avis-stars{font-size:22px;color:#F59E0B;margin-bottom:18px;letter-spacing:3px;}
  .avis-text{font-size:17px;line-height:1.9;color:rgba(255,255,255,.85);font-style:italic;margin-bottom:28px;}
  .avis-author{display:flex;align-items:center;gap:16px;}
  .avis-avatar{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#7C3AED);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;color:#fff;flex-shrink:0;box-shadow:0 4px 16px rgba(37,99,235,.4);}
  .avis-dots{display:flex;gap:8px;justify-content:center;margin-top:28px;}
  .avis-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.2);transition:all .35s;cursor:pointer;}
  .avis-dot.active{background:#60A5FA;width:28px;border-radius:99px;box-shadow:0 0 8px rgba(96,165,250,.5);}

  /* PARTENAIRES */
  .part-logo{background:#fff;border:1.5px solid var(--border);border-radius:28px;padding:26px 34px;display:flex;align-items:center;justify-content:center;transition:all .35s cubic-bezier(.34,1.56,.64,1);box-shadow:var(--shadow-sm);}
  .part-logo:hover{border-color:rgba(37,99,235,.3);box-shadow:0 16px 40px rgba(37,99,235,.14);transform:translateY(-6px) scale(1.02);}
  .part-logo img{height:50px;object-fit:contain;filter:grayscale(.8) opacity(.7);transition:all .35s;}
  .part-logo:hover img{filter:grayscale(0) opacity(1);}

  /* CONTACT */
  .contact-grid{display:grid;grid-template-columns:1fr 1.4fr;gap:60px;align-items:start;}
  @media(max-width:768px){.contact-grid{grid-template-columns:1fr;}}
  .contact-info-card{background:linear-gradient(150deg,#0d1b35,#0f2460 60%,#0d1b35);border-radius:32px;padding:44px;color:#fff;border:1px solid rgba(37,99,235,.2);box-shadow:var(--shadow-lg);}
  .contact-item{display:flex;gap:16px;margin-bottom:24px;}
  .contact-icon{width:46px;height:46px;border-radius:18px;background:rgba(37,99,235,.18);border:1px solid rgba(37,99,235,.3);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
  .contact-form-card{background:#fff;border:1.5px solid var(--border);border-radius:32px;padding:44px;box-shadow:var(--shadow-md);}
  .form-label{font-size:13px;font-weight:700;margin-bottom:7px;display:block;color:#374151;}
  .form-input,.form-select,.form-textarea{width:100%;padding:13px 17px;border:1.5px solid var(--border);border-radius:18px;font-size:14px;font-family:inherit;background:var(--light);color:#1e293b;transition:border-color .25s,box-shadow .25s;outline:none;}
  .form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--orange);box-shadow:0 0 0 4px rgba(37,99,235,.1);background:#fff;}
  .form-textarea{min-height:135px;resize:vertical;}
  .form-submit{width:100%;padding:15px;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;border-radius:18px;font-size:15px;font-weight:700;transition:all .25s;box-shadow:0 4px 16px rgba(37,99,235,.3);}
  .form-submit:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(37,99,235,.45);}
  .form-submit:disabled{opacity:.6;transform:none;cursor:not-allowed;}

  /* STAR PICKER */
  .star-picker{display:flex;gap:8px;margin-bottom:6px;}
  .star-picker button{background:none;border:none;font-size:34px;cursor:pointer;transition:transform .15s;line-height:1;color:#ddd;padding:0;}
  .star-picker button.lit{color:var(--gold);}
  .star-picker button:hover{transform:scale(1.3);}

  /* FOOTER */
  .footer{background:linear-gradient(180deg,#070e20,#0d1b35 30%);padding:80px 5% 0;}
  .footer-engage{border-bottom:1px solid rgba(37,99,235,.12);padding-bottom:52px;margin-bottom:56px;display:grid;grid-template-columns:auto 1fr;gap:52px;align-items:center;}
  @media(max-width:640px){.footer-engage{grid-template-columns:1fr;gap:24px;}}
  .footer-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px;margin-bottom:54px;border-bottom:1px solid rgba(37,99,235,.08);padding-bottom:54px;}
  @media(max-width:768px){.footer-grid{grid-template-columns:1fr 1fr;}}
  @media(max-width:480px){.footer-grid{grid-template-columns:1fr;}}
  .footer-col-title{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.7);margin-bottom:18px;}
  .footer-links{display:flex;flex-direction:column;gap:11px;}
  .footer-links a{font-size:13.5px;color:rgba(255,255,255,.38);transition:color .2s,transform .2s;cursor:pointer;display:flex;align-items:center;gap:7px;}
  .footer-links a:hover{color:var(--gold);transform:translateX(4px);}
  .footer-bottom{border-top:1px solid rgba(37,99,235,.12);padding:24px 0;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:13px;color:rgba(255,255,255,.25);}

  /* SOCIAL BAR */
  .social-bar{background:#060e1f;border-top:1px solid rgba(37,99,235,.15);padding:22px 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;}
  .social-text{font-size:14px;color:rgba(255,255,255,.4);}
  .social-text strong{color:var(--orange);}
  .social-links{display:flex;gap:10px;flex-wrap:wrap;}
  .soc-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:99px;font-size:13px;font-weight:600;transition:transform .2s,box-shadow .2s;white-space:nowrap;}
  .soc-btn:hover{transform:translateY(-3px);}
  .soc-wa{background:#25D366;color:#fff;}.soc-wa:hover{box-shadow:0 8px 24px rgba(37,211,102,.4);}
  .soc-fb{background:#1877F2;color:#fff;}.soc-fb:hover{box-shadow:0 8px 24px rgba(24,119,242,.4);}
  .soc-ig{background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;}.soc-ig:hover{box-shadow:0 8px 24px rgba(220,39,67,.4);}


  /* ── ANIMATIONS SUPPLÉMENTAIRES ── */
  @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(37,99,235,.3)}50%{box-shadow:0 0 40px rgba(37,99,235,.6)} }
  @keyframes typewriter { from{width:0}to{width:100%} }
  @keyframes countUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
  @keyframes gradShift { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
  @keyframes rotateSlow { to{transform:rotate(360deg)} }
  @keyframes wave { 0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.4)} }
  @keyframes slideUp { from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1} }

  /* ── HERO ENRICHI ── */
  .hero-line { width: 0; height: 2px; background: linear-gradient(90deg,#2563EB,#60A5FA); border-radius: 2px; animation: typewriter 1.2s 1s ease forwards; display: block; margin-bottom: 20px; }

  /* ── SECTION NUMBER ── */
  .section-number { font-family:'Playfair Display',serif; font-size:120px; font-weight:900; color:rgba(37,99,235,.05); position:absolute; top:-20px; left:-10px; line-height:1; pointer-events:none; user-select:none; }

  /* ── IMAGE PARALLAX ── */
  .parallax-img { overflow:hidden; border-radius:inherit; }
  .parallax-img img { width:100%; height:110%; object-fit:cover; margin-top:-5%; transition:transform .8s ease; }
  .parallax-img:hover img { transform:translateY(-5%); }

  /* ── CARD HOVER 3D ── */
  .card-3d { transition:transform .3s ease,box-shadow .3s ease; transform-style:preserve-3d; }
  .card-3d:hover { transform:perspective(1000px) rotateX(-3deg) rotateY(3deg) translateY(-6px); box-shadow:0 24px 56px rgba(37,99,235,.15); }

  /* ── BADGE ANIMÉ ── */
  .badge-pulse { position:relative; }
  .badge-pulse::before { content:''; position:absolute; inset:-4px; border-radius:99px; border:2px solid rgba(37,99,235,.4); animation:glow 2s infinite; }

  /* ── FLOATING ELEMENTS ── */
  .float-1 { animation:float 4s ease-in-out infinite; }
  .float-2 { animation:float 6s ease-in-out 1s infinite reverse; }
  .float-3 { animation:float 5s ease-in-out 2s infinite; }

  /* ── GRADIENT TEXT ── */
  .grad-text { background:linear-gradient(135deg,#2563EB,#60A5FA); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

  /* ── PROGRESS BAR ANIMÉE ── */
  .progress-bar { height:6px; background:var(--border); border-radius:99px; overflow:hidden; margin-top:8px; }
  .progress-fill { height:100%; background:linear-gradient(90deg,#2563EB,#60A5FA); border-radius:99px; transform:scaleX(0); transform-origin:left; transition:transform 1.2s ease; }
  .progress-fill.animated { transform:scaleX(1); }

  /* ── TIMELINE ── */
  .timeline { position:relative; padding-left:32px; }
  .timeline::before { content:''; position:absolute; left:10px; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,#2563EB,rgba(37,99,235,.1)); }
  .timeline-item { position:relative; margin-bottom:36px; }
  .timeline-dot { position:absolute; left:-27px; top:4px; width:14px; height:14px; border-radius:50%; background:#2563EB; border:3px solid #fff; box-shadow:0 0 0 3px rgba(37,99,235,.2); }
  .timeline-content { background:#fff; border:1px solid var(--border); border-radius:18px; padding:18px 20px; transition:all .3s; }
  .timeline-content:hover { transform:translateX(6px); border-color:#2563EB; box-shadow:0 8px 24px rgba(37,99,235,.1); }

  /* ── SKILL BAR ── */
  .skill-item { margin-bottom:20px; }
  .skill-header { display:flex; justify-content:space-between; margin-bottom:8px; font-size:13.5px; font-weight:600; }
  .skill-pct { color:#2563EB; font-weight:700; }

  /* ── FEATURE ICON ── */
  .feature-icon-wrap { width:64px; height:64px; border-radius:22px; display:flex; align-items:center; justify-content:center; font-size:28px; margin-bottom:18px; position:relative; }
  .feature-icon-wrap::after { content:''; position:absolute; inset:0; border-radius:22px; background:inherit; opacity:.2; filter:blur(10px); transform:translateY(4px); z-index:-1; }

  /* ── SCROLL INDICATOR ── */
  .scroll-indicator { position:fixed; top:0; left:0; height:3px; background:linear-gradient(90deg,#2563EB,#60A5FA); z-index:2000; transition:width .1s; }

  /* ── BACK TO TOP ── */
  .back-top { position:fixed; bottom:28px; right:28px; width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,#2563EB,#1D4ED8); color:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 6px 20px rgba(37,99,235,.45); transition:all .3s; z-index:999; cursor:pointer; border:none; }
  .back-top:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(37,99,235,.55); }
  .back-top.hidden { opacity:0; pointer-events:none; transform:translateY(14px); }

  /* MISC */
  /* VIDÉOS */
  .video-card{border-radius:28px;overflow:hidden;background:#fff;border:1.5px solid var(--border);box-shadow:var(--shadow-sm);transition:all .35s cubic-bezier(.34,1.56,.64,1);}
  .video-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(37,99,235,.15);border-color:rgba(37,99,235,.25);}
  .video-thumb{position:relative;aspect-ratio:16/9;background:#0d1b35;overflow:hidden;cursor:pointer;}
  .video-thumb iframe{width:100%;height:100%;border:none;display:block;}
  .video-thumb-cover{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);transition:all .3s;}
  .video-thumb-cover:hover{background:rgba(0,0,0,.1);}
  .video-play-btn{width:60px;height:60px;background:rgba(255,255,255,.95);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(0,0,0,.3);transition:transform .3s;}
  .video-thumb-cover:hover .video-play-btn{transform:scale(1.12);}
  .video-body{padding:22px;}
  .video-cat{display:inline-flex;padding:3px 12px;background:#eff6ff;color:#2563EB;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px;}
  .video-title{font-size:16px;font-weight:800;color:#1e293b;line-height:1.35;margin-bottom:8px;}
  .video-desc{font-size:13px;color:#64748b;line-height:1.65;}

  .spinner{width:44px;height:44px;border:3.5px solid var(--border);border-top-color:var(--orange);border-radius:50%;animation:spin .8s linear infinite;margin:70px auto;}
  .empty{text-align:center;padding:70px 20px;color:#94a3b8;}
  .page-hero{padding:155px 5% 90px;background:var(--dark);position:relative;overflow:hidden;}
  .page-hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,#050d1f 0%,#0d1b3e 40%,#0f2460 65%,#070e1e 100%);}
  .page-hero-grid{display:none;}
  .page-hero-glow{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.22) 0%,transparent 65%);top:-100px;right:-80px;animation:blobPulse 8s ease-in-out infinite;}
  .page-hero-content{position:relative;z-index:2;}
  .page-hero h1{font-family:'Playfair Display',serif;font-size:clamp(32px,4.8vw,62px);font-weight:900;color:#fff;margin-bottom:16px;line-height:1.1;}
  .page-hero p{font-size:16.5px;color:rgba(255,255,255,.55);max-width:540px;line-height:1.8;}
  /* ══ RESPONSIVE COMPLET ══════════════════════════════════════════════════ */
  @media(max-width:1024px){
    .section{padding:80px 5%;}
    .contact-grid{gap:40px;}
  }
  @media(max-width:768px){
    .section{padding:60px 4%;}
    .section-sm{padding:40px 4%;}
    .section-title{font-size:clamp(22px,5vw,36px);}

    /* Hero */
    .hero{min-height:100svh;}
    .hero-content{padding:0 4%;max-width:100%;}
    .hero h1{font-size:clamp(26px,7vw,44px);line-height:1.12;}
    .hero p{font-size:14.5px;max-width:100%;}
    .hero-actions{flex-direction:column;gap:12px;}
    .hero-actions .btn-primary,.hero-actions .btn-outline{width:100%;justify-content:center;text-align:center;}
    .hero-scroll{display:none;}

    /* Navbar */
    .navbar{padding:0 4%;}

    /* Marquee */
    .marquee-item{padding:0 24px;}

    /* Stats */
    .stats-grid{grid-template-columns:1fr 1fr;gap:12px;}
    .stat-num{font-size:40px;}

    /* Page hero */
    .page-hero{padding:120px 4% 60px;}
    .page-hero h1{font-size:clamp(26px,6vw,44px);}
    .page-hero p{font-size:15px;}

    /* Directeur responsive */
    .resp-dir{grid-template-columns:1fr!important;gap:48px!important;}
    .dir-blob{max-width:280px;margin:0 auto;}
    .dir-quote-card{right:0;bottom:-10px;max-width:180px;}

    /* Contact */
    .contact-grid{grid-template-columns:1fr;gap:28px;}
    .contact-form-card,.contact-info-card{padding:28px 22px;}

    /* Footer */
    .footer{padding:60px 4% 0;}
    .footer-engage{gap:20px;}
    .footer-grid{grid-template-columns:1fr 1fr;}
    .social-bar{flex-direction:column;gap:16px;padding:20px 4%;}
    .social-links{flex-wrap:wrap;gap:8px;}
    .soc-btn{font-size:12px;padding:9px 14px;}

    /* Video grid */
    .grid-3.video-grid{grid-template-columns:1fr!important;}

    /* Resp generic grid */
    .resp-grid-2{grid-template-columns:1fr!important;gap:32px!important;}
    .resp-grid-half{grid-template-columns:1fr!important;gap:48px!important;}

    /* Domaines alternating */
    .domaine-alt{grid-template-columns:1fr!important;gap:28px!important;}
    .domaine-alt-img{height:240px!important;}

    /* Etudes */
    .etude-avap{height:180px;}

    /* Expertise */
    .expertise-grid{grid-template-columns:1fr 1fr;}

    /* Avis */
    .avis-card{padding:28px 20px;}
    .avis-text{font-size:15px;}

    /* Back top / WA */
    .back-top{bottom:90px;right:16px;}
    .wa-bubble{right:16px;bottom:140px;}
  }
  @media(max-width:480px){
    .section{padding:48px 4%;}
    .section-title{font-size:clamp(20px,6vw,32px);}
    .stats-grid{grid-template-columns:1fr 1fr;gap:10px;}
    .stat-item{padding:28px 16px;}
    .stat-num{font-size:36px;}
    .expertise-grid{grid-template-columns:1fr;}
    .footer-grid{grid-template-columns:1fr;}
    .footer-engage{grid-template-columns:1fr;}
    .hero h1{font-size:clamp(22px,7vw,32px);}
    .hero-badge{font-size:10px;padding:7px 14px;}
    .domaine-card{height:260px;}
    .projet-img,.formation-img{height:180px;}
    .contact-form-card,.contact-info-card{padding:20px 16px;}
    .avis-card{padding:22px 16px;}
    .page-hero{padding:110px 4% 48px;}
    .grid-2{grid-template-columns:1fr;}
    .btn-primary,.btn-outline{font-size:14px;padding:13px 24px;}
  }
  /* ══ FIN RESPONSIVE ═══════════════════════════════════════════════════════ */

  .toast-wrap{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;}
  .toast{padding:14px 20px;border-radius:16px;font-size:14px;color:#fff;display:flex;align-items:center;gap:10px;box-shadow:0 6px 20px rgba(0,0,0,.2);animation:fadeUp .3s ease;}
  .toast.success{background:#1D9E75;}.toast.error{background:#A32D2D;}

  /* PAGE TRANSITION */
  @keyframes pageIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  .page-enter{animation:pageIn .45s cubic-bezier(.22,1,.36,1) both;}

  /* WHATSAPP BUBBLE */
  @keyframes waBounce{0%,100%{transform:translateY(0) scale(1)}40%{transform:translateY(-8px) scale(1.06)}70%{transform:translateY(-3px) scale(1.02)}}
  @keyframes waPing{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
  .wa-bubble{position:fixed;bottom:84px;right:28px;z-index:998;width:54px;height:54px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(37,211,102,.5);cursor:pointer;animation:waBounce 3s ease-in-out 2s infinite;transition:transform .2s;}
  .wa-bubble:hover{transform:scale(1.12)!important;animation:none;}
  .wa-bubble-ping{position:absolute;inset:0;border-radius:50%;background:#25D366;animation:waPing 2s ease-out 1.5s infinite;}
  .wa-bubble svg{position:relative;z-index:1;}
  .wa-label{position:absolute;right:62px;top:50%;transform:translateY(-50%);background:#fff;color:#075E54;font-size:12px;font-weight:700;padding:6px 12px;border-radius:99px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.12);opacity:0;pointer-events:none;transition:opacity .25s;}
  .wa-bubble:hover .wa-label{opacity:1;}

  /* CURSOR SPOTLIGHT */
  .cursor-light{pointer-events:none;position:fixed;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.06) 0%,transparent 65%);transform:translate(-50%,-50%);z-index:0;transition:left .15s ease,top .15s ease;}

  /* TILT CARD */
  .tilt-card{transform-style:preserve-3d;transition:transform .1s ease;}

  /* TYPING CURSOR */
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  .type-cursor{display:inline-block;width:3px;height:.9em;background:#60A5FA;border-radius:2px;margin-left:4px;vertical-align:middle;animation:blink .8s step-end infinite;}

  /* GRADIENT ANIMATED TEXT */
  @keyframes gradMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .grad-anim{background:linear-gradient(270deg,#60A5FA,#2563EB,#7C3AED,#60A5FA);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradMove 4s ease infinite;}

  /* SECTION DIVIDER WAVE */
  .wave-divider{height:60px;overflow:hidden;line-height:0;}
  .wave-divider svg{display:block;width:100%;height:100%;}

  /* GLOW BUTTON */
  .btn-glow{position:relative;}
  .btn-glow::before{content:'';position:absolute;inset:-2px;border-radius:99px;background:linear-gradient(135deg,#2563EB,#7C3AED,#60A5FA);opacity:0;filter:blur(8px);transition:opacity .3s;z-index:-1;}
  .btn-glow:hover::before{opacity:.7;}
`;

// ── TYPING HOOK ──────────────────────────────────────────────────────────────
function useTyping(words, speed=90, pause=1800) {
  const [idx,setIdx]=useState(0);const [txt,setTxt]=useState("");const [del,setDel]=useState(false);
  useEffect(()=>{
    const word=words[idx];
    if(!del && txt===word){ const t=setTimeout(()=>setDel(true),pause); return()=>clearTimeout(t); }
    if(del && txt===""){ setDel(false); setIdx(i=>(i+1)%words.length); return; }
    const t=setTimeout(()=>{ setTxt(del?txt.slice(0,-1):word.slice(0,txt.length+1)); },del?speed/2:speed);
    return()=>clearTimeout(t);
  },[txt,del,idx,words,speed,pause]);
  return txt;
}

// ── HERO PARTICLES ────────────────────────────────────────────────────────────
function HeroParticles() {
  const canvasRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext("2d");
    let w=canvas.width=canvas.offsetWidth, h=canvas.height=canvas.offsetHeight;
    const pts=Array.from({length:55},()=>({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35,
      r:Math.random()*2+.8, a:Math.random()
    }));
    let raf;
    const draw=()=>{
      ctx.clearRect(0,0,w,h);
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=w; if(p.x>w)p.x=0;
        if(p.y<0)p.y=h; if(p.y>h)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(96,165,250,${p.a*0.5})`; ctx.fill();
      });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const dx=a.x-b.x, dy=a.y-b.y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<110){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(96,165,250,${(1-d/110)*0.12})`; ctx.lineWidth=1; ctx.stroke(); }
      }));
      raf=requestAnimationFrame(draw);
    };
    draw();
    const resize=()=>{ w=canvas.width=canvas.offsetWidth; h=canvas.height=canvas.offsetHeight; };
    window.addEventListener("resize",resize);
    return()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:1,pointerEvents:"none"}}/>;
}

// ── 3D TILT ──────────────────────────────────────────────────────────────────
function useTilt(strength=12) {
  const ref=useRef(null);
  const onMove=useCallback(e=>{
    const el=ref.current; if(!el)return;
    const {left,top,width,height}=el.getBoundingClientRect();
    const x=((e.clientX-left)/width-.5)*strength;
    const y=-((e.clientY-top)/height-.5)*strength;
    el.style.transform=`perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-6px) scale(1.02)`;
    el.style.boxShadow=`${-x*.8}px ${y*.8}px 40px rgba(37,99,235,.18)`;
  },[strength]);
  const onLeave=useCallback(()=>{
    const el=ref.current; if(!el)return;
    el.style.transform=""; el.style.boxShadow="";
  },[]);
  return {ref,onMouseMove:onMove,onMouseLeave:onLeave};
}

// ── CURSOR SPOTLIGHT ─────────────────────────────────────────────────────────
function CursorLight() {
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current; if(!el)return;
    const move=e=>{ el.style.left=e.clientX+"px"; el.style.top=e.clientY+"px"; };
    window.addEventListener("mousemove",move);
    return()=>window.removeEventListener("mousemove",move);
  },[]);
  return <div ref={ref} className="cursor-light"/>;
}

// ── WHATSAPP BUBBLE ──────────────────────────────────────────────────────────
function WaBubble() {
  return (
    <a href="https://wa.me/22901425454954" target="_blank" rel="noreferrer" className="wa-bubble" aria-label="WhatsApp">
      <div className="wa-bubble-ping"/>
      <span className="wa-label">Discutons !</span>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
  );
}

// ── UI ────────────────────────────────────────────────────────────────────────
const Spinner = () => <div className="spinner"/>;
const Empty   = ({msg="Aucun élément."}) => <div className="empty"><div style={{marginBottom:12,display:"flex",justifyContent:"center"}}><Briefcase size={48} color="var(--gray)" strokeWidth={1}/></div><p>{msg}</p></div>;
const Toast   = ({toasts}) => <div className="toast-wrap">{toasts.map(t=><div key={t.id} className={`toast ${t.type}`}>{t.type==="success"?<CheckCircle size={16}/>:<AlertCircle size={16}/>} {t.msg}</div>)}</div>;

function Reveal({children,cls="reveal",delay=0,style={}}) {
  const {ref,visible}=useReveal();
  return <div ref={ref} className={`${cls}${visible?" visible":""}`} style={{transitionDelay:`${delay}s`,...style}}>{children}</div>;
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────
function Navbar({page,navigate}) {
  const [scrolled,setScrolled]=useState(false);const [open,setOpen]=useState(false);
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>40);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  const go=p=>{navigate(p);setOpen(false);window.scrollTo(0,0);};
  const links=[{id:"accueil",l:"Accueil"},{id:"qui-sommes-nous",l:"À propos"},{id:"domaines",l:"Domaines"},{id:"projets",l:"Projets"},{id:"formations",l:"Formations"},{id:"etudes",l:"Réalisations"},{id:"partenaires",l:"Partenaires"}];
  return (
    <>
      <nav className={`navbar${scrolled||page!=="accueil"?" scrolled":""}`}>
        <div className="nav-logo" onClick={()=>go("accueil")} style={{cursor:"pointer",display:"flex",flexDirection:"column"}}><img src="/logo.jpeg" alt="Africa Ingénierie"/></div>
        <div className="nav-links">{links.map(l=><a key={l.id} onClick={()=>go(l.id)} className={page===l.id?"active":""}>{l.l}</a>)}<a onClick={()=>go("contact")} className="nav-cta">Contact</a></div>
        <button className="burger" onClick={()=>setOpen(v=>!v)}><span/><span/><span/></button>
      </nav>
      <div className={`nav-mobile${open?" open":""}`}>
        <button className="nav-close" onClick={()=>setOpen(false)}>✕</button>
        {links.map(l=><a key={l.id} onClick={()=>go(l.id)}>{l.l}</a>)}
        <a onClick={()=>go("contact")} className="nav-cta">Contact</a>
      </div>
    </>
  );
}

// ── MARQUEE ───────────────────────────────────────────────────────────────────
function Marquee({items}) {
  const d=[...items,...items];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {d.map((it,i)=><div key={i} className="marquee-item"><span className="marquee-dot"/>{it}</div>)}
      </div>
    </div>
  );
}

// ── STATS ANIMÉES ─────────────────────────────────────────────────────────────
function Stats({total}) {
  const {ref,visible}=useReveal(0.2);
  const p=useCounter(total||50,1500,visible),a=useCounter(20,1200,visible),d=useCounter(6,1000,visible),c=useCounter(100,1800,visible);
  return (
    <div ref={ref} className="stats-grid">
      {[{n:p,s:"+",l:"Projets lancés"},{n:a,s:"+",l:"Ans d'expérience"},{n:d,s:"+",l:"Pays couverts"},{n:c,s:"%",l:"Gain de productivité"}].map((s,i)=>(
        <div key={i} className="stat-item">
          <div className="stat-num">{s.n}<span className="stat-sfx">{s.s}</span></div>
          <div className="stat-label">{s.l}</div>
        </div>
      ))}
    </div>
  );
}

// ── SLIDER AVIS ───────────────────────────────────────────────────────────────
function AvisSlider({avis}) {
  const [idx,setIdx]=useState(0);
  useEffect(()=>{if(!avis.length)return;const t=setInterval(()=>setIdx(i=>(i+1)%avis.length),5000);return()=>clearInterval(t);},[avis.length]);
  if(!avis.length)return null;
  const a=avis[idx];
  return (
    <div>
      <div className="avis-card" key={idx} style={{animation:"fadeUp .4s ease"}}>
        <div className="avis-stars">{"★".repeat(a.note||5)}{"☆".repeat(5-(a.note||5))}</div>
        <p className="avis-text">"{a.message}"</p>
        <div className="avis-author">
          <div className="avis-avatar">{(a.nom||"?")[0].toUpperCase()}</div>
          <div><div style={{fontWeight:700,fontSize:15}}>{a.nom}</div><div style={{fontSize:12,color:"var(--gray)",marginTop:2}}>{fmtDate(a.createdAt)}</div></div>
        </div>
      </div>
      <div className="avis-dots">{avis.map((_,i)=><div key={i} className={`avis-dot${i===idx?" active":""}`} onClick={()=>setIdx(i)}/>)}</div>
    </div>
  );
}

// ── PAGE ACCUEIL ──────────────────────────────────────────────────────────────
function ExpertiseCard({color, domain:d, navigate}) {
  const tilt = useTilt(10);
  return (
    <div className="expertise-card" onClick={()=>navigate("domaines")} {...tilt}>
      <div className="exp-icon" style={{background:`${color}18`}}>
        <Wrench size={22} color={color} strokeWidth={2}/>
      </div>
      <div><div className="exp-title">{d.name}</div><div className="exp-desc">{d.description}</div></div>
      <div className="exp-link" style={{color}}>En savoir plus <ChevronRight size={14}/></div>
    </div>
  );
}

function VideoCard({video:v}) {
  const [playing,setPlaying] = useState(false);
  const ytId = v.url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([^&\n?#]+)/)?.[1];
  const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}?rel=0` : v.url;
  return (
    <div className="video-card">
      <div className="video-thumb">
        {playing ? (
          <iframe src={embedUrl+"&autoplay=1"} allowFullScreen allow="autoplay" title={v.titre}/>
        ) : (
          <>
            {ytId && <img src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} alt={v.titre} style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>}
            <div className="video-thumb-cover" onClick={()=>setPlaying(true)}>
              <div className="video-play-btn">
                <div style={{width:0,height:0,borderTop:"10px solid transparent",borderBottom:"10px solid transparent",borderLeft:"18px solid #1e293b",marginLeft:4}}/>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="video-body">
        {v.categorie&&<div className="video-cat">{v.categorie}</div>}
        <div className="video-title">{v.titre}</div>
        {v.description&&<div className="video-desc">{v.description}</div>}
      </div>
    </div>
  );
}

function PageAccueil({navigate}) {
  const typedWord = useTyping(["développement africain","performance industrielle","innovation locale","excellence opérationnelle"]);
  const {data:domaines}  =useApi("/domaines");
  const {data:projets}   =useApi("/projects");
  const {data:avis}      =useApi("/avis");
  const {data:directeur} =useApi("/directeur");
  const {data:etudes}    =useApi("/etudes");
  const {data:actus}     =useApi("/formations-avenir");
  const {data:videos}    =useApi("/videos");

  const domainesActifs=Array.isArray(domaines)?domaines.filter(d=>d.actif!==false):[];
  const projetsActifs =Array.isArray(projets) ?projets.filter(p=>p.actif!==false).slice(0,3):[];
  const avisPublies   =Array.isArray(avis)    ?avis.filter(a=>a.statut==="publie"):[];
  const etudesSlice   =Array.isArray(etudes)  ?etudes.slice(0,2):[];

  const MARQUEE=["Maintenance industrielle","Installation & Mise en service","Formation en optimisation","Fourniture d'équipements","Soudure & Chaudronnerie","Énergie, Domotique & Sécurité","Diagnostic industriel","Expertise africaine"];
  const FALLBACK=[
    {id:1,name:"Formation en optimisation",description:"Formations techniques pour améliorer vos performances en égrenage, huilerie et maintenance.",color:"#2563EB"},
    {id:2,name:"Installation & Mise en service",description:"Installation complète et mise en service d'usines, d'équipements et de systèmes techniques.",color:"#1D9E75"},
    {id:3,name:"Maintenance industrielle",description:"Maintenance préventive, corrective et conditionnelle pour garantir la fiabilité de vos installations.",color:"#378ADD"},
    {id:4,name:"Fourniture d'équipements",description:"Équipements industriels certifiés avec accompagnement et conseils personnalisés.",color:"#60A5FA"},
    {id:5,name:"Soudure & Chaudronnerie",description:"Fabrication, réparation et assemblage de structures métalliques sur mesure.",color:"#7F77DD"},
    {id:6,name:"Énergie, Domotique & Sécurité",description:"Solutions modernes pour l'énergie, l'automatisation des bâtiments et la sécurité incendie.",color:"#D4537E"},
  ];
  const COLORS=["#2563EB","#1D9E75","#378ADD","#60A5FA","#7F77DD","#D4537E"];
  const display=domainesActifs.length>0?domainesActifs:FALLBACK;

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"/><div className="hero-grid"/>
        <div className="hero-content" style={{zIndex:2}}>
          <div className="hero-badge"><span className="hero-dot"/>Excellence industrielle — Afrique de l'Ouest</div>
          <span className="hero-line"/>
          <h1>L'Excellence industrielle,<br/>au service du <em className="grad-anim">développement africain</em></h1>
          <p>Des solutions d'ingénierie industrielle accessibles, fiables et performantes pour optimiser vos unités de production, grâce à des techniques avancées de maintenance, de transformation du coton et d'huilerie, portées par l'innovation, l'expertise locale et les standards internationaux.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={()=>navigate("domaines")}>Nos domaines</button>
            <button className="btn-primary" onClick={()=>navigate("contact")} style={{background:"linear-gradient(135deg,#1D4ED8,#1e40af)"}}>Nous contacter</button>
          </div>
        </div>
        <div className="hero-stats">
          {[{n:`${projets?.length||"50"}+`,l:"Projets réalisés"},{n:"20+",l:"Ans d'expertise"},{n:`${domainesActifs.length||6}`,l:"Domaines"}].map((s,i)=>(
            <div key={i} className="hero-stat"><div className="hero-stat-num">{s.n}</div><div className="hero-stat-label">{s.l}</div></div>
          ))}
        </div>
        <div className="hero-scroll"><div className="hero-scroll-line"/>Défiler</div>
      </section>

      <Marquee items={MARQUEE}/>

      {/* DOMAINES */}
      <section className="section">
        <Reveal><div style={{textAlign:"center",marginBottom:52}}>
          <div className="section-tag" style={{justifyContent:"center"}}>Nos expertises</div>
          <h2 className="section-title">Nos domaines <em>d'expertise</em></h2>
          <p style={{fontSize:16,color:"var(--gray)",maxWidth:560,margin:"12px auto 0",lineHeight:1.7}}>Des solutions techniques fiables et innovantes pour optimiser vos opérations industrielles.</p>
        </div></Reveal>

        {domainesActifs.filter(d=>d.imageUrl).length>=3 && (
          <div className="grid-3" style={{marginBottom:28}}>
            {domainesActifs.filter(d=>d.imageUrl).slice(0,6).map((d,i)=>(
              <Reveal key={d.id} delay={i*0.08}>
                <div className="domaine-card" onClick={()=>navigate("domaines")}>
                  <div className="domaine-card-img"><img src={imgSrc(d.imageUrl)} alt={d.name}/></div>
                  <div className="domaine-overlay"/>
                  <div className="domaine-num">0{i+1}</div>
                  <div className="domaine-body">
                    <div className="domaine-tag">Expertise</div>
                    <div className="domaine-title">{d.name}</div>
                    <div className="domaine-desc">{d.description}</div>
                    <div className="domaine-arrow">Découvrir <ChevronRight size={13}/></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <div className="expertise-grid">
          {display.map((d,i)=>{
            const color=d.color||COLORS[i%COLORS.length];
            return (
              <Reveal key={d.id} delay={i*0.07}>
                <ExpertiseCard color={color} domain={d} navigate={navigate}/>
              </Reveal>
            );
          })}
        </div>
        <Reveal style={{textAlign:"center",marginTop:44}}><button className="btn-primary" onClick={()=>navigate("domaines")}>Découvrir tous nos domaines </button></Reveal>
      </section>

      {/* STATS */}
      <section className="section section-cream">
        <Reveal style={{textAlign:"center",marginBottom:48}}>
          <div className="section-tag" style={{justifyContent:"center"}}>En chiffres</div>
          <h2 className="section-title">Notre impact <em>en chiffres</em></h2>
        </Reveal>
        <Stats total={projets?.length}/>
      </section>

      {/* DIRECTEUR */}
      {directeur && (
        <section className="section">
          <div className="resp-dir" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}>
            <Reveal cls="reveal-left" style={{display:"flex",justifyContent:"center"}}>
              <div className="dir-blob">
                <div className="dir-blob-shape">
                  {directeur.imageUrl?<img src={imgSrc(directeur.imageUrl)} alt={directeur.nom}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:80,fontWeight:900,color:"rgba(255,255,255,.3)",fontFamily:"Playfair Display"}}>{(directeur.nom||"D")[0]}</div>}
                </div>
                <div className="dir-blob-border"/>
                {directeur.presentation&&<div className="dir-quote-card"><div className="dir-quote-text">"{directeur.presentation.slice(0,100)}…"</div><div className="dir-quote-name">{directeur.nom}</div></div>}
              </div>
            </Reveal>
            <Reveal cls="reveal-right">
              <div className="section-tag">Leadership</div>
              <h2 className="section-title" style={{marginBottom:8}}>{directeur.nom}</h2>
              <p style={{color:"var(--orange)",fontWeight:600,fontSize:16,marginBottom:20}}>{directeur.titre}</p>
              <div className="divider"/>
              <p style={{fontSize:15.5,lineHeight:1.9,color:"#555",whiteSpace:"pre-wrap"}}>{directeur.presentation}</p>
            </Reveal>
          </div>
        </section>
      )}

      {/* PROJETS */}
      <section className="section section-cream">
        <Reveal><div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:48}}>
          <div><div className="section-tag">Portfolio</div><h2 className="section-title">Projets <em>récents</em></h2></div>
          <button className="btn-dark" onClick={()=>navigate("projets")}>Voir tout </button>
        </div></Reveal>
        <div className="grid-3">
          {projetsActifs.length===0?[1,2,3].map(i=>(<Reveal key={i} delay={i*0.1}><div className="projet-card"><div className="projet-img"><div className="projet-placeholder"/></div><div className="projet-body"><div className="projet-title">Projet en cours…</div></div></div></Reveal>))
            :projetsActifs.map((p,i)=>(
              <Reveal key={p.id} delay={i*0.1}>
                <div className="projet-card">
                  <div className="projet-img">{p.imageUrl?<img src={imgSrc(p.imageUrl)} alt={p.title}/>:<div className="projet-placeholder"/>}{p.date&&<div className="projet-tag">{fmtDate(p.date)}</div>}</div>
                  <div className="projet-body"><div className="projet-title">{p.title}</div><div className="projet-desc">{p.description}</div></div>
                </div>
              </Reveal>
            ))
          }
        </div>
      </section>

      {/* ÉTUDES */}
      {etudesSlice.length>0&&(
        <section className="section">
          <Reveal><div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:48}}>
            <div><div className="section-tag">Avant / Après</div><h2 className="section-title">Nos <em>réalisations</em></h2></div>
            <button className="btn-dark" onClick={()=>navigate("etudes")}>Voir tout </button>
          </div></Reveal>
          <div className="grid-2">
            {etudesSlice.map((e,i)=>(
              <Reveal key={e.id} delay={i*0.1}>
                <div className="etude-card">
                  <div className="etude-avap">
                    <div className="etude-side">{e.imageAvant?<img src={imgSrc(e.imageAvant)} alt="Avant"/>:<div style={{height:"100%",background:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>📸</div>}<div className="etude-lbl" style={{background:"rgba(0,0,0,.6)",color:"#fff"}}>Avant</div></div>
                    <div className="etude-side">{e.imageApres?<img src={imgSrc(e.imageApres)} alt="Après"/>:<div style={{height:"100%",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>✨</div>}<div className="etude-lbl" style={{background:"rgba(37,99,235,.9)",color:"#fff"}}>Après</div></div>
                  </div>
                  <div className="etude-body">
                    <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                      {e.categorie&&<span className="etude-chip" style={{background:"#eff6ff",color:"var(--orange)"}}>{e.categorie}</span>}
                      {e.client&&<span className="etude-chip" style={{background:"var(--cream)",color:"var(--gray)"}}>{e.client}</span>}
                    </div>
                    <div style={{fontWeight:700,fontSize:17,marginBottom:8}}>{e.titre}</div>
                    <div style={{fontSize:13.5,color:"var(--gray)",lineHeight:1.65}}>{(e.description||"").slice(0,110)}{(e.description?.length||0)>110?"…":""}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* AVIS */}
      <section className="section section-dark">
        <Reveal><div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:52}}>
          <div>
            <div className="section-tag" style={{color:"var(--orange)"}}>Témoignages</div>
            <h2 className="section-title" style={{color:"#fff"}}>La parole à <em>nos clients</em></h2>
            <p style={{fontSize:15,color:"rgba(255,255,255,.5)",marginTop:8,maxWidth:580,lineHeight:1.75}}>La satisfaction de nos clients est au cœur de notre démarche. À travers leurs retours, découvrez comment nos solutions techniques, nos interventions sur le terrain et notre approche d'ingénierie ont réellement amélioré la performance de leurs installations.</p>
          </div>
        </div></Reveal>
        {avisPublies.length>0?<AvisSlider avis={avisPublies}/>:(
          <div style={{textAlign:"center",padding:"20px 0 40px"}}>
            <p style={{color:"rgba(255,255,255,.3)",fontSize:15,marginBottom:24}}>Soyez le premier à partager votre expérience !</p>
            <button className="btn-primary" onClick={()=>navigate("avis")}>Laisser votre avis </button>
          </div>
        )}
      </section>

      {/* ACTUALITÉS */}
      <section className="section section-cream">
        <Reveal><div style={{textAlign:"center",marginBottom:52}}>
          <div className="section-tag" style={{justifyContent:"center"}}>Actualités</div>
          <h2 className="section-title">Actualités & <em>Formations à venir</em></h2>
          <p style={{fontSize:16,color:"var(--gray)",maxWidth:560,margin:"12px auto 0",lineHeight:1.75}}>Restez informé des dernières innovations, des projets en cours et des opportunités de formation proposées par notre équipe.</p>
        </div></Reveal>
        {(() => {
          const ACTU_FALLBACK = [
            {id:"f1",titre:"Lancement du Programme de Formation en Gestion de Projets Industriels",date:"2025-10-20",texte:"Un programme complet destiné aux ingénieurs et techniciens souhaitant maîtriser la gestion de projets industriels complexes."},
            {id:"f2",titre:"Africa Ingénierie accompagne un nouveau projet d'infrastructure énergétique",date:"2025-09-18",texte:"Notre équipe intervient sur un projet d'envergure régionale pour l'installation et la mise en service d'infrastructures énergétiques durables."},
            {id:"f3",titre:"Atelier pratique : Introduction aux outils numériques pour l'ingénierie",date:"2025-01-15",texte:"Un atelier interactif pour découvrir comment les outils numériques transforment les pratiques d'ingénierie industrielle en Afrique."},
          ];
          const items = Array.isArray(actus) && actus.filter(a=>a.statut!=="inactif").length > 0
            ? actus.filter(a=>a.statut!=="inactif").slice(0,3)
            : ACTU_FALLBACK;
          return (
            <div className="grid-3">
              {items.map((a,i)=>(
                <Reveal key={a.id} delay={i*0.1}>
                  <div style={{background:"#fff",border:"1.5px solid var(--border)",borderRadius:28,overflow:"hidden",boxShadow:"var(--shadow-sm)",transition:"all .35s cubic-bezier(.34,1.56,.64,1)",display:"flex",flexDirection:"column",height:"100%"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-8px)";e.currentTarget.style.boxShadow="0 24px 56px rgba(37,99,235,.14)";e.currentTarget.style.borderColor="rgba(37,99,235,.25)";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="var(--shadow-sm)";e.currentTarget.style.borderColor="var(--border)";}}>
                    {a.imageUrl && <div style={{height:180,overflow:"hidden"}}><img src={imgSrc(a.imageUrl)} alt={a.titre} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .6s ease"}}/></div>}
                    <div style={{padding:"24px",flex:1,display:"flex",flexDirection:"column",gap:10}}>
                      {a.date&&<div style={{fontSize:11,fontWeight:700,color:"var(--orange)",letterSpacing:".08em",textTransform:"uppercase"}}>{fmtDate(a.date)}</div>}
                      <div style={{fontSize:16.5,fontWeight:800,lineHeight:1.3,color:"#1e293b"}}>{a.titre}</div>
                      {a.texte&&<div style={{fontSize:13.5,color:"#64748b",lineHeight:1.7,flex:1}}>{(a.texte||"").slice(0,120)}{(a.texte?.length||0)>120?"…":""}</div>}
                      {a.videoUrl&&<a href={a.videoUrl} target="_blank" rel="noreferrer" style={{fontSize:13,fontWeight:700,color:"var(--orange)",marginTop:"auto",display:"inline-flex",alignItems:"center",gap:5}}>Voir la vidéo</a>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          );
        })()}
      </section>

      {/* VIDÉOS */}
      {Array.isArray(videos) && videos.filter(v=>v.actif!==false).length>0 && (
        <section className="section section-dark">
          <Reveal><div style={{textAlign:"center",marginBottom:52}}>
            <div className="section-tag" style={{color:"var(--gold)",justifyContent:"center"}}>Médiathèque</div>
            <h2 className="section-title" style={{color:"#fff"}}>Vidéos <em style={{color:"var(--gold)"}}>remarquables</em></h2>
            <p style={{fontSize:16,color:"rgba(255,255,255,.5)",maxWidth:520,margin:"12px auto 0",lineHeight:1.75}}>Découvrez nos interventions, formations et réalisations à travers nos vidéos de terrain.</p>
          </div></Reveal>
          <div className="grid-3">
            {videos.filter(v=>v.actif!==false).sort((a,b)=>(a.ordre||0)-(b.ordre||0)).map((v,i)=>(
              <Reveal key={v.id} delay={i*0.1}><VideoCard video={v}/></Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{padding:"80px 5%",background:"linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:.06,backgroundImage:"radial-gradient(circle,#fff 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
        <Reveal style={{textAlign:"center",position:"relative",zIndex:1}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(255,255,255,.6)",marginBottom:12}}>Prêt à collaborer ?</div>
          <h2 style={{fontFamily:"Playfair Display",fontSize:"clamp(26px,4vw,48px)",fontWeight:900,color:"#fff",marginBottom:16,lineHeight:1.15}}>L'excellence industrielle n'est qu'un clic plus loin !</h2>
          <p style={{fontSize:16,color:"rgba(255,255,255,.7)",marginBottom:36,maxWidth:560,margin:"0 auto 36px"}}>Pour booster votre performance industrielle et vous rapprocher de l'excellence qu'incarne Africa Ingénierie, choisissez l'ingénierie de précision et l'innovation locale.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>navigate("contact")} style={{padding:"14px 32px",background:"#fff",color:"var(--orange)",borderRadius:99,fontSize:15,fontWeight:700,border:"none",cursor:"pointer",transition:"transform .2s,box-shadow .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 30px rgba(0,0,0,.2)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>Contactez-nous </button>
            <a href="https://wa.me/22901425454954" target="_blank" rel="noreferrer" style={{padding:"14px 32px",background:"rgba(255,255,255,.15)",color:"#fff",borderRadius:99,fontSize:15,fontWeight:600,border:"1.5px solid rgba(255,255,255,.3)",display:"inline-flex",alignItems:"center",gap:8}}>WhatsApp</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}

// ── SKILL BAR ─────────────────────────────────────────────────────────────────
function SkillBar({label, pct, delay=0}) {
  const {ref,visible} = useReveal(0.1);
  return (
    <div ref={ref} className="skill-item">
      <div className="skill-header">
        <span>{label}</span>
        <span className="skill-pct">{pct}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{transitionDelay:`${delay}s`,transform:visible?"scaleX(1)":"scaleX(0)"}}/>
      </div>
    </div>
  );
}

// ── PAGE QUI SOMMES-NOUS ──────────────────────────────────────────────────────
function PageQuiSommesNous() {
  const {data,loading}=useApi("/qui-sommes-nous");
  const {data:directeur}=useApi("/directeur");
  return (
    <>
      <div className="page-hero"><div className="page-hero-bg"/><div className="page-hero-grid"/><div className="page-hero-glow"/>
        <div className="page-hero-content">
          <div className="section-tag" style={{color:"var(--orange)"}}>À propos</div>
          <h1>Qui sommes-<em style={{color:"var(--orange)",fontStyle:"normal"}}>nous</em> ?</h1>
          <p>Africa Ingénierie, votre partenaire d'excellence pour l'industrie africaine.</p>
        </div>
      </div>
      <section className="section">
        {loading?<Spinner/>:(
          <div style={{maxWidth:820,margin:"0 auto"}}>
            <p style={{fontSize:17,lineHeight:1.9,color:"#444",marginBottom:48,whiteSpace:"pre-wrap"}}>{data?.texte||"Africa Ingénierie est une entreprise spécialisée dans l'accompagnement des industries africaines. Depuis notre création, nous mettons notre expertise au service de la performance industrielle, en offrant des solutions adaptées aux réalités du continent africain. Notre équipe d'ingénieurs qualifiés intervient dans la maintenance, l'installation, la formation et le conseil pour vous aider à atteindre vos objectifs industriels."}</p>
            {data?.videoUrl&&<div style={{borderRadius:20,overflow:"hidden",aspectRatio:"16/9",background:"#000",marginBottom:60}}><iframe src={data.videoUrl} style={{width:"100%",height:"100%",border:"none"}} title="Présentation" allowFullScreen/></div>}
          </div>
        )}
      </section>

      <section className="section section-cream">
        <Reveal style={{textAlign:"center",marginBottom:52}}><div className="section-tag" style={{justifyContent:"center"}}>Notre identité</div><h2 className="section-title">Vision & <em>Positionnement</em></h2></Reveal>
        <div className="grid-2" style={{gap:32,maxWidth:960,margin:"0 auto"}}>
          <Reveal cls="reveal-left">
            <div style={{background:"#fff",borderRadius:24,padding:40,border:"1px solid var(--border)",height:"100%"}}>
              <div style={{width:52,height:52,borderRadius:16,background:"linear-gradient(135deg,#2563EB,#60A5FA)",marginBottom:20}}/>
              <div className="section-tag">Notre Vision</div>
              <h3 style={{fontFamily:"Playfair Display",fontSize:22,fontWeight:800,marginBottom:14,lineHeight:1.3}}>Faire de l'ingénierie africaine une référence mondiale</h3>
              <div className="divider"/>
              {[{l:"Performance",d:"Optimisation continue des processus industriels"},{l:"Fiabilité",d:"Solutions durables maintenues à l'excellence"},{l:"Impact économique durable",d:"Contribution au développement de l'industrie africaine"}].map((it,k)=>(
                <div key={k} style={{display:"flex",gap:14,marginBottom:14}}>
                  <div style={{width:34,height:34,borderRadius:10,background:"#eff6ff",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:12,height:12,borderRadius:"50%",background:"#2563EB"}}/></div>
                  <div><div style={{fontWeight:700,fontSize:14,marginBottom:2}}>{it.l}</div><div style={{fontSize:13,color:"var(--gray)",lineHeight:1.5}}>{it.d}</div></div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal cls="reveal-right">
            <div style={{background:"var(--dark)",borderRadius:24,padding:40,height:"100%"}}>
              <div style={{width:52,height:52,borderRadius:16,background:"rgba(37,99,235,.2)",border:"1px solid rgba(37,99,235,.3)",marginBottom:20}}/>
              <div className="section-tag">Notre Positionnement</div>
              <h3 style={{fontFamily:"Playfair Display",fontSize:22,fontWeight:800,marginBottom:14,lineHeight:1.3,color:"#fff"}}>Nous combinons excellence et innovation</h3>
              <div style={{width:60,height:3,background:"linear-gradient(90deg,var(--orange),var(--gold))",borderRadius:2,margin:"18px 0"}}/>
              {[{l:"Ingénierie de haut niveau",d:"Expertise technique pointue"},{l:"Innovation technologique",d:"Solutions adaptées aux réalités africaines"},{l:"Excellence opérationnelle",d:"Standards internationaux appliqués localement"}].map((it,k)=>(
                <div key={k} style={{display:"flex",gap:14,marginBottom:14}}>
                  <div style={{width:34,height:34,borderRadius:10,background:"rgba(37,99,235,.15)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:12,height:12,borderRadius:"50%",background:"#60A5FA"}}/></div>
                  <div><div style={{fontWeight:700,fontSize:14,marginBottom:2,color:"#fff"}}>{it.l}</div><div style={{fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.5}}>{it.d}</div></div>
                </div>
              ))}
              <div style={{marginTop:20,padding:"14px 18px",background:"rgba(37,99,235,.1)",border:"1px solid rgba(37,99,235,.2)",borderRadius:12}}>
                <p style={{fontSize:13.5,color:"rgba(255,255,255,.75)",lineHeight:1.6}}>📣 Pour devenir un <strong style={{color:"var(--orange)"}}>acteur clé du développement durable</strong> en Afrique.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <Reveal style={{textAlign:"center",marginBottom:48}}><div className="section-tag" style={{justifyContent:"center"}}>Ce qui nous guide</div><h2 className="section-title">Nos <em>valeurs</em></h2></Reveal>
        <div className="grid-4">
          {[{l:"Excellence",d:"Nous visons la perfection dans chaque intervention.",c:"#2563EB"},{l:"Intégrité",d:"Transparence et honnêteté dans toutes nos relations.",c:"#1D9E75"},{l:"Engagement africain",d:"Fiers de contribuer au développement du continent.",c:"#7C3AED"},{l:"Innovation",d:"Nous adoptons les meilleures technologies pour vous.",c:"#F59E0B"}].map((v,k)=>(
            <Reveal key={k} delay={k*0.1}>
              <div style={{textAlign:"center",padding:"32px 20px",background:"var(--light)",borderRadius:20,border:"1px solid var(--border)",height:"100%",transition:"all .3s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:`${v.c}18`,border:`2px solid ${v.c}55`,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:18,height:18,borderRadius:"50%",background:v.c}}/></div>
                <div style={{fontWeight:800,fontSize:16,marginBottom:10}}>{v.l}</div>
                <div style={{fontSize:13.5,color:"var(--gray)",lineHeight:1.65}}>{v.d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COMPÉTENCES */}
      <section className="section section-cream">
        <Reveal style={{textAlign:"center",marginBottom:52}}>
          <div className="section-tag" style={{justifyContent:"center"}}>Notre expertise</div>
          <h2 className="section-title">Nos <em>compétences clés</em></h2>
        </Reveal>
        <div className="grid-2 resp-grid-half" style={{gap:60,maxWidth:960,margin:"0 auto",alignItems:"center"}}>
          <Reveal cls="reveal-left">
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {[
                {label:"Maintenance industrielle",pct:95},
                {label:"Installation & Mise en service",pct:92},
                {label:"Formation technique",pct:88},
                {label:"Diagnostic & Audit industriel",pct:90},
                {label:"Soudure & Chaudronnerie",pct:85},
              ].map((s,i)=>(
                <SkillBar key={i} label={s.label} pct={s.pct} delay={i*0.12}/>
              ))}
            </div>
          </Reveal>
          <Reveal cls="reveal-right">
            <div style={{position:"relative",padding:40,background:"var(--dark)",borderRadius:24,overflow:"hidden"}}>
              <div style={{position:"absolute",top:-30,right:-30,width:150,height:150,borderRadius:"50%",background:"rgba(37,99,235,.1)"}}/>
              <div style={{position:"absolute",bottom:-20,left:-20,width:100,height:100,borderRadius:"50%",background:"rgba(96,165,250,.08)"}}/>
              {[
                {l:"Interventions rapides",d:"Délais maîtrisés sur tous nos chantiers"},
                {l:"Garantie qualité",d:"Chaque intervention est certifiée et documentée"},
                {l:"Présence régionale",d:"Nous intervenons dans toute l'Afrique de l'Ouest"},
                {l:"Reporting complet",d:"Rapports détaillés après chaque intervention"},
              ].map((it,i)=>(
                <div key={i} style={{display:"flex",gap:14,marginBottom:i<3?20:0}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"rgba(37,99,235,.15)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:14,height:14,borderRadius:"50%",background:"#60A5FA"}}/></div>
                  <div><div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:3}}>{it.l}</div><div style={{fontSize:12.5,color:"rgba(255,255,255,.45)",lineHeight:1.5}}>{it.d}</div></div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {directeur&&(
        <section className="section section-cream">
          <Reveal style={{textAlign:"center",marginBottom:52}}><div className="section-tag" style={{justifyContent:"center"}}>Leadership</div><h2 className="section-title">Le mot du <em>directeur</em></h2></Reveal>
          <div className="resp-dir" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center",maxWidth:960,margin:"0 auto"}}>
            <Reveal cls="reveal-left" style={{display:"flex",justifyContent:"center"}}>
              <div className="dir-blob">
                <div className="dir-blob-shape">{directeur.imageUrl?<img src={imgSrc(directeur.imageUrl)} alt={directeur.nom}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:80,fontWeight:900,color:"rgba(255,255,255,.4)",fontFamily:"Playfair Display"}}>{(directeur.nom||"D")[0]}</div>}</div>
                <div className="dir-blob-border"/>
              </div>
            </Reveal>
            <Reveal cls="reveal-right">
              <h3 style={{fontFamily:"Playfair Display",fontSize:32,fontWeight:900,marginBottom:6}}>{directeur.nom}</h3>
              <p style={{color:"var(--orange)",fontWeight:600,fontSize:16,marginBottom:20}}>{directeur.titre}</p>
              <div className="divider"/>
              <p style={{fontSize:15.5,lineHeight:1.9,color:"#555",fontStyle:"italic",borderLeft:"3px solid var(--orange)",paddingLeft:20,whiteSpace:"pre-wrap"}}>{directeur.presentation}</p>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}

// ── PAGE DOMAINES ─────────────────────────────────────────────────────────────
function PageDomaines() {
  const {data,loading}=useApi("/domaines");
  const actifs=Array.isArray(data)?data.filter(d=>d.actif!==false):[];
  return (
    <>
      <div className="page-hero"><div className="page-hero-bg"/><div className="page-hero-grid"/><div className="page-hero-glow"/>
        <div className="page-hero-content"><div className="section-tag" style={{color:"var(--orange)"}}>Expertises</div><h1>Nos domaines <em style={{color:"var(--orange)",fontStyle:"normal"}}>d'activité</em></h1><p>Nous intervenons dans plusieurs secteurs clés de l'industrie africaine avec rigueur et excellence.</p></div>
      </div>
      <section className="section">
        <Reveal style={{maxWidth:700,margin:"0 auto 60px",textAlign:"center"}}><p style={{fontSize:16,lineHeight:1.85,color:"#555"}}>Africa Ingénierie intervient dans plusieurs secteurs stratégiques de l'industrie africaine. Chacun de nos domaines est porté par une équipe d'ingénieurs expérimentés, engagés à vous fournir des solutions performantes, fiables et durables.</p></Reveal>
        {loading?<Spinner/>:actifs.length===0?<Empty/>:(
          <div style={{display:"flex",flexDirection:"column",gap:70}}>
            {actifs.map((d,i)=>{
              let subs=[];try{subs=Array.isArray(d.sousDescriptions)?d.sousDescriptions:JSON.parse(d.sousDescriptions||"[]");}catch{}
              const even=i%2===0;
              return (
                <div key={d.id} className="domaine-alt" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
                  {even&&<Reveal cls="reveal-left"><div className="domaine-alt-img" style={{borderRadius:22,overflow:"hidden",height:360,background:"var(--cream)",boxShadow:"0 20px 50px rgba(0,0,0,.1)"}}><div className="img-zoom" style={{height:"100%"}}>{d.imageUrl?<img src={imgSrc(d.imageUrl)} alt={d.name}/>:<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:64}}>🏗</div>}</div></div></Reveal>}
                  <Reveal cls={even?"reveal-right":"reveal-left"}>
                    <div className="section-tag">0{i+1}</div>
                    <h3 style={{fontFamily:"Playfair Display",fontSize:28,fontWeight:800,marginBottom:14,lineHeight:1.2}}>{d.name}</h3>
                    <div className="divider"/>
                    <p style={{fontSize:15,lineHeight:1.85,color:"#555",marginBottom:subs.length?24:0}}>{d.description}</p>
                    {subs.length>0&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{subs.map((s,j)=><div key={j} style={{background:"var(--cream)",borderRadius:12,padding:"14px 18px",borderLeft:"3px solid var(--orange)",transition:"transform .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>{s.titre&&<div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{s.titre}</div>}{s.texte&&<div style={{fontSize:13.5,color:"#666",lineHeight:1.6}}>{s.texte}</div>}</div>)}</div>}
                    {d.videoUrl&&<a href={d.videoUrl} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:20,color:"var(--orange)",fontWeight:600,fontSize:14}}>🎬 Voir la vidéo </a>}
                  </Reveal>
                  {!even&&<Reveal cls="reveal-right"><div className="domaine-alt-img" style={{borderRadius:22,overflow:"hidden",height:360,background:"var(--cream)",boxShadow:"0 20px 50px rgba(0,0,0,.1)"}}><div className="img-zoom" style={{height:"100%"}}>{d.imageUrl?<img src={imgSrc(d.imageUrl)} alt={d.name}/>:<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:64}}>🏗</div>}</div></div></Reveal>}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

// ── PAGE PROJETS ──────────────────────────────────────────────────────────────
function PageProjets() {
  const {data,loading}=useApi("/projects");
  const actifs=Array.isArray(data)?data.filter(p=>p.actif!==false):[];
  return (
    <>
      <div className="page-hero"><div className="page-hero-bg"/><div className="page-hero-grid"/><div className="page-hero-glow"/>
        <div className="page-hero-content"><div className="section-tag" style={{color:"var(--orange)"}}>Portfolio</div><h1>Nos <em style={{color:"var(--orange)",fontStyle:"normal"}}>projets</em></h1><p>Découvrez nos réalisations à travers l'Afrique.</p></div>
      </div>
      <section className="section">
        <Reveal style={{maxWidth:700,margin:"0 auto 52px",textAlign:"center"}}><p style={{fontSize:16,lineHeight:1.85,color:"#555"}}>Chaque projet témoigne de notre engagement envers la qualité, la rigueur et la satisfaction client. Nous intervenons dans des environnements industriels exigeants avec des solutions sur mesure.</p></Reveal>
        {loading?<Spinner/>:actifs.length===0?<Empty/>:(
          <div className="grid-3">{actifs.map((p,i)=>(
            <Reveal key={p.id} delay={i*0.07}>
              <div className="projet-card">
                <div className="projet-img">{p.imageUrl?<img src={imgSrc(p.imageUrl)} alt={p.title}/>:<div className="projet-placeholder"/>}{p.date&&<div className="projet-tag">{fmtDate(p.date)}</div>}</div>
                <div className="projet-body"><div className="projet-title">{p.title}</div><div className="projet-desc">{p.description}</div></div>
              </div>
            </Reveal>
          ))}</div>
        )}
      </section>
    </>
  );
}

// ── PAGE FORMATIONS ───────────────────────────────────────────────────────────
function PageFormations() {
  const {data:formations,loading}=useApi("/formations");
  const {data:domaines}=useApi("/domaines");
  const getDom=id=>Array.isArray(domaines)?domaines.find(d=>d.id===id):null;
  return (
    <>
      <div className="page-hero"><div className="page-hero-bg"/><div className="page-hero-grid"/><div className="page-hero-glow"/>
        <div className="page-hero-content"><div className="section-tag" style={{color:"var(--orange)"}}>Formation</div><h1>Nos <em style={{color:"var(--orange)",fontStyle:"normal"}}>formations</em></h1><p>Des programmes pratiques adaptés aux réalités industrielles africaines.</p></div>
      </div>
      <section className="section">
        <Reveal style={{maxWidth:700,margin:"0 auto 52px",textAlign:"center"}}><p style={{fontSize:16,lineHeight:1.85,color:"#555"}}>Nos formations sont conçues par des ingénieurs terrain pour garantir une montée en compétences rapide et efficace. Chaque programme est ancré dans la réalité industrielle africaine.</p></Reveal>
        {loading?<Spinner/>:!Array.isArray(formations)||formations.length===0?<Empty/>:(
          <div className="grid-3">{formations.map((f,i)=>{
            const dom=f.domaine||getDom(f.domaineId);
            return (
              <Reveal key={f.id} delay={i*0.07}>
                <div className="formation-card">
                  <div className="formation-img">{f.imageUrl?<img src={imgSrc(f.imageUrl)} alt={f.title}/>:<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><BookOpen size={48} color="var(--gray)" strokeWidth={1}/></div>}</div>
                  <div className="formation-body">
                    {f.date&&<div style={{fontSize:11,color:"var(--orange)",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>{fmtDate(f.date)}</div>}
                    <div style={{fontSize:16.5,fontWeight:700,lineHeight:1.35}}>{f.title}</div>
                    <div style={{fontSize:13,color:"var(--gray)",lineHeight:1.65,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{f.description}</div>
                    {dom&&<div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",background:"#eff6ff",color:"var(--orange)",borderRadius:99,fontSize:11,fontWeight:600,marginTop:"auto"}}>{dom.name}</div>}
                  </div>
                </div>
              </Reveal>
            );
          })}</div>
        )}
      </section>
    </>
  );
}

// ── PAGE ÉTUDES ───────────────────────────────────────────────────────────────
function PageEtudes() {
  const {data,loading}=useApi("/etudes");
  return (
    <>
      <div className="page-hero"><div className="page-hero-bg"/><div className="page-hero-grid"/><div className="page-hero-glow"/>
        <div className="page-hero-content"><div className="section-tag" style={{color:"var(--orange)"}}>Réalisations</div><h1>Études de cas & <em style={{color:"var(--orange)",fontStyle:"normal"}}>Réalisations</em></h1><p>Avant / après — découvrez nos interventions et leurs résultats concrets.</p></div>
      </div>
      <section className="section">
        <Reveal style={{maxWidth:700,margin:"0 auto 52px",textAlign:"center"}}><p style={{fontSize:16,lineHeight:1.85,color:"#555"}}>Nos études de cas illustrent concrètement l'impact de nos interventions. Grâce à des comparaisons avant / après, mesurez les améliorations que nous apportons aux équipements et processus de nos clients.</p></Reveal>
        {loading?<Spinner/>:!Array.isArray(data)||data.length===0?<Empty/>:(
          <div className="grid-2">{data.map((e,i)=>(
            <Reveal key={e.id} delay={i*0.08}>
              <div className="etude-card">
                <div className="etude-avap">
                  <div className="etude-side">{e.imageAvant?<img src={imgSrc(e.imageAvant)} alt="Avant"/>:<div style={{height:"100%",background:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>📸</div>}<div className="etude-lbl" style={{background:"rgba(0,0,0,.6)",color:"#fff"}}>Avant</div></div>
                  <div className="etude-side">{e.imageApres?<img src={imgSrc(e.imageApres)} alt="Après"/>:<div style={{height:"100%",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>✨</div>}<div className="etude-lbl" style={{background:"rgba(37,99,235,.9)",color:"#fff"}}>Après</div></div>
                </div>
                <div className="etude-body">
                  <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                    {e.categorie&&<span className="etude-chip" style={{background:"#eff6ff",color:"var(--orange)"}}>{e.categorie}</span>}
                    {e.client&&<span className="etude-chip" style={{background:"var(--cream)",color:"var(--gray)"}}>{e.client}</span>}
                    {e.date&&<span className="etude-chip" style={{background:"var(--cream)",color:"var(--gray)"}}>{fmtDate(e.date)}</span>}
                  </div>
                  <div style={{fontWeight:700,fontSize:17,marginBottom:8}}>{e.titre}</div>
                  <div style={{fontSize:13.5,color:"var(--gray)",lineHeight:1.65}}>{e.description}</div>
                </div>
              </div>
            </Reveal>
          ))}</div>
        )}
      </section>
    </>
  );
}

// ── PAGE PARTENAIRES ──────────────────────────────────────────────────────────
function PagePartenaires() {
  const {data,loading}=useApi("/partenaires");
  return (
    <>
      <div className="page-hero"><div className="page-hero-bg"/><div className="page-hero-grid"/><div className="page-hero-glow"/>
        <div className="page-hero-content"><div className="section-tag" style={{color:"var(--orange)"}}>Écosystème</div><h1>Nos <em style={{color:"var(--orange)",fontStyle:"normal"}}>partenaires</em></h1><p>Ils nous font confiance et collaborent avec nous pour des projets d'envergure.</p></div>
      </div>
      <section className="section">
        <Reveal style={{maxWidth:700,margin:"0 auto 52px",textAlign:"center"}}><p style={{fontSize:16,lineHeight:1.85,color:"#555"}}>Africa Ingénierie s'appuie sur un réseau solide de partenaires stratégiques pour offrir des solutions complètes et de qualité. Ensemble, nous contribuons au développement industriel durable de l'Afrique.</p></Reveal>
        {loading?<Spinner/>:!Array.isArray(data)||data.length===0?<Empty/>:(
          <>
            <div style={{display:"flex",flexWrap:"wrap",gap:16,justifyContent:"center",marginBottom:60}}>
              {data.map((p,i)=>(
                <Reveal key={p.id} delay={i*0.06}>
                  <a href={p.siteWeb||"#"} target={p.siteWeb?"_blank":"_self"} rel="noreferrer" className="part-logo" title={p.nom}>
                    {p.logoUrl?<img src={imgSrc(p.logoUrl)} alt={p.nom}/>:<span style={{fontWeight:700,fontSize:14}}>{p.nom}</span>}
                  </a>
                </Reveal>
              ))}
            </div>
            {data.some(p=>p.description)&&(
              <div className="grid-3" style={{gap:24}}>
                {data.filter(p=>p.description).map((p,i)=>(
                  <Reveal key={p.id} delay={i*0.07}>
                    <div style={{background:"var(--cream)",borderRadius:18,padding:28,transition:"transform .3s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>
                      <div style={{fontWeight:700,fontSize:16,marginBottom:10}}>{p.nom}</div>
                      <div style={{fontSize:14,color:"var(--gray)",lineHeight:1.65}}>{p.description}</div>
                      {p.siteWeb&&<a href={p.siteWeb} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:14,color:"var(--orange)",fontWeight:600,fontSize:13}}>Visiter le site </a>}
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

// ── PAGE AVIS ─────────────────────────────────────────────────────────────────
function PageAvis({addToast}) {
  const {data:avis,loading}=useApi("/avis");
  const avisPublies=Array.isArray(avis)?avis.filter(a=>a.statut==="publie"):[];
  const [note,setNote]=useState(5);const [hovered,setHovered]=useState(0);
  const [form,setForm]=useState({nom:"",email:"",message:""});
  const [sending,setSending]=useState(false);const [sent,setSent]=useState(false);
  const F=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const moyenne=avisPublies.length?(avisPublies.reduce((s,a)=>s+(a.note||5),0)/avisPublies.length).toFixed(1):null;

  const submit=async e=>{
    e.preventDefault();if(!form.nom||!form.message)return addToast("Remplissez les champs requis.","error");
    setSending(true);
    try{const r=await fetch(`${API_BASE}/avis`,{method:"POST",headers:{"Content-Type":"application/json","x-api-key":API_KEY},body:JSON.stringify({...form,note,statut:"cache"})});if(!r.ok)throw new Error();setSent(true);addToast("Merci pour votre avis !","success");}
    catch{addToast("Erreur d'envoi.","error");}finally{setSending(false);}
  };

  return (
    <>
      <div className="page-hero"><div className="page-hero-bg"/><div className="page-hero-grid"/><div className="page-hero-glow"/>
        <div className="page-hero-content"><div className="section-tag" style={{color:"var(--orange)"}}>Témoignages</div><h1>Avis de nos <em style={{color:"var(--orange)",fontStyle:"normal"}}>clients</em></h1><p>Découvrez les retours de nos clients et partagez votre expérience.</p></div>
      </div>

      {moyenne&&(
        <section className="section-sm section-cream">
          <Reveal><div style={{display:"flex",gap:40,justifyContent:"center",flexWrap:"wrap",alignItems:"center"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"Playfair Display",fontSize:72,fontWeight:900,color:"var(--orange)",lineHeight:1}}>{moyenne}</div>
              <div style={{color:"var(--gold)",fontSize:24,margin:"6px 0"}}>{"★".repeat(Math.round(moyenne))}</div>
              <div style={{fontSize:13,color:"var(--gray)"}}>{avisPublies.length} avis vérifiés</div>
            </div>
            <div style={{width:1,height:80,background:"var(--border)"}}/>
            <div style={{display:"flex",flexDirection:"column",gap:8,minWidth:200}}>
              {[5,4,3,2,1].map(n=>{const cnt=avisPublies.filter(a=>(a.note||5)===n).length,pct=avisPublies.length?Math.round(cnt/avisPublies.length*100):0;return(
                <div key={n} style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:12,color:"var(--gray)",minWidth:8}}>{n}</span>
                  <span style={{color:"var(--gold)",fontSize:12}}>★</span>
                  <div style={{flex:1,height:6,background:"var(--border)",borderRadius:99,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:"var(--gold)",borderRadius:99,transition:"width .8s ease"}}/></div>
                  <span style={{fontSize:12,color:"var(--gray)",minWidth:20}}>{cnt}</span>
                </div>
              );})}
            </div>
          </div></Reveal>
        </section>
      )}

      <section className="section">
        {loading?<Spinner/>:avisPublies.length===0?<div style={{textAlign:"center",padding:"20px 0 50px"}}><div style={{marginBottom:12,display:"flex",justifyContent:"center"}}><Star size={48} color="var(--gray)" strokeWidth={1}/></div><p style={{color:"var(--gray)"}}>Soyez le premier à partager votre expérience !</p></div>:(
          <div className="grid-3" style={{marginBottom:80}}>
            {avisPublies.map((a,i)=>(
              <Reveal key={a.id} delay={i*0.07}>
                <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:20,padding:28,transition:"all .3s",height:"100%"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 14px 40px rgba(0,0,0,.08)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                  <div style={{color:"var(--gold)",fontSize:18,marginBottom:14,letterSpacing:2}}>{"★".repeat(a.note||5)}{"☆".repeat(5-(a.note||5))}</div>
                  <p style={{fontSize:14.5,lineHeight:1.8,color:"#444",fontStyle:"italic",marginBottom:20}}>"{a.message}"</p>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#2563EB,#60A5FA)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff"}}>{(a.nom||"?")[0].toUpperCase()}</div>
                    <div><div style={{fontWeight:700,fontSize:14}}>{a.nom}</div><div style={{fontSize:12,color:"var(--gray)"}}>{fmtDate(a.createdAt)}</div></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal style={{textAlign:"center",marginBottom:40}}><div className="section-tag" style={{justifyContent:"center"}}>Votre expérience</div><h2 className="section-title" style={{fontSize:32}}>Laissez votre <em>avis</em></h2><p style={{color:"var(--gray)",fontSize:15,marginTop:8}}>Votre avis sera examiné avant publication. Merci !</p></Reveal>

        <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:24,padding:40,maxWidth:680,margin:"0 auto"}}>
          {sent?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{marginBottom:14,display:"flex",justifyContent:"center"}}><CheckCircle size={56} color="var(--success)" strokeWidth={1.5}/></div>
              <h3 style={{fontFamily:"Playfair Display",fontSize:24,fontWeight:800,marginBottom:10}}>Merci pour votre avis !</h3>
              <p style={{color:"var(--gray)",fontSize:15,marginBottom:24,lineHeight:1.7}}>Votre témoignage a bien été reçu. Il sera affiché après validation par notre équipe.</p>
              <button className="btn-primary" onClick={()=>setSent(false)}>Laisser un autre avis</button>
            </div>
          ):(
            <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:16}}>
              <div><label style={{fontSize:14,fontWeight:600,marginBottom:10,display:"block"}}>Votre note *</label>
                <div className="star-picker">{[1,2,3,4,5].map(n=><button key={n} type="button" className={(hovered||note)>=n?"lit":""} onMouseEnter={()=>setHovered(n)} onMouseLeave={()=>setHovered(0)} onClick={()=>setNote(n)}>★</button>)}</div>
                <div style={{fontSize:12,color:"var(--gray)",marginTop:4}}>{["","Très insatisfait","Insatisfait","Moyen","Satisfait","Très satisfait"][hovered||note]}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div><label className="form-label">Nom *</label><input className="form-input" placeholder="Votre nom" value={form.nom} onChange={F("nom")} required/></div>
                <div><label className="form-label">Email</label><input className="form-input" type="email" placeholder="votre@email.com" value={form.email} onChange={F("email")}/></div>
              </div>
              <div><label className="form-label">Témoignage *</label><textarea className="form-textarea" rows={5} placeholder="Partagez votre expérience…" value={form.message} onChange={F("message")} required/></div>
              <div style={{background:"var(--cream)",borderRadius:10,padding:"12px 16px",fontSize:13,color:"var(--gray)",display:"flex",alignItems:"center",gap:8}}><Info size={15} color="var(--orange)"/>Votre avis sera visible après validation par notre équipe (sous 24 à 48h).</div>
              <button type="submit" className="form-submit" disabled={sending}>{sending?"Envoi en cours…":"Publier mon avis "}</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

// ── PAGE CONTACT ──────────────────────────────────────────────────────────────
function PageContact({addToast}) {
  const [form,setForm]=useState({nom:"",email:"",sujet:"",message:""});
  const [sending,setSending]=useState(false);
  const F=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const submit=async e=>{
    e.preventDefault();if(!form.nom||!form.email||!form.message)return addToast("Remplissez les champs requis.","error");
    setSending(true);
    try{const r=await fetch(`${API_BASE}/contact`,{method:"POST",headers:{"Content-Type":"application/json","x-api-key":API_KEY},body:JSON.stringify(form)});if(!r.ok)throw new Error();addToast("Message envoyé ! Nous vous répondrons rapidement.","success");setForm({nom:"",email:"",sujet:"",message:""});}
    catch{addToast("Erreur d'envoi.","error");}finally{setSending(false);}
  };
  return (
    <>
      <div className="page-hero"><div className="page-hero-bg"/><div className="page-hero-grid"/><div className="page-hero-glow"/>
        <div className="page-hero-content"><div className="section-tag" style={{color:"var(--orange)"}}>Contact</div><h1>Parlons de votre <em style={{color:"var(--orange)",fontStyle:"normal"}}>projet</em></h1><p>Notre équipe d'ingénieurs est disponible pour répondre à vos besoins.</p></div>
      </div>
      <section className="section">
        <div className="contact-grid">
          <Reveal cls="reveal-left">
            <div className="contact-info-card">
              <div className="section-tag" style={{color:"var(--orange)"}}>Coordonnées</div>
              <h2 style={{fontFamily:"Playfair Display",fontSize:26,fontWeight:800,color:"#fff",marginBottom:10,lineHeight:1.3}}>Contactez-nous</h2>
              <p style={{fontSize:14,color:"rgba(255,255,255,.45)",lineHeight:1.7,marginBottom:32}}>Notre équipe d'ingénieurs est disponible pour répondre à vos besoins en diagnostic industriel, formation, maintenance et installation.</p>
              {[{t:"Adresse",v:"Bénin, Abomey-Calavi\nOuèdo, La Verdure\nTranche I, Lot 01, Parcelle L"},{t:"Téléphone",v:"(+229) 0142545495"},{t:"Email",v:"contact@africaingenierie.com"},{t:"Site Web",v:"www.africaingenierie.com"}].map((it,k)=>(
                <div key={k} className="contact-item">
                  <div className="contact-icon"><div style={{width:10,height:10,borderRadius:"50%",background:"#60A5FA"}}/></div>
                  <div><div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:3}}>{it.t}</div><div style={{fontSize:13.5,color:"rgba(255,255,255,.5)",whiteSpace:"pre-line",lineHeight:1.6}}>{it.v}</div></div>
                </div>
              ))}
              <div style={{marginTop:28}}><a href="https://wa.me/22901425454954" target="_blank" rel="noreferrer" style={{padding:"10px 20px",background:"#25D366",color:"#fff",borderRadius:99,fontSize:13,fontWeight:600,display:"inline-flex",alignItems:"center",gap:7}}>WhatsApp</a></div>
            </div>
          </Reveal>
          <Reveal cls="reveal-right">
            <div className="contact-form-card">
              <h3 style={{fontFamily:"Playfair Display",fontSize:22,fontWeight:800,marginBottom:24}}>Envoyer un message</h3>
              <form onSubmit={submit}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                  <div><label className="form-label">Nom *</label><input className="form-input" placeholder="Votre nom" value={form.nom} onChange={F("nom")} required/></div>
                  <div><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="votre@email.com" value={form.email} onChange={F("email")} required/></div>
                </div>
                <div style={{marginBottom:16}}><label className="form-label">Votre besoin</label><select className="form-select" value={form.sujet} onChange={F("sujet")}><option value="">Sélectionnez votre besoin</option><option>Diagnostic industriel</option><option>Formation</option><option>Maintenance</option><option>Installation / Mise en service</option><option>Autre</option></select></div>
                <div style={{marginBottom:16}}><label className="form-label">Message *</label><textarea className="form-textarea" placeholder="Décrivez votre projet ou votre besoin…" value={form.message} onChange={F("message")} required/></div>
                <button type="submit" className="form-submit" disabled={sending}>{sending?"Envoi en cours…":"Envoyer le message "}</button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer({navigate}) {
  const {data:domaines}=useApi("/domaines");
  const actifs=Array.isArray(domaines)?domaines.filter(d=>d.actif!==false):[];
  const FALLBACK=["Formation en optimisation","Installation & Mise en service","Maintenance industrielle","Soudure & Chaudronnerie","Fourniture d'équipements","Énergie, Domotique & Sécurité"];
  const go=p=>{navigate(p);window.scrollTo(0,0);};

  return (
    <footer className="footer">
      <div className="footer-engage">
        <img src="/logo.jpeg" alt="Africa Ingénierie" style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,.25)",boxShadow:"0 0 0 4px rgba(255,255,255,.08)"}}/>
        <div>
          <div style={{width:40,height:3,background:"var(--orange)",borderRadius:2,marginBottom:14}}/>
          <p style={{fontSize:15,lineHeight:1.85,color:"rgba(255,255,255,.5)",maxWidth:640}}>Notre engagement est d'offrir des services d'ingénierie de haute précision afin de valoriser l'expertise africaine, d'innover localement et d'accompagner les industries vers un niveau d'excellence durable.</p>
        </div>
      </div>
      <div className="footer-grid">
        <div>
          <div className="footer-col-title">Menu</div>
          <div className="footer-links">
            {[{id:"accueil",l:"Accueil"},{id:"qui-sommes-nous",l:"À propos"},{id:"projets",l:"Réalisations & Références"},{id:"etudes",l:"Études de cas"},{id:"formations",l:"Formations"},{id:"avis",l:"Témoignages"},{id:"partenaires",l:"Partenaires"},{id:"contact",l:"Contact"}].map(it=><a key={it.id} onClick={()=>go(it.id)}>{it.l}</a>)}
          </div>
        </div>
        <div>
          <div className="footer-col-title">Domaines d'intervention</div>
          <div className="footer-links">
            {(actifs.length>0?actifs:FALLBACK.map((n,i)=>({id:i,name:n}))).map(d=><a key={d.id} onClick={()=>go("domaines")}>{d.name}</a>)}
          </div>
        </div>
        <div>
          <div className="footer-col-title">Contact</div>
          <div className="footer-links">
            <a style={{flexDirection:"column",alignItems:"flex-start",gap:2}}><span>Bénin, Abomey-Calavi — Ouèdo, La Verdure<br/>Tranche I, Lot 01, Parcelle L</span></a>
            <a href="tel:+22901425454954">(+229) 0142545495</a>
            <a href="mailto:contact@africaingenierie.com">contact@africaingenierie.com</a>
            <a href="https://www.africaingenierie.com" target="_blank" rel="noreferrer">www.africaingenierie.com</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} <span style={{color:"var(--orange)"}}>Africa Ingénierie</span>. Tous droits réservés.</span>
        <a href="/admin" style={{fontSize:11,color:"rgba(255,255,255,.15)",letterSpacing:".06em",textDecoration:"none",transition:"color .2s",display:"inline-flex",alignItems:"center",gap:4}} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,.4)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.15)"}><Settings size={11}/>Admin</a>
      </div>
      <div className="social-bar">
        <div className="social-text">Suivez-nous et <strong>contactez-nous</strong> directement</div>
        <div className="social-links">
          <a href="https://wa.me/22901425454954" target="_blank" rel="noreferrer" className="soc-btn soc-wa">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
          <a href="https://www.facebook.com/africaingenierie" target="_blank" rel="noreferrer" className="soc-btn soc-fb">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
          <a href="https://www.instagram.com/africaingenierie" target="_blank" rel="noreferrer" className="soc-btn soc-ig">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState("accueil");
  const [toasts,setToasts]=useState([]);
  const addToast=(msg,type="success")=>{const id=Date.now();setToasts(t=>[...t,{id,msg,type}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4500);};
  const navigate=p=>{setPage(p);window.scrollTo(0,0);};
  const [scrollPct, setScrollPct] = useState(0);
  const [showTop, setShowTop] = useState(false);
  useEffect(()=>{
    const fn = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(pct);
      setShowTop(el.scrollTop > 400);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  },[]);

  return (
    <>
      <style>{CSS}</style>
      <CursorLight/>
      <div className="scroll-indicator" style={{width:`${scrollPct}%`}}/>
      <button className={`back-top${showTop?"":" hidden"}`} onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}><ArrowUp size={18}/></button>
      <Navbar page={page} navigate={navigate}/>
      <main key={page} className="page-enter">
        {page==="accueil"         && <PageAccueil       navigate={navigate}/>}
        {page==="qui-sommes-nous" && <PageQuiSommesNous/>}
        {page==="domaines"        && <PageDomaines/>}
        {page==="projets"         && <PageProjets/>}
        {page==="formations"      && <PageFormations/>}
        {page==="etudes"          && <PageEtudes/>}
        {page==="partenaires"     && <PagePartenaires/>}
        {page==="avis"            && <PageAvis addToast={addToast}/>}
        {page==="contact"         && <PageContact addToast={addToast}/>}
      </main>
      <Footer navigate={navigate}/>
      <Toast toasts={toasts}/>
    </>
  );
}
