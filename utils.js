// utils.js - Funções auxiliares genéricas

// Filtra Pokémon válidos com base em critérios (exclui regionais, formas alternativas, etc.)
export function filterValidPokemon(pokemonData) {
    const regionalForms = /\b(kanto|johto|hoenn|sinnoh|hisui|unova|kalos|alola|galar|paldea)\b/i;
    const invalidForms = /mega|gmax|totem|starter|alola|galar|hisui|paldea|crowned|origin|other/i;

    return pokemonData.filter(pokemon => {
        if (regionalForms.test(pokemon.name) || invalidForms.test(pokemon.name)) {
            console.warn(`Excluindo variante ou regional: ${pokemon.name}`);
            return false;
        }
        return true;
    });
}

// Ordena Pokémon com base na pontuação
export function sortPokemonByScore(scoreByPokemon, pokemonList) {
    return Object.entries(scoreByPokemon)
        .filter(([name]) => pokemonList.some(p => p.name === name))
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => pokemonList.find(p => p.name === name));
}

// Baralha uma lista de Pokémon
export function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function getRandomPokemons(pokemons) {
    if (pokemons.length < 2) return [null, null];
    const shuffled = [...pokemons].sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1]];
}

export { getRandomPokemons };
