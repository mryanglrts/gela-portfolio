// --- Firebase init (compat) ---
const firebaseConfig = {
  apiKey: "AIzaSyC2-8ZFH7gwHRRb4rT5hIBPK9PCtGIpiNc",
  authDomain: "gela-portfolio.firebaseapp.com",
  projectId: "gela-portfolio",
  storageBucket: "gela-portfolio.appspot.com", // <-- FIXED
  messagingSenderId: "132578520455",
  appId: "1:132578520455:web:75ce7cd4b8087b6655b722",
  measurementId: "G-YGF1F3P79M"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// (no analytics needed)

// 🔊 theme toggle sound
const toggleSound = new Audio('sounds/toggle-mode.mp3');
toggleSound.preload = 'auto';
toggleSound.volume = 0.45; // tweak to taste

document.addEventListener("DOMContentLoaded", () => {
  const helloScreen       = document.getElementById("hello-screen");
  const helloText         = document.getElementById("hello-text");
  const desktop           = document.getElementById("desktop");
  const angelaIllustration= document.getElementById("angela-illustration");
  const themeToggle       = document.getElementById("theme-toggle");
  const body              = document.body;
  const folderContainer   = document.getElementById("folders");
  const windowContainer   = document.getElementById("windows");
  const mainWindow        = document.getElementById("window-home");

  refreshAmbientFX();

  let angelaClickCount = 0;
  let highestZIndex    = 100;

  /* ---------- helpers ---------- */
  function centerWindowEl(el, margin = 16) {
    if (!el) return;
    el.style.position  = "fixed";     // viewport coords
    el.style.transform = "none";      // kill 50/50 translate if any

    // measure (must be in DOM to get size)
    const w = el.offsetWidth  || 600;
    const h = el.offsetHeight || 380;

    // center + clamp a bit
    let left = (window.innerWidth  - w) / 2;
    let top  = (window.innerHeight - h) / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth  - w - margin));
    top  = Math.max(margin, Math.min(top,  window.innerHeight - h - margin));

    el.style.left = `${left}px`;
    el.style.top  = `${top}px`;
  }



  // PREVENT THE FLASH AT (0,0): hide + pre-center the main window immediately
  if (mainWindow) {
    mainWindow.style.position   = "fixed";
    mainWindow.style.visibility = "hidden";
    mainWindow.style.opacity    = "0";
    mainWindow.style.transform  = "none";
    // wait a frame so layout exists, then center
    requestAnimationFrame(() => centerWindowEl(mainWindow));
  }

  function initCornerCat() {
  const btn = document.createElement('button');
  btn.id = 'corner-cat';
  btn.setAttribute('aria-label', 'cute cat music');
  btn.setAttribute('title', 'meow!');
  btn.innerHTML = `
    <img src="images/cute-cat.svg" alt="cute cat" />
    <audio id="corner-cat-audio" src="sounds/cat-music.mp3" preload="auto"></audio>
  `;
  (document.getElementById('desktop') || document.body).appendChild(btn);

  const audio = btn.querySelector('audio');
  audio.volume = 0.5;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const play = () => { audio.currentTime = 0; audio.play().catch(()=>{}); };
  const stop = () => { audio.pause(); audio.currentTime = 0; };

  // bubble element (create ONCE)
  const catBubble = document.createElement('div');
  catBubble.id = 'cat-bubble';
  catBubble.innerHTML = `<div class="cat-bubble-text"></div><div class="cat-bubble-tail"></div>`;
  document.body.appendChild(catBubble);
  const showCatBubble = (text) => {
    catBubble.querySelector('.cat-bubble-text').textContent = text;
    catBubble.classList.add('visible');
    setTimeout(() => catBubble.classList.remove('visible'), 9000);
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
    "七転び八起き (nana korobi ya oki) — fall seven times, stand up eight!",
    "thank you for everything!"
  ];
  let catClicks = 0;

  // hover music on desktop
  btn.addEventListener('mouseenter', () => { if (!isTouch) play(); });
  btn.addEventListener('mouseleave', () => { if (!isTouch) stop(); });
  btn.addEventListener('focus', () => btn.classList.add('kb-hover'));
  btn.addEventListener('blur',  () => { btn.classList.remove('kb-hover'); stop(); });

  // click: cycle line (loops after 10); toggle music on touch
  btn.addEventListener('click', () => {
    showCatBubble(CAT_LINES[catClicks % CAT_LINES.length]);
    catClicks = (catClicks + 1) % CAT_LINES.length;
    if (isTouch) { audio.paused ? play() : stop(); }
    btn.blur();
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
}

initCornerCat();

  

  /* ---------- ambient fx ---------- */
  function ensureAmbientLayer() {
    let ambient = document.getElementById('ambient');
    if (!ambient) {
      ambient = document.createElement('div');
      ambient.id = 'ambient';
      (document.getElementById('desktop') || document.body).appendChild(ambient);
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
    ambient.classList.add('ambient-stars');
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      const size = Math.random() * 2 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = (Math.random() * 4).toFixed(2) + 's';
      const dur = (3 + Math.random() * 3).toFixed(2) + 's';
      s.style.left = x + 'vw';
      s.style.top = y + 'vh';
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.setProperty('--twinkle-delay', delay);
      s.style.setProperty('--twinkle-dur', dur);
      ambient.appendChild(s);
    }
  }
  function createFlowers(count = 24) {
    const ambient = ensureAmbientLayer();
    clearAmbient();
    ambient.classList.add('ambient-flowers');
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      const left = Math.random() * 100;
      const delay = (-Math.random() * 12).toFixed(2) + 's';
      const fall  = (12 + Math.random() * 10).toFixed(2) + 's';
      const sway  = (5 + Math.random() * 4).toFixed(2) + 's';
      const size  = (14 + Math.random() * 12).toFixed(0) + 'px';
      p.style.setProperty('--x', left + 'vw');
      p.style.setProperty('--delay', delay);
      p.style.setProperty('--fall-dur', fall);
      p.style.setProperty('--sway-dur', sway);
      p.style.setProperty('--size', size);
      ambient.appendChild(p);
    }
  }
  function refreshAmbientFX() {
    if (document.body.classList.contains('night-mode')) createStars();
    else createFlowers();
  }

  /* ---------- misc ---------- */
  const STAGGER = [[0,0],[24,24],[-24,24],[24,-24],[-24,-24],[48,48],[-48,48],[48,-48],[-48,-48]];
  let nextOffsetIndex = 0;

  function showAngelaBubble(text) {
    const bubble = document.getElementById("angela-bubble");
    if (!bubble) return;
    bubble.querySelector(".bubble-text").innerText = text;
    bubble.classList.add("show");
    setTimeout(() => bubble.classList.remove("show"), 2000);
  }

  /* ---------- hello → reveal desktop & main window (already centered) ---------- */
  if (helloText) {
    helloText.addEventListener("click", () => {
      if (!helloScreen || !desktop) return;
      helloScreen.style.display = "none";
desktop.classList.remove("hidden");

if (mainWindow) {
  centerWindowEl(mainWindow);
  // show immediately (no fade)
  mainWindow.style.visibility = "visible";
  mainWindow.style.opacity = "1";
  makeDraggable(mainWindow);
  mainWindow.style.zIndex = ++highestZIndex;
}
initFooter();
    });
  }

  /* ---------- link icons sync ---------- */
  function refreshLinkIcons() {
    const isDark = document.body.classList.contains('night-mode');
    document.querySelectorAll('.link-icon img[data-name]').forEach(img => {
      const name = img.dataset.name;
      img.src = `images/${name}-${isDark ? 'dark' : 'light'}.svg`;
    });
  }

  /* ---------- theme toggle ---------- */
if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    // play sound (safe-guarded)
    try {
      toggleSound.currentTime = 0;
      toggleSound.play().catch(() => {});
    } catch {}

    body.classList.toggle("night-mode");
    body.classList.toggle("day-mode");
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


  /* ---------- FAQ helpers ---------- */
  function getFaqContent() {
    const items = [
      { q: "what software do you use?",
        a: `<ul>
              <li><strong>coding:</strong> Visual Studio Code! </li>
              <li><strong>design:</strong> Figma or Canva </li>
              <li><strong>courses:</strong> Youtube or Coursera? </li>
              <li>you can pm me...owo</li>
            </ul>`},
      { q: "what are your rates?", a: "i'm currently at 10-12$/hour!" },
      { q: "what languages do you usually use?", a: "html, css, and js! (for now)" },
      { q: "where do you get your sound effects?", a: "free libraries, paid packs, and sometimes i record my own." },
      { q: "do you draw?", a: "yes! im actually saving up for an ipad to create more illustrations :3" }
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
          </div>`).join('')}
      </div>`;
    
    }
  /* ---------- FAQ init ---------- */
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

  /* ---------- Links window ---------- */
  function getLinksContent() {
    const isDarkMode = document.body.classList.contains('night-mode');
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
                <img src="images/${l.name}-${isDarkMode ? 'dark' : 'light'}.svg"
                     alt="${l.name} icon" data-name="${l.name}" loading="lazy"/>
              </div>
              <div class="link-label">${l.name}</div>
            </a>`).join("")}
        </div>
        <p class="links-note">clicking any of the links will open a new tab!</p>
      </div>`;
  }

  /* ---------- Works content ---------- */
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
        <hr class="works-rule"/>
        <section class="works-section">
          <h3>GRAPHICS</h3>
          <div class="card-grid">
            <a class="card" href="#" target="_blank" rel="noopener"><div class="thumb"></div><div class="card-title">Theater Design</div></a>
            <a class="card" href="#" target="_blank" rel="noopener"><div class="thumb"></div><div class="card-title">POS Design</div></a>
          </div>
        </section>
        <section class="works-section">
          <h3>WEB / UI</h3>
          <div class="card-grid">
            <a class="card" href="#" target="_blank" rel="noopener"><div class="thumb"></div><div class="card-title">soft-portfolio concept</div></a>
            <a class="card" href="#" target="_blank" rel="noopener"><div class="thumb"></div><div class="card-title">friendster-reborn</div></a>
          </div>
        </section>
      </div>`;
  }

  /* ---------- Folders data ---------- */
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
          <img src="${document.body.classList.contains('night-mode') ? 'images/angela-dark-heart.svg' : 'images/angela-light-heart.svg'}"
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
              <p class="about-title">Aspiring web designer & creative wannabe</p>
              <p class="about-subtitle">i can be anything you want me to be tbh</p>
            </div>
          </div>
          <hr />
          <div class="about-description">
            <p>hi! i’m angela, and i like to...</p>
            <ul>
              <li>design cute portfolios & websites & graphics</li>
              <li>draw soft illustrations & write silly fanfics</li>
              <li>create organized excel sheets for your data</li>
              <li>edit reels & make my clients smile</li>
            </ul>
            <p>let’s work together! contact me at 
            <a href="mailto:mryangelaworks@gmail.com">mryangelaworks@gmail.com</a>✨</p>
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
              <li>music! singing, guitar, piano, violin</li>
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
  x: 1500,   // tweak position as you like
  y: 220,
  content: `
    <div class="resume-window" style="text-align:center; padding:20px;">
      <p style="margin-bottom:12px;">thanks for checking me out ♡</p>
      <a href="my-resume.pdf" target="_blank" rel="noopener" class="resume-button">
        open my resume here! :)
      </a>
      <p class="links-note" style="margin-top:12px;">it will open in a new tab.</p>
    </div>
  `
}, 
{
  id: "faq",
  label: "faq",
  x: 1500,  // place wherever you want
  y: 560,
  content: getFaqContent()
},
{
  id: "guestbook",
  label: "message board",
  x: 1600,   // place it where you want
  y: 80,
  content: `
    <div class="guestbook-root">
      <h2 style="margin:0 0 8px;">my friends say..♡</h2>
      <form class="guestbook-form">
        <div class="row">
          <input name="name" type="text" placeholder="your name (optional)" maxlength="40"/>
        </div>
        <div class="row">
          <textarea name="msg" placeholder="say something nice (pls) :)" maxlength="300" required></textarea>
        </div>
        <button type="submit" class="guestbook-btn">post</button>
        <span class="guestbook-status" aria-live="polite"></span>
      </form>
      <hr/>
      <div class="guestbook-list" aria-live="polite"></div>
    </div>
  `
}


  ];

  /* ---------- Folder click sound ---------- */
  const clickAudio = new Audio('sounds/folder-click.mp3');
  clickAudio.preload = 'auto';
  clickAudio.volume  = 0.35;

  /* ---------- Make folders ---------- */
  if (folderContainer) {
    folderData.forEach((folder) => {
      const folderWrapper = document.createElement("div");
      folderWrapper.classList.add("folder-wrapper");
      folderWrapper.style.position = "absolute";
      folderWrapper.style.top  = `${folder.y}px`;
      folderWrapper.style.left = `${folder.x}px`;

      folderWrapper.tabIndex = 0;
      folderWrapper.setAttribute('role', 'button');
      folderWrapper.setAttribute('aria-label', folder.label);
      folderWrapper.dataset.fid   = folder.id;
      folderWrapper.dataset.label = folder.label;
      folderWrapper.addEventListener('mousedown', () => folderWrapper.focus());

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
  document.addEventListener('keydown', (e) => {
    const isSpace = e.key === ' ' || e.key === 'Space' || e.key === 'Spacebar' || e.code === 'Space';
    const activeFolder = document.activeElement && document.activeElement.closest('.folder-wrapper');
    if (activeFolder && isSpace) e.preventDefault();
  });
  // keyboard activation
  document.addEventListener('keyup', (e) => {
    const isEnter = e.key === 'Enter';
    const isSpace = e.key === ' ' || e.key === 'Space' || e.key === 'Spacebar' || e.code === 'Space';
    if (!isEnter && !isSpace) return;
    const activeFolder = document.activeElement && document.activeElement.closest('.folder-wrapper');
    if (!activeFolder) return;
    e.preventDefault();
    clickAudio.currentTime = 0;
    clickAudio.play().catch(()=>{});
    const fid = activeFolder.dataset.fid;
    const f = folderData.find(x => x.id === fid);
    if (f) openWindow(f.id, f.label, f.content);
  });

  /* ---------- Angela illustration clicks ---------- */
  if (angelaIllustration) {
    angelaIllustration.addEventListener("click", () => {
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

      document.querySelectorAll(".folder-wrapper").forEach(folder => {
        folder.classList.add("show");
        const randX = Math.floor(Math.random() * (window.innerWidth  - 100));
        const randY = Math.floor(Math.random() * (window.innerHeight - 100));
        folder.style.left = `${randX}px`;
        folder.style.top  = `${randY}px`;
      });
    });
  }

  function sanitize(str) {
  // super basic guard; you can get fancier if you want
  return String(str || "").trim();
}

function initGuestbook(rootEl) {
  if (!rootEl) return;
  const form   = rootEl.querySelector(".guestbook-form");
  const listEl = rootEl.querySelector(".guestbook-list");
  const status = rootEl.querySelector(".guestbook-status");

  const escapeHTML = s => String(s||"").replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

  // live render from Firestore
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

  // optimistic submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim().slice(0, 40);
    const msg  = String(fd.get("msg")  || "").trim().slice(0, 300);
    if (!msg) { status.textContent = "say something first!"; return; }

    // rate limit: 30s
    const last = Number(localStorage.getItem("gb_last") || 0);
    const now  = Date.now();
    if (now - last < 30_000) { status.textContent = "whoa tiger—wait a few seconds!"; return; }

    // 1) show temp item immediately
    const temp = document.createElement("div");
    temp.className = "gb-item pending";
    const when = new Date();
    temp.innerHTML = `
      <div class="gb-meta">${escapeHTML(name || "you")} • <span>${when.toLocaleString()}</span></div>
      <div class="gb-text">${escapeHTML(msg)} <em class="pending-note">(sending…)</em></div>
    `;
    // put new messages on top
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
      // 2) remove the temp; real one will appear via onSnapshot
      temp.remove();
      setTimeout(() => (status.textContent = ""), 1200);
    } catch (err) {
      console.error(err);
      // mark temp as failed
      const note = temp.querySelector(".pending-note");
      if (note) note.textContent = "(failed to send)";
      temp.classList.add("failed");
      status.textContent = "oops, failed to post.";
    }
  });
}




  /* ---------- open window ---------- */
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


    win.style.zIndex = ++highestZIndex;
    makeDraggable(win);
  }

  /* ---------- dragging ---------- */
  function makeDraggable(el) {
    let pressed = false, dragging = false;
    let startX = 0, startY = 0, offsetX = 0, offsetY = 0;
    const THRESHOLD = 8;

    el.addEventListener("mousedown", (e) => {
      pressed = true; dragging = false;
      startX = e.clientX; startY = e.clientY;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      el.style.transition = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!pressed) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!dragging && (Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD)) {
        dragging = true;
        el.style.zIndex = ++highestZIndex;
      }
      if (dragging) {
        let newLeft = e.clientX - offsetX;
        let newTop  = e.clientY - offsetY;
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth  - el.offsetWidth));
        newTop  = Math.max(0, Math.min(newTop,  window.innerHeight - el.offsetHeight));
        el.style.left = `${newLeft}px`;
        el.style.top  = `${newTop}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      if (!pressed) return;
      pressed = false;
      el.style.transition = "all 0.4s ease";
      el.__dragMoved = dragging;
      setTimeout(() => { el.__dragMoved = false; }, 0);
    });
  }

  // 💫 Expose closeWindow globally for the ✖ button
window.closeWindow = function (id) {
  const win = document.getElementById(`window-${id}`);
  if (win) {
    // Play close sound
    const closeAudio = new Audio('sounds/folder-close.mp3');
    closeAudio.volume = 0.35;
    closeAudio.play().catch(() => {});

    win.remove();
  }
};
});
