
function readYTDTable() {
    const seasonGrid = document.querySelector('vm-player-season-grid');
    const container = seasonGrid?.querySelector('.ag-center-cols-container');
    if (!container) return;

    const rows = Array.from(container.querySelectorAll('[role="row"]'));
    if (rows.length === 0) return;

    if (scores_read) return; // Skip if already processed

    console.log('Reading the YTD table for data');

    // Reset values
    player_scores.length = 0;
    player_prices.length = 0;
    games_played = 0;

    let foundValidScores = false;

    for (const row of rows) {
        const scoreRow = row.querySelector('[col-id="points"]');
        const player_score = scoreRow ? parseInt(scoreRow.innerText) : NaN;

        const priceRow = row.querySelector('[col-id="Summary__price"] span');
        const player_price = priceRow ? parseFloat(priceRow.innerText.replace(/[^\d.]/g, '')) : NaN;
        const player_price_int = isNaN(player_price) ? NaN : parseInt(player_price * 1000);

        if (!isNaN(player_price_int) && !isNaN(player_score)) {
            player_scores.push(player_score);
            player_prices.push(player_price_int);
            games_played++;
            console.log(`Game ${games_played} Score: ${player_score}, Price: ${player_price_int}`);
            foundValidScores = true;
        }
    }

    scores_read = foundValidScores;
    if (scores_read) {
        console.log('Scores successfully read');
    }
}


function updateProjectionTable(update_prices) {
    const fixtureGrid = document.querySelector('vm-player-upcoming-fixture-grid');
    const container = fixtureGrid?.querySelector('.ag-center-cols-container');
    const rows = container ? container.querySelectorAll('[role="row"]') : [];

    if (rows.length === 0) {
        return;
    }

    if (!proj_points_replaced) {
        initialFixtureUpdate(fixtureGrid, rows);
    } else if (update_prices) {
        updateFixtureRows(rows);
    }
}

