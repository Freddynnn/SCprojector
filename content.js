console.log("content.js is working");
// Bools to check when to read tables
let scores_read = false;
let proj_points_replaced = false;
let proj_header_added = false;
let rd0_header_added = false;
let MN_approximation_true = false;

let plays_rd0 =false;
let rd0Opponent = '';

// Arrays for calculations
let player_scores = [];
let original_projected_scores = [];
let player_prices = [];
let player_BEs = [];

// Set the base magic number (use the value you provided)
let base_magic_num = 5390;   
let curr_magic_num = 5390;
let player_scores_offset = 0;
// let nextRdNumber = 0;
let games_played = 0;


// HARD-CODED MAGIC NUMBER DECREASE PERENTAGES
// roughly extrapolated averages from the data sampled from this post:  
// https://x.com/bricemitchell/status/1658093613841100800/photo/1  

let magic_number_percentages = [
    1,
    1,
    0.990,
    0.944,
    0.941,
    0.943,
    0.944,
    0.938,
    0.936,
    0.930,
    0.921,
    0.921,
    0.920,
    0.922,
    0.927,
    0.923,
    0.919,
    0.914,
    0.912,
    0.913,
    0.912,
    0.919,
    0.916,
    0.913
];


// HARD CODED OPENING ROUND MAPPINGS
let rdOpponentMapping = {
    //rd1:  rd0   // Team in question
    // 'SYD': 'GEE', //BRL
    // 'FRE': 'BRL', //GEE

    'BRL': 'HAW', //SYD
    'ESS': 'SYD', //HAW

    'HAW': 'GCS', //ESS
    'WCE': 'ESS', //GCS

    'MEL': 'COL', //GWS
    'PTA': 'GWS'  //COL
};

let rd0VenueMapping = {
    'GEE': 'G  ', 
    'BRL': 'G  ',

    'HAW': 'SCG', 
    'SYD': 'SCG', 

    'GCS': 'PFS', 
    'ESS': 'PFS', 

    'COL': 'ENS', 
    'GWS': 'ENS'  
};

let rdOpponentSVGMapping = {
    'GEE': 'Geelong', 
    'BRL': 'Brisbane', 
    'HAW': 'Hawthorn', 
    'SYD': 'Sydney', 
    'GCS': 'Gold_Coast', 
    'ESS': 'Essendon', 
    'COL': 'Collingwood', 
    'GWS': 'GWS_Giants'  
};



// CORE CALCULATION FUNCTIONS

// Function to calculate projected price
function CalculatePrice(score1, score2, projected_score, curr_price, index) {
    console.log(`CalculatePrice(${score1}, ${score2}, ${projected_score}, ${curr_price}, ${index})`);

    // Calculate the projected price based on the given formula
    const three_rd_avg = (score1 + score2 + projected_score) / 3;
    let newPrice;

    if (MN_approximation_true) {
        newPrice = (curr_price * 0.75) + ((three_rd_avg * curr_magic_num * magic_number_percentages[index]) / 4);
    } else {
        newPrice = (curr_price * 0.75) + ((three_rd_avg * curr_magic_num) / 4);
    }

    // Round the result to the nearest $100
    return Math.round(newPrice / 100) * 100;
}


// function to calculate current magic number based on website BEs
function CalculateMagicNumber (score1, score2, player_price, breakeven){
    var magic_number = ((player_price * 3)/(breakeven + (score1+score2)));
    return magic_number
}

// function to calculate new Breakevens 
function CalculateBE(score1, score2, player_price){
    var breakeven = ((player_price * 3)/curr_magic_num)-(score1+score2);
    return breakeven;
}



// TABLE HEADER ADDING FUNCTIONS

