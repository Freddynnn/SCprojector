// -------------------------------
// Runtime State Variables
// Used throughout content.js and logic modules
// -------------------------------

// --- Boolean flags for logic control ---
let scores_read = false;               // Has the score table been read yet?
let proj_points_replaced = false;      // Have projected points been updated?
let proj_header_added = false;         // Has the "Projected" header been added to the table?
let rd0_header_added = false;          // Has the Round 0 header been added?
let MN_approximation_true = false;     // Should we apply magic number % adjustment?
let settings_toggled_true = false;     // Has the user toggled settings?

let plays_rd0 = false;                 // Does the player have a Round 0 game?
let rd0Opponent = '';                  // Stores Round 0 opponent for a given player (if any)


// --- Arrays to store player data ---
let player_scores = [];                // Recent scores for each player
let original_projected_scores = [];    // Projected scores before we replace them
let player_prices = [];                // Current prices of players
let player_BEs = [];                   // Calculated breakevens for players


// --- Magic number values ---
let base_magic_num = 5390;             // Default starting magic number
let curr_magic_num = 5390;             // May be adjusted dynamically
let player_scores_offset = 0;          // Shift index if round data starts later than expected

// --- Round logic helpers ---
let games_played = 0;                  // Used to determine how many scores to use in calc
// let nextRdNumber = 0;              // Optional: track which round is upcoming
