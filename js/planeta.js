import { PlanetaBase } from "./planetaBase.js";


class Planeta extends PlanetaBase {
    constructor(id, nombre, tamaño, masa, tipo, distancia, vida, anillo, atmosfera) {
        super(id, nombre, tamaño, masa, tipo);
        this.distancia = distancia;
        this.vida = vida;
        this.anillo = anillo;
        this.atmosfera = atmosfera;
    }

    verify() {
        return this.checkDistancia() && this.checkAtmosfera();
    }

    checkDistancia() {
        if (typeof this.distancia !== 'number') {
            alert('La distancia debe ser un número');
        }
        return true;
    }



    validarAtmosfera() {
        if (typeof this.atmosfera !== 'string') {
            alert('La atmósfera debe ser una cadena de texto');
        }
        return true;
    }
}

    export { Planeta }
