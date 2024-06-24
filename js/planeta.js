import { PlanetaBase } from "./planetaBase.js";


class Planeta extends PlanetaBase {
    constructor(id, nombre, tamaño, masa, tipo, distancia, vida, anillo, atmosfera) {
        super(id, nombre, tamaño, masa, tipo);
        this.distancia = distancia;
        this.vida = vida;
        this.anillo = anillo;
        this.atmosfera = atmosfera;
    }

    /**
     * Realiza verificacion sobre los datos del planeta
     *
     * @returns {boolean} true si los datos son correctos, false si no
     */
    verify() {
        return this.checkDistancia() && this.validarAtmosfera();
    }

    /**
     * Valida que la distancia sea un número
     *
     * @returns {boolean} true si la distancia es un número, false si no
     */
    checkDistancia() {

        if (!parseInt(this.distancia)) {
            alert('La distancia debe ser un número');
            return false;
        }
        return true;
    }

    
    /**
     * Validar que la atmósfera sea una cadena de texto
     *
     * @returns {boolean} true si la atmósfera es una cadena de texto, false si no
     */
    validarAtmosfera() {
        if (typeof this.atmosfera != 'string') {
            alert('La atmósfera debe ser una cadena de texto');
            return false;
        }
        return true;
    }

    
}

    export { Planeta }
