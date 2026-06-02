export const appHtml = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cat Care System</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;color:#2d3748}
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
.auth-tabs{display:flex;gap:.5rem;margin-bottom:1.5rem;background:#f7fafc;padding:.3rem;border-radius:10px}
.auth-tab{flex:1;padding:.6rem;border-radius:7px;background:transparent;color:#718096;font-weight:600;font-size:.9rem;cursor:pointer}
.auth-tab.active{background:white;color:#667eea;box-shadow:0 2px 4px rgba(0,0,0,.05)}
.auth-msg{padding:.7rem;border-radius:8px;font-size:.85rem;margin-bottom:1rem;display:none}
.auth-msg.show{display:block}
.auth-msg.error{background:#fed7d7;color:#742a2a}
.auth-msg.success{background:#c6f6d5;color:#22543d}

/* App */
.app{min-height:100vh;background:#f7fafc}
.navbar{background:white;padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;box-shadow:0 1px 3px rgba(0,0,0,.06);position:sticky;top:0;z-index:10}
.brand{display:flex;align-items:center;gap:.5rem;font-weight:700;font-size:1.1rem;color:#2d3748}
.brand-emoji{font-size:1.6rem}
.user-menu{display:flex;align-items:center;gap:1rem}
.user-name{font-size:.9rem;color:#4a5568;font-weight:600}
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

@media(max-width:640px){
  .main{padding:1rem}
  .auth-card{padding:1.5rem}
  .stat-value{font-size:1.5rem}
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
    <div class="auth-tabs">
      <button class="auth-tab active" data-tab="login" onclick="switchTab('login')">เข้าสู่ระบบ</button>
      <button class="auth-tab" data-tab="register" onclick="switchTab('register')">สมัครสมาชิก</button>
    </div>
    <div id="auth-msg" class="auth-msg"></div>

    <form id="login-form" onsubmit="handleLogin(event)">
      <div class="field">
        <label>อีเมล</label>
        <input type="email" name="email" required placeholder="you@example.com">
      </div>
      <div class="field">
        <label>รหัสผ่าน</label>
        <input type="password" name="password" required minlength="8" placeholder="••••••••">
      </div>
      <button type="submit" class="btn btn-block" id="login-btn">เข้าสู่ระบบ</button>
    </form>

    <form id="register-form" class="hidden" onsubmit="handleRegister(event)">
      <div class="field">
        <label>ชื่อ</label>
        <input type="text" name="name" required minlength="2" placeholder="ชื่อของคุณ">
      </div>
      <div class="field">
        <label>อีเมล</label>
        <input type="email" name="email" required placeholder="you@example.com">
      </div>
      <div class="field">
        <label>รหัสผ่าน</label>
        <input type="password" name="password" required minlength="8" placeholder="อย่างน้อย 8 ตัวอักษร">
      </div>
      <button type="submit" class="btn btn-block" id="register-btn">สมัครสมาชิก</button>
    </form>
  </div>
</div>

<!-- APP SCREEN -->
<div id="app-screen" class="app hidden">
  <nav class="navbar">
    <div class="brand"><span class="brand-emoji">🐱</span> Cat Care System</div>
    <div class="user-menu">
      <span class="user-name" id="user-name"></span>
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
      </div>
      <div id="tab-info" class="tab-content"></div>
      <div id="tab-vacc" class="tab-content hidden"></div>
      <div id="tab-meds" class="tab-content hidden"></div>
      <div id="tab-medical" class="tab-content hidden"></div>
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

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  document.getElementById('auth-msg').classList.remove('show');
}

function authMsg(text, type) {
  const el = document.getElementById('auth-msg');
  el.textContent = text; el.className = 'auth-msg show ' + type;
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>กำลังเข้าสู่ระบบ...';
  const f = new FormData(e.target);
  try {
    const r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: f.get('email'), password: f.get('password') }) });
    TOKEN = r.data.token; USER = r.data.user;
    localStorage.setItem('token', TOKEN); localStorage.setItem('user', JSON.stringify(USER));
    showApp();
  } catch (err) { authMsg(err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'เข้าสู่ระบบ'; }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('register-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>กำลังสมัคร...';
  const f = new FormData(e.target);
  try {
    const r = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ name: f.get('name'), email: f.get('email'), password: f.get('password') }) });
    TOKEN = r.data.token; USER = r.data.user;
    localStorage.setItem('token', TOKEN); localStorage.setItem('user', JSON.stringify(USER));
    showApp();
  } catch (err) { authMsg(err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'สมัครสมาชิก'; }
}

function logout() {
  TOKEN = null; USER = null;
  localStorage.removeItem('token'); localStorage.removeItem('user');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app-screen').classList.add('hidden');
}

async function showApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  document.getElementById('user-name').textContent = '👋 ' + USER.name;
  await loadDashboard();
  await loadCats();
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
  ['info', 'vacc', 'meds', 'medical'].forEach(t => document.getElementById('tab-' + t).classList.toggle('hidden', t !== tab));
  if (tab === 'vacc') loadVaccinations();
  if (tab === 'meds') loadMedications();
  if (tab === 'medical') loadMedicalHistory();
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
  modal('⚖️ บันทึกน้ำหนัก ' + escapeHtml(c.name), \`
    <div style="text-align:center;margin-bottom:1rem;padding:1rem;background:#f7fafc;border-radius:10px">
      <div style="font-size:.85rem;color:#718096">น้ำหนักปัจจุบัน</div>
      <div style="font-size:2rem;font-weight:700;color:#2d3748">\${c.weightKg ? c.weightKg + ' kg' : 'ยังไม่มีข้อมูล'}</div>
    </div>
    <div class="field"><label>น้ำหนักใหม่ (kg) *</label><input type="number" step="0.01" name="weightKg" required placeholder="3.5" value="\${c.weightKg || ''}" autofocus></div>
  \`, async (f) => {
    const weightKg = parseFloat(f.get('weightKg'));
    if (isNaN(weightKg) || weightKg <= 0) throw new Error('น้ำหนักต้องเป็นตัวเลขมากกว่า 0');
    const r = await api('/api/cats/' + CURRENT_CAT.id, { method: 'PUT', body: JSON.stringify({ weightKg }) });
    CURRENT_CAT = r.data;
    toast('บันทึกน้ำหนักสำเร็จ (' + weightKg + ' kg)');
    renderInfoTab();
    loadCats();
  });
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
        <div class="record-title">💉 \${escapeHtml(v.vaccineName)}</div>
        <div class="record-meta">ฉีดวันที่ \${v.vaccinationDate} \${v.expirationDate ? '· หมดอายุ ' + v.expirationDate : ''}</div>
        \${v.clinicName ? '<div class="record-meta">📍 ' + escapeHtml(v.clinicName) + '</div>' : ''}
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

// Initial load
if (TOKEN && USER) showApp();
</script>
</body>
</html>`;
