/*==========================================*/
// Spin soul disc
/*==========================================*/
export async function spin(id) {
    return new Promise(async (resolve, reject) => {
		try {
            const arrow = document.querySelector("#" + id + " .arrow");
            let r = parseFloat(arrow.style.transform.match(/rotate\((.+)\)/)[1]);

            r += Math.floor(Math.random() * (10720 - 720 + 1)) + 720;
            arrow.style.transform = "translate(-50%, -100%) rotate(" + r + "deg)";
            
            //LOG
            let newRotation = arrow.style.transform.match(/rotate\((.+)\)/)[1];
            let degreesRotated = parseInt(newRotation, 10) % 360;
            setTimeout(async () => {
                const results = await logResults(id, degreesRotated);
                resolve(results);
            }, 3000);
        }catch (error) {
			reject(error);
		}
    })
}

/*==========================================*/
// Generate soul disc
/*==========================================*/
export async function generateDisc(data, disc, customColors) {
    return new Promise((resolve, reject) => {
        try {

            //SVG size
            const svgSize = 100;

            //Final segment array (adding to 100)
            const segmentRest = 100 - data;
            const segmentSizes = [segmentRest, ...data];

            //Colors
            let colorArray;
            if (customColors) {
                colorArray = customColors;
            } else {
                colorArray = ["#000", "#dbdbdb", '#6C6C6C'];
            }
    
            
            const container = document.querySelector(disc);
            if (!container) throw new Error("SVG not found");
            container.innerHTML = "";

            //Create svg
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

            //Add arrow
            const arrow = document.createElement("div");
            arrow.classList.add("arrow");
            container.appendChild(arrow);

            //Include data in disc dataset
            container.dataset.discdata = "[" + segmentSizes + "]";

            resolve();

        } catch (error) {
            console.log("An error occurred when generating a disc for " + disc + ": " + error.message);
            reject(error);
        }
    })
}


/*==========================================*/
// Log disc results
/*==========================================*/
async function logResults(id, degreesRotated) {
    return new Promise((resolve, reject) => {
        try {
            const data = JSON.parse(document.getElementById(id).getAttribute('data-discdata'));
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
        
            /* console.log('Segment: ' + r);
            console.log('Grados: ' + degreesRotated); */
            resolve(r);
        } catch (error) {
			console.log("An error occurred trying to get attack results: " + error.message);
			reject(error);
		}
    })
}