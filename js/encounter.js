/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { goTo, updateHP, updateFate, updateCoins, wait, removeSuccessDiscStates, secondaryAction, getSlotShortDesc, rand } from "./helpers.js";
import { db, state } from "./db.js";
import { generateDisc, spin } from "./discs.js";


/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···················  E N C O U N T E R   S C R E E N  ····················*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Load encounter
/*===========================================================================*/
export async function loadEncounter(mobId) {
	try {
		// Reset player state
		state.player.cardsInUse = [];
		state.player.cardsManaPaid = [];
		state.player.mana = state.player.startingMana;
		state.player.shield = 0;
		state.fatePrice = 1;

		// Generate the encounter card
		await generateEncounterCard(mobId);

		// Navigate to the encounter screen
		goTo("encounter");

		// Toggle the player's turn
		toggleTurn(true);
	} catch (error) {
		console.error("An error occurred when trying to load the encounter: " + error);
	}
}

/*===========================================================================*/
// Generate encounter UI
/*===========================================================================*/
async function generateEncounterCard(mobId) {
	return new Promise((resolve, reject) => {
		try {

			// Mob data
			const mobData = db.mobs[mobId];
			state.mob = { ...mobData, shield: 0, poison: 0, maxHp: mobData.hp, mobid: mobId };

			// Reset secondary action defaults
			const changeFateButton = document.querySelector(".change-fate");
			const secondaryAction = document.querySelector(".secondary-action");
			const fatePriceElement = document.querySelector(".fate-price");

			changeFateButton.disabled = true;
			secondaryAction.style.display = "none";
			fatePriceElement.textContent = state.fatePrice;

			// Player Slots
			const playerSlots = document.querySelector("#playerDiscs");
			playerSlots.innerHTML = "";
			for (let i = 0; i < state.player.slots; i++) {
				let newSlot = document.createElement("div");
				newSlot.classList.add("slot");
				playerSlots.append(newSlot);
			}
			playerSlots.style.display = "flex";

			// Mob slots
			const mobSlots = document.querySelector("#mobDiscs");
			mobSlots.innerHTML = "";
			for (let i = 0; i < mobData.slots; i++) {
				let newSlot = document.createElement("div");
				newSlot.classList.add("slot");
				mobSlots.append(newSlot);
			}
			mobDiscs.style.display = "none";

			// Random mob image and text rotations
			document.querySelector(".mob-image-wrapper").dataset.rotate = mobData.img_rotation;
			document.querySelector(".mob-info-wrapper").dataset.rotate = mobData.desc_rotation;

			// Mob image and description
			const encounter = document.querySelector("#encounter");
			encounter.querySelector(".mob-image").src = "./assets/img/mobs/" + mobId + ".png";
			encounter.querySelector(".mobName").textContent = mobData.name;
			encounter.querySelector(".mobDesc").textContent = mobData.desc;
			const skillsEl = encounter.querySelector(".mobSkills");
			skillsEl.innerHTML = mobData.skills.map(skill => `<p>+ ${skill}</p>`).join('');

			// Update HP
			updateHP();

			resolve();
		} catch (error) {
			console.log("An error occurred generating the encounter: " + error.message);
			reject(error);
		}
	})
}