function add_proj_headers(targetDiv) {
    // Clear Header text to save some space
    // const firstTextNode = targetDiv.childNodes[0]; 
    // if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
    //     firstTextNode.textContent = firstTextNode.textContent.replace("Season Stats - ", "").trim();
    // }

     // First, ensure FontAwesome is loaded if not already present
     if (!document.querySelector('link[href*="fontawesome"]')) {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);
    }

    
    // Ensure the main header container is added only once
    if (!proj_header_added) {
        const headerContainer = document.createElement('span');
        headerContainer.classList.add('proj-header-container', 'SCproj-injected');
        targetDiv.appendChild(headerContainer);
        proj_header_added = true;

        // Create MN Approximation toggle button
        const mnToggleButton = document.createElement('button');
        mnToggleButton.textContent = 'MN APPROX';
        mnToggleButton.classList.add('mn-toggle-button');
        mnToggleButton.classList.toggle('active', MN_approximation_true);
        mnToggleButton.style.backgroundColor = MN_approximation_true ? 'rgb(160, 212, 76)' : 'gray';

        mnToggleButton.addEventListener('click', () => {
            MN_approximation_true = !MN_approximation_true;
            mnToggleButton.classList.toggle('active', MN_approximation_true);
            mnToggleButton.style.backgroundColor = MN_approximation_true ? 'rgb(160, 212, 76)' : 'gray';
            console.log(`MN_approximation_true set to: ${MN_approximation_true}`);
        });
 

        // Adding the input field  
        const inputField = document.createElement('input');
        inputField.type = 'number';
        inputField.placeholder = 'ALL';
        inputField.classList.add('set-all-input');
        inputField.addEventListener('input', () => {
            let value = parseInt(inputField.value) || 0; 
            value = Math.min(300, Math.max(-100, value));
            inputField.value = value; 

            document.querySelectorAll('.custom-input').forEach(input => {
                input.value = value;
                input.dispatchEvent(new Event('input')); // Trigger input event
            });

            // Also update the Round 0 input field
            const rd0Input = document.querySelector('.rd0-score-input');
            if (rd0Input) {
                rd0Input.value = value;
                rd0Input.dispatchEvent(new Event('input')); // Trigger input event
            }
        });


        // Adding the clear button with FontAwesome icon
        const clearButton = document.createElement('button');
        const iconElement = document.createElement('i');
        iconElement.className = 'fa-solid fa-rotate'; 
        clearButton.appendChild(iconElement);
        clearButton.classList.add('clear-button');
        clearButton.addEventListener('click', () => {
             inputField.value = ''; // Clear the ALL input field
             document.querySelectorAll('.custom-input').forEach((input, index) => {
                 if (original_projected_scores[index] !== undefined) {
                     input.value = original_projected_scores[index]; // Reset to original value
                     input.dispatchEvent(new Event('input')); // Trigger input event
                 }
             });
             console.log('All inputs reset to original values.');
         });
         


        // Adding the projection button  
        const projButton = document.createElement('button');
        projButton.textContent = 'PROJECT';
        projButton.classList.add('projection-button');
        projButton.addEventListener('click', () => {
            console.log('Projection button clicked, updating prices...');
            updateProjectionTable(true);
        });


        // append the children element
        headerContainer.appendChild(mnToggleButton);
        headerContainer.appendChild(inputField);
        headerContainer.appendChild(clearButton);
        headerContainer.appendChild(projButton);
    }
}


