import { Planeta } from "./planeta.js"
import { leer, escribir, limpiar, jsonToObject, objectToJson } from "./local-storage-async.js";
import { mostrarSpinner, ocultarSpinner } from "./spinner.js";

const KEY_STORAGE = "planetas";
let items = []; // array vacio
const formulario = document.getElementById("form-item");
const btnBorrar = document.getElementById("btnEliminar");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");
const Modal = document.getElementById("btnModal");
const overlay = document.createElement('div');
overlay.classList.add('modal-overlay');

document.addEventListener("DOMContentLoaded", onInit); // importante no poner parentesis, es un callback
document.addEventListener("click", handlerClick)
// btnCancelar.addEventListener("click", actualizarFormulario);
btnCancelar.addEventListener("click", cerrarModal);
Modal.addEventListener("click", mostrarModal);
overlay.addEventListener("click", cerrarModal);

btnBorrar.addEventListener("click", botonEliminar);



function onInit() {
  loadItems();
  // handlerClick();
  escuchandoFormulario();
  escuchandoBtnDeleteAll();
  setupFilterControls();
  setupColumnControls();
  obtenerAño();
  // botonEliminar();
}


function handlerClick(e) {
  if(e.target.matches('td')){
    let idMathc = e.target.parentNode.firstChild;

    const item = items.filter((dato) => dato.id == idMathc.firstChild.textContent)[0];
    console.log(item.id)

    cargarDatos(formulario, item);
    modificacionBotones(true);
    mostrarModal();
  } 
  else if(!e.target.matches('input') && !e.target.matches('select') && !e.target.matches('textarea') && !e.target.matches('button') )
  {
    modificacionBotones(false);
    actualizarFormulario();
  }
}

function setupFilterControls() {
  const filterType = document.getElementById("filtarTipo");
  console.log(filterType.value)
  filterType.addEventListener("change", handleFilter);
}
function handleFilter()
{
  const filtradoPorTipo = document.getElementById("filtarTipo").value;
  let filtrado = items;

  if(filtradoPorTipo){
    filtrado = items.filter(item => item.tipo === filtradoPorTipo);
  }

  rellenarTabla(filtrado);
}


function modificacionBotones(habilitado=false){
  if(habilitado){
    btnBorrar.setAttribute("class", "btn btn-eliminar activado")
  }else{
    btnBorrar.setAttribute("class", "btn btn-eliminar desactivado")
  }
  
}
async function botonEliminar(e){

  
  const idEliminar = e.target.dataset.id || formulario.id.value;

  if (idEliminar && confirm("Desea eliminar el item seleccionado?")) {
    cerrarModal();
    mostrarSpinner();
    let itemsFiltrado = items.filter((dato) => dato.id != idEliminar);
    items = itemsFiltrado;
    const str = objectToJson(items);
    await escribir(KEY_STORAGE, str);
    ocultarSpinner();
    actualizarFormulario();
    rellenarTabla();
  }
}





function cargarDatos(formCarga, datos){
  formCarga.id.value = datos.id;
  formCarga.nombre.value = datos.nombre;
  formCarga.tamaño.value = parseInt(datos.tamaño);
  formCarga.masa.value = datos.masa;
  formCarga.distancia.value = parseInt(datos.distancia);
  formCarga.vida.checked = datos.vida === "si";
  formCarga.anillo.checked = datos.anillo === "si";

  formCarga.vida.value = datos.vida;
  formCarga.anillo.value = datos.anillo;
  formCarga.atmosfera.value = datos.atmosfera;

  const tipoSelect = formCarga.tipo;
  for (let i = 0; i < tipoSelect.options.length; i++) {
    if (tipoSelect.options[i].value === datos.tipo) {
      tipoSelect.selectedIndex = i;
      break;
    }
  }
}

async function loadItems() {
  mostrarSpinner();
  let str = await leer(KEY_STORAGE);
  ocultarSpinner();

  const objetos = jsonToObject(str) || [];
  
  objetos.forEach(obj => {
    const model = new Planeta(
        obj.id,
        obj.nombre,
        obj.tamaño,
        obj.masa,
        obj.tipo,
        obj.distancia,
        obj.vida,
        obj.anillo,
        obj.atmosfera
    );
    items.push(model);
  });

  rellenarTabla();
}


function setupColumnControls() {
  const columnControls = document.querySelectorAll('.column-controls input[type="checkbox"]');
  columnControls.forEach(control => {
    control.addEventListener("change", handleColumnVisibilityChange);
  });
}

function handleColumnVisibilityChange() {
  const columnControls = document.querySelectorAll('.column-controls input[type="checkbox"]');
  columnControls.forEach(control => {
    const column = control.dataset.column;
    const isChecked = control.checked;
    const columnElements = document.querySelectorAll(`td:nth-child(${getColumnIndex(column) + 1}), th:nth-child(${getColumnIndex(column) + 1})`);

    columnElements.forEach(el => {
      el.style.display = isChecked ? "" : "none";
    });
  });
}

