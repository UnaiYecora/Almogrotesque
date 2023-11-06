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

			// Generate store items
			let storeData = [];
			for (let i = 0; i < 3; i++) {
				// Get all cards intended for players (price > 0)
				const itemsWithPositivePrice = Object.keys(db.cards).filter(item => db.cards[item].price > 0);

				// Remove cards already owned
				let itemsToRemove = [];
				itemsToRemove = [...storeData, ...state.player.cards, ...state.cardsForSale]
				const filteredItems = itemsWithPositivePrice.filter(item => !itemsToRemove.includes(item));

				storeData[i] = randomItem(filteredItems);
				state.cardsForSale.push(storeData[i]);
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
				const iconEl = place.querySelector(".store-item-icon");
				const priceEl = place.querySelector(".store-item-price");

				// Data
				let item = state[storeid][i];
				let itemData = db.cards[item];
				let price =  itemData.price;
				place.dataset.item = item;

				if (i === 0 && state.player.skills.includes("skilleco2")) {
					price = Math.floor(price - (price * 25 / 100));
				}

				if (state.player.skills.includes("skilleco3")) {
					price = Math.floor(price - (price * 25 / 100));
				}


				if (item) {
					// Display item
					place.style.visibility = "visible";

					// Populate the elements
					if (price < itemData.price) {
						priceEl.innerHTML = `<s>${itemData.price}</s> ${price}`;
					} else {
						priceEl.textContent = price;
					}
					iconEl.innerHTML = await generateCard(item);

					// Datasets
					place.dataset.price = price;
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
export async function buy(itemId) {
	return new Promise(async (resolve, reject) => {
		try {

			const card = db.cards[itemId];
			state.player.coins -= card.price;
			state.player.cards.push(itemId);

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