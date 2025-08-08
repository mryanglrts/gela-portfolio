document.addEventListener("DOMContentLoaded", () => {
  const helloScreen = document.getElementById("hello-screen");
  const helloText = document.getElementById("hello-text");
  const desktop = document.getElementById("desktop");
  const angelaIllustration = document.getElementById("angela-illustration");
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;
  const folderContainer = document.getElementById("folders");
  const windowContainer = document.getElementById("windows");
  const mainWindow = document.getElementById("window-home");
  refreshAmbientFX();


  let angelaClickCount = 0;
  let highestZIndex = 100;

  // Create ambient layer if missing
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

/* ===== Night: twinkling stars ===== */
function createStars(count = 70) {
  const ambient = ensureAmbientLayer();
  clearAmbient();
  ambient.classList.add('ambient-stars');

  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'star';
    const size = Math.random() * 2 + 1;                // 1–3 px
    const x = Math.random() * 100;                     // %
    const y = Math.random() * 100;                     // %
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

/* ===== Light: drifting flowers ===== */
function createFlowers(count = 24) {
  const ambient = ensureAmbientLayer();
  clearAmbient();
  ambient.classList.add('ambient-flowers');

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    const left = Math.random() * 100;                  // %
    const delay = (-Math.random() * 12).toFixed(2) + 's'; // negative for stagger
    const fall = (12 + Math.random() * 10).toFixed(2) + 's';
    const sway = (5 + Math.random() * 4).toFixed(2) + 's';
    const size = (14 + Math.random() * 12).toFixed(0) + 'px';

    p.style.setProperty('--x', left + 'vw');
    p.style.setProperty('--delay', delay);
    p.style.setProperty('--fall-dur', fall);
    p.style.setProperty('--sway-dur', sway);
    p.style.setProperty('--size', size);

    ambient.appendChild(p);
  }
}

/* Decide which effect based on current theme */
function refreshAmbientFX() {
  if (document.body.classList.contains('night-mode')) {
    createStars();
  } else {
    createFlowers();
  }
}


  // Centered-but-staggered offsets
  const STAGGER = [
    [0, 0],
    [24, 24],
    [-24, 24],
    [24, -24],
    [-24, -24],
    [48, 48],
    [-48, 48],
    [48, -48],
    [-48, -48],
  ];
  let nextOffsetIndex = 0;

  // ⛑️ Only make the main window draggable if it exists at load
  if (mainWindow) makeDraggable(mainWindow);

  // 💬 Angela's speech bubble
  function showAngelaBubble(text) {
    const bubble = document.getElementById("angela-bubble");
    if (!bubble) return;
    bubble.querySelector(".bubble-text").innerText = text;
    bubble.classList.add("show");
    setTimeout(() => bubble.classList.remove("show"), 2000);
  }

  // 🌸 Intro transition (guarded)
  if (helloText) {
    helloText.addEventListener("click", () => {
      if (!helloScreen || !desktop) return;
      helloScreen.classList.add("hidden");
      setTimeout(() => {
        helloScreen.style.display = "none";
        desktop.classList.remove("hidden");
      }, 600);
    });
  }

  // 🔄 Swap link icons to match theme (used on toggle and can be reused anywhere)
  function refreshLinkIcons() {
    const isDark = document.body.classList.contains('night-mode');
    document.querySelectorAll('.link-icon img[data-name]').forEach(img => {
      const name = img.dataset.name; // twitter/facebook/instagram/discord
      img.src = `images/${name}-${isDark ? 'dark' : 'light'}.svg`;
    });
  }

  // 🌗 Toggle day/night mode (guarded)
  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      body.classList.toggle("night-mode");
      body.classList.toggle("day-mode");
      refreshAmbientFX();


      const isNight = body.classList.contains("night-mode");

      document.querySelectorAll(".folder").forEach(folder => {
        folder.src = isNight ? "images/folder-dark.svg" : "images/folder-light.svg";
      });

      if (angelaIllustration) {
        angelaIllustration.src = isNight ? "images/angela-dark.svg" : "images/angela-light.svg";
      }

      // Update contact window illustration if open
      const contactIllu = document.querySelector("#window-contact .contact-illustration");
      if (contactIllu) {
        contactIllu.src = isNight
          ? "images/angela-dark-heart.svg"
          : "images/angela-light-heart.svg";
      }

      // 🔁 Update link icons in the Links window (if it's open)
      refreshLinkIcons();
    });
  }

  /* ===============================
     🌸 FAQ HELPERS (behavior only)
     =============================== */
  function getFaqContent() {
    const items = [
      {
        q: "what software do you use?",
        a: `
          <ul>
            <li><strong>coding:</strong> Visual Studio Code! </li>
            <li><strong>design:</strong> Figma or Canva </li>
            <li><strong>courses:</strong> Youtube or Coursera? </li>
            <li>you can send me an email you know...</li>
          </ul>
        `
      },
      { q: "what are your rates?", a: "i'm currently at 10-12$/hour!" },
      { q: "what languages do you usually use?", a: "html, css, js, and nodereact!" },
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
          </div>
        `).join('')}
      </div>
    `;
  }

  function initFaq(root) {
    const items = root.querySelectorAll(".faq-item");
    items.forEach((it) => {
      const btn = it.querySelector(".faq-q");
      const panel = it.querySelector(".faq-a");
      btn.addEventListener("click", () => {
        const isOpen = it.classList.contains("open");
        // close others
        root.querySelectorAll(".faq-item.open").forEach(o => {
          if (o !== it) {
            o.classList.remove("open");
            o.querySelector(".faq-a").style.maxHeight = null;
            o.querySelector(".faq-q").setAttribute("aria-expanded","false");
          }
        });
        // toggle this
        it.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(!isOpen));
        panel.style.maxHeight = isOpen ? null : panel.scrollHeight + "px";
      });
    });
  }

  // 🔗 LINKS window content (now includes data-name for live swapping)
  function getLinksContent() {
    const isDarkMode = document.body.classList.contains('night-mode');

    const links = [
      { href: "https://twitter.com/mryanglrts",   name: "twitter"   },
      { href: "https://facebook.com/assistwithmva",  name: "facebook"  },
      { href: "https://instagram.com/gelatisimeri", name: "instagram" },
      { href: "https://discord.com/users/848336476969369610",    name: "discord"   }
    ];

    return `
      <div class="links-window">
        <div class="link-grid">
          ${links.map(l => `
            <a class="link-card" href="${l.href}" target="_blank" rel="noopener">
              <div class="link-icon">
                <img
                  src="images/${l.name}-${isDarkMode ? 'dark' : 'light'}.svg"
                  alt="${l.name} icon"
                  data-name="${l.name}"
                  loading="lazy"
                />
              </div>
              <div class="link-label">${l.name}</div>
            </a>
          `).join("")}
        </div>
        <p class="links-note">clicking any of the links will open a new tab!</p>
      </div>
    `;
  }

  function getWorksContent() {
    return `
      <div class="works">
        <!-- Banner -->
        <div class="works-banner">
          <strong>please do offer me a job</strong> via my <a href="mailto:mryangelaworks@gmail.com">work email</a>!
          <div class="works-sub">i do web design, admin work, social media, and anything you want me to do... :)</div>
        </div>

        <!-- Chips: Tools / Dev -->
        <div class="works-chips">
          <section>
            <h3>TOOLS I KNOW</h3>
            <div class="chip-grid">
              <span class="chip">Figma</span>
              <span class="chip">Visual Studio Code</span>
              <span class="chip">Canva</span>
              <span class="chip">Google Workspace</span>
              <span class="chip">Meta Ads</span>
              <span class="chip">Excel Sheets</span>
              <span class="chip">Thinking</span>
              <span class="chip">Thinking</span>
            </div>
          </section>

          <section>
            <h3>DEVELOPMENT</h3>
            <div class="chip-grid">
              <span class="chip">HTML/CSS</span>
              <span class="chip">JavaScript</span>
              <span class="chip">React</span>
              <span class="chip">Next.js</span>
              <span class="chip">Gatsby</span>
              <span class="chip">C</span>
              <span class="chip">Python</span>
            </div>
          </section>
        </div>

        <hr class="works-rule" />

        <!-- Galleries -->
        <section class="works-section">
          <h3>GRAPHICS</h3>
          <div class="card-grid">
            <a class="card" href="#" target="_blank" rel="noopener">
              <div class="thumb"></div>
              <div class="card-title">Theater Design</div>
            </a>
            <a class="card" href="#" target="_blank" rel="noopener">
              <div class="thumb"></div>
              <div class="card-title">Automation Design</div>
            </a>
          </div>
        </section>

        <section class="works-section">
          <h3>WEB / UI</h3>
          <div class="card-grid">
            <a class="card" href="#" target="_blank" rel="noopener">
              <div class="thumb"></div>
              <div class="card-title">soft-portfolio concept</div>
            </a>
            <a class="card" href="#" target="_blank" rel="noopener">
              <div class="thumb"></div>
              <div class="card-title">haikyuu fan archive (ao3 helper)</div>
            </a>
          </div>
        </section>
      </div>
    `;
  }

  // 📁 Folder data
  const folderData = [
    {
      id: "works",
      label: "my works",
      x: 100,
      y: 150,
      content: getWorksContent()
    },
    {
      id: "contact",
      label: "contact me",
      x: 150,
      y: 400,
      content: `
        <div class="contact-window">
          <h2 class="contact-title">i'd love to talk!</h2>
          <p class="contact-desc">
            the easiest way to contact me is through email! i don’t really have any official social medias for work,
            so please direct questions to my work email instead.
          </p>
          <img 
            src="${document.body.classList.contains('night-mode') 
              ? 'images/angela-dark-heart.svg' 
              : 'images/angela-light-heart.svg'}" 
            alt="Angela heart" 
            class="contact-illustration"
          />
          <p class="contact-email">
            email me at: <a href="mailto:mryangelaworks@gmail.com">mryangelaworks@gmail.com</a>
          </p>
          <p class="contact-note">or press the button below to open your mail app.</p>
          <a href="mailto:mryangelaworks@gmail.com" class="contact-btn">send me an email!</a>
        </div>
      `
    },
    {
      id: "links",
      label: "my links",
      x: 420,
      y: 160,
      content: getLinksContent()
    },
   {
  id: "about",
  label: "about me",
  x: 1600,
  y: 420,
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
          i have fluency in 
          <strong class="highlight-text">English</strong> and 
          <strong class="highlight-text">Filipino (Bisaya)</strong>, 
          and can speak in conversational 
          <strong class="highlight-text">Japanese</strong>.
        </p>
        <p style="font-size: 0.9em; opacity: 0.8;">
          "Salut, enchantée! Moi, c’est Mary!"
          i speak a bit of French too, but not enough to hold a conversation. 
        </p>
      </div>
    </div>
  `
}
  ];

  // 🗂️ Create folders on screen
  if (folderContainer) {
    folderData.forEach((folder) => {
      const folderWrapper = document.createElement("div");
      folderWrapper.classList.add("folder-wrapper");
      folderWrapper.style.position = "absolute";
      folderWrapper.style.top = `${folder.y}px`;
      folderWrapper.style.left = `${folder.x}px`;

      const folderImg = document.createElement("img");
      folderImg.classList.add("folder");
      folderImg.src = body.classList.contains("night-mode")
        ? "images/folder-dark.svg"
        : "images/folder-light.svg";
      folderImg.setAttribute("draggable", "false"); // prevent native img drag

      const label = document.createElement("div");
      label.classList.add("folder-label");
      label.innerText = folder.label;

      folderWrapper.appendChild(folderImg);
      folderWrapper.appendChild(label);
      folderContainer.appendChild(folderWrapper);

      // prevent native drag on wrapper
      folderWrapper.addEventListener("dragstart", (e) => e.preventDefault());

      makeDraggable(folderWrapper);

      folderWrapper.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (folderWrapper.__dragMoved) return; // don’t open if it was a drag
        openWindow(folder.id, folder.label, folder.content);
      });
    });
  }

  // 🧠 Angela illustration click logic (guarded)
  if (angelaIllustration) {
    angelaIllustration.addEventListener("click", () => {
      angelaClickCount++;
      const isNight = body.classList.contains("night-mode");

      if (angelaClickCount > 14) {
        angelaClickCount = 0;
        angelaIllustration.src = isNight
          ? "images/angela-dark.svg"
          : "images/angela-light.svg";
        showAngelaBubble("i'm okay i guess..");
        return;
      }

      if (angelaClickCount >= 9) {
        angelaIllustration.src = isNight
          ? "images/angela-dark-cry.svg"
          : "images/angela-light-cry.svg";
        showAngelaBubble("stop it....i'm overstimulated!");
        return;
      }

      if (angelaClickCount >= 5) {
        angelaIllustration.src = isNight
          ? "images/angela-dark-angry.svg"
          : "images/angela-light-angry.svg";
        showAngelaBubble("you can stop now.");
        return;
      }

      angelaIllustration.src = isNight
        ? "images/angela-dark-smile.svg"
        : "images/angela-light-smile.svg";
      showAngelaBubble("you actually clicked me!");

      document.querySelectorAll(".folder-wrapper").forEach(folder => {
        folder.classList.add("show");
        const randX = Math.floor(Math.random() * (window.innerWidth - 100));
        const randY = Math.floor(Math.random() * (window.innerHeight - 100));
        folder.style.left = `${randX}px`;
        folder.style.top = `${randY}px`;
      });
    });
  }

  // 🪟 Window open function (centered + staggered + clamped + fade/pop)
  function openWindow(id, title, content) {
    if (document.getElementById(`window-${id}`)) return;

    const win = document.createElement("div");
    win.classList.add("window");
    win.id = `window-${id}`;
    win.style.position = "absolute";
    win.style.opacity = 0;
    win.style.transform = "scale(0.95)";
    win.style.transition = "opacity 0.3s ease, transform 0.3s ease";

    win.innerHTML = `
      <div class="window-header">
        <span>${title}</span>
        <button class="close-btn" onclick="closeWindow('${id}')">✖</button>
      </div>
      <div class="window-content">${content}</div>
    `;

    // add hidden first so we can measure actual size
    win.style.visibility = "hidden";
    windowContainer.appendChild(win);

    // measure and compute centered + staggered position
    const rect = win.getBoundingClientRect();
    const w = rect.width || 560;
    const h = rect.height || 380;

    const margin = 16;
    const baseX = (window.innerWidth - w) / 2;
    const baseY = (window.innerHeight - h) / 2;

    const [dx, dy] = STAGGER[nextOffsetIndex % STAGGER.length];
    nextOffsetIndex++;

    let left = baseX + dx;
    let top  = baseY + dy;

    // clamp to viewport
    left = Math.max(margin, Math.min(left, window.innerWidth - w - margin));
    top  = Math.max(margin, Math.min(top,  window.innerHeight - h - margin));

    win.style.left = `${left}px`;
    win.style.top = `${top}px`;

    // reveal + animate
    win.style.visibility = "visible";
    requestAnimationFrame(() => {
      win.style.opacity = 1;
      win.style.transform = "scale(1)";
    });

    // init FAQ accordion if this is the FAQ window
    if (id === "faq") {
      const root = win.querySelector(".window-content");
      initFaq(root);
    }

    // if it's the Links window, make sure icons match current theme
    if (id === "links") {
      refreshLinkIcons();
    }

    // bring to front & make draggable
    win.style.zIndex = ++highestZIndex;
    makeDraggable(win);
  }

  // 🖱️ Dragging logic (thresholded: clicks ≠ drags)
  function makeDraggable(el) {
    let pressed = false;
    let dragging = false;
    let startX = 0, startY = 0;
    let offsetX = 0, offsetY = 0;
    const THRESHOLD = 8;

    el.addEventListener("mousedown", (e) => {
      pressed = true;
      dragging = false;
      startX = e.clientX;
      startY = e.clientY;
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
        let newTop = e.clientY - offsetY;

        // Clamp so folder stays on screen
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - el.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - el.offsetHeight));

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
    if (win) win.remove();
  };
});
