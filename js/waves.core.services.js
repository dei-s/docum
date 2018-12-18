/******************************************************************************
 * Copyright © 2016 The Waves Developers.                                     *
 *                                                                            *
 * See the LICENSE files at                                                   *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Waves software, including this file, may be copied, modified, propagated,  *
 * or distributed except according to the terms contained in the LICENSE      *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

(function() {
    'use strict';

    angular.module('waves.core.services', ['waves.core', 'restangular'])
        .config(function () {
            if (!String.prototype.startsWith) {
                Object.defineProperty(String.prototype, 'startsWith', {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: function(searchString, position) {
                        position = position || 0;
                        return this.lastIndexOf(searchString, position) === position;
                    }
                });
            }

            if (typeof String.prototype.endsWith !== 'function') {
                String.prototype.endsWith = function(suffix) {
                    return this.indexOf(suffix, this.length - suffix.length) !== -1;
                };
            }
        });
})();

//https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md
(function() {
    'use strict';

    angular
        .module('waves.core.services')
        .constant('wordList', [
            'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access',
            'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action',
            'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
            'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree', 'ahead', 'aim', 'air',
            'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost',
            'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among', 'amount', 'amused',
            'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry', 'animal', 'ankle', 'announce', 'annual',
            'another', 'answer', 'antenna', 'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple',
            'approve', 'april', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around',
            'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault',
            'asset', 'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract',
            'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake',
            'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge', 'bag',
            'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
            'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become', 'beef', 'before', 'begin',
            'behave', 'behind', 'believe', 'below', 'belt', 'bench', 'benefit', 'best', 'betray', 'better', 'between',
            'beyond', 'bicycle', 'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black', 'blade', 'blame',
            'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood', 'blossom', 'blouse', 'blue', 'blur', 'blush',
            'board', 'boat', 'body', 'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow',
            'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass', 'brave', 'bread', 'breeze',
            'brick', 'bridge', 'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother',
            'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb', 'bulk', 'bullet', 'bundle',
            'bunker', 'burden', 'burger', 'burst', 'bus', 'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage',
            'cabin', 'cable', 'cactus', 'cage', 'cake', 'call', 'calm', 'camera', 'camp', 'can', 'canal', 'cancel',
            'candy', 'cannon', 'canoe', 'canvas', 'canyon', 'capable', 'capital', 'captain', 'car', 'carbon', 'card',
            'cargo', 'carpet', 'carry', 'cart', 'case', 'cash', 'casino', 'castle', 'casual', 'cat', 'catalog', 'catch',
            'category', 'cattle', 'caught', 'cause', 'caution', 'cave', 'ceiling', 'celery', 'cement', 'census',
            'century', 'cereal', 'certain', 'chair', 'chalk', 'champion', 'change', 'chaos', 'chapter', 'charge',
            'chase', 'chat', 'cheap', 'check', 'cheese', 'chef', 'cherry', 'chest', 'chicken', 'chief', 'child',
            'chimney', 'choice', 'choose', 'chronic', 'chuckle', 'chunk', 'churn', 'cigar', 'cinnamon', 'circle',
            'citizen', 'city', 'civil', 'claim', 'clap', 'clarify', 'claw', 'clay', 'clean', 'clerk', 'clever', 'click',
            'client', 'cliff', 'climb', 'clinic', 'clip', 'clock', 'clog', 'close', 'cloth', 'cloud', 'clown', 'club',
            'clump', 'cluster', 'clutch', 'coach', 'coast', 'coconut', 'code', 'coffee', 'coil', 'coin', 'collect',
            'color', 'column', 'combine', 'come', 'comfort', 'comic', 'common', 'company', 'concert', 'conduct',
            'confirm', 'congress', 'connect', 'consider', 'control', 'convince', 'cook', 'cool', 'copper', 'copy',
            'coral', 'core', 'corn', 'correct', 'cost', 'cotton', 'couch', 'country', 'couple', 'course', 'cousin',
            'cover', 'coyote', 'crack', 'cradle', 'craft', 'cram', 'crane', 'crash', 'crater', 'crawl', 'crazy',
            'cream', 'credit', 'creek', 'crew', 'cricket', 'crime', 'crisp', 'critic', 'crop', 'cross', 'crouch',
            'crowd', 'crucial', 'cruel', 'cruise', 'crumble', 'crunch', 'crush', 'cry', 'crystal', 'cube', 'culture',
            'cup', 'cupboard', 'curious', 'current', 'curtain', 'curve', 'cushion', 'custom', 'cute', 'cycle', 'dad',
            'damage', 'damp', 'dance', 'danger', 'daring', 'dash', 'daughter', 'dawn', 'day', 'deal', 'debate',
            'debris', 'decade', 'december', 'decide', 'decline', 'decorate', 'decrease', 'deer', 'defense', 'define',
            'defy', 'degree', 'delay', 'deliver', 'demand', 'demise', 'denial', 'dentist', 'deny', 'depart', 'depend',
            'deposit', 'depth', 'deputy', 'derive', 'describe', 'desert', 'design', 'desk', 'despair', 'destroy',
            'detail', 'detect', 'develop', 'device', 'devote', 'diagram', 'dial', 'diamond', 'diary', 'dice', 'diesel',
            'diet', 'differ', 'digital', 'dignity', 'dilemma', 'dinner', 'dinosaur', 'direct', 'dirt', 'disagree',
            'discover', 'disease', 'dish', 'dismiss', 'disorder', 'display', 'distance', 'divert', 'divide', 'divorce',
            'dizzy', 'doctor', 'document', 'dog', 'doll', 'dolphin', 'domain', 'donate', 'donkey', 'donor', 'door',
            'dose', 'double', 'dove', 'draft', 'dragon', 'drama', 'drastic', 'draw', 'dream', 'dress', 'drift', 'drill',
            'drink', 'drip', 'drive', 'drop', 'drum', 'dry', 'duck', 'dumb', 'dune', 'during', 'dust', 'dutch', 'duty',
            'dwarf', 'dynamic', 'eager', 'eagle', 'early', 'earn', 'earth', 'easily', 'east', 'easy', 'echo', 'ecology',
            'economy', 'edge', 'edit', 'educate', 'effort', 'egg', 'eight', 'either', 'elbow', 'elder', 'electric',
            'elegant', 'element', 'elephant', 'elevator', 'elite', 'else', 'embark', 'embody', 'embrace', 'emerge',
            'emotion', 'employ', 'empower', 'empty', 'enable', 'enact', 'end', 'endless', 'endorse', 'enemy', 'energy',
            'enforce', 'engage', 'engine', 'enhance', 'enjoy', 'enlist', 'enough', 'enrich', 'enroll', 'ensure',
            'enter', 'entire', 'entry', 'envelope', 'episode', 'equal', 'equip', 'era', 'erase', 'erode', 'erosion',
            'error', 'erupt', 'escape', 'essay', 'essence', 'estate', 'eternal', 'ethics', 'evidence', 'evil', 'evoke',
            'evolve', 'exact', 'example', 'excess', 'exchange', 'excite', 'exclude', 'excuse', 'execute', 'exercise',
            'exhaust', 'exhibit', 'exile', 'exist', 'exit', 'exotic', 'expand', 'expect', 'expire', 'explain', 'expose',
            'express', 'extend', 'extra', 'eye', 'eyebrow', 'fabric', 'face', 'faculty', 'fade', 'faint', 'faith',
            'fall', 'false', 'fame', 'family', 'famous', 'fan', 'fancy', 'fantasy', 'farm', 'fashion', 'fat', 'fatal',
            'father', 'fatigue', 'fault', 'favorite', 'feature', 'february', 'federal', 'fee', 'feed', 'feel', 'female',
            'fence', 'festival', 'fetch', 'fever', 'few', 'fiber', 'fiction', 'field', 'figure', 'file', 'film',
            'filter', 'final', 'find', 'fine', 'finger', 'finish', 'fire', 'firm', 'first', 'fiscal', 'fish', 'fit',
            'fitness', 'fix', 'flag', 'flame', 'flash', 'flat', 'flavor', 'flee', 'flight', 'flip', 'float', 'flock',
            'floor', 'flower', 'fluid', 'flush', 'fly', 'foam', 'focus', 'fog', 'foil', 'fold', 'follow', 'food',
            'foot', 'force', 'forest', 'forget', 'fork', 'fortune', 'forum', 'forward', 'fossil', 'foster', 'found',
            'fox', 'fragile', 'frame', 'frequent', 'fresh', 'friend', 'fringe', 'frog', 'front', 'frost', 'frown',
            'frozen', 'fruit', 'fuel', 'fun', 'funny', 'furnace', 'fury', 'future', 'gadget', 'gain', 'galaxy',
            'gallery', 'game', 'gap', 'garage', 'garbage', 'garden', 'garlic', 'garment', 'gas', 'gasp', 'gate',
            'gather', 'gauge', 'gaze', 'general', 'genius', 'genre', 'gentle', 'genuine', 'gesture', 'ghost', 'giant',
            'gift', 'giggle', 'ginger', 'giraffe', 'girl', 'give', 'glad', 'glance', 'glare', 'glass', 'glide',
            'glimpse', 'globe', 'gloom', 'glory', 'glove', 'glow', 'glue', 'goat', 'goddess', 'gold', 'good', 'goose',
            'gorilla', 'gospel', 'gossip', 'govern', 'gown', 'grab', 'grace', 'grain', 'grant', 'grape', 'grass',
            'gravity', 'great', 'green', 'grid', 'grief', 'grit', 'grocery', 'group', 'grow', 'grunt', 'guard', 'guess',
            'guide', 'guilt', 'guitar', 'gun', 'gym', 'habit', 'hair', 'half', 'hammer', 'hamster', 'hand', 'happy',
            'harbor', 'hard', 'harsh', 'harvest', 'hat', 'have', 'hawk', 'hazard', 'head', 'health', 'heart', 'heavy',
            'hedgehog', 'height', 'hello', 'helmet', 'help', 'hen', 'hero', 'hidden', 'high', 'hill', 'hint', 'hip',
            'hire', 'history', 'hobby', 'hockey', 'hold', 'hole', 'holiday', 'hollow', 'home', 'honey', 'hood', 'hope',
            'horn', 'horror', 'horse', 'hospital', 'host', 'hotel', 'hour', 'hover', 'hub', 'huge', 'human', 'humble',
            'humor', 'hundred', 'hungry', 'hunt', 'hurdle', 'hurry', 'hurt', 'husband', 'hybrid', 'ice', 'icon', 'idea',
            'identify', 'idle', 'ignore', 'ill', 'illegal', 'illness', 'image', 'imitate', 'immense', 'immune',
            'impact', 'impose', 'improve', 'impulse', 'inch', 'include', 'income', 'increase', 'index', 'indicate',
            'indoor', 'industry', 'infant', 'inflict', 'inform', 'inhale', 'inherit', 'initial', 'inject', 'injury',
            'inmate', 'inner', 'innocent', 'input', 'inquiry', 'insane', 'insect', 'inside', 'inspire', 'install',
            'intact', 'interest', 'into', 'invest', 'invite', 'involve', 'iron', 'island', 'isolate', 'issue', 'item',
            'ivory', 'jacket', 'jaguar', 'jar', 'jazz', 'jealous', 'jeans', 'jelly', 'jewel', 'job', 'join', 'joke',
            'journey', 'joy', 'judge', 'juice', 'jump', 'jungle', 'junior', 'junk', 'just', 'kangaroo', 'keen', 'keep',
            'ketchup', 'key', 'kick', 'kid', 'kidney', 'kind', 'kingdom', 'kiss', 'kit', 'kitchen', 'kite', 'kitten',
            'kiwi', 'knee', 'knife', 'knock', 'know', 'lab', 'label', 'labor', 'ladder', 'lady', 'lake', 'lamp',
            'language', 'laptop', 'large', 'later', 'latin', 'laugh', 'laundry', 'lava', 'law', 'lawn', 'lawsuit',
            'layer', 'lazy', 'leader', 'leaf', 'learn', 'leave', 'lecture', 'left', 'leg', 'legal', 'legend', 'leisure',
            'lemon', 'lend', 'length', 'lens', 'leopard', 'lesson', 'letter', 'level', 'liar', 'liberty', 'library',
            'license', 'life', 'lift', 'light', 'like', 'limb', 'limit', 'link', 'lion', 'liquid', 'list', 'little',
            'live', 'lizard', 'load', 'loan', 'lobster', 'local', 'lock', 'logic', 'lonely', 'long', 'loop', 'lottery',
            'loud', 'lounge', 'love', 'loyal', 'lucky', 'luggage', 'lumber', 'lunar', 'lunch', 'luxury', 'lyrics',
            'machine', 'mad', 'magic', 'magnet', 'maid', 'mail', 'main', 'major', 'make', 'mammal', 'man', 'manage',
            'mandate', 'mango', 'mansion', 'manual', 'maple', 'marble', 'march', 'margin', 'marine', 'market',
            'marriage', 'mask', 'mass', 'master', 'match', 'material', 'math', 'matrix', 'matter', 'maximum', 'maze',
            'meadow', 'mean', 'measure', 'meat', 'mechanic', 'medal', 'media', 'melody', 'melt', 'member', 'memory',
            'mention', 'menu', 'mercy', 'merge', 'merit', 'merry', 'mesh', 'message', 'metal', 'method', 'middle',
            'midnight', 'milk', 'million', 'mimic', 'mind', 'minimum', 'minor', 'minute', 'miracle', 'mirror', 'misery',
            'miss', 'mistake', 'mix', 'mixed', 'mixture', 'mobile', 'model', 'modify', 'mom', 'moment', 'monitor',
            'monkey', 'monster', 'month', 'moon', 'moral', 'more', 'morning', 'mosquito', 'mother', 'motion', 'motor',
            'mountain', 'mouse', 'move', 'movie', 'much', 'muffin', 'mule', 'multiply', 'muscle', 'museum', 'mushroom',
            'music', 'must', 'mutual', 'myself', 'mystery', 'myth', 'naive', 'name', 'napkin', 'narrow', 'nasty',
            'nation', 'nature', 'near', 'neck', 'need', 'negative', 'neglect', 'neither', 'nephew', 'nerve', 'nest',
            'net', 'network', 'neutral', 'never', 'news', 'next', 'nice', 'night', 'noble', 'noise', 'nominee',
            'noodle', 'normal', 'north', 'nose', 'notable', 'note', 'nothing', 'notice', 'novel', 'now', 'nuclear',
            'number', 'nurse', 'nut', 'oak', 'obey', 'object', 'oblige', 'obscure', 'observe', 'obtain', 'obvious',
            'occur', 'ocean', 'october', 'odor', 'off', 'offer', 'office', 'often', 'oil', 'okay', 'old', 'olive',
            'olympic', 'omit', 'once', 'one', 'onion', 'online', 'only', 'open', 'opera', 'opinion', 'oppose',
            'option', 'orange', 'orbit', 'orchard', 'order', 'ordinary', 'organ', 'orient', 'original', 'orphan',
            'ostrich', 'other', 'outdoor', 'outer', 'output', 'outside', 'oval', 'oven', 'over', 'own', 'owner',
            'oxygen', 'oyster', 'ozone', 'pact', 'paddle', 'page', 'pair', 'palace', 'palm', 'panda', 'panel', 'panic',
            'panther', 'paper', 'parade', 'parent', 'park', 'parrot', 'party', 'pass', 'patch', 'path', 'patient',
            'patrol', 'pattern', 'pause', 'pave', 'payment', 'peace', 'peanut', 'pear', 'peasant', 'pelican', 'pen',
            'penalty', 'pencil', 'people', 'pepper', 'perfect', 'permit', 'person', 'pet', 'phone', 'photo', 'phrase',
            'physical', 'piano', 'picnic', 'picture', 'piece', 'pig', 'pigeon', 'pill', 'pilot', 'pink', 'pioneer',
            'pipe', 'pistol', 'pitch', 'pizza', 'place', 'planet', 'plastic', 'plate', 'play', 'please', 'pledge',
            'pluck', 'plug', 'plunge', 'poem', 'poet', 'point', 'polar', 'pole', 'police', 'pond', 'pony', 'pool',
            'popular', 'portion', 'position', 'possible', 'post', 'potato', 'pottery', 'poverty', 'powder', 'power',
            'practice', 'praise', 'predict', 'prefer', 'prepare', 'present', 'pretty', 'prevent', 'price', 'pride',
            'primary', 'print', 'priority', 'prison', 'private', 'prize', 'problem', 'process', 'produce', 'profit',
            'program', 'project', 'promote', 'proof', 'property', 'prosper', 'protect', 'proud', 'provide', 'public',
            'pudding', 'pull', 'pulp', 'pulse', 'pumpkin', 'punch', 'pupil', 'puppy', 'purchase', 'purity', 'purpose',
            'purse', 'push', 'put', 'puzzle', 'pyramid', 'quality', 'quantum', 'quarter', 'question', 'quick', 'quit',
            'quiz', 'quote', 'rabbit', 'raccoon', 'race', 'rack', 'radar', 'radio', 'rail', 'rain', 'raise', 'rally',
            'ramp', 'ranch', 'random', 'range', 'rapid', 'rare', 'rate', 'rather', 'raven', 'raw', 'razor', 'ready',
            'real', 'reason', 'rebel', 'rebuild', 'recall', 'receive', 'recipe', 'record', 'recycle', 'reduce',
            'reflect', 'reform', 'refuse', 'region', 'regret', 'regular', 'reject', 'relax', 'release', 'relief',
            'rely', 'remain', 'remember', 'remind', 'remove', 'render', 'renew', 'rent', 'reopen', 'repair', 'repeat',
            'replace', 'report', 'require', 'rescue', 'resemble', 'resist', 'resource', 'response', 'result', 'retire',
            'retreat', 'return', 'reunion', 'reveal', 'review', 'reward', 'rhythm', 'rib', 'ribbon', 'rice', 'rich',
            'ride', 'ridge', 'rifle', 'right', 'rigid', 'ring', 'riot', 'ripple', 'risk', 'ritual', 'rival', 'river',
            'road', 'roast', 'robot', 'robust', 'rocket', 'romance', 'roof', 'rookie', 'room', 'rose', 'rotate',
            'rough', 'round', 'route', 'royal', 'rubber', 'rude', 'rug', 'rule', 'run', 'runway', 'rural', 'sad',
            'saddle', 'sadness', 'safe', 'sail', 'salad', 'salmon', 'salon', 'salt', 'salute', 'same', 'sample', 'sand',
            'satisfy', 'satoshi', 'sauce', 'sausage', 'save', 'say', 'scale', 'scan', 'scare', 'scatter', 'scene',
            'scheme', 'school', 'science', 'scissors', 'scorpion', 'scout', 'scrap', 'screen', 'script', 'scrub', 'sea',
            'search', 'season', 'seat', 'second', 'secret', 'section', 'security', 'seed', 'seek', 'segment', 'select',
            'sell', 'seminar', 'senior', 'sense', 'sentence', 'series', 'service', 'session', 'settle', 'setup',
            'seven', 'shadow', 'shaft', 'shallow', 'share', 'shed', 'shell', 'sheriff', 'shield', 'shift', 'shine',
            'ship', 'shiver', 'shock', 'shoe', 'shoot', 'shop', 'short', 'shoulder', 'shove', 'shrimp', 'shrug',
            'shuffle', 'shy', 'sibling', 'sick', 'side', 'siege', 'sight', 'sign', 'silent', 'silk', 'silly', 'silver',
            'similar', 'simple', 'since', 'sing', 'siren', 'sister', 'situate', 'six', 'size', 'skate', 'sketch', 'ski',
            'skill', 'skin', 'skirt', 'skull', 'slab', 'slam', 'sleep', 'slender', 'slice', 'slide', 'slight', 'slim',
            'slogan', 'slot', 'slow', 'slush', 'small', 'smart', 'smile', 'smoke', 'smooth', 'snack', 'snake', 'snap',
            'sniff', 'snow', 'soap', 'soccer', 'social', 'sock', 'soda', 'soft', 'solar', 'soldier', 'solid',
            'solution', 'solve', 'someone', 'song', 'soon', 'sorry', 'sort', 'soul', 'sound', 'soup', 'source', 'south',
            'space', 'spare', 'spatial', 'spawn', 'speak', 'special', 'speed', 'spell', 'spend', 'sphere', 'spice',
            'spider', 'spike', 'spin', 'spirit', 'split', 'spoil', 'sponsor', 'spoon', 'sport', 'spot', 'spray',
            'spread', 'spring', 'spy', 'square', 'squeeze', 'squirrel', 'stable', 'stadium', 'staff', 'stage', 'stairs',
            'stamp', 'stand', 'start', 'state', 'stay', 'steak', 'steel', 'stem', 'step', 'stereo', 'stick', 'still',
            'sting', 'stock', 'stomach', 'stone', 'stool', 'story', 'stove', 'strategy', 'street', 'strike', 'strong',
            'struggle', 'student', 'stuff', 'stumble', 'style', 'subject', 'submit', 'subway', 'success', 'such',
            'sudden', 'suffer', 'sugar', 'suggest', 'suit', 'summer', 'sun', 'sunny', 'sunset', 'super', 'supply',
            'supreme', 'sure', 'surface', 'surge', 'surprise', 'surround', 'survey', 'suspect', 'sustain', 'swallow',
            'swamp', 'swap', 'swarm', 'swear', 'sweet', 'swift', 'swim', 'swing', 'switch', 'sword', 'symbol',
            'symptom', 'syrup', 'system', 'table', 'tackle', 'tag', 'tail', 'talent', 'talk', 'tank', 'tape', 'target',
            'task', 'taste', 'tattoo', 'taxi', 'teach', 'team', 'tell', 'ten', 'tenant', 'tennis', 'tent', 'term',
            'test', 'text', 'thank', 'that', 'theme', 'then', 'theory', 'there', 'they', 'thing', 'this', 'thought',
            'three', 'thrive', 'throw', 'thumb', 'thunder', 'ticket', 'tide', 'tiger', 'tilt', 'timber', 'time', 'tiny',
            'tip', 'tired', 'tissue', 'title', 'toast', 'tobacco', 'today', 'toddler', 'toe', 'together', 'toilet',
            'token', 'tomato', 'tomorrow', 'tone', 'tongue', 'tonight', 'tool', 'tooth', 'top', 'topic', 'topple',
            'torch', 'tornado', 'tortoise', 'toss', 'total', 'tourist', 'toward', 'tower', 'town', 'toy', 'track',
            'trade', 'traffic', 'tragic', 'train', 'transfer', 'trap', 'trash', 'travel', 'tray', 'treat', 'tree',
            'trend', 'trial', 'tribe', 'trick', 'trigger', 'trim', 'trip', 'trophy', 'trouble', 'truck', 'true',
            'truly', 'trumpet', 'trust', 'truth', 'try', 'tube', 'tuition', 'tumble', 'tuna', 'tunnel', 'turkey',
            'turn', 'turtle', 'twelve', 'twenty', 'twice', 'twin', 'twist', 'two', 'type', 'typical', 'ugly',
            'umbrella', 'unable', 'unaware', 'uncle', 'uncover', 'under', 'undo', 'unfair', 'unfold', 'unhappy',
            'uniform', 'unique', 'unit', 'universe', 'unknown', 'unlock', 'until', 'unusual', 'unveil', 'update',
            'upgrade', 'uphold', 'upon', 'upper', 'upset', 'urban', 'urge', 'usage', 'use', 'used', 'useful', 'useless',
            'usual', 'utility', 'vacant', 'vacuum', 'vague', 'valid', 'valley', 'valve', 'van', 'vanish', 'vapor',
            'various', 'vast', 'vault', 'vehicle', 'velvet', 'vendor', 'venture', 'venue', 'verb', 'verify', 'version',
            'very', 'vessel', 'veteran', 'viable', 'vibrant', 'vicious', 'victory', 'video', 'view', 'village',
            'vintage', 'violin', 'virtual', 'virus', 'visa', 'visit', 'visual', 'vital', 'vivid', 'vocal', 'voice',
            'void', 'volcano', 'volume', 'vote', 'voyage', 'wage', 'wagon', 'wait', 'walk', 'wall', 'walnut', 'want',
            'warfare', 'warm', 'warrior', 'wash', 'wasp', 'waste', 'water', 'wave', 'way', 'wealth', 'weapon', 'wear',
            'weasel', 'weather', 'web', 'wedding', 'weekend', 'weird', 'welcome', 'west', 'wet', 'whale', 'what',
            'wheat', 'wheel', 'when', 'where', 'whip', 'whisper', 'wide', 'width', 'wife', 'wild', 'will', 'win',
            'window', 'wine', 'wing', 'wink', 'winner', 'winter', 'wire', 'wisdom', 'wise', 'wish', 'witness', 'wolf',
            'woman', 'wonder', 'wood', 'wool', 'word', 'work', 'world', 'worry', 'worth', 'wrap', 'wreck', 'wrestle',
            'wrist', 'write', 'wrong', 'yard', 'year', 'yellow', 'you', 'young', 'youth', 'zebra', 'zero', 'zone', 'zoo'
        ]);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('passPhraseService', ['wordList', '$window', function (wordList, $window) {
            this.generate = function () {
                var crypto = $window.crypto || $window.msCrypto;
                var bits = 160;
                var wordCount = wordList.length;
                var log2FromWordCount = Math.log(wordCount) / Math.log(2);
                var wordsInPassPhrase = Math.ceil(bits / log2FromWordCount);
                var random = new Uint16Array(wordsInPassPhrase);
                var passPhrase;

                crypto.getRandomValues(random);

                var i = 0,
                    index,
                    words = [];

                for (; i < wordsInPassPhrase; i++) {
                    index = random[i] % wordCount;
                    words.push(wordList[index]);
                }

                passPhrase = words.join(' ');

                crypto.getRandomValues(random);

                return passPhrase;
            };
        }]);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('accountService', ['storageService', '$q', function (storageService, $q) {
            var stateCache;

            function removeByIndex(state, index) {
                state.accounts.splice(index, 1);

                return state;
            }

            function getState() {
                if (angular.isUndefined(stateCache)) {
                    return storageService.loadState().then(function (state) {
                        state = state || {};
                        if (!state.accounts)
                            state.accounts = [];

                        stateCache = state;

                        return stateCache;
                    });
                }

                return $q.when(stateCache);
            }

            this.addAccount = function (accountInfo) {
                return getState()
                    .then(function (state) {
                        state.accounts.push(accountInfo);

                        return state;
                    })
                    .then(storageService.saveState);
            };

            this.removeAccountByIndex = function (index) {
                return getState()
                    .then(function (state) {
                        return removeByIndex(state, index);
                    })
                    .then(storageService.saveState);
            };

            this.removeAccount = function (account) {
                return getState()
                    .then(function (state) {
                        var index = _.findIndex(state.accounts, {
                            address: account.address
                        });
                        return removeByIndex(state, index);
                    })
                    .then(storageService.saveState);
            };

            this.getAccounts = function () {
                return getState()
                    .then(function (state) {
                        return state.accounts;
                    });
            };
        }]);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('addressService', ['constants.address', function (constants) {
            this.cleanupOptionalPrefix = function(displayAddress) {
                if (displayAddress.length <= 30) {
                    // Don't change aliases
                    return displayAddress;
                }

                var address = displayAddress,
                    prefixLen = constants.ADDRESS_PREFIX.length;

                if (address.length > constants.RAW_ADDRESS_LENGTH || address.startsWith(constants.ADDRESS_PREFIX)) {
                    address = address.substr(prefixLen, address.length - prefixLen);
                }

                return address;
            };

            this.validateAddress = function(address) {
                var cleanAddress = this.cleanupOptionalPrefix(address);
                return constants.MAINNET_ADDRESS_REGEXP.test(cleanAddress);
            };
        }]);
})();

/**
 * @requires {blake2b-256.js}
 * @requires {Base58.js}
 */
