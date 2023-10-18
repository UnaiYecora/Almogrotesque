export var state = {
	player: {
		soul: [75],
		hp: 24,
		maxHp: 24,
		playerTurn: false,
		fate: 50,
		xp: 0,
		lvl: 1,
		coins: 23,
		slots: 3,
		items: ["basic_attack_1", "mana1", "shield1", "poison1", "basic_attack_2", "heal_1", "double_damage", "attack_heal", "eldertide_timepiece",],
		itemsManaPaid: [],
		itemsInUse: [],
		mana: 1,
		startingMana: 10,
		shield: 0,
		poison: 0,
	},
	turn: "player",
	fatePrice: 1,
}

export const db = {

	/*==========================================
	// LEVELS 
	============================================*/
	levels: [
		{
			name: "Crossroad",
			desc: "A rustic crossroad, where well-trodden paths converge under the open sky, inviting travelers to choose their fate — each direction hiding both promise and peril.",
			stores: 3,
			chests: 1,
			doors: ["Outskirts path"],
			spawns: ["bats", "goblin", "goblin2", "master_frog", "frog", "raven", "rat", "rat_bandit", "lagoon_dweller", "seridra", "eggman", "chest", "ecosystem", "desert_mouth"],
			items: ["basic_attack_1", "basic_attack_2"],
			bg: "crossroad",
		},
		{
			name: "Outskirts path",
			desc: "A serpentine path through untamed wilderness, where ancient trees and wildflowers sway in the breeze, concealing secrets and stories of those who came before.",
			stores: 0,
			chests: 0,
			doors: ["Village"],
			spawns: ["frog"],
			items: ["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"],
			bg: "outskirt"
		},
		{
			name: "Village",
			desc: "As the path unwinds, an eerie village emerges — its dilapidated cottages and empty streets concealing the ominous presence that looms over this forsaken place.",
			stores: 0,
			chests: 0,
			doors: ["Old forest", "Cemetery"],
			spawns: ["frog"],
			items: ["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"],
			bg: "crossroad"
		},
		{
			name: "Old forest",
			desc: "Its gnarled trees and twisted roots create a labyrinthine realm, where the dappled sunlight hides the lurking threats that prowl beneath the canopy.",
			stores: 0,
			chests: 0,
			doors: ["Cemetery"],
			spawns: ["frog"],
			items: ["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"],
			bg: "forest"
		},
		{
			name: "Cemetery",
			desc: "Amidst the graves of the forgotten, shadows writhe beneath the cold, unfeeling stones, and the silence is broken only by the mournful wails of unseen creatures.",
			stores: 0,
			chests: 0,
			doors: ["Church"],
			spawns: ["frog"],
			items: ["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"],
			bg: "cemetery"
		},
		{
			name: "Church",
			desc: "Beyond the village's edge,  a decrepit church stands, its ancient stones carrying the weight of a grim past, where shadows whisper the secrets of unspeakable horrors hidden within.",
			stores: 0,
			chests: 0,
			doors: [],
			spawns: ["frog"],
			items: ["borrowed_soul_15", "borrowed_soul_30", "borrowed_soul_55"],
			bg: "outskirt"
		},
	],

	/*==========================================
	// XP 
	============================================*/
	xpTiers: [0, 2, 6, 13, 25, 45, 70, 100, 135, 180, 225, 1224],

	/*==========================================
	// BASIC ITEMS 
	============================================*/
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
			name: "Heal x5",
			desc: "Recover 5 HP",
			icon: "heart",
			price: 5,
			gives: "hp",
			amount: 5,
		},
	},

	/*==========================================
	// CARDS 
	============================================*/
	items: {
		bat_bite: {
			name: "Bat bite",
			desc: "Deal 1 damage.",
			short: ["x1 Damage"],
			icon: "bat_bite.png",
			price: -1,
			mana_price: 0,
			hitrate: [35],
			damage: 1,
			colors: ["#000", "#63251d"],
		},
		basic_attack_1: {
			name: "Dagger",
			desc: "Deal 3 damage.",
			short: ["x1 Damage", "x3 Damage", "x5 Damage"],
			icon: "basic_attack_1.png",
			price: 50,
			mana_price: 0,
			hitrate: [15, 70, 15],
			damage: 1,
			damage2: 3,
			damage3: 5,
			colors: ["#a5645b", "#872b1e", "#2f0f0b"],
		},
		basic_attack_2: {
			name: "Handaxe",
			desc: "Deal 6 piercing damage.",
			short: ["x6 Piercing damage"],
			icon: "basic_attack_2.png",
			price: 50,
			mana_price: 1,
			hitrate: [92],
			damage: 6,
			colors: ["#000", "#81352a"],
		},
		heal_1: {
			name: "Heal potion",
			desc: "Heal 3HP or 10HP.",
			short: ["Heal 3HP", "Heal 10HP"],
			icon: "heal_1.png",
			price: 50,
			mana_price: 2,
			hitrate: [38, 8],
			damage: 0,
			heal: 3,
			heal2: 10,
			colors: ["#000", "#105b58", "#00312f"],
		},
		double_damage: {
			name: "Bane-imbued edge",
			desc: "Damage from previous cards are doubled or lost.",
			short: ["Double previous damage", "Lose previous damage"],
			icon: "double_damage.png",
			price: 50,
			mana_price: 2,
			hitrate: [50, 50],
			damage: 0,
			colors: ["#872b1e", "#494237"],
		},
		attack_heal: {
			name: "Ambivalent Elixir",
			desc: "Deal damage or heal.",
			short: ["Deal 3 damage", "Heal 3HP"],
			icon: "attack_heal.png",
			price: 50,
			mana_price: 3,
			hitrate: [40, 30],
			damage: 3,
			heal: 3,
			colors: ["#000","#872b1e", "#105b58"],
		},
		eldertide_timepiece: {
			name: "Eldertide Timepiece",
			desc: "Gain +1{fate}.",
			short: ["+1{fate}"],
			icon: "eldertide_timepiece.png",
			price: 50,
			mana_price: 2,
			hitrate: [27],
			damage: 0,
			heal: 0,
			mana: 0,
			colors: ["#000","#D9D9D9"],
		},
		mana1: {
			name: "Soulstone",
			desc: "Gain +1{mana}.",
			short: ["+1{mana}"],
			icon: "mana1.png",
			price: 50,
			mana_price: 0,
			hitrate: [76],
			damage: 0,
			heal: 0,
			mana: 1,
			colors: ["#000","#460d59"],
		},
		shield1: {
			name: "Shield",
			desc: "Gain +3{shield}.",
			short: ["+3{shield}"],
			icon: "shield1.png",
			price: 50,
			mana_price: 0,
			hitrate: [68],
			damage: 0,
			heal: 0,
			mana: 0,
			shield: 3,
			colors: ["#000","#8d8d8d"],
		},
		poison1: {
			name: "Poison",
			desc: "Deal +3{poison}.",
			short: ["+3{poison}"],
			icon: "mana1.png",
			price: 50,
			mana_price: 0,
			hitrate: [33],
			damage: 0,
			heal: 0,
			mana: 0,
			shield: 0,
			poison: 3,
			colors: ["#000","#105b19"],
		},
	},

	/*==========================================
	// MOBS 
	============================================*/
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
			slots: 1,
			patterns: [
				["basic_attack_1"],
				["attack_heal"],
				["basic_attack_2"],
			],
		},
		master_frog: {
			name: "Master Frog",
			img: "master_frog.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "An elder amphibian shrouded in mystic aura. It commands water and wields an ancient, enchanted staff to conjure tidal forces and unleash aquatic fury.",
			soul: [37],
			lvl: 2,
			hp: 20,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"],
				["attack_heal", "attack_heal"],
			],
		},
		raven: {
			name: "Raven",
			img: "raven.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A nightmarish raven with twisted feathers, blood-red eyes, and a menacing aura. Its caw chills the bravest hearts, an omen of impending doom.",
			soul: [69],
			lvl: 1,
			hp: 14,
			slots: 1,
			patterns: [
				["basic_attack_1"],
				["basic_attack_2"],
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
			slots: 1,
			patterns: [
				["basic_attack_1"],
				["basic_attack_2"],
			],
		},
		rat_bandit: {
			name: "Rat bandit",
			img: "rat_bandit.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Cunning and nimble vermin, these bandits plague the streets. Armed with tiny, razor-sharp daggers, they swarm foes to steal and scuttle away.",
			soul: [57],
			lvl: 2,
			hp: 18,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"],
				["attack_heal", "basic_attack_2"],
				["basic_attack_2", "basic_attack_2"],
			],
		},
		lagoon_dweller: {
			name: "Lagoon Dweller",
			img: "lagoon_dweller.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Half-human, half-aquatic, dwelling beneath murky waters. With webbed extremities and glistening scales, it emerges to ensnare intruders with venomous harpoons.",
			soul: [57],
			lvl: 2,
			hp: 28,
			slots: 2,
			patterns: [
				["attack_heal", "attack_heal"],
				["basic_attack_1", "attack_heal"],
				["attack_heal", "basic_attack_2"],
			],
		},
		seridra: {
			name: "Witch (Seridra)",
			img: "seridra.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A formidable sorceress draped in dark robes. She wields shadow magic, calling forth curses and summoning eerie familiars to guard her lair.",
			soul: [37],
			lvl: 3,
			hp: 42,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"],
				["basic_attack_1", "attack_heal"],
				["basic_attack_1", "basic_attack_1"],
				["attack_heal", "double_damage"],
				["basic_attack_1", "double_damage"],
			],
		},
		eggman: {
			name: "Century egg",
			img: "eggman.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A twisted, human-like abomination, marred by mutation. Limbs contorted, skin pallid, it wanders in agony, driven by unnatural forces.",
			soul: [37],
			lvl: 3,
			hp: 30,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_1"]
			],
		},
		desert_mouth: {
			name: "Desert Mouth",
			img: "desert_mouth.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A colossal, sentient sandstone formation. It awakens, summoning whirlwinds and sandstorms, devours travelers who approach its sandy, insatiable jaws.",
			soul: [37],
			lvl: 3,
			hp: 38,
			slots: 3,
			patterns: [
				["basic_attack_1", "basic_attack_1", "basic_attack_2"],
				["basic_attack_2", "basic_attack_2", "basic_attack_2"],
				["basic_attack_1", "double_damage", "basic_attack_2"],
				["basic_attack_1", "double_damage", "heal_1"],
			],
		},
		chest: {
			name: "Chest",
			img: "chest.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A deceptive treasure chest, concealed trap. Its wooden maw hides rows of sharp teeth. Those who reach inside become prey to its voracious appetite.",
			soul: [37],
			lvl: 3,
			hp: 8,
			slots: 1,
			patterns: [
				["basic_attack_1"]
			],
		},
		ecosystem: {
			name: "Ecosystem of Endless Pain",
			img: "ecosystem.png",
			type: "mob",
			skills: [],
			desc: "A nightmarish, sentient amalgamation of writhing, agonized souls, bound in a grotesque, ever-shifting form. It hungers for more suffering to join its ceaseless chorus of torment.",
			soul: [99],
			lvl: 10,
			hp: 100,
			slots: 5,
			patterns: [
				["basic_attack_1", "basic_attack_1", "basic_attack_1", "basic_attack_1", "double_damage"],
				["basic_attack_1", "basic_attack_1", "basic_attack_2", "attack_heal", "double_damage"],
				["basic_attack_1", "double_damage", "basic_attack_2", "double_damage", "attack_heal"],
				["basic_attack_1", "basic_attack_2", "attack_heal", "double_damage", "attack_heal"],
			],
		},
		bats: {
			name: "Bats",
			img: "bats.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A swirling mass of winged nightmares cloaked in obsidian wings Their shrieks echo through darkness, unsettling even the bravest souls, as they swoop down in a chaotic, shadowy assault.",
			soul: [84],
			lvl: 1,
			hp: 8,
			slots: 5,
			patterns: [
				["bat_bite", "bat_bite", "bat_bite", "bat_bite", "bat_bite"]
			],
		},
		goblin: {
			name: "Goblin",
			img: "goblin.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Sly inhabitants of woodlands, their skin blends with bark and leaves. They navigate dense foliage with agility, ambushing intruders with poisoned darts and primitive traps.",
			soul: [84],
			lvl: 2,
			hp: 22,
			slots: 2,
			patterns: [
				["shield1", "shield1"],
				["basic_attack_2", "basic_attack_2"],
			],
		},
		goblin2: {
			name: "Goblin",
			img: "goblin2.png",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Sly inhabitants of woodlands, their skin blends with bark and leaves. They navigate dense foliage with agility, ambushing intruders with poisoned darts and primitive traps.",
			soul: [84],
			lvl: 2,
			hp: 16,
			slots: 2,
			patterns: [
				["shield1", "shield1"],
				["attack_heal", "shield1"],
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