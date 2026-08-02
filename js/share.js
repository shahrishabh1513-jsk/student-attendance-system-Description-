/**
 * share.js — "Share Report" feature.
 */
const ShareReport = (() => {
    let modalEl = null;
    let currentRecordProvider = null;
    let selectedFormat = 'image';

    function ensureModal() {
        if (modalEl) return modalEl;

        modalEl = document.createElement('div');
        modalEl.className = 'overlay no-print';
        modalEl.id = 'share-overlay';
        modalEl.innerHTML = `
            <div class="glass-card share-modal-card">
                <h3><i class="fas fa-share-nodes"></i> Share Report</h3>
                <p class="share-modal-sub">Choose a file format, then share it directly or send it via WhatsApp / Email.</p>

                <div class="share-section-label">File format</div>
                <div class="share-format-row">
                    <button type="button" class="share-format-btn active" data-format="image"><i class="fas fa-image"></i> Image</button>
                    <button type="button" class="share-format-btn" data-format="pdf"><i class="fas fa-file-pdf"></i> PDF</button>
                    <button type="button" class="share-format-btn" data-format="excel"><i class="fas fa-file-excel"></i> Excel</button>
                </div>

                <div class="share-section-label">Share via</div>
                <div class="share-platform-row">
                    <button type="button" class="share-platform-btn device" id="share-device-btn"><i class="fas fa-arrow-up-from-bracket"></i> Share via Device (recommended)</button>
                    <button type="button" class="share-platform-btn whatsapp" id="share-whatsapp-btn"><i class="fa-brands fa-whatsapp"></i> WhatsApp</button>
                    <button type="button" class="share-platform-btn email" id="share-email-btn"><i class="fas fa-envelope"></i> Email</button>
                </div>

                <div class="share-status" id="share-status"></div>
                <p class="share-note">"Share via Device" hands the actual file straight to WhatsApp, Gmail, etc. through your phone/browser's share sheet. WhatsApp and Email buttons instead download the file and open a pre-filled message — browsers can't attach files to those links automatically, so just attach the downloaded file when prompted.</p>

                <div class="modal-actions" style="margin-top:16px;">
                    <button class="btn btn-outline ripple" id="share-close-btn">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalEl);
        attachRipple(modalEl);

        modalEl.querySelectorAll('.share-format-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                modalEl.querySelectorAll('.share-format-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                selectedFormat = btn.dataset.format;
                setStatus('');
            });
        });

        modalEl.querySelector('#share-close-btn').addEventListener('click', closeModal);
        modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });

        modalEl.querySelector('#share-device-btn').addEventListener('click', () => handleShare('device'));
        modalEl.querySelector('#share-whatsapp-btn').addEventListener('click', () => handleShare('whatsapp'));
        modalEl.querySelector('#share-email-btn').addEventListener('click', () => handleShare('email'));

        return modalEl;
    }

    function setStatus(message, isError = false) {
        const statusEl = modalEl.querySelector('#share-status');
        statusEl.textContent = message;
        statusEl.style.color = isError ? 'var(--danger)' : 'var(--text-muted)';
    }

    function openModal(recordProvider) {
        currentRecordProvider = recordProvider;
        selectedFormat = 'image';
        ensureModal();
        modalEl.querySelectorAll('.share-format-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
        setStatus('');
        modalEl.classList.add('show');
    }

    function closeModal() {
        if (modalEl) modalEl.classList.remove('show');
    }

    function fileSafeName(record) {
        return `${record.subject}_${String(record.date).slice(0, 10)}`.replace(/[^a-z0-9]+/gi, '_');
    }

    function populatePrintReport(record) {
        const el = (id) => document.getElementById(id);
        el('print-college').textContent = COLLEGE_NAME;
        el('print-subject').textContent = record.subject;
        el('print-faculty').textContent = record.faculty;
        el('print-date').textContent = formatDateLong(record.date);
        el('print-time').textContent = record.timing;
        el('print-batch').textContent = record.batchLabel;
        el('print-total').textContent = record.summary.total;
        el('print-present').textContent = record.summary.present;
        el('print-absent').textContent = record.summary.absent;
        el('print-percentage').textContent = `${record.summary.percentage}%`;

        el('print-table-body').innerHTML = record.students.map((s, i) => {
            const isAbsent = s.attendance === false;
            const statusLabel = s.attendance === true ? 'Present' : s.attendance === false ? 'Absent' : 'Pending';
            const statusClass = s.attendance === true ? 'print-status-present' : s.attendance === false ? 'print-status-absent' : 'print-status-pending';
            const nameHtml = isAbsent
                ? `<span class="print-name-absent">${s.name}</span>`
                : `<span class="print-name-plain">${s.name}</span>`;
            return `
                <tr>
                    <td>${i + 1}</td>
                    <td>${s.enrollmentNo}</td>
                    <td class="print-name-cell">${nameHtml}</td>
                    <td class="${statusClass}">${statusLabel}</td>
                </tr>`;
        }).join('');
    }

    async function captureReportCanvas(record) {
        if (typeof html2canvas === 'undefined') {
            throw new Error('Image/PDF export library did not load. Check your internet connection and try again.');
        }
        populatePrintReport(record);
        const node = document.getElementById('print-report');

        const prevStyle = node.getAttribute('style') || '';
        node.style.display = 'block';
        node.style.position = 'fixed';
        node.style.left = '-9999px';
        node.style.top = '0';
        node.style.width = '780px';
        node.style.background = '#ffffff';
        node.style.padding = '24px';
        node.style.zIndex = '-1';

        try {
            const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
            return canvas;
        } finally {
            node.setAttribute('style', prevStyle);
        }
    }

    async function generateImageFile(record) {
        const canvas = await captureReportCanvas(record);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        return { blob, filename: `${fileSafeName(record)}.png`, mime: 'image/png' };
    }

    async function generatePdfFile(record) {
        if (typeof window.jspdf === 'undefined') {
            throw new Error('PDF export library did not load. Check your internet connection and try again.');
        }
        const canvas = await captureReportCanvas(record);
        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 20;
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 40);

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 20;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const blob = pdf.output('blob');
        return { blob, filename: `${fileSafeName(record)}.pdf`, mime: 'application/pdf' };
    }

    function generateExcelFile(record) {
        const rows = [['#', 'Enrollment No.', 'Student Name', 'Course', 'Status']];
        record.students.forEach((s, i) => {
            const status = s.attendance === true ? 'Present' : s.attendance === false ? 'Absent' : 'Pending';
            rows.push([i + 1, s.enrollmentNo, s.name, s.course, status]);
        });

        const escapeHtml = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const tableRows = rows.map((row, i) => {
            const cells = row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('');
            return i === 0 ? `<tr style="font-weight:bold;background:#F4B400;">${cells}</tr>` : `<tr>${cells}</tr>`;
        }).join('');

        const html = `
            <html xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head><meta charset="UTF-8"></head>
            <body>
                <table border="1">
                    <tr><td colspan="5" style="font-weight:bold;font-size:14px;">${escapeHtml(record.subject)} — ${escapeHtml(formatDateLong(record.date))}</td></tr>
                    <tr><td colspan="5">Faculty: ${escapeHtml(record.faculty)} | Batch: ${escapeHtml(record.batchLabel)} | Present: ${record.summary.present}/${record.summary.total} (${record.summary.percentage}%)</td></tr>
                    <tr><td colspan="5"></td></tr>
                    ${tableRows}
                </table>
            </body>
            </html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        return { blob, filename: `${fileSafeName(record)}.xls`, mime: 'application/vnd.ms-excel' };
    }

    async function generateFile(record, format) {
        if (format === 'image') return generateImageFile(record);
        if (format === 'pdf') return generatePdfFile(record);
        return generateExcelFile(record);
    }

    function downloadBlob(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    }

    async function handleShare(platform) {
        if (!currentRecordProvider) return;
        const record = currentRecordProvider();
        if (!record) {
            setStatus('Nothing to share yet.', true);
            return;
        }

        setStatus('Preparing file…');

        try {
            const { blob, filename, mime } = await generateFile(record, selectedFormat);
            const shareText = `Attendance report — ${record.subject} (${formatDateLong(record.date)}). Present: ${record.summary.present}/${record.summary.total} (${record.summary.percentage}%).`;

            if (platform === 'device') {
                const file = new File([blob], filename, { type: mime });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: 'Attendance Report', text: shareText });
                    setStatus('Shared successfully.');
                    showToast('Report shared.', 'success');
                    return;
                }
                downloadBlob(blob, filename);
                setStatus('Your device doesn\'t support direct file sharing — the file was downloaded instead.');
                showToast('File downloaded. Share it manually from your downloads.', 'info');
                return;
            }

            if (platform === 'whatsapp') {
                downloadBlob(blob, filename);
                const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' (see attached file — attach it from your downloads)')}`;
                window.open(waUrl, '_blank');
                setStatus('File downloaded — attach it in the WhatsApp chat that just opened.');
                showToast('File downloaded. Attach it in WhatsApp to send.', 'info');
                return;
            }

            if (platform === 'email') {
                downloadBlob(blob, filename);
                const subject = `Attendance Report — ${record.subject}`;
                const body = `${shareText}\n\n(The report file has been downloaded to your device — please attach it to this email before sending.)`;
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                setStatus('File downloaded — attach it to the email that just opened.');
                showToast('File downloaded. Attach it to your email to send.', 'info');
            }
        } catch (err) {
            console.error('Share failed:', err);
            setStatus(err.message || 'Something went wrong while preparing the file.', true);
            showToast('Could not prepare the file for sharing.', 'error');
        }
    }

    return { openModal, closeModal };
})();