// ==============================
// Angela / Gela Portfolio Script
// (bgm plays ONCE only when toggling theme; no ding; no autoplay)
// ==============================

// --- Firebase init (compat) ---
const firebaseConfig = {
  apiKey: "AIzaSyC2-8ZFH7gwHRRb4rT5hIBPK9PC9PCtGIpiNc", // keeping as provided
  authDomain: "gela-portfolio.firebaseapp.com",
  projectId: "gela-portfolio",
  storageBucket: "gela-portfolio.appspot.com",
  messagingSenderId: "132578520455",
  appId: "1:132578520455:web:75ce7cd4b8087b6655b722",
  measurementId: "G-YGF1F3P79M"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // no analytics needed

// ---------------------------
// Audio: ONLY what you need
// ---------------------------

// SFX: folder open (kept)
const clickAudio = new Audio("sounds/folder-click.mp3");
clickAudio.preload = "auto";
clickAudio.volume = 0.35;

// THEME "BGM" (but as a one-shot cue on toggle)
const themeBGM = new Audio();
themeBGM.preload = "auto";
themeBGM.loop = false;            // <<< IMPORTANT: no loop
themeBGM.volume = 0.25;
let isBgmPlaying = false;         // track one-shot state

function pickBgmTrack() {
  // choose which cue to play depending on current theme AFTER toggle
  return document.body.classList.contains("night-mode")
    ? "sounds/night-bgm.mp3"
    : "sounds/day-bgm.mp3";
}

// play once, then stop — no resume, no visibility tricks
async function playThemeCueOnce() {
  // stop any currently playing cue
  try { themeBGM.pause(); } catch {}
  themeBGM.currentTime = 0;

  // set the proper source for the *current* theme
  themeBGM.src = pickBgmTrack();

  // safety: when it ends, clear the flag
  themeBGM.onended = () => { isBgmPlaying = false; };

  try {
    await themeBGM.play(); // allowed because user just clicked the toggle
    isBgmPlaying = true;

    // double-safety: hard stop after 6s in case file is long
    setTimeout(() => {
      if (!themeBGM.paused) {
        try { themeBGM.pause(); } catch {}
        isBgmPlaying = false;
      }
    }, 6000);
  } catch {
    // ignore autoplay errors silently
  }
}

// NO visibilitychange handler for themeBGM (we don't want it to revive)

// ---------------------------
// DOM Ready
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const isMobile = () => window.innerWidth <= 768;
  const helloScreen        = document.getElementById("hello-screen");
  const helloText          = document.getElementById("hello-text");
  const desktop            = document.getElementById("desktop");
  const angelaIllustration = document.getElementById("angela-illustration");
  const themeToggle        = document.getElementById("theme-toggle");
  const body               = document.body;
  const folderContainer    = document.getElementById("folders");

    // --- percent helpers for folder positions ---
  function clamp(n, min, max){ return Math.max(min, Math.min(n, max)); }
  function pxToPct(px, total){ return total ? (px / total) * 100 : 0; }
  function pctToPx(pct, total){ return (pct / 100) * total; }

  function getContainerRect(){
    const el = folderContainer || document.body;
    return el.getBoundingClientRect();
  }

  function applyFolderPercent(el){
    const x = parseFloat(el.dataset.x) || 0;
    const y = parseFloat(el.dataset.y) || 0;
    el.style.left = `${x}%`;
    el.style.top  = `${y}%`;
  }

  function clampFolderPercent(el){
    const rect = el.getBoundingClientRect();
    const parent = getContainerRect();
    let x = parseFloat(el.dataset.x) || 0;
    let y = parseFloat(el.dataset.y) || 0;
    const xMax = Math.max(0, 100 - pxToPct(rect.width,  parent.width));
    const yMax = Math.max(0, 100 - pxToPct(rect.height, parent.height));
    x = clamp(x, 0, xMax);
    y = clamp(y, 0, yMax);
    el.dataset.x = x.toFixed(2);
    el.dataset.y = y.toFixed(2);
    el.style.left = `${x}%`;
    el.style.top  = `${y}%`;
  }



  const windowContainer    = document.getElementById("windows");
  const mainWindow         = document.getElementById("window-home");

  // --- NEW bits for hello screen memory ---
  const KEY_ENTERED = "gela_entered_desktop";

  function enterDesktop() {
  if (!helloScreen || !desktop) return;
  helloScreen.style.display = "none";
  desktop.classList.remove("hidden");
  sessionStorage.setItem(KEY_ENTERED, "1");

// show Angela tip immediately (only once per session)
if (!sessionStorage.getItem("gela_tip_shown")) {
  showAngelaBubble(
    "click me! the folders will scatter ✨ and yes, you can drag them too!",
    30000 // show for 10 seconds
  );
  sessionStorage.setItem("gela_tip_shown", "1");
}



  if (mainWindow) {
    requestAnimationFrame(() => {
      mainWindow.style.visibility = "visible";
      mainWindow.style.opacity = "1";
      makeDraggable(mainWindow);              // ✅ make the main window draggable
      mainWindow.style.zIndex = ++highestZIndex;
    });
  }
  window.initFooter?.();
}

  // auto-skip hello if we already entered
  if (sessionStorage.getItem(KEY_ENTERED) === "1") {
    enterDesktop();
  }

  // click hello → desktop
  if (helloText) {
    helloText.addEventListener("click", enterDesktop);
  }


  // ---------- Ambient FX ----------
  function ensureAmbientLayer() {
    let ambient = document.getElementById("ambient");
    if (!ambient) {
      ambient = document.createElement("div");
      ambient.id = "ambient";
      (desktop || document.body).appendChild(ambient);
    }
    return ambient;
  }
  function clearAmbient() {
    const ambient = ensureAmbientLayer();
    ambient.className = "";
    ambient.innerHTML = "";
  }
  function createStars(count = 70) {
    const ambient = ensureAmbientLayer();
    clearAmbient();
    ambient.classList.add("ambient-stars");
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "star";
      const size = Math.random() * 2 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = (Math.random() * 4).toFixed(2) + "s";
      const dur = (3 + Math.random() * 3).toFixed(2) + "s";
      s.style.left = x + "vw";
      s.style.top = y + "vh";
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.setProperty("--twinkle-delay", delay);
      s.style.setProperty("--twinkle-dur", dur);
      ambient.appendChild(s);
    }
  }
  function createFlowers(count = 24) {
    const ambient = ensureAmbientLayer();
    clearAmbient();
    ambient.classList.add("ambient-flowers");
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      const left = Math.random() * 100;
      const delay = (-Math.random() * 12).toFixed(2) + "s";
      const fall  = (12 + Math.random() * 10).toFixed(2) + "s";
      const sway  = (5 + Math.random() * 4).toFixed(2) + "s";
      const size  = (14 + Math.random() * 12).toFixed(0) + "px";
      p.style.setProperty("--x", left + "vw");
      p.style.setProperty("--delay", delay);
      p.style.setProperty("--fall-dur", fall);
      p.style.setProperty("--sway-dur", sway);
      p.style.setProperty("--size", size);
      ambient.appendChild(p);
    }
  }
  function refreshAmbientFX() {
    if (document.body.classList.contains("night-mode")) createStars();
    else createFlowers();
  }
  refreshAmbientFX();

  // ---------- Layout helpers ----------
  let angelaClickCount = 0;
  let highestZIndex    = 100;

  function centerWindowEl(el, margin = 16) {
    if (!el) return;
    el.style.position  = "fixed";
    el.style.transform = "none";

    const w = el.offsetWidth  || 600;
    const h = el.offsetHeight || 380;

    let left = (window.innerWidth  - w) / 2;
    let top  = (window.innerHeight - h) / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth  - w - margin));
    top  = Math.max(margin, Math.min(top,  window.innerHeight - h - margin));

    el.style.left = `${left}px`;
    el.style.top  = `${top}px`;
  }

  // kill the (0,0) flash on main window
  if (mainWindow) {
    mainWindow.style.position   = "fixed";
    mainWindow.style.visibility = "hidden";
    mainWindow.style.opacity    = "0";
  }

  // ---------- Corner Cat ----------
  function initCornerCat() {
    const btn = document.createElement("button");
    btn.id = "corner-cat";
    btn.setAttribute("aria-label", "cute cat music");
    btn.setAttribute("title", "meow!");
    btn.innerHTML = `
      <img src="images/cute-cat.svg" alt="cute cat" />
      <audio id="corner-cat-audio" src="sounds/cat-music.mp3" preload="auto"></audio>
    `;
    (desktop || document.body).appendChild(btn);

    const audio = btn.querySelector("audio");
    audio.volume = 0.5;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const play = () => { audio.currentTime = 0; audio.play().catch(()=>{}); };
    const stop = () => { audio.pause(); audio.currentTime = 0; };

    const catBubble = document.createElement("div");
    catBubble.id = "cat-bubble";
    catBubble.innerHTML = `<div class="cat-bubble-text"></div><div class="cat-bubble-tail"></div>`;
    document.body.appendChild(catBubble);

    const showCatBubble = (text) => {
      catBubble.querySelector(".cat-bubble-text").textContent = text;
      catBubble.classList.add("visible");
      setTimeout(() => catBubble.classList.remove("visible"), 9000);
    };

    const CAT_LINES = [
      "meow! you can drag the folders around if you want it arranged!",
      "meow! did you know angela has a cat named yui?",
      "angela is a libra! she's a softie.",
      "what else do you need from me meow?",
      "the secret of getting ahead, is getting started!",
      "thanks for clicking me for the 6th time! meow",
      "everything will work out in time~",
      "buy me a coffee meow?",
      "七転び八起き — fall seven times, stand up eight!",
      "thank you for everything!"
    ];
    let catClicks = 0;

    btn.addEventListener("mouseenter", () => { if (!isTouch) play(); });
    btn.addEventListener("mouseleave", () => { if (!isTouch) stop(); });
    btn.addEventListener("focus", () => btn.classList.add("kb-hover"));
    btn.addEventListener("blur",  () => { btn.classList.remove("kb-hover"); stop(); });

    btn.addEventListener("click", () => {
      showCatBubble(CAT_LINES[catClicks % CAT_LINES.length]);
      catClicks = (catClicks + 1) % CAT_LINES.length;
      if (isTouch) { audio.paused ? play() : stop(); }
      btn.blur();
    });

    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  }
  initCornerCat();

  // ---------- Misc (bubbles, stagger) ----------
  const STAGGER = [[0,0],[24,24],[-24,24],[24,-24],[-24,-24],[48,48],[-48,48],[48,-48],[-48,-48]];
  let nextOffsetIndex = 0;

  function showAngelaBubble(text) {
    const bubble = document.getElementById("angela-bubble");
    if (!bubble) return;
    bubble.querySelector(".bubble-text").innerText = text;
    bubble.classList.add("show");
    setTimeout(() => bubble.classList.remove("show"), 2000);
  }

  // ---------- Link icons sync ----------
  function refreshLinkIcons() {
    const isDark = document.body.classList.contains("night-mode");
    document.querySelectorAll('.link-icon img[data-name]').forEach(img => {
      const name = img.dataset.name;
      img.src = `images/${name}-${isDark ? "dark" : "light"}.svg`;
    });
  }

  // ---------- THEME TOGGLE (no ding; plays one-shot cue only on click) ----------
  if (themeToggle) {
    themeToggle.addEventListener("change", async () => {
      // NO toggle sound here (per your request)

      body.classList.toggle("night-mode");
      body.classList.toggle("day-mode");

      // play theme cue ONCE per toggle
      await playThemeCueOnce();

      // visuals
      refreshAmbientFX();
      const isNight = body.classList.contains("night-mode");

      document.querySelectorAll(".folder").forEach(f => {
        f.src = isNight ? "images/folder-dark.svg" : "images/folder-light.svg";
      });
      if (angelaIllustration) {
        angelaIllustration.src = isNight ? "images/angela-dark.svg" : "images/angela-light.svg";
      }
      const contactIllu = document.querySelector("#window-contact .contact-illustration");
      if (contactIllu) {
        contactIllu.src = isNight ? "images/angela-dark-heart.svg" : "images/angela-light-heart.svg";
      }
      refreshLinkIcons();
    });
  }

  // ---------- FAQ ----------
  function getFaqContent() {
    const items = [
      { q: "what software do you use?",
        a: `<ul>
              <li><strong>coding:</strong> Visual Studio Code!</li>
              <li><strong>design:</strong> Figma or Canva</li>
              <li><strong>admin:</strong> Google Workspace, Slack, Teams</li>
              <li><strong>social media:</strong> Meta Ads, Canva, Photoshop</li>
              <li><strong>other:</strong> Notion, Trello, Asana</li>
            </ul>`},
      { q: "what are your rates?", a: "we can chat about this :)" },
      { q: "what kind of executives have you supported?", a: "ceos, founders, and entrepreneurs in real estate, creative arts, nonprofits, and startups." },
      { q: "what are your skills?", a: "designing, and lots of admin work" },
      { q: "do you also help with marketing or social media tasks?", a: "yes! graphics, posts, and campaigns are part of my work." },
      { q: "do you prefer long-term roles or short-term contracts?", a: "i prefer long-term but i’m open to impactful short-term work." },
      { q: "what timezone are you in?", a: "i’m in the philippines (gmt+8)." },
      { q: "what are your working hours?", a: "i can work 4-6 hours a day, monday to friday. i’m flexible with time." }
    ];
    return `
      <div class="faq">
        ${items.map((it, i) => `
          <div class="faq-item${i===0?' open':''}">
            <button class="faq-q" aria-expanded="${i===0?'true':'false'}">
              <span>${it.q}</span>
              <span class="chev" aria-hidden="true"></span>
            </button>
            <div class="faq-a"${i===0?' style="max-height:400px"':''}>
              <div class="faq-a-inner">${it.a}</div>
            </div>
          </div>`).join("")}
      </div>`;
  }

  function initFaq(root) {
    const items = root.querySelectorAll(".faq-item");
    items.forEach((it) => {
      const btn = it.querySelector(".faq-q");
      const panel = it.querySelector(".faq-a");
      btn.addEventListener("click", () => {
        const isOpen = it.classList.contains("open");
        root.querySelectorAll(".faq-item.open").forEach(o => {
          if (o !== it) {
            o.classList.remove("open");
            o.querySelector(".faq-a").style.maxHeight = null;
            o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          }
        });
        it.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(!isOpen));
        panel.style.maxHeight = isOpen ? null : panel.scrollHeight + "px";
      });
    });
  }

  // ---------- Links ----------
  function getLinksContent() {
    const isDarkMode = document.body.classList.contains("night-mode");
    const links = [
      { href: "https://twitter.com/mryanglrts", name: "twitter" },
      { href: "https://facebook.com/assistwithmva", name: "facebook" },
      { href: "https://instagram.com/gelatisimeri", name: "instagram" },
      { href: "https://discord.com/users/848336476969369610", name: "discord" }
    ];
    return `
      <div class="links-window">
        <div class="link-grid">
          ${links.map(l => `
            <a class="link-card" href="${l.href}" target="_blank" rel="noopener">
              <div class="link-icon">
                <img src="images/${l.name}-${isDarkMode ? "dark" : "light"}.svg"
                     alt="${l.name} icon" data-name="${l.name}" loading="lazy"/>
              </div>
              <div class="link-label">${l.name}</div>
            </a>`).join("")}
        </div>
        <p class="links-note">clicking any of the links will open a new tab!</p>
      </div>`;
  }

  // ---------- Lightbox ----------
  function openLightboxGallery(slides, startAt = 0) {
    if (!slides?.length) return;
    const isNight = document.body.classList.contains("night-mode");
    let i = Math.max(0, Math.min(startAt, slides.length - 1));

    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay " + (isNight ? "night-mode" : "day-mode");
    overlay.innerHTML = `
      <div class="lightbox-panel" role="dialog" aria-label="gallery">
        <button class="lb-close" aria-label="Close">×</button>
        <button class="lb-prev" aria-label="Previous">‹</button>
        <img class="lb-img" src="" alt="">
        <button class="lb-next" aria-label="Next">›</button>
        <div class="lightbox-caption"></div>
        <div class="lightbox-count"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const imgEl   = overlay.querySelector(".lb-img");
    const capEl   = overlay.querySelector(".lightbox-caption");
    const countEl = overlay.querySelector(".lightbox-count");

    function render() {
      const s = slides[i];
      imgEl.src = s.src;
      imgEl.alt = s.title || "";
      capEl.textContent = s.title || "";
      countEl.textContent = `${i+1} / ${slides.length}`;
    }

    function close() {
      document.removeEventListener("keydown", onKey);
      overlay.remove();
    }
    function next() { i = (i + 1) % slides.length; render(); }
    function prev() { i = (i - 1 + slides.length) % slides.length; render(); }

    function onKey(e) {
      if (e.key === "Escape") return close();
      if (e.key === "ArrowRight") return next();
      if (e.key === "ArrowLeft")  return prev();
    }

    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector(".lb-close").addEventListener("click", close);
    overlay.querySelector(".lb-next").addEventListener("click", next);
    overlay.querySelector(".lb-prev").addEventListener("click", prev);
    document.addEventListener("keydown", onKey);

    // basic swipe
    let sx = 0, sy = 0;
    overlay.addEventListener("touchstart",  e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive:true});
    overlay.addEventListener("touchend",    e => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = Math.abs(e.changedTouches[0].clientY - sy);
      if (Math.abs(dx) > 40 && dy < 60) (dx < 0 ? next() : prev());
    }, {passive:true});

    render();
  }

  function initLightbox(rootEl) {
    if (!rootEl) return;
    rootEl.querySelectorAll(".lightbox-card").forEach((card) => {
      const run = () => {
        const galleryAttr = card.getAttribute("data-gallery");
        if (galleryAttr) {
          let slides;
          try { slides = JSON.parse(galleryAttr); } catch { slides = []; }
          if (slides.length) return openLightboxGallery(slides, 0);
        }
        const single = card.dataset.img ? [{ src: card.dataset.img, title: card.dataset.title || card.textContent.trim() }] : [];
        openLightboxGallery(single, 0);
      };

      card.addEventListener("click", run);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); run(); }
      });
    });
  }

  // ---------- Works content ----------
  function getWorksContent() {
    return `
      <div class="works">
        <div class="works-banner">
          <strong>please do offer me a job</strong> via my <a href="mailto:mryangelaworks@gmail.com">work email</a>!
          <div class="works-sub">i do web design, admin work, social media, and anything you want me to do... :)</div>
        </div>

        <div class="works-chips">
          <section>
            <h3>TOOLS I KNOW</h3>
            <div class="chip-grid">
              <span class="chip">Figma</span><span class="chip">Visual Studio Code</span>
              <span class="chip">Canva</span><span class="chip">Google Workspace</span>
              <span class="chip">Meta Ads</span><span class="chip">Excel Sheets</span>
              <span class="chip">Photoshop</span><span class="chip">Illustrator</span>
            </div>
          </section>
          <section>
            <h3>DEVELOPMENT</h3>
            <div class="chip-grid">
              <span class="chip">HTML/CSS</span><span class="chip">JavaScript</span>
              <span class="chip">React</span><span class="chip">Next.js</span>
              <span class="chip">C#</span><span class="chip">C</span><span class="chip">Python</span>
            </div>
          </section>
        </div>

        <section class="works-section">
          <h3>GRAPHICS</h3>
          <div class="card-grid">
            <div class="card lightbox-card" tabindex="0"
                 data-gallery='[
                   {"src":"images/theater-design.jpg","title":"Evening of Shorts – Main poster"},
                   {"src":"images/theater-design-2.jpg","title":"2nd Proposed Design"},
                   {"src":"images/theater-design-3.jpg","title":"A New Design"},
                   {"src":"images/theater-design-4.jpg","title":"Another New Design"}
                 ]'>
              <div class="thumb" style="background-image:url(images/theater-thumb.jpg); background-size:cover; background-position:center;"></div>
              <div class="card-title">TMCP - Theater</div>
            </div>

            <div class="card lightbox-card" tabindex="0"
                 data-gallery='[
                   {"src":"images/omnitend/omnitend-1.jpg","title":"Logo Design"},
                   {"src":"images/omnitend/omnitend-2.jpg","title":"Omnitend Team (I work under Alice)"},
                   {"src":"images/omnitend/omnitend-3.jpg","title":"Automated Ordering Module"},
                   {"src":"images/omnitend/omnitend-4.jpg","title":"Inventory Management Module"},
                   {"src":"images/omnitend/omnitend-5.jpg","title":"Real Time Task Tracking Module"},
                   {"src":"images/omnitend/omnitend-6.jpg","title":"Revenue Module"},
                   {"src":"images/omnitend/omnitend-7.jpg","title":"Staf Rotas-"},
                   {"src":"images/omnitend/omnitend-8.jpg","title":"Web Shop - Module"}
                 ]'>
              <div class="thumb" style="background-image:url(images/pos-omnitend-thumb.jpg); background-size:cover; background-position:center;"></div>
              <div class="card-title">Omnitend
              <a href="https://www.instagram.com/omni_tend/" target="_blank" rel="noopener" onclick="event.stopPropagation()">↗</a>
              </div>
            </div>
            
          <div class="card lightbox-card" tabindex="0"
         data-gallery='[
           {"src":"images/eulclavie/1.png","title":"Hiring Programmer Post"},
           {"src":"images/eulclavie/2.png","title":"Hiring Executive Assistant Post"},
           {"src":"images/eulclavie/3.png","title":"Hiring Marketing Post"},
           {"src":"images/eulclavie/4.png","title":"EulClavie Ad Flyer for Email Marketing"},
           {"src":"images/eulclavie/5.png","title":"Hiring Cold Callers Post"},
           {"src":"images/eulclavie/6.png","title":"Hiring Data Virtual Assistants Post"},
         ]'>
      <div class="thumb" style="background-image:url(images/eulclavie/eulclavie.png); background-size:cover; background-position:center;"></div>
      <div class="card-title">EulClavie
       <a href="https://www.facebook.com/EulClavie" target="_blank" rel="noopener" onclick="event.stopPropagation()">↗</a>
      </div>
    </div>

          <div class="card lightbox-card" tabindex="0"
         data-gallery='[
           {"src":"images/gemguesthouse/1.png","title":"Airbnb Social Media Post: You can check out their listing here!"},
           {"src":"images/gemguesthouse/2.png","title":"Social Media Post"},
           {"src":"images/gemguesthouse/3.png","title":"Social Media Post"}
         ]'>
      <div class="thumb" style="background-image:url(images/gemguesthouse/gemguesthouse.png); background-size:cover; background-position:center;"></div>
      <div class="card-title">Gem Guest House
       <a href="https://airbnb.com/h/gemsguesthouse" target="_blank" rel="noopener" onclick="event.stopPropagation()">↗</a>
      </div>
    </div>

          <div class="card lightbox-card" tabindex="0"
         data-gallery='[
           {"src":"images/awritetoheal/1.png","title":"Social Media Campaign"},
           {"src":"images/awritetoheal/2.png","title":"Social Media Campaign 2"},
           {"src":"images/awritetoheal/3.png","title":"Social Media Campaign 3"},
           {"src":"images/awritetoheal/4.png","title":"Email Marketing Design"},
           {"src":"images/awritetoheal/5.png","title":"Social Media Carousel"},
           {"src":"images/awritetoheal/6.png","title":"Donation Drive Post"},
           {"src":"images/awritetoheal/7.png","title":"Marketing Campaign Post"},
           {"src":"images/awritetoheal/8.png","title":"Email Marketing Design 2"},
           {"src":"images/awritetoheal/9.png","title":"Email Marketing Design 3"}
         ]'>
      <div class="thumb" style="background-image:url(images/awritetoheal/awritetoheal.png); background-size:cover; background-position:center;"></div>
      <div class="card-title">A Write to Heal</div>
    </div>

  </div>
