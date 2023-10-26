/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { randomItem, iconify } from "./helpers.js";
import { generateCard } from "./inventory.js";
import { db, state } from "./db.js";



/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ··························  F U N C T I O N S  ···························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Generate store items
/*===========================================================================*/
export async function generateStoreItems(emptyStore) {
	return new Promise(async (resolve, reject) => {
		try {

			// Set the chance of getting a card
			// Random number between 1 and 10, over that
			// number gets a card
			const cardChance = 7;


			// Generate store items
			let storeData = [];
			for (let i = 0; i < 3; i++) {
				if (Math.ceil(Math.random() * 10) > cardChance) {
					// Add card
					const lvlItemArray = db.levels[state.currentLevel].cards;
					// TO-DO: Disable getting cards not intended for players (eg. Bat bite)
					storeData[i] = randomItem(lvlItemArray);

				} else {
					// Add general item
					const generalItemArray = Object.keys(db.items);
					storeData[i] = randomItem(generalItemArray);
				}
			}

			// Save store
			state[`store${emptyStore}`] = storeData;

			resolve();
		} catch (error) {
			console.log("An error occurred generating a store: " + error.message);
			reject(error);
		}
	})
}


/*===========================================================================*/
// Generate store UI
/*===========================================================================*/
export async function generateStore(storeid) {
	return new Promise(async (resolve, reject) => {
		try {
			// Elements
			const storePlaces = document.querySelectorAll(".store-item");

			// Populate store
			for (let i = 0; i < storePlaces.length; i++) {
				const place = storePlaces[i];

				// Elements to populate
				const titleEl = place.querySelector(".store-item-title");
				const descEl = place.querySelector(".store-item-desc");
				const iconEl = place.querySelector(".store-item-icon");
				const priceEl = place.querySelector(".store-item-price");

				// Data
				let item = state[storeid][i];
				let itemData;

				if (db.items[item]) {
					place.dataset.group = "items";
					place.dataset.item = item;
					itemData = db.items[item];
				}
				else {
					place.dataset.group = "cards";
					place.dataset.item = item;
					itemData = db.cards[item];
				}

				if (item) {
					// Display item
					place.style.visibility = "visible";

					// Populate the elements
					titleEl.innerHTML = iconify(itemData.name);
					descEl.innerHTML = iconify(itemData.desc);
					priceEl.textContent = itemData.price;
					if (db.items[item]) {
						iconEl.innerHTML = `<span class="${itemData.icon}"></span>`;
					} else {
						//iconEl.innerHTML = `<img src="./assets/img/cards/${item}.png">`;
						iconEl.innerHTML = await generateCard(item);
					}

					// Datasets
					place.dataset.price = itemData.price;
					place.dataset.amount = itemData.amount;
					place.dataset.store = storeid;
					place.dataset.position = i;
				} else {
					place.style.visibility = "hidden";
				}


			}

			resolve();
		} catch (error) {
			console.log("An error occurred generating a store: " + error.message);
			reject(error);
		}
	})
};


/*===========================================================================*/
// Buy
/*===========================================================================*/
export async function buy(group, itemId) {
	return new Promise(async (resolve, reject) => {
		try {

			if (group === "items") {
				const item = db.items[itemId];
				state.player.coins -= item.price;
				state.player[item.gives] += item.amount;
			}

			if (group === "cards") {
				const card = db.cards[itemId];
				state.player.coins -= card.price;
				state.player.cards.push(itemId);
			}

			resolve();
		} catch (error) {
			console.log("An error occurred trying to buy an item: " + error.message);
			reject(error);
		}
	})
};


/*===========================================================================*/
// Check if able to buy
/*===========================================================================*/
export async function checkIfAbleToBuy() {
	return new Promise(async (resolve, reject) => {
		try {

			// Elements
			const storePlaces = document.querySelectorAll(".store-item");

			storePlaces.forEach(item => {
				const price = item.dataset.price;
				const coins = state.player.coins;

				if (price > coins) {
					item.querySelector("button").disabled = true;
				} else {
					item.querySelector("button").disabled = false;
				}
			});

			resolve();
		} catch (error) {
			console.log("An error occurred with the modern economy: " + error.message);
			reject(error);
		}
	})
};