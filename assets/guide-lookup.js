const article = document.querySelector("main.content");
const stages = Array.from(article?.querySelectorAll(".day-stages a") ?? []);
const header = document.getElementById("quarto-header");
const home = header.querySelector(".navbar-brand");
const siteRoot = new URL("./", home.href);
const navTools = header.querySelector(".quarto-navbar-tools");

const themeToggle = navTools.querySelector(".quarto-color-scheme-toggle");
if (themeToggle) {
  const autoTheme = document.getElementById("guide-theme-auto");
  const themePreference = "quarto-color-scheme";
  const syncTheme = () => {
    const label = document.body.classList.contains("quarto-dark") ? "切换至浅色模式" : "切换至深色模式";
    themeToggle.title = label;
    themeToggle.setAttribute("aria-label", label);
    try {
      autoTheme.setAttribute("aria-pressed", String(localStorage.getItem(themePreference) === null));
    } catch {
      autoTheme.setAttribute("aria-pressed", "true");
    }
  };
  autoTheme.addEventListener("click", () => {
    try {
      if (localStorage.getItem(themePreference) === null) return;
      localStorage.removeItem(themePreference);
    } catch {
      return;
    }
    // Let Quarto refresh its saved and system color-scheme state together.
    location.reload();
  });
  themeToggle.after(autoTheme);
  autoTheme.hidden = false;
  syncTheme();
  new MutationObserver(syncTheme).observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

const toc = document.querySelector("#quarto-sidebar > #TOC");
if (toc) {
  const sidebar = toc.parentElement;
  const layout = sidebar.parentElement;
  const toolbar = document.createElement("div");
  toolbar.className = "guide-toc-toolbar";
  const title = toc.querySelector("#toc-title");
  toc.setAttribute("aria-labelledby", title.id);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "guide-toc-close";
  close.textContent = "收起";
  close.setAttribute("aria-label", "收起本页目录");
  close.setAttribute("aria-controls", sidebar.id);
  toolbar.append(title, close);
  toc.prepend(toolbar);

  const reopen = document.createElement("button");
  reopen.type = "button";
  reopen.className = "guide-toc-reopen";
  reopen.textContent = "展开目录";
  reopen.setAttribute("aria-controls", sidebar.id);
  reopen.hidden = true;
  sidebar.after(reopen);

  // Match the desktop TOC follow behavior used by DW, PW and KT.
  const desktop = window.matchMedia("(min-width: 992px)");
  let followPaused = false;
  let followFrame = 0;
  function followActive() {
    followFrame = 0;
    if (!desktop.matches || followPaused || !sidebar.getClientRects().length ||
        getComputedStyle(sidebar).visibility === "hidden") return;
    let active = toc.querySelector("a.nav-link.active");
    while (active && !active.getClientRects().length) {
      active = active.closest("li")?.parentElement?.closest("li")?.querySelector(":scope > a.nav-link");
    }
    if (!active) return;
    const rail = sidebar.getBoundingClientRect();
    const link = active.getBoundingClientRect();
    const top = Math.max(rail.top, toolbar.getBoundingClientRect().bottom) + 24;
    const bottom = rail.bottom - 24;
    const delta = link.height > bottom - top || link.top < top ? link.top - top
      : link.bottom > bottom ? link.bottom - bottom : 0;
    const next = Math.max(0, Math.min(sidebar.scrollHeight - sidebar.clientHeight, sidebar.scrollTop + delta));
    if (Math.abs(next - sidebar.scrollTop) > 1) sidebar.scrollTo({ top: next, behavior: "instant" });
  }
  function queueFollow() {
    if (!followFrame) followFrame = requestAnimationFrame(followActive);
  }
  function pauseFollow() {
    if (desktop.matches) followPaused = true;
  }
  function resumeFollow() {
    followPaused = false;
    queueFollow();
  }
  sidebar.addEventListener("pointerenter", (event) => {
    if (event.relatedTarget === reopen && reopen.hidden) return;
    pauseFollow();
  });
  sidebar.addEventListener("pointerdown", pauseFollow, { passive: true });
  sidebar.addEventListener("wheel", pauseFollow, { passive: true });
  toc.addEventListener("focusin", (event) => {
    if (event.target.closest("a.nav-link")) pauseFollow();
  });
  const readingInput = (event) => {
    if (desktop.matches && (article?.contains(event.target) || event.target.closest?.("footer.footer"))) resumeFollow();
  };
  document.addEventListener("wheel", readingInput, { capture: true, passive: true });
  document.addEventListener("touchstart", readingInput, { capture: true, passive: true });
  document.addEventListener("pointerdown", (event) => {
    if (desktop.matches && event.target === document.documentElement) resumeFollow();
  }, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (!desktop.matches || !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key) ||
        event.target.closest?.('input, textarea, select, [contenteditable="true"], #kt-search-dialog')) return;
    if (article?.contains(event.target) || event.target === document.body || event.target === document.documentElement) resumeFollow();
  });
  toc.addEventListener("click", (event) => {
    if (desktop.matches && event.target.closest("a.nav-link")) resumeFollow();
  });
  new MutationObserver(queueFollow).observe(toc, { subtree: true, attributes: true, attributeFilter: ["class"] });
  const followResize = new ResizeObserver(queueFollow);
  followResize.observe(sidebar);
  followResize.observe(toc);
  sidebar.addEventListener("scroll", queueFollow, { passive: true });
  window.addEventListener("resize", queueFollow);
  window.addEventListener("quarto-sectionChanged", queueFollow);
  desktop.addEventListener("change", resumeFollow);

  const storageKey = "jurodo-toc-collapsed";
  function showToc(collapsed) {
    layout.toggleAttribute("data-toc-collapsed", collapsed);
    close.setAttribute("aria-expanded", String(!collapsed));
    reopen.setAttribute("aria-expanded", String(!collapsed));
    reopen.hidden = !collapsed;
    queueFollow();
  }

  function restoreToc() {
    try { showToc(sessionStorage.getItem(storageKey) === "1"); } catch {}
  }

  function setTocCollapsed(collapsed) {
    showToc(collapsed);
    try { sessionStorage.setItem(storageKey, collapsed ? "1" : "0"); } catch {}
    (collapsed ? reopen : close).focus({ preventScroll: true });
    if (!collapsed) resumeFollow();
  }

  const measureHeader = () => {
    layout.style.setProperty("--guide-header-height", `${header.getBoundingClientRect().height}px`);
  };
  measureHeader();
  new ResizeObserver(measureHeader).observe(header);
  showToc(false);
  restoreToc();
  window.addEventListener("pageshow", restoreToc);
  close.addEventListener("click", () => setTocCollapsed(true));
  reopen.addEventListener("click", () => setTocCollapsed(false));
}