function add_rd0_headers(targetDiv, rd0Opponent, firstRow) {
    console.log('Attempting to add Round 0 headers...');

    const price_element = firstRow.querySelector('[col-id="pp"]');
    const player_init_price = price_element ? parseFloat(price_element.innerText.replace(/[^\d.]/g, '')) : 0;
    const player_init_price_int = parseInt(player_init_price*1000);

    const player_init_avg = player_init_price_int/curr_magic_num;

    // Ensure the rd0 header container is added only once
    if (!rd0_header_added) {
        // console.log('Creating Round 0 header container...');
        const rd0Container = document.createElement('div');
        rd0Container.classList.add('rd0-container', 'SCproj-injected');
        targetDiv.appendChild(rd0Container);
        rd0_header_added = true;

        // Text div that states "Round 0:"
        // console.log('Adding Round 0 label...');
        const round0Text = document.createElement('div');
        round0Text.classList.add('rd0-label');
        round0Text.textContent = 'Rd 0 opponent:';
        rd0Container.appendChild(round0Text);

        // Team Flag SVG
        // console.log(`Creating SVG element for: ${rd0Opponent}`);
        const teamFlag = document.createElement('div');
        teamFlag.classList.add('vm-TeamFlagComponent', 'vm-TeamFlagComponent--small');

        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("viewBox", "0 0 24 24");
        svgElement.classList.add('ng-star-inserted');


        const useElement = document.createElementNS("http://www.w3.org/2000/svg", "use");
        useElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${rdOpponentSVGMapping[rd0Opponent]}_afl`);
        // useElement.setAttribute("xlink:href", `#${rdOpponentSVGMapping[rd0Opponent]}_afl`);

        svgElement.appendChild(useElement);
        teamFlag.appendChild(svgElement);
        rd0Container.appendChild(teamFlag);
      

        // Team abbreviation span
        // console.log(`Adding team abbreviation: ${rd0Opponent}`);
        const teamAbbrev = document.createElement('span');
        teamAbbrev.classList.add('vm-PlayerSeasonRdOppAg-teamAbbrev', 'ng-star-inserted');
        teamAbbrev.textContent = rd0Opponent;
        rd0Container.appendChild(teamAbbrev);


        // Venue display div
        // console.log('Adding Round 0 label...');
        const round0Venue = document.createElement('div');
        round0Venue.classList.add('rd0-venue');
        round0Venue.textContent = 'at ' + rd0VenueMapping[rd0Opponent];
        rd0Container.appendChild(round0Venue);


        // Input for first player score
        // console.log('Creating first player score input field...');
        const rd0ScoreInput = document.createElement('input');
        rd0ScoreInput.type = 'number';
        rd0ScoreInput.value = Math.round(player_init_avg); // Set initial value
        rd0ScoreInput.classList.add('rd0-score-input');
        rd0ScoreInput.addEventListener('input', () => {
            let value = parseInt(rd0ScoreInput.value) || 0;
            value = Math.min(300, Math.max(-100, value));
            rd0ScoreInput.value = value; 
            player_scores[0] = value;
        });

         // set player_prices[0] to the inital price
        player_prices[0] = player_init_price_int;
        

        // Append elements
        // console.log('Appending first player input to Round 0 container...');
        rd0Container.appendChild(rd0ScoreInput);

        console.log('Round 0 headers successfully added.');
    } else {
        console.log('Round 0 header container already exists. Skipping creation.');
    }
}



// PROJECTED DATA UPDATING FUNCITONS

function add_proj_points(element, index) {
    // First, save all the original attributes and styles
    const originalAttributes = {};
    for (let attr of element.attributes) {
        originalAttributes[attr.name] = attr.value;
    }
    const originalStyle = element.getAttribute('style');
    const originalClasses = element.className;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'number';
    input.value = element.innerText;
    input.setAttribute('col-id', 'custom-ppts');
    input.classList.add('custom-input', 'SCproj-injected');
    
    // Style the input to fit within the cell
    input.style.width = '100%';
    input.style.height = '100%';
    input.style.padding = '0';
    input.style.margin = '0';
    input.style.border = 'none';
    input.style.backgrd = 'transparent';
    input.style.textAlign = 'inherit';
    input.style.fontSize = 'inherit';
    input.tabIndex = 0;
    input.style.userSelect = 'text';

    // Event listeners
    input.addEventListener('keydown', (event) => {
        let currentValue = parseInt(input.value) || 0;

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            input.value = Math.min(300, currentValue + 1);
            triggerInputChange(input);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            input.value = Math.max(-100, currentValue - 1);
            triggerInputChange(input);
        }
    });

    input.addEventListener('input', () => {
        // player_scores[index] = parseInt(input.value) || 0;
        let value = parseInt(input.value) || 0;
        if (value < -100) value = -100;
        if (value > 300) value = 300;

        input.value = value;
        player_scores[index] = value;

    });

    // Helper function to trigger input event
    function triggerInputChange(input) {
        const event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });
        input.dispatchEvent(event);
    }

    // Clear the element's content while preserving its structure
    element.innerHTML = '';
    
    // Create a wrapper div to maintain the AG Grid cell structure
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.appendChild(input);
    
    // Add wrapper to the element
    element.appendChild(wrapper);
    
    // Ensure all original AG Grid classes and attributes are preserved
    element.className = originalClasses;
    for (let [name, value] of Object.entries(originalAttributes)) {
        if (name !== 'class') { // Skip class as we already set it
            element.setAttribute(name, value);
        }
    }
    
    // Reapply the original style
    if (originalStyle) {
        element.setAttribute('style', originalStyle);
    }
}