</section>

        <section class="works-section">
          <h3>WEB / UI</h3>
          <div class="card-grid">
            <a class="card" href="https://marymva.my.canva.site/portfolio" target="_blank" rel="noopener">
              <div class="thumb" style="background-image:url(images/oldportfolio-thumb.jpg);"></div>
              <div class="card-title">My Old Portfolio</div>
            </a>

            <a class="card" href="https://thecollectivemic.wixsite.com/the-collective2014" target="_blank" rel="noopener">
              <div class="thumb" style="background-image:url(images/tcmp-website.jpg);"></div>
              <div class="card-title">TMCP - Website 2023</div>
            </a>
          </div>
        </section>

        
      </div>`;
  }

  // ---------- Folders data ----------
  const folderData = [
    { id: "works",   label: "my works",   x: 100,  y: 150, content: getWorksContent() },
    {
      id: "contact", label: "contact me", x: 150,  y: 400,
      content: `
        <div class="contact-window">
          <h2 class="contact-title">i'd love to talk!</h2>
          <p class="contact-desc">
            the easiest way to contact me is through email! i don’t really have any official social medias for work,
            so please direct questions to my work email instead.
          </p>
          <img src="${document.body.classList.contains("night-mode") ? "images/angela-dark-heart.svg" : "images/angela-light-heart.svg"}"
               alt="Angela heart" class="contact-illustration"/>
          <p class="contact-email">
            email me at: <a href="mailto:mryangelaworks@gmail.com">mryangelaworks@gmail.com</a>
          </p>
          <p class="contact-note">or press the button below to open your mail app.</p>
          <a href="mailto:mryangelaworks@gmail.com" class="contact-btn">send me an email!</a>
        </div>`
    },
    { id: "links",   label: "my links",   x: 420,  y: 160, content: getLinksContent() },
    {
      id: "about",   label: "about me",   x: 1600, y: 420,
      content: `
        <div class="about-angela-wrapper">
          <div class="about-header">
            <img src="images/angela-dark-woah.svg" class="about-img" />
            <div class="about-intro">
              <h2 class="about-name">Mary Angela</h2>
              <p class="about-title">PH-based freelancer</p>
              <p class="about-subtitle">Former Executive Operations Manager at EulClavie</p>
            </div>
          </div>
          <hr />
          <div class="about-description">
            <p>hi! i’m angela, and i like to...</p>
            <ul>
              <li>design cute portfolios & websites & graphics</li>
              <li>draw soft illustrations & write</li>
              <li>create organized excel sheets & admin work</li>
              <li>edit reels & make my clients smile</li>
            </ul>
            <p>let’s work together! contact me at 
            <a href="mailto:mryangelaworks@gmail.com">mryangelaworks@gmail.com</a> ✨</p>
          </div>
          <hr />
          <div class="about-edu">
            <h3 class="edu-title">EDUCATION</h3>
            <p class="edu-degree">Bachelor of Science in Information Technology</p>
          </div>
          <hr />
          <div class="about-interests">
            <h3 class="edu-title">OTHER INTERESTS</h3>
            <ul style="list-style: disc; padding-left: 20px;">
              <li>professional gaming</li>
              <li>music! singing, guitar, piano</li>
              <li>league of legends</li>
              <li>skyrim, elder scrolls</li>
              <li>astrology and tarot cards!</li>
              <li>color theory too~</li>
            </ul>
          </div>
          <hr />
          <div class="about-languages">
            <h3 class="edu-title">LANGUAGE PROFICIENCY</h3>
            <p>
              i have fluency in <strong class="highlight-text">English</strong> and 
              <strong class="highlight-text">Filipino (Bisaya)</strong>, 
              and can speak in conversational <strong class="highlight-text">Japanese</strong>.
            </p>
            <p style="font-size: 0.9em; opacity: 0.8;">
              "Salut, enchantée! Moi, c’est Mary!"
              i speak a bit of French too, but not enough to hold a conversation. 
            </p>
          </div>
        </div>`
    },
    {
      id: "resume",
      label: "resume",
      x: 1500,
      y: 220,
      content: `
        <div class="resume-window" style="text-align:center; padding:20px;">
          <p style="margin-bottom:12px;">thanks for checking me out ♡</p>
          <a href="my-resume.pdf" target="_blank" rel="noopener" class="resume-button">
            open my resume here! :)
          </a>
          <p class="links-note" style="margin-top:12px;">it will open in a new tab.</p>
        </div>`
    },
    {
      id: "faq",
      label: "faq",
      x: 1500,
      y: 560,
      content: getFaqContent()
    },
    {
      id: "guestbook",
      label: "message board",
      x: 1600,
      y: 80,
      content: `
        <div class="guestbook-root">
          <h2 style="margin:0 0 8px;">people say...♡</h2>
          <form class="guestbook-form">
            <div class="row">
              <input name="name" type="text" placeholder="your name (optional)" maxlength="40"/>
            </div>
            <div class="row">
              <textarea name="msg" placeholder="say something nice (pls) :)" maxlength="1000" required></textarea>
            </div>
            <button type="submit" class="guestbook-btn">post</button>
            <span class="guestbook-status" aria-live="polite"></span>
          </form>
          <hr/>
          <div class="guestbook-list" aria-live="polite"></div>
        </div>`
    }
  ];

  // ---------- Guestbook (Firestore) ----------
  function sanitize(str) { return String(str || "").trim(); }

  function initGuestbook(rootEl) {
    if (!rootEl) return;
    const form   = rootEl.querySelector(".guestbook-form");
    const listEl = rootEl.querySelector(".guestbook-list");
    const status = rootEl.querySelector(".guestbook-status");

    const escapeHTML = s => String(s||"").replace(/[<>&]/g, c => ({'<':"&lt;",'>':"&gt;","&":"&amp;"}[c]));

    db.collection("guestbook")
      .orderBy("createdAt", "desc")
      .limit(100)
      .onSnapshot((snap) => {
        listEl.innerHTML = "";
        snap.forEach((doc) => {
          const d = doc.data();
          const name = d.name ? d.name : "anonymous friend";
          const ts = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
          const item = document.createElement("div");
          item.className = "gb-item";
          item.innerHTML = `
            <div class="gb-meta">${escapeHTML(name)} • <span>${ts.toLocaleString()}</span></div>
            <div class="gb-text">${escapeHTML(d.msg)}</div>
          `;
          listEl.appendChild(item);
        });
      });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = sanitize(fd.get("name")).slice(0, 40);
      const msg  = sanitize(fd.get("msg")).slice(0, 300);
      if (!msg) { status.textContent = "say something first!"; return; }

      const last = Number(localStorage.getItem("gb_last") || 0);
      const now  = Date.now();
      if (now - last < 30_000) { status.textContent = "whoa tiger—wait a few seconds!"; return; }

      const temp = document.createElement("div");
      temp.className = "gb-item pending";
      const when = new Date();
      temp.innerHTML = `
        <div class="gb-meta">${escapeHTML(name || "you")} • <span>${when.toLocaleString()}</span></div>
        <div class="gb-text">${escapeHTML(msg)} <em class="pending-note">(sending…)</em></div>
      `;
      listEl.prepend(temp);

      status.textContent = "posting…";
      try {
        await db.collection("guestbook").add({
          name,
          msg,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          ua: navigator.userAgent.slice(0,120)
        });
        localStorage.setItem("gb_last", String(now));
        form.reset();
        status.textContent = "posted! ♡";
        temp.remove();
        setTimeout(() => (status.textContent = ""), 1200);
      } catch (err) {
        console.error(err);
        const note = temp.querySelector(".pending-note");
        if (note) note.textContent = "(failed to send)";
        temp.classList.add("failed");
        status.textContent = "oops, failed to post.";
      }
    });
  }

  // ---------- Create folder icons ----------
  if (folderContainer) {
    folderData.forEach((folder) => {
      const folderWrapper = document.createElement("div");
      folderWrapper.classList.add("folder-wrapper");
      folderWrapper.style.position = isMobile() ? "relative" : "absolute";
  if (!isMobile()) {
  const parent = getContainerRect();
  const seedX = pxToPct(folder.x, parent.width);
  const seedY = pxToPct(folder.y, parent.height);

  folderWrapper.dataset.x = isFinite(seedX) ? seedX.toFixed(2) : "5";
  folderWrapper.dataset.y = isFinite(seedY) ? seedY.toFixed(2) : "5";

  applyFolderPercent(folderWrapper);
  requestAnimationFrame(() => clampFolderPercent(folderWrapper));
}


      folderWrapper.tabIndex = 0;
      folderWrapper.setAttribute("role", "button");
      folderWrapper.setAttribute("aria-label", folder.label);
      folderWrapper.dataset.fid   = folder.id;
      folderWrapper.dataset.label = folder.label;
      folderWrapper.addEventListener("mousedown", () => folderWrapper.focus());

      const folderImg = document.createElement("img");
      folderImg.classList.add("folder");
      folderImg.src = body.classList.contains("night-mode") ? "images/folder-dark.svg" : "images/folder-light.svg";
      folderImg.setAttribute("draggable", "false");

      const label = document.createElement("div");
      label.classList.add("folder-label");
      label.innerText = folder.label;

      folderWrapper.appendChild(folderImg);
      folderWrapper.appendChild(label);
      folderContainer.appendChild(folderWrapper);

      folderWrapper.addEventListener("dragstart", (e) => e.preventDefault());
      makeDraggable(folderWrapper);

      folderWrapper.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (folderWrapper.__dragMoved) return;
        clickAudio.currentTime = 0;
        clickAudio.play().catch(()=>{});
        openWindow(folder.id, folder.label, folder.content);
      });
    });
  }

  // prevent page scroll on Space when folder focused
  document.addEventListener("keydown", (e) => {
    const isSpace = e.key === " " || e.key === "Space" || e.key === "Spacebar" || e.code === "Space";
    const activeFolder = document.activeElement && document.activeElement.closest(".folder-wrapper");
    if (activeFolder && isSpace) e.preventDefault();
  });

  // ========= Responsive folders =============
const MOBILE_BP = 820;
let originalFolderPos = new Map();

function snapshotFolderPositions(){
  originalFolderPos.clear();
  document.querySelectorAll('.folder-wrapper').forEach(el => {
    originalFolderPos.set(el, { left: el.style.left, top: el.style.top, pos: el.style.position });
  });
}

function applyMobileFolderLayout(){
  document.body.classList.add('mobile-folders');
  document.querySelectorAll('.folder-wrapper').forEach(el => {
    el.style.position = 'relative';
    el.style.left = 'auto';
    el.style.top = 'auto';
  });
}

function applyDesktopFolderLayout(){
  document.body.classList.remove('mobile-folders');
  document.querySelectorAll('.folder-wrapper').forEach(el => {
    el.style.position = 'absolute';
    if (el.dataset.x == null || el.dataset.y == null) {
      el.dataset.x = el.dataset.x ?? "5";
      el.dataset.y = el.dataset.y ?? "5";
    }
    clampFolderPercent(el); // applies % and keeps inside
  });
}


function updateFolderLayoutForViewport(){
  if (window.innerWidth <= MOBILE_BP) applyMobileFolderLayout();
  else applyDesktopFolderLayout();
}

window.addEventListener('resize', () => {
  if (window.innerWidth > MOBILE_BP) {
    document.querySelectorAll('.folder-wrapper').forEach(clampFolderPercent);
  }
});


// take a snapshot once, after folders are created
snapshotFolderPositions();
updateFolderLayoutForViewport();
window.addEventListener('resize', updateFolderLayoutForViewport);

// Avoid scattering folders off-screen on small phones
const scatterFoldersIfDesktop = () => window.innerWidth > MOBILE_BP;


  // keyboard activation
  document.addEventListener("keyup", (e) => {
    const isEnter = e.key === "Enter";
    const isSpace = e.key === " " || e.key === "Space" || e.key === "Spacebar" || e.code === "Space";
    if (!isEnter && !isSpace) return;
    const activeFolder = document.activeElement && document.activeElement.closest(".folder-wrapper");
    if (!activeFolder) return;
    e.preventDefault();
    clickAudio.currentTime = 0;
    clickAudio.play().catch(()=>{});
    const fid = activeFolder.dataset.fid;
    const f = folderData.find(x => x.id === fid);
    if (f) openWindow(f.id, f.label, f.content);
  });

function scatterAllFoldersPercent(){
  const parent = getContainerRect();
  document.querySelectorAll(".folder-wrapper").forEach(folder => {
    folder.classList.add("show");
    const rect = folder.getBoundingClientRect();
    const xMax = Math.max(0, 100 - pxToPct(rect.width,  parent.width));
    const yMax = Math.max(0, 100 - pxToPct(rect.height, parent.height));
    const randX = Math.random() * xMax;
    const randY = Math.random() * yMax;
    folder.dataset.x = randX.toFixed(2);
    folder.dataset.y = randY.toFixed(2);
    applyFolderPercent(folder);
  });
}


 if (angelaIllustration) {
  angelaIllustration.addEventListener("click", () => {
    if (scatterFoldersIfDesktop()) {
      scatterAllFoldersPercent();
    } else {
      // mobile: just show them neatly
      document.querySelectorAll(".folder-wrapper").forEach(folder => {
        folder.classList.add("show");
      });
    }

    angelaClickCount++;
    const isNight = body.classList.contains("night-mode");

    if (angelaClickCount > 14) {
      angelaClickCount = 0;
      angelaIllustration.src = isNight ? "images/angela-dark.svg" : "images/angela-light.svg";
      showAngelaBubble("i'm okay i guess..");
      return;
    }
    if (angelaClickCount >= 9) {
      angelaIllustration.src = isNight ? "images/angela-dark-cry.svg" : "images/angela-light-cry.svg";
      showAngelaBubble("stop it....i'm overstimulated!");
      return;
    }
    if (angelaClickCount >= 5) {
      angelaIllustration.src = isNight ? "images/angela-dark-angry.svg" : "images/angela-light-angry.svg";
      showAngelaBubble("you can stop now.");
      return;
    }

    angelaIllustration.src = isNight ? "images/angela-dark-smile.svg" : "images/angela-light-smile.svg";
    showAngelaBubble("you actually clicked me!");
  });
}


  // ---------- Window system ----------
  function openWindow(id, title, content) {
    if (document.getElementById(`window-${id}`)) return;

    const win = document.createElement("div");
    win.classList.add("window");
    win.id = `window-${id}`;
    win.style.position  = "fixed";
    win.style.opacity   = 0;
    win.style.transform = "scale(0.95)";
    win.style.transition= "opacity 0.3s ease, transform 0.3s ease";
    win.innerHTML = `
      <div class="window-header">
        <span>${title}</span>
        <button class="close-btn" onclick="closeWindow('${id}')">✖</button>
      </div>
      <div class="window-content">${content}</div>
    `;

    win.style.visibility = "hidden";
    windowContainer.appendChild(win);

    const rect = win.getBoundingClientRect();
    const w = rect.width  || 560;
    const h = rect.height || 380;

    const margin = 16;
    const baseX  = (window.innerWidth  - w) / 2;
    const baseY  = (window.innerHeight - h) / 2;

    const [dx, dy] = STAGGER[nextOffsetIndex % STAGGER.length];
    nextOffsetIndex++;

    let left = Math.max(margin, Math.min(baseX + dx, window.innerWidth  - w - margin));
    let top  = Math.max(margin, Math.min(baseY + dy, window.innerHeight - h - margin));

    win.style.left = `${left}px`;
    win.style.top  = `${top}px`;

    win.style.visibility = "visible";
    requestAnimationFrame(() => {
      win.style.opacity = 1;
      win.style.transform = "scale(1)";
    });

    if (id === "faq") initFaq(win.querySelector(".window-content"));
    if (id === "links") refreshLinkIcons();
    if (id === "guestbook") initGuestbook(win.querySelector(".guestbook-root"));
    if (id === "works") initLightbox(win);

    win.style.zIndex = ++highestZIndex;
    makeDraggable(win);
  }

  function makeDraggable(el) {
  if (isMobile()) return;

  // Folders use percent positioning; windows use pixels
  const isFolder = el.classList.contains("folder-wrapper");

  let pressed = false, dragging = false;
  let startX = 0, startY = 0;
  let startXPct = 0, startYPct = 0;   // for folders
  let offsetX = 0, offsetY = 0;       // for windows
  const THRESHOLD = 8;

  el.addEventListener("mousedown", (e) => {
    pressed = true; dragging = false;
    startX = e.clientX; startY = e.clientY;
    el.style.transition = "none";

    if (isFolder) {
      // initialize percent start points
      const parent = getContainerRect();
      if (el.dataset.x == null || el.dataset.y == null) {
        const rect = el.getBoundingClientRect();
        // convert current px to %
        el.dataset.x = ((rect.left - parent.left) / parent.width  * 100).toFixed(2);
        el.dataset.y = ((rect.top  - parent.top ) / parent.height * 100).toFixed(2);
      }
      startXPct = parseFloat(el.dataset.x) || 0;
      startYPct = parseFloat(el.dataset.y) || 0;
    } else {
      // WINDOW DRAGGING (pixels)
      // If it’s centered with transform, freeze its current on-screen spot into left/top px
      const cs = getComputedStyle(el);
      if (cs.transform !== "none") {
        const r = el.getBoundingClientRect();
        el.style.left = `${r.left}px`;
        el.style.top  = `${r.top}px`;
        el.style.transform = "none";
      }
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (!pressed) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!dragging && (Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD)) {
      dragging = true;
      el.style.zIndex = ++highestZIndex;
    }

    if (!dragging) return;

    if (isFolder) {
      const parent = getContainerRect();
      const dxPct = (dx / parent.width)  * 100;
      const dyPct = (dy / parent.height) * 100;
      el.dataset.x = String(startXPct + dxPct);
      el.dataset.y = String(startYPct + dyPct);
      clampFolderPercent(el); // keeps it inside and writes left/top as %
    } else {
      let newLeft = e.clientX - offsetX;
      let newTop  = e.clientY - offsetY;
      // keep fully on screen
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth  - el.offsetWidth));
      newTop  = Math.max(0, Math.min(newTop,  window.innerHeight - el.offsetHeight));
      el.style.left = `${newLeft}px`;
      el.style.top  = `${newTop}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (!pressed) return;
    pressed = false;
    el.style.transition = "all 0.2s ease";
    el.__dragMoved = dragging;
    setTimeout(() => { el.__dragMoved = false; }, 0);
  });
}



  // Expose closeWindow globally for the ✖ button
  window.closeWindow = function (id) {
    const win = document.getElementById(`window-${id}`);
    if (win) {
      const closeAudio = new Audio("sounds/folder-close.mp3");
      closeAudio.volume = 0.35;
      closeAudio.play().catch(() => {});
      win.remove();
    }
  };

  
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#window-home .close-btn");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation(); // in case a drag/click handler is grabbing the event

  const home = document.getElementById("window-home");
  if (home) home.classList.add("hidden");
});


document.addEventListener("click", (e) => {
  const angela = e.target.closest("#angela-illustration");
  if (!angela) return;

  const home = document.getElementById("window-home");
  if (home) home.classList.remove("hidden");
});



  });
