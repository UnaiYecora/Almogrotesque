/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { db } from "./db.js";

/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ··························  F U N C T I O N S  ···························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Generate chest puzzle UI
/*===========================================================================*/
export function generatePuzzle() {
	return new Promise(async (resolve, reject) => {
		try {
			// Get elements
			const puzzleElement = document.querySelector(".chest-puzzle");

			// Generate HTML
			let html = "";

			html += '<div class="puzzle-grid">';

			for (let i = 1; i < 17; i++) {
				const indexStr = i.toString().padStart(2, '0');
				const img = `./assets/img/puzzles/test/${indexStr}.png`;
				const rotation = (Math.floor(Math.random() * 4));
				let deg;
				switch (rotation) {
					case 0:
						deg = "0";
						break;
					case 1:
						deg = "90";
						break;
					case 2:
						deg = "180";
						break;
					case 3:
						deg = "270";
						break;
				}
				html += '<img src="' + img + '" style="transform:rotate(' + deg + 'deg)" data-position="' + rotation + '">';
			}

			html += '</div>';

			puzzleElement.innerHTML = html;

			resolve();
		} catch (error) {
			console.log("An error occurred filling a health bar: " + error.message);
			reject(error);
		}
	});
}