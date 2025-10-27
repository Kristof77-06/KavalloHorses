function mutatOldalt(id) {
  document.querySelectorAll(".termek-oldal").forEach((el) => {
    el.classList.remove("active");
  });
  const celElem = document.getElementById(id);
  if (celElem) {
    celElem.classList.add("active");
  }
}

function oldalBetoltes() {
  const urlParams = new URLSearchParams(window.location.search);
  const tipus = urlParams.get("tipus") || urlParams.get("id");

  const engedelyezettTipusok = ["karkoto", "bokalanc", "kantardisz", "taskadisz"];

  if (tipus && engedelyezettTipusok.includes(tipus)) {
    mutatOldalt(tipus);
  } else {
    document.body.innerHTML = "<h2 class='text-center mt-5'>A megadott terméktípus nem található.</h2>";
  }
}

window.addEventListener("DOMContentLoaded", oldalBetoltes);

function szamoljArat() {
  const egysegGyongyAr = 100;
  const egyBetuHely = 1.5;

  const meret = parseFloat(document.getElementById("meretK").value);
  const nev = document.getElementById("gravirK").value.trim();
  const betukSzama = nev.length;
  const teljesHossz = meret + 1;

  const betuHely = betukSzama * egyBetuHely;
  const gyongyHely = teljesHossz - betuHely;
  const gyongyDb = Math.floor(gyongyHely);

  const gyongyAr = gyongyDb * egysegGyongyAr;
  const betuAr = betukSzama * egysegGyongyAr;
  const vegosszeg = gyongyAr + betuAr;

  const szin1 = document.getElementById("szin1K").value;
  const szin2 = document.getElementById("szin2K").value;
  let elsoSzindb = gyongyDb;
  let masodikSzindb = 0;

  if (szin2) {
    elsoSzindb = Math.ceil(gyongyDb * 2 / 3);
    masodikSzindb = gyongyDb - elsoSzindb;
  }

  document.getElementById("eredmenyK").innerHTML = `
    Teljes hossz: ${teljesHossz.toFixed(1)} cm<br>
    Betűk száma: ${betukSzama}<br>
    Gyöngyök száma: ${gyongyDb} db<br>
    Színeloszlás: ${elsoSzindb} db ${szin1}${szin2 ? `, ${masodikSzindb} db ${szin2}` : ""}<br>
    Ár: ${vegosszeg.toLocaleString()} Ft
  `;
}