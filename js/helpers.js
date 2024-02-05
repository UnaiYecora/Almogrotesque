/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { db, state } from "./db.js?v=0.15";



/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ··························  F U N C T I O N S  ···························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Wait X milliseconds
// — Usage: await wait(500);
/*===========================================================================*/
export function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/*===========================================================================*/
// Go-to buttons
/*===========================================================================*/
export async function goTo(destination) {
	return new Promise(async (resolve, reject) => {
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

/*===========================================================================*/
// Random number between two numbers
/*===========================================================================*/
export async function rand(a, b) {
	try {
		const n = (a, b) => a + (b - a + 1) * crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32 | 0;
		const result = n(a, b);
		return result;
	} catch (error) {
		console.log("An error occurred while generating a random number with rand(): " + error.message);
		throw error;
	}
}

/*===========================================================================*/
// Shuffle array
/*===========================================================================*/
export function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

/*===========================================================================*/
// Inject array in array
/*===========================================================================*/
export function injectArrInArr(firstArray, secondArray) {
	// Generate an array of random indexes based on the length of the first array
	const randomIndexes = Array.from({ length: secondArray.length }, () => {
		return Math.floor(Math.random() * (firstArray.length + 1));
	});

	// Insert elements from the second array into the first array at the random positions
	for (let i = 0; i < secondArray.length; i++) {
		const randomIndex = randomIndexes[i];
		firstArray.splice(randomIndex, 0, secondArray[i]);
	}

	return firstArray;
}

/*===========================================================================*/
// Random from array
/*===========================================================================*/
export function randomItem(arr) {
	if (arr.length === 0) {
		return null; // Return null if the array is empty
	}

	return arr[Math.floor(Math.random() * arr.length)];
}

/*===========================================================================*/
// Display updated current fate left
/*===========================================================================*/
export function updateFate() {
	document.querySelectorAll(".fate-left").forEach(el => {
		el.textContent = state.player.fate;
	});
}

/*===========================================================================*/
// Display updated current coins left
/*===========================================================================*/
export function updateCoins() {
	document.querySelectorAll(".coins-left").forEach(el => {
		el.textContent = state.player.coins;
	});
}

/*===========================================================================*/
// Display updated current tokens left
/*===========================================================================*/
export function updateTokens() {
	const tokensLeft = state.player.tokens;
	document.querySelectorAll(".tokens-left-wrapper").forEach(tokenWrapperElement => {
		const tokenLeftElement = tokenWrapperElement.querySelector(".tokens-left");
		const crossroadTokens = document.querySelector("#crossroad .tokens-left-wrapper");
		const crossroadTokensLeft = crossroadTokens.querySelector(".tokens-left");

		tokenLeftElement.textContent = state.player.tokens;

		if (tokensLeft > 0) {
			crossroadTokensLeft.style.display = "flex";
			crossroadTokens.classList.add("tokens-to-spend");
		} else {
			crossroadTokensLeft.style.display = "none";
			crossroadTokens.classList.remove("tokens-to-spend");
		}
	});
}

/*===========================================================================*/
// Display updated current mana left
/*===========================================================================*/
export function updateMana() {
	// Player
	document.querySelector("#encounter .bottombar .mana-left").textContent = state.player.mana;

	// Mob
	document.querySelector("#encounter .topbar .mana-left").textContent = state.mob.mana;
}

/*===========================================================================*/
// Display updated health bars
/*===========================================================================*/
export function updateHP() {
	return new Promise(async (resolve, reject) => {
		try {
			const bars = document.querySelectorAll(".hp");

			for (const hpEl of bars) {
				let hp;
				let maxHP;

				// Mob data
				if (hpEl.classList.contains("mob-hp")) {
					hp = state.mob ? state.mob.hp : 0;
					maxHP = state.mob ? state.mob.maxHp : 0;
				}

				// Player data
				else if (hpEl.classList.contains("player-hp")) {
					hp = state.player.hp;
					maxHP = state.player.maxHp;
				}

				// Elements
				const bar = hpEl.querySelector(".bar");
				const progressEl = bar.querySelector(".progress");
				const currentHpEl = hpEl.querySelectorAll("span")[0];
				const maxHpEl = hpEl.querySelectorAll("span")[1];

				// Update hp bar
				currentHpEl.textContent = hp;
				maxHpEl.textContent = maxHP;
				progressEl.style.width = hp * 100 / maxHP + "%";
			}

			resolve();

		} catch (error) {
			console.log("An error occurred filling a health bar: " + error.message);
			reject(error);
		}
	});
}

/*===========================================================================*/
// Remove un/successful disc states
/*===========================================================================*/
export function removeSuccessDiscStates() {
	document.querySelectorAll(".slot").forEach(slot => {
		slot.classList.remove("successful", "unsuccessful");
		if (slot.querySelector(".spun")) {
			slot.querySelector(".spun").classList.remove("spun");
		}
	});
}

/*===========================================================================*/
// Get Slot Short Description
/*===========================================================================*/
export function getSlotShortDesc(cardId) {
	let content = "";
	const card = db.cards[cardId];
	let colorIndex = 0;
	if (card.colors[0] === "#000") {
		colorIndex = 1;
	}

	const descriptions = card.short;
	descriptions.forEach(desc => {
		content += '<div class="slot-short-desc-item">';
		content += '<span class="slot-short-desc-orb" style="background:' + card.colors[colorIndex] + ';"></span>';
		content += '<div class="slot-short-desc-text">' + iconify(desc) + '</div>';
		content += '</div>';
		colorIndex++;
	});

	return content;
}


/*===========================================================================*/
// Display secondary action
/*===========================================================================*/
export async function secondaryAction() {
	// Disable "change fate" button if not enough coins
	const changeFateButton = document.querySelector(".change-fate");
	changeFateButton.disabled = state.player.fate < state.fatePrice;

	// Display secondary action
	const secondaryActionElement = document.querySelector("#playerBoard .secondary-action");
	secondaryActionElement.style.display = "flex";
}


/*===========================================================================*/
// Modify string to add icons
/*===========================================================================*/
export function iconify(string) {
	const regex = /{([^}]+)}/g;
	const replacedString = string.replace(regex, '<span class="icon $1"></span>');
	return replacedString;

}


/*===========================================================================*/
// Heart pulse
/*===========================================================================*/
export function heartPulse() {
	// Get data
	let selfHeartElement;
	let adversaryHeartElement;
	let hp;
	let maxHP;
	if (state.turn === "player") {
		selfHeartElement = document.querySelector("#encounter .player-hp .heart");
		adversaryHeartElement = document.querySelector("#encounter .mob-hp .heart");
		hp = state.player.hp;
		maxHP = state.player.maxHp;
	} else {
		selfHeartElement = document.querySelector("#encounter .mob-hp .heart");
		adversaryHeartElement = document.querySelector("#encounter .player-hp .heart");
		hp = state.mob.hp;
		maxHP = state.mob.maxHp;
	}


	// CSS Clases
	selfHeartElement.classList.add("pulse");
	adversaryHeartElement.classList.remove("pulse");


	// Heart rate
	adversaryHeartElement.dataset.heartrate = false;

	const heartRate = (hp / maxHP) * 100;

	switch (true) {
		case heartRate >= 80:
			selfHeartElement.dataset.heartrate = false;
			break;
		case heartRate >= 60:
			selfHeartElement.dataset.heartrate = 1;
			break;
		case heartRate >= 40:
			selfHeartElement.dataset.heartrate = 2;
			break;
		case heartRate >= 20:
			selfHeartElement.dataset.heartrate = 3;
			break;
		case heartRate >= 1:
			selfHeartElement.dataset.heartrate = 4;
			break;
		case heartRate == 0:
			selfHeartElement.classList.remove("pulse");
			break;
	}
}