function add_proj_price(element, newPrice) {
    if (element && element.nodeType === Node.ELEMENT_NODE) {
        // Set the new price as the text content of the existing element
        element.innerText = `$${(newPrice / 1000).toFixed(1)}k`;

        // // Optionally, you can add a class or style to the element if needed
        // element.classList.add('SCproj-injected');
    } else {
        console.error('Invalid element passed to update_proj_price:', element);
    }
}

function add_ppc(ppc_element, new_price, old_price){
    const price_diff = new_price - old_price; 
    let price_diff_display = '';
    let price_diff_color = 'rgb(192,132,12)';

    // If the price difference is greater than 1000, format it as a "k" value
    if (Math.abs(price_diff) > 1000) {
        const price_diff_in_k = (price_diff / 1000).toFixed(1); 
        price_diff_display = `$${price_diff_in_k}k`; 
    } else {
        // If the price difference is in the hundreds or less, rd to nearest 100
        const price_diff_rded = Math.round(price_diff / 100) * 100;
        price_diff_display = `$${Math.abs(price_diff_rded).toLocaleString()}`; 
    }

    // Determine color based on price change
    if (price_diff > 0) {
        price_diff_color = 'rgb(160, 212, 76)';
    } else if (price_diff < 0) {
        price_diff_color = 'rgb(220,52,44)';
        price_diff_display = `-${price_diff_display}`; // Prepend minus sign
    }

    // Update the ppc element with the price difference and color
    if (ppc_element) {
        const salaryChangeDiv = ppc_element.querySelector('.vm-SalaryChangeComponent');
        if (salaryChangeDiv) {
            salaryChangeDiv.textContent = price_diff_display;

            // Apply color based on price change
            salaryChangeDiv.style.color = price_diff_color;
        }
    }
}

// helper function to replace Breakeven projections
function add_BE(element, breakeven) {
    // rd the breakeven value to the nearest whole number
    const rdedBreakeven = Math.round(breakeven);

    // Access the first child node of the BE element (the <div> containing the BE value)
    const beDiv = element.childNodes[0];  // This should point to the <div> containing the BE value
    if (beDiv) {
        // Directly update the text content of the first child (the <span>)
        beDiv.textContent = `${rdedBreakeven}`;  // Update the breakeven value
    }
}







// // first called function to initialize arrays with current price, Breakeven & 2 most recent scores   
// function readYTDTable() {
//     console.log('=================');
//     console.log('Reading YTD table');
//     const seasonGrid = document.querySelector('vm-player-season-grid');
//     seasonGrid ? (() => {
//         if (!scores_read) {

//             const container = seasonGrid.querySelector('.ag-center-cols-container');
//             container ? (() => {
//                 const rows = Array.from(container.querySelectorAll('[role="row"]')).reverse();

//                 if (rows.length >= 2) {
//                     // Extract values from the last two rows (two most recent games)
//                     const priceRow = rows[0].querySelector('[col-id="Summary__price"] span');
//                     const score1Row = rows[1].querySelector('[col-id="points"]');
//                     const score2Row = rows[0].querySelector('[col-id="points"]');

//                     // read player's 2 most recent scores & initialize scores array
//                     let score1 = score1Row ? parseInt(score1Row.innerText) : 0;
//                     let score2 = score2Row ? parseInt(score2Row.innerText) : 0;
//                     console.log('Score 1:', score1);
//                     console.log('Score 2:', score2);
//                     player_scores = [score1, score2];

//                     // read player price and initialize price array 
//                     let player_price = priceRow ? parseFloat(priceRow.innerText.replace(/[^\d.]/g, '')) : 0;
//                     let player_price_int = parseInt(player_price*1000);
//                     console.log('Player Price (int):', player_price_int);
//                     player_prices = [player_price_int];

