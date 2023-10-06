/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
import { db, state } from "./db.js";
import { generateDisc } from "./soul.js";
import { wait } from "./helpers.js";


/*==========================================*/
// Use item
/*==========================================*/
export async function useitem(itemId) {
	return new Promise(async (resolve, reject) => {
		try {

			//Spend item
			state.player.items[itemId] -= 1;

			//Add item to items in use
			if (!state.player.itemsInUse[itemId]) {
				state.player.itemsInUse[itemId] = 0;
			}
			state.player.itemsInUse[itemId] += 1;

			//Borrowed Soul
			if (["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"].includes(itemId)) {
				const amountOfSoulBorrowed = {
					borrowed_soul_15: 15,
					borrowed_soul_30: 30,
					borrowed_soul_55: 55
				};

				let totalBorrowedSoul = 0;
				for (const key in amountOfSoulBorrowed) {
					if (state.player.itemsInUse[key] > 0) {
						totalBorrowedSoul += amountOfSoulBorrowed[key];
					}
				}

				let temporalPlayerSoul = Math.min(state.player.soul, 95);
				const borrowedPercentage = Math.floor((totalBorrowedSoul / 100) * temporalPlayerSoul);
				temporalPlayerSoul -= borrowedPercentage;
				generateDisc([temporalPlayerSoul, borrowedPercentage], "#playerSoul");
			}

			else if (itemId === "test1") {
				let newDisc = document.createElement("div");
				const randomID = crypto.randomUUID();
				newDisc.id = "id-" + randomID;
				await insertDisc(newDisc);
				console.log("id-"+randomID);
				generateDisc([state.currentMob.soul], "#id-"+randomID, ["#000", "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);})]);
			}

			else if (itemId === "test2") {
				let newDisc = document.createElement("div");
				const randomID = crypto.randomUUID();
				newDisc.id = "id-" + randomID;
				await insertDisc(newDisc);
				generateDisc([10], "#id-"+randomID, ["#000", "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);})]);
			}

			resolve();
		} catch (error) {
			console.log("An error occurred trying to use an item: " + error.message);
			reject(error);
		}
	})
};

/*==========================================*/
// Insert disc
/*==========================================*/
export async function insertDisc(disc) {
	return new Promise(async (resolve, reject) => {
		try {
			//Elements
			const playerDiscs = document.querySelector("#playerDiscs");
			const elementArray = Array.from(playerDiscs.children);

			//Classes
			disc.classList.add("disc");

			//Insert
			//TO-DO: Choose placement around main disc
			if (elementArray.length < 6) {
				if (elementArray.length % 2 === 0) {
					playerDiscs.append(disc);
				} else {
					playerDiscs.prepend(disc);
				}
			} else {
				playerDiscs.append(disc);
			}

			resolve();
		} catch (error) {
			console.log("An error occurred inserting a disc: " + error.message);
			reject(error);
		}
	})
};