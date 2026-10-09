/* =====================================================
   COUNTDOWN  (unchanged)
===================================================== */
const weddingDate = new Date("2026-12-13T12:00:00+05:30").getTime();

function updateCountdown() {
    const difference = weddingDate - Date.now();
    const set = (id, v) => document.getElementById(id).textContent = String(v).padStart(2, "0");

    if (difference <= 0) { set("days",0); set("hours",0); set("minutes",0); set("seconds",0); return; }

    set("days",    Math.floor(difference / 86400000));
    set("hours",   Math.floor(difference / 3600000) % 24);
    set("minutes", Math.floor(difference / 60000) % 60);
    set("seconds", Math.floor(difference / 1000) % 60);
}
updateCountdown();
setInterval(updateCountdown, 1000);


/* =====================================================
   MUSIC
===================================================== */
const music = document.getElementById("weddingMusic");
const musicButton = document.getElementById("musicButton");
const musicIcon = document.getElementById("musicIcon");

let musicWanted = false;

function startMusic() {
    if (!music) return;
    musicWanted = true;
    music.muted = false;
    music.volume = 0.7;
    music.play()
        .then(() => { musicIcon.textContent = "Ⅱ"; })
        .catch(err => console.log("Blocked, will retry on next touch:", err));
}

// Mobile fix: if the first attempt was blocked, retry on the finger-lift / tap
["touchend", "click"].forEach(evt => {
    document.addEventListener(evt, () => {
        if (musicWanted && music.paused) startMusic();
    }, { passive: true });
});

musicButton.addEventListener("click", function () {
    if (music.paused) {
        music.play().then(() => { musicIcon.textContent = "Ⅱ"; }).catch(console.log);
    } else {
        music.pause();
        musicIcon.textContent = "♪";
    }
});


/* =====================================================
   SLIDE TO OPEN
   FIX 14: the old code moved the WHOLE track (text + button) and used
   separate touch/mouse code with a stale 'currentX'. Now:
   - only the white circle moves
   - one Pointer Events handler covers touch + mouse
   - works at any screen width (distance is measured, not hard-coded)
===================================================== */
const slideTrack  = document.getElementById("slideTrack");
const slideButton = document.getElementById("slideButton");
const slideText   = document.getElementById("slideText");
const pageOne     = document.getElementById("pageOne");

let dragging = false, startX = 0, dx = 0, completed = false;

const maxMove = () => slideTrack.clientWidth - slideButton.offsetWidth;

slideButton.addEventListener("pointerdown", e => {
    if (completed) return;
    dragging = true;
    startX = e.clientX;
    dx = 0;
    slideButton.setPointerCapture(e.pointerId);
    slideButton.classList.add("dragging");

    // NEW: prime the audio silently on touch so the browser allows it
music.muted = true;
music.play().catch(() => {});
});

slideButton.addEventListener("pointermove", e => {
    if (!dragging) return;
    dx = Math.min(Math.max(e.clientX - startX, 0), maxMove());
    slideButton.style.transform = `translateX(${dx}px)`;
    slideText.style.opacity = 1 - dx / maxMove();
});

function endDrag() {
    if (!dragging) return;
    dragging = false;
    slideButton.classList.remove("dragging");

    if (dx > maxMove() * 0.7) {
        slideButton.style.transform = `translateX(${maxMove()}px)`;
        openInvitation();
    } else {
        music.pause();
music.currentTime = 0;
music.muted = false;
        slideButton.style.transform = "translateX(0)";   // spring back
        slideText.style.opacity = 1;
    }
}
slideButton.addEventListener("pointerup", endDrag);
slideButton.addEventListener("pointercancel", endDrag);

// iPhone fix: a plain TAP on the circle also opens + plays music
slideButton.addEventListener("click", () => {
    if (completed) return;
    slideButton.style.transform = `translateX(${maxMove()}px)`;
    openInvitation();
});


/* =====================================================
   OPEN INVITATION
===================================================== */
function openInvitation() {
    if (completed) return;
    completed = true;
    startMusic();                       // allowed: triggered by the user's swipe
    pageOne.classList.add("opened");    // slides page 1 away; page 2 scrolls by itself
    musicFloat.classList.add("show");
}
const musicFloat = document.getElementById("musicFloat");

musicFloat.addEventListener("click", () => {
    if (music.paused) { startMusic(); musicFloat.textContent = "Ⅱ"; }
    else { music.pause(); musicFloat.textContent = "♪"; }
});