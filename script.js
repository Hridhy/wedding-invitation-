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

function startMusic() {
    if (!music) return;
    music.volume = 0.7;
    music.play().then(() => { musicIcon.textContent = "Ⅱ"; })
                .catch(err => console.log("Music could not start:", err));
}

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
        slideButton.style.transform = "translateX(0)";   // spring back
        slideText.style.opacity = 1;
    }
}
slideButton.addEventListener("pointerup", endDrag);
slideButton.addEventListener("pointercancel", endDrag);


/* =====================================================
   OPEN INVITATION
===================================================== */
function openInvitation() {
    if (completed) return;
    completed = true;
    startMusic();                       // allowed: triggered by the user's swipe
    pageOne.classList.add("opened");    // slides page 1 away; page 2 scrolls by itself
}