function getColumnIndex(columnName) {
  const columns = ["nombre", "tamaño", "masa", "tipo", "distancia", "vida", "anillo", "atmosfera", "acciones"];
  return columns.indexOf(columnName);
}

function rellenarTabla(filteredItems = items) {
  const celdas = ["id", "nombre", "tamaño", "masa", "tipo", "distancia", "vida", "anillo", "atmosfera", "acciones"];
  const tbody = document.querySelector("tbody");

  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  filteredItems.forEach((item) => {
    let nuevaFila = document.createElement("tr");
    celdas.forEach((celda) => {
      let nuevaCelda = document.createElement("td");
      if (celda === "id") {
        nuevaCelda.style.display = "none";
      }
      if (celda === "acciones") {
        let btnModificar = document.createElement("button");
        btnModificar.textContent = "Modificar";
        btnModificar.setAttribute("class", "btn btn-modificar-tabla")
        btnModificar.addEventListener("click", () => {
          cargarDatos(formulario, item);
          modificacionBotones(true);
          mostrarModal();
        });
        nuevaCelda.appendChild(btnModificar);

        let btnBorrar = document.createElement("button");
        btnBorrar.setAttribute("class", "btn btn-borrar-tabla")
        btnBorrar.textContent = "Borrar";
        btnBorrar.addEventListener("click", (e) => {
          console.log('hice click')
          botonEliminar({ target: { dataset: { id: item.id } } });
        });
        nuevaCelda.appendChild(btnBorrar);
      } else {
        nuevaCelda.textContent = item[celda];
      }
      nuevaFila.appendChild(nuevaCelda);
    });
    tbody.appendChild(nuevaFila);
  })};

function esUpdate()
{
  const form = document.getElementById("form-item");
  if(form.querySelector("#id").value != "")
    {
      return true;
    }
  return false;
}

function escuchandoFormulario() {
  const form = document.getElementById("form-item");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = form.querySelector("#id").value || Date.now();
    const nombre = form.querySelector("#nombre").value;
    const tamaño = form.querySelector("#tamaño").value;
    const masa = form.querySelector("#masa").value;
    const tipo = form.querySelector("#tipo").value;
    const distancia = form.querySelector("#distancia").value;
    const vida = form.querySelector("#vida").checked ? "si" : "no";
    const anillo = form.querySelector("#anillo").checked ? "si" : "no";
    const atmosfera = form.querySelector("#atmosfera").value;

    const model = new Planeta(id, nombre, tamaño, masa, tipo, distancia, vida, anillo, atmosfera);
    const respuesta = model.verify();

    if (respuesta) {
      cerrarModal();
      mostrarSpinner();
      const index = items.findIndex(item => item.id == id);
      if (index === -1) {
        items.push(model);
      } else {
        items[index] = model;
      }

      const str = objectToJson(items);

      try {
        await escribir(KEY_STORAGE, str);
        actualizarFormulario();
        rellenarTabla();
      } catch (error) {
        alert(error);
      }
      ocultarSpinner();
    } else {
      alert(respuesta);
    }
  });
}

function actualizarFormulario() {
  const form = document.getElementById("form-item");
  form.reset();
  
}

function escuchandoBtnDeleteAll() {
  const btn = document.getElementById("btn-delete-all");

  btn.addEventListener("click", async (e) => {

    const rta = confirm('Desea eliminar todos los Items?');

    mostrarSpinner();
    if(rta) {
      items.splice(0, items.length);
      
      try {
        await limpiar(KEY_STORAGE);
        rellenarTabla();
      }
      catch (error) {
        alert(error);
      }
    }
    ocultarSpinner();
  });
}

function obtenerAño(){
  var fechaActual = new Date();
  let fechaMostrar = document.getElementById("año");
  fechaMostrar.textContent = fechaActual.getFullYear();

}

function mostrarModal() {
  document.body.appendChild(overlay);
  formulario.classList.remove('hidden');
}

function cerrarModal() {
  if (document.body.contains(overlay)) {
    document.body.removeChild(overlay);
  }
  formulario.classList.add('hidden');
}

handleColumnVisibilityChange();

// function validarCampoString(campo)
// {
//   if(typeof campo !== 'string'){
//     alert('El campo debe ser un texto');
//   }
//   return true;

// }
// function validarCampoNumero(campoNumerico){
//   let numeroInt = parseInt(campoNumerico);
//   if(typeof numeroInt === 'number')
//     {
//       console.log(numeroInt);
//       return true
//     }
//   console.log("El campo deber ser un numero");
//   return false;
// }