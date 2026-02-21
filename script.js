/*
  Tiny Dashboard Visitation Rights — owleggs Evidence Board
  Safe-by-default: no tracking, no analytics, no network calls.
  (Optional Google Font is loaded via <link> in index.html — remove to be 100% offline.)

  Customize by editing CONFIG below.
*/

const CONFIG = {
  title: "Visitation Rights & owleggs Evidence Board",
  kicker: "Tiny Dashboard",
  subtitle: "Cozy neon accountability, three little lights, and a lamp that encourages emotional spaghetti.",

  // Visitation vibe status text. These are just strings shown on the page.
  visitationState: {
    allOff: "paused for snacks",
    someOn: "in negotiation (polite) ✨",
    allOn: "approved! tiny stomp-stomp visitation granted"
  },

  integrityState: {
    lampOn: "lamp-lit and mostly coherent",
    lampOff: "dim, dramatic, still valid"
  },

  // Three dashboard lights.
  lights: [
    {
      id: "lamp",
      label: "Lamp of Reasonable Feelings",
      statusOn: "on (warmth deployed)",
      statusOff: "off (feelings still allowed)"
    },
    {
      id: "hall",
      label: "Hallway Glow Worm",
      statusOn: "on (tiny patrol route ready)",
      statusOff: "off (stealth mode)"
    },
    {
      id: "desk",
      label: "Desk Neon: Evidence Mode",
      statusOn: "on (string board energized)",
      statusOff: "off (evidence taking a nap)"
    }
  ],

  // Evidence notes (pinned cards). Coordinates are in percentages of the grid.
  evidence: [
    {
      id: "note1",
      x: 6,
      y: 10,
      rot: -2.5,
      title: "Exhibit A: Tiny Dashboard Visitation Rights",
      body: "A fully ceremonial policy: if the lights are on, the tiny dashboard may visit the evidence board and do a respectful little spin."
    },
    {
      id: "note2",
      x: 52,
      y: 12,
      rot: 1.8,
      title: "Exhibit B: owleggs Pattern",
      body: "owleggs are frequently spotted near lamps, snacks, and places where feelings are stored. Correlation: strong. Causation: adorable."
    },
    {
      id: "note3",
      x: 22,
      y: 56,
      rot: 2.2,
      title: "Exhibit C: String Connectivity",
      body: "All clues connect via neon string. If the string looks silly, that means the investigation is working."
    },
    {
      id: "note4",
      x: 62,
      y: 58,
      rot: -1.6,
      title: "Exhibit D: Shared Custody Badge",
      body: "A badge is not a court order, but it is extremely official in the realm of vibes."
    }
  ],

  // Strings: connect note ids with colors.
  strings: [
    { from: "note1", to: "note2", color: "#10f3ff" },
    { from: "note2", to: "note3", color: "#ff3de8" },
    { from: "note3", to: "note4", color: "#79ffd7" },
    { from: "note1", to: "note3", color: "#ffd36e" }
  ],

  spaghettiCaption: "If feelings get tangled: place them gently under the lamp. The spaghetti understands.",

  // Local storage key for toggle persistence.
  storageKey: "tiny-dashboard-visitation-rights:v1"
};

const $ = (sel, root = document) => root.querySelector(sel);

function safeJsonStringify(obj) {
  return JSON.stringify(obj, null, 2);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
  } catch {
    // ignore (private browsing, etc.)
  }
}

function defaultState() {
  return {
    lights: {
      lamp: true,
      hall: false,
      desk: true
    }
  };
}

function applyText() {
  $("#title").textContent = CONFIG.title;
  $("#kicker").textContent = CONFIG.kicker;
  $("#subtitle").textContent = CONFIG.subtitle;
  $("#spaghettiCaption").textContent = CONFIG.spaghettiCaption;
}

