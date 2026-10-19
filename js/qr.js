document.addEventListener('DOMContentLoaded', () => {
  initTheme(); attachRipple(); setupScrollToTop(document.getElementById('scroll-top'));
  if (!requireLogin('index.html')) return; wireAppNav();
  const $ = (id) => document.getElementById(id), AK = 'attendanceQRActive';
  const defBase = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
  $('base').value = Store.get('attendanceQRBase', defBase);
  const warn = () => { const h = $('base').value; $('warn').style.display = /localhost|127\.0\.0\.1|^file:/.test(h) ? 'flex' : 'none'; };
  $('base').oninput = warn; warn();

  /* lecture picker */
  const lec = $('lec'), today = todayName(), now = new Date(), hm = now.getHours() * 60 + now.getMinutes();
  let pick = null;
  WEEK_DAYS.forEach((d) => { const g = document.createElement('optgroup'); g.label = d;
    TIMETABLE[d].forEach((s, i) => { const o = document.createElement('option'); o.value = d + '|' + i;
      o.textContent = `${formatTime12(s.start)} – ${s.subject} (${s.type})`; g.appendChild(o);
      const [h, m] = s.start.split(':').map(Number), [h2, m2] = s.end.split(':').map(Number);
      if (d === today && !pick && hm < h2 * 60 + m2) pick = o.value; });
    lec.appendChild(g); });
  const qp = new URLSearchParams(location.search);
  lec.value = qp.get('lec') || pick || lec.options[0].value;
  if (qp.get('batch')) $('bat').value = qp.get('batch');
  const slot = () => { const [d, i] = lec.value.split('|'); return { d, s: TIMETABLE[d][i] }; };
  const sync = () => { $('batch-wrap').style.display = slot().s.type === 'Lab' ? 'block' : 'none'; };
  lec.onchange = sync; sync();

  let S = null, key = '', tick = null, peer = null, stream = null, scanning = false;
  const load = () => Store.get(key, {});
  const members = () => STUDENTS.filter((x) => !S.t || x.batch === S.t);
  const beep = () => { try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(); o.frequency.value = 880; o.connect(c.destination); o.start(); setTimeout(() => { o.stop(); c.close(); }, 120); } catch (e) { } };
  const setLive = (st) => { const c = $('live-chip'); c.className = 'chip-live ' + (st === 'live' ? 'live' : st === 'off' ? 'off' : '');
    c.textContent = st === 'live' ? 'Live — students can scan now' : st === 'off' ? 'Offline mode (same device / receipts only)' : 'Connecting…'; };

  function render() {
    const c = load(), keys = Object.keys(c), m = members();
    $('tot').textContent = m.length; $('cnt').textContent = keys.length; $('pbar').style.width = (m.length ? keys.length / m.length * 100 : 0) + '%';
    $('roster').innerHTML = keys.reverse().map((e) => { const st = STUDENTS.find((x) => x.enrollmentNo === e);
      return `<div class="chk"><b>${(st ? st.name : e).charAt(0)}</b><span>${st ? st.name : e}</span><small>${e.slice(-5)}</small><button data-e="${e}" title="Remove"><i class="fas fa-xmark"></i></button></div>`; }).join('')
      || '<p style="color:var(--text-muted)">Waiting for students to scan…</p>';
    $('roster').querySelectorAll('button').forEach((b) => b.onclick = () => { const x = load(); delete x[b.dataset.e]; Store.set(key, x); render(); });
  }
  function checkin(enr, dev) {
    if (!S) return { ok: false, err: 'Session closed' };
    if (Date.now() > S.x) return { ok: false, err: 'This QR has expired' };
    const e = String(enr || '').trim().toUpperCase(), st = STUDENTS.find((x) => x.enrollmentNo === e);
    if (!st) return { ok: false, err: 'Enrollment number not found' };
    if (S.t && st.batch !== S.t) return { ok: false, err: 'This lab is not for your batch' };
    const c = load();
    if (c[e]) return { ok: true, name: st.name, dup: true };
    if (dev && Object.keys(c).some((k) => c[k] && c[k].dev === dev)) return { ok: false, err: 'This phone already marked another student' };
    c[e] = { t: new Date().toISOString(), dev: dev || '' }; Store.set(key, c); render(); beep();
    showToast(st.name + ' is present', 'success'); return { ok: true, name: st.name };
  }

  function openPeer() {
    setLive('connecting');
    loadPeerLib().then(() => {
      try { if (peer) peer.destroy(); } catch (e) { }
      peer = new Peer('att-' + S.i);
      peer.on('open', () => setLive('live'));
      peer.on('connection', (c) => c.on('data', (m) => { const r = checkin(m && m.enr, m && m.dev); try { c.send(r); } catch (e) { } }));
      peer.on('disconnected', () => { setLive('connecting'); try { peer.reconnect(); } catch (e) { } });
      peer.on('error', (e) => { if (e.type === 'unavailable-id') setTimeout(openPeer, 3500); else if (e.type !== 'peer-unavailable') setLive('off'); });
    }).catch(() => setLive('off'));
  }

  function start(s) {
    S = s; key = 'attendanceQR_' + S.i; Store.set(AK, S);
    const { u, ...pub } = S;
    const link = u + 'attend.html#' + btoa(unescape(encodeURIComponent(JSON.stringify(pub))));
    $('qrcode').innerHTML = ''; new QRCode($('qrcode'), { text: link, width: 250, height: 250, correctLevel: QRCode.CorrectLevel.L });
    $('url').textContent = link; $('s-title').textContent = S.s;
    $('s-meta').textContent = `${S.d} · ${formatTime12(S.a)} – ${formatTime12(S.b)} · ${S.t ? BATCH_LABELS[S.t] : 'All students'}`;
    $('setup').style.display = 'none'; $('live').style.display = 'block'; render(); openPeer();
    clearInterval(tick);
    tick = setInterval(() => { const left = Math.max(0, S.x - Date.now());
      $('timer').textContent = left ? `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}` : 'Expired';
      $('timer').classList.toggle('low', left < 60000); render(); }, 1000);
  }
  $('gen').onclick = () => {
    const { d, s } = slot(); let b = $('base').value.trim() || defBase; if (!b.endsWith('/')) b += '/'; Store.set('attendanceQRBase', b);
    start({ i: Math.random().toString(36).slice(2, 8), s: s.subject, d, a: s.start, b: s.end, t: s.type === 'Lab' ? Number($('bat').value) : 0,
      x: Date.now() + Number($('dur').value) * 60000, f: safeGetItem(STORAGE_KEYS.USERNAME), u: b });
  };
  $('ext').onclick = () => { S.x = Math.max(S.x, Date.now()) + 300000; Store.set(AK, S); showToast('Extended by 5 minutes', 'success'); };
  $('manual').onclick = () => { const e = prompt('Enrollment number (e.g. 23SS02CA001):'); if (e) { const r = checkin(e, ''); if (!r.ok) showToast(r.err, 'error'); } };
  window.addEventListener('storage', () => S && render());

  $('scan').onclick = async () => {
    if (scanning) return stopCam();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const v = $('cam'); v.srcObject = stream; v.style.display = 'block'; await v.play(); scanning = true;
      const cv = document.createElement('canvas'), cx = cv.getContext('2d');
      (function loop() { if (!scanning) return;
        if (v.videoWidth) { cv.width = v.videoWidth; cv.height = v.videoHeight; cx.drawImage(v, 0, 0);
          const r = jsQR(cx.getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height);
          if (r && r.data.startsWith('RCPT|')) { const p = r.data.split('|'); if (p[1] === S.i) checkin(p[2], ''); } }
        requestAnimationFrame(loop); })();
    } catch (err) { showToast('Camera unavailable (needs HTTPS + permission)', 'error'); }
  };
  function stopCam() { scanning = false; if (stream) stream.getTracks().forEach((t) => t.stop()); $('cam').style.display = 'none'; }

  $('fin').onclick = () => {
    if (!confirm('Close the QR and save attendance? Students who did not check in are marked absent.')) return;
    stopCam(); clearInterval(tick); try { peer && peer.destroy(); } catch (e) { }
    const c = load(), m = members();
    const students = m.map((x) => ({ id: x.id, enrollmentNo: x.enrollmentNo, name: x.name, course: x.course, attendance: !!c[x.enrollmentNo] }));
    const present = students.filter((x) => x.attendance).length;
    const rec = { id: 'qr_' + Date.now(), date: new Date().toISOString(), savedAt: new Date().toISOString(), day: S.d, subject: S.s, start: S.a, end: S.b,
      timing: `${formatTime12(S.a)} – ${formatTime12(S.b)}`, batch: S.t, batchLabel: S.t ? BATCH_LABELS[S.t] : 'All Students', faculty: S.f, method: 'QR', students,
      summary: { total: m.length, present, absent: m.length - present, percentage: m.length ? Math.round(present / m.length * 100) : 0 } };
    const all = Store.get(STORAGE_KEYS.RECORDS, []); all.push(rec); Store.set(STORAGE_KEYS.RECORDS, all);
    Store.remove(key); Store.remove(AK);
    location.href = 'reports.html?record=' + encodeURIComponent(rec.id);
  };

  const saved = Store.get(AK); if (saved) start(saved); /* resume after refresh */
});
