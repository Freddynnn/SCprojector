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

        // Create Settings button
        const settingsButton = document.createElement('button');
        const settingsIcon = document.createElement('i');
        settingsIcon.className = 'fa-solid fa-gear';
        settingsButton.appendChild(settingsIcon);
        settingsButton.classList.add('settings-button');
        settingsButton.classList.toggle('active', settings_toggled_true);
        settingsButton.style.backgroundColor = settings_toggled_true ? 'rgb(160, 212, 76)' : 'gray';
        
        // Create dropdown container
        const settingsDropdown = document.createElement('div');
        settingsDropdown.classList.add('settings-dropdown', 'SCproj-injected');
        settingsDropdown.style.maxHeight = '0px'; // Start collapsed
        settingsDropdown.style.overflow = 'hidden';
        settingsDropdown.style.transition = 'max-height 0.3s ease-in-out';

        // Toggle dropdown visibility & settings button colour
        settingsButton.addEventListener('click', () => {
            settings_toggled_true = !settings_toggled_true;
            settingsButton.classList.toggle('active', settings_toggled_true);
            settingsButton.style.backgroundColor = settings_toggled_true ? 'rgb(160, 212, 76)' : 'gray';
            console.log(`settings_toggled_true set to: ${settings_toggled_true}`);

            if (settingsDropdown.style.maxHeight === '0px') {
                settingsDropdown.style.maxHeight = settingsDropdown.scrollHeight + 15 + 'px';
            } else {
                settingsDropdown.style.maxHeight = '0px';
            }
        });

        // Create container for the label and checkbox
        const mnToggleContainer = document.createElement('div');
        mnToggleContainer.classList.add('mn-toggle-container');

        // Create label
        const mnLabel = document.createElement('label');
        mnLabel.textContent = 'Magic Number Approximation: ';
        mnLabel.classList.add('mn-label');

        // Create checkbox
        const mnCheckbox = document.createElement('input');
        mnCheckbox.type = 'checkbox';
        mnCheckbox.checked = MN_approximation_true;
        mnCheckbox.classList.add('mn-checkbox');

        // Toggle state when checkbox changes
        mnCheckbox.addEventListener('change', () => {
            MN_approximation_true = mnCheckbox.checked;
            console.log(`MN_approximation_true set to: ${MN_approximation_true}`);
        });

        // Append elements to the container
        mnToggleContainer.appendChild(mnLabel);
        mnToggleContainer.appendChild(mnCheckbox);

        // MAGIC NUMBER INPUT
        // Create container for Magic Number input
        const mnInputContainer = document.createElement('div');
        mnInputContainer.classList.add('mn-input-container');

        // Create label
        const mnInputLabel = document.createElement('label');
        mnInputLabel.textContent = 'Magic Number: ';
        mnInputLabel.setAttribute('for', 'mn-input');

        // Create Magic Number Input Field
        const mnInput = document.createElement('input');
        mnInput.type = 'number';
        mnInput.id = 'mn-input';
        mnInput.placeholder = 'Enter value';
        mnInput.classList.add('mn-input');
        mnInput.value = curr_magic_num || 0;
        mnInput.addEventListener('input', () => {
            curr_magic_num = parseInt(mnInput.value) || 0;
            // console.log(`Magic Number updated to: ${curr_magic_num}`);
        });

        

        // Create Reset Button (X)
        const resetButton = document.createElement('button');
        resetButton.textContent = 'X';
        resetButton.classList.add('reset-button');
        resetButton.addEventListener('click', () => {
            curr_magic_num = base_magic_num; // Reset to the base magic number
            mnInput.value = curr_magic_num; // Update input field with the base value
            // console.log(`Magic Number reset to base value: ${curr_magic_num}`);
        });

        // Append elements
        mnInputContainer.appendChild(mnInputLabel);
        mnInputContainer.appendChild(mnInput);
        mnInputContainer.appendChild(resetButton); // Add the reset button


 

        // Adding the input field  
        const inputFieldContainer = document.createElement('div');
        inputFieldContainer.classList.add('set-all-custom-input-container');
        inputFieldContainer.style.display = 'flex';
        inputFieldContainer.style.alignItems = 'center';
        inputFieldContainer.style.gap = '4px';

        // Create the input field
        const inputField = document.createElement('input');
        inputField.type = 'number';
        inputField.placeholder = 'ALL';
        inputField.classList.add('set-all-custom-input');

        // Handle input manually
        inputField.addEventListener('input', () => {
            let value = parseInt(inputField.value) || 0; 
            value = Math.min(300, Math.max(-100, value));
            inputField.value = value; 

            document.querySelectorAll('.custom-input').forEach(input => {
                input.value = value;
                input.dispatchEvent(new Event('input'));
            });

            const rd0Input = document.querySelector('.rd0-score-input');
            if (rd0Input) {
                rd0Input.value = value;
                rd0Input.dispatchEvent(new Event('input'));
            }
        });

        // Create increment (↑) button
        const incButton = document.createElement('button');
        incButton.innerHTML = '↑';
        incButton.classList.add('spinner-button');
        incButton.addEventListener('click', () => {
            let value = parseInt(inputField.value) || 0;
            value = Math.min(300, value + 1);
            inputField.value = value;
            inputField.dispatchEvent(new Event('input'));
        });

        // Create decrement (↓) button
        const decButton = document.createElement('button');
        decButton.innerHTML = '↓';
        decButton.classList.add('spinner-button');
        decButton.addEventListener('click', () => {
            let value = parseInt(inputField.value) || 0;
            value = Math.max(-100, value - 1);
            inputField.value = value;
            inputField.dispatchEvent(new Event('input'));
        });

        // Append input + spinners
        inputFieldContainer.appendChild(decButton);
        inputFieldContainer.appendChild(inputField);
        inputFieldContainer.appendChild(incButton);


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
        settingsDropdown.appendChild(mnToggleContainer);
        settingsDropdown.appendChild(mnInputContainer);

        headerContainer.appendChild(settingsButton);
        // headerContainer.appendChild(inputFieldContainer);
        headerContainer.appendChild(inputField);
        headerContainer.appendChild(clearButton);
        headerContainer.appendChild(projButton);
        targetDiv.appendChild(settingsDropdown);

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

    
    //TODO: THIS IS FOR SKIPPING GAMES (INJ OR SUSPENSION)
    // // Create "X" button
    // const resetButton = document.createElement('button');
    // resetButton.textContent = 'X';
    // resetButton.classList.add('reset-button');
    // resetButton.style.position = 'relative'; // Ensure it respects z-index
    // resetButton.style.zIndex = '999'; // Bring it to the front
    // resetButton.style.background = 'red'; // Just to make it clearly visible
    // resetButton.style.cursor = 'pointer';
    // resetButton.style.border = 'none';
    // resetButton.style.background = 'gray';
    // resetButton.style.color = 'white';
    // resetButton.style.fontSize = '12px';
    // resetButton.style.borderRadius = '5px';
    // resetButton.style.padding = '2px 5px';
    // resetButton.style.transition = 'background-color 0.2s ease-in-out';

    // // Handle greying out input and skipping calculations
    // resetButton.addEventListener('click', () => {
    //     if (!input.disabled) {
    //         input.disabled = true;
    //         input.value = '-';
    //         input.style.background = 'lightgray';
    //         input.style.color = 'gray';
    //         player_scores[index] = null; // Mark as skipped in calculations
    //     } else {
    //         input.disabled = false;
    //         input.value = ''; // Reset input
    //         input.style.background = 'transparent';
    //         input.style.color = 'black';
    //         player_scores[index] = parseInt(input.value) || 0;
    //     }
    // });

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
    wrapper.style.justifyContent = 'space-between'; 
    wrapper.style.gap = '8px'; 
    
    // Add input and reset button to the wrapper
    wrapper.appendChild(input);
    // wrapper.appendChild(resetButton);

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