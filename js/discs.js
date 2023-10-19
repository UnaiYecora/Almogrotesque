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
// Generate card disc
/*===========================================================================*/
export async function generateDisc(cardId, discId) {
    return new Promise((resolve, reject) => {
        try {

            // Get data
            const hitrate = db.cards[cardId].hitrate;
			const colors = db.cards[cardId].colors;

            // SVG size
            const svgSize = 100;

            // Final segment array (adding to 100)
            hitrate[0] = Math.min(hitrate[0], 95); // TO-DO: Also avoid < 5%

            const dataSum = hitrate.reduce((acc, num) => acc + num, 0);
            const segmentRest = 100 - dataSum;
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
    
            
            const container = document.getElementById(discId);
            if (!container) throw new Error("SVG not found");

            if (container.querySelector("svg")) {
                container.querySelector("svg").remove();
            }

            // Create svg
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", svgSize + "%");
            svg.setAttribute("height", svgSize + "%");
            svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);
    
            const total = segmentSizes.reduce((a, b) => a + b, 0);
            if (total <= 0 || total > 100) throw new Error("Total segment size is invalid");
    
            const centerX = svgSize / 2;
            const centerY = svgSize / 2;
            const radius = Math.min(centerX, centerY);
    
            let startAngle = -90;
            let endAngle = 0;
    
            for (let i = 0; i < segmentSizes.length; i++) {
                const segmentSize = (segmentSizes[i] / total) * 360;
                endAngle = startAngle + segmentSize;
                
                // Calculate segment coordinates
                const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                
                // Create and style the segment
                const segment = document.createElementNS("http://www.w3.org/2000/svg", "path");
                const largeArcFlag = segmentSize > 180 ? 1 : 0;
                const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                segment.setAttribute("d", pathData);
                const color = colorArray[i % colorArray.length];
                segment.setAttribute("fill", color);
    
                // Store the start and end angles of each segment for reference
                segment.dataset.startAngle = startAngle;
                segment.dataset.endAngle = endAngle;
    
                svg.appendChild(segment);
                startAngle = endAngle;
            }

            container.appendChild(svg);

            // Add arrow
            if (!container.querySelector(".arrow")) {
                const arrow = document.createElement("div");
                arrow.classList.add("arrow");
                arrow.style.transform = "translate(-50%, -100%) rotate(0deg)";
                container.appendChild(arrow);
            }

            // Include data in disc dataset
            container.dataset.discdata = "[" + segmentSizes + "]";
            container.dataset.cardid = cardId;

            resolve();

        } catch (error) {
            console.log("An error occurred when generating a disc for " + discId + ": " + error.message);
            reject(error);
        }
    })
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
        }catch (error) {
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