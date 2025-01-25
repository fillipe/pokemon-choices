/**
 * Busca todos os Pokémon de um tipo específico.
 * @param {string} type - Tipo de Pokémon.
 * @returns {Promise<Array>} - Lista de Pokémon com detalhes.
 */
export async function fetchPokemonByType(type) {
    const baseUrl = "https://pokeapi.co/api/v2/type/";
    try {
        const response = await fetch(`${baseUrl}${type}`);
        const data = await response.json();

        const pokemonDetails = await Promise.all(
            data.pokemon.map(async ({ pokemon }) => {
                return await fetchPokemonDetails(pokemon.url);
            })
        );

        return pokemonDetails.filter(pokemon => pokemon !== null);
    } catch (error) {
        console.error(`Erro ao buscar Pokémon do tipo ${type}:`, error);
        return [];
    }
}

/**
 * Busca os detalhes de um Pokémon por URL.
 * @param {string} url - URL da API do Pokémon.
 * @returns {Promise<Object|null>} - Dados do Pokémon ou null se inválido.
 */
async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();

        // Exclui variantes específicas (e.g., Alola, Galar, etc.)
        if (/-(alola|galar|paldea|mega|gmax)$/i.test(data.name)) {
            return null;
        }

        return {
            name: data.name,
            url: data.url,
            speciesUrl: data.species.url,
            imageUrl: data.sprites.front_default,
            evolutionLine: await getEvolutionLine(data.species.url),
        };
    } catch (error) {
        console.error(`Erro ao buscar detalhes do Pokémon: ${url}`, error);
        return null;
    }
}

/**
 * Obtém a linha evolutiva de um Pokémon.
 * @param {string} speciesUrl - URL da espécie do Pokémon.
 * @returns {Promise<Array>} - Linha evolutiva do Pokémon.
 */
export async function getEvolutionLine(speciesUrl) {
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();

        if (!speciesData.evolution_chain) return [];

        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        const evolutionLine = [];
        let currentChain = evolutionData.chain;

        while (currentChain) {
            evolutionLine.push({
                name: currentChain.species.name,
                imageUrl: await getPokemonImage(currentChain.species.name),
            });
            currentChain = currentChain.evolves_to[0];
        }

        return evolutionLine;
    } catch (error) {
        console.error("Erro ao buscar linha evolutiva:", error);
        return [];
    }
}

/**
 * Obtém a imagem de um Pokémon pelo nome.
 * @param {string} name - Nome do Pokémon.
 * @returns {Promise<string>} - URL da imagem do Pokémon.
 */
async function getPokemonImage(name) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!response.ok) return "";
        const data = await response.json();
        return data.sprites.front_default || "";
    } catch {
        return "";
    }
}

/**
 * Retorna dois Pokémon aleatórios de uma lista.
 * @param {Array} pokemons - Lista de Pokémon.
 * @returns {Array} - Dois Pokémon aleatórios ou null se insuficientes.
 */
export function getRandomPokemons(pokemons) {
    if (pokemons.length < 2) return [null, null];
    const shuffled = pokemons.sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1]];
}

/**
 * Renderiza a linha evolutiva de um Pokémon.
 * @param {Array} evolutionLine - Linha evolutiva do Pokémon.
 * @param {boolean} isBattle - Indica se está em modo de batalha.
 * @returns {string} - HTML da linha evolutiva.
 */
export function renderFullEvolutionLine(evolutionLine, isBattle = false) {
    return evolutionLine
        .filter(evo => evo.imageUrl)
        .map(evo => `
            <div class="evolution-item" style="display: inline-block; text-align: center; margin: 10px;">
                <img src="${evo.imageUrl}" alt="${evo.name}" width="${isBattle ? 100 : 150}">
                <p>${evo.name}</p>
            </div>
        `)
        .join('');
}
