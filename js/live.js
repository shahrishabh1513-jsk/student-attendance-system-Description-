/* Loads PeerJS (peer-to-peer, no server of ours) so a student's phone can talk to the teacher's page live. */
function loadPeerLib() {
    return new Promise((resolve, reject) => {
        if (window.Peer) return resolve();
        const urls = ['https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.2/peerjs.min.js', 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js', 'https://cdn.jsdelivr.net/npm/peerjs@1.5.2/dist/peerjs.min.js'];
        let i = 0;
        (function next() {
            if (i >= urls.length) return reject(new Error('PeerJS failed to load'));
            const s = document.createElement('script');
            s.src = urls[i++]; s.onload = () => (window.Peer ? resolve() : next()); s.onerror = next;
            document.head.appendChild(s);
        })();
    });
}
function deviceId() {
    let d = safeGetItem('attendanceDeviceId');
    if (!d) { d = 'd' + Math.random().toString(36).slice(2, 10); safeSetItem('attendanceDeviceId', d); }
    return d;
}
