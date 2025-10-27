export function megjelenites(txt, element) {
  element.html(txt);
}

export function kartyakOsszeAllit(lista) {
  let txt = `<div class="row g-3">`; // g-3 = spacing a kártyák között
  lista.forEach((element, i) => {
    txt += `
      <div class="col-lg-4 col-sm-8 col-sm-12">
        <div class="card h-100 shadow">
          <div class="card-header text-center">
            <h5 class="card-title">${element.nev}</h5>
          </div>
          <img class="card-img-top" src="${element.kep}" alt="kép" />
          <div class="card-body">
            <p class="card-text">${element.leiras}</p>
          </div>
          <div class="card-footer d-flex justify-content-between">
            <span class="fw-bold">${element.ar} Ft</span>
            <a href="termekbelso.html?id=${element.id}" class="btn btn-dark btn-sm">Megtekintés</a>
          </div>
        </div>
      </div>`;
  });
  txt += `</div>`;
  return txt;
}