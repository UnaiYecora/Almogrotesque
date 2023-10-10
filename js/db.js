export var state = {
	player: {
		soul: [75],
		hp: 8,
		maxHp: 12,
		playerTurn: false,
		fate: 5000,
		xp: 0,
		lvl: 1,
		coins: 2300,
		slots: 3,
		items: {
			basic_attack_1: 99,
			basic_attack_2: 99,
			heal_1: 99,
			double_damage: 99
		},
		itemsInUse: [],
	},
	turn: "player",
	fatePrice: 1,
}

export const db = {
	levels: [
		{
			name: "Crossroad",
			desc: "A rustic crossroad, where well-trodden paths converge under the open sky, inviting travelers to choose their fate — each direction hiding both promise and peril.",
			stores: 3,
			chests: 1,
			doors: ["Outskirts path"],
			spawns: ["master_frog", "frog", "rat", "rat_bandit", "lagoon_dweller", "seridra", "eggman", "chest"],
			items: ["basic_attack_1", "basic_attack_2"],
			bg: "crossroad",
		},
		{
			name: "Outskirts path",
			desc: "A serpentine path through untamed wilderness, where ancient trees and wildflowers sway in the breeze, concealing secrets and stories of those who came before.",
			stores: 2,
			chests: 1,
			doors: ["Village"],
			spawns: ["bat", "frog", "rat", "rat_bandit", "rat_bandit", "spider", "homunculus", "kobold", "acolyte", "bandit"],
			items: ["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"],
			bg: "outskirt"
		},
		{
			name: "Village",
			desc: "As the path unwinds, an eerie village emerges — its dilapidated cottages and empty streets concealing the ominous presence that looms over this forsaken place.",
			stores: 4,
			chests: 3,
			doors: ["Old forest", "Cemetery"],
			spawns: ["goblin", "kobold", "cultist", "acolyte", "bandit", "rat_bandit"],
			items: ["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"],
			bg: "crossroad"
		},
		{
			name: "Old forest",
			desc: "Its gnarled trees and twisted roots create a labyrinthine realm, where the dappled sunlight hides the lurking threats that prowl beneath the canopy.",
			stores: 2,
			chests: 1,
			doors: ["Cemetery"],
			spawns: ["goblin", "bat", "frog", "rat", "rat_bandit", "spider", "homunculus", "kobold", "cultist", "acolyte", "shrub", "bandit", "crab"],
			items: ["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"],
			bg: "forest"
		},
		{
			name: "Cemetery",
			desc: "Amidst the graves of the forgotten, shadows writhe beneath the cold, unfeeling stones, and the silence is broken only by the mournful wails of unseen creatures.",
			stores: 1,
			chests: 2,
			doors: ["Church"],
			spawns: ["goblin", "kobold", "cultist", "acolyte", "rat_bandit", "bandit", "crab", "skeleton", "ghoul"],
			items: ["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"],
			bg: "cemetery"
		},
		{
			name: "Church",
			desc: "Beyond the village's edge,  a decrepit church stands, its ancient stones carrying the weight of a grim past, where shadows whisper the secrets of unspeakable horrors hidden within.",
			stores: 3,
			chests: 3,
			doors: [],
			spawns: ["goblin", "homunculus", "kobold", "cultist", "acolyte", "shrub", "bandit", "crab", "skeleton", "ghoul", "specter"],
			items: ["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"],
			bg: "outskirt"
		},
	],
	xpTiers: [0, 2, 6, 13, 25, 45, 70, 100, 135, 180, 225, 1224],
	basicItems: {
		fate_5: {
			name: "Fate x5",
			desc: "Allows you to change your fate.",
			icon: "fate",
			price: 5,
			gives: "fate",
			amount: 5,
		},
		fate_20: {
			name: "Fate x20",
			desc: "Allows you to change your fate.",
			icon: "fate",
			price: 20,
			gives: "fate",
			amount: 20,
		},
		HP: {
			name: "Heal x1",
			desc: "Recover 1 HP",
			icon: "heart",
			price: 5,
			gives: "hp",
			amount: 1,
		},
	},
	items: {
		basic_attack_1: {
			name: "Dagger",
			desc: "Deal 3 damage.",
			short: ["x3 Damage"],
			icon: "frog.png",
			price: 0,
			hitrate: [50],
			damage: 3,
			colors: ["#000", "#872b1e"],
		},
		basic_attack_2: {
			name: "Handaxe",
			desc: "Deal 6 damage.",
			short: ["x6 Damage"],
			icon: "master_frog.png",
			price: 0,
			hitrate: [25],
			damage: 6,
			colors: ["#000", "#81352a"],
		},
		heal_1: {
			name: "Heal potion",
			desc: "Heal 3HP or 10HP.",
			short: ["Heal 3HP", "Heal 10HP"],
			icon: "seridra.png",
			price: 0,
			hitrate: [30, 5],
			damage: 0,
			heal: 3,
			heal2: 10,
			colors: ["#000", "#0c4015", "#105b19"],
		},
		double_damage: {
			name: "Aggresive stance",
			desc: "Damage from previous cards are doubled or lost.",
			short: ["Double previous damage", "Lose previous damage"],
			icon: "rat_bandit.png",
			price: 0,
			hitrate: [50, 50],
			damage: 0,
			heal: 0,
			heal2: 10,
			colors: ["#872b1e", "#494237"],
		},
	},
	mobs: {
		frog: {
			name: "Frog",
			img: "frog.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Small, slimy amphibians known for their croaking calls and agile leaps. They often lurk in murky waters and can be encountered in damp, gloomy environments.",
			soul: [93],
			lvl: 1,
			hp: 12,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"],
				["heal_1", "heal_1"],
				["basic_attack_1", "heal_1"],
			],
		},
		master_frog: {
			name: "Master Frog",
			img: "master_frog.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Small, slimy amphibians known for their croaking calls and agile leaps. They often lurk in murky waters and can be encountered in damp, gloomy environments.",
			soul: [37],
			lvl: 2,
			hp: 20,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		rat: {
			name: "Rat",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A scuttling rodent with sharp teeth, rats thrive in dimly lit places and are known for spreading disease and infesting dungeons and sewers.",
			soul: [69],
			lvl: 1,
			hp: 12,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		rat_bandit: {
			name: "Rat bandit",
			img: "rat_bandit.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A scuttling rodent with sharp teeth, rats thrive in dimly lit places and are known for spreading disease and infesting dungeons and sewers.",
			soul: [57],
			lvl: 2,
			hp: 18,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		lagoon_dweller: {
			name: "Lagoon Dweller",
			img: "lagoon_dweller.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A scuttling rodent with sharp teeth, rats thrive in dimly lit places and are known for spreading disease and infesting dungeons and sewers.",
			soul: [57],
			lvl: 2,
			hp: 28,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		seridra: {
			name: "Witch (Seridra)",
			img: "seridra.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A scuttling rodent with sharp teeth, rats thrive in dimly lit places and are known for spreading disease and infesting dungeons and sewers.",
			soul: [37],
			lvl: 3,
			hp: 42,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		eggman: {
			name: "Century egg",
			img: "eggman.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A scuttling rodent with sharp teeth, rats thrive in dimly lit places and are known for spreading disease and infesting dungeons and sewers.",
			soul: [37],
			lvl: 3,
			hp: 30,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		chest: {
			name: "Chest",
			img: "chest.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A scuttling rodent with sharp teeth, rats thrive in dimly lit places and are known for spreading disease and infesting dungeons and sewers.",
			soul: [37],
			lvl: 3,
			hp: 8,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		bat: {
			name: "Bat",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Denizens of the night and elegantly cloaked in obsidian wings, bats are skilled hunters of insects and small prey.",
			soul: [84],
			lvl: 1,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		spider: {
			name: "Spider",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Eight-legged arachnids, masters of stealth in their silk-spun lairs. They spin intricate webs to ensnare prey and can be found in dark corners of dungeons, forests, and caves.",
			soul: [67],
			lvl: 1,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		goblin: {
			name: "Goblin",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Small, malicious humanoid creatures with greenish skin and a penchant for mischief. They are often found in tribal societies, lurking in forests, caves, and ruins, and are known for their cunning traps and love of shiny loot.",
			soul: [72],
			lvl: 3,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		homunculus: {
			name: "Homunculus",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A twisted, malevolent creation gone rogue. This once-servile homunculus has turned against its master, armed with dark enchantments and a sinister desire for freedom.",
			soul: [57],
			lvl: 2,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		kobold: {
			name: "Kobold",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Small, reptilian humanoids known for their cunning and devious traps. They dwell in underground lairs, serving as loyal minions to more powerful creatures or plotting their own mischief and theft.",
			soul: [45],
			lvl: 2,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		cultist: {
			name: "Cultist",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A fervent devotee of dark and forbidden powers, often cloaked in tattered robes. These fanatics gather in secretive covens to perform unholy rituals and summon eldritch entities, posing a threat to the world with their zealous devotion.",
			soul: [42],
			lvl: 3,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		acolyte: {
			name: "Acolyte",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A devout follower of a deity or a mystical order, acolytes dedicate their lives to worship and service. They wield divine magic and knowledge, either to heal and protect or further their faith's goals.",
			soul: [38],
			lvl: 2,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		shrub: {
			name: "Awakened Shrub",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A seemingly harmless shrub brought to life by arcane forces, now harboring a thirst for mischief. Though not powerful, it can surprise with unexpected tricks in forest encounters.",
			soul: [42],
			lvl: 2,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		bandit: {
			name: "Bandit",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A cunning and lawless rogue of the wilds, donned in rugged attire and armed with concealed weapons. Bandits lurk on highways, ambushing travelers for ill-gotten gains and causing trouble for adventurers.",
			soul: [40],
			lvl: 2,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		crab: {
			name: "Giant Crab",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A colossal, armored crustacean with pincer claws capable of crushing foes. These aggressive sea-dwellers defend their territory fiercely and can be encountered in coastal caves or deep underwater.",
			soul: [27],
			lvl: 4,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		skeleton: {
			name: "Skeleton",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "The reanimated, bony remains of a once-living creature. These undead minions, often raised by dark necromancers, are devoid of flesh but possess an eerie, relentless determination to obey their master's commands, wielding rusted weapons with menacing intent.",
			soul: [22],
			lvl: 3,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		ghoul: {
			name: "Ghoul",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "An undead horror with pallid, rotting flesh and a hunger for the living. Ghouls stalk graveyards and crypts, driven by their insatiable appetite and the ability to paralyze victims with their vile touch.",
			soul: [18],
			lvl: 5,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		specter: {
			name: "Specter",
			img: "rat.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A malevolent, incorporeal entity, born from intense negative emotions. These vengeful spirits can drain the life force of the living with a chilling touch, haunting ancient ruins and forsaken places.",
			soul: [15],
			lvl: 5,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
	}
}