/*===========================================================================*/
// Turn System
/*===========================================================================*/
export async function toggleTurn(start) {
	// Get elements
	const playerBoard = document.querySelector("#playerBoard");
	const mainAction = playerBoard.querySelector(".main-action");
	const secondaryAction = playerBoard.querySelector(".secondary-action");
	const noAction = playerBoard.querySelector(".no-action");
	const playerDiscs = document.querySelector("#playerDiscs");
	const mobDiscs = document.querySelector("#mobDiscs");
	const encounter = document.querySelector("#encounter");

	// Reset turn data
	await resetTemporalEffects();

	// Toggle turn
	if (!start) {
		state.turn = state.turn === "player" ? "mob" : "player";
	}

	let turnCharacter;
	if (state.turn === "player") {
		turnCharacter = state.player;
	} else {
		turnCharacter = state.mob;
	}

	// Deal poison damage
	const poisonWrapper = encounter.querySelector(`.${state.turn}-hp .poison-wrapper`);
	const poisonAmountElement = poisonWrapper.querySelector(".poison-amount");
	turnCharacter.hp -= turnCharacter.poison;
	turnCharacter.poison = Math.max(turnCharacter.poison - 1, 0);
	poisonAmountElement.textContent = turnCharacter.poison;
	await updateHP();

	// Hide poison if is at 0
	if (state.player.poison === 0) {
		document.querySelector("#encounter .player-hp .poison-wrapper").style.display = "none";
	}
	if (state.mob.poison === 0) {
		document.querySelector("#encounter .mob-hp .poison-wrapper").style.display = "none";
	}

	// Hide shield if is at 0
	if (state.player.shield === 0) {
		document.querySelector("#encounter .player-hp .shield-wrapper").style.display = "none";
	}
	if (state.mob.shield === 0) {
		document.querySelector("#encounter .mob-hp .shield-wrapper").style.display = "none";
	}

	// Remove un/successful states
	removeSuccessDiscStates();

	// Reset UI
	if (state.turn === "player" || start) {
		mainAction.style.display = "flex";
		secondaryAction.style.display = "none";
		noAction.style.display = "none";
		state.fatePrice = 1;
		document.querySelector(".fate-price").textContent = state.fatePrice;
		playerDiscs.style.display = "flex";
		mobDiscs.style.display = "none";
	}

	else if (state.turn === "mob") {
		mainAction.style.display = "none";
		secondaryAction.style.display = "none";
		noAction.style.display = "flex";
		playerDiscs.style.display = "none";
		mobDiscs.style.display = "flex";
		document.querySelectorAll("#mobDiscs .slot").forEach(slot => {
			slot.innerHTML = "";
			slot.classList.remove("charged");
		});
		await wait(200);
		await enemyAttack();
	}
}


/*===========================================================================*/
// Victory
/*===========================================================================*/
export async function victory() {
	document.querySelector("#xpscreen").style.display = "flex";
	generateXpScreen();
}

/*===========================================================================*/
// Generate XP screen
/*===========================================================================*/
async function generateXpScreen() {
	return new Promise(async (resolve, reject) => {
		try {

			// Get elements
			const xpscreen = document.querySelector("#xpscreen");
			const lvl = xpscreen.querySelector(".lvl span");
			const [toTargetElement, targetElement] = xpscreen.querySelectorAll(".bar span");
			const bar = xpscreen.querySelector(".progress");
			const reward = document.querySelector("#xpscreen .reward span");
			const lvlUpReward = document.querySelectorAll(".lvl-up-reward");


			// Update player's coins and display reward
			// TO-DO: Rewards per mob, or standar reward for each mob (with rand variation)
			const coinsReward = state.mob.lvl;
			state.player.coins += coinsReward;
			reward.textContent = "+" + coinsReward;
			updateCoins();

			// Fetch XP data
			const lvlArr = db.xpTiers;
			let lvlIndex = state.player.lvl - 1;
			let target = lvlArr[lvlIndex + 1];
			const gainedXP = state.mob.lvl;
			const oldTotalXP = state.player.xp;
			const newTotalXP = oldTotalXP + gainedXP;

			// Display current level and progress bar
			lvlUpReward.forEach(el => {
				el.style.display = "none";
			});
			lvl.textContent = state.player.lvl;
			targetElement.textContent = target - lvlArr[lvlIndex];
			toTargetElement.textContent = Math.min(oldTotalXP - lvlArr[lvlIndex], target - lvlArr[lvlIndex]);
			bar.style.width = ((oldTotalXP - lvlArr[lvlIndex]) * 100 / (target - lvlArr[lvlIndex])) + "%";

			// Update player's XP
			state.player.xp = newTotalXP;

			// Update stats
			await wait(500);
			toTargetElement.textContent = Math.min(newTotalXP - lvlArr[lvlIndex], target - lvlArr[lvlIndex]);
			bar.style.width = ((newTotalXP - lvlArr[lvlIndex]) * 100 / (target - lvlArr[lvlIndex])) + "%";
			await wait(1000);

			if (newTotalXP >= target) {
				state.player.lvl++;
				bar.style.transition = "0s";
				bar.style.width = "0%";
				lvl.textContent = state.player.lvl;
				const newLvlIndex = state.player.lvl - 1;
				target = lvlArr[newLvlIndex + 1];
				targetElement.textContent = target - lvlArr[newLvlIndex];
				toTargetElement.textContent = Math.min(newTotalXP - lvlArr[newLvlIndex], target - lvlArr[newLvlIndex]);

				// Level up reward
				// TO-DO
				lvlUpReward.forEach(el => {
					el.style.display = "flex";
				});
				state.player.maxHp += 5;
				state.player.hp = state.player.maxHp;
				state.player.fate += 10;
				updateFate();

				// Update stats again
				await wait(500);
				bar.style.transition = "1s";
				bar.style.width = ((newTotalXP - lvlArr[newLvlIndex]) * 100) / (target - lvlArr[newLvlIndex]) + "%";
			}

			resolve();

		} catch (error) {
			console.log("An error occurred displaying XP screen: " + error.message);
			reject(error);
		}
	});
}



