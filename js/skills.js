/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
import { updateHP } from "./helpers.js?v=0.11.2";
import { db, state } from "./db.js?v=0.11.2";


/* ··········································································*/
/* ··········································································*/
/* ··········································································*/
/* ··························  F U N C T I O N S  ···························*/
/* ··········································································*/
/* ··········································································*/
/* ··········································································*/

/*===========================================================================*/
// Buy skill
/*===========================================================================*/
export function buySkill(skill) {
	state.player.skills.push(skill);

	switch (skill) {
		case "skillslot2":
		case "skillslot3":
		case "skillslot4":
		case "skillslot5":
			state.player.slots = Math.min(state.player.slots + 1, 5)
			break;
		case "skillmaxhp1":
		case "skillmaxhp2":
		case "skillmaxhp3":
		case "skillmaxhp4":
			state.player.maxHp += 10;
			state.player.hp = Math.min(state.player.hp + 10, state.player.maxHp);
			updateHP();
			break;
		case "skillmana1":
		case "skillmana2":
		case "skillmana3":
			state.player.startingMana += 2;
			break;
		case "skillfate2":
			state.startingFatePrice = 0;
			break;
	}
}


/*===========================================================================*/
// Update skilltree
/*===========================================================================*/
export function updateSkilltree() {
	const skills = document.querySelectorAll("#skilltree .skill[data-skillid]");
	skills.forEach(skillElement => {
		const skillId = skillElement.dataset.skillid;

		// Already bought
		if (state.player.skills.includes(skillId)) {
			skillElement.dataset.skillstate = 2;
		}

		// Available
		const isAvailable = db.skills[skillId].requires.some(item => state.player.skills.includes(item));
		if (isAvailable && skillElement.dataset.skillstate === "0") {
			if (skillId === "skillslot3") {
				if (state.player.skills.includes("skillslot2")) {
					skillElement.dataset.skillstate = 1;
				}
			} else if (skillId === "skillslot4") {
				if (state.player.skills.includes("skillslot3")) {
					skillElement.dataset.skillstate = 1;
				}
			} else if (skillId === "skillslot5"){
				if (state.player.skills.includes("skillslot4")) {
					skillElement.dataset.skillstate = 1;
				}
			} else {
				skillElement.dataset.skillstate = 1;
			}
		}
	});
}