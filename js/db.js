export var state = {
	mob: {},
	player: {
		hp: 24,
		maxHp: 24,
		fate: 100,
		xp: 0,
		lvl: 1,
		coins: 23,
		slots: 4,
		cards: ["basic_attack_1", "mana1", "shield1", "poison1", "basic_attack_2", "heal_1", "double_damage", "attack_heal", "eldertide_timepiece", "shield_attack", "damage_to_piercing", "hp_loss_to_damage", "affliction_advantage", "deffensive_stance", "plague"],
		cardsThisEncounter: [],
		cardsToBanish: [],
		discsToEmpty: [],
		cardsManaPaid: [],
		cardsInUse: [],
		mana: 1,
		startingMana: 0,
		shield: 0,
		poison: 0,
	},
	turn: false,
	fatePrice: 1,
	turnMana: 0,
	turnManaToConsume: 0,
}

export const db = {

	/*===========================================================================*/
	// LEVELS 
	/*===========================================================================*/
	levels: {
		crossroad: {
			name: "Crossroad",
			desc: "A rustic crossroad, where well-trodden paths converge under the open sky, inviting travelers to choose their fate — each direction hiding both promise and peril.",
			stores: 1,
			chests: 1,
			doors: ["outskirts"],
			spawns: ["frog", "rat", "bats", "raven", "goblin", "bats", "chest", "frog", "master_frog", "rat", "goblin2", "rat_bandit", "goblin", "lagoon_dweller", "seridra", "eggman", "desert_mouth", "ecosystem"],
			cards: ["basic_attack_1", "basic_attack_2", "eldertide_timepiece"],
		},
		outskirts: {
			name: "Outskirts path",
			desc: "A serpentine path through untamed wilderness, where ancient trees and wildflowers sway in the breeze, concealing secrets and stories of those who came before.",
			stores: 0,
			chests: 0,
			doors: ["village"],
			spawns: [],
			cards: [],
		},
		village: {
			name: "Village",
			desc: "As the path unwinds, an eerie village emerges — its dilapidated cottages and empty streets concealing the ominous presence that looms over this forsaken place.",
			stores: 0,
			chests: 0,
			doors: ["old_forest", "cemetery"],
			spawns: [],
			cards: [],
		},
		old_forest: {
			name: "Old forest",
			desc: "Its gnarled trees and twisted roots create a labyrinthine realm, where the dappled sunlight hides the lurking threats that prowl beneath the canopy.",
			stores: 0,
			chests: 0,
			doors: ["cemetery"],
			spawns: [],
			cards: [],
		},
		cemetery: {
			name: "Cemetery",
			desc: "Amidst the graves of the forgotten, shadows writhe beneath the cold, unfeeling stones, and the silence is broken only by the mournful wails of unseen creatures.",
			stores: 0,
			chests: 0,
			doors: ["church"],
			spawns: [],
			cards: [],
		},
		church: {
			name: "Church",
			desc: "Beyond the village's edge,  a decrepit church stands, its ancient stones carrying the weight of a grim past, where shadows whisper the secrets of unspeakable horrors hidden within.",
			stores: 0,
			chests: 0,
			doors: [],
			spawns: [],
			cards: [],
		},
	},

	/*===========================================================================*/
	// XP 
	/*===========================================================================*/
	xpTiers: [0, 2, 6, 13, 25, 45, 70, 100, 135, 180, 225, 1224],

	/*===========================================================================*/
	// ITEMS 
	/*===========================================================================*/
	items: {
		fate_5: {
			name: "x5{fate}",
			desc: "Allows you to change your fate.",
			icon: "fate",
			price: 5,
			gives: "fate",
			amount: 5,
		},
		fate_20: {
			name: "x20{fate}",
			desc: "Allows you to change your fate.",
			icon: "fate",
			price: 20,
			gives: "fate",
			amount: 20,
		},
		HP: {
			name: "Health Potion",
			desc: "Recover 5 HP",
			icon: "heart",
			price: 5,
			gives: "hp",
			amount: 5,
		},
	},

	/*===========================================================================*/
	// CARDS 
	/*===========================================================================*/
	cards: {
		bat_bite: {
			name: "Bat bite",
			desc: "Deal 1 damage.",
			short: ["x1 Damage"],
			price: -1,
			mana_price: 0,
			mana_cost: 0,
			hitrate: [35],
			damage: 1,
			colors: ["#000", "#63251d"],
		},
		basic_attack_1: {
			name: "Dagger",
			get desc() { return "Deal " + this.damage + "/" + this.damage2 + "/" + this.damage3 + " damage." },
			get short() { return ["x" + this.damage + " damage", "x" + this.damage2 + " damage", "x" + this.damage3 + " damage"] },
			price: 50,
			mana_price: 0,
			mana_cost: 0,
			hitrate: [15, 70, 15],
			damage: 1,
			damage2: 3,
			damage3: 5,
			colors: ["#a5645b", "#872b1e", "#2f0f0b"],
		},
		basic_attack_2: {
			name: "Handaxe",
			get desc() { return "Deal " + this.damage + "/" + this.damage2 + " piercing damage." },
			get short() { return ["x" + this.damage + " piercing damage", "x" + this.damage2 + " piercing damage"] },
			price: 50,
			mana_price: 0,
			mana_cost: 0,
			hitrate: [35, 5],
			damage: 6,
			damage2: 8,
			colors: ["#000", "#81352a", "#2f0f0b"],
		},
		heal_1: {
			name: "Heal potion",
			desc: "Heal 3HP or 10HP.",
			short: ["Heal 3HP", "Heal 10HP"],
			price: 50,
			mana_price: 0,
			mana_cost: 0,
			hitrate: [38, 8],
			heal: 3,
			heal2: 10,
			colors: ["#000", "#105b58", "#00312f"],
		},
		double_damage: {
			name: "Bane-imbued edge",
			desc: "Damage from previous cards this turn are doubled or lost.",
			short: ["Double damage", "Lose damage"],
			price: 50,
			mana_price: 0,
			mana_cost: 0,
			hitrate: [50, 50],
			colors: ["#872b1e", "#494237"],
		},
		attack_heal: {
			name: "Ambivalent Elixir",
			desc: "Deal damage or heal.",
			short: ["Deal 3 damage", "Heal 3HP"],
			price: 50,
			mana_price: 1,
			mana_cost: 0,
			hitrate: [40, 30],
			damage: 3,
			heal: 3,
			colors: ["#000", "#872b1e", "#105b58"],
		},
		eldertide_timepiece: {
			name: "Eldertide Timepiece",
			desc: "Gain +1{fate}.",
			short: ["+1{fate}"],
			price: 50,
			mana_price: 0,
			mana_cost: 0,
			fate: 1,
			hitrate: [37],
			colors: ["#000", "#D9D9D9"],
		},
		mana1: {
			name: "Soulstone",
			get desc() { return "Gain +" + this.mana + "{mana}." },
			get short() { return ["+" + this.mana + "{mana}"] },
			price: 50,
			mana_price: 0,
			mana_cost: 0,
			hitrate: [78],
			mana: 1,
			colors: ["#000", "#460d59"],
		},
		shield1: {
			name: "Shield",
			get desc() { return "Gain +" + this.shield + "{shield}." },
			get short() { return ["+" + this.shield + "{shield}"] },
			price: 50,
			mana_price: 0,
			mana_cost: 0,
			hitrate: [68],
			shield: 3,
			colors: ["#000", "#8d8d8d"],
		},
		poison1: {
			name: "Poison",
			get desc() { return "Deal +" + this.poison + "{poison}." },
			get short() { return ["+" + this.poison + "{poison}"] },
			price: 50,
			mana_price: 0,
			mana_cost: 0,
			hitrate: [37],
			poison: 3,
			colors: ["#000", "#105b19"],
		},
		shield_attack: {
			name: "Shield attack",
			desc: "Turn your {shield} into damage.",
			short: ["Shield → damage"],
			price: 50,
			mana_price: 0,
			mana_cost: 2,
			hitrate: [37],
			colors: ["#000", "#872b1e"],
		},
		damage_to_piercing: {
			name: "Sharpener",
			desc: "Turn previous damage into piercing damage.",
			short: ["Shield → damage"],
			price: 50,
			mana_price: 0,
			mana_cost: 0,
			hitrate: [33],
			colors: ["#000", "#5f1e16"],
		},
		hp_loss_to_damage: {
			name: "Retribution",
			get desc() { return "Deal " + this.damage + " damage for every " + this.hploss + "HP you have lost."; },
			short: ["Turn lost HP into damage"],
			price: 50,
			mana_price: 0,
			mana_cost: 3,
			damage: 3,
			hploss: 4,
			hitrate: [47],
			colors: ["#000", "#5f1e16"],
		},
		affliction_advantage: {
			name: "Affliction Advantage",
			get desc() {
				return "Deal " + this.damage + " damage. If the enemy has {poison}, deal " + this.damage2 + " piercing damage.";
			},
			get short() {
				return ["Deal " + this.damage + " damage. If the enemy has {poison}, deal " + this.damage2 + " damage"]
			},
			price: 50,
			mana_price: 0,
			mana_cost: 1,
			damage: 4,
			damage2: 8,
			hitrate: [47],
			colors: ["#000", "#872b1e"],
		},
		deffensive_stance: {
			name: "Deffensive Stance",
			get desc() {
				return "If this turn you're dealing damage before this card, gain " + this.shield + " {shield}.";
			},
			get short() {
				return ["If dealing damage, gain " + this.shield + " {shield}"]
			},
			price: 50,
			mana_price: 0,
			mana_cost: 1,
			shield: 5,
			hitrate: [67],
			colors: ["#000", "#8d8d8d"],
		},
		plague: {
			name: "Plague",
			desc: "{banish} Double enemy's {poison}",
			short: ["Doubles enemy's current {poison}"],
			price: 50,
			mana_price: 0,
			mana_cost: 2,
			hitrate: [79],
			colors: ["#000", "#105b19"],
		},
	},

	/*===========================================================================*/
	// MOBS 
	/*===========================================================================*/
	mobs: {
		frog: {
			name: "Frog",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Small, slimy amphibians known for their croaking calls and agile leaps. They often lurk in murky waters and can be encountered in damp, gloomy environments.",
			img_rotation: 2,
			desc_rotation: 1,
			lvl: 1,
			hp: 12,
			slots: 1,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [["basic_attack_1"]]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 0.5,
					attacks: [["attack_heal"]]
				},
				{
					condition: (mob, player) => player.hp / player.maxHp > 0.75,
					attacks: [["poison1"]]
				},
			],
		},
		master_frog: {
			name: "Master Frog",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "An elder amphibian shrouded in mystic aura. It commands water and wields an ancient, enchanted staff to conjure tidal forces and unleash aquatic fury.",
			img_rotation: 2,
			desc_rotation: 0,
			lvl: 2,
			hp: 20,
			slots: 2,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["basic_attack_1", "basic_attack_2"],
						["basic_attack_1", "shield1"]
					]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 0.5,
					attacks: [
						["attack_heal", "attack_heal"],
						["attack_heal", "poison1"]
					]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 0.25,
					attacks: [
						["attack_heal", "heal_1"],
						["shield1", "heal_1"],
					]
				},
			],
		},
		raven: {
			name: "Raven",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A nightmarish raven with twisted feathers, blood-red eyes, and a menacing aura. Its caw chills the bravest hearts, an omen of impending doom.",
			img_rotation: 2,
			desc_rotation: 0,
			lvl: 1,
			hp: 14,
			slots: 1,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [["basic_attack_1"]]
				},
			],
		},
		rat: {
			name: "Rat",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A scuttling rodent with sharp teeth, rats thrive in dimly lit places and are known for spreading disease and infesting dungeons and sewers.",
			img_rotation: 1,
			desc_rotation: 2,
			lvl: 1,
			hp: 12,
			slots: 1,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["basic_attack_1"],
						["basic_attack_1"],
						["poison1"]
					]
				}
			],
		},
		rat_bandit: {
			name: "Rat bandit",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Cunning and nimble vermin, these bandits plague the streets. Armed with tiny, razor-sharp daggers, they swarm foes to steal and scuttle away.",
			img_rotation: 1,
			desc_rotation: 1,
			lvl: 2,
			hp: 18,
			slots: 2,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["basic_attack_1", "basic_attack_2"],
						["basic_attack_2", "basic_attack_2"],
						["basic_attack_1", "poison1"],
					]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 0.5,
					attacks: [
						["attack_heal", "basic_attack_2"],
						["poison1", "heal_1"],
						["attack_heal", "shield1"],
					]
				},
			],
		},
		lagoon_dweller: {
			name: "Lagoon Dweller",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Half-human, half-aquatic, dwelling beneath murky waters. With webbed extremities and glistening scales, it emerges to ensnare intruders with venomous harpoons.",
			img_rotation: 2,
			desc_rotation: 1,
			lvl: 2,
			hp: 28,
			slots: 2,
			patterns: [
				{
					condition: (mob, player) => mob.hp / mob.maxHp >= 0.5,
					attacks: [
						["poison1", "shield1"],
						["basic_attack_1", "attack_heal"],
					]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 0.5,
					attacks: [
						["attack_heal", "attack_heal"],
						["attack_heal", "basic_attack_2"],
						["shield1", "attack_heal"],
					]
				},
			],
		},
		seridra: {
			name: "Witch (Seridra)",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A formidable sorceress draped in dark robes. She wields shadow magic, calling forth curses and summoning eerie familiars to guard her lair.",
			img_rotation: 2,
			desc_rotation: 2,
			lvl: 3,
			hp: 42,
			slots: 2,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["basic_attack_2", "poison1"],
						["basic_attack_1", "basic_attack_1"],
						["basic_attack_1", "double_damage"],
						["poison1", "poison1"],
					]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 1,
					attacks: [
						["basic_attack_1", "attack_heal"],
						["attack_heal", "double_damage"],
						["heal_1", "attack_heal"],
					]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 0.3,
					attacks: [
						["heal_1", "attack_heal"],
						["attack_heal", "heal_1"],
					]
				},
			],
		},
		eggman: {
			name: "Century egg",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A twisted, human-like abomination, marred by mutation. Limbs contorted, skin pallid, it wanders in agony, driven by unnatural forces.",
			img_rotation: 1,
			desc_rotation: 1,
			lvl: 3,
			hp: 30,
			slots: 2,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["basic_attack_1", "basic_attack_1"],
						["basic_attack_1", "shield1"],
						["shield1", "shield1"],
					]
				},
			],
		},
		desert_mouth: {
			name: "Desert Mouth",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A colossal, sentient sandstone formation. It awakens, summoning whirlwinds and sandstorms, devours travelers who approach its sandy, insatiable jaws.",
			img_rotation: 0,
			desc_rotation: 1,
			lvl: 3,
			hp: 38,
			slots: 3,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["basic_attack_1", "basic_attack_1", "basic_attack_2"],
						["basic_attack_2", "basic_attack_2", "basic_attack_2"],
						["basic_attack_1", "double_damage", "basic_attack_2"],
						["basic_attack_1", "shield1", "shield_attack"],
						["shield1", "shield_attack", "double_damage"],
					]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 0.35,
					attacks: [
						["basic_attack_1", "double_damage", "heal_1"],
						["shield1", "shield1", "shield1"],
					]
				},
			],
		},
		chest: {
			name: "Chest",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A deceptive treasure chest, concealed trap. Its wooden maw hides rows of sharp teeth. Those who reach inside become prey to its voracious appetite.",
			img_rotation: 1,
			desc_rotation: 0,
			lvl: 3,
			hp: 18,
			slots: 1,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["basic_attack_1"],
					]
				},
				{
					condition: (mob, player) => mob.poison > 0,
					attacks: [
						["poison1"],
					]
				},
				{
					condition: (mob, player) => player.shield > 0,
					attacks: [
						["shield1"],
					]
				},

			],
		},
		ecosystem: {
			name: "Ecosystem of Endless Pain",
			type: "mob",
			skills: [],
			desc: "A nightmarish, sentient amalgamation of writhing, agonized souls, bound in a grotesque, ever-shifting form. It hungers for more suffering to join its ceaseless chorus of torment.",
			img_rotation: 0,
			desc_rotation: 2,
			lvl: 10,
			hp: 100,
			slots: 5,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["basic_attack_1", "basic_attack_1", "basic_attack_1", "basic_attack_1", "double_damage"],
					]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 1,
					attacks: [
						["basic_attack_1", "basic_attack_1", "basic_attack_2", "attack_heal", "double_damage"],
						["basic_attack_1", "double_damage", "basic_attack_2", "double_damage", "attack_heal"],
						["basic_attack_1", "basic_attack_2", "attack_heal", "double_damage", "attack_heal"],
					]
				},
			],
		},
		bats: {
			name: "Bats",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A swirling mass of winged nightmares cloaked in obsidian wings Their shrieks echo through darkness, unsettling even the bravest souls, as they swoop down in a chaotic, shadowy assault.",
			img_rotation: 0,
			desc_rotation: 1,
			lvl: 1,
			hp: 8,
			slots: 5,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["bat_bite", "bat_bite", "bat_bite", "bat_bite", "bat_bite"],
						["bat_bite", "bat_bite", "poison1", "bat_bite", "bat_bite"],
					]
				},
			],
		},
		goblin: {
			name: "Goblin",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Sly inhabitants of woodlands, their skin blends with bark and leaves. They navigate dense foliage with agility, ambushing intruders with poisoned darts and primitive traps.",
			img_rotation: 1,
			desc_rotation: 2,
			lvl: 2,
			hp: 22,
			slots: 2,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["basic_attack_2", "basic_attack_2"],
						["basic_attack_1", "shield1"],
						["shield1", "shield_attack"],
					]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 0.7,
					attacks: [
						["shield1", "shield1"],
					]
				},
			],
		},
		goblin2: {
			name: "Goblin",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Sly inhabitants of woodlands, their skin blends with bark and leaves. They navigate dense foliage with agility, ambushing intruders with poisoned darts and primitive traps.",
			img_rotation: 2,
			desc_rotation: 2,
			lvl: 2,
			hp: 16,
			slots: 2,
			patterns: [
				{
					condition: (mob, player) => true,
					attacks: [
						["shield1", "shield1"],
						["shield1", "shield_attack"],
					]
				},
				{
					condition: (mob, player) => mob.hp / mob.maxHp < 0.7,
					attacks: [
						["attack_heal", "shield1"],
					]
				},
			],
		},
