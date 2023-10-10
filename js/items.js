/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
import { db, state } from "./db.js";
import { generateDisc } from "./soul.js";
import { updateHP, getSlotShortDesc } from "./helpers.js";


/*==========================================*/
// Use item
/*==========================================*/
export async function useitem(itemId) {
	return new Promise(async (resolve, reject) => {
		try {

			//Add item to items in use
			state.player.itemsInUse.push(itemId);

			//Get item data
			const hitrate = db.items[itemId].hitrate;
			const colors = db.items[itemId].colors;

			//Generate disc
			let newDisc = document.createElement("div");
			const randomID = "id-" + crypto.randomUUID();
			newDisc.id = randomID;

			//Add class
			newDisc.classList.add("disc");

			//Insert disc in slot
			const slot = document.querySelector(".target-slot");
			slot.innerHTML = "";
			slot.append(newDisc);

			//Display short description
			const shortDesc = document.createElement("div");
			shortDesc.classList.add("slot-short-desc");
			/* shortDesc.textContent = db.items[itemId].short; */
			shortDesc.innerHTML = getSlotShortDesc(itemId);
			slot.appendChild(shortDesc);

			//Modify classes
			slot.classList.remove("target-slot");
			slot.classList.add("charged");

			generateDisc(itemId, randomID);

			resolve();
		} catch (error) {
			console.log("An error occurred trying to use an item: " + error.message);
			reject(error);
		}
	})
};

/*==========================================*/
// Calcualte discs' effects
/*==========================================*/
export async function calculateEffects(discId, result) {
	return new Promise(async (resolve, reject) => {
		try {

			const disc = document.getElementById(discId);
			const itemId = disc.dataset.itemid;

			if (!state.turnDamage) { state.turnDamage = 0 };
			if (!state.turnHeal) { state.turnHeal = 0 };

			//Dynamically call the effect method based on itemId
			const effects = new Effects(result, itemId, disc);
			if (effects[itemId] && typeof effects[itemId] === 'function') {
				effects[itemId]();
			} else {
				console.error(`Unknown item ID: ${itemId}`);
			}

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}

/*==========================================*/
// Apply discs' effects
/*==========================================*/
export async function applyDiscsEffects() {
	return new Promise(async (resolve, reject) => {
		try {

			let target;
			let turnPlayer;

			if (state.turn === "player") {
				target = state.currentMob;
				turnPlayer = state.player;
			} else {
				target = state.player;
				turnPlayer = state.currentMob;
			}

			//Damage
			target.hp = Math.max(target.hp - state.turnDamage, 0);
			document.querySelectorAll(".damage-bar").forEach(el => { el.style.width = "0%"; });

			//Heals
			turnPlayer.hp = Math.min(turnPlayer.hp + state.turnHeal, turnPlayer.maxHp);
			document.querySelectorAll(".heal-bar").forEach(el => { el.style.width = "0%"; });

			await updateHP();

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}


/*==========================================*/
// Item functions
/*==========================================*/
class Effects {

	//Constructor
	constructor(result, itemId, disc) {
		this.result = result;
		this.itemId = itemId;
		this.disc = disc;
	}

	//Helper functions
	successful() { this.disc.parentElement.classList.add("successful"); }
	unsuccessful() { this.disc.parentElement.classList.add("unsuccessful"); }

	//Common effects
	dealDame() {
		let target;
		let tempBar;
		if (state.turn === "player") {
			target = state.currentMob;
			tempBar = document.querySelector("#encounter .enemy-hp .progress .damage-bar");
		} else {
			target = state.player;
			tempBar = document.querySelector("#encounter .player-hp .progress .damage-bar");
		}
		state.turnDamage += db.items[this.itemId].damage;
		tempBar.style.width = state.turnDamage / target.hp * 100 + "%";
	}

	heal(amount) {
		let tempBar;
		let target;
		if (state.turn === "player") {
			target = state.player;
			tempBar = document.querySelector("#encounter .player-hp .heal-bar");
		} else {
			target = state.currentMob;
			tempBar = document.querySelector("#encounter .enemy-hp .heal-bar");
		}

		let maxHP = target.maxHp;
		let lostHP = maxHP - target.hp;
		let maxHealBarSize = lostHP / maxHP * 100;

		state.turnHeal += amount;
		tempBar.style.width = Math.min(state.turnHeal / target.maxHp * 100, maxHealBarSize) + "%";
	}

	//Effecs by item
	basic_attack_1() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.successful();
				this.dealDame();
				break;
		}
	}
	basic_attack_2() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.successful();
				this.dealDame();
				break;
		}
	}
	heal_1() {
		let heal;
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				heal = db.items[this.itemId].heal;
				this.successful();
				this.heal(heal);
				break;
			case 3:
				heal = db.items[this.itemId].heal2;
				this.successful();
				this.heal(heal);
				break;
		}
	}
	double_damage() {
		switch (this.result) {
			case 1:
				state.turnDamage = state.turnDamage * 2;
				this.dealDame();
				this.successful();
				break;
			case 2:
				state.turnDamage = 0;
				this.dealDame();
				this.successful();
				break;
		}
	}
}