// main setup function of adding input and player_score logic
function initialFixtureUpdate(fixtureGrid, rows){

    // Find the first row's projected score
    const firstRow = rows[0]; // Assuming rows[0] is the first entry
    if (firstRow) {
        const firstPptsElement = firstRow.querySelector('[col-id="ppts"]');
        if (firstPptsElement) {
            const firstProjectedScore = parseInt(firstPptsElement.innerText);

            // Check if the first projected score is a valid number
            if (!isNaN(firstProjectedScore)) {
                console.log(`Valid first projected score found: ${firstProjectedScore}`);

                let index_offset = games_played;
                rows.forEach((row, index) => {
                    
                    //TODO: Row indexing on projection table will need to have the index incremented:
                    // -- by 1 if the player plays rd0  
                    // -- by player_scores.length after the past scores are initialized in the YTD table
                    index += index_offset;
                
                    // replace the projection elements with our custom input elements
                    const ppts_element = row.querySelector('[col-id="ppts"]');
                    if (ppts_element) {
                        const projected_score = parseInt(ppts_element.innerText);
            
                        // Check if the parsed value is a valid number (NaN check)
                        if (!isNaN(projected_score)) {
                            // console.log(`Row Index: ${index}, Projected Points: ${projected_score}`);
                
                            original_projected_scores.push(projected_score);
                            add_proj_points(ppts_element, player_scores.length); 
                            player_scores.push(projected_score); 
                            proj_points_replaced = true;
            
                
                        } else {
                            console.log(`Invalid projected points at row ${index}: ${ppts_element.innerText}`);
                        }
            
            
                    } else {
                        console.log(`Projected Points or Price Element not found in row ${index}`);
                    }
                });
            
                // Use rows[0]'s Breakeven & out yearTable data to calculate current magic number
                let curr_BE_element = rows[0]?.querySelector('[col-id="be"] div');

                if (curr_BE_element && curr_BE_element.childNodes.length > 0) {
                    const beText = curr_BE_element.childNodes[0].textContent.trim();
                    const beValue = parseInt(beText);

                    if (!isNaN(beValue)) {
                        curr_BE = beValue;
                        console.log('first reading of curr_BE: ', curr_BE);
                        player_BEs.push(curr_BE);
                    } else {
                        console.log('BE text is not a number:', beText);
                    }
                } else {
                    console.log('First BE element or its child node not found, keeping curr_magic_num unchanged.');
                }

                // Only try to calculate magic number if BE was valid and enough data exists
                if (
                    !isNaN(curr_BE) &&
                    games_played >= 2 &&
                    player_scores.length >= 2 &&
                    player_prices.length >= 1 &&
                    !isNaN(player_scores[games_played - 2]) &&
                    !isNaN(player_scores[games_played - 1]) &&
                    !isNaN(player_prices[games_played - 1])
                ) {
                    const score_2 = player_scores[games_played - 2];
                    const score_1 = player_scores[games_played - 1];
                    const price_1 = player_prices[games_played - 1];

                    const calculatedMagicNum = CalculateMagicNumber(score_2, score_1, price_1, curr_BE);

                    if (!isNaN(calculatedMagicNum)) {
                        curr_magic_num = calculatedMagicNum;
                        base_magic_num = calculatedMagicNum;
                        console.log('calculated curr_magic_num: ', curr_magic_num);
                    } else {
                        console.log('Calculated magic number is NaN, keeping previous value.');
                    }
                } else if (!isNaN(curr_BE)) {
                    console.log('Not enough score or price data to calculate magic number:', {
                        games_played,
                        player_scores,
                        player_prices,
                    });
                }


                
                // ROUND 0 HEADERS NO LONGER NEEDED
                // // FIND THE ROUNDS SECTION TO SEE IF THE PLAYER PLAYS RD0
                // const teamsContainer = fixtureGrid.querySelector('.ag-pinned-left-cols-container');
                // teamsContainer ? (() => {

                //     // Find next Rd opponent (row-index="0")
                //     const nextRdRow = teamsContainer.querySelector('[row-index="0"]');

                //     // cant do row index 0, need to use the 1st score in the player_scores array
                //     if (nextRdRow) {
                        
                //         // const nextRdNumberDiv = nextRdRow.querySelector('.vm-GridComponent-rowNumber');
                //         // if (nextRdNumberDiv){
                //         //     nextRdNumber = parseFloat(nextRdNumberDiv.innerText.trim());
                //         // }
                //         const nextRdOppSpan = nextRdRow.querySelector('.vm-PlayerSeasonRdOppAg-teamAbbrev');
                //         if (nextRdOppSpan) {
                //             const Rd1Opponent = nextRdOppSpan.innerText.trim();
                //             console.log(`next rd Opponent: ${Rd1Opponent}`);

                //             // Get rd 0 opponent from hardcoded mapping
                //             const mappedRd0Opponent = rdOpponentMapping[Rd1Opponent];

                //             if (mappedRd0Opponent) {
                //                 console.log(`rd 0 opponent: ${mappedRd0Opponent}`);
                //                 plays_rd0 = true;
                //                 games_played = 1;
                //                 rd0Opponent = mappedRd0Opponent;
                //             } else {
                //                 console.warn(`No mapping found for next Rd opponent: ${Rd1Opponent}`);
                //             }
                //         }
                //     }
                // })() : console.warn('"ag-pinned-left-cols-container" not found.');

                // When first reading the table, add projection button and other header features
                const projectionTableHeader = document.querySelector('.vm-TitleBarComponent.vm-TitleBarComponent--sidebar.vm-TitleBarComponent--fullWidthTitle');
                if (projectionTableHeader) {
                    console.warn('found projectionTableHeader');
                    add_proj_headers(projectionTableHeader);
                    
                    // ROUND 0 HEADERS NO LONGER NEEDED
                    // if (games_played>0) {
                    //     add_rd0_headers(projectionTableHeader, rd0Opponent, firstRow);
                    // }
                } else {
                    console.warn('Could not find projectionTableHeader');
                }  

            } else {
                console.warn('Skipping header additions: First projected score is NaN.');
            }
        } else {
            console.warn('Skipping header additions: First row has no "ppts" element.');
        }
    } else {
        console.warn('Skipping header additions: No rows found.');
    }
}



