class PlanetaBase {
  constructor(id, nombre, tamaño,masa, tipo) {
    this.id = id;
    this.nombre = nombre;
    this.masa = masa;
    this.tipo = tipo;
    this.tamaño = tamaño;
  }

  verify() {
    return true;
    // return this.checkTitulo();
  }

  checkTitulo() {
    // return this.titulo && this.precio > 0;
  }
}

export { PlanetaBase };
