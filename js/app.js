/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { updateFate, updateCoins, goTo, updateHP } from "./helpers.js";
import { generateStore, buy, checkIfAbleToBuy } from "./store.js";
import { generateInventory } from "./inventory.js";
import { loadEncounter, attack, changeFate, applyDiscsEffects, victory, toggleTurn, stopUsingCard, placeCardInSlot } from "./encounter.js";
import { setLevel, takeDoor, burnPath, fillPaths } from "./crossroad.js";
import { db, state } from "./db.js";


/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ·························  F I R S T   L O A D  ··························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/////////////////
// Window scaler
/////////////////
window.addEventListener("resize", widthBasedFontSize);
function widthBasedFontSize() {
	const root = document.querySelector(':root');
	const main = document.querySelector("main");
	root.style.setProperty('--width-based-font', main.clientWidth / 40 + "px");

	// to get css variable from :root
	// const color = getComputedStyle(root).getPropertyValue('--width-based-font');
}
widthBasedFontSize();

/////////////////
// Display fate and coins
/////////////////
updateFate();
updateCoins();


/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ····················  E V E N T   L I S T E N E R S ······················*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Start button
/*===========================================================================*/
document.querySelector("#start #newGame").addEventListener("click", function () {
	// TO-DO: Turn fullscreen on
	// document.documentElement.requestFullscreen();
	setLevel("crossroad", true);
});

/*===========================================================================*/
// Path buttons
/*===========================================================================*/
document.querySelector("#crossroad").addEventListener("click", async function (e) {
	const path = e.target.closest(".path");
	if (path) {
		const type = path.dataset.pathtype;
		
		// Main button
		if (e.target.classList.contains("main-path-button")) {
			
			// Mob encounter
			if (type === "encounter") {
				const mob = path.dataset.mobid;
				loadEncounter(mob);
			}

			// Door
			if (type === "door") {
				takeDoor(path);
			}

			// Store
			if (type === "store") {
				const storeid = path.dataset.storeid;
				await generateStore(storeid);
				await checkIfAbleToBuy();
				document.querySelector("#store").style.display = "flex";
			}
		}
	}
});

/*===========================================================================*/
// Go-to buttons
/*===========================================================================*/
document.querySelectorAll("[data-goto]").forEach(el => {
	el.addEventListener("click", function () {
		goTo(el.dataset.goto);
	});
});

/*===========================================================================*/
// Attack button
/*===========================================================================*/
document.querySelector("#attackBtn").addEventListener("click", function () {
	attack();
});

/*===========================================================================*/
// Change fate button
/*===========================================================================*/
document.querySelector(".change-fate").addEventListener("click", function () {
	changeFate();
});

/*===========================================================================*/
// End turn
/*===========================================================================*/
document.querySelector(".end-turn").addEventListener("click", async function () {
	await applyDiscsEffects();
	if (state.mob.hp <= 0) {
		victory();
	} else {
		toggleTurn();
	}
});

/*===========================================================================*/
// Skip path
/*===========================================================================*/
document.querySelectorAll("[data-skip-path]").forEach(el => {
	
	el.addEventListener("click", async function() {
		await burnPath(el.parentElement);
		await fillPaths();
    })
});

/*===========================================================================*/
// XP Screen
/*===========================================================================*/
document.querySelector("#xpscreen button").addEventListener("click", async function () {
	const path = document.querySelector('#crossroad [data-mobid="'+ state.mob.mobid +'"]');
	await updateHP();
	document.querySelector("#xpscreen").style.display = "none";
	await goTo("crossroad");
	await burnPath(path);
	await fillPaths();
});

/*===========================================================================*/
// Close store
/*===========================================================================*/
document.querySelector(".close-store").addEventListener("click", async function () {
	document.querySelector("#store").style.display = "none";
});

/*===========================================================================*/
// Buy items
/*===========================================================================*/
document.querySelector("#store").addEventListener("click", async function (e) {
	if (e.target.matches(".buy-item, .buy-item > *")) {
		const storeItemEL = e.target.closest(".store-item");
		
		// Data
		const group = storeItemEL.dataset.group;
		const item = storeItemEL.dataset.item;
		const store = storeItemEL.dataset.store;
		const position = storeItemEL.dataset.position;
		
		await buy(group, item);
		await checkIfAbleToBuy();
		updateCoins();
		updateFate();
		updateHP();
		state[store][position] = "";

		storeItemEL.style.visibility = "hidden";

		// If it's the last item, burn path
		if (state[store][0] == "" && state[store][1] == "" && state[store][2] == "") {
			document.querySelector("#store").style.display = "none";
			await burnPath(document.querySelector('.path[data-storeid="' + store + '"'));
			fillPaths();
		}

	}
});

/*===========================================================================*/
// Open/Close inventory in combat
/*===========================================================================*/
// Close
document.querySelector(".close-inventory").addEventListener("click", function() {
	document.querySelector(".inventory").style.display = "none";
	document.querySelector(".target-slot").classList.remove("target-slot");
});

// Open
document.querySelector("#discobar").addEventListener("click", async function(e) {
	const slot = e.target.closest(".slot");
	if (slot) {
		slot.classList.add("target-slot");

		const removeBtn = document.querySelector("button.clear-slot");
		let cardId;

		if (slot.querySelector(".disc")) {
			removeBtn.disabled = false;
			cardId = slot.querySelector(".disc").dataset.cardid;
		} else {
			removeBtn.disabled = true;
			cardId = false;
		}

		// Generate inventory
		await generateInventory(cardId);

		// Display inventory
		document.querySelector(".inventory").style.display = "flex";
	}
});

/*===========================================================================*/
// Place selected card in slot
/*===========================================================================*/
document.querySelector(".inventory").addEventListener("click", async function(e) {

	if (e.target.closest(".inventory-card")) {
		const cardId = e.target.closest(".inventory-card").dataset.cardid;
		if (e.target.closest(".mana-required")) {
			const manaPrice = db.cards[cardId].mana_price;
			state.player.mana -= manaPrice;
			state.player.cardsManaPaid.push(cardId);
			await placeCardInSlot(cardId);
		} else {
			await placeCardInSlot(cardId);
		}
		document.querySelector(".inventory").style.display = "none";
	}
});


/*===========================================================================*/
// Stop using card
/*===========================================================================*/
document.querySelector(".clear-slot").addEventListener("click", async function() {
	await stopUsingCard();
	document.querySelector(".inventory").style.display = "none";
	document.querySelector(".target-slot").classList.remove("target-slot");
});