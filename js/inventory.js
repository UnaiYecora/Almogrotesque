/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { iconify } from "./helpers.js";
import { db, state } from "./db.js";



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
export async function generateInventory(previousCard) {
	return new Promise(async (resolve, reject) => {
		try {

			// Get Elements
			const inventoryElement = document.querySelector(".inventory-cards");

			// Clear inventory
			inventoryElement.innerHTML = "";


			const cards = state.player.cards;

			for (const cardId of cards) {

				// Get card data
				const card = db.cards[cardId];

				// Disable card if already in use
				const disabled = state.player.cardsInUse.find(e => e === cardId) ? "disabled " : "";

				// Disable card before buying with mana
				const cardManaPrice = card.mana_price;
				if (cardManaPrice === 0) {
					state.player.cardsManaPaid.push(cardId);
				}
				const playerMana = state.player.mana;
				let manaRequired;
				if (state.player.cardsManaPaid.includes(cardId)) {
					manaRequired = "";
				} else {
					manaRequired = "mana-required ";
				}
				let manaAvailable;
				if (playerMana >= cardManaPrice) {
					manaAvailable = "";
				} else {
					manaAvailable = "mana-unavailable ";
				}

				// Mark card in use
				let mark;
				if (previousCard === cardId) {
					mark = "mark ";
				} else {
					mark = "";
				}

				// Generate card HTML
				let cardHTML = "";
				cardHTML += '<div class="inventory-card ' + disabled + manaRequired + manaAvailable + mark + '" data-cardid="' + cardId + '">';
				cardHTML += '<p class="card-inventory-title">' + card.name + '</p>';
				cardHTML += '<div class="card-inventory-icon">';
				cardHTML += '<img src="./assets/img/cards/' + cardId + '.png">';
				cardHTML += '</div>';
				cardHTML += '<div class="card-inventory-desc"><p>' + iconify(card.desc) + '</p></div>';
				cardHTML += '<div class="mana-price">';
				cardHTML += '<div>Claim:</div> <div>' + playerMana + ' / ' + cardManaPrice + '<span class="mana"></span></div>';
				cardHTML += '</div>';
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