function targetFor(hash) {
  if (!hash) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

function revealLocation(hash) {
  const target = targetFor(hash);
  let opened = false;
  for (let panel = target?.closest("details"); panel; panel = panel.parentElement.closest("details")) {
    if (!panel.open) {
      panel.open = true;
      opened = true;
    }
  }
  if (opened) target.scrollIntoView();
  return target;
}

function updateStage(section) {
  const current = section
    ? stages.find((link) => (link.dataset.stage || link.hash.slice(1)) === section.id)
    : stages[0];
  for (const link of stages) {
    if (link === current) {
      if (!link.hasAttribute("aria-current")) link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

function updateStageFromHash() {
  const target = targetFor(location.hash);
  updateStage(target?.closest("main > section.level2"));
}

const dateNav = document.querySelector('#quarto-header .nav-link[href$="/guide/"], #quarto-header .nav-link[href$="/guide/index.html"]');
const dateSections = ["guide/lunch-calendar.html", "guide/side-stories.html"];
if (dateNav && (article?.querySelector(".day-pager") || dateSections.some((path) => location.pathname === new URL(path, siteRoot).pathname))) {
  dateNav.setAttribute("aria-current", "location");
}

const currentMenuItem = Array.from(header.querySelectorAll(".dropdown-item[href]"))
  .find((link) => link.pathname === location.pathname);
if (currentMenuItem) {
  currentMenuItem.setAttribute("aria-current", "page");
  currentMenuItem.classList.add("active");
  currentMenuItem.closest(".dropdown").querySelector(".dropdown-toggle").classList.add("active");
}

article?.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!event.defaultPrevented && link?.hash && link.origin === location.origin && link.pathname === location.pathname) {
    revealLocation(link.hash);
  }
});
window.addEventListener("hashchange", () => {
  revealLocation(location.hash);
  updateStageFromHash();
});
const initialHash = location.hash;
const initialTarget = revealLocation(initialHash);
updateStageFromHash();

if (initialTarget && document.body.classList.contains("notransition")) {
  // Quarto resets the scroll in Safari while initializing the theme.
  const restoreAnchor = new MutationObserver(() => {
    if (document.body.classList.contains("notransition")) return;
    restoreAnchor.disconnect();
    requestAnimationFrame(() => {
      if (location.hash === initialHash && window.scrollY === 0) initialTarget.scrollIntoView();
    });
  });
  restoreAnchor.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

if (stages.length) {
  const sections = Array.from(article.querySelectorAll(":scope > section.level2"));
  let scheduled = false;
  window.addEventListener("scroll", () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const readingLine = header.getBoundingClientRect().bottom + 20;
      updateStage(sections.findLast((section) => section.getBoundingClientRect().top <= readingLine));
      scheduled = false;
    });
  }, { passive: true });
}

