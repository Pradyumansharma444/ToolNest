import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Trophy, Share2 } from 'lucide-react';

const WORDS_BANK = [
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again',
  'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alike', 'alive', 'allow', 'alone',
  'along', 'alter', 'among', 'anger', 'angle', 'angry', 'apart', 'apple', 'apply', 'arena',
  'argue', 'arise', 'array', 'arrow', 'aside', 'asset', 'audio', 'audit', 'avoid', 'award',
  'aware', 'awful', 'badly', 'baker', 'bases', 'basic', 'basis', 'beach', 'beard', 'beast',
  'begin', 'being', 'below', 'bench', 'bible', 'birth', 'black', 'blade', 'blame', 'blind',
  'block', 'blood', 'board', 'boast', 'bonus', 'boost', 'bound', 'brain', 'brand', 'bread',
  'break', 'breed', 'brief', 'bring', 'broad', 'broke', 'brown', 'brush', 'buyer', 'cable',
  'calmly', 'camel', 'camera', 'canal', 'candy', 'canon', 'cargo', 'carol', 'carry', 'carve',
  'catch', 'cause', 'chain', 'chair', 'chalk', 'chaos', 'charm', 'chart', 'chase', 'cheap',
  'cheat', 'check', 'cheek', 'cheer', 'chess', 'chest', 'chief', 'child', 'china', 'choir',
  'chose', 'chunk', 'churn', 'cigar', 'claim', 'class', 'clean', 'clear', 'clerk', 'click',
  'cliff', 'climb', 'clock', 'close', 'cloth', 'cloud', 'coach', 'coast', 'cobra', 'cocoa',
  'coder', 'count', 'court', 'cover', 'craft', 'crane', 'crash', 'cream', 'crime', 'cross',
  'crowd', 'crown', 'crude', 'cruel', 'crust', 'cubic', 'curly', 'cycle', 'daily', 'dance',
  'dandy', 'darling', 'dates', 'datum', 'death', 'debut', 'delay', 'depth', 'devil', 'diary',
  'dirty', 'disco', 'ditch', 'diver', 'dizzy', 'dodge', 'dogma', 'doing', 'dolls', 'donor',
  'dough', 'downy', 'draft', 'drama', 'drank', 'drawl', 'drawn', 'dream', 'dress', 'dried',
  'drift', 'drill', 'drink', 'drive', 'drove', 'drown', 'drugs', 'drunk', 'dryer', 'dusty',
  'dwell', 'dying', 'eager', 'eagle', 'early', 'earth', 'easel', 'eight', 'elbow', 'elder',
  'elect', 'elite', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'essay',
  'event', 'every', 'exact', 'exist', 'extra', 'faith', 'false', 'fancy', 'fatal', 'favor',
  'feast', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'files', 'final', 'first', 'birth',
  'fixed', 'flame', 'flash', 'fleet', 'flies', 'flight', 'float', 'flood', 'floor', 'flour',
  'fluid', 'flute', 'flyer', 'focal', 'focus', 'foggy', 'folly', 'force', 'forge', 'forth',
  'forty', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'front', 'frost', 'fruit',
  'fully', 'funny', 'fuzzy', 'giant', 'given', 'glass', 'globe', 'glory', 'glove', 'grace',
  'grade', 'grain', 'grand', 'grant', 'grass', 'grave', 'great', 'green', 'grief', 'grill',
  'gross', 'group', 'grown', 'guard', 'guess', 'guest', 'guide', 'guild', 'habit', 'hairs',
  'handy', 'happy', 'harsh', 'haven', 'heart', 'heavy', 'hello', 'hence', 'herbs', 'ideal',
  'ideas', 'idiom', 'image', 'imply', 'inbox', 'index', 'inner', 'input', 'irony', 'issue',
  'items', 'ivory', 'jacket', 'jeans', 'joint', 'joker', 'judge', 'juice', 'juror', 'keeps',
  'ketchup', 'kings', 'knees', 'knife', 'knock', 'known', 'label', 'labor', 'lacks', 'lakes',
  'lamps', 'large', 'laser', 'later', 'laugh', 'layer', 'leads', 'learn', 'lease', 'least',
  'leave', 'legal', 'lemon', 'level', 'lever', 'light', 'liked', 'likes', 'limbs', 'limit',
  'lined', 'lines', 'links', 'lions', 'liquid', 'lived', 'liver', 'lives', 'lobby', 'local',
  'locks', 'lodge', 'logic', 'logos', 'loose', 'loves', 'lower', 'loyal', 'lucky', 'lunch',
  'lungs', 'lying', 'macro', 'magic', 'major', 'maker', 'makes', 'males', 'maple', 'march',
  'marks', 'marry', 'match', 'mates', 'maths', 'maybe', 'mayor', 'meals', 'means', 'meant',
  'media', 'medic', 'meet', 'melon', 'menus', 'mercy', 'merge', 'merit', 'metal', 'micro',
  'midst', 'might', 'miles', 'minds', 'mines', 'minor', 'minus', 'mixed', 'mixer', 'model',
  'modem', 'modes', 'moist', 'money', 'month', 'moody', 'moral', 'motel', 'motif', 'motor',
  'mound', 'mount', 'mourn', 'mouse', 'mouth', 'moved', 'mover', 'moves', 'movie', 'mucky',
  'multi', 'music', 'muted', 'myths', 'nails', 'naked', 'named', 'names', 'nasal', 'nasty',
  'naval', 'needs', 'nerve', 'never', 'newer', 'newly', 'nexus', 'nicer', 'niche', 'night',
  'ninth', 'noble', 'nodes', 'noise', 'noisy', 'norms', 'north', 'nosed', 'notch', 'noted',
  'notes', 'novel', 'nurse', 'nutty', 'nylon', 'oasis', 'occur', 'ocean', 'octet', 'odors',
  'offer', 'often', 'oiled', 'older', 'olive', 'omega', 'onion', 'onset', 'opens', 'opera',
  'orbit', 'order', 'organ', 'other', 'ought', 'ounce', 'outer', 'owned', 'owner', 'oxide',
  'ozone', 'packs', 'pages', 'pains', 'paint', 'pairs', 'palace', 'panel', 'panic', 'paper',
  'parade', 'parks', 'parts', 'party', 'pasta', 'paste', 'patch', 'paths', 'patio', 'patrol',
  'patron', 'pause', 'paved', 'peace', 'peach', 'peaks', 'pearl', 'pedal', 'peers', 'penal',
  'pence', 'penny', 'perch', 'peril', 'perms', 'perry', 'petal', 'phase', 'phone', 'photo',
  'piano', 'picks', 'piece', 'piggy', 'piles', 'pilot', 'pinch', 'pipes', 'pitch', 'pixel',
  'pizza', 'place', 'plain', 'plane', 'plank', 'plans', 'plant', 'plate', 'plays', 'plaza',
  'plead', 'plots', 'pluck', 'plugs', 'plumb', 'plume', 'plump', 'plums', 'plush', 'poems',
  'poet', 'point', 'poker', 'polar', 'poles', 'police', 'polio', 'polite', 'polls', 'poly',
  'ponds', 'pools', 'poplar', 'poppy', 'porch', 'pores', 'ports', 'posed', 'poser', 'poses',
  'post', 'pouch', 'pound', 'pour', 'powder', 'power', 'prank', 'pratt', 'pray', 'preach',
  'press', 'prey', 'price', 'prick', 'pride', 'priest', 'prime', 'prince', 'print', 'prior',
  'prism', 'privy', 'prize', 'probe', 'promo', 'prone', 'prong', 'proof', 'props', 'prose',
  'proud', 'prove', 'prowl', 'proxy', 'prude', 'prune', 'psalm', 'public', 'puddy', 'puffy',
  'pulls', 'pulpy', 'pulse', 'pumas', 'pumps', 'punch', 'punks', 'punny', 'pupil', 'puppy',
  'pure', 'purge', 'purse', 'pushy', 'quack', 'quads', 'quake', 'qualm', 'quark', 'quart',
  'quash', 'quasi', 'queen', 'queer', 'quell', 'query', 'quest', 'queue', 'quick', 'quiet',
  'quilt', 'quint', 'quirk', 'quite', 'quota', 'quote', 'quoth', 'rabbi', 'rabid', 'raced',
  'racer', 'races', 'radar', 'radii', 'radio', 'radix', 'radon', 'rafts', 'raged', 'rages',
  'rails', 'rainy', 'raise', 'rajah', 'raked', 'rally', 'ramen', 'ranch', 'range', 'rangy',
  'rapid', 'rarer', 'raspy', 'rated', 'rater', 'rates', 'ratio', 'razor', 'reach', 'react',
  'reads', 'ready', 'realm', 'reals', 'reaps', 'rearm', 'rears', 'rebel', 'rebox', 'recap',
  'recto', 'recur', 'reds', 'reedy', 'reefs', 'reels', 'reeve', 'refer', 'refit', 'regal',
  'rehab', 'reign', 'rekey', 'relax', 'relay', 'relic', 'remit', 'remix', 'renal', 'renew',
  'renov', 'rents', 'repay', 'repel', 'reply', 'rerun', 'reset', 'resin', 'resow', 'rests',
  'retail', 'retem', 'retro', 'retry', 'reuse', 'revet', 'revue', 'rewax', 'rewet', 'rezon',
  'rhino', 'rhyme', 'rider', 'rides', 'ridge', 'rife', 'rifle', 'rifts', 'right', 'rigid',
  'rigor', 'riled', 'riles', 'rimes', 'rinds', 'rings', 'rinks', 'rinse', 'riots', 'ripen',
  'riper', 'risen', 'riser', 'rises', 'risks', 'risky', 'rites', 'rival', 'riven', 'river',
  'rivet', 'roads', 'roams', 'roans', 'roars', 'roast', 'robed', 'robes', 'robin', 'roble',
  'robot', 'rocks', 'rocky', 'rodeo', 'roger', 'rogue', 'roils', 'roily', 'roles', 'rolls',
  'roman', 'romp', 'rondo', 'roofs', 'rooks', 'rooms', 'roomy', 'roost', 'roots', 'roped',
  'roper', 'ropes', 'roque', 'roses', 'rosin', 'rotas', 'rotes', 'rotor', 'roues', 'rough',
  'round', 'rouse', 'route', 'routs', 'rover', 'roves', 'rowdy', 'rowed', 'rower', 'royal',
  'rubes', 'ruble', 'ruche', 'ruddy', 'ruder', 'ruffs', 'rugby', 'ruins', 'ruled', 'ruler',
  'rules', 'rumba', 'rumen', 'rumor', 'rumps', 'runes', 'rungs', 'runny', 'runts', 'runty',
  'rural', 'ruses', 'rushy', 'rusts', 'rusty', 'ruths', 'rutty', 'saber', 'sable', 'sabot',
  'sacks', 'sacra', 'sadly', 'safer', 'safes', 'sagas', 'sager', 'sages', 'saggy', 'sahib',
  'sails', 'saint', 'saith', 'salad', 'sales', 'sally', 'salon', 'salts', 'salty', 'salve',
  'salvo', 'samar', 'samba', 'sambo', 'same', 'sands', 'sandy', 'saner', 'sappy', 'saran',
  'sarge', 'saris', 'sassy', 'satan', 'sated', 'sates', 'satin', 'satyr', 'sauce', 'saucy',
  'sauls', 'sauna', 'saute', 'saved', 'saver', 'saves', 'savor', 'savoy', 'savvy', 'sawed',
  'sawer', 'saxes', 'saxon', 'scabs', 'scad', 'scald', 'scale', 'scalp', 'scaly', 'scamp',
  'scams', 'scans', 'scant', 'scape', 'scare', 'scarf', 'scarp', 'scars', 'scary', 'scats',
  'scene', 'scent', 'schwa', 'scion', 'scoff', 'scold', 'scone', 'scoop', 'scoot', 'scope',
  'score', 'scorn', 'scots', 'scour', 'scout', 'scowl', 'scows', 'scram', 'scrap', 'scree',
  'screw', 'scrim', 'scrip', 'scrod', 'scrub', 'scrum', 'scuba', 'scuds', 'scuff', 'scull',
  'sculp', 'scums', 'scups', 'scurf', 'scuta', 'scute', 'seals', 'seams', 'seamy', 'sears',
  'seats', 'sebum', 'secco', 'sects', 'sedan', 'seder', 'sedge', 'sedgy', 'sedum', 'seeds',
  'seedy', 'seeks', 'seems', 'seeps', 'seepy', 'seers', 'seest', 'seeth', 'segno', 'sego',
  'segre', 'segue', 'seine', 'seise', 'seism', 'seity', 'seize', 'selah', 'selfs', 'sells',
  'semen', 'semis', 'sends', 'senna', 'senor', 'sensa', 'sense', 'sente', 'senti', 'sepal',
  'sepia', 'sepic', 'sepoy', 'septa', 'serif', 'serge', 'serin', 'serow', 'serry', 'serum',
  'serve', 'servo', 'setae', 'setal', 'seton', 'setup', 'seven', 'sever', 'sewan', 'sewar',
  'sewed', 'sewer', 'sexed', 'sexes', 'sexto', 'sexts', 'shack', 'shade', 'shads', 'shady',
  'shaft', 'shags', 'shahs', 'shake', 'shako', 'shaky', 'shale', 'shall', 'shalt', 'shame',
  'shams', 'shank', 'shape', 'shard', 'share', 'shark', 'sharn', 'sharp', 'shart', 'shash',
  'shave', 'shawl', 'shawm', 'shawn', 'shaws', 'shays', 'sheaf', 'shear', 'sheas', 'sheds',
  'sheen', 'sheep', 'sheer', 'sheet', 'sheik', 'shelf', 'shell', 'shend', 'shent', 'sheol',
  'sherd', 'shew', 'shews', 'shied', 'shiel', 'shier', 'shies', 'shift', 'shill', 'shily',
  'shims', 'shine', 'shins', 'shiny', 'ships', 'shire', 'shirk', 'shirr', 'shirt', 'shist',
  'shits', 'shiva', 'shive', 'shivs', 'shoad', 'shoal', 'shoat', 'shock', 'shoed', 'shoer',
  'shoes', 'shogs', 'shoji', 'shola', 'shone', 'shook', 'shool', 'shoon', 'shoos', 'shoot',
  'shope', 'shops', 'shore', 'shorl', 'shorn', 'short', 'shote', 'shots', 'shout', 'shove',
  'showd', 'shown', 'shows', 'showy', 'shoyu', 'shred', 'shrew', 'shri', 'shrie', 'shrip',
  'shrog', 'shrow', 'shrub', 'shrug', 'shrut', 'shuba', 'shubs', 'shuck', 'shudder', 'shuds',
  'shady', 'shuff', 'shuls', 'shuns', 'shunt', 'shura', 'shush', 'shute', 'shuts', 'shyer',
  'shyly', 'sials', 'sibbs', 'sibyl', 'sices', 'sicle', 'sidas', 'sided', 'sides', 'sidle',
  'sidon', 'siege', 'sieve', 'sifts', 'sighs', 'sight', 'sigil', 'sigla', 'sigma', 'signa',
  'signs', 'siker', 'sikes', 'silds', 'silex', 'silks', 'silky', 'sills', 'silly', 'silos',
  'silts', 'silty', 'silva', 'simal', 'simar', 'simas', 'simon', 'simps', 'since', 'sines',
  'sinew', 'singe', 'sings', 'sinhs', 'sinks', 'sinky', 'sinny', 'sinon', 'sinto', 'sinus',
  'sipid', 'sired', 'siree', 'siren', 'sires', 'sirih', 'siroc', 'sirup', 'sisal', 'sises',
  'sissy', 'sitar', 'sited', 'sites', 'situs', 'siver', 'sixes', 'sixte', 'sixth', 'sixty',
  'sized', 'sizer', 'sizes', 'skags', 'skald', 'skank', 'skate', 'skats', 'skean', 'skeed',
  'skeef', 'skeen', 'skeer', 'skees', 'skeet', 'skegg', 'skegs', 'skein', 'skelf', 'skell',
  'skelm', 'skelp', 'skene', 'skeps', 'skied', 'skier', 'skies', 'skiey', 'skiff', 'skill',
  'skimo', 'skimp', 'skims', 'skink', 'skins', 'skint', 'skips', 'skirl', 'skirr', 'skirt',
  'skits', 'skive', 'skoal', 'skort', 'skout', 'skua', 'skugs', 'skull', 'skunk', 'skyed',
  'skyey', 'slabs', 'slack', 'slade', 'slags', 'slain', 'slake', 'slams', 'slang', 'slank',
  'slant', 'slaps', 'slart', 'slash', 'slate', 'slats', 'slaty', 'slave', 'slaws', 'slays',
  'sleds', 'sleek', 'sleep', 'sleet', 'slept', 'slice', 'slick', 'slide', 'slier', 'slily',
  'slime', 'slims', 'slimy', 'sling', 'slink', 'slips', 'slipt', 'slits', 'sloat', 'slob',
  'sloe', 'slogs', 'sloid', 'sloka', 'slomo', 'sloop', 'slope', 'slops', 'slosh', 'sloth',
  'slots', 'slows', 'sloyd', 'slubs', 'slued', 'slues', 'sluff', 'slugs', 'slump', 'slums',
  'slung', 'slunk', 'slur', 'slurb', 'slurs', 'sluse', 'slush', 'sluts', 'slyer', 'slyly',
  'smack', 'small', 'smalt', 'smarm', 'smart', 'smash', 'smaze', 'smear', 'smeek', 'smell',
  'smelt', 'smerk', 'smews', 'smile', 'smirk', 'smite', 'smith', 'smits', 'smock', 'smog',
  'smoke', 'smoky', 'smolt', 'smoor', 'smoot', 'smote', 'smuts', 'snack', 'snafu', 'snags',
  'snail', 'snake', 'snaky', 'snaps', 'snare', 'snark', 'snarl', 'snary', 'snash', 'snath',
  'snead', 'sneak', 'sneap', 'sneck', 'sneer', 'snell', 'snelt', 'snibs', 'snick', 'snide',
  'sniff', 'snift', 'snigs', 'snipe', 'snips', 'snits', 'snobs', 'snood', 'snook', 'snool',
  'snoop', 'snoot', 'snore', 'snort', 'snots', 'snout', 'snows', 'snowy', 'snubs', 'snuck',
  'snuff', 'snugs', 'snyes', 'soaks', 'soaps', 'soapy', 'soars', 'soave', 'sober', 'socas',
  'socks', 'socle', 'sodas', 'sodic', 'sodom', 'sofas', 'softa', 'softs', 'softy', 'soger',
  'sohot', 'soils', 'soily', 'sojas', 'sokol', 'solan', 'solar', 'soldi', 'soldo', 'solei',
  'soles', 'solid', 'solon', 'solos', 'solum', 'solus', 'solve', 'somas', 'somed', 'somer',
  'sompa', 'sonar', 'sonce', 'sonde', 'songs', 'sonic', 'sonly', 'sonne', 'sonny', 'sonsy',
  'soobs', 'sooky', 'sools', 'soops', 'sooth', 'soots', 'sooty', 'sophs', 'sophy', 'sopor',
  'soppy', 'soral', 'soras', 'sorbo', 'sordi', 'sordo', 'sords', 'sored', 'soree', 'sorel',
  'sorer', 'sores', 'sorgo', 'sorns', 'sorry', 'sorts', 'sorus', 'soses', 'sosie', 'sotol',
  'sotto', 'souce', 'souct', 'sough', 'souks', 'souls', 'sound', 'soups', 'soupy', 'sour',
  'study', 'stuff', 'style', 'sugar', 'suite', 'super', 'sweet', 'swept', 'swift', 'swing',
  'swiss', 'sword', 'syrup', 'table', 'taken', 'tales', 'talon', 'taper', 'taste', 'tasty',
  'teach', 'teeth', 'tempo', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick',
  'thief', 'thigh', 'thing', 'think', 'third', 'those', 'three', 'threw', 'throw', 'thumb',
  'tiger', 'tight', 'tiles', 'timer', 'times', 'tired', 'title', 'toast', 'today', 'token',
  'tonal', 'tones', 'topic', 'torch', 'total', 'touch', 'tough', 'tower', 'toxic', 'trace',
  'track', 'tract', 'trade', 'trail', 'train', 'trait', 'trash', 'tread', 'treat', 'trend',
  'trial', 'tribe', 'trick', 'tried', 'tries', 'tripe', 'trips', 'troll', 'troop', 'trout',
  'truce', 'truck', 'truly', 'trunk', 'trust', 'truth', 'tubes', 'tulip', 'tumor', 'tuner',
  'tunes', 'turbo', 'turns', 'tutor', 'twice', 'twins', 'types', 'typic', 'uncle', 'under',
  'union', 'unite', 'units', 'unity', 'until', 'upper', 'upset', 'urban', 'usage', 'users',
  'using', 'usual', 'vague', 'valid', 'value', 'valve', 'vapor', 'vault', 'vegan', 'veins',
  'venue', 'verse', 'video', 'villa', 'vinyl', 'viral', 'virus', 'visit', 'visor', 'vista',
  'vital', 'vivid', 'vocal', 'vodka', 'voice', 'volts', 'vowel', 'wafer', 'waged', 'wager',
  'wages', 'wagon', 'waist', 'waits', 'waive', 'walls', 'wants', 'warns', 'waste', 'watch',
  'water', 'watts', 'waves', 'weary', 'weave', 'weeks', 'weigh', 'weird', 'wells', 'welsh',
  'whale', 'wharf', 'wheat', 'wheel', 'where', 'which', 'while', 'whip', 'white', 'whole',
  'whose', 'wider', 'widow', 'width', 'winds', 'windy', 'wines', 'wings', 'wiped', 'wiper',
  'wipes', 'wired', 'wires', 'wiser', 'witch', 'witty', 'wives', 'woman', 'women', 'woods',
  'woody', 'words', 'wordy', 'works', 'world', 'worms', 'worry', 'worse', 'worst', 'worth',
  'would', 'wound', 'woven', 'wreck', 'wrist', 'write', 'wrong', 'wrote', 'yacht', 'yards',
  'years', 'yeast', 'yield', 'young', 'yours', 'youth', 'zebra', 'zones'
];

