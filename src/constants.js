// HARD-CODED MAGIC NUMBER DECREASE PERENTAGES
// roughly extrapolated averages from the data sampled from this post:  
// https://x.com/bricemitchell/status/1658093613841100800/photo/1  
const magic_number_percentages = [
    1, 1, 0.990, 0.944, 0.941, 0.943, 0.944, 0.938, 0.936, 0.930,
    0.921, 0.921, 0.920, 0.922, 0.927, 0.923, 0.919, 0.914, 0.912,
    0.913, 0.912, 0.919, 0.916, 0.913
];

// Round 0 mappings
const rdOpponentMapping = {
    'BRL': 'HAW', 'ESS': 'SYD',
    'HAW': 'GCS', 'WCE': 'ESS',
    'MEL': 'COL', 'PTA': 'GWS'
};

const rd0VenueMapping = {
    'GEE': 'G  ', 'BRL': 'G  ',
    'HAW': 'SCG', 'SYD': 'SCG',
    'GCS': 'PFS', 'ESS': 'PFS',
    'COL': 'ENS', 'GWS': 'ENS'
};

const rdOpponentSVGMapping = {
    'GEE': 'Geelong',     'BRL': 'Brisbane',
    'HAW': 'Hawthorn',    'SYD': 'Sydney',
    'GCS': 'Gold_Coast',  'ESS': 'Essendon',
    'COL': 'Collingwood', 'GWS': 'GWS_Giants'
};
