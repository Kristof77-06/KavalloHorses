import { megjelenites, kartyakOsszeAllit } from "./fuggvenyek.js";
import { termekekLISTA } from "./termekek.js";

// Termékkártyák összeállítása és megjelenítése
$(function () {
  const txt = kartyakOsszeAllit(termekekLISTA);
  megjelenites(txt, $("article"));
});

// Mobilos kereső sáv megjelenítése / elrejtése animációval
function toggleKeresosav() {
  const sav = document.getElementById("mobilKeresosav");

  if (sav.style.maxHeight) {
    sav.style.maxHeight = null;
    sav.style.opacity = 0;
  } else {
    sav.style.maxHeight = sav.scrollHeight + "px";
    sav.style.opacity = 1;
  }
}

// Keresés indítása (alapértelmezett működés: csak figyelmeztetés)
function keresesInditasa() {
  const mezo = document.getElementById("keresoMezo");

  if (!mezo) {
    alert("Nem található keresőmező!");
    return;
  }

  const keresettSzoveg = mezo.value.trim();

  if (keresettSzoveg === "") {
    alert("Kérlek, írj be valamit a kereséshez!");
  } else {
    alert("Keresett kifejezés: " + keresettSzoveg);

    // Itt később szűrheted a termékeket:
    // const szurtLista = termekekLISTA.filter(t => t.nev.includes(keresettSzoveg));
    // const txt = kartyakOsszeAllit(szurtLista);
    // megjelenites(txt, $("article"));
  }
}