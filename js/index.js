import { Planeta } from "./planeta.js"
import { leer, escribir, limpiar, jsonToObject, objectToJson } from "./local-storage-async.js";
import { mostrarSpinner, ocultarSpinner } from "./spinner.js";

const KEY_STORAGE = "planetas";
let items = []; // array vacio
const formulario = document.getElementById("form-item");
const btnBorrar = document.getElementById("btnEliminar");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");

document.addEventListener("DOMContentLoaded", onInit); // importante no poner parentesis, es un callback
document.addEventListener("click", handlerClick)
btnCancelar.addEventListener("click", actualizarFormulario);

btnBorrar.addEventListener("click", botonEliminar);



function onInit() {
  loadItems();
  // handlerClick();
  escuchandoFormulario();
  escuchandoBtnDeleteAll();

  obtenerAño();
  // botonEliminar();
}


function handlerClick(e) {
  if(e.target.matches('td')){
    let idMathc = e.target.parentNode.firstChild;

    const item = items.filter((dato) => dato.id == idMathc.firstChild.textContent)[0];

    cargarDatos(formulario, item);
    modificacionBotones(true);
  } 
  else if(!e.target.matches('input') && !e.target.matches('select') && !e.target.matches('textarea') && !e.target.matches('button'))
  {
    modificacionBotones(false);
    actualizarFormulario();
  }
}


function modificacionBotones(habilitado=false){
  if(habilitado){
    btnBorrar.setAttribute("class", "btn btn-eliminar activado")
  }else{
    btnBorrar.setAttribute("class", "btn btn-eliminar desactivado")
  }
  
}
async function botonEliminar(e){

  if(confirm("Desea eliminar el item seleccionado?")){
    mostrarSpinner();
    let idEliminar = formulario.id.value;
    console.log("Id a eliminar: "+ idEliminar)
    console.log("Lista previa a eliminar: "+ items)

    let itemsFiltrado = items.filter((dato) => dato.id != idEliminar);
    console.log("Lista despues de eliminar: "+itemsFiltrado);
    items = itemsFiltrado;
    const str = objectToJson(items);
    await escribir(KEY_STORAGE, str);
    ocultarSpinner();
    actualizarFormulario();
    rellenarTabla();
  }
} 





function cargarDatos(formCarga, datos){
  formCarga.nombre.value = datos.nombre;
  formCarga.tamaño.value = datos.tamaño;
  formCarga.masa.value = datos.masa;
  formCarga.distancia.value = datos.distancia;
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
        obj.distancia,
        obj.tipo,
        obj.vida,
        obj.anillo,
        obj.atmosfera
    );
  
    items.push(model);
  });

  rellenarTabla();
}


function rellenarTabla() {
    const celdas = ["id","nombre", "tamaño", "masa", "distancia", "tipo", "vida", "anillo","atmosfera", "acciones"];
    const tbody = document.querySelector("tbody"); 

    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    items.forEach((item) => {
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
          });
          nuevaCelda.appendChild(btnModificar);

          let btnBorrar = document.createElement("button");
          btnBorrar.setAttribute("class", "btn btn-borrar-tabla")
          btnBorrar.textContent = "Borrar";
          btnBorrar.addEventListener("click", () => {
            botonEliminar(item.id);
          });
          nuevaCelda.appendChild(btnBorrar);
        } else {
          nuevaCelda.textContent = item[celda];
        }
        nuevaFila.appendChild(nuevaCelda);
      });
      tbody.appendChild(nuevaFila); 
    });
  }
  


function escuchandoFormulario() {

  const form = document.getElementById("form-item");

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    var fechaActual = new Date();

    const model = new Planeta(
      fechaActual.getTime(),
      form.querySelector("#nombre").value,
      form.querySelector("#tamaño").value,
      form.querySelector("#masa").value,
      form.querySelector("#distancia").value,
      form.querySelector("#tipo").value,
      form.querySelector("#vida").checked ? "si" : "no",
      form.querySelector("#anillo").checked ? "si" : "no",
      form.querySelector("#atmosfera").value,
    )

    const respuesta = model.verify();
    console.log(respuesta);

    if (respuesta) {
      mostrarSpinner();
      items.push(model);
      const str = objectToJson(items);
      
      try {
        await escribir(KEY_STORAGE, str);

        actualizarFormulario();
        rellenarTabla();
      }
      catch (error) {
        alert(error);
      }
      ocultarSpinner();
    }
    else {
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
