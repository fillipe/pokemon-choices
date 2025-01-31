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
        if (/(kanto|johto|hoenn|sinnoh|unova|kalos|hisui|alola|galar|paldea|mega|gmax)/i.test(data.name)) {
            return null; // Exclui Pokémon que contenham qualquer uma dessas palavras no nome
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
 * Obtém a linha evolutiva completa de um Pokémon.
 * @param {string} speciesUrl - URL da espécie do Pokémon.
 * @returns {Promise<Array>} - Linha evolutiva do Pokémon.
 */
export async function getEvolutionLine(speciesUrl) {
    try {
        // Busca os dados da espécie
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();

        if (!speciesData.evolution_chain) return [];

        // Busca os dados da cadeia evolutiva
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        // Função recursiva para processar a cadeia evolutiva
        const extractEvolutions = async (chain) => {
            const evolutions = [];
            const currentPokemon = {
                name: chain.species.name,
                imageUrl: await getPokemonImage(chain.species.name),
            };

            evolutions.push(currentPokemon);

            // Processa múltiplas evoluções, se existirem
            if (chain.evolves_to.length > 0) {
                for (const evolution of chain.evolves_to) {
                    const childEvolutions = await extractEvolutions(evolution);
                    evolutions.push(...childEvolutions);
                }
            }

            return evolutions;
        };

        // Extrai a linha evolutiva completa
        return await extractEvolutions(evolutionData.chain);
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
        console.log(`Buscando imagem para: ${name}`);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        
        if (!response.ok) {
            console.warn(`Falha ao buscar dados para: ${name}. Status: ${response.status}`);
            return "path/to/placeholder-image.png"; // Caminho de fallback.
        }

        const data = await response.json();
        const sprites = data.sprites;

        // Prioridade de sprites a serem usados
        const imageUrl =
            sprites.other?.["official-artwork"]?.front_default || // Arte oficial
            sprites.other?.home?.front_default || // Imagem "home"
            sprites.front_default || // Sprite padrão frontal
            sprites.other?.showdown?.front_default || // Versão do showdown
            sprites.back_default || // Sprite traseiro
            "path/to/placeholder-image.png"; // Fallback se nenhum sprite existir

        if (!imageUrl) {
            console.warn(`Nenhuma imagem encontrada para ${name}`);
        }

        console.log(`Imagem encontrada para ${name}: ${imageUrl}`);
        return imageUrl;
    } catch (error) {
        console.error(`Erro ao buscar imagem para ${name}:`, error);
        return "path/to/placeholder-image.png"; // Caminho de fallback.
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
 * @param {string} pokemonName - Nome do Pokémon principal a ser destacado.
 * @returns {string} - HTML da linha evolutiva.
 */
export function renderFullEvolutionLine(evolutionLine, isBattle = false, pokemonName = '') {
    return evolutionLine
        .filter(evo => evo.imageUrl) // Garante que tenha URL de imagem
        .map(evo => `
            <div class="evolution-item ${evo.name === pokemonName ? 'highlight' : ''}" style="display: inline-block; text-align: center; margin: 10px;">
                <img src="${evo.imageUrl}" alt="${evo.name}" width="${isBattle ? 100 : 150}">
                <p>${evo.name}</p>
            </div>
        `)
        .join('');
}
