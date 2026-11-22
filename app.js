// URL ของไฟล์ PHP API (ตรวจสอบให้ตรงกับโฟลเดอร์ที่เก็บ portfolios.php)
const API_URL = 'api/portfolios.php';
const ACTIVE_ID_KEY = 'active_portfolio_id';

// ตัวแปรเก็บข้อมูลที่โหลดมาจาก PHP Server
let cachedPortfolios = [];

// 1. โหลดข้อมูลล่าสุดจาก PHP Server
async function fetchPortfoliosFromServer() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch data');
        cachedPortfolios = await res.json();
    } catch (err) {
        console.error('Error loading portfolios:', err);
        cachedPortfolios = [];
    }
}

// ดึงข้อมูลจากตัวแปรที่โหลดมาแล้ว
function getPortfolios() {
    return cachedPortfolios;
}

// ดึง Portfolio ของคนที่กำลังเลือกอยู่
function getActivePortfolio() {
    const portfolios = getPortfolios();
    if (portfolios.length === 0) return null;

    const activeId = localStorage.getItem(ACTIVE_ID_KEY);
    return portfolios.find(p => p.id === activeId) || portfolios[0];
}

// 2. จัดการการส่งฟอร์มข้อมูลส่วนตัว
document.getElementById('profile-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const errorEl = document.getElementById('portfolio-error');
    errorEl.textContent = '';

    const formData = new FormData();
    formData.append('action', 'create_profile');
    formData.append('displayName', document.getElementById('fullname').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('phone', document.getElementById('phonenumber').value);
    formData.append('whatIEnjoy', document.getElementById('Whatyouliketodo').value);
    formData.append('whatIveTried', document.getElementById("WhatYou'veTried").value);
    formData.append('whatImCuriousAbout', document.getElementById('WhatyouCuriousAbout').value);

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (!res.ok) {
            errorEl.textContent = result.error || 'เกิดข้อผิดพลาดในการบันทึก';
            return;
        }

        // อัปเดตข้อมูลล่าสุดจาก Server และตั้ง ID ใหม่ที่ PHP สร้างให้เป็น Active
        cachedPortfolios = result.portfolios;
        localStorage.setItem(ACTIVE_ID_KEY, result.newId);

        this.reset();
        renderAll();
    } catch (err) {
        console.error('Submit profile error:', err);
        errorEl.textContent = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
    }
});

// 3. จัดการการส่งฟอร์มเพิ่มผลงาน
document.getElementById('item-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const errorEl = document.getElementById('item-error');
    errorEl.textContent = '';

    const activePortfolio = getActivePortfolio();
    if (!activePortfolio) {
        errorEl.textContent = 'กรุณากรอกและบันทึกข้อมูลส่วนตัว (Personal Information) ด้านบนก่อนเพิ่มผลงาน';
        return;
    }

    const formData = new FormData();
    formData.append('action', 'add_item');
    formData.append('portfolioId', activePortfolio.id);
    formData.append('title', document.getElementById('Title').value);
    formData.append('type', document.getElementById('Type').value);
    formData.append('date', document.getElementById('Date').value);
    formData.append('role', document.getElementById('Role').value);
    formData.append('description', document.getElementById('Description').value);
    formData.append('skills', document.getElementById('Skill').value);
    formData.append('whatIDid', document.getElementById('WhatIdid').value);
    formData.append('whatILearned', document.getElementById('WhatIlearned').value);
    formData.append('challenge', document.getElementById('Challenge').value);
    formData.append('nextStep', document.getElementById('Nextstep').value);
    formData.append('evidence', document.getElementById('Evidence').value);

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (!res.ok) {
            errorEl.textContent = result.error || 'เกิดข้อผิดพลาดในการเพิ่มผลงาน';
            return;
        }

        cachedPortfolios = result.portfolios;
        this.reset();
        renderAll();
    } catch (err) {
        console.error('Submit item error:', err);
        errorEl.textContent = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
    }
});

