/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { iconify } from "./helpers.js?v=0.12";
import { generateCardDisc } from "./discs.js?v=0.12";
import { db, state } from "./db.js?v=0.12";



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

			const cards = state.turn ? state.player.cardsThisEncounter : state.player.cards;

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
				cardHTML += '<div class="inventory-item ' + disabled + manaRequired + manaAvailable + mark + '">';
				cardHTML += await generateCard(cardId, playerMana, cardManaPrice);
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
export async function generateCard(cardId, playerMana, cardManaPrice, mini) {
	return new Promise(async (resolve, reject) => {
		try {
				// Get card data
				const card = db.cards[cardId];

				// Get card disc
				const disc = await generateCardDisc(cardId);

				// Not enough mana
				let tooExpensive = "";
				if (card.mana_cost > state.player.mana) {
					tooExpensive = "too-expensive";
				}

				// Generate card HTML
				let cardHTML = "";
				cardHTML += '<div class="inventory-card" data-cardid="' + cardId + '">';
				cardHTML += '<div class="card-mana-cost '+tooExpensive+'">'+ card.mana_cost +'</div>';
				cardHTML += '<p class="card-inventory-title">' + card.name + '</p>';
				cardHTML += '<div class="card-inventory-icon">';
				cardHTML += '<img src="./assets/img/cards/' + cardId + '.png">';
				cardHTML += disc;
				cardHTML += '</div>';
				if (!mini) {
					cardHTML += '<div class="card-inventory-desc"><p>' + iconify(card.desc) + '</p></div>';
				}
				if (playerMana !== false && cardManaPrice !== false) {
					cardHTML += '<div class="mana-price">';
					cardHTML += '<div>Claim:</div> <div>' + playerMana + ' / ' + cardManaPrice + '<span class="mana"></span></div>';
					cardHTML += '</div>';
				}
				cardHTML += '</div>';

			resolve(cardHTML);
		} catch (error) {
			console.log("An error occurred generating card: " + error.message);
			reject(error);
		}
	})
};