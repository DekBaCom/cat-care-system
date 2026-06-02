import type { Env } from '../types';
import { queryOne, query } from '../utils/db';

interface CatRow { id: string; name: string; gender: string | null; breed: string | null; date_of_birth: string | null; weight_kg: number | null; health_status: string; microchip_id: string | null; photo_url: string | null; chronic_diseases: string | null; drug_allergies: string | null; forbidden_foods: string | null; }
interface VaccRow { vaccine_name: string; vaccination_date: string; expiration_date: string | null; clinic_name: string | null; }
interface MedRow { medicine_name: string; dosage: string | null; frequency: string | null; route: string | null; start_date: string; purpose: string | null; }
interface HistRow { record_date: string; type: string; diagnosis: string | null; symptoms: string | null; clinic_name: string | null; veterinarian_name: string | null; treatment_result: string | null; }
interface DietRow { food_name: string; food_type: string; portion_size: number | null; unit: string | null; frequency_per_day: number | null; is_main_food: number; }

function esc(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function age(dob: string | null): string {
  if (!dob) return '';
  const diff = Date.now() - new Date(dob).getTime();
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months} เดือน`;
  const y = Math.floor(months / 12); const m = months % 12;
  return m > 0 ? `${y} ปี ${m} เดือน` : `${y} ปี`;
}

function statusLabel(s: string): string {
  return ({ normal: '✅ ปกติ', treating: '🏥 กำลังรักษา', caution: '⚠️ ควรระวัง' } as Record<string, string>)[s] ?? s;
}

function typeLabel(t: string): string {
  return ({ illness: 'เจ็บป่วย', injury: 'บาดเจ็บ', checkup: 'ตรวจสุขภาพ', surgery: 'ผ่าตัด' } as Record<string, string>)[t] ?? t;
}

function routeLabel(r: string): string {
  return ({ oral: 'กิน', liquid: 'ของเหลว', topical: 'ทาภายนอก', injection: 'ฉีด' } as Record<string, string>)[r] ?? r;
}

export async function renderSharePage(token: string, env: Env): Promise<string | null> {
  const cat = await queryOne<CatRow>(env.DB, 'SELECT * FROM cats WHERE share_token = ?', [token]);
  if (!cat) return null;

  const [vaccinations, medications, history, diet] = await Promise.all([
    query<VaccRow>(env.DB, 'SELECT vaccine_name, vaccination_date, expiration_date, clinic_name FROM vaccinations WHERE cat_id = ? ORDER BY vaccination_date DESC', [cat.id]),
    query<MedRow>(env.DB, 'SELECT medicine_name, dosage, frequency, route, start_date, purpose FROM medications WHERE cat_id = ? AND is_active = 1 ORDER BY start_date DESC', [cat.id]),
    query<HistRow>(env.DB, 'SELECT record_date, type, diagnosis, symptoms, clinic_name, veterinarian_name, treatment_result FROM medical_history WHERE cat_id = ? ORDER BY record_date DESC LIMIT 10', [cat.id]),
    query<DietRow>(env.DB, 'SELECT food_name, food_type, portion_size, unit, frequency_per_day, is_main_food FROM diet_info WHERE cat_id = ? ORDER BY is_main_food DESC', [cat.id]),
  ]);

  const now = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok' });
  const genderLabel = cat.gender === 'F' ? '♀ เพศเมีย' : cat.gender === 'M' ? '♂ เพศผู้' : '-';
  const avatar = cat.photo_url
    ? `<img src="${esc(cat.photo_url)}" alt="${esc(cat.name)}" class="avatar-img">`
    : `<div class="avatar-emoji">${cat.gender === 'F' ? '🐱' : '😺'}</div>`;

  const vaccRows = vaccinations.length === 0
    ? '<tr><td colspan="4" class="empty-cell">ไม่มีข้อมูลวัคซีน</td></tr>'
    : vaccinations.map(v => {
        const expired = v.expiration_date && new Date(v.expiration_date) < new Date();
        const expStyle = expired ? 'color:#e53e3e;font-weight:600' : '';
        return `<tr>
          <td>${esc(v.vaccine_name)}</td>
          <td>${v.vaccination_date}</td>
          <td style="${expStyle}">${v.expiration_date ?? '-'}${expired ? ' ⚠️' : ''}</td>
          <td>${esc(v.clinic_name ?? '-')}</td>
        </tr>`;
      }).join('');

  const medRows = medications.length === 0
    ? '<tr><td colspan="4" class="empty-cell">ไม่มียาที่กำลังให้</td></tr>'
    : medications.map(m => `<tr>
        <td>${esc(m.medicine_name)}</td>
        <td>${esc(m.dosage ?? '-')}</td>
        <td>${esc(m.frequency ?? '-')}${m.route ? ' (' + routeLabel(m.route) + ')' : ''}</td>
        <td>${esc(m.purpose ?? '-')}</td>
      </tr>`).join('');

  const histRows = history.length === 0
    ? '<tr><td colspan="5" class="empty-cell">ไม่มีประวัติการรักษา</td></tr>'
    : history.map(h => `<tr>
        <td>${h.record_date}</td>
        <td>${typeLabel(h.type)}</td>
        <td>${esc(h.diagnosis ?? h.symptoms ?? '-')}</td>
        <td>${esc(h.clinic_name ?? '-')}${h.veterinarian_name ? '<br><small>' + esc(h.veterinarian_name) + '</small>' : ''}</td>
        <td>${esc(h.treatment_result ?? '-')}</td>
      </tr>`).join('');

  const dietRows = diet.length === 0
    ? '<tr><td colspan="4" class="empty-cell">ไม่มีข้อมูลอาหาร</td></tr>'
    : diet.map(d => `<tr>
        <td>${esc(d.food_name)}${d.is_main_food ? ' <span class="badge-main">หลัก</span>' : ''}</td>
        <td>${({ dry: 'อาหารแห้ง', wet: 'อาหารเปียก', mixed: 'ผสม' } as Record<string, string>)[d.food_type] ?? d.food_type}</td>
        <td>${d.portion_size ? `${d.portion_size} ${d.unit ?? ''}` : '-'}</td>
        <td>${d.frequency_per_day ? `${d.frequency_per_day} มื้อ/วัน` : '-'}</td>
      </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ประวัติสุขภาพ ${esc(cat.name)} — Cat Care System</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f0f4f8;color:#2d3748;-webkit-font-smoothing:antialiased}
.top-bar{background:linear-gradient(135deg,#667eea,#764ba2);padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;color:white}
.top-bar-title{font-size:1rem;font-weight:700;opacity:.9}
.top-bar-actions{display:flex;gap:.6rem}
.share-btn{padding:.45rem .9rem;border-radius:8px;border:none;cursor:pointer;font-weight:600;font-size:.82rem;display:inline-flex;align-items:center;gap:.3rem;text-decoration:none;transition:opacity .15s}
.share-btn:hover{opacity:.85}
.btn-copy{background:white;color:#667eea}
.btn-line{background:#06C755;color:white}
.btn-print{background:rgba(255,255,255,.2);color:white;border:1px solid rgba(255,255,255,.4)}
.container{max-width:860px;margin:1.5rem auto;padding:0 1rem 3rem}
.profile-card{background:white;border-radius:16px;padding:1.5rem;margin-bottom:1.2rem;box-shadow:0 1px 4px rgba(0,0,0,.07);display:flex;gap:1.4rem;align-items:flex-start}
.avatar{width:100px;height:100px;border-radius:50%;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center}
.avatar-img{width:100%;height:100%;object-fit:cover}
.avatar-emoji{font-size:3.5rem}
.cat-name{font-size:1.7rem;font-weight:800;color:#2d3748;margin-bottom:.3rem}
.cat-status{display:inline-block;padding:.25rem .7rem;border-radius:20px;font-size:.82rem;font-weight:600;margin-bottom:.8rem}
.status-normal{background:#c6f6d5;color:#22543d}
.status-treating{background:#fed7d7;color:#742a2a}
.status-caution{background:#fefcbf;color:#744210}
.info-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.6rem}
.info-item{background:#f7fafc;border-radius:8px;padding:.6rem .8rem}
.info-label{font-size:.7rem;color:#718096;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.2rem}
.info-value{font-size:.9rem;font-weight:600;color:#2d3748}
.alert-card{border-radius:12px;padding:1rem 1.2rem;margin-bottom:1.2rem;border-left:4px solid}
.alert-allergy{background:#fff5f5;border-color:#f56565}
.alert-allergy .alert-title{color:#c53030}
.alert-chronic{background:#fffff0;border-color:#ecc94b}
.alert-chronic .alert-title{color:#975a16}
.alert-food{background:#f0fff4;border-color:#48bb78}
.alert-food .alert-title{color:#276749}
.alert-title{font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.3rem}
.alert-text{font-size:.9rem;color:#4a5568;font-weight:500}
.section{background:white;border-radius:14px;padding:1.2rem 1.4rem;margin-bottom:1.2rem;box-shadow:0 1px 4px rgba(0,0,0,.07)}
.section-title{font-size:1rem;font-weight:700;color:#2d3748;margin-bottom:1rem;display:flex;align-items:center;gap:.4rem}
table{width:100%;border-collapse:collapse;font-size:.87rem}
th{background:#f7fafc;padding:.55rem .7rem;text-align:left;font-weight:700;color:#4a5568;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid #e2e8f0}
td{padding:.55rem .7rem;border-bottom:1px solid #f0f4f8;vertical-align:top;color:#4a5568}
tr:last-child td{border-bottom:none}
tr:hover td{background:#fafbff}
.empty-cell{text-align:center;color:#a0aec0;font-style:italic;padding:1.2rem}
.badge-main{background:#667eea;color:white;padding:.1rem .4rem;border-radius:6px;font-size:.7rem;font-weight:700}
.footer{text-align:center;color:#a0aec0;font-size:.78rem;margin-top:2rem}
.footer a{color:#667eea;text-decoration:none}
.generated{text-align:center;background:white;border-radius:10px;padding:.7rem;font-size:.8rem;color:#718096;margin-bottom:1.2rem;box-shadow:0 1px 3px rgba(0,0,0,.05)}
@media(max-width:600px){
  .profile-card{flex-direction:column;align-items:center;text-align:center}
  .info-grid{grid-template-columns:repeat(2,1fr)}
  .top-bar{flex-direction:column;gap:.7rem;align-items:flex-start}
  table{font-size:.8rem}
  th,td{padding:.4rem .5rem}
}
@media print{
  body{background:white}
  .top-bar-actions,.btn-print{display:none!important}
  .top-bar{background:#667eea!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .container{margin:0;max-width:100%}
}
</style>
</head>
<body>
<div class="top-bar">
  <div class="top-bar-title">🐱 Cat Care System — ประวัติสุขภาพแมว</div>
  <div class="top-bar-actions">
    <button class="share-btn btn-copy" onclick="copyLink()">📋 คัดลอก Link</button>
    <a class="share-btn btn-line" href="https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`https://cat-care.ilikeit.info/share/${token}`)}" target="_blank">LINE ส่งหาหมอ</a>
    <button class="share-btn btn-print" onclick="window.print()">🖨️ พิมพ์</button>
  </div>
</div>

<div class="container">
  <div class="generated">สร้างเมื่อ ${now} · ข้อมูลแสดงแบบ Real-time</div>

  <div class="profile-card">
    <div class="avatar">${avatar}</div>
    <div style="flex:1">
      <div class="cat-name">${esc(cat.name)}</div>
      <div class="cat-status status-${cat.health_status}">${statusLabel(cat.health_status)}</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">เพศ</div><div class="info-value">${genderLabel}</div></div>
        ${cat.breed ? `<div class="info-item"><div class="info-label">สายพันธุ์</div><div class="info-value">${esc(cat.breed)}</div></div>` : ''}
        ${cat.date_of_birth ? `<div class="info-item"><div class="info-label">อายุ</div><div class="info-value">${age(cat.date_of_birth)}</div></div>` : ''}
        ${cat.date_of_birth ? `<div class="info-item"><div class="info-label">วันเกิด</div><div class="info-value">${cat.date_of_birth}</div></div>` : ''}
        ${cat.weight_kg ? `<div class="info-item"><div class="info-label">น้ำหนัก</div><div class="info-value">${cat.weight_kg} kg</div></div>` : ''}
        ${cat.microchip_id ? `<div class="info-item"><div class="info-label">Microchip</div><div class="info-value">${esc(cat.microchip_id)}</div></div>` : ''}
      </div>
    </div>
  </div>

  ${cat.drug_allergies ? `<div class="alert-card alert-allergy"><div class="alert-title">⚠️ แพ้ยา / Drug Allergy</div><div class="alert-text">${esc(cat.drug_allergies)}</div></div>` : ''}
  ${cat.chronic_diseases ? `<div class="alert-card alert-chronic"><div class="alert-title">🏥 โรคประจำตัว / Chronic Diseases</div><div class="alert-text">${esc(cat.chronic_diseases)}</div></div>` : ''}
  ${cat.forbidden_foods ? `<div class="alert-card alert-food"><div class="alert-title">🚫 อาหารที่ห้ามกิน / Forbidden Foods</div><div class="alert-text">${esc(cat.forbidden_foods)}</div></div>` : ''}

  <div class="section">
    <div class="section-title">💉 ประวัติวัคซีน</div>
    <div style="overflow-x:auto">
    <table>
      <thead><tr><th>วัคซีน</th><th>วันที่ฉีด</th><th>หมดอายุ</th><th>คลินิก</th></tr></thead>
      <tbody>${vaccRows}</tbody>
    </table>
    </div>
  </div>

  ${medications.length > 0 ? `
  <div class="section">
    <div class="section-title">💊 ยาที่กำลังได้รับ (Active)</div>
    <div style="overflow-x:auto">
    <table>
      <thead><tr><th>ชื่อยา</th><th>ขนาด</th><th>ความถี่</th><th>วัตถุประสงค์</th></tr></thead>
      <tbody>${medRows}</tbody>
    </table>
    </div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">🏥 ประวัติการรักษา (ล่าสุด 10 รายการ)</div>
    <div style="overflow-x:auto">
    <table>
      <thead><tr><th>วันที่</th><th>ประเภท</th><th>การวินิจฉัย / อาการ</th><th>สถานพยาบาล</th><th>ผลการรักษา</th></tr></thead>
      <tbody>${histRows}</tbody>
    </table>
    </div>
  </div>

  ${diet.length > 0 ? `
  <div class="section">
    <div class="section-title">🍽️ ข้อมูลอาหาร</div>
    <div style="overflow-x:auto">
    <table>
      <thead><tr><th>อาหาร</th><th>ประเภท</th><th>ปริมาณ</th><th>ความถี่</th></tr></thead>
      <tbody>${dietRows}</tbody>
    </table>
    </div>
  </div>` : ''}

  <div class="footer">
    สร้างโดย <a href="https://cat-care.ilikeit.info" target="_blank">Cat Care System</a> · Link นี้เข้าถึงได้โดยไม่ต้อง Login
  </div>
</div>

<script>
function copyLink() {
  navigator.clipboard.writeText(location.href).then(() => {
    const btn = document.querySelector('.btn-copy');
    const orig = btn.textContent;
    btn.textContent = '✅ คัดลอกแล้ว';
    setTimeout(() => btn.textContent = orig, 2000);
  });
}
</script>
</body>
</html>`;
}
