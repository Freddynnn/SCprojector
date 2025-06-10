console.log("content.js loaded");

// == color changing to match light/darkmode ==
function updateInputTextColorFromRow() {
    const sampleRow = document.querySelector('.ag-center-cols-container .ag-row');
    if (!sampleRow) return;

    const rowTextColor = getComputedStyle(sampleRow).color;
    const isDarkMode = rowTextColor === 'rgb(255, 255, 255)';
    const bgColor = isDarkMode
        ? 'rgba(184, 227, 124, 0.65)'
        : 'rgba(184, 227, 124, 0.45)';

    const targetColor = isDarkMode ? 'white' : 'black';
    const placeholderColor = isDarkMode ? 'white' : 'gray';

    document.querySelectorAll('.custom-input, .set-all-custom-input').forEach(input => {
        input.style.color = targetColor;
        input.style.backgroundColor = bgColor;
    });

    // Dynamically update placeholder color using a CSS rule
    let styleEl = document.getElementById('dynamic-placeholder-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-placeholder-style';
        document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
        .custom-input::placeholder,
        .set-all-custom-input::placeholder {
            color: ${placeholderColor} !important;
            opacity: 1 !important;
        }
    `;

}

updateInputTextColorFromRow();
setInterval(updateInputTextColorFromRow, 500);

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
    MN_approximation_true = false;
    settings_toggled_true = false;
    plays_rd0 =false;
    rd0Opponent = '';
    games_played = 0;
    player_scores.length=0;
    player_prices.length=0;
    player_BEs.length=0;
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

function startUpdateInterval() {
    clearInterval(updateIntervalId); // in case it was already running

    updateIntervalId = setInterval(() => {
        console.log("Polling for table updates...");

        const seasonGrid = document.querySelector('vm-player-season-grid');
        const fixtureGrid = document.querySelector('vm-player-upcoming-fixture-grid');

        const seasonContainer = seasonGrid?.querySelector('.ag-center-cols-container');
        const fixtureContainer = fixtureGrid?.querySelector('.ag-center-cols-container');

        const seasonRows = seasonContainer ? seasonContainer.querySelectorAll('[role="row"]') : [];
        const fixtureRows = fixtureContainer ? fixtureContainer.querySelectorAll('[role="row"]') : [];

        if (seasonRows.length === 0) {
            // console.log("YTD table cleared or not found — resetting scores_read");
            scores_read = false;
        }

        if (fixtureRows.length === 0) {
            // console.log("Fixture table cleared or not found — resetting proj_points_replaced");
            proj_points_replaced = false;
            proj_header_added = false;
        }

        // Re-run logic every poll, but only update fully if not already done
        readYTDTable();
        updateProjectionTable(!proj_points_replaced && scores_read);

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