const launcher = document.querySelector("#kt-search-launcher");
const dialog = document.querySelector("#kt-search-dialog");
const form = document.querySelector("#kt-search-form");
const input = document.querySelector("#kt-search-input");
const results = document.querySelector("#kt-search-results");
const status = document.querySelector("#kt-search-status");
navTools.append(launcher);
launcher.hidden = false;

const normalize = (value) => value.normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
const resultLimit = 30;
let indexPromise;
let queryVersion = 0;

function prepareIndex(entries) {
  return entries.map((entry) => ({
    ...entry,
    label: normalize(entry.name).replace(/^d\d+\s+(?:·\s+)?/, ""),
    aliases: normalize(entry.aliases ?? ""),
    locator: normalize(entry.name + " " + entry.context),
    words: normalize([entry.day, entry.name, entry.context, entry.aliases, entry.terms].join(" ")),
  }));
}

function loadIndex() {
  indexPromise ??= fetch(new URL("guide-search.json", siteRoot))
    .then((response) => {
      if (!response.ok) throw new Error("Search index unavailable");
      return response.json();
    })
    .then(prepareIndex)
    .catch((error) => {
      indexPromise = undefined;
      throw error;
    });
  return indexPromise;
}

function findMatches(entries, query) {
  // Accept the date forms players type, without changing displayed guide text.
  query = query.replace(/第?\s*0*(\d+)\s*天/g, "d$1")
    .replace(/\bd0+(\d+)\b/g, "d$1");
  const parts = (query.match(/d\d+|#\d+|(?:(?!d\d+)[^\s#])+/g) ?? []).filter((part) => part !== "·");
  if (!parts.length) return [];
  const day = parts.find((part) => /^d\d+$/.test(part));
  const dayPage = day ? "guide/" + day + ".html" : "";
  const galleryQuery = parts.length > 1 && parts.some((part) => part === "图库" || part === "画廊");
  const terms = galleryQuery ? parts.filter((part) => part !== "图库" && part !== "画廊") : parts;
  const phrase = terms.filter((part) => part !== day).join(" ");
  const wholePhrase = " " + phrase + " ";
  const rules = terms.map((part) => /^(?:d|#)\d+$/.test(part)
    ? new RegExp("(?:^|[^a-z0-9])" + part + "(?![a-z0-9])")
    : part);
  const matches = [];
  for (const entry of entries) {
    if (galleryQuery && !entry.gallery) continue;
    if (day && entry.day && entry.day.toLowerCase() !== day) continue;
    const contains = (field) => rules.every((rule) => typeof rule === "string" ? field.includes(rule) : rule.test(field));
    if (!contains(entry.words)) continue;
    const exactLabel = phrase && entry.label === phrase;
    const exactAlias = phrase && (" " + entry.aliases + " ").includes(wholePhrase);
    // An exact directory name or alias is navigation intent, ahead of
    // incidental aliases on individual rewards, scenes and endings.
    const score = !entry.href.includes("#") && (exactLabel || exactAlias) ? (day || !entry.day ? 10 : 6)
      : entry.achievement && exactLabel ? 9
      : (entry.ending || entry.titleArt) && exactLabel ? 8
      : entry.gallery && exactLabel ? 7
      : entry.href === dayPage && (parts.length === 1 || exactLabel) ? 6
      : exactLabel ? 5
      : exactAlias ? 3
      : phrase && entry.label.includes(phrase) ? 2
      : contains(entry.locator) ? 1 : 0;
    matches.push({ entry, score });
  }
  return matches.sort((a, b) => b.score - a.score);
}

async function updateResults() {
  const version = ++queryVersion;
  const query = normalize(input.value);
  results.replaceChildren();
  status.textContent = query ? "正在搜索…" : "";
  if (!query) return;

  try {
    const entries = await loadIndex();
    if (version !== queryVersion || !dialog.open) return;
    const matches = findMatches(entries, query);
    for (const { entry } of matches.slice(0, resultLimit)) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const name = document.createElement("strong");
      link.href = new URL(entry.href, siteRoot);
      name.textContent = entry.name;
      link.append(name);
      if (entry.context) {
        const context = document.createElement("small");
        context.textContent = entry.context;
        link.append(context);
      }
      item.append(link);
      results.append(item);
    }
    if (matches.length > resultLimit) {
      status.textContent = "找到 " + matches.length + " 项，显示前 " + resultLimit + " 项。可加日期缩小范围。";
    } else {
      status.textContent = matches.length ? "找到 " + matches.length + " 项" : "没有找到。试试游戏原话或日期。";
    }
  } catch {
    if (version === queryVersion && dialog.open) status.textContent = "暂时无法搜索，请重试。";
  }
}

launcher.addEventListener("click", () => {
  dialog.showModal();
  input.focus();
  if (input.value) updateResults();
});
document.querySelector("#kt-search-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !event.isComposing) {
    event.preventDefault();
    dialog.close();
  }
});
dialog.addEventListener("close", () => {
  ++queryVersion;
  if (dialog.returnValue !== "result") launcher.focus({ preventScroll: true });
  dialog.returnValue = "";
});
input.addEventListener("input", (event) => {
  if (!event.isComposing) updateResults();
});
input.addEventListener("compositionend", updateResults);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  results.querySelector("a")?.click();
});
results.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  dialog.close("result");
  if (link.pathname !== location.pathname || !link.hash) return;
  const target = revealLocation(link.hash);
  if (target) {
    const focusTarget = target.querySelector("h2, h3, h4, summary") || target;
    focusTarget.setAttribute("tabindex", "-1");
    focusTarget.focus({ preventScroll: true });
    updateStage(target.closest("main > section.level2"));
  }
});