//                     // WE DONT NEED FIRST BE  WE CAN JUST CALCULATE IT IN PROJECTION TABLE
//                     // Calculate new BE and initialize BE array 
//                     // breakeven = CalculateBE(score1, score2, player_price_int);
//                     // console.log('calculated breakeven: ', breakeven);
//                     // player_BEs = [breakeven];
                    
//                 } else {
//                     console.log('Not enough rows found in the container.');
//                 }
//                 scores_read = true;
//             })() : console.error('"ag-center-cols-container" not found.');
//         }
//     })() : scores_read = false;

//     console.log('Player scores: ', player_scores);
// }

// Function to initialize arrays with current price, Breakeven & 2 most recent scores

function readYTDTable() {
    const seasonGrid = document.querySelector('vm-player-season-grid');
    seasonGrid ? (() => {
        if (!scores_read) {
            const container = seasonGrid.querySelector('.ag-center-cols-container');
            container ? (() => {

                const rows = Array.from(container.querySelectorAll('[role="row"]'));
                console.log('Reading the YTD table for data');
                let foundValidScores = false;

                for (const row of rows) {
        
                    const scoreRow = row.querySelector('[col-id="points"]');
                    const player_score = scoreRow ? parseInt(scoreRow.innerText) : NaN;

                    const priceRow = row.querySelector('[col-id="Summary__price"] span');
                    const player_price = priceRow ? parseFloat(priceRow.innerText.replace(/[^\d.]/g, '')) : NaN;
                    const player_price_int = isNaN(player_price) ? NaN : parseInt(player_price * 1000); // Convert price to integer
        
                    if (!isNaN(player_price_int) && !isNaN(player_score)) { 
                        player_scores.push(player_score); 
                        player_prices.push(player_price_int);
                        games_played++;
                        console.log(`Game ${games_played} Score: ${player_score}, Price: ${player_price_int}`);
                        foundValidScores = true;
                    }
                }

                scores_read = foundValidScores;
                console.log('Player Scores: ', player_scores);
                console.log('Player Prices: ', player_prices);
                
                // if (rows.length > 0) {
                //     rows.forEach((row, index) => {
                //         // Get player past scores 
                //         const scoreRow = row.querySelector('[col-id="points"]');
                //         const player_score = scoreRow ? parseInt(scoreRow.innerText) : 0;
                //         player_scores.push(player_score);
                //         console.log(`Row ${index + 1} - Player Score: ${player_score}`);

                //         // TODO: NEED TO SET MOST RECENT PRICE AS PLAYER_PRICES[0]
                //         // Loop through previous games, skipping any DNPs, to find two most recent score and price
                //         // for each non-DNP game (up to 2), games_played++;

                //         // Get player historic prices 
                //         const priceRow = row.querySelector('[col-id="Summary__price"] span');
                //         const player_price = priceRow ? parseFloat(priceRow.innerText.replace(/[^\d.]/g, '')) : 0;
                //         const player_price_int = parseInt(player_price * 1000); // Convert price to integer
                //         player_prices.push(player_price_int);
                //         console.log(`Row ${index + 1} - Player Price: ${player_price_int}`);

                //         // Get previous breakeven values 
                //         const BE_element = row.querySelector('[col-id="be"] div');
                //         let curr_BE = 0;
                //         if (BE_element && BE_element.childNodes.length > 0) {
                //             curr_BE = parseInt(BE_element.childNodes[0].textContent.trim());
                //             player_BEs.push(curr_BE);
                //             console.log(`Row ${index + 1} - Breakeven: ${curr_BE}`);
                //         } else {
                //             console.log(`BE element's child node not found for Row ${index + 1}.`);
                //             player_BEs.push(0); // Push 0 if BE value is not found
                //         }
                //     });
                // } else {
                //     console.log('Not enough rows found in the container.');
                // }

                
            })() : console.warn('"ag-center-cols-container" not found.');
        }
    })() : scores_read = false;
}





