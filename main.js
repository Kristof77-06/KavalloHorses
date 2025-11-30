import { termekekLISTA } from "./termekek.js";

/* ============================================================
   Kép forrás fallback
   ============================================================ */
function kepForras(termek) {
  const src = (termek.kep || "").trim();
  return src !== "" ? src : "./kepek/placeholder.png";
}

/* ============================================================
   Ár megjelenítés (egyérték vagy tartomány az arak objektumból)
   ============================================================ */
function arSzoveg(termek) {
  // Ha egy darab ár van (szám vagy szöveg), jelenítsük meg "Ft"-tal
  if (termek.ar && String(termek.ar).trim() !== "") {
    return `${termek.ar} Ft`;
  }
  // Ha arak objektum van (pl. több méret), jelenítsük meg min-max tartományként
  if (termek.arak && typeof termek.arak === "object") {
    const ertekek = Object.values(termek.arak).map(v => Number(v)).filter(v => !Number.isNaN(v));
    if (ertekek.length) {
      const min = Math.min(...ertekek);
      const max = Math.max(...ertekek);
      return min === max ? `${min} Ft` : `${min} - ${max} Ft`;
    }
  }
  // Ha nincs ár, térjünk vissza üres szöveggel
  return "";
}

/* ============================================================
   Termék kártya HTML (string) — renderelő segédfüggvény
   ============================================================ */