export default function WordleGame() {
  const tool = getToolById('wordle')!;
  const { toast } = useToast();

  const [mode, setMode] = useState<'daily' | 'practice'>('practice');
  const [solution, setSolution] = useState(() =>
    WORDS_BANK[Math.floor(Math.random() * WORDS_BANK.length)].toUpperCase()
  );
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // Load daily word based on date hash
  const getDailyWord = useCallback(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = Math.abs(Math.sin(seed) * 10000) % WORDS_BANK.length;
    return WORDS_BANK[Math.floor(index)].toUpperCase();
  }, []);

  // Initialize Word
  const startNewGame = useCallback((selectedMode: 'daily' | 'practice') => {
    setMode(selectedMode);
    let targetWord = '';
    if (selectedMode === 'daily') {
      targetWord = getDailyWord();
      // Load daily state from localStorage if exists
      const savedDaily = localStorage.getItem(`wordle_daily_${new Date().toDateString()}`);
      if (savedDaily) {
        const parsed = JSON.parse(savedDaily);
        setGuesses(parsed.guesses);
        setGameStatus(parsed.gameStatus);
        setSolution(targetWord);
        setCurrentGuess('');
        return;
      }
    } else {
      const index = Math.floor(Math.random() * WORDS_BANK.length);
      targetWord = WORDS_BANK[index].toUpperCase();
    }
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setSolution(targetWord);
  }, [getDailyWord]);

  // Save Daily Game State
  const saveDailyState = useCallback((newGuesses: string[], status: 'playing' | 'won' | 'lost') => {
    if (mode === 'daily') {
      localStorage.setItem(
        `wordle_daily_${new Date().toDateString()}`,
        JSON.stringify({ guesses: newGuesses, gameStatus: status })
      );
    }
  }, [mode]);

  // Handle Input
  const handleKeyInput = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        toast({ title: 'Not enough letters', variant: 'destructive' });
        return;
      }
      const guessUpper = currentGuess.toUpperCase();
      if (!WORDS_BANK.includes(guessUpper.toLowerCase())) {
        toast({ title: 'Not in word list', variant: 'destructive' });
        return;
      }

      const nextGuesses = [...guesses, guessUpper];
      setGuesses(nextGuesses);
      setCurrentGuess('');

      if (guessUpper === solution) {
        setGameStatus('won');
        saveDailyState(nextGuesses, 'won');
        toast({ title: 'Splendid! You guessed the word!' });
      } else if (nextGuesses.length >= 6) {
        setGameStatus('lost');
        saveDailyState(nextGuesses, 'lost');
        toast({ title: `Game Over! The word was ${solution}`, variant: 'destructive' });
      } else {
        saveDailyState(nextGuesses, 'playing');
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/i.test(key) && currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + key.toUpperCase());
    }
  }, [currentGuess, guesses, gameStatus, solution, toast, saveDailyState]);

  // Physical Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      let key = e.key.toUpperCase();
      if (e.key === 'Backspace') key = 'BACKSPACE';
      if (e.key === 'Enter') key = 'ENTER';
      if (/^[A-Z]$/.test(key) || key === 'BACKSPACE' || key === 'ENTER') {
        e.preventDefault();
        handleKeyInput(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput]);

  // Get Letter Colors for keyboard status
  const getLetterStatusMap = () => {
    const statusMap: Record<string, 'correct' | 'present' | 'absent'> = {};
    guesses.forEach((guess) => {
      for (let i = 0; i < guess.length; i++) {
        const char = guess[i];
        if (solution[i] === char) {
          statusMap[char] = 'correct';
        } else if (solution.includes(char)) {
          if (statusMap[char] !== 'correct') {
            statusMap[char] = 'present';
          }
        } else {
          if (!statusMap[char]) {
            statusMap[char] = 'absent';
          }
        }
      }
    });
    return statusMap;
  };

  const letterStatuses = getLetterStatusMap();

  // Color mappings
  const getCellColorClass = (char: string, index: number, isSubmitted: boolean) => {
    if (!isSubmitted) return 'border-input bg-transparent text-foreground';
    if (solution[index] === char) return 'bg-emerald-500 border-emerald-500 text-white font-bold animate-flip';
    if (solution.includes(char)) return 'bg-amber-500 border-amber-500 text-white font-bold animate-flip';
    return 'bg-zinc-500 border-zinc-500 dark:bg-zinc-700 dark:border-zinc-700 text-white font-bold animate-flip';
  };

  const getKeyboardKeyClass = (key: string) => {
    const status = letterStatuses[key];
    const base = 'flex-1 h-14 rounded-lg font-bold text-sm transition-all flex items-center justify-center cursor-pointer ';
    if (status === 'correct') return base + 'bg-emerald-500 text-white hover:bg-emerald-600';
    if (status === 'present') return base + 'bg-amber-500 text-white hover:bg-amber-600';
    if (status === 'absent') return base + 'bg-zinc-500 text-white/50 dark:bg-zinc-700';
    return base + 'bg-muted hover:bg-muted/80 text-foreground';
  };

  // Grid Rendering
  const gridRows = Array.from({ length: 6 });
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-lg mx-auto py-4 space-y-6">
        {/* Toggle Mode */}
        <div className="flex gap-2 bg-muted p-1 rounded-xl w-full max-w-xs justify-center">
          <Button
            size="sm"
            variant={mode === 'practice' ? 'default' : 'ghost'}
            className="rounded-lg flex-1"
            onClick={() => startNewGame('practice')}
          >
            Practice
          </Button>
          <Button
            size="sm"
            variant={mode === 'daily' ? 'default' : 'ghost'}
            className="rounded-lg flex-1"
            onClick={() => startNewGame('daily')}
          >
            Daily Puzzle
          </Button>
        </div>

        {/* Wordle Board Grid */}
        <div className="grid grid-rows-6 gap-2 w-full max-w-[330px] aspect-[5/6]">
          {gridRows.map((_, rowIndex) => {
            const guess = guesses[rowIndex];
            const isSubmitted = guess !== undefined;
            return (
              <div key={rowIndex} className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((__, colIndex) => {
                  let char = '';
                  if (isSubmitted) {
                    char = guess[colIndex];
                  } else if (rowIndex === guesses.length) {
                    char = currentGuess[colIndex] || '';
                  }
                  return (
                    <div
                      key={colIndex}
                      className={`w-full aspect-square border-2 rounded-xl flex items-center justify-center text-2xl uppercase transition-all duration-300 ${getCellColorClass(
                        char,
                        colIndex,
                        isSubmitted
                      )}`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Game End States */}
        {gameStatus !== 'playing' && (
          <div className="rounded-2xl border bg-card p-6 w-full text-center space-y-4 shadow-xl">
            <h3 className="text-xl font-bold flex items-center justify-center gap-2">
              {gameStatus === 'won' ? (
                <>
                  <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" />
                  Winner!
                </>
              ) : (
                'Better luck next time!'
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              The secret word was:{' '}
              <span className="font-mono text-lg font-bold text-primary tracking-wider">{solution}</span>
            </p>
            <div className="flex gap-3 justify-center">
              {mode === 'practice' ? (
                <Button size="sm" onClick={() => startNewGame('practice')} className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="gap-2">
                  <Share2 className="w-4 h-4" /> Share Daily
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Onscreen Keyboard */}
        <div className="w-full space-y-2 select-none">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyInput(key)}
                  className={getKeyboardKeyClass(key)}
                  style={{
                    flexGrow: key === 'ENTER' || key === 'BACKSPACE' ? 1.5 : 1,
                  }}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