// general projection table updater function
function updateProjectionTable(update_prices) {
    const fixtureGrid = document.querySelector('vm-player-upcoming-fixture-grid');
    fixtureGrid ? (() => {
        
        const container = fixtureGrid.querySelector('.ag-center-cols-container');
        container ? (() => {
            
            // TODO: if we find the container, then keep up the polling, if we don't then run the cleanup?
            
            const rows = container.querySelectorAll('[role="row"]');
            rows.length > 0 ? (() => {

                // // use rows[0]'s Breakeven & out yearTable data to calculate current magic number
                // const curr_BE_element = rows[0].querySelector('[col-id="be"] div');
                // if (curr_BE_element && curr_BE_element.childNodes.length > 0) {
                //     curr_BE = parseInt(curr_BE_element.childNodes[0].textContent.trim());
                //     // curr_magic_num = CalculateMagicNumber(player_scores[0], player_scores[1], player_prices[0], curr_BE);
                //     console.log('curr_BE: ', curr_BE);
                //     console.log('calculated curr_magic_num: ', curr_magic_num);
                // } else {
                //     console.log('First BE element or its child node not found.');
                // }
                if (!proj_points_replaced) {
                    initialFixtureUpdate(fixtureGrid, rows);

                } else if (update_prices){ 
                    updateFixtureRows(rows);
                }

            })() : console.log('No rows found in the container.');
        })() : console.warn('Container element with class "ag-center-cols-container" not found.');
    })() : proj_points_replaced = false;
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

    // let index_offset = plays_rd0 ? 1 : 0;
    let index_offset = games_played;
    // need to increment this by games played
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
}

// function called when we project scores to update the table's projected data
function updateFixtureRows(rows){
    // clear the player prices but keep reference
    // player_prices.length = 0;
    
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
        console.log('Player Price (int):', player_price_int);

        
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

                const new_BE = CalculateBE(prev_score1, prev_score2, new_price);
                console.log(`New BE calculated: ${new_BE}`);
                add_BE(BE_element, new_BE);
                player_BEs.push(new_BE);
                
            }
        } else {
            console.log(`Projected Points or Price Element not found in row ${index}`);
        }
        
    });
    console.log(`player_scores: ${player_scores}`);
    console.log(`player_prices: ${player_prices}`);
}





// URL CHANGE CLEANUP 

// Store the initial URL
let previousUrl = window.location.href;
let updateIntervalId; 

// Function to check for URL changes
function checkUrlChange() {
    const currentUrl = window.location.href;
    if (currentUrl !== previousUrl) {
        previousUrl = currentUrl;
        console.log('URL has changed:', currentUrl);
        resetPlayerBools();
        cleanUpCustomElements();
        resetUpdateInterval();
    }
}

function resetPlayerBools(){
    console.log("Resetting player booleans...");
    proj_points_replaced = false;
    scores_read = false;
    proj_button_added = false;
    proj_header_added = false;
    rd0_header_added = false;
    plays_rd0 =false;
    rd0Opponent = '';
    games_played = 0;
    player_scores.length=0;
    player_prices.length=0;
    original_projected_scores.length=0;
}

// Function to remove previously injected elements
function cleanUpCustomElements() {
    console.log("Cleaning up old injected elements...");
    
    // Remove all elements with SCproj-injected class (including custom buttons)
    document.querySelectorAll(".SCproj-injected").forEach(element => {
        // Check if it's a button and remove it, if present
        if (element.classList.contains('projection-button')) {
            console.log("found button for removal");
            element.remove();
        } else if (element.classList.contains('rd0-container')) {
            console.log("found rd0container for removal");
            element.remove();
        } else {
            element.remove();
        }
    });
}

// Function to start polling for projection table updates
function startUpdateInterval() {
    // Clear any existing interval before starting a new one
    clearInterval(updateIntervalId);

    updateIntervalId = setInterval(() => {
        if (!proj_points_replaced || !scores_read) {
            console.log("Polling for table updates...");
            readYTDTable();
            updateProjectionTable(false);
        } else {
            console.log("Stopping polling as proj_points_replaced is true");
            clearInterval(updateIntervalId);
        }
    }, 500);
}

// Function to reset the interval when the URL changes
function resetUpdateInterval() {
    console.log("Resetting update interval...");
    clearInterval(updateIntervalId); 
    startUpdateInterval(); 
}


// Start polling for URL changes
setInterval(checkUrlChange, 400);
startUpdateInterval();