function kartyaHTML(termek) {
  const kep = kepForras(termek);
  const arMegjelenites = arSzoveg(termek);
  const leiras = termek.leiras || "";
  const nev = termek.nev || "";
  return `
    <div class="card h-100">
      <img src="${kep}" class="card-img-top" alt="${nev}" />
      <div class="card-body d-flex flex-column justify-content-between">
        <h5 class="card-title">${nev}</h5>
        <p class="card-text">${leiras}</p>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <p class="fw-bold mb-0">${arMegjelenites}</p>
          <button type="button" class="btn btn-dark btn-sm btn-megtekintes" data-nev="${nev}">
            Megtekintés
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   Termékek megjelenítése (kártyák) — DOM építés
   ============================================================ */
function megjelenitTermekek(lista) {
  const kontener = document.getElementById("termekek");
  if (!kontener) return;

  // Konténer kiürítése
  kontener.innerHTML = "";

  // Sor (Bootstrap grid) létrehozása
  const sor = document.createElement("div");
  sor.className = "row";

  // Minden termékhez oszlop + kártya
  lista.forEach((termek) => {
    const oszlop = document.createElement("div");
    oszlop.className = "col-md-4 mb-4";

    oszlop.innerHTML = kartyaHTML(termek);

    sor.appendChild(oszlop);
  });

  // Sor hozzáadása a konténerhez
  kontener.appendChild(sor);

  // Üres lista esetén informáló üzenet
  if (!lista.length) {
    const uzenet = document.createElement("div");
    uzenet.className = "alert alert-info mt-3";
    uzenet.textContent = "Jelenleg nincs megjeleníthető termék.";
    kontener.appendChild(uzenet);
  }
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
    const termek = termekekLISTA.find((t) => (t.nev || "") === (nev || ""));
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

  // Ha nincs keresőszó, jelenítsük meg az alaplistát
  if (!keresoszo) {
    megjelenitTermekek(termekekLISTA);
    return;
  }

  // Keresés névben, rövid és részletes leírásban (null/undefined védelemmel)
  const talalatok = termekekLISTA.filter((t) =>
    (t.nev || "").toLowerCase().includes(keresoszo) ||
    (t.leiras || "").toLowerCase().includes(keresoszo) ||
    ((t.reszletesLeiras || "").toLowerCase().includes(keresoszo))
  );

  megjelenitTermekek(talalatok);
}

/* ============================================================
   Kategória normalizálás (ékezet/szóköz nélküli egységes forma)
   ============================================================ */
function normKat(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // ékezetek eltávolítása
    .replace(/\s+/g, ""); // szóközök eltávolítása
}

/* ============================================================
   Szűrés (kategóriák szerint)
   ============================================================ */
function initSzures() {
  const select = document.getElementById("kategoriak");
  if (!select) return;

  select.addEventListener("change", (e) => {
    const kivalasztott = normKat(e.target.value);

    // "osszes" eset — minden termék
    if (kivalasztott === "osszes") {
      megjelenitTermekek(termekekLISTA);
      return;
    }

    // Egyéb kategória eset — adatok normalizált összevetése
    const szurt = termekekLISTA.filter((t) => normKat(t.kategoria) === kivalasztott);
    megjelenitTermekek(szurt);
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

  // Modal tartalom összeállítása
  const kep = kepForras(termek);
  const arMegjelenites = arSzoveg(termek);
  const nev = termek.nev || "";
  const reszletes = (termek.reszletesLeiras || termek.leiras || "");

  modalBody.innerHTML = `
    <img src="${kep}" alt="${nev}" class="img-fluid mb-3" />
    <h5>${nev}</h5>
    <p>${reszletes}</p>
    <p class="fw-bold">${arMegjelenites}</p>
    <button type="button" class="btn btn-success" id="kosarBtn">Kosárba</button>
  `;

  // Kosár gomb esemény
  const kosarBtn = modalBody.querySelector("#kosarBtn");
  if (kosarBtn) {
    kosarBtn.addEventListener("click", () => {
      kosarhozAdas(nev);
      const modalElem = document.getElementById("megtekintesModal");
      if (modalElem && window.bootstrap && typeof window.bootstrap.Modal !== "undefined") {
        window.bootstrap.Modal.getOrCreateInstance(modalElem).hide();
      }
    });
  }

  // Modal megnyitása
  const modalElem = document.getElementById("megtekintesModal");
  if (!modalElem) return;
  if (window.bootstrap && typeof window.bootstrap.Modal !== "undefined") {
    const modal = new window.bootstrap.Modal(modalElem);
    modal.show();
  }
}

/* ============================================================
   Menü és mobil kereső nyitása/zárása (CSS osztályokkal)
   ============================================================ */
function initMenuToggle() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const menuPanel = document.getElementById("menuPanel");

  if (!hamburgerBtn || !menuPanel) return;

  hamburgerBtn.addEventListener("click", () => {
    const isOpen = menuPanel.classList.toggle("open");
    menuPanel.setAttribute("aria-hidden", (!isOpen).toString());
    hamburgerBtn.setAttribute("aria-expanded", isOpen.toString());
  });
}

function initMobilKeresesToggle() {
  const mobilBtn = document.getElementById("mobilKeresoBtn");
  const keresosav = document.getElementById("mobilKeresosav");

  if (!mobilBtn || !keresosav) return;

  mobilBtn.addEventListener("click", () => {
    const isOpen = keresosav.classList.toggle("open");
    keresosav.setAttribute("aria-hidden", (!isOpen).toString());
    mobilBtn.setAttribute("aria-expanded", isOpen.toString());
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
  // Alap megjelenítés: teljes lista
  megjelenitTermekek(termekekLISTA);

  // Események bekötése
  initMegtekintesEsemeny();
  initSzures();
  initMenuToggle();
  initMobilKeresesToggle();

  // Kosár számláló inicializálás
  frissitKosarDb();

  // Kereső mezők eseményei (desktop + mobil)
  const keresoMezo = document.getElementById("keresoMezo");
  const keresoMezoMobil = document.getElementById("keresoMezoMobil");
  if (keresoMezo) keresoMezo.addEventListener("input", keresesInditasa);
  if (keresoMezoMobil) keresoMezoMobil.addEventListener("input", keresesInditasa);

  // Globális hívhatóság a form onsubmit-hez
  window.keresesInditasa = keresesInditasa;
});