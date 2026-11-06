const $ = (selector) => document.querySelector(selector);

// suffix '' = portfolio 1, '-2' = portfolio 2
function setupPortfolio(suffix) {
    const KEY_PROFILE = `powerup-portfolio-profile${suffix}`;
    const KEY_ITEM = `powerup-portfolio-item${suffix}`;
    const id = (name) => `#${name}${suffix}`;

    const profileForm = $(id('profile-form'));
    const itemForm = $(id('item-form'));

    function showProfile(profile) {
        $(id('fname-display')).textContent = profile.displayName || 'Your Name';

        const emailElem = $(id('femail-display'));
        emailElem.textContent = profile.email || 'example@example.com';
        emailElem.href = profile.email ? `mailto:${profile.email}` : '#';

        const phoneElem = $(id('fphone-display'));
        phoneElem.textContent = profile.phone || '123-456-7890';
        phoneElem.href = profile.phone ? `tel:${profile.phone}` : '#';

        $(id('fliketodo-display')).textContent = profile.whatIEnjoy || '...';
        $(id('ftry-display')).textContent = profile.whatIveTried || '...';
        $(id('fCurious-display')).textContent = profile.whatImCuriousAbout || '...';
    }

    function showItem(item) {
        $(id('item-title-display')).textContent = item.title || 'TITLE';
        $(id('item-type-display')).textContent = item.type || '-';
        $(id('item-date-display')).textContent = item.date || '-';
        $(id('item-role-display')).textContent = item.role || '-';
        $(id('item-reflection-display')).textContent = item.reflection || '-';

        const skillsContainer = $(id('item-skills-display'));
        skillsContainer.innerHTML = '';
        (item.skills || []).forEach((skill) => {
            const li = document.createElement('li');
            li.textContent = skill.trim();
            skillsContainer.appendChild(li);
        });
    }

    profileForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const error = $(id('portfolio-error'));

        const name = $(id('fname')).value.trim();
        const email = $(id('femail')).value.trim();
        const phone = $(id('fphone')).value.trim();
        const enjoy = $(id('fliketodo')).value.trim();
        const tried = $(id('ftry')).value.trim();
        const curious = $(id('fCurious')).value.trim();

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
        localStorage.setItem(KEY_PROFILE, JSON.stringify(profileData));
    });

    itemForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const error = $(id('item-error'));

        const title = $(id('ftitle')).value.trim();
        const type = $(id('ftype')).value.trim();
        const date = $(id('fdate')).value;
        const role = $(id('frole')).value.trim();
        const skillsRaw = $(id('fskill')).value.trim();
        const reflection = $(id('freflection')).value.trim();

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
            skills: skillsRaw.split(',').filter((s) => s.trim() !== ''),
            reflection: reflection
        };
        showItem(itemData);
        localStorage.setItem(KEY_ITEM, JSON.stringify(itemData));
    });

    // โหลดข้อมูลที่บันทึกไว้ตอนเปิดหน้าเว็บ
    const savedProfile = localStorage.getItem(KEY_PROFILE);
    if (savedProfile) {
        try { showProfile(JSON.parse(savedProfile)); }
        catch (e) { console.error('Error parsing profile data:', e); }
    }
    const savedItem = localStorage.getItem(KEY_ITEM);
    if (savedItem) {
        try { showItem(JSON.parse(savedItem)); }
        catch (e) { console.error('Error parsing item data:', e); }
    }
}

window.addEventListener('DOMContentLoaded', function () {
    setupPortfolio('');    // portfolio 1
    setupPortfolio('-2');  // portfolio 2
});