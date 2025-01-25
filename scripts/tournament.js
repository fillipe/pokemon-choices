import { fetchPokemonByType, getRandomPokemons, renderFullEvolutionLine } from "./helpers.js";

// Seleção de elementos DOM
const elements = {
    typeTitle: document.getElementById("type-title"),
    arena: document.querySelector(".arena"),
    pokemon1Name: document.getElementById("pokemon-1-name"),
    pokemon1Evolution: document.getElementById("pokemon-1-evolutions"),
    pokemon2Name: document.getElementById("pokemon-2-name"),
    pokemon2Evolution: document.getElementById("pokemon-2-evolutions"),
    choose1Button: document.getElementById("choose-1"),
    choose2Button: document.getElementById("choose-2"),
    resultsContainer: document.getElementById("results-container"),
};

// Estados globais
let currentType = null;
let currentPokemons = [];
let chosenPokemons = [];
const resultsByType = {};
const scoreByPokemon = {};
const pokemonByType = {};

/**
 * Inicia o torneio para um tipo específico de Pokémon.
 * @param {string} type - Tipo de Pokémon selecionado.
 */
async function startTournament(type) {
    currentType = type;
    elements.typeTitle.textContent = `Torneio: ${type}`;
    chosenPokemons = [];
    elements.resultsContainer.innerHTML = "";

    // Carrega os Pokémon do tipo especificado, se ainda não estiverem armazenados.
    if (!pokemonByType[type]) {
        const pokemonDetails = await fetchPokemonByType(type);
        pokemonByType[type] = pokemonDetails.filter(Boolean);
        pokemonByType[type].forEach(pokemon => (scoreByPokemon[pokemon.name] = 0));
    }

    currentPokemons = [...pokemonByType[type]];

    if (currentPokemons.length === 0) {
        elements.resultsContainer.innerHTML = `<p>Nenhum Pokémon válido encontrado para o tipo ${type}.</p>`;
        elements.arena.style.display = "none";
        return;
    }

    elements.arena.style.display = "block";
    showNextBattle();
}

/**
 * Reinicia o torneio para o tipo atual.
 */
function resetTournament() {
    currentPokemons = [...pokemonByType[currentType]];
    chosenPokemons = [];
    elements.resultsContainer.innerHTML = "";
    showNextBattle();
}

/**
 * Exibe a próxima batalha entre dois Pokémon.
 */
function showNextBattle() {
    if (currentPokemons.length < 2) {
        showResults();
        return;
    }

    const [pokemon1, pokemon2] = getRandomPokemons(currentPokemons);

    elements.pokemon1Name.textContent = pokemon1.name;
    elements.pokemon1Evolution.innerHTML = renderFullEvolutionLine(pokemon1.evolutionLine, true);
    elements.pokemon2Name.textContent = pokemon2.name;
    elements.pokemon2Evolution.innerHTML = renderFullEvolutionLine(pokemon2.evolutionLine, true);

    elements.choose1Button.onclick = () => choosePokemon(pokemon1, pokemon2);
    elements.choose2Button.onclick = () => choosePokemon(pokemon2, pokemon1);
}

/**
 * Escolhe o Pokémon vencedor e avança no torneio.
 * @param {Object} winner - Pokémon vencedor.
 * @param {Object} loser - Pokémon perdedor.
 */
function choosePokemon(winner, loser) {
    scoreByPokemon[winner.name]++;
    chosenPokemons.push(winner);
    currentPokemons = currentPokemons.filter(p => p.name !== loser.name);
    showNextBattle();
}

/**
 * Mostra os resultados do torneio.
 */
function showResults() {
    const top3 = Object.entries(scoreByPokemon)
        .filter(([name]) => pokemonByType[currentType].some(p => p.name === name))
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 3)
        .map(([name]) => pokemonByType[currentType].find(p => p.name === name));

    resultsByType[currentType] = top3;

    elements.resultsContainer.innerHTML = `<h3>Top 3 Pokémon do tipo ${currentType}:</h3>`;
    top3.forEach((pokemon, index) => {
        elements.resultsContainer.innerHTML += `
            <div class="top3-item">
                <h4>${index + 1}º Lugar</h4>
                <div class="evolution-line">
                    ${renderFullEvolutionLine(pokemon.evolutionLine)}
                </div>
            </div>
        `;
    });

    const restartButton = document.createElement("button");
    restartButton.textContent = `Reiniciar torneio para o tipo ${currentType}`;
    restartButton.addEventListener("click", resetTournament);
    elements.resultsContainer.appendChild(restartButton);

    elements.arena.style.display = "none";
}

export { startTournament };
