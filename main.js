import { termekekLISTA } from "./termekek.js";

/* ============================================================
   Kép forrás fallback
   ============================================================ */
function kepForras(termek) {
  const src = (termek.kep || "").trim();
  return src !== "" ? src : "./kepek/placeholder.png";
}

/* ============================================================
   Termékek megjelenítése (kártyák)
   ============================================================ */
function megjelenitTermekek(lista) {
  const kontener = document.getElementById("termekek");
  if (!kontener) return;

  kontener.innerHTML = "";

  const sor = document.createElement("div");
  sor.className = "row";

  lista.forEach((termek) => {
    const oszlop = document.createElement("div");
    oszlop.className = "col-md-4 mb-4";

    const kartya = document.createElement("div");
    kartya.className = "card h-100";

    const arMegjelenites = (() => {
      if (termek.ar && String(termek.ar).trim() !== "") {
        return `${termek.ar} Ft`;
      }
      if (termek.arak && typeof termek.arak === "object") {
        const ertekek = Object.values(termek.arak);
        if (ertekek.length) {
          const min = Math.min(...ertekek);
          const max = Math.max(...ertekek);
          return min === max ? `${min} Ft` : `${min} - ${max} Ft`;
        }
      }
      return "";
    })();

    kartya.innerHTML = `
      <img src="${kepForras(termek)}" class="card-img-top" alt="${termek.nev}" />
      <div class="card-body d-flex flex-column justify-content-between">
        <h5 class="card-title">${termek.nev}</h5>
        <p class="card-text">${termek.leiras || ""}</p>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <p class="fw-bold mb-0">${arMegjelenites}</p>
          <button type="button" class="btn btn-dark btn-sm btn-megtekintes" data-nev="${termek.nev}">
            Megtekintés
          </button>
        </div>
      </div>
    `;

    oszlop.appendChild(kartya);
    sor.appendChild(oszlop);
  });

  kontener.appendChild(sor);
}

/* ============================================================
   Eseménydelegálás a "Megtekintés" gombokra
   ============================================================ */
function initMegtekintesEsemeny() {
  const kontener = document.getElementById("termekek");
  if (!kontener) return;

  kontener.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-megtekintes");
    if (!btn) return;
    const nev = btn.getAttribute("data-nev");
    const termek = termekekLISTA.find((t) => t.nev === nev);
    if (termek) megnyitMegtekintesModal(termek);
  });
}

/* ============================================================
   Keresés (desktop + mobil)
   ============================================================ */
function getKeresoszo() {
  const mezok = [
    document.getElementById("keresoMezo"),
    document.getElementById("keresoMezoMobil"),
  ].filter(Boolean);

  for (const mezo of mezok) {
    const v = (mezo.value || "").toLowerCase().trim();
    if (v) return v;
  }
  return "";
}

function keresesInditasa() {
  const keresoszo = getKeresoszo();
  if (!keresoszo) {
    megjelenitTermekek(termekekLISTA);
    return;
  }
  const talalatok = termekekLISTA.filter((t) =>
    t.nev.toLowerCase().includes(keresoszo) ||
    t.leiras.toLowerCase().includes(keresoszo) ||
    (t.reszletesLeiras && t.reszletesLeiras.toLowerCase().includes(keresoszo))
  );
  megjelenitTermekek(talalatok);
}
/* ============================================================
   Szűrés (kategóriák szerint)
   ============================================================ */
function initSzures() {
  const select = document.getElementById("kategoriak");
  if (!select) return;

  select.addEventListener("change", (e) => {
    const kategoria = e.target.value;
    if (kategoria === "osszes") {
      megjelenitTermekek(termekekLISTA);
    } else {
      const szurt = termekekLISTA.filter((t) => t.kategoria === kategoria);
      megjelenitTermekek(szurt);
    }
  });
}

/* ============================================================
   Kosár számláló
   ============================================================ */
let kosarDb = 0;

function frissitKosarDb() {
  const kijelzo = document.getElementById("kosarDb");
  if (kijelzo) kijelzo.textContent = `(${kosarDb})`;
}

function kosarhozAdas(termekNev, opciok = {}) {
  kosarDb++;
  frissitKosarDb();
  console.log(`Kosárba: ${termekNev}`, opciok);
}

/* ============================================================
   Megtekintés modal tartalom és megnyitás
   ============================================================ */
function megnyitMegtekintesModal(termek) {
  const modalBody = document.getElementById("modalBody");
  if (!modalBody) return;

  modalBody.innerHTML = "";

  const arMegjelenites = (() => {
    if (termek.ar && String(termek.ar).trim() !== "") {
      return `${termek.ar} Ft`;
    }
    if (termek.arak && typeof termek.arak === "object") {
      const ertekek = Object.values(termek.arak);
      if (ertekek.length) {
        const min = Math.min(...ertekek);
        const max = Math.max(...ertekek);
        return min === max ? `${min} Ft` : `${min} - ${max} Ft`;
      }
    }
    return "";
  })();

  modalBody.innerHTML = `
    <img src="${kepForras(termek)}" alt="${termek.nev}" class="img-fluid mb-3" />
    <h5>${termek.nev}</h5>
    <p>${termek.reszletesLeiras || termek.leiras || ""}</p>
    <p class="fw-bold">${arMegjelenites}</p>
    <button type="button" class="btn btn-success" id="kosarBtn">Kosárba</button>
  `;

  const kosarBtn = modalBody.querySelector("#kosarBtn");
  kosarBtn.addEventListener("click", () => {
    kosarhozAdas(termek.nev);
    bootstrap.Modal.getOrCreateInstance(document.getElementById("megtekintesModal")).hide();
  });

  const modalElem = document.getElementById("megtekintesModal");
  if (!modalElem) return;
  const modal = new bootstrap.Modal(modalElem);
  modal.show();
}

/* ============================================================
   Menü és mobil kereső nyitása/zárása
   ============================================================ */
function initMenuToggle() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const menuPanel = document.getElementById("menuPanel");

  if (!hamburgerBtn || !menuPanel) return;

  hamburgerBtn.addEventListener("click", () => {
    const isOpen = menuPanel.classList.toggle("open");
    menuPanel.setAttribute("aria-hidden", !isOpen);
    hamburgerBtn.setAttribute("aria-expanded", isOpen);
  });
}

function initMobilKeresesToggle() {
  const mobilBtn = document.getElementById("mobilKeresoBtn");
  const keresosav = document.getElementById("mobilKeresosav");

  if (!mobilBtn || !keresosav) return;

  mobilBtn.addEventListener("click", () => {
    const isOpen = keresosav.classList.toggle("open");
    keresosav.setAttribute("aria-hidden", !isOpen);
    mobilBtn.setAttribute("aria-expanded", isOpen);
  });

  const keresInditoBtn = document.getElementById("mobilKeresesInditoBtn");
  if (keresInditoBtn) {
    keresInditoBtn.addEventListener("click", keresesInditasa);
  }
}

/* ============================================================
   Inicializálás
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  megjelenitTermekek(termekekLISTA);
  initMegtekintesEsemeny();
  initSzures();
  frissitKosarDb();
  initMenuToggle();
  initMobilKeresesToggle();

  const keresoMezo = document.getElementById("keresoMezo");
  const keresoMezoMobil = document.getElementById("keresoMezoMobil");
  if (keresoMezo) keresoMezo.addEventListener("input", keresesInditasa);
  if (keresoMezoMobil) keresoMezoMobil.addEventListener("input", keresesInditasa);

  window.keresesInditasa = keresesInditasa;
});