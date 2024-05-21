// Función para mostrar el spinner
export function mostrarSpinner() {
    console.log('mostrarSpinner');
    action(true);
}

// Función para ocultar el spinner
export function ocultarSpinner() {
    console.log('ocultado');
    action();
}




function action(visible = false) {
    const display = visible ? 'flex' : 'none';
    document.getElementById('spinner').style.display = display;
}