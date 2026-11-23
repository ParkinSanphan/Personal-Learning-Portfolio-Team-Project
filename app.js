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

// ฟังก์ชันตรวจสอบโครงสร้างข้อมูล (Schema Validation) ก่อนอนุญาตให้ Import
function validatePortfolioSchema(data) {
    // 1. ข้อมูลหลักต้องเป็น Array
    if (!Array.isArray(data)) {
        return 'โครงสร้างข้อมูลไม่ถูกต้อง: ข้อมูลหลักต้องอยู่ในรูปแบบ Array ([ ... ])';
    }

    // 2. ตรวจสอบข้อมูลย่อยแต่ละ Portfolio ใน Array
    for (let i = 0; i < data.length; i++) {
        const p = data[i];
        if (typeof p !== 'object' || p === null) {
            return `รายการที่ ${i + 1} ไม่ใช่ Object ที่ถูกต้อง`;
        }
        if (typeof p.id !== 'string' || p.id.trim() === '') {
            return `รายการที่ ${i + 1} ขาดฟิลด์ "id" ที่ถูกต้อง`;
        }
        if (typeof p.displayName !== 'string' || p.displayName.trim() === '') {
            return `รายการที่ ${i + 1} ขาดฟิลด์ "displayName" ที่ถูกต้อง`;
        }
        if (!Array.isArray(p.items)) {
            return `รายการของ "${p.displayName}" ขาดฟิลด์ "items" หรือไม่ได้เป็นรูปแบบ Array`;
        }
    }

    return null; // ผ่านการตรวจสอบทั้งหมด (ไม่มี Error)
}

// ตั้งค่า Event Listeners สำหรับระบบ Export & Import JSON
document.addEventListener('DOMContentLoaded', () => {
    const exportModalEl = document.getElementById('exportModal');
    const importModalEl = document.getElementById('importModal');
    
    // สร้าง Instance ของ Bootstrap Modal
    const exportModal = new bootstrap.Modal(exportModalEl);
    const importModal = new bootstrap.Modal(importModalEl);

    const exportTextarea = document.getElementById('export-textarea');
    const btnCopyJson = document.getElementById('btn-copy-json');

    const importTextarea = document.getElementById('import-textarea');
    const importErrorAlert = document.getElementById('import-error-alert');
    const btnConfirmImport = document.getElementById('btn-confirm-import');

    // --- 1. การทำงานของ Export JSON ---
    document.getElementById('btn-open-export').addEventListener('click', () => {
        const currentData = getPortfolios();
        // แปลง Object เป็น JSON String แบบจัดหน้าสวยงาม (ย่อหน้า 2 spaces)
        exportTextarea.value = JSON.stringify(currentData, null, 2);
        
        // รีเซ็ตสถานะปุ่ม Copy เผื่อเคยกดค้างไว้
        btnCopyJson.textContent = 'Copy JSON';
        btnCopyJson.classList.replace('btn-success', 'btn-primary');
        
        exportModal.show();
    });

    // ปุ่ม Copy JSON ลง Clipboard
    btnCopyJson.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(exportTextarea.value);
            
            // แจ้งเตือนสั้นๆ บนปุ่มเมื่อคัดลอกสำเร็จ
            btnCopyJson.textContent = 'Copied!';
            btnCopyJson.classList.replace('btn-primary', 'btn-success');

            setTimeout(() => {
                btnCopyJson.textContent = 'Copy JSON';
                btnCopyJson.classList.replace('btn-success', 'btn-primary');
            }, 2000);
        } catch (err) {
            // Fallback กรณี Browser บล็อก Clipboard API
            exportTextarea.select();
            document.execCommand('copy');
            btnCopyJson.textContent = 'Copied!';
        }
    });

    // --- 2. การทำงานของ Import JSON ---
    document.getElementById('btn-open-import').addEventListener('click', () => {
        // ล้างค่าเก่าและซ่อน Error Alert ทุกครั้งที่เปิดหน้าต่างใหม่
        importTextarea.value = '';
        importErrorAlert.classList.add('d-none');
        importErrorAlert.textContent = '';
        
        importModal.show();
    });

    // ปุ่ม Confirm / Import
    btnConfirmImport.addEventListener('click', async () => {
        const rawInput = importTextarea.value.trim();
        importErrorAlert.classList.add('d-none');

        if (!rawInput) {
            importErrorAlert.textContent = 'กรุณาวางข้อมูล JSON ก่อนกดยืนยัน';
            importErrorAlert.classList.remove('d-none');
            return;
        }

        // ขั้นที่ 1: ตรวจสอบไวยากรณ์ (Syntax) ด้วย JSON.parse()
        let parsedData;
        try {
            parsedData = JSON.parse(rawInput);
        } catch (syntaxErr) {
            importErrorAlert.textContent = `รูปแบบ JSON ไม่ถูกต้อง (Syntax Error): ${syntaxErr.message}`;
            importErrorAlert.classList.remove('d-none');
            return; // หยุดทำงานทันที ไม่บันทึกทับข้อมูลเดิม
        }

        // ขั้นที่ 2: ตรวจสอบโครงสร้างข้อมูล (Structure Validation)
        const validationError = validatePortfolioSchema(parsedData);
        if (validationError) {
            importErrorAlert.textContent = validationError;
            importErrorAlert.classList.remove('d-none');
            return; // หยุดทำงานทันที ไม่บันทึกทับข้อมูลเดิม
        }

        // ขั้นที่ 3: ส่งข้อมูลไปบันทึกลง Backend Storage (PHP)
        try {
            btnConfirmImport.disabled = true;
            btnConfirmImport.textContent = 'Importing...';

            const formData = new FormData();
            formData.append('action', 'import_portfolios');
            formData.append('jsonData', JSON.stringify(parsedData));

            const res = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลบนเซิร์ฟเวอร์');
            }

            // ขั้นที่ 4: อัปเดตตัวแปรในหน้าเว็บ, ตั้งค่า Active ID ใหม่, Render ทันที และปิด Modal
            cachedPortfolios = result.portfolios;
            if (cachedPortfolios.length > 0) {
                localStorage.setItem(ACTIVE_ID_KEY, cachedPortfolios[0].id);
            } else {
                localStorage.removeItem(ACTIVE_ID_KEY);
            }

            renderAll();
            importModal.hide();

        } catch (err) {
            importErrorAlert.textContent = err.message;
            importErrorAlert.classList.remove('d-none');
        } finally {
            btnConfirmImport.disabled = false;
            btnConfirmImport.textContent = 'Confirm / Import';
        }
    });
});

// โหลดข้อมูลจาก PHP Server ทันทีเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', async () => {
    await fetchPortfoliosFromServer();
    renderAll();
});