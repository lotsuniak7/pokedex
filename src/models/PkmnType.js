/**
 * @file PkmnType.js
 * @description Dictionnaire centralisé des types de Pokémon.
 * Agit comme une énumération (Enum) pour lister tous les types élémentaires officiels.
 */

/**
 * Tableau constant contenant tous les types de Pokémon valides.
 * Inclut le type récent "STELLAR" ainsi que "???" pour les cas particuliers (œufs/inconnus).
 * * @constant {string[]}
 * @default
 */

const PkmnType = [
    "NORMAL",
    "FIRE",
    "FIGHTING",
    "WATER",
    "FLYING",
    "GRASS",
    "POISON",
    "ELECTRIC",
    "GROUND",
    "PSYCHIC",
    "ROCK",
    "ICE",
    "BUG",
    "DRAGON",
    "GHOST",
    "DARK",
    "STEEL",
    "FAIRY",
    "STELLAR",
    "???"
]

module.exports = PkmnType;