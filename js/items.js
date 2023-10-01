/* ··········································································*/
/* ··········································································*/
/* ···························  I M P O R T S  ······························*/
/* ··········································································*/
/* ··········································································*/
import { db, state } from "./db.js";
import { generateDisc } from "./soul.js";


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

			resolve();
		} catch (error) {
			console.log("An error occurred trying to use an item: " + error.message);
			reject(error);
		}
	})
};