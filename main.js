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
   Robosztusabb számparzolással (szóközök, egyéb karakterek kezelése)
   ============================================================ */
function arSzoveg(termek) {
  // Ha egy darab ár van (szám vagy szöveg), jelenítsük meg "Ft"-tal
  if (termek.ar && String(termek.ar).trim() !== "") {
    return `${termek.ar} Ft`;
  }

  // Ha arak objektum van (pl. több méret), jelenítsük meg min-max tartományként
  if (termek.arak && typeof termek.arak === "object") {
    const ertekek = Object.values(termek.arak)
      .map((v) => String(v || ""))
      .map((v) => v.replace(/\s+/g, ""))            // eltávolítjuk a szóközöket (pl. "1 400")
      .map((v) => v.replace(/[^0-9.-]/g, ""))       // csak számjegyek, pont, mínusz marad
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v));

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
   Biztonságos DOM-alapú kártyaépítés (XSS-ellenesebb, performánsabb)
   ============================================================ */
function kartyaElement(termek) {
  const card = document.createElement("div");
  card.className = "card h-100";

  const img = document.createElement("img");
  img.className = "card-img-top";
  img.src = kepForras(termek);
  img.alt = termek.nev || "";

  const body = document.createElement("div");
  body.className = "card-body d-flex flex-column justify-content-between";

  const title = document.createElement("h5");
  title.className = "card-title";
  title.textContent = termek.nev || "";

  const p = document.createElement("p");
  p.className = "card-text";
  p.textContent = termek.leiras || "";

  const bottom = document.createElement("div");
  bottom.className = "d-flex justify-content-between align-items-center mt-auto";

  const price = document.createElement("p");
  price.className = "fw-bold mb-0";
  price.textContent = arSzoveg(termek);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-dark btn-sm btn-megtekintes";
  btn.dataset.nev = termek.nev || "";
  btn.textContent = "Megtekintés";

  bottom.appendChild(price);
  bottom.appendChild(btn);

  body.appendChild(title);
  body.appendChild(p);
  body.appendChild(bottom);

  card.appendChild(img);
  card.appendChild(body);

  return card;
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

    oszlop.appendChild(kartyaElement(termek));

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

  // Modal tartalom összeállítása (biztonságosabb innerHTML használat, mert kontrollált tartalom)
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

  // Kosár gomb esemény — once opcióval, hogy többször ne regisztrálódjon
  const kosarBtn = modalBody.querySelector("#kosarBtn");
  if (kosarBtn) {
    kosarBtn.addEventListener("click", () => {
      kosarhozAdas(nev);
      const modalElem = document.getElementById("megtekintesModal");
      if (modalElem && window.bootstrap && typeof window.bootstrap.Modal !== "undefined") {
        window.bootstrap.Modal.getOrCreateInstance(modalElem).hide();
      }
    }, { once: true });
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
   Menü és mobil kereső nyitása/zárása (robosztusabb)
   - initMenuToggle: a meglévő #mynavbar-t használja (Bootstrap collapse kompatibilis)
   - initMobilKeresesToggle: eltávolítja az esetleges inline onclick attribútumot, majd eseménykezelőt ad
   ============================================================ */
function initMenuToggle() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const menuPanel = document.getElementById("mynavbar"); // a HTML-ben ez létezik

  if (!hamburgerBtn || !menuPanel) return;

  hamburgerBtn.addEventListener("click", () => {
    // Ha Bootstrap Collapse elérhető, használjuk azt (jobb animáció és állapotkezelés)
    if (window.bootstrap && typeof window.bootstrap.Collapse !== "undefined") {
      const instance = window.bootstrap.Collapse.getInstance(menuPanel) || new window.bootstrap.Collapse(menuPanel, { toggle: false });
      if (menuPanel.classList.contains("show")) {
        instance.hide();
      } else {
        instance.show();
      }
      // aria attribútumok a bootstrap által is kezelve, de biztosítjuk
      const isOpen = menuPanel.classList.contains("show");
      hamburgerBtn.setAttribute("aria-expanded", isOpen.toString());
      menuPanel.setAttribute("aria-hidden", (!isOpen).toString());
      return;
    }

    // Ha nincs bootstrap collapse (fallback)
    const isOpen = menuPanel.classList.toggle("show");
    menuPanel.setAttribute("aria-hidden", (!isOpen).toString());
    hamburgerBtn.setAttribute("aria-expanded", isOpen.toString());
  });
}

function initMobilKeresesToggle() {
  const mobilBtn = document.getElementById("mobilKeresoBtn");
  const keresosav = document.getElementById("mobilKeresosav");

  if (!mobilBtn || !keresosav) return;

  // Ha van inline onclick attribútum, távolítsuk el, hogy ne legyen duplikált viselkedés
  if (mobilBtn.hasAttribute("onclick")) {
    mobilBtn.removeAttribute("onclick");
  }

  mobilBtn.addEventListener("click", () => {
    const isOpen = keresosav.classList.toggle("open");
    keresosav.setAttribute("aria-hidden", (!isOpen).toString());
    mobilBtn.setAttribute("aria-expanded", isOpen.toString());

    // Ha nincs CSS .open szabály, biztosítsuk a megjelenítést inline stílussal
    if (isOpen) {
      keresosav.style.display = "block";
    } else {
      keresosav.style.display = "none";
    }
  });

  const keresInditoBtn = document.getElementById("mobilKeresesInditoBtn");
  if (keresInditoBtn) {
    keresInditoBtn.addEventListener("click", keresesInditasa);
  }
}

/* ============================================================
   Biztosítjuk, hogy a modal a <body> közvetlen gyereke legyen
   (stacking context problémák elkerülésére)
   ============================================================ */
function ensureModalInBody() {
  const modal = document.getElementById("megtekintesModal");
  if (modal && modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }
}

/* ============================================================
   Inicializálás
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Biztosítsuk, hogy a modal a body-ban legyen (korai)
  ensureModalInBody();

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

  // Globális hívhatóság a form onsubmit-hez (ha még szükséges)
  window.keresesInditasa = keresesInditasa;
});