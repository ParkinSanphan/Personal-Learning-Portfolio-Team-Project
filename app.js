const STORAGE_KEY_PROFILE = 'powerup-portfolio-profile';
const STORAGE_KEY_ITEM = 'powerup-portfolio-item';

const profileForm = document.querySelector('#profile-form');
const itemForm = document.querySelector('#item-form');

// ฟังก์ชันอัปเดตข้อมูล Profile บนหน้าเว็บ
function showProfile(profile) {
    document.querySelector('#fname-display').textContent = profile.displayName || 'Your Name';
    
    const emailElem = document.querySelector('#femail-display');
    emailElem.textContent = profile.email || 'example@example.com';
    emailElem.href = profile.email ? `mailto:${profile.email}` : '#';

    const phoneElem = document.querySelector('#fphone-display');
    phoneElem.textContent = profile.phone || '123-456-7890';
    phoneElem.href = profile.phone ? `tel:${profile.phone}` : '#';

    document.querySelector('#fliketodo-display').textContent = profile.whatIEnjoy || '...';
    document.querySelector('#ftry-display').textContent = profile.whatIveTried || '...';
    document.querySelector('#fCurious-display').textContent = profile.whatImCuriousAbout || '...';
}

// ฟังก์ชันอัปเดตข้อมูล Portfolio Item บนหน้าเว็บ
function showItem(item) {
    document.querySelector('#item-title-display').textContent = item.title || 'TITLE';
    document.querySelector('#item-type-display').textContent = item.type || '-';
    document.querySelector('#item-date-display').textContent = item.date || '-';
    document.querySelector('#item-role-display').textContent = item.role || '-';
    document.querySelector('#item-reflection-display').textContent = item.reflection || '-';

    const skillsContainer = document.querySelector('#item-skills-display');
    skillsContainer.innerHTML = '';
    if (item.skills && item.skills.length > 0) {
        item.skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill.trim();
            skillsContainer.appendChild(li);
        });
    }
}

// Submit Profile Form
profileForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const error = document.querySelector('#portfolio-error');
    
    const name = document.querySelector('#fname').value.trim();
    const email = document.querySelector('#femail').value.trim();
    const phone = document.querySelector('#fphone').value.trim();
    const enjoy = document.querySelector('#fliketodo').value.trim();
    const tried = document.querySelector('#ftry').value.trim();
    const curious = document.querySelector('#fCurious').value.trim();

    // Validation ตรวจสอบข้อมูลว่าง
    if (!name || !email || !phone || !enjoy || !tried || !curious) {
        error.textContent = 'กรุณากรอกข้อมูลโปรไฟล์ให้ครบถ้วน';
        return;
    }
    
    error.textContent = '';
    
    const profileData = {
        displayName: name,
        email: email,
        phone: phone,
        whatIEnjoy: enjoy,
        whatIveTried: tried,
        whatImCuriousAbout: curious
    };
    
    showProfile(profileData);
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profileData));
});

// Submit Portfolio Item Form
itemForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const error = document.querySelector('#item-error');

    const title = document.querySelector('#ftitle').value.trim();
    const type = document.querySelector('#ftype').value.trim();
    const date = document.querySelector('#fdate').value;
    const role = document.querySelector('#frole').value.trim();
    const skillsRaw = document.querySelector('#fskill').value.trim();
    const reflection = document.querySelector('#freflection').value.trim();

    // Validation ตรวจสอบข้อมูลว่าง
    if (!title || !type || !date || !role || !skillsRaw || !reflection) {
        error.textContent = 'กรุณากรอกข้อมูลผลงานให้ครบถ้วน';
        return;
    }

    error.textContent = '';

    const itemData = {
        title: title,
        type: type,
        date: date,
        role: role,
        skills: skillsRaw.split(',').filter(s => s.trim() !== ''),
        reflection: reflection
    };

    showItem(itemData);
    localStorage.setItem(STORAGE_KEY_ITEM, JSON.stringify(itemData));
});

// โหลดข้อมูลจาก localStorage เมื่อโหลดหน้าเว็บ (Save -> Refresh -> Load)
window.addEventListener('DOMContentLoaded', function () {
    const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (savedProfile) {
        try {
            showProfile(JSON.parse(savedProfile));
        } catch (e) {
            console.error('Error parsing profile data:', e);
        }
    }

    const savedItem = localStorage.getItem(STORAGE_KEY_ITEM);
    if (savedItem) {
        try {
            showItem(JSON.parse(savedItem));
        } catch (e) {
            console.error('Error parsing item data:', e);
        }
    }
});