// function called when we project scores to update the table's projected data
function updateFixtureRows(rows){
    // clear the player prices but keep reference
    player_prices.length = games_played;
    
    // clear player BEs, but keeping the currBE as reference
    player_BEs.length = 1;

    //adding to the player_prices endlessly
    
    // if we have a previous score & price from rd0 or being into the season, then use index_offset
    // let index_offset = (plays_rd0 || nextRdNumber > 1) ? 1 : 0;
    let index_offset = games_played;

    rows.forEach((row, index) => {
        //TODO: Row indexing on projection table will need to have the index incremented:
        // -- by 1 if the player plays rd0  
        // -- by player_scores.length after the past scores are initialized in the YTD table
        index += index_offset;

        // after the 1st round, we need to always have index offset be 1 



        // replace the projection elements with our custom input elements
        const ppts_element = row.querySelector('[col-id="custom-ppts"]');
        const price_element = row.querySelector('[col-id="pp"]');
        const ppc_element = row.querySelector('[col-id="ppc"]');


        const BE_element = row.querySelector('[col-id="be"] div');
        if (BE_element.childNodes.length > 0) {
            curr_BE = parseInt(BE_element.childNodes[0].textContent.trim());
            console.log('curr_BE: ', curr_BE);
           
        } else {
            console.log(`BE element's child node not found.`);
        }
        
        let player_price = price_element ? parseFloat(price_element.innerText.replace(/[^\d.]/g, '')) : 0;
        let player_price_int = parseInt(player_price*1000);
        console.log('New player price:', player_price_int);

        
        if (ppts_element && price_element && BE_element) {
            console.log('============================================');
            // console.log(`Row Index: ${index}, Projected Points: ${ppts_element.value}, Price: ${player_price_int}`);
        
            // Check if it's one of the first two rds
            if (index < 2) {
            // TODO: if (player_scores.length < 2){
                console.log(`rd ${index + 1}: Setting price for first two rds.`);
                player_prices.push(player_price_int);
                
            } else {
                console.log(`rd ${index + 1}:`);

                let prev_score1 = player_scores[index-2];
                let prev_score2 = player_scores[index-1];
                let prev_price = player_prices[index-1];
                console.log(`player_prices: ${player_prices}`);
                
                // curr_magic_num = CalculateMagicNumber(prev_score1, prev_score2, prev_price, curr_BE);
                // console.log('calculated curr_magic_num: ', curr_magic_num);
                
                // Update the player_scores[index] value to be the custom_ppts value
                const projected_score = parseInt(ppts_element.value) || 0;
                console.log(`Projected score for rd ${index + 1}: ${projected_score}`);
                player_scores[index] = projected_score;
                

               

                // CALCULATE AND ADD NEW PRICES, PRICE CHANGES AND BREAKEVENS

                const new_price = CalculatePrice(prev_score1, prev_score2, projected_score, prev_price, index);
                console.log(`New price calculated: $${(new_price / 1000).toFixed(1)}k`);

                add_proj_price(price_element, new_price);
                player_prices.push(new_price);

                add_ppc(ppc_element, new_price, player_prices[index-1]);


                console.log(`player_BEs before adding:  ${player_BEs}`);
                const new_BE = CalculateBE(projected_score, prev_score2, new_price);
                console.log(`New BE calculated: ${new_BE}`);
                player_BEs.push(new_BE);
                add_BE(BE_element, player_BEs[games_played >= 2 ? player_BEs.length - 2 : player_BEs.length - 1]);

                console.log(`player_BEs after adding:  ${player_BEs}`);

                // this depends if its in first 2 rds,  

                
            }
        } else {
            console.log(`Projected Points or Price Element not found in row ${index}`);
        }
        
    });
    console.log(`player_scores: ${player_scores}`);
    console.log(`player_prices: ${player_prices}`);
}