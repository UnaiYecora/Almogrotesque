/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
import { db, state } from "./db.js";

/*==========================================*/
// Go-to buttons
/*==========================================*/
export async function goTo(destination) {
	return new Promise(async(resolve, reject) => {
		try {
			// Hide all screens
			document.querySelectorAll("main section").forEach(el => {
				el.style.display = "none";
			});
			
			// Display destination screen
			document.querySelector("#" + destination).style.display = "flex";

			resolve();
		} catch (error) {
			console.log("An error occurred while going somewhere: " + error.message);
			reject(error);
		}
	});
}


/*==========================================*/
// Shuffle array
/*==========================================*/
export function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/*==========================================*/
// Wait X milliseconds
//
// Usage: await wait(500);
/*==========================================*/
export function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


/*==========================================*/
// Health bars
/*==========================================*/
export function updateHP() {
	return new Promise(async(resolve, reject) => {
		try {
			const bars = document.querySelectorAll(".hp");
			
			for (let i = 0; i < bars.length; i++) {
				const hpEl = bars[i];
				let hp;
				let maxHP;

				//Enemy data
				if (hpEl.classList.contains("enemy-hp")){
					if (state.currentMob) {
						hp = state.currentMob.hp;
						maxHP = db.mobs[state.currentMob.mobid].lvl;
					}
				}

				else if (hpEl.classList.contains("player-hp")){
					//Player data
					hp = state.player.hp;
					maxHP = state.player.maxHp;
				}

				const hpFull =  hpEl.querySelector(".full");
				const hpEmpty = hpEl.querySelector(".empty");

				hpFull.innerHTML = "";
				hpEmpty.innerHTML = "";

				//Full hearts
				for (let i = 0; i < hp; i++) {
					let heart = document.createElement("span");
					heart.classList.add("heart");
					hpFull.appendChild(heart);
				}

				//Empty hearts
				for (let i = 0; i < maxHP; i++) {
					let heart = document.createElement("span");
					heart.classList.add("empty-heart");
					hpEmpty.appendChild(heart);
				}
			}

			resolve();

		} catch (error) {
			console.log("An error occurred filling a health bar: " + error.message);
			reject(error);
		}
	});
}

/*==========================================*/
// Random from array
/*==========================================*/
function randomItem(arr) {
	if (arr.length === 0) {
		return null; // Return null if the array is empty
	}

	return arr[Math.floor(Math.random() * arr.length)];
}


/*==========================================*/
// Generate store
/*==========================================*/
export async function generateStoreItems(emptyStore) {
	return new Promise(async (resolve, reject) => {
		try {

			//Set the chance of getting a special item
			//Random number between 1 and 10, over that
			//number gets special item
			const itemChance = 0;


			//Generate store items
			let storeData = [];
			for (let i = 0; i < 3; i++) {
				if (Math.ceil(Math.random()*10) > itemChance) {
					//Add level item
					const lvlItemArray = db.levels.find((x) => x.name === state.currentLevel).items;
					storeData[i] = randomItem(lvlItemArray);

				} else {
					//Add general item
					const generalItemArray = Object.keys(db.basicItems);
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

/*==========================================*/
// Generate store
/*==========================================*/
export async function generateStore(storeid) {
	return new Promise(async (resolve, reject) => {
		try {
			//Elements
			const storePlaces = document.querySelectorAll(".store-item");

			//Populate store
			for (let i = 0; i < storePlaces.length; i++) {
				const place = storePlaces[i];
				
				//Elements to populate
				const titleEl = place.querySelector(".store-item-title");
				const descEl = place.querySelector(".store-item-desc");
				const iconEl = place.querySelector(".store-item-icon");
				const priceEl = place.querySelector(".store-item-price");
	
				//Data
				let item = state[storeid][i];
				let itemData;

				if (db.basicItems[item]) {
					place.dataset.group = "basicItems";
					place.dataset.item = item;
					itemData = db.basicItems[item];
				}
				else {
					place.dataset.group = "items";
					place.dataset.item = item;
					itemData = db.items[item];
				}

				if (item) {
					//Display item
					place.style.visibility = "visible";

					//Populate the elements
					titleEl.textContent = itemData.name;
					descEl.textContent = itemData.desc;
					iconEl.innerHTML = `<span class="${itemData.icon}"></span>`;
					priceEl.textContent = itemData.price;

					//Datasets
					place.dataset.price = itemData.price; 
					place.dataset.amount = itemData.amount; 
					place.dataset.store = storeid; 
					place.dataset.position = i; 
				} else {
					place.style.visibility = "hidden";
				}


			}

			resolve();
		}catch (error) {
			console.log("An error occurred generating a store: " + error.message);
			reject(error);
		}
	})
};


/*==========================================*/
// Buy
/*==========================================*/
export async function buy(group, itemId) {
	return new Promise(async (resolve, reject) => {
		try {

			if (group === "basicItems") {
				const item = db.basicItems[itemId];
				state.player.coins -= item.price;
				state.player[item.gives] += item.amount;
			}

			if (group === "items") {
				const item = db.items[itemId];
				state.player.coins -= item.price;
				if (!state.player.items[itemId]) {
					state.player.items[itemId] = 0;
				}
				state.player.items[itemId] += item.amount;
			}

			resolve();
		}catch (error) {
			console.log("An error occurred trying to buy an item: " + error.message);
			reject(error);
		}
	})
};

/*==========================================*/
// Check if able to buy
/*==========================================*/
export async function checkIfAbleToBuy() {
	return new Promise(async (resolve, reject) => {
		try {

			//Elements
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
		}catch (error) {
			console.log("An error occurred with the modern economy: " + error.message);
			reject(error);
		}
	})
};


/*==========================================*/
// Generate inventory
/*==========================================*/
export async function generateInventory() {
	return new Promise(async (resolve, reject) => {
		try {

			//Elements
			const bagEL = document.querySelector(".inventory-items");

			//Clear inventory
			bagEL.innerHTML = "";


			const bag = state.player.items;

			for (const itemId in bag) {
				if (Object.hasOwnProperty.call(bag, itemId)) {
					const amount = bag[itemId];

					if (amount > 0) {
						//Get data
						const item = db.items[itemId];
						
						let disabled = "";
						if (state.player.itemsInUse[itemId] > 0) {
							disabled = "disabled";
						}
	
						//Generate
						let itemHTML = "";
						itemHTML += '<div class="inventory-item '+ disabled +'" data-item="'+ itemId +'">';
						itemHTML += '<div class="inventory-item-wrapper">';
							itemHTML += '<p class="item-inventory-icon"></p>';
							itemHTML += '<p class="item-inventory-title">'+ item.name +'</p>';
							itemHTML += '<button>Use</button>';
						itemHTML += '</div>';
						itemHTML += '<p class="item-inventory-desc">'+ item.desc + '</p>';
						itemHTML += '';
						bagEL.innerHTML += itemHTML;
					}

				}
			}

			
			resolve();
		}catch (error) {
			console.log("An error occurred generating the inventory: " + error.message);
			reject(error);
		}
	})
};