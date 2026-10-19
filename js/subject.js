document.addEventListener('DOMContentLoaded', function () {
    initTheme(); attachRipple(); setupScrollToTop(document.getElementById('scroll-top'));
    if (!requireLogin('index.html')) return; wireAppNav();

    const $ = (id) => document.getElementById(id);
    const ttEl = $('timetable'), tabsEl = $('tt-tabs'), batchSection = $('batch-section'), batchGridEl = $('batch-grid');
    const summaryEl = $('selected-summary'), takeBtn = $('take-attendance-btn'), qrBtn = $('qr-btn'), alertDiv = $('selection-alert');
    const today = todayName(), todayDateStr = new Date().toISOString().slice(0, 10);
    let selectedDay = null, selectedPeriod = null, selectedBatch = null, activeDay = WEEK_DAYS.includes(today) ? today : WEEK_DAYS[0];

    const taken = {};
    Store.get(STORAGE_KEYS.RECORDS, []).filter((r) => String(r.date).slice(0, 10) === todayDateStr)
        .forEach((r) => { (taken[`${r.day}|${r.subject}|${r.start || ''}`] = taken[`${r.day}|${r.subject}|${r.start || ''}`] || []).push(r.batch ? BATCH_LABELS[r.batch] : 'All Students'); });

    tabsEl.innerHTML = WEEK_DAYS.map((d) => `<button class="tt-tab" data-day="${d}">${d.slice(0, 3)}${d === today ? ' •' : ''}</button>`).join('');
    ttEl.innerHTML = WEEK_DAYS.map((day) => `
        <div class="tt-day ${day === today ? 'is-today' : ''}" data-day="${day}">
            <div class="tt-day-head"><b>${day}</b><small>${day === today ? 'Today' : TIMETABLE[day].length + ' lectures'}</small></div>
            ${TIMETABLE[day].map((s, i) => {
                const t = taken[`${day}|${s.subject}|${s.start}`];
                return `<div class="tt-cell type-${s.type.toLowerCase()}" data-day="${day}" data-period="${i}" style="animation-delay:${i * 0.06}s">
                    ${day === today && t ? `<span class="tt-taken" title="Already taken: ${t.join(', ')}"><i class="fas fa-circle-check"></i></span>` : ''}
                    <span class="tt-type">${s.type}</span>
                    <span class="tt-time">${formatTime12(s.start)} – ${formatTime12(s.end)}</span>
                    <span class="tt-subj">${s.subject}</span></div>`; }).join('')}
        </div>`).join('');

    function showDay(d) {
        activeDay = d;
        ttEl.querySelectorAll('.tt-day').forEach((e) => e.classList.toggle('show', e.dataset.day === d));
        tabsEl.querySelectorAll('.tt-tab').forEach((e) => e.classList.toggle('active', e.dataset.day === d));
    }
    tabsEl.querySelectorAll('.tt-tab').forEach((b) => b.addEventListener('click', () => showDay(b.dataset.day)));
    showDay(activeDay);

    const slot = () => (selectedDay ? TIMETABLE[selectedDay][selectedPeriod] : null);

    ttEl.querySelectorAll('.tt-cell').forEach((cell) => cell.addEventListener('click', () => {
        selectedDay = cell.dataset.day; selectedPeriod = Number(cell.dataset.period); selectedBatch = null;
        ttEl.querySelectorAll('.tt-cell').forEach((c) => c.classList.remove('selected')); cell.classList.add('selected');
        updateBatchSection(); updateSummary(); updateButtons(); hideAlert();
        if (slot().type !== 'Lab') summaryEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }));

    function updateBatchSection() {
        const s = slot();
        if (s && s.type === 'Lab') {
            batchSection.style.display = 'block'; batchGridEl.innerHTML = '';
            [1, 2].forEach((n) => {
                const card = document.createElement('div'); card.className = 'batch-card';
                card.innerHTML = `<div class="batch-icon"><i class="fas ${n === 1 ? 'fa-code' : 'fa-microchip'}"></i></div><div><div class="batch-name">${BATCH_LABELS[n]}</div><div class="batch-meta">${STUDENTS.filter((x) => x.batch === n).length} students</div></div>`;
                card.addEventListener('click', () => { selectedBatch = n; batchGridEl.querySelectorAll('.batch-card').forEach((c) => c.classList.remove('selected')); card.classList.add('selected'); updateSummary(); updateButtons(); hideAlert(); });
                batchGridEl.appendChild(card);
            });
        } else batchSection.style.display = 'none';
    }
    function updateSummary() {
        const s = slot();
        if (!s) return summaryEl.classList.remove('show');
        summaryEl.classList.add('show');
        $('sum-subject').textContent = s.subject;
        $('sum-time').textContent = `${selectedDay} · ${formatTime12(s.start)} – ${formatTime12(s.end)}`;
        $('sum-type').textContent = s.type;
        $('sum-batch').textContent = s.type === 'Lab' ? (selectedBatch ? BATCH_LABELS[selectedBatch] : 'Choose a batch below') : 'All Students (Both Batches)';
    }
    function updateButtons() { const s = slot(), ok = s && (s.type === 'Theory' || selectedBatch !== null); takeBtn.disabled = !ok; qrBtn.disabled = !ok; }
    function showAlert(m, type = 'warning') { alertDiv.className = `alert alert-${type}`; alertDiv.querySelector('span').textContent = m; alertDiv.style.display = 'flex'; }
    function hideAlert() { alertDiv.style.display = 'none'; }

    qrBtn.addEventListener('click', () => {
        const s = slot(); if (!s) return showAlert('Please select a lecture first.');
        if (s.type === 'Lab' && !selectedBatch) return showAlert('Please choose a batch for this lab.');
        location.href = `qr.html?lec=${encodeURIComponent(selectedDay + '|' + selectedPeriod)}${selectedBatch ? '&batch=' + selectedBatch : ''}`;
    });
    takeBtn.addEventListener('click', () => {
        const s = slot(); if (!s) return showAlert('Please select a lecture from the timetable to continue.');
        if (s.type === 'Lab' && !selectedBatch) return showAlert('This is a lab session — please choose a batch before continuing.');
        const subj = { name: s.subject, type: s.type, start: s.start, end: s.end };
        Store.set(STORAGE_KEYS.SUBJECT, subj); Store.set(STORAGE_KEYS.DAY, selectedDay);
        Store.set(STORAGE_KEYS.BATCH, s.type === 'Lab' ? selectedBatch : 0); localStorage.setItem(STORAGE_KEYS.DATE, new Date().toISOString());
        const chk = Store.get(STORAGE_KEYS.SUBJECT);
        if (!chk || chk.name !== subj.name) return showAlert('Could not save your selection — your browser may be blocking local storage (private mode?).', 'danger');
        takeBtn.innerHTML = '<span class="spinner"></span> Redirecting…'; takeBtn.disabled = true;
        setTimeout(() => (location.href = 'student.html'), 600);
    });
    updateSummary(); updateButtons();
});
