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
btnCancelar.addEventListener("click", botonCancelar);
Modal.addEventListener("click", mostrarModal);
overlay.addEventListener("click", cerrarModal);

btnBorrar.addEventListener("click", botonEliminar);



function onInit() {
  loadItems();
  escuchandoFormulario();
  escuchandoBtnDeleteAll();

  obtenerAño();
}


/**
 * Maneja el evento click en la tabla
 * si el evento es en una celda de la tabla carga los datos en el formulario
 * si el evento es en cualquier otro lugar cierra el modal y limpia el formulario
 * 
 */
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


/**
 * Modifica el estilo de los botones de borrar 
 * si habilitado es true cambia la clase a activado
 * si es false cambia la clase a desactivado
 *
 * @param {boolean} [habilitado=false] 
 */
function modificacionBotones(habilitado=false){
  if(habilitado){
    btnBorrar.setAttribute("class", "btn btn-eliminar activado")
  }else{
    btnBorrar.setAttribute("class", "btn btn-eliminar desactivado")
  }
  
}


/**
 * Elimina un item del array items y del local storage
 * @async
 * @param {*} e
 * @returns {*}
 */
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





/**
 * Carga los datos del item en el formulario
 * si el item no existe limpia el formulario
 * si el item existe carga los datos en el formulario
 *
 * @param {*} formCarga 
 * @param {*} datos 
 */
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

/**
 * Carga los items del local storage en el array items
 * si no hay items en el local storage crea un array vacio
 * convierte los items en objetos de la clase Planeta
 * rellena la tabla con los datos de los items
 *
 * @returns {*} retorna un array de objetos de la clase Planeta
 */
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


/**
 * Rellena la tabla con los datos de los items
 * limpia la tabla antes de rellenarla
 * crea las celdas y las filas de la tabla
 * agrega los botones de modificar y borrar a cada fila
 * agrega los eventos a los botones de modificar y borrar
 */
function rellenarTabla() {
    const celdas = ["id","nombre", "tamaño", "masa", "tipo", "distancia", "vida", "anillo","atmosfera", "acciones"];
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
    });
  }
  



/**
 * Escucha el evento submit del formulario
 * trae los datos de los campos realizando su validacion y los guarda en el local storage
 * si el item ya existe lo actualiza
 * si no existe lo agrega al array items
 * muestra un alert si los datos son incorrectos
 * limpia el formulario
 * actualiza la tabla
 *
 */
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
    const campos = [
      { valor: nombre, validacion: { obligatorio: true }, nombreCampo: "nombre" },
      { valor: tamaño, validacion: { obligatorio: true ,tipo: "numerico" }, nombreCampo: "tamaño" },
      { valor: masa, validacion: { obligatorio: true }, nombreCampo: "masa" },
      { valor: tipo, validacion: { obligatorio: true }, nombreCampo: "tipo" },
      { valor: distancia, validacion: { obligatorio: true, tipo: "numerico" }, nombreCampo: "distancia" },
      { valor: atmosfera, validacion: { obligatorio: true }, nombreCampo: "atmosfera" }
    ];

    let validar = validacionCampos(campos)

    if(!validar)
      {
        return;
      }
    
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

/**
 * Limpia el formulario
 */
function actualizarFormulario() {
  const form = document.getElementById("form-item");
  form.reset();
  
}

/**
 * Escucha el evento click del boton de eliminar todos los items
 */
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

/**
 * Obtiene el año actual y lo muestra en el footer
 */
function obtenerAño(){
  var fechaActual = new Date();
  let fechaMostrar = document.getElementById("año");
  fechaMostrar.textContent = fechaActual.getFullYear();

}

/**
 * Muestra el modal
 */
function mostrarModal() {
  document.body.appendChild(overlay);
  formulario.classList.remove('hidden');
}

/**
 * Cierra el modal
 */
function cerrarModal() {
  if (document.body.contains(overlay)) {
    document.body.removeChild(overlay);
  }
  formulario.classList.add('hidden');
}


/**
 * La funcion cierra el modal y limpia el formulario
 */
function botonCancelar()
{
  cerrarModal();
  modificacionBotones(false);
  actualizarFormulario();
}

/**
 * Realiza validaciones de los campos
 *
 * @param {*} campos se espera un array de objetos con la siguiente estructura { valor: "", validacion: { obligatorio: true, tipo: "numerico" }, nombreCampo: "nombre" }
 * @returns {boolean} retorna true si los campos son validos, false si no lo son
 */
function validacionCampos(campos)
{
  for (let campo of campos) 
    {
      let { valor, validacion, nombreCampo } = campo;

      if (validacion.obligatorio && !valor) {
        alert(`El campo ${nombreCampo} es obligatorio`);
        return false;
      }

      if (validacion.tipo === "numerico" && (isNaN(valor) || valor <= 0)) {
        alert(`El campo ${nombreCampo} debe ser un número positivo`);
        return false;
      }
    }

    return true;
}