function renderEvidence() {
  const grid = $("#evidenceGrid");
  grid.innerHTML = "";

  // SVG string layer (goes behind notes)
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "string-layer");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  grid.appendChild(svg);

  // Notes
  const noteEls = new Map();
  for (const note of CONFIG.evidence) {
    const el = document.createElement("article");
    el.className = "note";
    el.id = note.id;
    el.style.left = clamp(note.x, 0, 88) + "%";
    el.style.top = clamp(note.y, 0, 84) + "%";
    el.style.setProperty("--rot", (note.rot || 0) + "deg");

    const pin = document.createElement("div");
    pin.className = "pin";
    pin.setAttribute("aria-hidden", "true");

    const h = document.createElement("h3");
    h.textContent = note.title;

    const p = document.createElement("p");
    p.textContent = note.body;

    el.append(pin, h, p);
    grid.appendChild(el);
    noteEls.set(note.id, el);
  }

  // Strings between note pins
  const pinPos = (noteId) => {
    const el = noteEls.get(noteId);
    if (!el) return { x: 50, y: 50 };
    const left = parseFloat(el.style.left);
    const top = parseFloat(el.style.top);
    // Approx pin location relative to note box
    return { x: left + 3, y: top + 5 };
  };

  for (const s of CONFIG.strings) {
    const a = pinPos(s.from);
    const b = pinPos(s.to);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const midx = (a.x + b.x) / 2;
    const midy = (a.y + b.y) / 2;
    const wobble = ((a.x * 13 + a.y * 7 + b.x * 5) % 6) - 3;
    const c1x = midx + wobble;
    const c1y = midy - 6;
    const c2x = midx - wobble;
    const c2y = midy + 6;

    path.setAttribute(
      "d",
      `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`
    );
    path.setAttribute("class", "string");
    path.setAttribute("stroke", s.color || "#10f3ff");
    path.setAttribute("opacity", "0.72");
    svg.appendChild(path);
  }
}

function setLight(lightId, on) {
  document.body.dataset[lightId] = on ? "on" : "off";
  const statusEl = $("#status-" + lightId);
  const cfg = CONFIG.lights.find((l) => l.id === lightId);
  if (statusEl && cfg) statusEl.textContent = on ? cfg.statusOn : cfg.statusOff;
}

function updateSummary(state) {
  const lightValues = Object.values(state.lights);
  const onCount = lightValues.filter(Boolean).length;

  const visitation = $("#visitationState");
  if (onCount === 0) visitation.textContent = CONFIG.visitationState.allOff;
  else if (onCount === lightValues.length) visitation.textContent = CONFIG.visitationState.allOn;
  else visitation.textContent = CONFIG.visitationState.someOn;

  const integrity = $("#integrityState");
  integrity.textContent = state.lights.lamp ? CONFIG.integrityState.lampOn : CONFIG.integrityState.lampOff;
}

function wireUI() {
  // Initialize toggles based on CONFIG labels (text content already in HTML; keep it simple)
  const state = loadState() || defaultState();

  for (const l of CONFIG.lights) {
    const checkbox = $("#light-" + l.id);
    if (!checkbox) continue;
    checkbox.checked = !!state.lights[l.id];

    setLight(l.id, checkbox.checked);

    checkbox.addEventListener("change", () => {
      state.lights[l.id] = checkbox.checked;
      setLight(l.id, checkbox.checked);
      updateSummary(state);
      saveState(state);
    });
  }

  updateSummary(state);

  $("#resetBtn").addEventListener("click", () => {
    const s = defaultState();
    for (const l of CONFIG.lights) {
      const checkbox = $("#light-" + l.id);
      if (checkbox) checkbox.checked = !!s.lights[l.id];
      setLight(l.id, !!s.lights[l.id]);
    }
    updateSummary(s);
    saveState(s);
  });

  // Config dialog
  const dialog = $("#configDialog");
  const dump = $("#configDump");
  $("#viewConfig").addEventListener("click", (e) => {
    e.preventDefault();
    dump.textContent = safeJsonStringify(CONFIG);
    dialog.showModal();
  });

  // apply body dataset for lamp for CSS gag
  document.body.dataset.lamp = state.lights.lamp ? "on" : "off";
}

function main() {
  applyText();
  renderEvidence();
  wireUI();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
