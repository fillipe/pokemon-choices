// Arquivo api.js refatorado
import { filterValidPokemon } from "./utils.js";

const BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Busca todos os Pokémon de um tipo específico.
 * @param {string} type Tipo de Pokémon.
 * @returns {Promise<Array>} Lista de Pokémon detalhada para o tipo.
 */
export async function fetchPokemonByType(type) {
    try {
        const response = await fetch(`${BASE_URL}/type/${type}`);
        const data = await response.json();

        // Obtém os detalhes de cada Pokémon no tipo especificado
        const pokemonDetails = await Promise.all(
            data.pokemon.map(async ({ pokemon }) => {
                const pokemonData = await fetchPokemonDetails(pokemon.url);
                return pokemonData; // Detalhes já filtrados posteriormente
            })
        );

        // Filtra Pokémon válidos com base em critérios
        return filterValidPokemon(pokemonDetails);
    } catch (error) {
        console.error(`Erro ao buscar Pokémon do tipo ${type}:`, error);
        return [];
    }
}

/**
 * Busca os detalhes de um Pokémon por URL.
 * @param {string} url URL da API do Pokémon.
 * @returns {Promise<Object>} Dados detalhados do Pokémon.
 */
async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar dados do Pokémon na URL ${url}:`, error);
        throw error;
    }
}

/**
 * Obtém a linha evolutiva de um Pokémon a partir da URL de sua espécie.
 * @param {string} speciesUrl URL da espécie do Pokémon.
 * @returns {Promise<Array>} Linha evolutiva do Pokémon.
 */
export async function getEvolutionLine(speciesUrl) {
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();

        if (!speciesData.evolution_chain) return [];

        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        return extractEvolutionChain(evolutionData.chain);
    } catch (error) {
        console.error(`Erro ao buscar linha evolutiva para a espécie ${speciesUrl}:`, error);
        return [];
    }
}

/**
 * Extrai a linha evolutiva a partir da estrutura do chain.
 * @param {Object} chain Objeto da cadeia evolutiva.
 * @returns {Array} Linha evolutiva com nome e ID.
 */
function extractEvolutionChain(chain) {
    const evolutionLine = [];
    let currentChain = chain;

    while (currentChain) {
        evolutionLine.push({
            name: currentChain.species.name,
            speciesId: currentChain.species.url.split("/").slice(-2, -1)[0]
        });
        currentChain = currentChain.evolves_to[0];
    }

    return evolutionLine;
}
