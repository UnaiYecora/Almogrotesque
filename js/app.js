/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { updateFate, updateCoins, goTo, updateHP, updateMana, updateTokens, iconify } from "./helpers.js?v=0.15";
import { generateStore, buy, checkIfAbleToBuy } from "./store.js?v=0.15";
import { generateInventory } from "./inventory.js?v=0.15";
import { loadEncounter, attack, changeFate, applyDiscsEffects, victory, death, toggleTurn, stopUsingCard, placeCardInSlot } from "./encounter.js?v=0.15";
import { setLevel, takeDoor, burnPath, fillPaths } from "./crossroad.js?v=0.15";
import { generatePuzzle } from "./chests.js";
import { buySkill, updateSkilltree } from "./skills.js?v=0.15";
import { db, state, save, load } from "./db.js?v=0.15";


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
// Check for saved game
/////////////////
if (!(localStorage.getItem("almogrotesque") === null)) {
	document.querySelector("#start #continue").disabled = false;
}


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
	setLevel("crossroad", true, false);

	/////////////////
	// Display fate, coins, tokens, skills...
	/////////////////
	updateFate();
	updateCoins();
	updateTokens();
	updateSkilltree();
});


/*===========================================================================*/
// Continue
/*===========================================================================*/
document.querySelector("#start #continue").addEventListener("click", async function () {
	// TO-DO: Turn fullscreen on
	// document.documentElement.requestFullscreen();
	await load();
	setLevel(state.currentLevel, true, true);

	/////////////////
	// Display fate, coins, tokens, skills...
	/////////////////
	updateFate();
	updateCoins();
	updateTokens();
	updateSkilltree();
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
				state.endOfTheRoad = 0;
			}

			// Store
			if (type === "store") {
				const storeid = path.dataset.storeid;
				await generateStore(storeid);
				await checkIfAbleToBuy();
				document.querySelector("#store").style.display = "flex";
			}

			// Chest
			if (type === "chest") {
				await generatePuzzle();
				// TO-DO: Like stores, save chest so it doesn't change when exiting and entering again
				goTo("chest");
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
	if (document.querySelector("#playerDiscs .slot.charged")) {
		document.querySelector("#playerBoard").classList.add("midturn");
		attack();
	}
});

/*===========================================================================*/
// Change fate button
/*===========================================================================*/
document.querySelector(".change-fate").addEventListener("click", function () {
	const fateBtn = document.querySelector(".change-fate");
	const endBtn = document.querySelector(".end-turn");
	// Temporarily disable buttons
	fateBtn.disabled = true;
	endBtn.disabled = true;
	changeFate();
});

/*===========================================================================*/
// End turn
/*===========================================================================*/
document.querySelector(".end-turn").addEventListener("click", async function () {
	document.querySelector("#playerBoard").classList.remove("midturn");
	await applyDiscsEffects();
	if (state.player.hp <= 0) {
		death();
	} else if (state.mob.hp <= 0) {
		victory();
	} else {
		toggleTurn();
	}
});

/*===========================================================================*/
// Skip path
/*===========================================================================*/
document.querySelectorAll("[data-skip-path]").forEach(el => {

	el.addEventListener("click", async function () {
		await burnPath(el.parentElement);
		await fillPaths();
	})
});

/*===========================================================================*/
// XP Screen
/*===========================================================================*/
document.querySelector("#xpscreen button").addEventListener("click", async function () {
	const path = document.querySelector('#crossroad [data-mobid="' + state.mob.mobid + '"]');
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
		const item = storeItemEL.dataset.item;
		const store = storeItemEL.dataset.store;
		const position = storeItemEL.dataset.position;

		await buy(item);
		await checkIfAbleToBuy();
		updateCoins();
		updateFate();
		updateHP();
		state[store][position] = "";

		save();

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
document.querySelector(".close-inventory").addEventListener("click", function () {
	document.querySelector(".inventory").style.display = "none";
	document.querySelector(".target-slot").classList.remove("target-slot");
});

// Open
document.querySelector("#discobar").addEventListener("click", async function (e) {
	if (!document.querySelector("#playerBoard").classList.contains("midturn")) {
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
	}
});

/*===========================================================================*/
// Place selected card in slot
/*===========================================================================*/
document.querySelector(".inventory").addEventListener("click", async function (e) {

	if (e.target.closest(".inventory-card")) {
		const cardId = e.target.closest(".inventory-card").dataset.cardid;
		if (e.target.closest(".mana-required")) {
			const manaPrice = db.cards[cardId].mana_price;
			state.player.mana -= manaPrice;
			state.player.cardsManaPaid.push(cardId);
			updateMana();
			await placeCardInSlot(cardId);
		} else {
			await placeCardInSlot(cardId);
		}

		//Move card to the top of the inventory
		const cards = state.turn ? state.player.cardsThisEncounter : state.player.cards;
		cards.unshift(cards.splice(cards.indexOf(cardId), 1)[0]);
		document.querySelector(".inventory-cards").scrollTop = 0;

		//Close inventory
		document.querySelector(".inventory").style.display = "none";
	}
});


/*===========================================================================*/
// Stop using card
/*===========================================================================*/
document.querySelector(".clear-slot").addEventListener("click", async function () {
	await stopUsingCard();
	document.querySelector(".inventory").style.display = "none";
	document.querySelector(".target-slot").classList.remove("target-slot");
});

/*===========================================================================*/
// Close chest
/*===========================================================================*/
document.querySelector(".close-chest").addEventListener("click", function () {
	goTo("crossroad");
})

/*===========================================================================*/
// See skill
/*===========================================================================*/
document.querySelectorAll("#skilltree .skill[data-skillid]").forEach(el => {
	el.addEventListener("click", function (e) {
		const skillId = el.dataset.skillid;
		const skillStatus = el.dataset.skillstate;
		const desc = db.skills[skillId].desc;
		const price = db.skills[skillId].price;
		const modal = document.querySelector(".skill-modal");
		const buyBtn = modal.querySelector(".skill-modal-buy");
		const descEl = modal.querySelector(".skill-modal-desc");

		descEl.innerHTML = iconify(desc);
		buyBtn.innerHTML = `${price}<span class="token icon"></span>`;
		buyBtn.dataset.skillprice = price;
		buyBtn.dataset.skillid = skillId;
		buyBtn.disabled = skillStatus === "1" && price <= state.player.tokens ? false : true;
		modal.style.display = "flex";
	})
});

/*===========================================================================*/
// Buy skill
/*===========================================================================*/
document.querySelector(".skill-modal-buy").addEventListener("click", function () {
	const btn = document.querySelector(".skill-modal-buy");
	const skillId = btn.dataset.skillid;
	const price = btn.dataset.skillprice;

	if (price <= state.player.tokens) {
		btn.disabled = true;
		buySkill(skillId);
		document.querySelector(`.skill[data-skillid="${skillId}"]`).dataset.skillstate = 2;
		state.player.tokens -= price;
		updateTokens();
		document.querySelector(".skill-modal").style.display = "none";
		updateSkilltree();
		save();
	}

})


/*===========================================================================*/
// Close skill modal
/*===========================================================================*/
document.querySelector(".skill-modal-close").addEventListener("click", function () {
	document.querySelector(".skill-modal").style.display = "none";
})


/*===========================================================================*/
// Zoom card on store
/*===========================================================================*/
document.querySelectorAll(".store-item-card").forEach(el => {
	el.addEventListener("click", function() {
		el.classList.toggle("big-card");
	})
});