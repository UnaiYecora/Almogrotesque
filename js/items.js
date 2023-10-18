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

			//Elements
			const slot = document.querySelector(".target-slot");
			const disc = slot.querySelector(".disc");

			if (state.turn === "player") {

				//Remove old item from items in use
				if (disc && disc.dataset.itemid) {
					state.player.itemsInUse = state.player.itemsInUse.filter(x => x !== disc.dataset.itemid);
				}

				//Add item to items in use
				state.player.itemsInUse.push(itemId);
			}


			//Generate disc
			let newDisc = document.createElement("div");
			const randomID = "id-" + crypto.randomUUID();
			newDisc.id = randomID;

			//Add class
			newDisc.classList.add("disc");

			//Insert disc in slot
			slot.innerHTML = "";
			slot.append(newDisc);

			//Display short description
			const shortDesc = document.createElement("div");
			shortDesc.classList.add("slot-short-desc");
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
// Stop using item
/*==========================================*/
export async function stopUsingItem() {
	return new Promise(async (resolve, reject) => {
		try {

			//Data
			const slot = document.querySelector(".target-slot");
			const itemId = document.querySelector(".target-slot .disc").dataset.itemid;

			//Remove from used items
			state.player.itemsInUse = state.player.itemsInUse.filter(x => x !== itemId);

			//Remove element
			slot.classList.remove("charged");
			slot.innerHTML = "";

			resolve();
		} catch (error) {
			console.log("An error occurred trying to stop using an item: " + error.message);
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
			let self;

			if (state.turn === "player") {
				self = state.player;
				target = state.currentMob;
			} else {
				self = state.currentMob;
				target = state.player;
			}

			//Damage
			let shield = target.shield;
			let remainingDamage;
			if (shield >= state.turnDamage) {
				remainingDamage = 0;
			} else {
				remainingDamage = state.turnDamage - shield;
			}
			target.shield = Math.max(shield - state.turnDamage, 0);
			target.hp = Math.max(target.hp - remainingDamage, 0);
			document.querySelectorAll(".damage-bar").forEach(el => { el.style.width = "0%"; });
			console.log("Damage dealt: " + (state.turnDamage + state.turnPiercingDamage) + ". Dealt: " + (remainingDamage + state.turnPiercingDamage) + ".");

			//Piercing damage
			target.hp = Math.max(target.hp - state.turnPiercingDamage, 0);

			//Heals
			self.hp = Math.min(self.hp + state.turnHeal, self.maxHp);
			document.querySelectorAll(".heal-bar").forEach(el => { el.style.width = "0%"; });

			//Shield
			if (state.turnShield && state.turnShield > 0) {
				self.shield = self.shield + state.turnShield;
				state.turnShield = 0;
			}

			//Poison
			if (state.turnPoison && state.turnPoison > 0) {
				target.poison = target.poison + state.turnPoison;
				state.turnPoison = 0;
			}

			//Gain mana
			if (state.tempMana && state.tempMana > 0) {
				state.player.mana += state.tempMana;
				state.tempMana = 0;
			}

			//Gain fate
			if (state.tempFate && state.tempFate > 0) {
				state.player.fate += state.tempFate;
				state.tempFate = 0;
			}
			document.querySelectorAll(".fate-left").forEach(el => {
				el.textContent = state.player.fate;
			});

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
	dealDame(amount) {
		let target;
		let tempBar;
		let shield;
		let shieldEl;
		if (state.turn === "player") {
			target = state.currentMob;
			tempBar = document.querySelector("#encounter .enemy-hp .progress .damage-bar");
			shield = target.shield;
			shieldEl = document.querySelector("#encounter .enemy-hp .shield-wrapper");
		} else {
			target = state.player;
			tempBar = document.querySelector("#encounter .player-hp .progress .damage-bar");
			shield = target.shield;
			shieldEl = document.querySelector("#encounter .player-hp .shield-wrapper");
		}

		//Get damage of this card
		let damageAmount = amount;
		if (!amount) {
			damageAmount = db.items[this.itemId].damage;
		}

		//Add damage to this turn's previous damage
		state.turnDamage += damageAmount;

		//Display damaged shield
		state.turnDamage > 0 ? shieldEl.classList.add("damaged") : shieldEl.classList.remove("damaged");

		//Subtract damage from shield
		if (shield > 0) {
			shieldEl.querySelector(".shield-amount").textContent = Math.max(shield - state.turnDamage, 0);
		}

		//Get remaining damage after shield
		let remainingDamage;
		if (shield >= state.turnDamage) {
			remainingDamage = 0;
		} else {
			remainingDamage = state.turnDamage - shield;
		}

		//Display damage on health bar
		tempBar.style.width = (state.turnPiercingDamage + remainingDamage) / target.hp * 100 + "%";
	}

	piercingDamage(amount){
		let target;
		let tempBar;
		let shield;
		if (state.turn === "player") {
			target = state.currentMob;
			shield = target.shield;
			tempBar = document.querySelector("#encounter .enemy-hp .progress .damage-bar");
		} else {
			target = state.player;
			shield = target.shield;
			tempBar = document.querySelector("#encounter .player-hp .progress .damage-bar");
		}

		//Get damage of this card
		let damageAmount = amount;
		if (!amount) {
			damageAmount = db.items[this.itemId].damage;
		}

		//Add damage to this turn's previous damage
		state.turnPiercingDamage += damageAmount;

		//Get non-piercing damage to add it up
		//Get remaining damage after shield
		let remainingDamage;
		if (shield >= state.turnDamage) {
			remainingDamage = 0;
		} else {
			remainingDamage = state.turnDamage - shield;
		}

		//Display damage on health bar
		tempBar.style.width = (state.turnPiercingDamage + remainingDamage) / target.hp * 100 + "%";
	}

	heal(amount) {
		let tempBar;
		let self;
		if (state.turn === "player") {
			self = state.player;
			tempBar = document.querySelector("#encounter .player-hp .heal-bar");
		} else {
			self = state.currentMob;
			tempBar = document.querySelector("#encounter .enemy-hp .heal-bar");
		}

		let maxHP = self.maxHp;
		let lostHP = maxHP - self.hp;
		let maxHealBarSize = lostHP / maxHP * 100;

		let healAmount = amount;

		if (!amount) {
			healAmount = db.items[this.itemId].heal;
		}

		state.turnHeal += healAmount;
		tempBar.style.width = Math.min(state.turnHeal / self.maxHp * 100, maxHealBarSize) + "%";
	}

	shield(amount) {
		let shieldEl;
		let self;
		let previousShield;
		if (state.turn === "player") {
			self = state.player;
			shieldEl = document.querySelector("#encounter .player-hp .shield-wrapper");
			previousShield = state.player.shield;
		} else {
			self = state.currentMob;
			shieldEl = document.querySelector("#encounter .enemy-hp .shield-wrapper");
			previousShield = state.currentMob.shield;
		}

		let shieldAmount = amount;
		if (!amount) {
			shieldAmount = db.items[this.itemId].shield;
		}
		state.turnShield += shieldAmount;

		shieldEl.style.display = "flex";

		shieldEl.querySelector(".shield-amount").textContent = previousShield + state.turnShield;
		shieldEl.classList.add("healed");
	}

	poison(amount){
		let target;
		let poisonEl;
		if (state.turn === "player") {
			target = state.currentMob;
			poisonEl = document.querySelector("#encounter .enemy-hp .poison-wrapper");
		} else {
			target = state.player;
			poisonEl = document.querySelector("#encounter .player-hp .poison-wrapper");
		}

		let previousPoison = target.poison;

		let poisonAmount = amount;
		if (!amount) {
			poisonAmount = db.items[this.itemId].poison;
		}

		state.turnPoison += poisonAmount;

		poisonEl.style.display = "flex";

		poisonEl.querySelector(".poison-amount").textContent = previousPoison + state.turnPoison;
	}

	//Effecs by item
	basic_attack_1() {
		let amount;
		switch (this.result) {
			case 1:
				amount = db.items[this.itemId].damage;
				this.successful();
				this.dealDame(amount);
				break;
			case 2:
				amount = db.items[this.itemId].damage2;
				this.successful();
				this.dealDame(amount);
				break;
			case 3:
				amount = db.items[this.itemId].damage3;
				this.successful();
				this.dealDame(amount);
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
				this.piercingDamage();
				break;
		}
	}
	heal_1() {
		let amount;
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				amount = db.items[this.itemId].heal;
				this.heal(amount);
				this.successful();
				break;
			case 3:
				amount = db.items[this.itemId].heal2;
				this.heal(amount);
				this.successful();
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
	attack_heal() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.dealDame();
				this.successful();
				break;
			case 3:
				this.heal();
				this.successful();
				break;
		}
	}
	eldertide_timepiece() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				if (!state.tempFate) {
					state.tempFate = 0;
				}
				state.tempFate++;
				this.successful();
				break;
		}
	}
	mana1() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				if (!state.tempMana) {
					state.tempMana = 0;
				}
				state.tempMana++;
				this.successful();
				break;
		}
	}
	bat_bite() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.dealDame();
				this.successful();
				break;
		}
	}
	shield1() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.shield();
				this.successful();
				break;
		}
	}
	poison1() {
		switch (this.result) {
			case 1:
				this.unsuccessful();
				break;
			case 2:
				this.poison();
				this.successful();
				break;
		}
	}
}