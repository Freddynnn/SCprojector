// ---------------------------------------------
// calculations.js
// Core logic for price, breakeven, and MN calculations
// ---------------------------------------------

/**
 * Calculates the player's projected price based on their past two scores,
 * projected score, current price, and the round index (for MN adjustment).
 * 
 * @param {number} score1 - Most recent game score
 * @param {number} score2 - Second most recent score
 * @param {number} projected_score - Projected score for next round
 * @param {number} curr_price - Player's current price
 * @param {number} index - Round index for magic number percentage
 * @returns {number} - New projected price, rounded to nearest $100
 */
function CalculatePrice(score1, score2, projected_score, curr_price, index) {
    console.log(`CalculatePrice(${score1}, ${score2}, ${projected_score}, ${curr_price}, ${index})`);

    const three_rd_avg = (score1 + score2 + projected_score) / 3;
    let newPrice;

    if (MN_approximation_true) {
        // Apply magic number modifier for this round
        newPrice = (curr_price * 0.75) + ((three_rd_avg * curr_magic_num * magic_number_percentages[index]) / 4);
    } else {
        newPrice = (curr_price * 0.75) + ((three_rd_avg * curr_magic_num) / 4);
    }

    return Math.round(newPrice / 100) * 100; // Round to nearest $100
}


/**
 * Calculates the player's current magic number based on official breakeven.
 * Used to reverse-engineer the MN from live data.
 * 
 * @param {number} score1 - Most recent game score
 * @param {number} score2 - Second most recent score
 * @param {number} player_price - Player's current price
 * @param {number} breakeven - Official breakeven value
 * @returns {number} - Calculated magic number
 */
function CalculateMagicNumber(score1, score2, player_price, breakeven) {
    return (player_price * 3) / (breakeven + score1 + score2);
}


/**
 * Calculates the breakeven score required to maintain current price.
 * Based on the player's past scores and the current magic number.
 * 
 * @param {number} score1 - Most recent game score
 * @param {number} score2 - Second most recent score
 * @param {number} player_price - Current price
 * @returns {number} - Calculated breakeven score
 */
function CalculateBE(score1, score2, player_price) {
    return ((player_price * 3) / curr_magic_num) - (score1 + score2);
    
}

