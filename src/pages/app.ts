export const appHtml = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cat Care System</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:transparent}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;color:#2d3748;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.hidden{display:none!important}
button{cursor:pointer;font-family:inherit;border:none;font-weight:600;transition:all .2s}
button:disabled{opacity:.6;cursor:not-allowed}
input,select,textarea{font-family:inherit;border:1px solid #cbd5e0;border-radius:8px;padding:.75rem;width:100%;font-size:1rem;transition:border-color .2s}
input:focus,select:focus,textarea:focus{outline:none;border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,.1)}
label{display:block;font-size:.85rem;font-weight:600;color:#4a5568;margin-bottom:.4rem}
.field{margin-bottom:1rem}
.btn{background:#667eea;color:white;padding:.75rem 1.5rem;border-radius:8px;font-size:1rem}
.btn:hover:not(:disabled){background:#5a67d8;transform:translateY(-1px);box-shadow:0 4px 12px rgba(102,126,234,.4)}
.btn-secondary{background:#edf2f7;color:#4a5568}
.btn-secondary:hover:not(:disabled){background:#e2e8f0}
.btn-danger{background:#f56565}
.btn-danger:hover:not(:disabled){background:#e53e3e}
.btn-sm{padding:.4rem .8rem;font-size:.85rem}
.btn-block{width:100%}

/* Auth */
.auth-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1rem}
.auth-card{background:white;border-radius:16px;padding:2.5rem;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.auth-logo{text-align:center;margin-bottom:2rem}
.auth-logo .emoji{font-size:3.5rem}
.auth-logo h1{font-size:1.6rem;margin-top:.5rem;color:#2d3748}
.auth-logo p{color:#718096;font-size:.9rem;margin-top:.3rem}
.auth-msg{padding:.7rem;border-radius:8px;font-size:.85rem;margin-bottom:1rem;display:none}
.gbtn-wrap{display:flex;justify-content:center;margin-bottom:1.25rem}
.auth-msg.show{display:block}
.auth-msg.error{background:#fed7d7;color:#742a2a}
.auth-msg.success{background:#c6f6d5;color:#22543d}

/* App */
.app{min-height:100vh;background:#f7fafc}
.navbar{background:white;padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;box-shadow:0 1px 3px rgba(0,0,0,.06);position:sticky;top:0;z-index:10}
.brand{display:flex;align-items:center;gap:.5rem;font-weight:700;font-size:1.1rem;color:#2d3748}
.brand-emoji{font-size:1.6rem}
.user-menu{display:flex;align-items:center;gap:.6rem}
.user-name{font-size:.9rem;color:#4a5568;font-weight:600}
.bell-btn{position:relative;background:none;border:none;cursor:pointer;font-size:1.4rem;padding:.3rem;line-height:1;transition:transform .15s}
.bell-btn:hover{transform:scale(1.15)}
.bell-badge{position:absolute;top:-2px;right:-4px;background:#f56565;color:white;font-size:.6rem;font-weight:700;border-radius:10px;padding:1px 4px;min-width:16px;text-align:center;line-height:14px}
.notif-panel{position:absolute;top:calc(100% + 8px);right:0;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.15);width:320px;max-height:420px;overflow-y:auto;z-index:200;border:1px solid #e2e8f0}
.notif-panel-head{display:flex;justify-content:space-between;align-items:center;padding:.8rem 1rem;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:.9rem;color:#2d3748;position:sticky;top:0;background:white}
.notif-item{padding:.75rem 1rem;border-bottom:1px solid #f7fafc;cursor:default}
.notif-item.unread{background:#ebf4ff}
.notif-item-title{font-size:.85rem;font-weight:600;color:#2d3748;margin-bottom:.2rem}
.notif-item-msg{font-size:.8rem;color:#718096}
.notif-item-time{font-size:.7rem;color:#a0aec0;margin-top:.2rem}
.notif-empty{text-align:center;padding:2rem;color:#a0aec0;font-size:.85rem}
.notif-wrap{position:relative}
.main{max-width:1100px;margin:0 auto;padding:1.5rem}

/* Summary */
.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem}
.stat{background:white;padding:1.2rem;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.stat-label{font-size:.75rem;color:#718096;text-transform:uppercase;letter-spacing:.05em;font-weight:600;margin-bottom:.4rem}
.stat-value{font-size:2rem;font-weight:700;color:#2d3748}
.stat-icon{font-size:1.5rem;margin-bottom:.4rem}

/* Sections */
.section{background:white;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
.section-title{font-size:1.1rem;font-weight:700;color:#2d3748;display:flex;align-items:center;gap:.5rem}

/* Cat grid */
.cats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
.cat-card{background:#f7fafc;border-radius:10px;padding:1.2rem;cursor:pointer;transition:all .2s;border:2px solid transparent}
.cat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08);border-color:#667eea}
.cat-card.active{border-color:#667eea;background:#ebf4ff}
.cat-avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin-bottom:.8rem;overflow:hidden}
.cat-avatar img{width:100%;height:100%;object-fit:cover}
.cat-photo-large{width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:3.5rem;margin:0 auto 1rem;overflow:hidden;position:relative;cursor:pointer;transition:transform .2s}
.cat-photo-large:hover{transform:scale(1.03)}
.cat-photo-large img{width:100%;height:100%;object-fit:cover}
.cat-photo-large .upload-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);color:white;display:flex;align-items:center;justify-content:center;font-size:.85rem;opacity:0;transition:opacity .2s}
.cat-photo-large:hover .upload-overlay{opacity:1}
.cat-name{font-size:1.1rem;font-weight:700;color:#2d3748;margin-bottom:.3rem}
.cat-meta{font-size:.85rem;color:#718096}
.cat-badge{display:inline-block;padding:.15rem .5rem;border-radius:10px;font-size:.7rem;font-weight:600;margin-top:.5rem}
.badge-normal{background:#c6f6d5;color:#22543d}
.badge-treating{background:#fed7d7;color:#742a2a}
.badge-caution{background:#fefcbf;color:#744210}

.empty{text-align:center;padding:3rem 1rem;color:#a0aec0}
.empty-icon{font-size:3rem;margin-bottom:.5rem}

/* Cat detail */
.tabs{display:flex;gap:.3rem;border-bottom:2px solid #e2e8f0;margin-bottom:1rem;overflow-x:auto}
.tab{padding:.7rem 1rem;background:transparent;color:#718096;font-weight:600;font-size:.9rem;border-bottom:2px solid transparent;margin-bottom:-2px;white-space:nowrap}
.tab.active{color:#667eea;border-color:#667eea}

.records-list{display:flex;flex-direction:column;gap:.6rem}
.record{background:#f7fafc;padding:.9rem 1rem;border-radius:8px;border-left:4px solid #667eea}
.record-title{font-weight:700;color:#2d3748;margin-bottom:.2rem}
.record-meta{font-size:.85rem;color:#718096}
.record-date{font-size:.75rem;color:#a0aec0;text-transform:uppercase;letter-spacing:.05em;margin-top:.3rem}

/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:100;padding:1rem}
.modal{background:white;border-radius:14px;padding:2rem;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem}
.modal-title{font-size:1.2rem;font-weight:700;color:#2d3748}
.modal-close{background:transparent;color:#a0aec0;font-size:1.5rem;width:32px;height:32px;border-radius:50%}
.modal-close:hover{background:#edf2f7}
.modal-actions{display:flex;gap:.6rem;justify-content:flex-end;margin-top:1.5rem}

.toast{position:fixed;bottom:1.5rem;right:1.5rem;background:#2d3748;color:white;padding:.9rem 1.2rem;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.2);z-index:200;font-size:.9rem;animation:slideIn .3s;max-width:320px}
.toast.success{background:#48bb78}
.toast.error{background:#f56565}
@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}

.spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite;margin-right:.5rem;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}

.chart-wrap{background:#f7fafc;border-radius:12px;padding:1.2rem;margin-bottom:1.2rem}
.chart-title{font-size:.85rem;color:#718096;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.8rem}
.chart-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:.6rem;margin-bottom:1rem}
.chart-stat{background:white;padding:.7rem;border-radius:8px;text-align:center}
.chart-stat-label{font-size:.7rem;color:#718096;text-transform:uppercase;letter-spacing:.05em}
.chart-stat-value{font-size:1.2rem;font-weight:700;color:#2d3748;margin-top:.2rem}
.chart-stat-value.up{color:#48bb78}
.chart-stat-value.down{color:#f56565}
.chart-svg{width:100%;height:240px}
.chart-svg .grid-line{stroke:#e2e8f0;stroke-width:1}
.chart-svg .axis-label{font-size:11px;fill:#a0aec0}
.chart-svg .data-line{stroke:#667eea;stroke-width:2.5;fill:none;stroke-linejoin:round;stroke-linecap:round}
.chart-svg .data-area{fill:url(#chart-grad);opacity:.3}
.chart-svg .data-point{fill:white;stroke:#667eea;stroke-width:2.5}
.chart-svg .data-point:hover{r:6;cursor:pointer}
.weight-log{display:flex;justify-content:space-between;align-items:center;background:#f7fafc;padding:.8rem 1rem;border-radius:8px;margin-bottom:.4rem}
.weight-log-info{display:flex;align-items:center;gap:.8rem}
.weight-log-value{font-size:1.1rem;font-weight:700;color:#2d3748}
.weight-log-diff{font-size:.8rem;font-weight:600;padding:.15rem .5rem;border-radius:10px}
.weight-log-diff.up{background:#fed7d7;color:#742a2a}
.weight-log-diff.down{background:#c6f6d5;color:#22543d}
.weight-log-diff.same{background:#edf2f7;color:#4a5568}
.weight-log-date{font-size:.8rem;color:#718096}
.weight-log-delete{background:transparent;color:#a0aec0;padding:.3rem .5rem;font-size:.85rem;border-radius:4px}
.weight-log-delete:hover{background:#fed7d7;color:#742a2a}

.tl-filters{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1.2rem}
.tl-filter{padding:.4rem .9rem;border-radius:999px;background:#edf2f7;color:#4a5568;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .15s}
.tl-filter:hover{background:#e2e8f0}
.tl-filter.active{background:#667eea;color:white}
.tl-filter .count{margin-left:.3rem;opacity:.7;font-size:.75rem}
.timeline{position:relative;padding-left:2.2rem}
.timeline::before{content:'';position:absolute;left:.95rem;top:.5rem;bottom:.5rem;width:2px;background:linear-gradient(to bottom,#667eea,#cbd5e0)}
.tl-item{position:relative;margin-bottom:1.2rem}
.tl-item::before{content:attr(data-icon);position:absolute;left:-2.2rem;top:.1rem;width:2rem;height:2rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.95rem;background:white;border:2px solid;box-shadow:0 2px 6px rgba(0,0,0,.08);z-index:1}
.tl-item.t-vaccine::before{border-color:#48bb78}
.tl-item.t-medication::before{border-color:#4299e1}
.tl-item.t-medical::before{border-color:#ed8936}
.tl-item.t-weight::before{border-color:#9f7aea}
.tl-card{background:white;border-radius:10px;padding:.9rem 1rem;box-shadow:0 1px 3px rgba(0,0,0,.06);border-left:4px solid transparent}
.tl-item.t-vaccine .tl-card{border-left-color:#48bb78}
.tl-item.t-medication .tl-card{border-left-color:#4299e1}
.tl-item.t-medical .tl-card{border-left-color:#ed8936}
.tl-item.t-weight .tl-card{border-left-color:#9f7aea}
.tl-date{font-size:.75rem;color:#a0aec0;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.3rem}
.tl-title{font-weight:700;color:#2d3748;font-size:.95rem;margin-bottom:.2rem}
.tl-desc{font-size:.85rem;color:#718096;line-height:1.5}
.tl-month{font-size:.85rem;font-weight:700;color:#a0aec0;margin:1.5rem 0 .8rem;text-transform:uppercase;letter-spacing:.1em}
.tl-month:first-child{margin-top:0}

.exp-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.7rem;margin-bottom:1.2rem}
.exp-stat{background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:1rem;border-radius:12px}
.exp-stat-label{font-size:.7rem;opacity:.85;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.3rem}
.exp-stat-value{font-size:1.5rem;font-weight:700}
.exp-bar-chart{background:#f7fafc;border-radius:12px;padding:1.2rem;margin-bottom:1.2rem}
.exp-bars{display:flex;align-items:flex-end;gap:.4rem;height:160px;margin-top:1rem;padding-bottom:.3rem;border-bottom:2px solid #e2e8f0}
.exp-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:.3rem}
.exp-bar{width:100%;max-width:36px;background:linear-gradient(to top,#667eea,#a78bfa);border-radius:6px 6px 0 0;min-height:2px;transition:all .2s;position:relative}
.exp-bar:hover{transform:scaleY(1.05);box-shadow:0 4px 12px rgba(102,126,234,.4)}
.exp-bar-month{font-size:.7rem;color:#718096;font-weight:600;margin-top:.5rem}
.exp-bar-val{font-size:.65rem;color:#a0aec0;height:14px}
.exp-cat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.6rem;margin-bottom:1.2rem}
.exp-cat{background:white;padding:.8rem;border-radius:10px;border-left:4px solid;display:flex;justify-content:space-between;align-items:center}
.exp-cat-info{display:flex;flex-direction:column;gap:.1rem}
.exp-cat-label{font-size:.85rem;color:#4a5568;font-weight:600}
.exp-cat-count{font-size:.7rem;color:#a0aec0}
.exp-cat-amount{font-size:1rem;font-weight:700;color:#2d3748}
.exp-item{background:white;padding:.9rem 1rem;border-radius:10px;margin-bottom:.4rem;box-shadow:0 1px 2px rgba(0,0,0,.04);display:flex;justify-content:space-between;align-items:center;gap:.8rem;border-left:4px solid}
.exp-item-info{flex:1;min-width:0}
.exp-item-title{font-weight:700;color:#2d3748;font-size:.92rem;margin-bottom:.2rem;display:flex;align-items:center;gap:.4rem}
.exp-item-cat{display:inline-block;padding:.1rem .5rem;border-radius:10px;font-size:.7rem;font-weight:700}
.exp-item-desc{font-size:.8rem;color:#718096}
.exp-item-date{font-size:.7rem;color:#a0aec0;margin-top:.2rem}
.exp-item-amount{font-size:1.05rem;font-weight:700;color:#2d3748;white-space:nowrap}
.exp-item .del{background:transparent;color:#a0aec0;font-size:.85rem;padding:.3rem .5rem;border-radius:4px;margin-left:.3rem}
.exp-item .del:hover{background:#fed7d7;color:#742a2a}
.exp-source-medical{font-size:.6rem;padding:.1rem .4rem;background:#fed7d7;color:#742a2a;border-radius:6px;font-weight:700}

/* === Touch & input improvements === */
button,.tab,.tl-filter,.auth-tab{min-height:44px}
.btn-sm{min-height:36px}
input,select,textarea{font-size:16px} /* Prevents iOS zoom on focus */

/* === Tablet (768px and up) === */
@media(min-width:768px){
  .main{padding:2rem;max-width:1100px}
  .navbar{padding:1rem 2rem}
  .section{padding:2rem}
  .cats-grid{grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
}

/* === Desktop (1024px and up) === */
@media(min-width:1024px){
  .main{max-width:1200px;padding:2rem 3rem}
  .summary{grid-template-columns:repeat(4,1fr)}
  .cats-grid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
}

/* === Wide desktop (1280px and up) === */
@media(min-width:1280px){
  .main{max-width:1280px}
}

/* === Mobile (640px and below) === */
@media(max-width:640px){
  body{font-size:14px}
  .main{padding:.8rem}
  .navbar{padding:.7rem 1rem;flex-wrap:wrap;gap:.5rem}
  .brand{font-size:1rem}
  .brand-emoji{font-size:1.3rem}
  .user-name{font-size:.8rem}
  .section{padding:1rem;border-radius:10px}
  .section-head{flex-wrap:wrap;gap:.5rem}
  .section-title{font-size:1rem}
  .summary{grid-template-columns:repeat(2,1fr);gap:.6rem}
  .stat{padding:.9rem}
  .stat-icon{font-size:1.2rem}
  .stat-value{font-size:1.3rem}
  .stat-label{font-size:.65rem}
  .cats-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.7rem}
  .cat-card{padding:.9rem}
  .cat-avatar{width:48px;height:48px;font-size:1.4rem;margin-bottom:.5rem}
  .cat-name{font-size:.95rem}
  .cat-meta{font-size:.75rem}
  .cat-photo-large{width:90px;height:90px;font-size:2.5rem}
  .tabs{margin-left:-1rem;margin-right:-1rem;padding:0 1rem;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .tabs::-webkit-scrollbar{display:none}
  .tab{padding:.6rem .8rem;font-size:.82rem}
  .auth-wrap{padding:.6rem}
  .auth-card{padding:1.3rem 1.1rem;border-radius:14px}
  .auth-logo .emoji{font-size:3rem}
  .auth-logo h1{font-size:1.3rem}
  .auth-logo p{font-size:.8rem}
  .modal{padding:1.3rem;border-radius:14px;max-height:95vh}
  .modal-title{font-size:1rem}
  .modal-actions{flex-direction:column-reverse;gap:.4rem}
  .modal-actions .btn{width:100%}
  .toast{left:1rem;right:1rem;bottom:1rem;max-width:none}
  .records-list{gap:.4rem}
  .record{padding:.7rem .8rem}
  .record-title{font-size:.9rem}
  .record-meta{font-size:.78rem}
  .chart-stats{grid-template-columns:repeat(2,1fr);gap:.4rem}
  .chart-stat{padding:.6rem}
  .chart-stat-value{font-size:1rem}
  .chart-svg{height:200px}
  .weight-log{padding:.7rem .8rem;flex-wrap:wrap;gap:.4rem}
  .weight-log-info{flex-wrap:wrap;gap:.5rem}
  .weight-log-value{font-size:.95rem}
  .exp-summary{grid-template-columns:repeat(3,1fr);gap:.4rem}
  .exp-stat{padding:.7rem}
  .exp-stat-label{font-size:.6rem}
  .exp-stat-value{font-size:1rem}
  .exp-bars{height:130px}
  .exp-bar{max-width:28px}
  .exp-bar-month{font-size:.6rem}
  .exp-bar-val{font-size:.55rem}
  .exp-cat-grid{grid-template-columns:1fr}
  .exp-item{padding:.7rem .8rem}
  .exp-item-title{font-size:.85rem}
  .exp-item-amount{font-size:.95rem}
  .tl-filters{margin-left:-.3rem;margin-right:-.3rem;padding:0 .3rem;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .tl-filters::-webkit-scrollbar{display:none}
  .tl-filter{white-space:nowrap;padding:.4rem .7rem;font-size:.8rem}
  .timeline{padding-left:1.8rem}
  .timeline::before{left:.6rem}
  .tl-item::before{left:-1.8rem;width:1.6rem;height:1.6rem;font-size:.8rem}
  .tl-card{padding:.7rem .8rem}
  .tl-title{font-size:.88rem}
  .tl-desc{font-size:.78rem}
}

/* === Very small mobile (380px and below) === */
@media(max-width:380px){
  .summary{grid-template-columns:1fr 1fr}
  .exp-summary{grid-template-columns:1fr}
  .navbar{padding:.6rem .8rem}
  .user-name{display:none}
}
</style>
</head>
<body>

<!-- AUTH SCREEN -->
<div id="auth-screen" class="auth-wrap">
  <div class="auth-card">
    <div class="auth-logo">
      <div class="emoji">🐱</div>
      <h1>Cat Care System</h1>
      <p>ระบบจัดการสุขภาพแมวของคุณ</p>
    </div>
    <div id="auth-msg" class="auth-msg"></div>

    <div class="gbtn-wrap">
      <div id="g_id_onload"></div>
      <div id="g_id_signin"></div>
    </div>

  </div>
</div>

<!-- APP SCREEN -->
<div id="app-screen" class="app hidden">
  <nav class="navbar">
    <div class="brand"><span class="brand-emoji">🐱</span> Cat Care System</div>
    <div class="user-menu">
      <span class="user-name" id="user-name"></span>
      <div class="notif-wrap">
        <button class="bell-btn" onclick="toggleNotifPanel()" title="การแจ้งเตือน" id="bell-btn">🔔<span class="bell-badge hidden" id="bell-badge">0</span></button>
        <div class="notif-panel hidden" id="notif-panel"></div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="openLineSettings()" title="ตั้งค่า LINE">⚙️</button>
      <button class="btn btn-secondary btn-sm" onclick="logout()">ออกจากระบบ</button>
    </div>
  </nav>

  <div class="main">
    <!-- Summary -->
    <div class="summary" id="summary"></div>

    <!-- Cats -->
    <div class="section">
      <div class="section-head">
        <div class="section-title">🐈 แมวของคุณ</div>
        <button class="btn btn-sm" onclick="openCatModal()">+ เพิ่มแมว</button>
      </div>
      <div id="cats-container"></div>
    </div>

    <!-- Cat detail -->
    <div id="cat-detail" class="section hidden">
      <div class="section-head">
        <div class="section-title"><span id="detail-name"></span></div>
        <button class="btn btn-secondary btn-sm" onclick="closeDetail()">← กลับ</button>
      </div>
      <div class="tabs">
        <button class="tab active" data-tab="info" onclick="switchDetailTab('info')">ข้อมูล</button>
        <button class="tab" data-tab="vacc" onclick="switchDetailTab('vacc')">💉 วัคซีน</button>
        <button class="tab" data-tab="meds" onclick="switchDetailTab('meds')">💊 ยา</button>
        <button class="tab" data-tab="medical" onclick="switchDetailTab('medical')">🏥 ประวัติ</button>
        <button class="tab" data-tab="weight" onclick="switchDetailTab('weight')">⚖️ น้ำหนัก</button>
        <button class="tab" data-tab="timeline" onclick="switchDetailTab('timeline')">📅 Timeline</button>
        <button class="tab" data-tab="expenses" onclick="switchDetailTab('expenses')">💰 ค่าใช้จ่าย</button>
      </div>
      <div id="tab-info" class="tab-content"></div>
      <div id="tab-vacc" class="tab-content hidden"></div>
      <div id="tab-meds" class="tab-content hidden"></div>
      <div id="tab-medical" class="tab-content hidden"></div>
      <div id="tab-weight" class="tab-content hidden"></div>
      <div id="tab-timeline" class="tab-content hidden"></div>
      <div id="tab-expenses" class="tab-content hidden"></div>
    </div>
  </div>
</div>

<!-- Modals -->
<div id="modal-root"></div>
<div id="toast-root"></div>

<script>
const API = '';
let TOKEN = localStorage.getItem('token');
let USER = JSON.parse(localStorage.getItem('user') || 'null');
let CURRENT_CAT = null;

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (TOKEN) headers.Authorization = 'Bearer ' + TOKEN;
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  document.getElementById('toast-root').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function authMsg(text, type) {
  const el = document.getElementById('auth-msg');
  el.textContent = text; el.className = 'auth-msg show ' + type;
}

async function handleGoogleCredential(response) {
  authMsg('กำลังเข้าสู่ระบบด้วย Google...', 'success');
  try {
    const r = await api('/api/auth/google', { method: 'POST', body: JSON.stringify({ idToken: response.credential }) });
    TOKEN = r.data.token; USER = r.data.user;
    localStorage.setItem('token', TOKEN); localStorage.setItem('user', JSON.stringify(USER));
    showApp();
  } catch (err) { authMsg('Google login ล้มเหลว: ' + err.message, 'error'); }
}

let GOOGLE_CLIENT_ID = '';

function detectInAppBrowser() {
  const ua = navigator.userAgent || '';
  const patterns = [
    { name: 'LINE', regex: /\\bLine\\//i },
    { name: 'Facebook', regex: /\\bFBAN|FBAV\\b/i },
    { name: 'Instagram', regex: /\\bInstagram\\b/i },
    { name: 'Messenger', regex: /\\bMessenger\\b/i },
    { name: 'TikTok', regex: /\\bMusical_ly|Bytedance\\b/i },
    { name: 'WeChat', regex: /\\bMicroMessenger\\b/i },
  ];
  for (const p of patterns) if (p.regex.test(ua)) return p.name;
  return null;
}

function showInAppBrowserWarning(browserName) {
  const wrap = document.querySelector('.gbtn-wrap');
  if (!wrap) return;
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const browserHint = isIos ? 'Safari' : 'Chrome';
  wrap.innerHTML = \`
    <div style="background:#fef5e7;border:1px solid #f6ad55;border-radius:10px;padding:1rem;text-align:left;width:100%">
      <div style="font-weight:700;color:#7c4a02;margin-bottom:.5rem;font-size:.95rem">⚠️ Google บล็อก in-app browser</div>
      <div style="font-size:.85rem;color:#7c4a02;line-height:1.6">
        คุณเปิดผ่าน <b>\${browserName}</b> ซึ่ง Google ไม่อนุญาตให้ login<br><br>
        <b>วิธีแก้:</b><br>
        แตะปุ่ม "⋮" (3 จุด) ด้านบน → เลือก <b>"เปิดในเบราว์เซอร์"</b> (Open in browser) เพื่อเปิดในแอป \${browserHint}
        <br><br>
        หรือคัดลอกลิงก์ <code style="background:#fed7aa;padding:.1rem .3rem;border-radius:4px">cat-care.ilikeit.info</code> ไปวางในแอป \${browserHint}
      </div>
    </div>
  \`;
}

async function initGoogleSignIn() {
  try {
    // Check for in-app browsers first (LINE, Facebook, etc. block Google login)
    const inApp = detectInAppBrowser();
    if (inApp) {
      showInAppBrowserWarning(inApp);
      return;
    }

    const cfg = await (await fetch('/api/config')).json();
    GOOGLE_CLIENT_ID = cfg.googleClientId;

    if (!GOOGLE_CLIENT_ID) {
      document.querySelector('.gbtn-wrap').innerHTML = '<div style="font-size:.8rem;color:#a0aec0;text-align:center">⚠️ ยังไม่ได้ตั้งค่า Google Sign-In</div>';
      return;
    }

    if (!window.google?.accounts?.id) {
      document.querySelector('.gbtn-wrap').innerHTML = '<div style="font-size:.85rem;color:#f56565;text-align:center;padding:.8rem;background:#fed7d7;border-radius:8px">⚠️ โหลด Google ไม่สำเร็จ<br>ลองเปลี่ยน WiFi/4G แล้วรีเฟรชใหม่</div>';
      return;
    }

    window.handleGoogleCredential = handleGoogleCredential;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
    });

    const container = document.getElementById('g_id_signin');
    const parentWidth = container?.parentElement?.clientWidth || 300;
    const btnWidth = Math.max(240, Math.min(parentWidth - 10, 360));

    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: btnWidth,
    });

    // Diagnostic: shown only if button hasn't rendered children after 2s
    setTimeout(() => {
      const btnEl = document.getElementById('g_id_signin');
      if (btnEl && btnEl.children.length === 0) {
        const wrap = document.querySelector('.gbtn-wrap');
        if (wrap && !document.getElementById('g-help')) {
          const help = document.createElement('div');
          help.id = 'g-help';
          help.style.cssText = 'margin-top:.7rem;padding:.7rem;background:#fef5e7;border-radius:8px;font-size:.8rem;color:#7c4a02;line-height:1.5';
          help.innerHTML = '⚠️ ปุ่ม Google ไม่ขึ้น — สาเหตุที่พบบ่อย:<br>• Third-party cookies ถูกปิด<br>• Ad-blocker ปิดกั้น<br>• โดเมนยังไม่ propagate ใน Google Console (รอ 5-60 นาที)';
          wrap.appendChild(help);
        }
      }
    }, 2500);
  } catch (err) {
    console.error('Google init failed', err);
    const el = document.querySelector('.gbtn-wrap');
    if (el) el.innerHTML = '<div style="font-size:.85rem;color:#f56565;text-align:center;padding:.8rem;background:#fed7d7;border-radius:8px">⚠️ โหลด Google ไม่สำเร็จ: ' + escapeHtml(err.message) + '</div>';
  }
}

let __gResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(__gResizeTimer);
  __gResizeTimer = setTimeout(() => {
    if (!TOKEN && window.google?.accounts && document.getElementById('g_id_signin')) {
      document.getElementById('g_id_signin').innerHTML = '';
      const manual = document.getElementById('g-manual');
      if (manual) manual.remove();
      initGoogleSignIn();
    }
  }, 300);
});

function logout() {
  TOKEN = null; USER = null;
  localStorage.removeItem('token'); localStorage.removeItem('user');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app-screen').classList.add('hidden');
}

// ─── Notifications ───────────────────────────────────────────────────────────

let NOTIF_OPEN = false;

async function loadNotifications() {
  try {
    const r = await api('/api/notifications');
    const { notifications, unreadCount } = r.data;
    const badge = document.getElementById('bell-badge');
    if (unreadCount > 0) { badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount); badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
    if (NOTIF_OPEN) renderNotifPanel(notifications);
    return notifications;
  } catch { return []; }
}

function toggleNotifPanel() {
  NOTIF_OPEN = !NOTIF_OPEN;
  const panel = document.getElementById('notif-panel');
  if (NOTIF_OPEN) {
    panel.classList.remove('hidden');
    loadNotifications().then(n => renderNotifPanel(n));
    markAllNotifRead();
  } else {
    panel.classList.add('hidden');
  }
}

async function markAllNotifRead() {
  try { await api('/api/notifications/read-all', { method: 'POST' }); loadNotifications(); } catch {}
}

function renderNotifPanel(notifications) {
  const panel = document.getElementById('notif-panel');
  const typeIcon = { vaccine: '💉', medication: '💊', checkup: '🏥', diet: '🍽️', reminder: '🔔' };
  const items = notifications.length === 0
    ? '<div class="notif-empty">ไม่มีการแจ้งเตือน</div>'
    : notifications.map(n => \`
        <div class="notif-item\${n.isRead ? '' : ' unread'}">
          <div class="notif-item-title">\${typeIcon[n.type] || '🔔'} \${escapeHtml(n.title)}</div>
          <div class="notif-item-msg">\${escapeHtml(n.message)}</div>
          <div class="notif-item-time">\${timeAgo(n.createdAt)}</div>
        </div>
      \`).join('');
  panel.innerHTML = \`
    <div class="notif-panel-head">
      <span>🔔 การแจ้งเตือน</span>
      <button onclick="toggleNotifPanel()" style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:#a0aec0">✕</button>
    </div>
    \${items}
  \`;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'เมื่อกี้';
  if (m < 60) return m + ' นาทีที่แล้ว';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' ชั่วโมงที่แล้ว';
  return Math.floor(h / 24) + ' วันที่แล้ว';
}

document.addEventListener('click', (e) => {
  if (NOTIF_OPEN && !e.target.closest('.notif-wrap')) {
    NOTIF_OPEN = false;
    document.getElementById('notif-panel')?.classList.add('hidden');
  }
});

// ─── Google Calendar URL ──────────────────────────────────────────────────────

function buildGCalUrl(title, dateStr, details) {
  const d = dateStr.replace(/-/g, '');
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(title)
    + '&dates=' + d + '/' + d
    + '&details=' + encodeURIComponent(details);
}

// ─── LINE Settings ────────────────────────────────────────────────────────────

function infoModal(title, bodyHtml) {
  document.getElementById('modal-root').innerHTML = \`
    <div class="modal-bg" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">\${title}</div>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div id="info-modal-body">\${bodyHtml}</div>
      </div>
    </div>
  \`;
}

async function openLineSettings() {
  infoModal('⚙️ ตั้งค่า LINE Notification', '<div style="text-align:center;padding:1.5rem;color:#a0aec0">กำลังตรวจสอบ...</div>');
  try {
    const r = await api('/api/auth/line/status');
    renderLineSettingsContent(r.data.connected, r.data.lineUserId);
  } catch (err) { toast(err.message, 'error'); }
}

function renderLineSettingsContent(connected, lineUserId) {
  const el = document.getElementById('info-modal-body');
  if (!el) return;

  const maskId = (id) => id ? id.slice(0, 4) + '••••••••••••••••••••••••••••••' + id.slice(-4) : '';

  const connectedBlock = connected ? \`
    <div style="background:#f0fff4;border-radius:10px;padding:.9rem 1rem;margin-bottom:1rem;display:flex;align-items:center;gap:.8rem">
      <span style="font-size:1.4rem">✅</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;color:#22543d;font-size:.9rem">เชื่อมต่อ LINE แล้ว</div>
        <div style="font-size:.75rem;color:#718096;margin-top:.1rem;word-break:break-all">\${maskId(lineUserId)}</div>
      </div>
      <button class="btn btn-sm" onclick="sendLineTest()" style="white-space:nowrap">📨 ทดสอบ</button>
    </div>
    <div id="line-test-result" style="margin-bottom:.8rem"></div>
  \` : '';

  el.innerHTML = \`
    \${connectedBlock}

    <div style="background:#f7fafc;border-radius:10px;padding:1rem;margin-bottom:1rem">
      <div style="font-weight:700;font-size:.85rem;color:#4a5568;margin-bottom:.7rem">
        \${connected ? '🔄 เปลี่ยน LINE User ID' : '🔗 กรอก LINE User ID'}
      </div>
      <div style="font-size:.8rem;color:#718096;margin-bottom:.7rem;line-height:1.6">
        วิธีหา LINE User ID:<br>
        1. เพิ่ม LINE Bot เป็นเพื่อน → Bot จะส่ง User ID ให้ทันที<br>
        2. หรือส่ง <code style="background:#e2e8f0;padding:.1rem .3rem;border-radius:4px">/myid</code> ใน LINE Bot
      </div>
      <div style="display:flex;gap:.5rem">
        <input id="line-uuid-input" placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style="flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:.65rem .8rem;font-size:.82rem;font-family:monospace" maxlength="33">
        <button class="btn btn-sm" onclick="saveLineUuid()" id="save-uuid-btn">💾 บันทึก</button>
      </div>
      <div id="line-uuid-error" style="color:#e53e3e;font-size:.78rem;margin-top:.4rem"></div>
    </div>

    <details style="margin-bottom:1rem">
      <summary style="font-size:.82rem;color:#718096;cursor:pointer;padding:.3rem 0">📋 คำสั่ง LINE Bot ที่ใช้ได้</summary>
      <div style="background:#f7fafc;border-radius:8px;padding:.8rem;margin-top:.5rem;font-size:.82rem;color:#4a5568;line-height:1.8">
        /myid — แสดง LINE User ID<br>
        /my_cats — รายชื่อแมว<br>
        /vaccines_due — วัคซีนใกล้หมดอายุ<br>
        /medications — ยาที่ต้องให้<br>
        /help — คำสั่งทั้งหมด
      </div>
    </details>

    \${connected ? '<button class="btn btn-secondary btn-block" style="font-size:.82rem;color:#e53e3e;border-color:#e53e3e" onclick="disconnectLine()">🗑 ยกเลิกการเชื่อมต่อ LINE</button>' : ''}
  \`;
}

async function saveLineUuid() {
  const input = document.getElementById('line-uuid-input');
  const errEl = document.getElementById('line-uuid-error');
  const btn = document.getElementById('save-uuid-btn');
  const val = input.value.trim();
  errEl.textContent = '';
  if (!val) { errEl.textContent = 'กรุณากรอก LINE User ID'; return; }
  if (!/^U[0-9a-fA-F]{32}$/.test(val)) { errEl.textContent = 'รูปแบบไม่ถูกต้อง (ต้องเป็น U + 32 ตัวอักษร เช่น Uabc123...)'; return; }
  btn.disabled = true; btn.textContent = 'กำลังบันทึก...';
  try {
    await api('/api/auth/line/connect-uuid', { method: 'POST', body: JSON.stringify({ lineUserId: val }) });
    toast('บันทึก LINE User ID สำเร็จ');
    renderLineSettingsContent(true, val);
  } catch (err) { errEl.textContent = err.message; }
  finally { btn.disabled = false; btn.textContent = '💾 บันทึก'; }
}

async function sendLineTest() {
  const resultEl = document.getElementById('line-test-result');
  if (resultEl) resultEl.innerHTML = '<div style="font-size:.82rem;color:#718096;padding:.3rem 0">กำลังส่ง...</div>';
  try {
    await api('/api/auth/line/test', { method: 'POST' });
    if (resultEl) resultEl.innerHTML = '<div style="background:#c6f6d5;border-radius:8px;padding:.5rem .8rem;font-size:.82rem;color:#22543d">✅ ส่งข้อความทดสอบสำเร็จ — เช็ค LINE ของคุณ</div>';
  } catch (err) {
    if (resultEl) resultEl.innerHTML = \`<div style="background:#fed7d7;border-radius:8px;padding:.5rem .8rem;font-size:.82rem;color:#742a2a">❌ \${escapeHtml(err.message)}</div>\`;
  }
}

async function generateLineCode() {
  const btn = document.getElementById('gen-code-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'กำลังสร้าง...'; }
  try {
    const r = await api('/api/auth/line/generate-code', { method: 'POST' });
    const code = r.data.code;
    const el = document.getElementById('line-code-result');
    if (el) el.innerHTML = \`
      <div style="text-align:center;background:#f7fafc;border-radius:10px;padding:1.2rem">
        <div style="font-size:.8rem;color:#718096;margin-bottom:.5rem">ส่งโค้ดนี้ให้ LINE Bot ภายใน 10 นาที</div>
        <div style="font-size:2.5rem;font-weight:800;letter-spacing:.4rem;color:#2d3748;background:white;padding:.8rem 1.5rem;border-radius:8px;border:2px dashed #667eea;display:inline-block">\${code}</div>
        <div style="margin-top:.8rem">
          <button class="btn btn-sm" onclick="navigator.clipboard.writeText('\${code}').then(()=>toast('คัดลอกแล้ว'))">📋 คัดลอกโค้ด</button>
        </div>
        <div style="font-size:.75rem;color:#a0aec0;margin-top:.6rem">โค้ดจะหมดอายุใน 10 นาที</div>
      </div>
    \`;
  } catch (err) { toast(err.message, 'error'); }
  finally { if (btn) { btn.disabled = false; btn.textContent = 'สร้างโค้ดใหม่'; } }
}

async function disconnectLine() {
  if (!confirm('ยืนยันยกเลิกการเชื่อมต่อ LINE?')) return;
  try {
    await api('/api/auth/line/disconnect', { method: 'DELETE' });
    toast('ยกเลิกการเชื่อมต่อ LINE แล้ว');
    closeModal();
  } catch (err) { toast(err.message, 'error'); }
}

// ─── Share Link ───────────────────────────────────────────────────────────────

async function openShareModal() {
  infoModal('🔗 แชร์ประวัติแมวให้หมอ', '<div style="text-align:center;padding:1.5rem;color:#a0aec0">กำลังตรวจสอบ...</div>');
  try {
    const r = await api('/api/cats/' + CURRENT_CAT.id + '/share');
    renderShareModalContent(r.data.active, r.data.url);
  } catch (err) { toast(err.message, 'error'); }
}

function buildLineShareMessage(url) {
  const c = CURRENT_CAT;
  const genderLabel = c.gender === 'F' ? '♀ เพศเมีย' : c.gender === 'M' ? '♂ เพศผู้' : '';
  const statusLabel = { normal: '✅ ปกติ', treating: '🏥 กำลังรักษา', caution: '⚠️ ควรระวัง' }[c.healthStatus] || c.healthStatus;

  let msg = '🐱 ประวัติสุขภาพแมว\n';
  msg += '━━━━━━━━━━━━━━━\n';
  msg += '📋 ' + c.name + '\n';
  if (genderLabel) msg += genderLabel;
  if (c.breed) msg += (genderLabel ? ' · ' : '') + c.breed;
  if (genderLabel || c.breed) msg += '\n';
  if (c.dateOfBirth) {
    const months = Math.floor((Date.now() - new Date(c.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const y = Math.floor(months / 12); const m = months % 12;
    msg += '🎂 อายุ ' + (y > 0 ? y + ' ปี ' : '') + (m > 0 ? m + ' เดือน' : '') + '\n';
  }
  if (c.weightKg) msg += '⚖️ น้ำหนัก ' + c.weightKg + ' kg\n';
  msg += '💊 สถานะ ' + statusLabel + '\n';
  if (c.drugAllergies) msg += '━━━━━━━━━━━━━━━\n⚠️ แพ้ยา: ' + c.drugAllergies + '\n';
  if (c.chronicDiseases) msg += '🏥 โรคประจำตัว: ' + c.chronicDiseases + '\n';
  if (c.forbiddenFoods) msg += '🚫 อาหารที่ห้าม: ' + c.forbiddenFoods + '\n';
  msg += '━━━━━━━━━━━━━━━\n';
  msg += '🔗 ดูประวัติเต็ม:\n' + url;
  return msg;
}

function renderShareModalContent(active, url) {
  const el = document.getElementById('info-modal-body');
  if (!el) return;
  if (active && url) {
    const msg = buildLineShareMessage(url);
    window.__pendingShareMsg = msg;
    const lineUrl = 'https://line.me/R/msg/text/' + encodeURIComponent(msg);
    el.innerHTML = \`
      <div style="background:#f0fff4;border-radius:10px;padding:.8rem 1rem;margin-bottom:1rem;display:flex;align-items:center;gap:.7rem">
        <span style="font-size:1.3rem">✅</span>
        <div>
          <div style="font-weight:700;color:#22543d;font-size:.9rem">Link พร้อมแชร์แล้ว</div>
          <div style="font-size:.75rem;color:#276749">หมอเปิดดูได้โดยไม่ต้อง Login</div>
        </div>
      </div>

      <div style="margin-bottom:1rem">
        <div style="font-size:.78rem;font-weight:600;color:#4a5568;margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.04em">ตัวอย่างข้อความที่จะส่ง</div>
        <div style="background:#f7fafc;border-radius:8px;padding:.8rem 1rem;font-size:.8rem;color:#2d3748;white-space:pre-line;line-height:1.7;border:1px solid #e2e8f0;max-height:180px;overflow-y:auto">\${escapeHtml(msg)}</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:.55rem">
        <a class="btn btn-block" href="\${escapeHtml(lineUrl)}" target="_blank" style="background:#06C755;text-align:center;text-decoration:none;display:block;padding:.75rem 1.5rem;border-radius:8px;color:white;font-weight:600;font-size:1rem">
          📱 ส่งหาหมอผ่าน LINE
        </a>
        <button class="btn btn-block btn-secondary" onclick="copyPendingShareMsg()">📋 คัดลอกข้อความ</button>
        <button class="btn btn-block" onclick="openSharePage('\${escapeHtml(url)}')" style="background:#4299e1">🌐 เปิดหน้าข้อมูล</button>
        <button class="btn btn-secondary btn-block btn-sm" style="color:#e53e3e;border-color:#e53e3e;margin-top:.2rem" onclick="revokeShareLink()">🗑 ยกเลิก Link นี้</button>
      </div>
    \`;
  } else {
    el.innerHTML = \`
      <div style="background:#ebf8ff;border-radius:10px;padding:1rem;margin-bottom:1rem">
        <div style="font-size:.9rem;color:#2b6cb0;font-weight:600;margin-bottom:.4rem">📋 ข้อมูลที่หมอจะเห็น:</div>
        <div style="font-size:.82rem;color:#4a5568;line-height:1.7">
          ✅ ข้อมูลพื้นฐาน (ชื่อ เพศ สายพันธุ์ น้ำหนัก)<br>
          ✅ ประวัติวัคซีน (วันหมดอายุ)<br>
          ✅ ยาที่กำลังได้รับ<br>
          ✅ ประวัติการรักษา<br>
          ✅ โรคประจำตัว / แพ้ยา / อาหารต้องห้าม
        </div>
      </div>
      <button class="btn btn-block" onclick="generateShareLink()" id="gen-share-btn">🔗 สร้าง Share Link</button>
    \`;
  }
}

function copyPendingShareMsg() {
  const msg = window.__pendingShareMsg || '';
  navigator.clipboard.writeText(msg).then(() => toast('คัดลอกข้อความแล้ว'));
}

async function generateShareLink() {
  const btn = document.getElementById('gen-share-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'กำลังสร้าง...'; }
  try {
    const r = await api('/api/cats/' + CURRENT_CAT.id + '/share', { method: 'POST' });
    renderShareModalContent(true, r.data.url);
    toast('สร้าง Share Link สำเร็จ');
  } catch (err) { toast(err.message, 'error'); if (btn) { btn.disabled = false; btn.textContent = '🔗 สร้าง Share Link'; } }
}

async function revokeShareLink() {
  if (!confirm('ยืนยันยกเลิก Link? หมอจะเข้าถึงข้อมูลไม่ได้อีก')) return;
  try {
    await api('/api/cats/' + CURRENT_CAT.id + '/share', { method: 'DELETE' });
    renderShareModalContent(false, null);
    toast('ยกเลิก Link แล้ว');
  } catch (err) { toast(err.message, 'error'); }
}

function copyShareLink(url) {
  navigator.clipboard.writeText(url).then(() => toast('คัดลอก Link แล้ว'));
}

function openSharePage(url) {
  window.open(url, '_blank');
}

async function showApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  const firstName = USER.name.split(' ')[0];
  document.getElementById('user-name').textContent = '👋 ' + firstName;
  await loadDashboard();
  await loadCats();
  loadNotifications();
  setInterval(loadNotifications, 60000);
}

async function loadDashboard() {
  try {
    const r = await api('/api/dashboard');
    const s = r.data.summary;
    document.getElementById('summary').innerHTML = \`
      <div class="stat"><div class="stat-icon">🐈</div><div class="stat-label">แมวทั้งหมด</div><div class="stat-value">\${s.totalCats}</div></div>
      <div class="stat"><div class="stat-icon">🏥</div><div class="stat-label">กำลังรักษา</div><div class="stat-value">\${s.catsInTreatment}</div></div>
      <div class="stat"><div class="stat-icon">💉</div><div class="stat-label">วัคซีนใกล้หมดอายุ</div><div class="stat-value">\${s.vaccinesExpiringSoon}</div></div>
      <div class="stat"><div class="stat-icon">💊</div><div class="stat-label">ยาที่กำลังให้</div><div class="stat-value">\${s.activeMedications}</div></div>
    \`;
  } catch (err) {
    if (err.message.includes('Unauthorized')) logout();
    else toast(err.message, 'error');
  }
}

async function loadCats() {
  try {
    const r = await api('/api/cats');
    const cats = r.data.cats;
    const container = document.getElementById('cats-container');
    if (cats.length === 0) {
      container.innerHTML = '<div class="empty"><div class="empty-icon">🐾</div><p>ยังไม่มีข้อมูลแมว เริ่มเพิ่มแมวตัวแรกของคุณ</p></div>';
      return;
    }
    container.innerHTML = '<div class="cats-grid">' + cats.map(c => \`
      <div class="cat-card" onclick="openCatDetail('\${c.id}')">
        <div class="cat-avatar">\${c.photoUrl ? '<img src="' + escapeHtml(c.photoUrl) + '" alt="">' : (c.gender === 'F' ? '🐱' : '😺')}</div>
        <div class="cat-name">\${escapeHtml(c.name)}</div>
        <div class="cat-meta">\${c.breed || '-'} · \${c.weightKg ? c.weightKg + ' kg' : ''}</div>
        <span class="cat-badge badge-\${c.healthStatus}">\${healthLabel(c.healthStatus)}</span>
      </div>
    \`).join('') + '</div>';
  } catch (err) { toast(err.message, 'error'); }
}

function healthLabel(s) {
  return { normal: '✓ ปกติ', treating: '⚠ กำลังรักษา', caution: '! ควรระวัง' }[s] || s;
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

async function openCatDetail(catId) {
  try {
    const r = await api('/api/cats/' + catId);
    CURRENT_CAT = r.data;
    document.getElementById('detail-name').textContent = CURRENT_CAT.name;
    document.getElementById('cat-detail').classList.remove('hidden');
    document.getElementById('cat-detail').scrollIntoView({ behavior: 'smooth' });
    renderInfoTab();
    switchDetailTab('info');
  } catch (err) { toast(err.message, 'error'); }
}

function closeDetail() {
  CURRENT_CAT = null;
  document.getElementById('cat-detail').classList.add('hidden');
}

function switchDetailTab(tab) {
  document.querySelectorAll('#cat-detail .tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  ['info', 'vacc', 'meds', 'medical', 'weight', 'timeline', 'expenses'].forEach(t => document.getElementById('tab-' + t).classList.toggle('hidden', t !== tab));
  if (tab === 'vacc') loadVaccinations();
  if (tab === 'meds') loadMedications();
  if (tab === 'medical') loadMedicalHistory();
  if (tab === 'weight') loadWeightHistory();
  if (tab === 'timeline') loadTimeline();
  if (tab === 'expenses') loadExpenses();
}

const EXPENSE_CATEGORIES = {
  medical: { label: 'รักษาพยาบาล', icon: '🏥', color: '#f56565' },
  vaccine: { label: 'วัคซีน', icon: '💉', color: '#48bb78' },
  medication: { label: 'ยา', icon: '💊', color: '#4299e1' },
  food: { label: 'อาหาร', icon: '🍽️', color: '#ed8936' },
  accessories: { label: 'อุปกรณ์', icon: '🎀', color: '#9f7aea' },
  grooming: { label: 'ดูแลขน/อาบน้ำ', icon: '✂️', color: '#38b2ac' },
  insurance: { label: 'ประกัน', icon: '🛡️', color: '#667eea' },
  other: { label: 'อื่นๆ', icon: '📦', color: '#a0aec0' },
};

async function loadExpenses() {
  const el = document.getElementById('tab-expenses');
  el.innerHTML = '<div class="empty">กำลังโหลด...</div>';
  try {
    const r = await api('/api/cats/' + CURRENT_CAT.id + '/expenses');
    renderExpenses(r.data.expenses);
  } catch (err) { toast(err.message, 'error'); }
}

function formatBaht(n) {
  return '฿' + n.toLocaleString('th-TH', { maximumFractionDigits: 2 });
}

function renderExpenses(expenses) {
  const el = document.getElementById('tab-expenses');

  const addBtn = '<div style="margin-bottom:1rem"><button class="btn btn-sm" onclick="openExpenseModal()">+ เพิ่มค่าใช้จ่าย</button></div>';

  if (expenses.length === 0) {
    el.innerHTML = addBtn + '<div class="empty"><div class="empty-icon">💰</div><p>ยังไม่มีบันทึกค่าใช้จ่าย</p></div>';
    return;
  }

  const now = new Date();
  const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const thisYear = String(now.getFullYear());

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const monthTotal = expenses.filter(e => e.expenseDate.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);
  const yearTotal = expenses.filter(e => e.expenseDate.startsWith(thisYear)).reduce((s, e) => s + e.amount, 0);

  // Monthly breakdown (last 6 months)
  const monthlyMap = new Map();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    monthlyMap.set(key, { label: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][d.getMonth()], total: 0 });
  }
  for (const e of expenses) {
    const key = e.expenseDate.slice(0, 7);
    if (monthlyMap.has(key)) monthlyMap.get(key).total += e.amount;
  }
  const maxMonth = Math.max(...[...monthlyMap.values()].map(m => m.total), 1);

  const categoryMap = new Map();
  for (const e of expenses) {
    if (!categoryMap.has(e.category)) categoryMap.set(e.category, { count: 0, total: 0 });
    const c = categoryMap.get(e.category);
    c.count++; c.total += e.amount;
  }
  const sortedCats = [...categoryMap.entries()].sort((a, b) => b[1].total - a[1].total);

  let html = addBtn;

  html += \`
    <div class="exp-summary">
      <div class="exp-stat"><div class="exp-stat-label">เดือนนี้</div><div class="exp-stat-value">\${formatBaht(monthTotal)}</div></div>
      <div class="exp-stat"><div class="exp-stat-label">ปีนี้</div><div class="exp-stat-value">\${formatBaht(yearTotal)}</div></div>
      <div class="exp-stat"><div class="exp-stat-label">รวมทั้งหมด</div><div class="exp-stat-value">\${formatBaht(total)}</div></div>
    </div>
  \`;

  html += '<div class="exp-bar-chart"><div class="chart-title">📊 ค่าใช้จ่าย 6 เดือนล่าสุด</div><div class="exp-bars">';
  for (const m of monthlyMap.values()) {
    const h = m.total > 0 ? Math.max((m.total / maxMonth) * 100, 4) : 2;
    html += \`
      <div class="exp-bar-col">
        <div class="exp-bar-val">\${m.total > 0 ? Math.round(m.total).toLocaleString() : ''}</div>
        <div class="exp-bar" style="height:\${h}%" title="\${m.label}: \${formatBaht(m.total)}"></div>
        <div class="exp-bar-month">\${m.label}</div>
      </div>
    \`;
  }
  html += '</div></div>';

  html += '<div class="chart-title">📋 แยกตามหมวด</div><div class="exp-cat-grid">';
  for (const [cat, { count, total: t }] of sortedCats) {
    const info = EXPENSE_CATEGORIES[cat] || EXPENSE_CATEGORIES.other;
    html += \`
      <div class="exp-cat" style="border-left-color:\${info.color}">
        <div class="exp-cat-info">
          <div class="exp-cat-label">\${info.icon} \${info.label}</div>
          <div class="exp-cat-count">\${count} รายการ</div>
        </div>
        <div class="exp-cat-amount">\${formatBaht(t)}</div>
      </div>
    \`;
  }
  html += '</div>';

  html += '<div class="chart-title">📋 ประวัติทั้งหมด (' + expenses.length + ' รายการ)</div>';
  for (const e of expenses) {
    const info = EXPENSE_CATEGORIES[e.category] || EXPENSE_CATEGORIES.other;
    html += \`
      <div class="exp-item" style="border-left-color:\${info.color}">
        <div class="exp-item-info">
          <div class="exp-item-title">
            \${info.icon}
            <span class="exp-item-cat" style="background:\${info.color}22;color:\${info.color}">\${info.label}</span>
            \${e.source === 'medical' ? '<span class="exp-source-medical">จากประวัติรักษา</span>' : ''}
          </div>
          \${e.description ? '<div class="exp-item-desc">' + escapeHtml(e.description) + '</div>' : ''}
          <div class="exp-item-date">\${formatDate(e.expenseDate)}</div>
        </div>
        <div style="display:flex;align-items:center">
          <div class="exp-item-amount">\${formatBaht(e.amount)}</div>
          \${e.source === 'manual' ? '<button class="del" onclick="deleteExpense(\\'' + e.id + '\\')">🗑</button>' : ''}
        </div>
      </div>
    \`;
  }

  el.innerHTML = html;
}

function openExpenseModal() {
  const today = new Date().toISOString().slice(0, 10);
  const opts = Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => '<option value="' + k + '">' + v.icon + ' ' + v.label + '</option>').join('');
  modal('💰 เพิ่มค่าใช้จ่าย', \`
    <div class="field"><label>หมวด *</label><select name="category" required>\${opts}</select></div>
    <div class="field"><label>จำนวนเงิน (บาท) *</label><input type="number" step="0.01" name="amount" required autofocus placeholder="0.00"></div>
    <div class="field"><label>วันที่ *</label><input type="date" name="expenseDate" required value="\${today}"></div>
    <div class="field"><label>รายละเอียด</label><input name="description" placeholder="เช่น Royal Canin 2 kg, ทำเล็บ"></div>
  \`, async (f) => {
    const body = {
      amount: parseFloat(f.get('amount')),
      category: f.get('category'),
      expenseDate: f.get('expenseDate'),
    };
    if (f.get('description')) body.description = f.get('description');
    await api('/api/cats/' + CURRENT_CAT.id + '/expenses', { method: 'POST', body: JSON.stringify(body) });
    toast('บันทึกค่าใช้จ่ายสำเร็จ');
    loadExpenses();
  });
}

async function deleteExpense(id) {
  if (!confirm('ลบรายการนี้?')) return;
  try {
    await api('/api/cats/' + CURRENT_CAT.id + '/expenses/' + id, { method: 'DELETE' });
    toast('ลบสำเร็จ');
    loadExpenses();
  } catch (err) { toast(err.message, 'error'); }
}

let TIMELINE_EVENTS = [];
let TIMELINE_FILTER = 'all';

async function loadTimeline() {
  const el = document.getElementById('tab-timeline');
  el.innerHTML = '<div class="empty">กำลังโหลด...</div>';
  try {
    const r = await api('/api/cats/' + CURRENT_CAT.id + '/timeline');
    TIMELINE_EVENTS = r.data.events;
    renderTimeline();
  } catch (err) { toast(err.message, 'error'); }
}

function renderTimeline() {
  const el = document.getElementById('tab-timeline');
  const events = TIMELINE_EVENTS;

  const counts = {
    all: events.length,
    vaccine: events.filter(e => e.type === 'vaccine').length,
    medication: events.filter(e => e.type === 'medication').length,
    medical: events.filter(e => e.type === 'medical').length,
    weight: events.filter(e => e.type === 'weight').length,
  };

  const filters = \`
    <div class="tl-filters">
      <button class="tl-filter \${TIMELINE_FILTER === 'all' ? 'active' : ''}" onclick="filterTimeline('all')">ทั้งหมด<span class="count">\${counts.all}</span></button>
      <button class="tl-filter \${TIMELINE_FILTER === 'vaccine' ? 'active' : ''}" onclick="filterTimeline('vaccine')">💉 วัคซีน<span class="count">\${counts.vaccine}</span></button>
      <button class="tl-filter \${TIMELINE_FILTER === 'medication' ? 'active' : ''}" onclick="filterTimeline('medication')">💊 ยา<span class="count">\${counts.medication}</span></button>
      <button class="tl-filter \${TIMELINE_FILTER === 'medical' ? 'active' : ''}" onclick="filterTimeline('medical')">🏥 ป่วย<span class="count">\${counts.medical}</span></button>
      <button class="tl-filter \${TIMELINE_FILTER === 'weight' ? 'active' : ''}" onclick="filterTimeline('weight')">⚖️ น้ำหนัก<span class="count">\${counts.weight}</span></button>
    </div>
  \`;

  const filtered = TIMELINE_FILTER === 'all' ? events : events.filter(e => e.type === TIMELINE_FILTER);

  if (filtered.length === 0) {
    el.innerHTML = filters + '<div class="empty"><div class="empty-icon">📅</div><p>ยังไม่มีเหตุการณ์ในไทม์ไลน์</p></div>';
    return;
  }

  const icons = { vaccine: '💉', medication: '💊', medical: '🏥', weight: '⚖️' };
  const monthLabels = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  const groups = new Map();
  for (const ev of filtered) {
    const d = new Date(ev.date);
    const key = d.getFullYear() + '-' + String(d.getMonth()).padStart(2, '0');
    const label = monthLabels[d.getMonth()] + ' ' + (d.getFullYear() + 543);
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key).items.push(ev);
  }

  let html = filters;
  for (const { label, items } of groups.values()) {
    html += '<div class="tl-month">' + label + '</div><div class="timeline">';
    for (const ev of items) {
      html += \`
        <div class="tl-item t-\${ev.type}" data-icon="\${icons[ev.type] || '•'}">
          <div class="tl-card">
            <div class="tl-date">\${formatDate(ev.date)}</div>
            <div class="tl-title">\${escapeHtml(ev.title)}</div>
            \${ev.description ? '<div class="tl-desc">' + escapeHtml(ev.description) + '</div>' : ''}
          </div>
        </div>
      \`;
    }
    html += '</div>';
  }

  el.innerHTML = html;
}

function filterTimeline(type) {
  TIMELINE_FILTER = type;
  renderTimeline();
}

function formatDate(iso) {
  const d = new Date(iso);
  const days = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + (d.getFullYear() + 543);
}

function renderInfoTab() {
  const c = CURRENT_CAT;
  document.getElementById('tab-info').innerHTML = \`
    <div class="cat-photo-large" onclick="document.getElementById('photo-input').click()">
      \${c.photoUrl ? '<img src="' + escapeHtml(c.photoUrl) + '" alt="">' : (c.gender === 'F' ? '🐱' : '😺')}
      <div class="upload-overlay">📷 เปลี่ยนรูป</div>
    </div>
    <input type="file" id="photo-input" accept="image/*" style="display:none" onchange="uploadPhoto(this)">
    <div class="records-list">
      <div class="record"><div class="record-title">เพศ</div><div class="record-meta">\${c.gender === 'F' ? 'เพศเมีย' : c.gender === 'M' ? 'เพศผู้' : '-'}</div></div>
      <div class="record"><div class="record-title">สายพันธุ์</div><div class="record-meta">\${c.breed || '-'}</div></div>
      <div class="record"><div class="record-title">วันเกิด</div><div class="record-meta">\${c.dateOfBirth || '-'}</div></div>
      <div class="record"><div class="record-title">น้ำหนัก</div><div class="record-meta">\${c.weightKg ? c.weightKg + ' kg' : '-'}</div></div>
      <div class="record"><div class="record-title">สถานะสุขภาพ</div><div class="record-meta">\${healthLabel(c.healthStatus)}</div></div>
    </div>
    <div style="margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap">
      <button class="btn btn-sm" onclick="openEditCatModal()">✏️ แก้ไขข้อมูล</button>
      <button class="btn btn-secondary btn-sm" onclick="openWeightModal()">⚖️ บันทึกน้ำหนัก</button>
      <button class="btn btn-secondary btn-sm" onclick="openShareModal()">🔗 แชร์หาหมอ</button>
      \${c.photoUrl ? '<button class="btn btn-secondary btn-sm" onclick="removePhoto()">🗑 ลบรูป</button>' : ''}
      <button class="btn btn-danger btn-sm" onclick="deleteCat()">🗑 ลบข้อมูลแมว</button>
    </div>
  \`;
}

function openEditCatModal() {
  const c = CURRENT_CAT;
  modal('✏️ แก้ไขข้อมูล ' + escapeHtml(c.name), \`
    <div class="field"><label>ชื่อแมว *</label><input name="name" required value="\${escapeHtml(c.name)}"></div>
    <div class="field"><label>เพศ</label><select name="gender"><option value="">-</option><option value="F" \${c.gender === 'F' ? 'selected' : ''}>เพศเมีย</option><option value="M" \${c.gender === 'M' ? 'selected' : ''}>เพศผู้</option></select></div>
    <div class="field"><label>สายพันธุ์</label><input name="breed" value="\${escapeHtml(c.breed || '')}"></div>
    <div class="field"><label>วันเกิด</label><input type="date" name="dateOfBirth" value="\${c.dateOfBirth || ''}"></div>
    <div class="field"><label>น้ำหนัก (kg)</label><input type="number" step="0.1" name="weightKg" value="\${c.weightKg || ''}"></div>
    <div class="field"><label>สถานะสุขภาพ</label><select name="healthStatus"><option value="normal" \${c.healthStatus === 'normal' ? 'selected' : ''}>ปกติ</option><option value="treating" \${c.healthStatus === 'treating' ? 'selected' : ''}>กำลังรักษา</option><option value="caution" \${c.healthStatus === 'caution' ? 'selected' : ''}>ควรระวัง</option></select></div>
    <div class="field"><label>โรคประจำตัว</label><textarea name="chronicDiseases" rows="2">\${escapeHtml(c.chronicDiseases || '')}</textarea></div>
    <div class="field"><label>แพ้ยา</label><textarea name="drugAllergies" rows="2">\${escapeHtml(c.drugAllergies || '')}</textarea></div>
    <div class="field"><label>อาหารที่ห้าม</label><textarea name="forbiddenFoods" rows="2">\${escapeHtml(c.forbiddenFoods || '')}</textarea></div>
  \`, async (f) => {
    const body = { name: f.get('name'), healthStatus: f.get('healthStatus') };
    if (f.get('gender')) body.gender = f.get('gender');
    if (f.get('breed')) body.breed = f.get('breed');
    if (f.get('dateOfBirth')) body.dateOfBirth = f.get('dateOfBirth');
    if (f.get('weightKg')) body.weightKg = parseFloat(f.get('weightKg'));
    if (f.get('chronicDiseases')) body.chronicDiseases = f.get('chronicDiseases');
    if (f.get('drugAllergies')) body.drugAllergies = f.get('drugAllergies');
    if (f.get('forbiddenFoods')) body.forbiddenFoods = f.get('forbiddenFoods');
    const r = await api('/api/cats/' + CURRENT_CAT.id, { method: 'PUT', body: JSON.stringify(body) });
    CURRENT_CAT = r.data;
    toast('บันทึกสำเร็จ');
    renderInfoTab();
    loadCats();
    loadDashboard();
  });
}

function openWeightModal() {
  const c = CURRENT_CAT;
  const today = new Date().toISOString().slice(0, 10);
  modal('⚖️ บันทึกน้ำหนัก ' + escapeHtml(c.name), \`
    <div style="text-align:center;margin-bottom:1rem;padding:1rem;background:#f7fafc;border-radius:10px">
      <div style="font-size:.85rem;color:#718096">น้ำหนักปัจจุบัน</div>
      <div style="font-size:2rem;font-weight:700;color:#2d3748">\${c.weightKg ? c.weightKg + ' kg' : 'ยังไม่มีข้อมูล'}</div>
    </div>
    <div class="field"><label>น้ำหนักใหม่ (kg) *</label><input type="number" step="0.01" name="weightKg" required placeholder="3.5" autofocus></div>
    <div class="field"><label>วันที่ชั่ง</label><input type="date" name="loggedDate" value="\${today}"></div>
    <div class="field"><label>หมายเหตุ</label><input name="notes" placeholder="เช่น หลังกินอาหาร, ก่อนผ่าตัด"></div>
  \`, async (f) => {
    const weightKg = parseFloat(f.get('weightKg'));
    if (isNaN(weightKg) || weightKg <= 0) throw new Error('น้ำหนักต้องเป็นตัวเลขมากกว่า 0');
    const body = { weightKg, loggedDate: f.get('loggedDate') || today };
    if (f.get('notes')) body.notes = f.get('notes');
    await api('/api/cats/' + CURRENT_CAT.id + '/weights', { method: 'POST', body: JSON.stringify(body) });
    CURRENT_CAT.weightKg = weightKg;
    toast('บันทึกน้ำหนักสำเร็จ (' + weightKg + ' kg)');
    renderInfoTab();
    loadCats();
  });
}

async function loadWeightHistory() {
  const el = document.getElementById('tab-weight');
  el.innerHTML = '<div style="margin-bottom:1rem"><button class="btn btn-sm" onclick="openWeightModal()">+ บันทึกน้ำหนัก</button></div><div id="weight-content"></div>';
  try {
    const r = await api('/api/cats/' + CURRENT_CAT.id + '/weights');
    const logs = r.data.logs;
    const content = document.getElementById('weight-content');
    if (logs.length === 0) {
      content.innerHTML = '<div class="empty"><div class="empty-icon">⚖️</div><p>ยังไม่มีข้อมูลน้ำหนัก คลิก "บันทึกน้ำหนัก" เพื่อเริ่มต้น</p></div>';
      return;
    }

    const weights = logs.map(l => l.weightKg);
    const current = weights[weights.length - 1];
    const first = weights[0];
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const change = current - first;
    const changePct = first > 0 ? ((change / first) * 100).toFixed(1) : 0;

    content.innerHTML = \`
      <div class="chart-wrap">
        <div class="chart-title">📊 กราฟน้ำหนัก</div>
        <div class="chart-stats">
          <div class="chart-stat"><div class="chart-stat-label">ปัจจุบัน</div><div class="chart-stat-value">\${current} kg</div></div>
          <div class="chart-stat"><div class="chart-stat-label">เปลี่ยนแปลง</div><div class="chart-stat-value \${change > 0 ? 'up' : change < 0 ? 'down' : ''}">\${change > 0 ? '+' : ''}\${change.toFixed(2)} kg</div></div>
          <div class="chart-stat"><div class="chart-stat-label">ต่ำสุด</div><div class="chart-stat-value">\${min} kg</div></div>
          <div class="chart-stat"><div class="chart-stat-label">สูงสุด</div><div class="chart-stat-value">\${max} kg</div></div>
        </div>
        \${renderChart(logs)}
      </div>
      <div class="chart-title">📋 ประวัติการชั่ง (\${logs.length} ครั้ง)</div>
      <div>
        \${[...logs].reverse().map((l, i, arr) => {
          const prev = arr[i + 1];
          const diff = prev ? l.weightKg - prev.weightKg : 0;
          const diffStr = !prev ? '<span class="weight-log-diff same">เริ่มต้น</span>' : diff > 0 ? '<span class="weight-log-diff up">+' + diff.toFixed(2) + '</span>' : diff < 0 ? '<span class="weight-log-diff down">' + diff.toFixed(2) + '</span>' : '<span class="weight-log-diff same">±0</span>';
          return \`
            <div class="weight-log">
              <div class="weight-log-info">
                <div class="weight-log-value">\${l.weightKg} kg</div>
                \${diffStr}
                <div>
                  <div class="weight-log-date">\${l.loggedDate}</div>
                  \${l.notes ? '<div style="font-size:.75rem;color:#a0aec0">' + escapeHtml(l.notes) + '</div>' : ''}
                </div>
              </div>
              <button class="weight-log-delete" onclick="deleteWeightLog('\${l.id}')">🗑</button>
            </div>
          \`;
        }).join('')}
      </div>
    \`;
  } catch (err) { toast(err.message, 'error'); }
}

function renderChart(logs) {
  const W = 600, H = 240, PAD_L = 45, PAD_R = 15, PAD_T = 20, PAD_B = 35;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const weights = logs.map(l => l.weightKg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = Math.max(maxW - minW, 0.5);
  const yMin = minW - range * 0.1;
  const yMax = maxW + range * 0.1;
  const yRange = yMax - yMin;

  const xStep = logs.length > 1 ? innerW / (logs.length - 1) : 0;
  const xAt = (i) => PAD_L + (logs.length > 1 ? i * xStep : innerW / 2);
  const yAt = (w) => PAD_T + innerH - ((w - yMin) / yRange) * innerH;

  const linePath = logs.map((l, i) => (i === 0 ? 'M' : 'L') + xAt(i) + ' ' + yAt(l.weightKg)).join(' ');
  const areaPath = linePath + ' L' + xAt(logs.length - 1) + ' ' + (PAD_T + innerH) + ' L' + xAt(0) + ' ' + (PAD_T + innerH) + ' Z';

  const gridLines = [];
  const labelCount = 4;
  for (let i = 0; i <= labelCount; i++) {
    const v = yMin + (yRange * i / labelCount);
    const y = PAD_T + innerH - (i / labelCount) * innerH;
    gridLines.push('<line class="grid-line" x1="' + PAD_L + '" y1="' + y + '" x2="' + (W - PAD_R) + '" y2="' + y + '"/>');
    gridLines.push('<text class="axis-label" x="' + (PAD_L - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + v.toFixed(1) + '</text>');
  }

  const xLabels = [];
  const labelStep = Math.max(1, Math.ceil(logs.length / 6));
  for (let i = 0; i < logs.length; i += labelStep) {
    xLabels.push('<text class="axis-label" x="' + xAt(i) + '" y="' + (H - 12) + '" text-anchor="middle">' + logs[i].loggedDate.slice(5) + '</text>');
  }

  const points = logs.map((l, i) => '<circle class="data-point" cx="' + xAt(i) + '" cy="' + yAt(l.weightKg) + '" r="4"><title>' + l.loggedDate + ': ' + l.weightKg + ' kg</title></circle>').join('');

  return \`<svg class="chart-svg" viewBox="0 0 \${W} \${H}" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#667eea"/>
        <stop offset="100%" stop-color="#667eea" stop-opacity="0"/>
      </linearGradient>
    </defs>
    \${gridLines.join('')}
    <path class="data-area" d="\${areaPath}"/>
    <path class="data-line" d="\${linePath}"/>
    \${points}
    \${xLabels.join('')}
  </svg>\`;
}

async function deleteWeightLog(logId) {
  if (!confirm('ลบรายการนี้?')) return;
  try {
    await api('/api/cats/' + CURRENT_CAT.id + '/weights/' + logId, { method: 'DELETE' });
    toast('ลบสำเร็จ');
    loadWeightHistory();
  } catch (err) { toast(err.message, 'error'); }
}

async function uploadPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('ไฟล์ต้องไม่เกิน 5MB', 'error'); return; }

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch('/api/cats/' + CURRENT_CAT.id + '/photo', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + TOKEN },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'อัปโหลดไม่สำเร็จ');
    CURRENT_CAT.photoUrl = data.data.photoUrl;
    toast('อัปโหลดรูปสำเร็จ');
    renderInfoTab();
    loadCats();
  } catch (err) { toast(err.message, 'error'); }
}

async function removePhoto() {
  if (!confirm('ลบรูปแมวตัวนี้?')) return;
  try {
    await api('/api/cats/' + CURRENT_CAT.id + '/photo', { method: 'DELETE' });
    CURRENT_CAT.photoUrl = null;
    toast('ลบรูปสำเร็จ');
    renderInfoTab();
    loadCats();
  } catch (err) { toast(err.message, 'error'); }
}

async function loadVaccinations() {
  const el = document.getElementById('tab-vacc');
  el.innerHTML = '<div style="margin-bottom:1rem"><button class="btn btn-sm" onclick="openVaccModal()">+ เพิ่มวัคซีน</button></div><div id="vacc-list"></div>';
  try {
    const r = await api('/api/cats/' + CURRENT_CAT.id + '/vaccinations');
    const list = document.getElementById('vacc-list');
    if (r.data.vaccinations.length === 0) { list.innerHTML = '<div class="empty">ยังไม่มีข้อมูลวัคซีน</div>'; return; }
    list.innerHTML = '<div class="records-list">' + r.data.vaccinations.map(v => \`
      <div class="record">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem">
          <div style="flex:1">
            <div class="record-title">💉 \${escapeHtml(v.vaccineName)}</div>
            <div class="record-meta">ฉีดวันที่ \${v.vaccinationDate} \${v.expirationDate ? '· หมดอายุ ' + v.expirationDate : ''}</div>
            \${v.clinicName ? '<div class="record-meta">📍 ' + escapeHtml(v.clinicName) + '</div>' : ''}
          </div>
          \${v.expirationDate ? '<a href="' + buildGCalUrl('วัคซีน ' + v.vaccineName + ' (' + CURRENT_CAT.name + ')', v.expirationDate, 'วัคซีน ' + v.vaccineName + ' หมดอายุ\\nแมว: ' + CURRENT_CAT.name + (v.clinicName ? '\\nคลินิก: ' + v.clinicName : '')) + '" target="_blank" class="btn btn-sm btn-secondary" style="white-space:nowrap;font-size:.75rem;padding:.3rem .6rem" title="เพิ่มเข้า Google Calendar">📅 Calendar</a>' : ''}
        </div>
      </div>
    \`).join('') + '</div>';
  } catch (err) { toast(err.message, 'error'); }
}

async function loadMedications() {
  const el = document.getElementById('tab-meds');
  el.innerHTML = '<div style="margin-bottom:1rem"><button class="btn btn-sm" onclick="openMedModal()">+ เพิ่มยา</button></div><div id="med-list"></div>';
  try {
    const r = await api('/api/cats/' + CURRENT_CAT.id + '/medications');
    const list = document.getElementById('med-list');
    if (r.data.medications.length === 0) { list.innerHTML = '<div class="empty">ไม่มียาที่กำลังให้</div>'; return; }
    list.innerHTML = '<div class="records-list">' + r.data.medications.map(m => \`
      <div class="record">
        <div class="record-title">💊 \${escapeHtml(m.medicineName)}</div>
        <div class="record-meta">\${m.dosage || ''} \${m.frequency ? '· ' + m.frequency : ''}</div>
        <div class="record-date">เริ่ม \${m.startDate}\${m.endDate ? ' · สิ้นสุด ' + m.endDate : ''}</div>
      </div>
    \`).join('') + '</div>';
  } catch (err) { toast(err.message, 'error'); }
}

async function loadMedicalHistory() {
  const el = document.getElementById('tab-medical');
  el.innerHTML = '<div style="margin-bottom:1rem"><button class="btn btn-sm" onclick="openHistoryModal()">+ เพิ่มประวัติ</button></div><div id="history-list"></div>';
  try {
    const r = await api('/api/cats/' + CURRENT_CAT.id + '/medical-history');
    const list = document.getElementById('history-list');
    if (r.data.records.length === 0) { list.innerHTML = '<div class="empty">ไม่มีประวัติการรักษา</div>'; return; }
    list.innerHTML = '<div class="records-list">' + r.data.records.map(h => \`
      <div class="record">
        <div class="record-title">🏥 \${typeLabel(h.type)}</div>
        \${h.diagnosis ? '<div class="record-meta">การวินิจฉัย: ' + escapeHtml(h.diagnosis) + '</div>' : ''}
        \${h.symptoms ? '<div class="record-meta">อาการ: ' + escapeHtml(h.symptoms) + '</div>' : ''}
        <div class="record-date">\${h.recordDate}</div>
      </div>
    \`).join('') + '</div>';
  } catch (err) { toast(err.message, 'error'); }
}

function typeLabel(t) {
  return { illness: 'เจ็บป่วย', injury: 'บาดเจ็บ', checkup: 'ตรวจสุขภาพ', surgery: 'ผ่าตัด' }[t] || t;
}

function modal(title, body, onSubmit, submitLabel = 'บันทึก') {
  const root = document.getElementById('modal-root');
  root.innerHTML = \`
    <div class="modal-bg" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">\${title}</div>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <form id="modal-form">\${body}
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">ยกเลิก</button>
            <button type="submit" class="btn" id="modal-submit">\${submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  \`;
  document.getElementById('modal-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('modal-submit');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>กำลังบันทึก...';
    try { await onSubmit(new FormData(e.target)); closeModal(); }
    catch (err) { toast(err.message, 'error'); btn.disabled = false; btn.textContent = submitLabel; }
  };
}

function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

function openCatModal() {
  modal('🐱 เพิ่มแมวใหม่', \`
    <div class="field"><label>ชื่อแมว *</label><input name="name" required></div>
    <div class="field"><label>เพศ</label><select name="gender"><option value="">-</option><option value="F">เพศเมีย</option><option value="M">เพศผู้</option></select></div>
    <div class="field"><label>สายพันธุ์</label><input name="breed" placeholder="เช่น Scottish Fold"></div>
    <div class="field"><label>วันเกิด</label><input type="date" name="dateOfBirth"></div>
    <div class="field"><label>น้ำหนัก (kg)</label><input type="number" step="0.1" name="weightKg" placeholder="3.5"></div>
    <div class="field"><label>สถานะสุขภาพ</label><select name="healthStatus"><option value="normal">ปกติ</option><option value="treating">กำลังรักษา</option><option value="caution">ควรระวัง</option></select></div>
  \`, async (f) => {
    const body = { name: f.get('name'), healthStatus: f.get('healthStatus') };
    if (f.get('gender')) body.gender = f.get('gender');
    if (f.get('breed')) body.breed = f.get('breed');
    if (f.get('dateOfBirth')) body.dateOfBirth = f.get('dateOfBirth');
    if (f.get('weightKg')) body.weightKg = parseFloat(f.get('weightKg'));
    await api('/api/cats', { method: 'POST', body: JSON.stringify(body) });
    toast('เพิ่มแมวสำเร็จ');
    loadDashboard(); loadCats();
  });
}

function openVaccModal() {
  modal('💉 เพิ่มวัคซีน', \`
    <div class="field"><label>ชื่อวัคซีน *</label><input name="vaccineName" required placeholder="FVRCP"></div>
    <div class="field"><label>วันที่ฉีด *</label><input type="date" name="vaccinationDate" required></div>
    <div class="field"><label>วันหมดอายุ</label><input type="date" name="expirationDate"></div>
    <div class="field"><label>คลินิก</label><input name="clinicName"></div>
    <div class="field"><label>สัตวแพทย์</label><input name="veterinarianName"></div>
    <div class="field"><label>เลข Lot</label><input name="lotNumber"></div>
  \`, async (f) => {
    const body = { vaccineName: f.get('vaccineName'), vaccinationDate: f.get('vaccinationDate') };
    ['expirationDate', 'clinicName', 'veterinarianName', 'lotNumber'].forEach(k => { if (f.get(k)) body[k] = f.get(k); });
    await api('/api/cats/' + CURRENT_CAT.id + '/vaccinations', { method: 'POST', body: JSON.stringify(body) });
    toast('เพิ่มวัคซีนสำเร็จ');
    loadVaccinations(); loadDashboard();
  });
}

function openMedModal() {
  modal('💊 เพิ่มยา', \`
    <div class="field"><label>ชื่อยา *</label><input name="medicineName" required></div>
    <div class="field"><label>ขนาดยา</label><input name="dosage" placeholder="50mg"></div>
    <div class="field"><label>ความถี่</label><input name="frequency" placeholder="2 ครั้งต่อวัน"></div>
    <div class="field"><label>วิธีให้ยา</label><select name="route"><option value="">-</option><option value="oral">ทางปาก</option><option value="liquid">ของเหลว</option><option value="topical">ทาผิวหนัง</option><option value="injection">ฉีด</option></select></div>
    <div class="field"><label>วันที่เริ่ม *</label><input type="date" name="startDate" required></div>
    <div class="field"><label>วันที่สิ้นสุด</label><input type="date" name="endDate"></div>
    <div class="field"><label>วัตถุประสงค์</label><input name="purpose"></div>
  \`, async (f) => {
    const body = { medicineName: f.get('medicineName'), startDate: f.get('startDate') };
    ['dosage', 'frequency', 'route', 'endDate', 'purpose'].forEach(k => { if (f.get(k)) body[k] = f.get(k); });
    await api('/api/cats/' + CURRENT_CAT.id + '/medications', { method: 'POST', body: JSON.stringify(body) });
    toast('เพิ่มยาสำเร็จ');
    loadMedications(); loadDashboard();
  });
}

function openHistoryModal() {
  modal('🏥 เพิ่มประวัติการรักษา', \`
    <div class="field"><label>วันที่ *</label><input type="date" name="recordDate" required></div>
    <div class="field"><label>ประเภท *</label><select name="type" required><option value="checkup">ตรวจสุขภาพ</option><option value="illness">เจ็บป่วย</option><option value="injury">บาดเจ็บ</option><option value="surgery">ผ่าตัด</option></select></div>
    <div class="field"><label>อาการ</label><textarea name="symptoms" rows="2"></textarea></div>
    <div class="field"><label>การวินิจฉัย</label><textarea name="diagnosis" rows="2"></textarea></div>
    <div class="field"><label>คลินิก</label><input name="clinicName"></div>
    <div class="field"><label>ค่ารักษา (บาท)</label><input type="number" step="0.01" name="cost"></div>
  \`, async (f) => {
    const body = { recordDate: f.get('recordDate'), type: f.get('type') };
    ['symptoms', 'diagnosis', 'clinicName'].forEach(k => { if (f.get(k)) body[k] = f.get(k); });
    if (f.get('cost')) body.cost = parseFloat(f.get('cost'));
    await api('/api/cats/' + CURRENT_CAT.id + '/medical-history', { method: 'POST', body: JSON.stringify(body) });
    toast('บันทึกประวัติสำเร็จ');
    loadMedicalHistory();
  });
}

async function deleteCat() {
  if (!confirm('ลบข้อมูลแมว ' + CURRENT_CAT.name + ' และข้อมูลที่เกี่ยวข้องทั้งหมด?')) return;
  try {
    await api('/api/cats/' + CURRENT_CAT.id, { method: 'DELETE' });
    toast('ลบสำเร็จ');
    closeDetail();
    loadDashboard(); loadCats();
  } catch (err) { toast(err.message, 'error'); }
}

function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

// Initial load
if (TOKEN && USER) {
  showApp();
} else {
  loadGoogleScript().then(initGoogleSignIn);
}
</script>
</body>
</html>`;
