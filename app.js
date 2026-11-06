const $ = (selector) => document.querySelector(selector);

// แปลงลิงก์เป็น <a> tag ธรรมดา
function createLinkElement(text) {
    const urlText = text.trim();
    if (!urlText) return null;

    const a = document.createElement('a');
    a.href = urlText.startsWith('http') ? urlText : `https://${urlText}`;
    a.textContent = urlText;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
}

// suffix '' = portfolio 1 (sample-portfolio-1.json), '-2' = portfolio 2 (sample-portfolio-2.json)
function setupPortfolio(suffix = '') {
    // กำหนดชื่อ Key ตามไฟล์ JSON ที่กำหนด
    const STORAGE_KEY = suffix === '-2' ? 'sample-portfolio-2.json' : 'sample-portfolio-1.json';
    const getEl = (name) => $(`#${name}${suffix}`);

    // ดึงข้อมูลทั้งหมดจาก localStorage (หรือคืนค่าออบเจกต์ว่างถ้ายังไม่มี)
    function getStoredData() {
        const raw = localStorage.getItem(STORAGE_KEY);
        try {
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    // แสดงข้อมูล Profile
    function showProfile(data) {
        if (!data) return;
        getEl('fname-display').textContent = data.displayName || 'Your Name';
        
        const emailEl = getEl('femail-display');
        emailEl.textContent = data.email || 'example@example.com';
        emailEl.href = data.email ? `mailto:${data.email}` : '#';

        const phoneEl = getEl('fphone-display');
        phoneEl.textContent = data.phone || '123-456-7890';
        phoneEl.href = data.phone ? `tel:${data.phone}` : '#';

        getEl('fliketodo-display').textContent = data.whatIEnjoy || '-';
        getEl('ftry-display').textContent = data.whatIveTried || '-';
        getEl('fCurious-display').textContent = data.whatImCuriousAbout || '-';
    }

    // แสดงข้อมูล Item/ผลงาน
    function showItem(data) {
        if (!data) return;
        getEl('item-title-display').textContent = data.title || 'TITLE';
        getEl('item-type-display').textContent = data.type || '-';
        getEl('item-date-display').textContent = data.date || '-';
        getEl('item-role-display').textContent = data.role || '-';
        getEl('item-reflection-display').textContent = data.reflection || '-';

        // แสดง Skills
        const skillsContainer = getEl('item-skills-display');
        skillsContainer.innerHTML = data.skills?.map(s => `<li>${s.trim()}</li>`).join('') || '';

        // แสดง Evidence เป็นลิงก์ธรรมดา
        const evidenceContainer = getEl('item-evidence-display');
        evidenceContainer.innerHTML = '';
        
        if (data.evidence && data.evidence.length > 0) {
            data.evidence.forEach(link => {
                const elem = createLinkElement(link);
                if (elem) {
                    const p = document.createElement('p');
                    p.className = 'mb-1';
                    p.appendChild(elem);
                    evidenceContainer.appendChild(p);
                }
            });
        }
        
        if (!evidenceContainer.children.length) {
            evidenceContainer.innerHTML = '<p class="mb-0">-</p>';
        }
    }

    // Submit Profile Form
    getEl('profile-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const profileData = {
            displayName: getEl('fname').value,
            email: getEl('femail').value,
            phone: getEl('fphone').value,
            whatIEnjoy: getEl('fliketodo').value,
            whatIveTried: getEl('ftry').value,
            whatImCuriousAbout: getEl('fCurious').value
        };
        showProfile(profileData);

        const currentData = getStoredData();
        currentData.profile = profileData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    });

    // Submit Item Form
    getEl('item-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const itemData = {
            title: getEl('ftitle').value,
            type: getEl('ftype').value,
            date: getEl('fdate').value,
            role: getEl('frole').value,
            skills: getEl('fskill').value.split(',').filter(Boolean),
            reflection: getEl('freflection').value,
            evidence: getEl('fevidence').value.split(',').filter(Boolean)
        };
        showItem(itemData);

        const currentData = getStoredData();
        currentData.item = itemData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    });

    // โหลดข้อมูลเก่าจาก localStorage ตอนเปิดหน้าเว็บ
    const savedData = getStoredData();
    if (savedData.profile) showProfile(savedData.profile);
    if (savedData.item) showItem(savedData.item);
}

// ทำงานเมื่อโหลด DOM เสร็จ
window.addEventListener('DOMContentLoaded', () => {
    setupPortfolio('');   //-> sample-portfolio-1.json
    setupPortfolio('-2'); //-> sample-portfolio-2.json
});