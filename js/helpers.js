/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { db, state, global } from "./db.js?v=0.27";



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

			const book = document.querySelector(".book");
			const pages = book.querySelectorAll(".page");

			book.style.display = "flex";

			const pageSound = (await rand(1, 4)).toString();
			soundEffects.page.play(pageSound);

			await wait(100);

			book.classList.add("booking");

			await wait(350);

			book.classList.remove("booking");
			book.classList.add("booked");

			// Hide all screens
			document.querySelectorAll("main section").forEach(el => {
				el.style.display = "none";
			});

			// Display destination screen
			document.querySelector("#" + destination).style.display = "flex";

			pages.forEach(page => {
				page.classList.add("turn-page");
			});

			await wait(900);

			book.style.display = "none";
			book.classList.remove("booked");
			pages.forEach(page => {
				page.classList.remove("turn-page");
			});

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
export function iconify(string, light = true) {
	const regex = /{([^}]+)}/g;
	let replacedString = string.replace(regex, `<span class="icon $1${light ? ' $1-light' : ''}"></span>`);
	return replacedString;
}


/*===========================================================================*/
// Horizontal drag to scroll
/*===========================================================================*/
export function handleDragScroll(event) {
	event.preventDefault();
	const container = event.currentTarget;
	const startX = event.clientX;
	let scrollLeft = container.scrollLeft;

	function scrollOnMouseMove(e) {
		const moveX = e.clientX - startX;
		container.scrollLeft = scrollLeft - moveX;
		// Add a class indicating that scrolling has started
		container.classList.add('scrolling');
	}

	function scrollOnMouseUp() {
		window.removeEventListener('mousemove', scrollOnMouseMove);
		window.removeEventListener('mouseup', scrollOnMouseUp);
		container.style.cursor = 'grab';
		// Remove the class when scrolling ends
		setTimeout(() => {
			container.classList.remove('scrolling');
		}, 50);
	}

	container.style.cursor = 'grabbing';
	window.addEventListener('mousemove', scrollOnMouseMove);
	window.addEventListener('mouseup', scrollOnMouseUp);

	container.addEventListener('mouseenter', () => {
		container.style.cursor = 'grab';
	});
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

/*===========================================================================*/
// Card mana check
/*===========================================================================*/
export function cardManaCheck() {
	const currentMana = state.player.mana + state.turnMana - state.turnManaToConsume;
	const cardsInHand = document.querySelectorAll(".hand .inventory-card");
	const cardsInPlay = document.querySelectorAll("#playerDiscs .charged .inventory-card");
	const allCards = [...cardsInHand, ...cardsInPlay];

	allCards.forEach(card => {
		const cardID = card.dataset.cardid;
		const manaCost = db.cards[cardID].mana_cost;
		if (manaCost > 0) {
			if (manaCost > currentMana) {
				card.querySelector(".card-mana-cost").classList.add("too-expensive");
			} else {
				card.querySelector(".card-mana-cost").classList.remove("too-expensive");
			}
		}
	});
}

/*===========================================================================*/
// Check if attack is available
/*===========================================================================*/
export function checkAttackAvailability() {
	const btn = document.querySelector(".main-action button");
	if (document.querySelector("#playerDiscs .slot.charged")) {
		btn.disabled = false;
	} else {
		btn.disabled = true;
	}
}

/*===========================================================================*/
// Set music and sfx volumes
/*===========================================================================*/
export function setVolume(group, volume) {
	if (group === "music") {
		for (const [key, value] of Object.entries(soundtrack)) {
			soundtrack[key].volume(volume)
		}
	} else if (group === "sfx") {
		for (const [key, value] of Object.entries(soundEffects)) {
			soundEffects[key].volume(volume)
		}
	}
}

/*===========================================================================*/
// Change music
/*===========================================================================*/
export function changeMusic(currentSong, nextSong){
	const current = soundtrack[currentSong];
	const next = soundtrack[nextSong];
	const volume = global.musicVolume;

	current.fade(volume, 0, 3000);
	setTimeout(() => {
		current.stop();
		current.volume(volume);
	}, 3000);
	next.fade(0, volume, 3000);
	next.play();
}


/*===========================================================================*/
// Damage effect
/*===========================================================================*/
export async function damageEffect(target, amount, variant){
	if (amount > 0) {

		// Get parent element to append
		let parent;
		if (target === "mob") {
			parent = document.querySelector("#mobBoard");
		} else if (target === "player"){
			parent = document.querySelector("#encounter .bottombar");
		} else {
			return;
		}

		// Create element
		const damageEffectElement = document.createElement("div");
		damageEffectElement.classList.add("damage-effect");
		if (variant === "poison") {
			damageEffectElement.classList.add("poison-damage");
		}

		// Add damage amount
		damageEffectElement.textContent = "-" + amount;

		// Display
		parent.append(damageEffectElement);

		// Sound effect
		if (variant === "poison") {
			soundEffects.poison.play();
		} else {
			const randomSlashSound = "slash" + await rand(1, 4);
			soundEffects[randomSlashSound].play();
		}

		// Remove element
		setTimeout(() => {
			damageEffectElement.remove();
		}, 2000);
	}
}