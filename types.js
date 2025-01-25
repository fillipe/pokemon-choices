import { startTournament } from "./tournament.js";

/**
 * Lista de tipos de Pokémon.
 */
const types = [
    "normal", "fire", "water", "grass", "flying", "fighting", "poison",
    "electric", "ground", "rock", "psychic", "ice", "bug", "ghost",
    "steel", "dragon", "dark", "fairy"
];

/**
 * Gera botões para os tipos de Pokémon e associa um callback a cada botão.
 * @param {Function} onClickCallback - Função chamada ao clicar em um botão.
 */
function generateTypeButtons(onClickCallback) {
    const typeButtonsContainer = document.querySelector(".type-buttons");

    // Limpa o container antes de adicionar novos botões
    typeButtonsContainer.innerHTML = "";

    // Cria e insere os botões
    types.forEach(type => {
        const button = document.createElement("button");
        button.textContent = type;
        button.className = "type-button"; // Adiciona uma classe para estilização, se necessário
        button.addEventListener("click", () => onClickCallback(type));
        typeButtonsContainer.appendChild(button);
    });
}

// Adiciona os botões ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
    generateTypeButtons(startTournament);
});

export { types, generateTypeButtons };
