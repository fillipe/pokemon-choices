// UI logic for managing and rendering interface components

// DOM Elements
const arena = document.querySelector(".arena");

/**
 * Renderiza a linha evolutiva de um Pokémon.
 * @param {Array} evolutionLine - Lista de evoluções do Pokémon.
 * @param {boolean} largeImage - Indica se as imagens devem ser renderizadas em tamanho maior.
 * @returns {string} HTML com a linha evolutiva.
 */
export function renderEvolutionLine(evolutionLine, largeImage = false) {
    return evolutionLine
        .map(evolution => `
            <div class="evolution-item">
                <img 
                    src="${largeImage ? getLargeImageUrl(evolution.speciesId) : getSmallImageUrl(evolution.speciesId)}" 
                    alt="${evolution.name}" 
                    class="evolution-image ${largeImage ? 'large' : ''}" 
                >
                <p>${evolution.name}</p>
            </div>
        `)
        .join("");
}

/**
 * Atualiza o container de resultados com o Top 3 de Pokémon.
 * @param {string} type - Tipo do Pokémon.
 * @param {Array} top3 - Lista com os 3 melhores Pokémon.
 */
export function updateResultsContainer(type, top3) {
    const resultsContainer = document.getElementById(`results-container-${type}`) || createResultsContainer(type);

    resultsContainer.innerHTML = `<h3>Top 3 Pokémon do tipo ${type}:</h3>`;
    top3.forEach((pokemon, index) => {
        resultsContainer.innerHTML += `
            <div class="top3-item">
                <h4>${index + 1}º Lugar</h4>
                <div class="evolution-line">
                    ${renderEvolutionLine(pokemon.evolutionLine)}
                </div>
            </div>
        `;
    });

    const restartButton = document.createElement("button");
    restartButton.className = "reset-button";
    restartButton.textContent = `Reiniciar escolhas para o tipo ${type}`;
    restartButton.addEventListener("click", () => window.resetTournament(type)); // Requer `resetTournament` no escopo global.
    resultsContainer.appendChild(restartButton);

    return resultsContainer;
}

/**
 * Cria dinamicamente um container de resultados para um tipo específico.
 * @param {string} type - Tipo do Pokémon.
 * @returns {HTMLElement} O elemento do container criado.
 */
function createResultsContainer(type) {
    const resultsContainer = document.createElement("div");
    resultsContainer.id = `results-container-${type}`;
    resultsContainer.className = "results-container";
    document.body.appendChild(resultsContainer);
    return resultsContainer;
}

/**
 * Alterna a visibilidade da arena.
 * @param {boolean} visible - Define se a arena deve estar visível.
 */
export function toggleArenaVisibility(visible) {
    arena.style.display = visible ? "block" : "none";
}

/**
 * Exibe uma mensagem indicando que não há Pokémon válidos.
 * @param {string} type - Tipo do Pokémon.
 */
export function displayNoValidPokemonMessage(type) {
    const resultsContainer = document.getElementById(`results-container-${type}`) || createResultsContainer(type);
    resultsContainer.innerHTML = `<p>Nenhum Pokémon válido encontrado para o tipo ${type}.</p>`;
    toggleArenaVisibility(false);
}

/**
 * Retorna a URL da imagem grande do Pokémon.
 * @param {number} speciesId - ID da espécie do Pokémon.
 * @returns {string} URL da imagem grande.
 */
function getLargeImageUrl(speciesId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;
}

/**
 * Retorna a URL da imagem pequena do Pokémon.
 * @param {number} speciesId - ID da espécie do Pokémon.
 * @returns {string} URL da imagem pequena.
 */
function getSmallImageUrl(speciesId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
}