(function() {
    'use strict';

    angular
        .module('waves.core.services')
        .service('cryptoService', ['constants.network', '$window', function(constants, window) {

            // private version of getNetworkId byte in order to avoid circular dependency
            // between cryptoService and utilityService
            var getNetworkIdByte = function() {
                return constants.NETWORK_CODE.charCodeAt(0) & 0xFF;
            };

            var appendUint8Arrays = function(array1, array2) {
                var tmp = new Uint8Array(array1.length + array2.length);
                tmp.set(array1, 0);
                tmp.set(array2, array1.length);
                return tmp;
            };

            var appendNonce = function (originalSeed) {
                // change this is when nonce increment gets introduced
                var nonce = new Uint8Array(converters.int32ToBytes(constants.INITIAL_NONCE, true));

                return appendUint8Arrays(nonce, originalSeed);
            };

            // sha256 accepts messageBytes as Uint8Array or Array
            var sha256 = function (message) {
                var bytes;
                if (typeof(message) == 'string')
                    bytes = converters.stringToByteArray(message);
                else
                    bytes = message;

                var wordArray = converters.byteArrayToWordArrayEx(new Uint8Array(bytes));
                var resultWordArray = CryptoJS.SHA256(wordArray);

                return converters.wordArrayToByteArrayEx(resultWordArray);
            };

            var prepareKey = function (key) {
                var rounds = 1000;
                var digest = key;
                for (var i = 0; i < rounds; i++) {
                    digest = converters.byteArrayToHexString(sha256(digest));
                }

                return digest;
            };

            // blake2b 256 hash function
            this.blake2b = function (input) {
                return blake2b(input, null, 32);
            };

            // keccak 256 hash algorithm
            this.keccak = function(messageBytes) {
                // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                return keccak_256.array(messageBytes);
                // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            };

            this.sha256 = sha256;

            this.hashChain = function(noncedSecretPhraseBytes) {
                return this.keccak(this.blake2b(new Uint8Array(noncedSecretPhraseBytes)));
            };

            // Base68 encoding/decoding implementation
            this.base58 = {
                encode: function (buffer) {
                    return Base58.encode(buffer);
                },
                decode: function (string) {
                    return Base58.decode(string);
                }
            };

            this.buildAccountSeedHash = function(seedBytes) {
                var data = appendNonce(seedBytes);
                var seedHash = this.hashChain(data);

                return sha256(Array.prototype.slice.call(seedHash));
            };

            this.buildKeyPair = function(seedBytes) {
                var accountSeedHash = this.buildAccountSeedHash(seedBytes);
                var p = axlsign.generateKeyPair(accountSeedHash);

                return {
                    public: this.base58.encode(p.public),
                    private: this.base58.encode(p.private)
                };
            };

            this.buildPublicKey = function (seedBytes) {
                return this.buildKeyPair(seedBytes).public;
            };

            this.buildPrivateKey = function (seedBytes) {
                return this.buildKeyPair(seedBytes).private;
            };

            this.buildRawAddress = function (encodedPublicKey) {
                var publicKey = this.base58.decode(encodedPublicKey);
                var publicKeyHash = this.hashChain(publicKey);

                var prefix = new Uint8Array(2);
                prefix[0] = constants.ADDRESS_VERSION;
                prefix[1] = getNetworkIdByte();

                var unhashedAddress = appendUint8Arrays(prefix, publicKeyHash.slice(0, 20));
                var addressHash = this.hashChain(unhashedAddress).slice(0, 4);

                return this.base58.encode(appendUint8Arrays(unhashedAddress, addressHash));
            };

            this.buildRawAddressFromSeed = function (secretPhrase) {
                var publicKey = this.getPublicKey(secretPhrase);

                return this.buildRawAddress(publicKey);
            };

            //Returns publicKey built from string
            this.getPublicKey = function(secretPhrase) {
                return this.buildPublicKey(converters.stringToByteArray(secretPhrase));
            };

            //Returns privateKey built from string
            this.getPrivateKey = function(secretPhrase) {
                return this.buildPrivateKey(converters.stringToByteArray(secretPhrase));
            };

            //Returns key pair built from string
            this.getKeyPair = function (secretPhrase) {
                return this.buildKeyPair(converters.stringToByteArray(secretPhrase));
            };

            // function accepts buffer with private key and an array with dataToSign
            // returns buffer with signed data
            // 64 randoms bytes are added to the signature
            // method falls back to deterministic signatures if crypto object is not supported
            this.nonDeterministicSign = function(privateKey, dataToSign) {
                var crypto = window.crypto || window.msCrypto;
                var random;
                if (crypto) {
                    random = new Uint8Array(64);
                    crypto.getRandomValues(random);
                }

                var signature = axlsign.sign(privateKey, new Uint8Array(dataToSign), random);

                return this.base58.encode(signature);
            };

            // function accepts buffer with private key and an array with dataToSign
            // returns buffer with signed data
            this.deterministicSign = function(privateKey, dataToSign) {
                var signature = axlsign.sign(privateKey, new Uint8Array(dataToSign));

                return this.base58.encode(signature);
            };

            this.verify = function(senderPublicKey, dataToSign, signatureBytes) {
                return axlsign.verify(senderPublicKey, dataToSign, signatureBytes);
            };

            // function returns base58 encoded shared key from base58 encoded a private
            // and b public keys
            this.getSharedKey = function (aEncodedPrivateKey, bEncodedPublicKey) {
                var aPrivateKey = this.base58.decode(aEncodedPrivateKey);
                var bPublicKey = this.base58.decode(bEncodedPublicKey);
                var sharedKey = axlsign.sharedKey(aPrivateKey, bPublicKey);

                return this.base58.encode(sharedKey);
            };

            // function can be used for sharedKey preparation, as recommended in: https://github.com/wavesplatform/curve25519-js
            this.prepareKey = function (key) {
                return prepareKey(key);
            };

            this.encryptWalletSeed = function (seed, key) {
                var aesKey = prepareKey(key);

                return CryptoJS.AES.encrypt(seed, aesKey);
            };

            this.decryptWalletSeed = function (cipher, key, checksum) {
                var aesKey = prepareKey(key);
                var data = CryptoJS.AES.decrypt(cipher, aesKey);

                var actualChecksum = this.seedChecksum(converters.hexStringToByteArray(data.toString()));
                if (actualChecksum === checksum)
                    return converters.hexStringToString(data.toString());
                else
                    return false;
            };

            this.seedChecksum = function (seed) {
                return converters.byteArrayToHexString(sha256(seed));
            };
        }]);
})();

(function () {
    'use strict';

    function AssetService(signService, validateService, utilityService, cryptoService) {
        function buildId(transactionBytes) {
            var hash = cryptoService.blake2b(new Uint8Array(transactionBytes));
            return cryptoService.base58.encode(hash);
        }

        function buildCreateAssetSignatureData (asset, tokensQuantity, senderPublicKey) {
            return [].concat(
                signService.getAssetIssueTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getAssetNameBytes(asset.name),
                signService.getAssetDescriptionBytes(asset.description),
                signService.getAssetQuantityBytes(tokensQuantity),
                signService.getAssetDecimalPlacesBytes(asset.decimalPlaces),
                signService.getAssetIsReissuableBytes(asset.reissuable),
                signService.getFeeBytes(asset.fee.toCoins()),
                signService.getTimestampBytes(asset.time)
            );
        }

        this.createAssetIssueTransaction = function (asset, sender) {
            validateService.validateAssetIssue(asset);
            validateService.validateSender(sender);

            asset.time = asset.time || utilityService.getTime();
            asset.reissuable = angular.isDefined(asset.reissuable) ? asset.reissuable : false;
            asset.description = asset.description || '';

            var assetCurrency = Currency.create({
                displayName: asset.name,
                precision: asset.decimalPlaces
            });

            var tokens = new Money(asset.totalTokens, assetCurrency);
            var signatureData = buildCreateAssetSignatureData(asset, tokens.toCoins(), sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                id: buildId(signatureData),
                name: asset.name,
                description: asset.description,
                quantity: tokens.toCoins(),
                decimals: Number(asset.decimalPlaces),
                reissuable: asset.reissuable,
                timestamp: asset.time,
                fee: asset.fee.toCoins(),
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };

        function buildCreateAssetTransferSignatureData(transfer, senderPublicKey) {
            return [].concat(
                signService.getAssetTransferTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getAssetIdBytes(transfer.amount.currency.id),
                signService.getFeeAssetIdBytes(transfer.fee.currency.id),
                signService.getTimestampBytes(transfer.time),
                signService.getAmountBytes(transfer.amount.toCoins()),
                signService.getFeeBytes(transfer.fee.toCoins()),
                signService.getRecipientBytes(transfer.recipient),
                signService.getAttachmentBytes(transfer.attachment)
            );
        }

        this.createAssetTransferTransaction = function (transfer, sender) {
            validateService.validateAssetTransfer(transfer);
            validateService.validateSender(sender);

            transfer.time = transfer.time || utilityService.getTime();
            transfer.attachment = transfer.attachment || [];
            transfer.recipient = utilityService.resolveAddressOrAlias(transfer.recipient);

            var signatureData = buildCreateAssetTransferSignatureData(transfer, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                id: buildId(signatureData),
                recipient: transfer.recipient,
                timestamp: transfer.time,
                assetId: transfer.amount.currency.id,
                amount: transfer.amount.toCoins(),
                fee: transfer.fee.toCoins(),
                feeAssetId: transfer.fee.currency.id,
                senderPublicKey: sender.publicKey,
                signature: signature,
                attachment: cryptoService.base58.encode(transfer.attachment)
            };
        };

        function buildCreateAssetReissueSignatureData(reissue, senderPublicKey) {
            return [].concat(
                signService.getAssetReissueTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getAssetIdBytes(reissue.totalTokens.currency.id, true),
                signService.getAssetQuantityBytes(reissue.totalTokens.toCoins()),
                signService.getAssetIsReissuableBytes(reissue.reissuable),
                signService.getFeeBytes(reissue.fee.toCoins()),
                signService.getTimestampBytes(reissue.time)
            );
        }

        this.createAssetReissueTransaction = function (reissue, sender) {
            validateService.validateAssetReissue(reissue);
            validateService.validateSender(sender);

            reissue.reissuable = angular.isDefined(reissue.reissuable) ? reissue.reissuable : false;
            reissue.time = reissue.time || utilityService.getTime();

            var signatureData = buildCreateAssetReissueSignatureData(reissue, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                id: buildId(signatureData),
                assetId: reissue.totalTokens.currency.id,
                quantity: reissue.totalTokens.toCoins(),
                reissuable: reissue.reissuable,
                timestamp: reissue.time,
                fee: reissue.fee.toCoins(),
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };
    }

    AssetService.$inject = ['signService', 'validateService', 'utilityService', 'cryptoService'];

    angular
        .module('waves.core.services')
        .service('assetService', AssetService);
})();

(function () {
    'use strict';

    function AliasRequestService(signService, utilityService, validateService) {
        function buildCreateAliasSignatureData (alias, senderPublicKey) {
            return [].concat(
                signService.getCreateAliasTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getAliasBytes(alias.alias),
                signService.getFeeBytes(alias.fee.toCoins()),
                signService.getTimestampBytes(alias.time)
            );
        }

        this.buildCreateAliasRequest = function (alias, sender) {
            validateService.validateSender(sender);

            var currentTimeMillis = utilityService.getTime();
            alias.time = alias.time || currentTimeMillis;

            var signatureData = buildCreateAliasSignatureData(alias, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                alias: alias.alias,
                timestamp: alias.time,
                fee: alias.fee.toCoins(),
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };
    }

    AliasRequestService.$inject = ['signService', 'utilityService', 'validateService'];

    angular
        .module('waves.core.services')
        .service('aliasRequestService', AliasRequestService);
})();

(function () {
    'use strict';

    function LeasingRequestService(signService, utilityService, validateService) {
        function buildStartLeasingSignatureData (startLeasing, senderPublicKey) {
            return [].concat(
                signService.getStartLeasingTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getRecipientBytes(startLeasing.recipient),
                signService.getAmountBytes(startLeasing.amount.toCoins()),
                signService.getFeeBytes(startLeasing.fee.toCoins()),
                signService.getTimestampBytes(startLeasing.time)
            );
        }

        this.buildStartLeasingRequest = function (startLeasing, sender) {
            validateService.validateSender(sender);

            var currentTimeMillis = utilityService.getTime();
            startLeasing.time = startLeasing.time || currentTimeMillis;
            startLeasing.recipient = utilityService.resolveAddressOrAlias(startLeasing.recipient);

            var signatureData = buildStartLeasingSignatureData(startLeasing, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                recipient: startLeasing.recipient,
                amount: startLeasing.amount.toCoins(),
                timestamp: startLeasing.time,
                fee: startLeasing.fee.toCoins(),
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };

        function buildCancelLeasingSignatureData (cancelLeasing, senderPublicKey) {
            return [].concat(
                signService.getCancelLeasingTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getFeeBytes(cancelLeasing.fee.toCoins()),
                signService.getTimestampBytes(cancelLeasing.time),
                signService.getTransactionIdBytes(cancelLeasing.startLeasingTransactionId)
            );
        }

        this.buildCancelLeasingRequest = function (cancelLeasing, sender) {
            validateService.validateSender(sender);

            var currentTimeMillis = utilityService.getTime();
            cancelLeasing.time = cancelLeasing.time || currentTimeMillis;

            var signatureData = buildCancelLeasingSignatureData(cancelLeasing, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                txId: cancelLeasing.startLeasingTransactionId,
                timestamp: cancelLeasing.time,
                fee: cancelLeasing.fee.toCoins(),
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };
    }

    LeasingRequestService.$inject = ['signService', 'utilityService', 'validateService'];

    angular
        .module('waves.core.services')
        .service('leasingRequestService', LeasingRequestService);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('apiService', ['Restangular', 'cryptoService', function (rest, cryptoService) {
            var blocksApi = rest.all('blocks');

            this.blocks = {
                height: function() {
                    return blocksApi.get('height');
                },
                last: function() {
                    return blocksApi.get('last');
                },
                list: function (startHeight, endHeight) {
                    return blocksApi.one('seq', startHeight).all(endHeight).getList();
                }
            };

            var addressApi = rest.all('addresses');
            var consensusApi = rest.all('consensus');
            this.address = {
                balance: function (address) {
                    return addressApi.one('balance', address).get();
                },
                effectiveBalance: function (address) {
                    return addressApi.one('effectiveBalance', address).get();
                },
                generatingBalance: function (address) {
                    return consensusApi.one('generatingbalance', address).get();
                }
            };

            var transactionApi = rest.all('transactions');

            var request;
            var timer;
            this.transactions = {
                unconfirmed: function () {
                    if (!request) {
                        request = transactionApi.all('unconfirmed').getList();
                    } else {
                        if (!timer) {
                            timer = setTimeout(function () {
                                request = transactionApi.all('unconfirmed').getList();
                                request.finally(function () {
                                    timer = null;
                                });
                            }, 10000);
                        }
                    }
                    return request;
                },
                list: function (address, max) {
                    max = max || 50;
                    return transactionApi.one('address', address).one('limit', max).getList();
                },
                info: function (transactionId) {
                    return transactionApi.one('info', transactionId).get();
                }
            };

            var leasingApi = rest.all('leasing').all('broadcast');
            this.leasing = {
                lease: function (signedStartLeasingTransaction) {
                    return leasingApi.all('lease').post(signedStartLeasingTransaction);
                },
                cancel: function (signedCancelLeasingTransaction) {
                    return leasingApi.all('cancel').post(signedCancelLeasingTransaction);
                }
            };

            var aliasApi = rest.all('alias');
            this.alias = {
                create: function (signedCreateAliasTransaction) {
                    return aliasApi.all('broadcast').all('create').post(signedCreateAliasTransaction);
                },
                getByAddress: function (address) {
                    return aliasApi.all('by-address').get(address).then(function (response) {
                        return response.map(function (alias) {
                            return alias.slice(8);
                        });
                    });
                }
            };

            var assetApi = rest.all('assets');
            var assetBroadcastApi = assetApi.all('broadcast');
            this.assets = {
                balance: function (address, assetId) {
                    var rest = assetApi.all('balance');
                    if (assetId)
                        return rest.all(address).get(assetId);
                    else
                        return rest.get(address);
                },
                issue: function (signedAssetIssueTransaction) {
                    return assetBroadcastApi.all('issue').post(signedAssetIssueTransaction);
                },
                reissue: function (signedAssetReissueTransaction) {
                    return assetBroadcastApi.all('reissue').post(signedAssetReissueTransaction);
                },
                transfer: function (signedAssetTransferTransaction) {
                    return assetBroadcastApi.all('transfer').post(signedAssetTransferTransaction);
                },
                massPay: function (signedTransactions) {
                    return assetBroadcastApi.all('batch-transfer').post(signedTransactions);
                },
                makeAssetNameUnique: function (signedMakeAssetNameUniqueTransaction) {
                    return assetApi
                        .all('broadcast')
                        .all('make-asset-name-unique')
                        .post(signedMakeAssetNameUniqueTransaction);
                },
                isUniqueName: function (assetName) {
                    assetName = cryptoService.base58.encode(converters.stringToByteArray(assetName));
                    return assetApi
                        .all('asset-id-by-unique-name')
                        .get(assetName)
                        .then(function (response) {
                            // FIXME : temporary fix for the API format
                            if (typeof response !== 'object') {
                                response = {assetId: response};
                            }

                            return response.assetId;
                        });
                }
            };
        }]);
})();

(function () {
    'use strict';

    var BASE58_REGEX = new RegExp('^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{0,}$');

    angular
        .module('waves.core.services')
        .service('utilityService', ['constants.network', 'cryptoService', function (constants, cryptoService) {
            var self = this;

            self.getNetworkIdByte = function () {
                return constants.NETWORK_CODE.charCodeAt(0) & 0xFF;
            };

            // long to big-endian bytes
            self.longToByteArray = function (value) {
                var bytes = new Array(7);
                for (var k = 7; k >= 0; k--) {
                    bytes[k] = value & (255);
                    value = value / 256;
                }

                return bytes;
            };

            // short to big-endian bytes
            self.shortToByteArray = function (value) {
                return converters.int16ToBytes(value, true);
            };

            self.base58StringToByteArray = function (base58String) {
                var decoded = cryptoService.base58.decode(base58String);
                var result = [];
                for (var i = 0; i < decoded.length; ++i) {
                    result.push(decoded[i] & 0xff);
                }

                return result;
            };

            self.stringToByteArrayWithSize = function (string) {
                var bytes = converters.stringToByteArray(string);
                return self.byteArrayWithSize(bytes);
            };

            self.byteArrayWithSize = function (byteArray) {
                var result = self.shortToByteArray(byteArray.length);
                return result.concat(byteArray);
            };

            self.booleanToBytes = function (flag) {
                return flag ? [1] : [0];
            };

            self.endsWithWhitespace = function (value) {
                return /\s+$/g.test(value);
            };

            self.getTime = function() {
                return Date.now();
            };

            self.isValidBase58String = function (input) {
                return BASE58_REGEX.test(input);
            };

            // Add a prefix in case of alias
            self.resolveAddressOrAlias = function (string) {
                if (string.length <= 30) {
                    return 'alias:' + constants.NETWORK_CODE + ':' + string;
                } else {
                    return string;
                }
            };
        }]);
})();

(function() {
    'use strict';

    angular
        .module('waves.core.services')
        .service('chromeStorageService', ['$q', function ($q) {
            var $key = 'WavesAccounts';
            var self = this;

            self.saveState = function (state) {
                var deferred = $q.defer();
                var json = {};
                json[$key] = state;

                chrome.storage.local.set(json, function () {
                    deferred.resolve();
                });

                return deferred.promise;
            };

            self.loadState = function () {
                var deferred = $q.defer();

                self.loadSyncState().then(function (syncState) {
                    if (syncState) {
                        self.saveState(syncState)
                            .then(function () {
                                return self.clearSyncState();
                            })
                            .then(function () {
                                deferred.resolve(syncState);
                            });
                    } else {
                        chrome.storage.local.get($key, function (data) {
                            deferred.resolve(data[$key]);
                        });
                    }
                });

                return deferred.promise;
            };

            self.loadSyncState = function () {
                var deferred = $q.defer();

                chrome.storage.sync.get($key, function (data) {
                    deferred.resolve(data[$key]);
                });

                return deferred.promise;
            };

            self.clearSyncState = function () {
                var deferred = $q.defer();

                chrome.storage.sync.clear(function () {
                    deferred.resolve();
                });

                return deferred.promise;
            };
        }]);
})();

(function() {
    'use strict';

    angular
        .module('waves.core.services')
        .service('html5StorageService', ['constants.network', '$window', '$q', function(constants, window, $q) {
            if (angular.isUndefined(constants.NETWORK_NAME))
                throw new Error('Network name hasn\'t been configured');

            var $key = 'Waves' + constants.NETWORK_NAME;

            this.saveState = function(state) {
                var serialized = angular.toJson(state);

                window.localStorage.setItem($key, serialized);

                return $q.when();
            };

            this.loadState = function() {
                var data;
                var serialized = window.localStorage.getItem($key);

                if (serialized) {
                    data = angular.fromJson(serialized);
                }

                return $q.when(data);
            };

            this.clear = function() {
                window.localStorage.removeItem($key);

                return $q.when();
            };
        }]);
})();

(function() {
    'use strict';

    var STORAGE_STRUCTURE_VERSION = 1;

    angular
        .module('waves.core.services')
        .provider('storageService', [function () {
            function getStorageVersion () {
                return STORAGE_STRUCTURE_VERSION;
            }

            function isLocalStorageEnabled(window) {
                var storage, fail, uid;
                try {
                    uid = String(new Date());
                    (storage = window.localStorage).setItem(uid, uid);
                    fail = storage.getItem(uid) != uid;
                    if (!fail)
                        storage.removeItem(uid);
                    else
                        storage = false;
                }
                catch (exception) {
                }
                return storage;
            }

            this.$get = ['$window', 'chromeStorageService', 'html5StorageService',
                function($window, chromeStorageService, html5StorageService) {
                    var result = isLocalStorageEnabled($window) ? html5StorageService : chromeStorageService;
                    result.getStorageVersion = getStorageVersion;

                    return result;
                }];
        }]);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('formattingService', ['$window', '$filter', function (window, $filter) {

            var LOCALE_DATE_FORMATS = {
                'ar-SA': 'dd/MM/yy',
                'bg-BG': 'dd.M.yyyy',
                'ca-ES': 'dd/MM/yyyy',
                'zh-TW': 'yyyy/M/d',
                'cs-CZ': 'd.M.yyyy',
                'da-DK': 'dd-MM-yyyy',
                'de-DE': 'dd.MM.yyyy',
                'el-GR': 'd/M/yyyy',
                'en-US': 'M/d/yyyy',
                'fi-FI': 'd.M.yyyy',
                'fr-FR': 'dd/MM/yyyy',
                'he-IL': 'dd/MM/yyyy',
                'hu-HU': 'yyyy. MM. dd.',
                'is-IS': 'd.M.yyyy',
                'it-IT': 'dd/MM/yyyy',
                'ja-JP': 'yyyy/MM/dd',
                'ko-KR': 'yyyy-MM-dd',
                'nl-NL': 'd-M-yyyy',
                'nb-NO': 'dd.MM.yyyy',
                'pl-PL': 'yyyy-MM-dd',
                'pt-BR': 'd/M/yyyy',
                'ro-RO': 'dd.MM.yyyy',
                'ru-RU': 'dd.MM.yyyy',
                'hr-HR': 'd.M.yyyy',
                'sk-SK': 'd. M. yyyy',
                'sq-AL': 'yyyy-MM-dd',
                'sv-SE': 'yyyy-MM-dd',
                'th-TH': 'd/M/yyyy',
                'tr-TR': 'dd.MM.yyyy',
                'ur-PK': 'dd/MM/yyyy',
                'id-ID': 'dd/MM/yyyy',
                'uk-UA': 'dd.MM.yyyy',
                'be-BY': 'dd.MM.yyyy',
                'sl-SI': 'd.M.yyyy',
                'et-EE': 'd.MM.yyyy',
                'lv-LV': 'yyyy.MM.dd.',
                'lt-LT': 'yyyy.MM.dd',
                'fa-IR': 'MM/dd/yyyy',
                'vi-VN': 'dd/MM/yyyy',
                'hy-AM': 'dd.MM.yyyy',
                'az-Latn-AZ': 'dd.MM.yyyy',
                'eu-ES': 'yyyy/MM/dd',
                'mk-MK': 'dd.MM.yyyy',
                'af-ZA': 'yyyy/MM/dd',
                'ka-GE': 'dd.MM.yyyy',
                'fo-FO': 'dd-MM-yyyy',
                'hi-IN': 'dd-MM-yyyy',
                'ms-MY': 'dd/MM/yyyy',
                'kk-KZ': 'dd.MM.yyyy',
                'ky-KG': 'dd.MM.yy',
                'sw-KE': 'M/d/yyyy',
                'uz-Latn-UZ': 'dd/MM yyyy',
                'tt-RU': 'dd.MM.yyyy',
                'pa-IN': 'dd-MM-yy',
                'gu-IN': 'dd-MM-yy',
                'ta-IN': 'dd-MM-yyyy',
                'te-IN': 'dd-MM-yy',
                'kn-IN': 'dd-MM-yy',
                'mr-IN': 'dd-MM-yyyy',
                'sa-IN': 'dd-MM-yyyy',
                'mn-MN': 'yy.MM.dd',
                'gl-ES': 'dd/MM/yy',
                'kok-IN': 'dd-MM-yyyy',
                'syr-SY': 'dd/MM/yyyy',
                'dv-MV': 'dd/MM/yy',
                'ar-IQ': 'dd/MM/yyyy',
                'zh-CN': 'yyyy/M/d',
                'de-CH': 'dd.MM.yyyy',
                'en-GB': 'dd/MM/yyyy',
                'es-MX': 'dd/MM/yyyy',
                'fr-BE': 'd/MM/yyyy',
                'it-CH': 'dd.MM.yyyy',
                'nl-BE': 'd/MM/yyyy',
                'nn-NO': 'dd.MM.yyyy',
                'pt-PT': 'dd-MM-yyyy',
                'sr-Latn-CS': 'd.M.yyyy',
                'sv-FI': 'd.M.yyyy',
                'az-Cyrl-AZ': 'dd.MM.yyyy',
                'ms-BN': 'dd/MM/yyyy',
                'uz-Cyrl-UZ': 'dd.MM.yyyy',
                'ar-EG': 'dd/MM/yyyy',
                'zh-HK': 'd/M/yyyy',
                'de-AT': 'dd.MM.yyyy',
                'en-AU': 'd/MM/yyyy',
                'es-ES': 'dd/MM/yyyy',
                'fr-CA': 'yyyy-MM-dd',
                'sr-Cyrl-CS': 'd.M.yyyy',
                'ar-LY': 'dd/MM/yyyy',
                'zh-SG': 'd/M/yyyy',
                'de-LU': 'dd.MM.yyyy',
                'en-CA': 'dd/MM/yyyy',
                'es-GT': 'dd/MM/yyyy',
                'fr-CH': 'dd.MM.yyyy',
                'ar-DZ': 'dd-MM-yyyy',
                'zh-MO': 'd/M/yyyy',
                'de-LI': 'dd.MM.yyyy',
                'en-NZ': 'd/MM/yyyy',
                'es-CR': 'dd/MM/yyyy',
                'fr-LU': 'dd/MM/yyyy',
                'ar-MA': 'dd-MM-yyyy',
                'en-IE': 'dd/MM/yyyy',
                'es-PA': 'MM/dd/yyyy',
                'fr-MC': 'dd/MM/yyyy',
                'ar-TN': 'dd-MM-yyyy',
                'en-ZA': 'yyyy/MM/dd',
                'es-DO': 'dd/MM/yyyy',
                'ar-OM': 'dd/MM/yyyy',
                'en-JM': 'dd/MM/yyyy',
                'es-VE': 'dd/MM/yyyy',
                'ar-YE': 'dd/MM/yyyy',
                'en-029': 'MM/dd/yyyy',
                'es-CO': 'dd/MM/yyyy',
                'ar-SY': 'dd/MM/yyyy',
                'en-BZ': 'dd/MM/yyyy',
                'es-PE': 'dd/MM/yyyy',
                'ar-JO': 'dd/MM/yyyy',
                'en-TT': 'dd/MM/yyyy',
                'es-AR': 'dd/MM/yyyy',
                'ar-LB': 'dd/MM/yyyy',
                'en-ZW': 'M/d/yyyy',
                'es-EC': 'dd/MM/yyyy',
                'ar-KW': 'dd/MM/yyyy',
                'en-PH': 'M/d/yyyy',
                'es-CL': 'dd-MM-yyyy',
                'ar-AE': 'dd/MM/yyyy',
                'es-UY': 'dd/MM/yyyy',
                'ar-BH': 'dd/MM/yyyy',
                'es-PY': 'dd/MM/yyyy',
                'ar-QA': 'dd/MM/yyyy',
                'es-BO': 'dd/MM/yyyy',
                'es-SV': 'dd/MM/yyyy',
                'es-HN': 'dd/MM/yyyy',
                'es-NI': 'dd/MM/yyyy',
                'es-PR': 'dd/MM/yyyy',
                'am-ET': 'd/M/yyyy',
                'tzm-Latn-DZ': 'dd-MM-yyyy',
                'iu-Latn-CA': 'd/MM/yyyy',
                'sma-NO': 'dd.MM.yyyy',
                'mn-Mong-CN': 'yyyy/M/d',
                'gd-GB': 'dd/MM/yyyy',
                'en-MY': 'd/M/yyyy',
                'prs-AF': 'dd/MM/yy',
                'bn-BD': 'dd-MM-yy',
                'wo-SN': 'dd/MM/yyyy',
                'rw-RW': 'M/d/yyyy',
                'qut-GT': 'dd/MM/yyyy',
                'sah-RU': 'MM.dd.yyyy',
                'gsw-FR': 'dd/MM/yyyy',
                'co-FR': 'dd/MM/yyyy',
                'oc-FR': 'dd/MM/yyyy',
                'mi-NZ': 'dd/MM/yyyy',
                'ga-IE': 'dd/MM/yyyy',
                'se-SE': 'yyyy-MM-dd',
                'br-FR': 'dd/MM/yyyy',
                'smn-FI': 'd.M.yyyy',
                'moh-CA': 'M/d/yyyy',
                'arn-CL': 'dd-MM-yyyy',
                'ii-CN': 'yyyy/M/d',
                'dsb-DE': 'd. M. yyyy',
                'ig-NG': 'd/M/yyyy',
                'kl-GL': 'dd-MM-yyyy',
                'lb-LU': 'dd/MM/yyyy',
                'ba-RU': 'dd.MM.yy',
                'nso-ZA': 'yyyy/MM/dd',
                'quz-BO': 'dd/MM/yyyy',
                'yo-NG': 'd/M/yyyy',
                'ha-Latn-NG': 'd/M/yyyy',
                'fil-PH': 'M/d/yyyy',
                'ps-AF': 'dd/MM/yy',
                'fy-NL': 'd-M-yyyy',
                'ne-NP': 'M/d/yyyy',
                'se-NO': 'dd.MM.yyyy',
                'iu-Cans-CA': 'd/M/yyyy',
                'sr-Latn-RS': 'd.M.yyyy',
                'si-LK': 'yyyy-MM-dd',
                'sr-Cyrl-RS': 'd.M.yyyy',
                'lo-LA': 'dd/MM/yyyy',
                'km-KH': 'yyyy-MM-dd',
                'cy-GB': 'dd/MM/yyyy',
                'bo-CN': 'yyyy/M/d',
                'sms-FI': 'd.M.yyyy',
                'as-IN': 'dd-MM-yyyy',
                'ml-IN': 'dd-MM-yy',
                'en-IN': 'dd-MM-yyyy',
                'or-IN': 'dd-MM-yy',
                'bn-IN': 'dd-MM-yy',
                'tk-TM': 'dd.MM.yy',
                'bs-Latn-BA': 'd.M.yyyy',
                'mt-MT': 'dd/MM/yyyy',
                'sr-Cyrl-ME': 'd.M.yyyy',
                'se-FI': 'd.M.yyyy',
                'zu-ZA': 'yyyy/MM/dd',
                'xh-ZA': 'yyyy/MM/dd',
                'tn-ZA': 'yyyy/MM/dd',
                'hsb-DE': 'd. M. yyyy',
                'bs-Cyrl-BA': 'd.M.yyyy',
                'tg-Cyrl-TJ': 'dd.MM.yy',
                'sr-Latn-BA': 'd.M.yyyy',
                'smj-NO': 'dd.MM.yyyy',
                'rm-CH': 'dd/MM/yyyy',
                'smj-SE': 'yyyy-MM-dd',
                'quz-EC': 'dd/MM/yyyy',
                'quz-PE': 'dd/MM/yyyy',
                'hr-BA': 'd.M.yyyy.',
                'sr-Latn-ME': 'd.M.yyyy',
                'sma-SE': 'yyyy-MM-dd',
                'en-SG': 'd/M/yyyy',
                'ug-CN': 'yyyy-M-d',
                'sr-Cyrl-BA': 'd.M.yyyy',
                'es-US': 'M/d/yyyy'
            };

            var LANG = window.navigator.userLanguage || window.navigator.language;
            var LOCALE_DATE_FORMAT = LOCALE_DATE_FORMATS[LANG] || 'dd/MM/yyyy';
            var settings = {
                '24_hour_format': '1'
            };

            this.formatTimestamp = function (timestamp, dateOnly, isAbsoluteTime) {
                var date;
                if (typeof timestamp == 'object') {
                    date = timestamp;
                } else if (isAbsoluteTime) {
                    date = new Date(timestamp);
                } else {
                    date = new Date(timestamp);
                }

                var format = LOCALE_DATE_FORMAT;
                if (!dateOnly) {
                    var timeFormat = 'H:mm:ss';

                    if (settings['24_hour_format'] === '0')
                        timeFormat = 'h:mm:ss a';

                    format += ' ' + timeFormat;
                }

                return $filter('date')(date, format);
            };
        }]);
})();


// <-- The module was here: waves.core.filter.formatting


(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('coinomatCurrencyMappingService', [function () {
            function unsupportedCurrency(currency) {
                throw new Error('Unsupported currency: ' + currency.displayName);
            }

            /**
             * Currency codes for Waves Platform
             * @param {Currency} currency
             * @returns {string} currency code
             */
            this.platformCurrencyCode = function (currency) {
                switch (currency.id) {
                    case Currency.BTC.id:
                        return 'WBTC';

                    case Currency.WAVES.id:
                        return 'WAVES';
                }

                unsupportedCurrency(currency);
            };

            /**
             * Currency codes for Coinomat gateway
             * @param {Currency} currency
             * @returns {string} currency code
             */
            this.gatewayCurrencyCode = function (currency) {
                switch (currency.id) {
                    case Currency.BTC.id:
                        return 'BTC';

                    case Currency.WAVES.id:
                        return 'WAVES';
                }

                unsupportedCurrency(currency);
            };
        }]);
})();

(function () {
    'use strict';

    var LANGUAGE = 'ru_RU';

    function ensureTunnelCreated(response) {
        if (!response.ok) {
            console.log(response);
            throw new Error('Failed to create tunnel: ' + response.error);
        }
    }

    function ensureTunnelObtained(response) {
        if (!response.tunnel) {
            console.log(response);
            throw new Error('Failed to get tunnel: ' + response.error);
        }
    }

    function CoinomatService(rest, mappingService) {
        var apiRoot = rest.all('api').all('v1');

        /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        function loadPaymentDetails(currencyCodeFrom, currencyCodeTo, recipientAddress) {
            return apiRoot.get('create_tunnel.php', {
                currency_from: currencyCodeFrom,
                currency_to: currencyCodeTo,
                wallet_to: recipientAddress
            }).then(function (response) {
                ensureTunnelCreated(response);

                return {
                    id: response.tunnel_id,
                    k1: response.k1,
                    k2: response.k2
                };
            }).then(function (tunnel) {
                return apiRoot.get('get_tunnel.php', {
                    xt_id: tunnel.id,
                    k1: tunnel.k1,
                    k2: tunnel.k2,
                    history: 0,
                    lang: LANGUAGE
                });
            }).then(function (response) {
                ensureTunnelObtained(response);

                // here only BTC wallet is returned
                // probably for other currencies more requisites are required
                return {
                    address: response.tunnel.wallet_from,
                    attachment: response.tunnel.attachment
                };
            });
        }
        /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */

        this.getDepositDetails = function (sourceCurrency, targetCurrency, wavesRecipientAddress) {
            var gatewayCurrencyCode = mappingService.gatewayCurrencyCode(sourceCurrency);
            var platformCurrencyCode = mappingService.platformCurrencyCode(targetCurrency);

            return loadPaymentDetails(gatewayCurrencyCode, platformCurrencyCode, wavesRecipientAddress);
        };

        this.getWithdrawDetails = function (currency, recipientAddress) {
            var gatewayCurrencyCode = mappingService.gatewayCurrencyCode(currency);
            var platformCurrencyCode = mappingService.platformCurrencyCode(currency);

            return loadPaymentDetails(platformCurrencyCode, gatewayCurrencyCode, recipientAddress);
        };

        this.getWithdrawRate = function (currency) {
            var gatewayCurrencyCode = mappingService.gatewayCurrencyCode(currency);
            var platformCurrencyCode = mappingService.platformCurrencyCode(currency);

            return apiRoot.get('get_xrate.php', {
                f: platformCurrencyCode,
                t: gatewayCurrencyCode,
                lang: LANGUAGE
            });
        };
    }

    CoinomatService.$inject = ['CoinomatRestangular', 'coinomatCurrencyMappingService'];

    angular
        .module('waves.core.services')
        .service('coinomatService', CoinomatService);
})();

(function () {
    'use strict';

    function CoinomatFiatService(rest, currencyMappingService) {
        var apiRoot = rest.all('api').all('v2').all('indacoin');

        this.getLimits = function (address, fiatCurrency, cryptoCurrency) {
            return apiRoot.get('limits.php', {
                address: address,
                fiat: fiatCurrency,
                crypto: currencyMappingService.gatewayCurrencyCode(cryptoCurrency)
            });
        };

        this.getRate = function (address, fiatAmount, fiatCurrency, cryptoCurrency) {
            return apiRoot.get('rate.php', {
                address: address,
                fiat: fiatCurrency,
                amount: fiatAmount,
                crypto: currencyMappingService.gatewayCurrencyCode(cryptoCurrency)
            });
        };

        this.getMerchantUrl = function (address, fiatAmount, fiatCurrency, cryptoCurrency) {
            return apiRoot.all('buy.php').getRequestedUrl() +
                '?address=' + address +
                '&fiat=' + fiatCurrency +
                '&amount=' + fiatAmount +
                '&crypto=' + currencyMappingService.gatewayCurrencyCode(cryptoCurrency);
        };
    }

    CoinomatFiatService.$inject = ['CoinomatRestangular', 'coinomatCurrencyMappingService'];

    angular
        .module('waves.core.services')
        .service('coinomatFiatService', CoinomatFiatService);
})();

(function () {
    'use strict';

    var WAVES_ASSET_ID = 'WAVES',
        WAVES_PRECISION = 8;

    function denormalizeId(id) {
        return id === WAVES_ASSET_ID ? '' : id;
    }

    function normalizeId(id) {
        return id ? id : WAVES_ASSET_ID;
    }

    function MatcherApiService(rest, utilityService, cryptoService, validateService) {
        var apiRoot = rest.all('matcher');
        var orderbookRoot = apiRoot.all('orderbook');

        this.createOrder = function (signedOrderRequest) {
            return orderbookRoot.post(signedOrderRequest);
        };

        this.cancelOrder = function (firstAssetId, secondAssetId, signedCancelRequest) {
            return orderbookRoot
                .all(normalizeId(firstAssetId))
                .all(normalizeId(secondAssetId))
                .all('cancel')
                .post(signedCancelRequest);
        };

        this.deleteOrder = function (firstAssetId, secondAssetId, signedCancelRequest) {
            return orderbookRoot
                .all(normalizeId(firstAssetId))
                .all(normalizeId(secondAssetId))
                .all('delete')
                .post(signedCancelRequest);
        };

        this.orderStatus = function (firstAssetId, secondAssetId, orderId) {
            return orderbookRoot
                .all(normalizeId(firstAssetId))
                .all(normalizeId(secondAssetId))
                .get(orderId);
        };

        this.loadMatcherKey = function () {
            return apiRoot.get('');
        };

        this.loadOrderbook = function (firstAssetId, secondAssetId) {
            return orderbookRoot.all(normalizeId(firstAssetId)).get(normalizeId(secondAssetId))
                .then(function (response) {
                    response.pair.amountAsset = denormalizeId(response.pair.amountAsset);
                    response.pair.priceAsset = denormalizeId(response.pair.priceAsset);

                    return response;
                });
        };

        function buildLoadUserOrdersSignature(timestamp, sender) {
            validateService.validateSender(sender);

            var publicKeyBytes = utilityService.base58StringToByteArray(sender.publicKey),
                timestampBytes = utilityService.longToByteArray(timestamp),
                signatureData = [].concat(publicKeyBytes, timestampBytes),

                privateKeyBytes = cryptoService.base58.decode(sender.privateKey);

            return cryptoService.nonDeterministicSign(privateKeyBytes, signatureData);
        }

        this.loadUserOrders = function (amountAsset, priceAsset, sender) {
            var timestamp = Date.now(),
                signature = buildLoadUserOrdersSignature(timestamp, sender);

            return orderbookRoot
                .all(normalizeId(amountAsset))
                .all(normalizeId(priceAsset))
                .all('publicKey')
                .get(sender.publicKey, {}, {
                    Timestamp: timestamp,
                    Signature: signature
                });
        };

        this.loadAllMarkets = function () {
            return orderbookRoot.get('').then(function (response) {
                var pairs = [];
                _.forEach(response.markets, function (market) {
                    var id = normalizeId(market.amountAsset) + '/' + normalizeId(market.priceAsset);
                    var pair = {
                        id: id,
                        amountAssetInfo: market.amountAssetInfo,
                        amountAsset: Currency.create({
                            id: denormalizeId(market.amountAsset),
                            displayName: market.amountAssetName,
                            precision: market.amountAssetInfo ? market.amountAssetInfo.decimals : WAVES_PRECISION
                        }),
                        priceAssetInfo: market.priceAssetInfo,
                        priceAsset: Currency.create({
                            id: denormalizeId(market.priceAsset),
                            displayName: market.priceAssetName,
                            precision: market.priceAssetInfo ? market.priceAssetInfo.decimals : WAVES_PRECISION
                        }),
                        created: market.created
                    };
                    pairs.push(pair);
                });

                return pairs;
            });
        };

        this.getTradableBalance = function (amountAsset, priceAsset, address) {
            var normAmountAsset = normalizeId(amountAsset),
                normPriceAsset = normalizeId(priceAsset);

            return orderbookRoot
                .all(normAmountAsset)
                .all(normPriceAsset)
                .all('tradableBalance')
                .get(address)
                .then(function (response) {
                    var result = {};
                    result[denormalizeId(normAmountAsset)] = response[normAmountAsset];
                    result[denormalizeId(normPriceAsset)] = response[normPriceAsset];
                    return result;
                });
        };
    }

    MatcherApiService.$inject = ['MatcherRestangular', 'utilityService', 'cryptoService', 'validateService'];

    angular
        .module('waves.core.services')
        .service('matcherApiService', MatcherApiService);
})();

(function () {
    'use strict';

    var MINUTE = 60 * 1000,
        DEFAULT_FRAME = 30,
        DEFAULT_LIMIT = 50;

    function serializeId(id) {
        return id === '' ? 'WAVES' : id;
    }

    function DatafeedApiService(rest) {
        var self = this,
            apiRoot = rest.all('api');

        self.getSymbols = function () {
            return apiRoot.get('symbols');
        };

        self.getCandles = function (pair, from, to, frame) {
            frame = frame || DEFAULT_FRAME;
            to = to || Date.now();
            from = from || to - 50 * frame * MINUTE;

            return apiRoot
                .all('candles')
                .all(serializeId(pair.amountAsset.id))
                .all(serializeId(pair.priceAsset.id))
                .all(frame)
                .all(from)
                .get(to);
        };

        self.getLastCandles = function (pair, limit, frame) {
            frame = frame || DEFAULT_FRAME;
            limit = limit || DEFAULT_LIMIT;

            return apiRoot
                .all('candles')
                .all(serializeId(pair.amountAsset.id))
                .all(serializeId(pair.priceAsset.id))
                .all(frame)
                .get(limit);
        };

        self.getTrades = function (pair, limit) {
            limit = limit || DEFAULT_LIMIT;

            return apiRoot
                .all('trades')
                .all(serializeId(pair.amountAsset.id))
                .all(serializeId(pair.priceAsset.id))
                .get(limit);
        };

        self.getTradesByAddress = function (pair, address, limit) {
            limit = limit || DEFAULT_LIMIT;

            return apiRoot
                .all('trades')
                .all(serializeId(pair.amountAsset.id))
                .all(serializeId(pair.priceAsset.id))
                .all(address)
                .get(limit);
        };
    }

    DatafeedApiService.$inject = ['DatafeedRestangular'];

    angular
        .module('waves.core.services')
        .service('datafeedApiService', DatafeedApiService);
})();

(function () {
    'use strict';

    var SELL_ORDER_TYPE = 'sell';

    function MatcherRequestService(signService, utilityService, validateService) {
        function buildCreateOrderSignatureData(order, senderPublicKey) {
            return [].concat(
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getPublicKeyBytes(order.matcherKey),
                signService.getAssetIdBytes(order.price.amountAsset.id),
                signService.getAssetIdBytes(order.price.priceAsset.id),
                signService.getOrderTypeBytes(order.orderType === SELL_ORDER_TYPE),
                signService.getAmountBytes(order.price.toBackendPrice()),
                signService.getAmountBytes(order.amount.toCoins()),
                signService.getTimestampBytes(order.time),
                signService.getTimestampBytes(order.expiration),
                signService.getFeeBytes(order.fee.toCoins())
            );
        }

        this.buildCreateOrderRequest = function (order, sender) {
            validateService.validateSender(sender);

            var currentTimeMillis = utilityService.getTime();
            order.time = order.time || currentTimeMillis;

            var date = new Date(currentTimeMillis);
            order.expiration = order.expiration || date.setDate(date.getDate() + 20);

            var signatureData = buildCreateOrderSignatureData(order, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                orderType: order.orderType,
                assetPair: {
                    amountAsset: order.price.amountAsset.id,
                    priceAsset: order.price.priceAsset.id
                },
                price: order.price.toBackendPrice(),
                amount: order.amount.toCoins(),
                timestamp: order.time,
                expiration: order.expiration,
                matcherFee: order.fee.toCoins(),
                matcherPublicKey: order.matcherKey,
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };

        function buildCancelOrderSignatureData(orderId, senderPublicKey) {
            return [].concat(
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getOrderIdBytes(orderId)
            );
        }

        this.buildCancelOrderRequest = function (orderId, sender) {
            validateService.validateSender(sender);

            if (!orderId) {
                throw new Error('orderId hasn\'t been set');
            }

            var signatureData = buildCancelOrderSignatureData(orderId, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                sender: sender.publicKey,
                orderId: orderId,
                signature: signature
            };
        };
    }

    MatcherRequestService.$inject = ['signService', 'utilityService', 'validateService'];

    angular
        .module('waves.core.services')
        .service('matcherRequestService', MatcherRequestService);
})();

var OrderPrice = (function () {

    var MATCHER_SCALE = 1e8;

    function OrderPrice(price, pair) {
        this.amountAsset = pair.amountAsset;
        this.priceAsset = pair.priceAsset;
        this.price = roundToPriceAsset(price, pair);
    }

    OrderPrice.prototype.toTokens = function () {
        return this.price.toNumber();
    };

    OrderPrice.prototype.toCoins = function () {
        return this.toTokens() * Math.pow(10, this.priceAsset.precision - this.amountAsset.precision);
    };

    OrderPrice.prototype.toBackendPrice = function () {
        return Math.round(this.toCoins() * MATCHER_SCALE);
    };

    function roundToPriceAsset(price, pair) {
        return new Decimal(new Decimal(price).toFixed(pair.priceAsset.precision, Decimal.ROUND_FLOOR));
    }

    function normalizePrice(price, pair) {
        return new Decimal(price)
            .div(MATCHER_SCALE)
            .div(Math.pow(10, pair.priceAsset.precision - pair.amountAsset.precision));
    }

    return {
        fromTokens: function (price, pair) {
            return new OrderPrice(price, pair);
        },

        fromBackendPrice: function (price, pair) {
            var normalizedPrice = normalizePrice(price, pair);

            return new OrderPrice(normalizedPrice, pair);
        }
    };
})();

(function () {
    'use strict';

    function SignService(txConstants, featureConstants, cryptoService, utilityService) {
        var self = this;

        // Transaction types

        self.getAssetIssueTxTypeBytes = function () {
            return [txConstants.ASSET_ISSUE_TRANSACTION_TYPE];
        };

        self.getAssetReissueTxTypeBytes = function () {
            return [txConstants.ASSET_REISSUE_TRANSACTION_TYPE];
        };

        self.getAssetTransferTxTypeBytes = function () {
            return [txConstants.ASSET_TRANSFER_TRANSACTION_TYPE];
        };

        self.getStartLeasingTxTypeBytes = function () {
            return [txConstants.START_LEASING_TRANSACTION_TYPE];
        };

        self.getCancelLeasingTxTypeBytes = function () {
            return [txConstants.CANCEL_LEASING_TRANSACTION_TYPE];
        };

        self.getCreateAliasTxTypeBytes = function () {
            return [txConstants.CREATE_ALIAS_TRANSACTION_TYPE];
        };

        // Keys

        self.getPublicKeyBytes = function (publicKey) {
            return utilityService.base58StringToByteArray(publicKey);
        };

        self.getPrivateKeyBytes = function (privateKey) {
            return cryptoService.base58.decode(privateKey);
        };

        // Data fields

        self.getNetworkBytes = function () {
            return [utilityService.getNetworkIdByte()];
        };

        self.getTransactionIdBytes = function (tx) {
            return utilityService.base58StringToByteArray(tx);
        };

        self.getRecipientBytes = function (recipient) {
            if (recipient.slice(0, 6) === 'alias:') {
                return [].concat(
                    [featureConstants.ALIAS_VERSION],
                    [utilityService.getNetworkIdByte()],
                    utilityService.stringToByteArrayWithSize(recipient.slice(8)) // Remove leading 'asset:W:'
                );
            } else {
                return utilityService.base58StringToByteArray(recipient);
            }
        };

        self.getAssetIdBytes = function (assetId, mandatory) {
            if (mandatory) {
                return utilityService.base58StringToByteArray(assetId);
            } else {
                return assetId ? [1].concat(utilityService.base58StringToByteArray(assetId)) : [0];
            }
        };

        self.getAssetNameBytes = function (assetName) {
            return utilityService.stringToByteArrayWithSize(assetName);
        };

        self.getAssetDescriptionBytes = function (assetDescription) {
            return utilityService.stringToByteArrayWithSize(assetDescription);
        };

        self.getAssetQuantityBytes = function (assetQuantity) {
            return utilityService.longToByteArray(assetQuantity);
        };

        self.getAssetDecimalPlacesBytes = function (assetDecimalPlaces) {
            return [assetDecimalPlaces];
        };

        self.getAssetIsReissuableBytes = function (assetIsReissuable) {
            return utilityService.booleanToBytes(assetIsReissuable);
        };

        self.getAmountBytes = function (amount) {
            return utilityService.longToByteArray(amount);
        };

        self.getFeeAssetIdBytes = function (feeAssetId) {
            return self.getAssetIdBytes(feeAssetId);
        };

        self.getFeeBytes = function (fee) {
            return utilityService.longToByteArray(fee);
        };

        self.getTimestampBytes = function (timestamp) {
            return utilityService.longToByteArray(timestamp);
        };

        self.getAttachmentBytes = function (attachment) {
            return utilityService.byteArrayWithSize(attachment);
        };

        self.getAliasBytes = function (alias) {
            return utilityService.byteArrayWithSize([].concat(
                [featureConstants.ALIAS_VERSION],
                [utilityService.getNetworkIdByte()],
                utilityService.stringToByteArrayWithSize(alias)
            ));
        };

        self.getOrderTypeBytes = function (orderType) {
            return utilityService.booleanToBytes(orderType);
        };

        self.getOrderIdBytes = function (orderId) {
            return utilityService.base58StringToByteArray(orderId);
        };

        // Signatures

        self.buildSignature = function (bytes, privateKey) {
            var privateKeyBytes = self.getPrivateKeyBytes(privateKey);
            return cryptoService.nonDeterministicSign(privateKeyBytes, bytes);
        };
    }

    SignService.$inject = ['constants.transactions', 'constants.features', 'cryptoService', 'utilityService'];

    angular
        .module('waves.core.services')
        .service('signService', SignService);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('validateService', function () {
            var self = this;

            self.validateSender = function (sender) {
                if (!sender) {
                    throw new Error('Sender hasn\'t been set');
                }

                if (!sender.publicKey) {
                    throw new Error('Sender account public key hasn\'t been set');
                }

                if (!sender.privateKey) {
                    throw new Error('Sender account private key hasn\'t been set');
                }
            };

            self.validateAssetIssue = function (issue) {
                if (angular.isUndefined(issue.name)) {
                    throw new Error('Asset name hasn\'t been set');
                }

                if (angular.isUndefined(issue.totalTokens)) {
                    throw new Error('Total tokens amount hasn\'t been set');
                }

                if (angular.isUndefined(issue.decimalPlaces)) {
                    throw new Error('Token decimal places amount hasn\'t been set');
                }

                if (issue.fee.currency !== Currency.WAVES) {
                    throw new Error('Transaction fee must be nominated in Waves');
                }
            };

            self.validateAssetTransfer = function (transfer) {
                if (angular.isUndefined(transfer.recipient)) {
                    throw new Error('Recipient account hasn\'t been set');
                }

                if (angular.isUndefined(transfer.fee)) {
                    throw new Error('Transaction fee hasn\'t been set');
                }

                if (angular.isUndefined(transfer.amount)) {
                    throw new Error('Transaction amount hasn\'t been set');
                }
            };

            self.validateAssetReissue = function (reissue) {
                if (reissue.totalTokens.currency === Currency.WAVES) {
                    throw new Error('Reissuing Waves is not allowed.');
                }

                if (angular.isUndefined(reissue.totalTokens)) {
                    throw new Error('Total tokens amount hasn\'t been set');
                }

                if (angular.isUndefined(reissue.fee)) {
                    throw new Error('Transaction fee hasn\'t been set');
                }

                if (reissue.fee.currency !== Currency.WAVES) {
                    throw new Error('Transaction fee must be nominated in Waves');
                }
            };
        });
})();