// 4. แสดงปุ่มเลือกเจ้าของ Portfolio (#portfolio-owner-selector)
function renderOwnerSelector() {
    const container = document.querySelector('#portfolio-owner-selector .card-body');
    const portfolios = getPortfolios();
    const activePortfolio = getActivePortfolio();

    container.innerHTML = '<h2 class="h5 fw-bold mb-3">Portfolios</h2>';

    if (portfolios.length === 0) {
        container.innerHTML += `
            <button type="button" class="btn owner-selector w-100 text-start" disabled>
                Your Name (0 items)
            </button>`;
        return;
    }

    const listGroup = document.createElement('div');
    listGroup.className = 'd-flex flex-column gap-2';

    portfolios.forEach(p => {
        const isActive = activePortfolio && p.id === activePortfolio.id;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = isActive
            ? 'btn owner-selector w-100 text-start d-flex justify-content-between align-items-center'
            : 'btn btn-outline-secondary w-100 text-start d-flex justify-content-between align-items-center';

        btn.innerHTML = `
            <span>${p.displayName}</span>
            <span class="badge ${isActive ? 'bg-light text-dark' : 'bg-secondary'}">${p.items.length} items</span>
        `;

        btn.addEventListener('click', () => {
            localStorage.setItem(ACTIVE_ID_KEY, p.id);
            renderAll();
        });

        listGroup.appendChild(btn);
    });

    container.appendChild(listGroup);
}

// 5. แสดงข้อมูลโปรไฟล์และรายการผลงานทั้งหมดใน #portfolio-display
function renderPortfolioDisplay() {
    const activePortfolio = getActivePortfolio();
    if (!activePortfolio) return;

    document.getElementById('fname-display').textContent = activePortfolio.displayName;

    const emailEl = document.getElementById('femail-display');
    emailEl.textContent = activePortfolio.email || '-';
    emailEl.href = activePortfolio.email ? `mailto:${activePortfolio.email}` : '#';

    const phoneEl = document.getElementById('fphone-display');
    phoneEl.textContent = activePortfolio.phone || '-';
    phoneEl.href = activePortfolio.phone ? `tel:${activePortfolio.phone}` : '#';

    document.getElementById('fliketodo-display').textContent = activePortfolio.whatIEnjoy || '...';
    document.getElementById('ftry-display').textContent = activePortfolio.whatIveTried || '...';
    document.getElementById('fCurious-display').textContent = activePortfolio.whatImCuriousAbout || '...';

    const itemsContainer = document.getElementById('portfolio-item-display');

    if (activePortfolio.items.length === 0) {
        itemsContainer.innerHTML = `
            <div class="alert alert-light border text-muted text-center">
                ยังไม่มีรายการผลงานสำหรับ <strong>${activePortfolio.displayName}</strong> กรุณาเพิ่มผลงานจากฟอร์มด้านบน
            </div>`;
        return;
    }

    itemsContainer.innerHTML = activePortfolio.items.map(item => `
        <article class="border-top pt-4 mt-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h2 class="card-title mb-0">${item.title}</h2>
            </div>
            <p class="text-muted mb-3">${item.description}</p>

            <h3>Type</h3>
            <p>${item.type}</p>

            <h3>Date</h3>
            <p>${item.date}</p>

            <h3>Role</h3>
            <p>${item.role}</p>

            <h3>Skills</h3>
            <ul>
                ${item.skills.map(skill => `<li>${skill}</li>`).join('')}
            </ul>

            <h3>Reflection</h3>
            <div class="bg-light p-3 rounded-3 mt-1 border">
                <p class="mb-1"><strong>What I did:</strong> ${item.reflection.whatIDid}</p>
                <p class="mb-1"><strong>What I learned:</strong> ${item.reflection.whatILearned}</p>
                <p class="mb-1"><strong>Challenge group 14 reflection:</strong> ${item.reflection.challenge}</p>
                <p class="mb-0"><strong>Next step:</strong> ${item.reflection.nextStep}</p>
            </div>

            <h3>Evidence</h3>
            <div class="d-flex flex-column gap-2 mt-1">
                ${item.evidence.length > 0
                    ? item.evidence.map(link => `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>`).join('')
                    : '<p class="mb-0">-</p>'
                }
            </div>
        </article>
    `).join('');
}

// ฟังก์ชันอัปเดตหน้าจอทั้งหมด
function renderAll() {
    renderOwnerSelector();
    renderPortfolioDisplay();
}

// ฟังก์ชัน Dummy สำหรับปุ่ม Import / Export
function handleDummyAction(action) {
    console.log(`${action} clicked - Current Server Data:`, getPortfolios());
    alert(`เตรียมพร้อมสำหรับฟีเจอร์ ${action} JSON`);
}

// โหลดข้อมูลจาก PHP Server ทันทีเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', async () => {
    await fetchPortfoliosFromServer();
    renderAll();
});