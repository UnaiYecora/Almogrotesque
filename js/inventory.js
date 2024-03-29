/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { iconify } from "./helpers.js?v=0.24";
import { generateCardDisc } from "./discs.js?v=0.24";
import { db, state } from "./db.js?v=0.24";



/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ··························  F U N C T I O N S  ···························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Generate inventory
/*===========================================================================*/
export async function generateInventory() {
	return new Promise(async (resolve, reject) => {
		try {

			// Get Elements
			const inventoryElement = document.querySelector(".inventory-cards");

			// Clear inventory
			inventoryElement.innerHTML = "";

			const cards = state.player.cards;

			for (const cardId of cards) {
				// Generate card HTML
				let cardHTML = "";
				cardHTML += '<div class="inventory-item">';
				cardHTML += await generateCard(cardId);
				cardHTML += '</div>';
				inventoryElement.innerHTML += cardHTML;
			}


			resolve();
		} catch (error) {
			console.log("An error occurred generating the inventory: " + error.message);
			reject(error);
		}
	})
};

/*===========================================================================*/
// Generate card
/*===========================================================================*/
export async function generateCard(cardId) {
	return new Promise(async (resolve, reject) => {
		try {
				// Get card data
				const card = db.cards[cardId];

				// Get card disc
				const disc = await generateCardDisc(cardId);

				// Generate card HTML
				let cardHTML = "";
				cardHTML += "<div class='card'>";
				cardHTML += '<div class="inventory-card" data-cardid="' + cardId + '" data-type="' + card.type +'">';
				cardHTML += '<div class="card-mana-cost">'+ card.mana_cost +'</div>';
				cardHTML += disc;
				cardHTML += '<p class="card-inventory-title">' + card.name + '</p>';
				cardHTML += '<div class="card-inventory-icon">';
				cardHTML += '<img src="./assets/img/cards/' + cardId + '.png">';
				cardHTML += '</div>';
				cardHTML += '<div class="card-inventory-desc"><p>' + iconify(card.desc) + '</p></div>';
				cardHTML += '<img src="./assets/img/cards/' + cardId + '.png" class="card-background">';
				cardHTML += '</div>';
				cardHTML += '</div>';

			resolve(cardHTML);
		} catch (error) {
			console.log("An error occurred generating card: " + error.message);
			reject(error);
		}
	})
};