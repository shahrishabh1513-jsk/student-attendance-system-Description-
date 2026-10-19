# Student Attendance System (frontend only, localStorage)
Login: username `Rishabh Shah`, password `1504`.
Run: host the folder (GitHub Pages / Netlify / `npx serve` / `python3 -m http.server`) and open index.html.
QR check-in needs the site reachable from students' phones (HTTPS or LAN) and camera needs HTTPS or localhost.

## QR flow (live)
Teacher opens qr.html -> students scan -> attend.html connects to the teacher's page over WebRTC (PeerJS, public signalling) and the teacher's list updates instantly. Teacher keeps qr.html open until "Finish & Save".