/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ·························  F U N C T I O N S  ····························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Reset temporal damage/heal/shield
/*===========================================================================*/
async function resetTemporalEffects() {
	return new Promise(async (resolve, reject) => {
		try {

			// Reset damage, piercing damage, heal, shield, and poison
			state.turnDamage = 0;
			state.turnPiercingDamage = 0;
			state.turnHeal = 0;
			state.turnShield = 0;
			state.turnPoison = 0;

			// Reset temporal damage and temporal heal bars
			document.querySelectorAll("#encounter .progress .damage-bar, .heal-bar").forEach(el => {
				el.style.width = "0%";
			});

			// Reset shields
			document.querySelector("#encounter .player-hp .shield-amount").textContent = state.player.shield;
			document.querySelector("#encounter .mob-hp .shield-amount").textContent = state.mob.shield;
			document.querySelectorAll("#encounter .shield-wrapper").forEach(el => {
				el.classList.remove("healed", "damaged");
			});

			// Reset poison
			document.querySelector("#encounter .player-hp .poison-amount").textContent = state.player.poison;
			document.querySelector("#encounter .mob-hp .poison-amount").textContent = state.mob.poison;

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}

/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ················  C A R D S,   S L O T S,   D I S C S  ···················*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Place card disc in slot
/*===========================================================================*/
export async function placeCardInSlot(cardId) {
	return new Promise(async (resolve, reject) => {
		try {

			// Get Elements
			const slot = document.querySelector(".target-slot");
			const disc = slot.querySelector(".disc");

			if (state.turn === "player") {

				// Remove old card from cards in use
				if (disc && disc.dataset.cardid) {
					state.player.cardsInUse = state.player.cardsInUse.filter(x => x !== disc.dataset.cardid);
				}

				// Add card to cards in use
				state.player.cardsInUse.push(cardId);
			}


			// Generate disc
			let newDisc = document.createElement("div");
			const randomID = "id-" + crypto.randomUUID();
			newDisc.id = randomID;

			// Add class
			newDisc.classList.add("disc");

			// Insert disc in slot
			slot.innerHTML = "";
			slot.append(newDisc);

			// Display short description
			const shortDesc = document.createElement("div");
			shortDesc.classList.add("slot-short-desc");
			shortDesc.innerHTML = getSlotShortDesc(cardId);
			slot.appendChild(shortDesc);

			// Modify classes
			slot.classList.remove("target-slot");
			slot.classList.add("charged");

			generateDisc(cardId, randomID);

			resolve();
		} catch (error) {
			console.log("An error occurred trying to place a card in a slot: " + error.message);
			reject(error);
		}
	})
};


/*===========================================================================*/
// Stop using card
/*===========================================================================*/
export async function stopUsingCard() {
	return new Promise(async (resolve, reject) => {
		try {

			// Get data
			const slot = document.querySelector(".target-slot");
			const cardId = document.querySelector(".target-slot .disc").dataset.cardid;

			// Remove from used cards
			state.player.cardsInUse = state.player.cardsInUse.filter(x => x !== cardId);

			// Remove element
			slot.classList.remove("charged");
			slot.innerHTML = "";

			resolve();
		} catch (error) {
			console.log("An error occurred trying to stop using a card: " + error.message);
			reject(error);
		}
	})
};



/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ····························  C O M B A T  ·······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Attack
/*===========================================================================*/
/////////////////
// Normal attack
/////////////////
export async function attack() {
	return new Promise(async (resolve, reject) => {
		try {
			// Hide main action
			const mainActionElement = document.querySelector("#playerBoard .main-action");
			mainActionElement.style.display = "none";

			// Spin discs
			await spinDiscs();

			// Display secondary action
			secondaryAction();

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}


/////////////////
// Change fate
/////////////////
export async function changeFate() {
	const fateBtn = document.querySelector(".change-fate");
	const endBtn = document.querySelector(".end-turn");

	// Clear disc states and reset effects
	removeSuccessDiscStates();
	await resetTemporalEffects();
	await wait(450);

	// Temporarily disable buttons
	fateBtn.disabled = true;
	endBtn.disabled = true;

	// Subtract fate and update it
	state.player.fate -= state.fatePrice;
	updateFate();

	// Double the price and update the button text
	state.fatePrice *= 2;
	document.querySelector(".fate-price").textContent = state.fatePrice;

	// Spin discs
	await spinDiscs();

	// Re-enable buttons if there's enough fate
	if (state.player.fate >= state.fatePrice) {
		fateBtn.disabled = false;
	}

	endBtn.disabled = false;
}

/////////////////
// Enemy attack
/////////////////
async function enemyAttack() {
	return new Promise(async (resolve, reject) => {
		try {

			const pattern = state.mob.patterns[Math.floor(Math.random() * state.mob.patterns.length)];
			const slots = document.querySelectorAll("#mobDiscs .slot");

			for (let i = 0; i < slots.length; i++) {
				const slot = slots[i];

				slot.classList.add("target-slot");
				await wait(await rand(200, 1200));
				await placeCardInSlot(pattern[i]);
			}

			await wait(1200);
			await spinDiscs();
			await wait(1200);
			await applyDiscsEffects();

			toggleTurn();

			resolve();
		} catch (error) {
			console.log("An error occurred during the enemy's attack: " + error.message);
			reject(error);
		}
	});
}


/*===========================================================================*/
// Spin discs and call the effects of each one
/*===========================================================================*/
async function spinDiscs() {
	return new Promise(async (resolve, reject) => {
		try {

			const turnCharacter = state.turn;
			const discSelector = `#${turnCharacter}Discs .slot.charged`;
			const discs = document.querySelectorAll(discSelector);

			for (const disc of discs) {
				// Get elements
				const discId = disc.querySelector(".disc").id;
				const discElement = document.getElementById(discId);

				// Spin the disc
				const result = await spin(discId);

				// Dynamically call the effect method based on cardId
				const cardId = discElement.dataset.cardid;
				const effects = new Effects(result, cardId, discElement);
				if (effects[cardId] && typeof effects[cardId] === 'function') {
					effects[cardId]();
				} else {
					console.error(`Unknown card ID: ${cardId}`);
				}
			}

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}


/*===========================================================================*/
// Apply discs' effects
/*===========================================================================*/
export async function applyDiscsEffects() {
	return new Promise(async (resolve, reject) => {
		try {

			/////////////////
			// Get turn targets
			/////////////////
			const isPlayerTurn = state.turn === "player";
            const self = isPlayerTurn ? state.player : state.mob;
            const target = isPlayerTurn ? state.mob : state.player;


			/////////////////
			// Deal damage
			/////////////////

			// Apply shield to reduce damage
            const shield = target.shield;
            const remainingDamage = Math.max(0, state.turnDamage - shield);
            target.shield = Math.max(0, shield - state.turnDamage);

			// Calculate the total damage
            const totalDamage = state.turnPiercingDamage + remainingDamage;

			// Deal damage to the target
            target.hp = Math.max(target.hp - totalDamage, 0);
			

			// Reset health bars
			document.querySelectorAll(".damage-bar").forEach(el => {
				el.style.width = "0%";
			});

			// Log damage
			console.log("Initial damage: " + (state.turnDamage + state.turnPiercingDamage) + ". Dealt: " + totalDamage + ".");


			/////////////////
			// Heals
			/////////////////
			self.hp = Math.min(self.hp + state.turnHeal, self.maxHp);
			document.querySelectorAll(".heal-bar").forEach(el => { el.style.width = "0%"; });


			/////////////////
			// Shield
			/////////////////
			self.shield = self.shield + state.turnShield;
			state.turnShield = 0;


			/////////////////
			// Poison
			/////////////////
			target.poison = target.poison + state.turnPoison;
			state.turnPoison = 0;


			/////////////////
			// Gain mana
			/////////////////
			if (state.tempMana && state.tempMana > 0) {
				state.player.mana += state.tempMana;
				state.tempMana = 0;
			}


			/////////////////
			// Gain fate
			/////////////////
			if (state.tempFate && state.tempFate > 0) {
				state.player.fate += state.tempFate;
				state.tempFate = 0;
			}
			updateFate();

			await updateHP();

			resolve();
		} catch (error) {
			console.log("An error occurred during attack: " + error.message);
			reject(error);
		}
	});
}


/*===========================================================================*/
// Card effects
/*===========================================================================*/
class Effects {

	/////////////////
	// Constructor
	/////////////////
	constructor(result, cardId, disc) {
		this.result = result;
		this.cardId = cardId;
		this.disc = disc;
	}

	/////////////////
	// Helper functions
	/////////////////
	successful() { this.disc.parentElement.classList.add("successful"); }
	unsuccessful() { this.disc.parentElement.classList.add("unsuccessful"); }

	/////////////////
	// Common effects
	/////////////////
	dealDame(amount) {
		let target;
		let tempBar;
		let shield;
		let shieldEl;
		if (state.turn === "player") {
			target = state.mob;
			tempBar = document.querySelector("#encounter .mob-hp .progress .damage-bar");
			shield = target.shield;
			shieldEl = document.querySelector("#encounter .mob-hp .shield-wrapper");
		} else {
			target = state.player;
			tempBar = document.querySelector("#encounter .player-hp .progress .damage-bar");
			shield = target.shield;
			shieldEl = document.querySelector("#encounter .player-hp .shield-wrapper");
		}

		// Get damage of this card
		let damageAmount = amount;
		if (amount === undefined) {
			if ( db.cards[this.cardId].damage) {
				damageAmount = db.cards[this.cardId].damage;
			} else {
				damageAmount = 0;
			}
		}

		// Add damage to this turn's previous damage
		state.turnDamage += damageAmount;

		// Display damaged shield
		state.turnDamage > 0 ? shieldEl.classList.add("damaged") : shieldEl.classList.remove("damaged");

		// Subtract damage from shield
		if (shield > 0) {
			shieldEl.querySelector(".shield-amount").textContent = Math.max(shield - state.turnDamage, 0);
		}

		// Get remaining damage after shield
		let remainingDamage;
		if (shield >= state.turnDamage) {
			remainingDamage = 0;
		} else {
			remainingDamage = state.turnDamage - shield;
		}

		// Display damage on health bar
		tempBar.style.width = (state.turnPiercingDamage + remainingDamage) / target.hp * 100 + "%";
	}

	piercingDamage(amount){
		let target;
		let tempBar;
		let shield;
		if (state.turn === "player") {
			target = state.mob;
			shield = target.shield;
			tempBar = document.querySelector("#encounter .mob-hp .progress .damage-bar");
		} else {
			target = state.player;
			shield = target.shield;
			tempBar = document.querySelector("#encounter .player-hp .progress .damage-bar");
		}

		// Get damage of this card
		let damageAmount = amount;
		if (amount === undefined) {
			if ( db.cards[this.cardId].damage) {
				damageAmount = db.cards[this.cardId].damage;
			} else {
				damageAmount = 0;
			}
		}

		// Add damage to this turn's previous damage
		state.turnPiercingDamage += damageAmount;

		// Get non-piercing damage to add it up
		// Get remaining damage after shield
		let remainingDamage;
		if (shield >= state.turnDamage) {
			remainingDamage = 0;
		} else {
			remainingDamage = state.turnDamage - shield;
		}

		// Display damage on health bar
		tempBar.style.width = (state.turnPiercingDamage + remainingDamage) / target.hp * 100 + "%";
	}

	heal(amount) {
		let tempBar;
		let self;
		if (state.turn === "player") {
			self = state.player;
			tempBar = document.querySelector("#encounter .player-hp .heal-bar");
		} else {
			self = state.mob;
			tempBar = document.querySelector("#encounter .mob-hp .heal-bar");
		}

		let maxHP = self.maxHp;
		let lostHP = maxHP - self.hp;
		let maxHealBarSize = lostHP / maxHP * 100;

		let healAmount = amount;
		if (amount === undefined) {
			if ( db.cards[this.cardId].heal) {
				healAmount = db.cards[this.cardId].heal;
			} else {
				healAmount = 0;
			}
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
			self = state.mob;
			shieldEl = document.querySelector("#encounter .mob-hp .shield-wrapper");
			previousShield = state.mob.shield;
		}

		let shieldAmount = amount;
		if (amount === undefined) {
			if ( db.cards[this.cardId].shield) {
				shieldAmount = db.cards[this.cardId].shield;
			} else {
				shieldAmount = 0;
			}
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
			target = state.mob;
			poisonEl = document.querySelector("#encounter .mob-hp .poison-wrapper");
		} else {
			target = state.player;
			poisonEl = document.querySelector("#encounter .player-hp .poison-wrapper");
		}

		let previousPoison = target.poison;

		let poisonAmount = amount;
		if (amount === undefined) {
			if ( db.cards[this.cardId].poison) {
				poisonAmount = db.cards[this.cardId].poison;
			} else {
				poisonAmount = 0;
			}
		}
		state.turnPoison += poisonAmount;

		poisonEl.style.display = "flex";

		poisonEl.querySelector(".poison-amount").textContent = previousPoison + state.turnPoison;
	}

	/////////////////
	// Effecs by card
	/////////////////
	basic_attack_1() {
		let amount;
		switch (this.result) {
			case 1:
				amount = db.cards[this.cardId].damage;
				this.successful();
				this.dealDame(amount);
				break;
			case 2:
				amount = db.cards[this.cardId].damage2;
				this.successful();
				this.dealDame(amount);
				break;
			case 3:
				amount = db.cards[this.cardId].damage3;
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
				amount = db.cards[this.cardId].heal;
				this.heal(amount);
				this.successful();
				break;
			case 3:
				amount = db.cards[this.cardId].heal2;
				this.heal(amount);
				this.successful();
				break;
		}
	}
	double_damage() {
		switch (this.result) {
			case 1:
				state.turnDamage = state.turnDamage * 2;
				state.turnPiercingDamage = state.turnPiercingDamage * 2;
				this.dealDame();
				this.successful();
				break;
			case 2:
				state.turnDamage = 0;
				state.turnPiercingDamage = 0;
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