const achievementPreview = document.querySelector("#achievement-preview");
const previewLinks = article?.querySelectorAll("a.achievement-ref, a.gallery-ref") ?? [];
if (previewLinks.length) {
  const previewTitle = achievementPreview.querySelector("strong");
  const previewLocation = achievementPreview.querySelector("small");
  const previewTrigger = achievementPreview.querySelector(".achievement-preview-trigger");
  const previewReplay = achievementPreview.querySelector(".achievement-preview-replay");
  const previewTouch = achievementPreview.querySelector(".achievement-preview-touch");
  let activePreview;
  let dismissTimer;
  let pressedLink;
  let pointerType = "";

  function dismissPreview() {
    clearTimeout(dismissTimer);
    if (!activePreview) return;
    if (activePreview.description === null) activePreview.link.removeAttribute("aria-describedby");
    else activePreview.link.setAttribute("aria-describedby", activePreview.description);
    activePreview = undefined;
    achievementPreview.hidden = true;
  }

  function placePreview() {
    if (!activePreview) return;
    const anchor = activePreview.link.getBoundingClientRect();
    const margin = 12;
    const gap = 6;
    const headerBottom = header.getBoundingClientRect().bottom;
    if (!anchor.width || anchor.bottom <= headerBottom || anchor.top >= innerHeight) {
      dismissPreview();
      return;
    }
    const below = innerHeight - anchor.bottom - gap - margin;
    const above = anchor.top - Math.max(headerBottom, margin) - gap;
    achievementPreview.style.maxHeight = Math.max(above, below) + "px";
    const { width, height } = achievementPreview.getBoundingClientRect();
    achievementPreview.style.left = Math.max(margin, Math.min(anchor.left, innerWidth - width - margin)) + "px";
    achievementPreview.style.top = (height <= below || below >= above
      ? anchor.bottom + gap : anchor.top - gap - height) + "px";
  }

  function showPreview(link, kind) {
    clearTimeout(dismissTimer);
    if (activePreview?.link === link && activePreview.kind === kind) return;
    dismissPreview();
    const description = link.getAttribute("aria-describedby");
    const request = { link, kind, description };
    const url = new URL(link.href);
    const target = url.pathname.slice(siteRoot.pathname.length) + url.hash;
    activePreview = request;
    link.setAttribute("aria-describedby", [description, achievementPreview.id].filter(Boolean).join(" "));
    previewTitle.textContent = link.textContent.trim();
    previewLocation.textContent = "";
    previewTrigger.textContent = "";
    previewReplay.textContent = "";
    previewTouch.textContent = link.classList.contains("gallery-ref")
      ? url.hash.startsWith("#cg-") ? "再点一次查看补看方式" : "再点一次查看回放条目"
      : "再点一次查看成就";
    previewTouch.hidden = kind !== "touch";
    achievementPreview.hidden = false;
    achievementPreview.scrollTop = 0;
    placePreview();

    loadIndex().then((entries) => {
      if (activePreview !== request) return;
      const entry = entries.find((item) => item.href === target);
      if (!entry?.preview) return;
      previewTitle.textContent = entry.name;
      previewLocation.textContent = entry.preview.location;
      previewTrigger.textContent = entry.preview.trigger;
      previewReplay.textContent = entry.preview.replay;
      placePreview();
    }).catch(() => {});
  }

  function leavePreview() {
    clearTimeout(dismissTimer);
    dismissTimer = setTimeout(() => {
      if (activePreview?.kind === "mouse" && !achievementPreview.matches(":hover") &&
          !activePreview.link.matches(":hover")) dismissPreview();
    }, 220);
  }

  for (const link of previewLinks) {
    const icon = document.createElement("i");
    icon.className = "bi bi-card-text achievement-preview-icon";
    icon.setAttribute("aria-hidden", "true");
    link.prepend(icon);

    link.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") showPreview(link, "mouse");
    });
    link.addEventListener("pointerleave", leavePreview);
    link.addEventListener("focus", () => {
      if (link.matches(":focus-visible")) showPreview(link, "keyboard");
    });
    link.addEventListener("blur", () => {
      if (activePreview?.link === link && activePreview.kind === "keyboard") dismissPreview();
    });
    link.addEventListener("pointerdown", (event) => {
      pressedLink = link;
      pointerType = event.pointerType;
    });
    link.addEventListener("pointercancel", () => { pressedLink = undefined; });
    link.addEventListener("click", (event) => {
      const kind = pressedLink === link ? pointerType : event.pointerType;
      pressedLink = undefined;
      pointerType = "";
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.detail && (kind === "touch" || kind === "pen") &&
          (activePreview?.link !== link || activePreview.kind !== "touch")) {
        event.preventDefault();
        showPreview(link, "touch");
        return;
      }
      dismissPreview();
    });
  }

  achievementPreview.addEventListener("pointerenter", () => clearTimeout(dismissTimer));
  achievementPreview.addEventListener("pointerleave", leavePreview);
  document.addEventListener("pointerdown", (event) => {
    if (activePreview && !activePreview.link.contains(event.target) &&
        !achievementPreview.contains(event.target)) dismissPreview();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismissPreview();
  });
  window.addEventListener("hashchange", dismissPreview);
  window.addEventListener("pagehide", dismissPreview);
  window.addEventListener("scroll", placePreview, { capture: true, passive: true });
  window.addEventListener("resize", placePreview);
}
