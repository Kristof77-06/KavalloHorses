import { termekekLISTA } from "./termekek.js";

// --- Kép fallback ---
function kepForras(termek) {
  return termek.kep && termek.kep.trim() !== "" ? termek.kep : "img/placeholder.jpg";
}

// --- Termékek megjelenítése (kártyák) ---
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

    const arMegjelenites = termek.ar
      ? `${termek.ar} Ft`
      : termek.arak
      ? Object.values(termek.arak).join(" - ") + " Ft"
      : "";

    kartya.innerHTML = `
      <img src="${kepForras(termek)}" class="card-img-top" alt="${termek.nev}" />
      <div class="card-body d-flex flex-column justify-content-between">
        <h5 class="card-title">${termek.nev}</h5>
        <p class="card-text">${termek.leiras}</p>
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

// --- Eseménydelegálás a gombokra ---
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

// --- Keresés ---
function getKeresoszo() {
  const mezok = Array.from(document.querySelectorAll("#keresoMezo"));
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

// --- Szűrés ---
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

// --- Mobil keresősáv ---
function toggleKeresosav() {
  const sav = document.getElementById("mobilKeresosav");
  if (!sav) return;
  const jelenlegi = sav.style.display;
  sav.style.display = (jelenlegi === "none" || jelenlegi === "") ? "block" : "none";
}

// --- Kosár számláló ---
let kosarDb = 0;
function kosarhozAdas(termekNev, opciok = {}) {
  kosarDb++;
  const kijelzo = document.getElementById("kosarDb");
  if (kijelzo) kijelzo.textContent = `(${kosarDb})`;
  console.log(`Kosárba: ${termekNev}, beállítások:`, opciok);
}
// --- Modál megnyitása (részletes leírás, termékenként eltérő felosztás) ---
function megnyitMegtekintesModal(termek) {
  const modalBody = document.getElementById("modalBody");
  if (!modalBody) return;

  // előző tartalom törlése
  modalBody.innerHTML = "";

  // --- Levendulás zsák ---
  if (termek.nev === "Levendulás zsák") {
    modalBody.innerHTML = `
      <div class="row">
        <!-- Bal oldal -->
        <div class="col-md-8 d-flex flex-column justify-content-between">
          <div>
            <img src="${kepForras(termek)}" alt="${termek.nev}" class="img-fluid mb-3" />
            <h5 class="mb-2">${termek.nev}</h5>
            <p class="mb-2">${termek.reszletesLeiras || termek.leiras}</p>
          </div>
          <p class="fw-bold mt-3" id="termekAr"></p>
        </div>

        <!-- Jobb oldal -->
        <div class="col-md-4 d-flex flex-column justify-content-between">
          <div>
            <div class="mb-3">
              <label for="kiszerelesValaszto" class="form-label fw-bold">Kiszerelés</label>
              <select id="kiszerelesValaszto" class="form-select">
                <option value="25g">25 g</option>
                <option value="35g">35 g</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Mennyiség</label>
              <div class="input-group">
                <button class="btn btn-outline-secondary" type="button" id="minusBtn">−</button>
                <input type="number" id="mennyisegValaszto" class="form-control text-center" value="1" min="1" />
                <button class="btn btn-outline-secondary" type="button" id="plusBtn">+</button>
              </div>
            </div>
          </div>

          <div class="d-grid mt-3">
            <button type="button" class="btn btn-success" id="kosarBtn">Kosárba</button>
          </div>
        </div>
      </div>
    `;

    // --- Eseménykezelők ---
    const kiszerelesSelect = modalBody.querySelector("#kiszerelesValaszto");
    const arElem = modalBody.querySelector("#termekAr");
    const mennyInput = modalBody.querySelector("#mennyisegValaszto");
    const minusBtn = modalBody.querySelector("#minusBtn");
    const plusBtn = modalBody.querySelector("#plusBtn");
    const kosarBtn = modalBody.querySelector("#kosarBtn");

    let aktivKiszereles = kiszerelesSelect.value;

    // Ár frissítése
    function frissitAr() {
      if (termek.arak && termek.arak[aktivKiszereles]) {
        arElem.textContent = `${termek.arak[aktivKiszereles]} Ft`;
      } else {
        arElem.textContent = termek.ar ? `${termek.ar} Ft` : "";
      }
    }
    frissitAr();

    kiszerelesSelect.addEventListener("change", () => {
      aktivKiszereles = kiszerelesSelect.value;
      frissitAr();
    });

    minusBtn.addEventListener("click", () => {
      mennyInput.value = Math.max(1, parseInt(mennyInput.value || "1", 10) - 1);
    });
    plusBtn.addEventListener("click", () => {
      mennyInput.value = Math.max(1, parseInt(mennyInput.value || "1", 10) + 1);
    });

    kosarBtn.addEventListener("click", () => {
      const mennyiseg = parseInt(mennyInput.value || "1", 10);
      const ar = termek.arak ? termek.arak[aktivKiszereles] : termek.ar;
      kosarhozAdas(termek.nev, { kiszereles: aktivKiszereles, mennyiseg, ar });

      const modalElem = document.getElementById("megtekintesModal");
      bootstrap.Modal.getOrCreateInstance(modalElem).hide();
    });
  }

  // --- Karkötő ---
  else if (termek.nev === "Karkötő") {
    modalBody.innerHTML = `
      <img src="${kepForras(termek)}" alt="${termek.nev}" class="img-fluid mb-3" />
      <h5>${termek.nev}</h5>
      <p>${termek.reszletesLeiras || termek.leiras}</p>
      <p class="fw-bold">${termek.ar} Ft</p>
      <div class="mb-3">
        <label for="szinValaszto" class="form-label fw-bold">Szín:</label>
        <select id="szinValaszto" class="form-select">
          <option value="piros">Piros</option>
          <option value="kék">Kék</option>
          <option value="zöld">Zöld</option>
        </select>
      </div>
      <button type="button" class="btn btn-success"
        onclick="kosarhozAdas('${termek.nev}', { szin: document.getElementById('szinValaszto').value })">
        Kosárba
      </button>
    `;
  }

  // --- Csomagok ---
  else if (termek.kategoria === "csomagok") {
    modalBody.innerHTML = `
      <ul class="nav nav-tabs" id="csomagTabok" role="tablist">
        <li class="nav-item">
          <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#leiras">Leírás</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tartalom">Tartalom</button>
        </li>
      </ul>
      <div class="tab-content mt-3">
        <div class="tab-pane fade show active" id="leiras">
          <p>${termek.reszletesLeiras || termek.leiras}</p>
        </div>
        <div class="tab-pane fade" id="tartalom">
          <p>Itt jelenik meg a csomag részletes tartalma.</p>
        </div>
      </div>
      <p class="fw-bold mt-3">${termek.ar} Ft</p>
      <button type="button" class="btn btn-success" onclick="kosarhozAdas('${termek.nev}')">
        Kosárba
      </button>
    `;
  }

  // --- Alapértelmezett ---
  else {
    modalBody.innerHTML = `
      <img src="${kepForras(termek)}" alt="${termek.nev}" class="img-fluid mb-3" />
      <h5>${termek.nev}</h5>
      <p>${termek.reszletesLeiras || termek.leiras}</p>
      <p class="fw-bold">${termek.ar} Ft</p>
      <button type="button" class="btn btn-success" onclick="kosarhozAdas('${termek.nev}')">
        Kosárba
      </button>
    `;
  }

  // --- Modál megnyitása ---
  const modalElem = document.getElementById("megtekintesModal");
  if (!modalElem) return;
  const modal = new bootstrap.Modal(modalElem);
  modal.show();
}

// --- Inicializálás ---
function init() {
  megjelenitTermekek(termekekLISTA);
  initSzures();
  initMegtekintesEsemeny();
}

// Globális elérhetőség
window.keresesInditasa = keresesInditasa;
window.toggleKeresosav = toggleKeresosav;
window.kosarhozAdas = kosarhozAdas;

// Indítás
init();