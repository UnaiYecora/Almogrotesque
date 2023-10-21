/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { db } from "./db.js";
import { rand, wait } from "./helpers.js";

/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ··························  F U N C T I O N S  ···························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Generate playing disc
/*===========================================================================*/
export async function generatePlayingDisc(cardId, discId) {
    return new Promise(async (resolve, reject) => {
        try {

            // Get data
            const [colorArray, segmentSizes] = await generateDiscData(cardId);

            // Container
            const container = document.getElementById(discId);
            if (!container) throw new Error("Disc container not found");

            // Clear previous content
            container.innerHTML = '';

            // Create the disc element
            const disc = document.createElement('div');
            disc.classList.add('disc');

            // Format colors and percentages for the conic gradient
            const conicGradient = generateConicGradient(colorArray, segmentSizes, false);
            disc.style.backgroundImage = conicGradient;

            // Add the disc to the container
            container.appendChild(disc);

            // Add arrow
            if (!container.querySelector(".arrow")) {
                const arrow = document.createElement("div");
                arrow.classList.add("arrow");
                arrow.style.transform = "translate(-50%, -100%) rotate(0deg)";
                container.appendChild(arrow);
            }

            // Include data in disc dataset
            container.dataset.discdata = JSON.stringify(segmentSizes);
            container.dataset.cardid = cardId;

            resolve();
        } catch (error) {
            console.log("An error occurred when generating a disc for " + discId + ": " + error.message);
            reject(error);
        }
    });
}

/*===========================================================================*/
// Generate basic card disc indicator
/*===========================================================================*/
export function generateCardDisc(cardId) {
    return new Promise(async (resolve, reject) => {
        try {

            // Get data
            const [colorArray, segmentSizes] = await generateDiscData(cardId);
            const conicGradient = generateConicGradient(colorArray, segmentSizes, true);

            // Disc HTML
            let discHTML = `<div class="disc-indicator" style="background-image:${conicGradient}"></div>`;

            resolve(discHTML);
        } catch (error) {
            console.log("An error occurred generating basic disc indicator in card: " + error.message);
            reject(error);
        }
    });
}

/*===========================================================================*/
// Generate disc data
/*===========================================================================*/
export function generateDiscData(cardId) {
    return new Promise((resolve, reject) => {
        try {

            // Get data
            const hitrate = [...db.cards[cardId].hitrate];
            const colors = [...db.cards[cardId].colors];

            // Total segment size (100 to use percentage based numbers)
            const totalSize = 100;

            // Ensure the first segment is not too large
            //hitrate[0] = Math.min(hitrate[0], totalSize - 5);

            // Calculate segment sizes
            const dataSum = hitrate.reduce((acc, num) => acc + num, 0);
            const segmentRest = totalSize - dataSum;
            let segmentSizes;
            if (segmentRest > 0) {
                segmentSizes = [segmentRest, ...hitrate];
            } else {
                segmentSizes = [...hitrate];
            }

            // Colors
            let colorArray;
            if (colors) {
                colorArray = colors;
            } else {
                colorArray = ["#000", "#dbdbdb", '#6C6C6C'];
            }

            resolve([colorArray, segmentSizes]);
        } catch (error) {
            console.log("An error occurred generating disc segments and colors: " + error.message);
            reject(error);
        }
    });
}

/*===========================================================================*/
// Generate conic gradients for discs
/*===========================================================================*/
export function generateConicGradient(colors, percentages, card) {
    if (colors.length !== percentages.length) {
        throw new Error("Colors and percentages arrays must have the same length.");
    }

    const stops = [];
    let offset = 0;
    for (let i = 0; i < colors.length; i++) {
        if (card && colors[i] === "#000") {
            colors[i] = "#0000";
        }
        stops.push(`${colors[i]} ${offset}deg`);
        offset += (360 * percentages[i]) / 100;
        stops.push(`${colors[i]} ${offset}deg`);
    }

    return `conic-gradient(${stops.join(', ')})`;
}


/*===========================================================================*/
// Spin card disc
/*===========================================================================*/
export async function spin(discId) {
    return new Promise(async (resolve, reject) => {
        try {
            const arrow = document.querySelector("#" + discId + " .arrow");
            let r = parseFloat(arrow.style.transform.match(/rotate\((.+)\)/)[1]);

            const extraSpins = await rand(1, 4);

            r += (await rand(0, 360)) + (360 * extraSpins);
            arrow.style.transform = "translate(-50%, -100%) rotate(" + r + "deg)";

            // Results
            let newRotation = arrow.style.transform.match(/rotate\((.+)\)/)[1];
            let degreesRotated = parseInt(newRotation, 10) % 360;

            await wait(1500);
            const results = await logResults(discId, degreesRotated);
            resolve(results);
        } catch (error) {
            reject(error);
        }
    })
}


/*===========================================================================*/
// Log disc results
/*===========================================================================*/
async function logResults(discId, degreesRotated) {
    return new Promise((resolve, reject) => {
        try {
            const data = JSON.parse(document.getElementById(discId).getAttribute('data-discdata'));
            let sum = data.reduce((a, b) => a + b);
            let cumulativeDegrees = 0;
            let r = 1;

            for (let i = 0; i < data.length; i++) {
                let segmentDegrees = (data[i] * 360) / sum;

                if (degreesRotated >= cumulativeDegrees) {
                    r = i + 1;
                }

                cumulativeDegrees += segmentDegrees;
            }

            resolve(r);
        } catch (error) {
            console.log("An error occurred trying to get attack results: " + error.message);
            reject(error);
        }
    })
}