/* 		spider: {
			name: "Spider",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Eight-legged arachnids, masters of stealth in their silk-spun lairs. They spin intricate webs to ensnare prey and can be found in dark corners of dungeons, forests, and caves.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 1,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		homunculus: {
			name: "Homunculus",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A twisted, malevolent creation gone rogue. This once-servile homunculus has turned against its master, armed with dark enchantments and a sinister desire for freedom.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 2,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		kobold: {
			name: "Kobold",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "Small, reptilian humanoids known for their cunning and devious traps. They dwell in underground lairs, serving as loyal minions to more powerful creatures or plotting their own mischief and theft.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 2,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		cultist: {
			name: "Cultist",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A fervent devotee of dark and forbidden powers, often cloaked in tattered robes. These fanatics gather in secretive covens to perform unholy rituals and summon eldritch entities, posing a threat to the world with their zealous devotion.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 3,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		acolyte: {
			name: "Acolyte",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A devout follower of a deity or a mystical order, acolytes dedicate their lives to worship and service. They wield divine magic and knowledge, either to heal and protect or further their faith's goals.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 2,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		shrub: {
			name: "Awakened Shrub",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A seemingly harmless shrub brought to life by arcane forces, now harboring a thirst for mischief. Though not powerful, it can surprise with unexpected tricks in forest encounters.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 2,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		bandit: {
			name: "Bandit",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A cunning and lawless rogue of the wilds, donned in rugged attire and armed with concealed weapons. Bandits lurk on highways, ambushing travelers for ill-gotten gains and causing trouble for adventurers.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 2,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		crab: {
			name: "Giant Crab",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A colossal, armored crustacean with pincer claws capable of crushing foes. These aggressive sea-dwellers defend their territory fiercely and can be encountered in coastal caves or deep underwater.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 4,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		skeleton: {
			name: "Skeleton",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "The reanimated, bony remains of a once-living creature. These undead minions, often raised by dark necromancers, are devoid of flesh but possess an eerie, relentless determination to obey their master's commands, wielding rusted weapons with menacing intent.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 3,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		ghoul: {
			name: "Ghoul",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "An undead horror with pallid, rotting flesh and a hunger for the living. Ghouls stalk graveyards and crypts, driven by their insatiable appetite and the ability to paralyze victims with their vile touch.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 5,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		},
		specter: {
			name: "Specter",
			type: "mob",
			skills: ["Does double damage.", "Not really"],
			desc: "A malevolent, incorporeal entity, born from intense negative emotions. These vengeful spirits can drain the life force of the living with a chilling touch, haunting ancient ruins and forsaken places.",
			img_rotation: 0,
			desc_rotation: 0,
			lvl: 5,
			hp: 6,
			slots: 2,
			patterns: [
				["basic_attack_1", "basic_attack_2"]
			],
		}, */
	}
}