export var state = {
	player: {
		soul: [23],
		hp: 6,
		maxHp: 6,
		playerTurn: false,
		fateLeft: 50,
		xp: 0,
		lvl: 1,
		gold: 0,
	},
	fatePrice: 1,
}

export const db = {
	levels: [
		{
			name: "home",
			stores: 3,
			chests: 3,
			doors: ["home"]
		}
	],
	xpTiers: [0, 2, 6, 13, 25, 45, 70, 100, 135, 180, 225, 1224],
	mobs: [
		{
			name: "Goblin",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "Small, malicious humanoid creatures with greenish skin and a penchant for mischief. They are often found in tribal societies, lurking in forests, caves, and ruins, and are known for their cunning traps and love of shiny loot.",
			soul: [72],
			lvl: 3,
			spawn: ["home"]
		},
		{
			name: "Bat",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "Denizens of the night and elegantly cloaked in obsidian wings, bats are skilled hunters of insects and small prey.",
			soul: [84],
			lvl: 1,
			spawn: ["home"]
		},
		{
			name: "Frog",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "Small, slimy amphibians known for their croaking calls and agile leaps. They often lurk in murky waters and can be encountered in damp, gloomy environments.",
			soul: [93],
			lvl: 1,
			spawn: ["home"]
		},
		{
			name: "Rat",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "A scuttling rodent with sharp teeth, rats thrive in dimly lit places and are known for spreading disease and infesting dungeons and sewers.",
			soul: [69],
			lvl: 1,
			spawn: ["home"]
		},
		{
			name: "Spider",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "Eight-legged arachnids, masters of stealth in their silk-spun lairs. They spin intricate webs to ensnare prey and can be found in dark corners of dungeons, forests, and caves.",
			soul: [67],
			lvl: 1,
			spawn: ["home"]
		},
		{
			name: "Homunculus",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "A twisted, malevolent creation gone rogue. This once-servile homunculus has turned against its master, armed with dark enchantments and a sinister desire for freedom.",
			soul: [57],
			lvl: 2,
			spawn: ["home"]
		},
		{
			name: "Kobold",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "Small, reptilian humanoids known for their cunning and devious traps. They dwell in underground lairs, serving as loyal minions to more powerful creatures or plotting their own mischief and theft.",
			soul: [45],
			lvl: 2,
			spawn: ["home"]
		},
		{
			name: "Cultist",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "A fervent devotee of dark and forbidden powers, often cloaked in tattered robes. These fanatics gather in secretive covens to perform unholy rituals and summon eldritch entities, posing a threat to the world with their zealous devotion.",
			soul: [42],
			lvl: 3,
			spawn: ["home"]
		},
		{
			name: "Acolyte",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "A devout follower of a deity or a mystical order, acolytes dedicate their lives to worship and service. They wield divine magic and knowledge, either to heal and protect or further their faith's goals.",
			soul: [38],
			lvl: 2,
			spawn: ["home"]
		},
		{
			name: "Awakened Shrub",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "A seemingly harmless shrub brought to life by arcane forces, now harboring a thirst for mischief. Though not powerful, it can surprise with unexpected tricks in forest encounters.",
			soul: [42],
			lvl: 2,
			spawn: ["home"]
		},
		{
			name: "Bandit",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "A cunning and lawless rogue of the wilds, donned in rugged attire and armed with concealed weapons. Bandits lurk on highways, ambushing travelers for ill-gotten gains and causing trouble for adventurers.",
			soul: [40],
			lvl: 2,
			spawn: ["home"]
		},
		{
			name: "Giant Crab",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "A colossal, armored crustacean with pincer claws capable of crushing foes. These aggressive sea-dwellers defend their territory fiercely and can be encountered in coastal caves or deep underwater.",
			soul: [27],
			lvl: 4,
			spawn: ["home"]
		},
		{
			name: "Skeleton",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "The reanimated, bony remains of a once-living creature. These undead minions, often raised by dark necromancers, are devoid of flesh but possess an eerie, relentless determination to obey their master's commands, wielding rusted weapons with menacing intent.",
			soul: [22],
			lvl: 3,
			spawn: ["home"]
		},
		{
			name: "Ghoul",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "An undead horror with pallid, rotting flesh and a hunger for the living. Ghouls stalk graveyards and crypts, driven by their insatiable appetite and the ability to paralyze victims with their vile touch.",
			soul: [18],
			lvl: 5,
			spawn: ["home"]
		},
		{
			name: "Specter",
			type: "mob",
			skills: ["Does double damage.", "Something else"],
			desc: "A malevolent, incorporeal entity, born from intense negative emotions. These vengeful spirits can drain the life force of the living with a chilling touch, haunting ancient ruins and forsaken places.",
			soul: [15],
			lvl: 5,
			spawn: ["home"]
		},
	]
}