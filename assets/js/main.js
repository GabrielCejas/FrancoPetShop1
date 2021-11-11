// variables
 let chamber = document.querySelector("#farmacia") ? "Medicamento" : "Juguete";
let articulos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || []
let btnAgregar = [];
let totalAcumulado = document.querySelector('#total-field')
let largoCarrito = document.querySelectorAll('#largoCarrito')


if(carrito.length >= 1){
  renderTabla()
  borrarProducto()
}

// Traer los productos de la api
fetch("https://apipetshop.herokuapp.com/api/articulos")
  .then((res) => res.json())
  .then((data) => {
    articulos = data.response.filter((e) => e.tipo === chamber);
    ejecucion(articulos);
  });

// Funciones
function ejecucion(articulos) {
  if(document.querySelector('#farmacia') || document.querySelector('#juguetes') ){
    renderArticulos(articulos);
    agregarCarrito();
  }
  renderTabla();
  borrarProducto();
  btnCarrito();
  localStorage.setItem('carrito',JSON.stringify(carrito))
}

function renderArticulos(articulos) {
  articulos.forEach((item) => {
    let { _id, nombre, descripcion, precio, imagen, stock } = item;

    let contenedor = document.querySelector("#contenedor");
    let div = document.createElement("div");
    div.classList = "col";
    div.innerHTML = `
                        <div class="card card-h">
                          <img class="card-img-top w-75 d-block align-self-center" src=${imagen} height>
                          <div class="card card-body border-0 justify-content-between">
                            <h5 class="card-title text-center">${nombre}</h5>
                            <p class="card-text">${descripcion}</p>
                            <p class="card-text">$${precio}</p>
                            <p class="card-text">Unidades disponibles : ${stock}</p>
                            ${
                              stock <= 5
                                ? "<p class='card-text fw-bold'>🔴ULTIMAS UNIDADES!🔴</p>"
                                : ""
                            }
                            <button id=${_id} class="btn btn-danger agregar-carrito" type="button">Agregar al carrito</button>
                          </div>
                        </div>  
   `;
    contenedor.appendChild(div);
  });
}

function agregarCarrito() {
  btnAgregar = document.querySelectorAll(".agregar-carrito");
  btnAgregar.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      buscarEnArray(e.target.id);
      renderTabla();
      borrarProducto()
      localStorage.setItem('carrito',JSON.stringify(carrito))
    });
  });
}

function borrarCarrito(){
  btnBorrar = document.querySelectorAll(".borrar-carrito");
  btnBorrar.forEach(boton => {
    boton.addEventListener("click", e=>{
      buscarEnArrayBorrar(e.target.id);
      renderTabla();
      borrarCarrito();
    })
  })
}

function buscarEnArray(id) {
  let articuloAux = articulos.find((item) => item._id === id);
  let item = carrito.find(item=>item._id === id)
  let itemEnArticulos = articulos.find(item=>item._id === id)
  if (item) {
    item.cantidad < itemEnArticulos.stock ?  (item.cantidad++ , crearAlertaCarrito(true)) :  crearAlertaCarrito(false)
  } else {
    articuloAux.cantidad = 1;
    carrito.push(articuloAux);
    crearAlertaCarrito(true);
  }
}

function renderTabla() {
  const carritoModal = document.querySelector("#modal-tabla");
  let fragment = document.createDocumentFragment();
  let total = 0;
  if (carrito.length < 1) {
    carritoModal.innerHTML = `<tr><td colspan="5"><h5 class="text-center">No hay productos en tu carrito</h5></td></tr>`;
    totalAcumulado.textContent = ``;
  } else {
    carritoModal.innerHTML = "";
    carrito.forEach((e) => {
      let { _id, nombre, precio, imagen, tipo,cantidad} = e;
      let tr = document.createElement("tr");
      tr.innerHTML = `  
      <th class="border-0" scope="row">
      <div class="p-2">
        <img
          class="img-fluid rounded shadow-sm me-1"
          src="${imagen}"
          alt="product0"
          width="70"
        />
        <div
          class="ml-3 d-inline-block align-middle"
        >
          <h5 class="mb-0">
            ${nombre}
          </h5>
          <span
            class="
              text-muted
              font-weight-normal font-italic
              d-block
            "
            >Categoria: ${tipo}</span
          >
        </div>
      </div>
    </th>
    <td class="border-0 align-middle">
      <strong>$${precio}</strong>
    </td>
    <td class="border-0 align-middle">
      <strong>${cantidad}</strong>
    </td>
    <td class="border-0 align-middle">
    <strong>$${precio * cantidad}</strong>
  </td>
    <td class="border-0 align-middle">
      <button class="btn btn-danger borrar-carrito" id="${_id}" >X</button>
    </td>
      `;
      fragment.appendChild(tr);
      
      return total += e.precio * e.cantidad
    });
    carritoModal.appendChild(fragment);
    totalAcumulado.textContent = `${total}`;
  }
  largoCarrito.forEach(badge => badge.textContent = carrito.length);

  localStorage.setItem('carrito',JSON.stringify(carrito))
  
  let btnPago = document.querySelector("#btn-pago");
  if(carrito.length == 0){
    btnPago.classList.add('disabled');
  } else {
    btnPago.classList.remove('disabled');
  }
}



function crearAlertaCarrito(booleano) {
  let alerta = document.querySelector("#alerta-carrito");
  alerta.classList.replace("d-none", "fixed-bottom");

  if(booleano){
    alerta.textContent = "Agregado al carrito"
    alerta.classList.replace("alert-warning", "alert-success");
  }else{
    alerta.textContent = "Las unidades disponibles ya estan en el carrito de compras"
    alerta.classList.replace("alert-success", "alert-warning");
  }
  setTimeout(() => {
    alerta.classList.replace("fixed-bottom", "d-none");
  }, 1500);
  btnCarrito();
}

function btnCarrito(){
  btnBorrarTodo = document.querySelector("#borrar-todo")
  btnBorrarTodo.addEventListener("click", ()=>{
    carrito.splice(0,carrito.length)
    renderTabla()
    totalAcumulado.textContent = "";
  })
}

function pagarTodo(){
  carrito.splice(0,carrito.length)
  renderTabla()
  totalAcumulado.textContent = "";
}
btnPago = document.querySelector("#btn-pago");
btnPago.addEventListener("click", pagarTodo) 

function buscarEnArrayBorrar(id){
  carrito.splice(carrito.indexOf(  carrito.find( item => item._id === id) )  , 1)
}

function borrarProducto(){
  
  btnBorrar = document.querySelectorAll(".borrar-carrito");
  btnBorrar.forEach(boton => {
    boton.addEventListener("click", e=>{
      buscarEnArrayBorrar(e.target.id);
      renderTabla();
      borrarProducto()
    })
  })
  
}