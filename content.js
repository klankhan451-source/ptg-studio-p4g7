/*
 * ============================================================
 *  Party Games Studio Pro — occasions, games & content libraries
 * ============================================================
 *  The content moat: every occasion ships with built-in,
 *  buyer-editable libraries for every game that needs them.
 *  Formats (kept terse; the engine normalises them):
 *    trivia / overunder / priceright : [question, answer]
 *    truefalse                       : [statement, "True"/"False …"]
 *    finishphrase                    : [prompt with _____, answer]
 *    scramble                        : [word, …]
 *    pictionary                      : [emoji clue, answer]
 *    rather / thisorthat             : [option A, option B]
 *    whosaid                         : [statement, who]
 *    know / predictions / advice / memorylane / scavenger /
 *    photochallenge / icebreaker     : [text, …]
 *    phone / purse                   : [item, points]
 *    awards                          : [title, reason]
 *    madlibs                         : { title, story } — story
 *      uses [label] blanks and may use the tokens below.
 *    guess                           : { title, unit, note }
 *  Personalization tokens {honoree} {honoree2} {date} {host}
 *  may appear in ANY string; the engine substitutes them at
 *  build time (occasion defaults fill blanks, so no token ever
 *  reaches a printed page).
 * ============================================================
 */
'use strict';

/* ---------------- game template definitions ---------------- */

var PTG_GAMES = [
  { id: 'know', name: 'How Well Do You Know the Guest of Honor?', type: 'questions', answers: false, scored: true,
    blurb: 'Questions about the guest of honor — guests guess, the honoree reveals.',
    how: 'Read each question aloud. Guests write their guesses; the guest of honor gives the real answers. One point per match.' },
  { id: 'whosaid', name: 'Who Said It?', type: 'whosaid', answers: true, scored: true,
    blurb: 'Famous quotes from the two stars of the day — who said which?',
    how: 'Before the party, check each statement with the guests of honor and replace any that don’t fit. Then read each statement aloud; guests tick who they think said it, and the pair reveals the truth — one point per correct guess.' },
  { id: 'predictions', name: 'Predictions & Wishes', type: 'prompts', answers: false,
    blurb: 'Guests write their predictions and wishes for the future.',
    how: 'Hand one card to each guest. Collect the finished cards into a keepsake envelope for the guest of honor.' },
  { id: 'advice', name: 'Advice Cards', type: 'prompts', answers: false,
    blurb: 'The best advice your guests have — written down to keep.',
    how: 'Guests fill in one prompt each (or all). Read the funniest aloud, then gift the bundle to the guest of honor.' },
  { id: 'scramble', name: 'Word Scramble', type: 'scramble', answers: true, scored: true,
    blurb: 'Unscramble the themed words — fastest finisher wins.',
    how: 'Set a timer for 3 minutes. Guests unscramble as many words as they can. Most correct answers wins.' },
  { id: 'pictionary', name: 'Emoji Pictionary', type: 'pictionary', answers: true, scored: true,
    blurb: 'Guess the phrase from the emoji clues.',
    how: 'Guests decode each emoji clue and write the phrase. One point per correct phrase; set a timer to raise the stakes.' },
  { id: 'rather', name: 'Would You Rather', type: 'pairs', answers: false, scored: true,
    blurb: 'Two choices, no wrong answers — guess what the honoree would pick.',
    how: 'Guests pick a side for each pair — score one point whenever their pick matches the guest of honor’s choice.' },
  { id: 'thisorthat', name: 'This or That', type: 'pairs', answers: false,
    blurb: 'Quick-fire either/or picks, themed for the day.',
    how: 'Fast round: call each pair out loud, guests circle their pick and shout it on three. Pure energy, no scoring needed.' },
  { id: 'overunder', name: 'Over or Under', type: 'qa', answers: true, scored: true,
    blurb: 'Numbers game — is the real figure over or under the line?',
    how: 'Read the statement; guests write Over or Under. Reveal the real number — one point per correct call.' },
  { id: 'priceright', name: 'The Price Is Right', type: 'qa', answers: true, scored: true,
    blurb: 'Guess the price of themed items — closest without going over wins.',
    how: 'Guests write a price guess for every item. Closest guess without going over earns the point for each item.' },
  { id: 'phone', name: 'What’s On Your Phone?', type: 'points', answers: false, scored: true,
    blurb: 'Points for the treasures hiding in your phone.',
    how: 'Guests check their phones and tick everything they have. Highest point total wins — honor system… mostly.' },
  { id: 'purse', name: 'What’s In Your Purse?', type: 'points', answers: false, scored: true,
    blurb: 'Points for purse contents, from the everyday to the legendary.',
    how: 'Guests dig through their purses and tick what they find. Highest total wins. No purse? A bag, pockets or car console counts.' },
  { id: 'trivia', name: 'Occasion Trivia', type: 'qa', answers: true, scored: true,
    blurb: 'Real trivia questions on the theme of the day, with an answer key.',
    how: 'Read questions aloud or let guests work the card solo. One point per correct answer; the host guide holds the key.' },
  { id: 'truefalse', name: 'True or False', type: 'tf', answers: true, scored: true,
    blurb: 'Surprising statements — sort the facts from the fibs.',
    how: 'Guests circle True or False for each statement. One point each; read the fun facts aloud as you reveal answers.' },
  { id: 'finishphrase', name: 'Finish the Phrase', type: 'finish', answers: true, scored: true,
    blurb: 'Complete the famous phrases and sayings.',
    how: 'Guests fill in the blanks. Award the point for the classic answer (host guide) — or for the funniest, by applause.' },
  { id: 'madlibs', name: 'Mad-Libs Story', type: 'story', answers: false,
    blurb: 'A fill-in-the-blanks story starring the guest of honor.',
    how: 'One person collects a word for each blank (without showing the story!), fills them in, then reads the story aloud.' },
  { id: 'scavenger', name: 'Scavenger Hunt', type: 'checklist', answers: false, scored: true,
    blurb: 'Find, spot or snap everything on the list.',
    how: 'Guests hunt solo or in teams — first to complete the list (with photo proof!) wins. Set a time limit that suits the party.' },
  { id: 'photochallenge', name: 'Photo Challenge', type: 'checklist', answers: false, scored: true,
    blurb: 'A shot list for the best party photos.',
    how: 'Guests complete as many photo prompts as they can during the party. Share the album afterwards — best photo wins a prize.' },
  { id: 'memorylane', name: 'Memory Lane', type: 'prompts', answers: false, scored: true,
    blurb: 'Guests share their favorite memories of the guest of honor.',
    how: 'Guests complete the memory prompts. Read favorites aloud — the honoree picks the winner. A keepsake to treasure.' },
  { id: 'certificates', name: 'Award Certificates', type: 'certificates', answers: false, station: true, extra: true,
    blurb: 'Fun superlative awards to present during the party.',
    how: 'Fill in a winner’s name on each certificate and present them in a mini awards ceremony near the end of the party.' },
  { id: 'tags', name: 'Favor / Thank-You Tags', type: 'tags', answers: false, station: true, extra: true,
    blurb: 'Matching thank-you tags for favors, gifts and prizes.',
    how: 'Print, cut along the marks, punch a hole in the corner and tie to favors or prize bags with ribbon or twine.' },
  { id: 'scorecard', name: 'Scorecard', type: 'scorecard', answers: false, station: true, extra: true,
    blurb: 'One scorecard tracks every game in the pack.',
    how: 'Give one scorecard to each guest (or team) and total points after every game. Highest total at the end takes the grand prize.' },
  { id: 'icebreaker', name: 'Icebreaker Questions', type: 'questions', answers: false,
    blurb: 'Conversation starters that get everyone talking.',
    how: 'Read a question aloud and go around the circle, or place cards on tables and let guests mingle through them.' },
  { id: 'guess', name: 'Guess the Number', type: 'guess', answers: false, station: true, scored: true,
    blurb: 'A guessing-jar sign with entry slips — closest guess wins the jar.',
    how: 'Fill a clear jar, set out the sign and slips. Guests write their name and guess; closest guess without going over wins the jar.' }
];

function ptgGameById(id) {
  for (var i = 0; i < PTG_GAMES.length; i++) if (PTG_GAMES[i].id === id) return PTG_GAMES[i];
  return null;
}

/* ---------------- shared base lists ----------------
   Phone / purse / icebreaker lists are near-universal; each
   occasion adds its own extras on top (see ptgLibrary). */

var PTG_BASE_PHONE = [
  ['A photo of the guest of honor', 15],
  ['A selfie taken today', 10],
  ['Battery above 80%', 5],
  ['A cracked screen (past or present)', 10],
  ['More than 1,000 photos saved', 10],
  ['A food photo in your camera roll', 5],
  ['An alarm set for before 7 a.m.', 5],
  ['A weather app on your home screen', 5],
  ['A text from the host', 10],
  ['A song you would dance to right now', 10],
  ['Your screen time report turned ON', 5],
  ['A meme saved in the last week', 10]
];

var PTG_BASE_PURSE = [
  ['Lipstick or lip gloss', 10],
  ['A receipt more than a month old', 15],
  ['Hand sanitizer', 5],
  ['A hair tie', 5],
  ['Sunglasses', 10],
  ['A gift card', 10],
  ['Tissues', 5],
  ['A pen that actually works', 10],
  ['Loose change — coins only', 5],
  ['A loyalty card for a coffee shop', 10],
  ['Breath mints or gum', 5],
  ['Something you borrowed and never returned', 20]
];

var PTG_BASE_ICEBREAKER = [
  'What is your all-time favorite party food?',
  'What song gets you on the dance floor every time?',
  'What is the best gift you have ever received?',
  'If you could travel anywhere tomorrow, where would you go?',
  'What is a small thing that always makes your day?',
  'What was your very first job?',
  'What is the funniest thing that ever happened to you at a party?',
  'Which celebrity would play you in a movie of your life?'
];

/* ---------------- occasions ---------------- */

var PTG_OCCASIONS = [
{
  id: 'baby', name: 'Baby Shower', emoji: '🍼',
  tagline: 'Games for celebrating the mom-to-be',
  honoreeLabel: 'Mom-to-Be', defaultHonoree: 'the Mom-to-Be', defaultHonoree2: 'the Dad-to-Be',
  saidBy: ['Mom', 'Dad'],
  games: ['know', 'whosaid', 'predictions', 'advice', 'scramble', 'pictionary', 'rather', 'thisorthat', 'overunder', 'priceright', 'trivia', 'truefalse', 'finishphrase', 'madlibs', 'scavenger', 'photochallenge', 'certificates', 'tags', 'scorecard', 'icebreaker', 'guess', 'phone', 'purse'],
  defaults: ['know', 'whosaid', 'predictions', 'advice', 'scramble', 'pictionary', 'priceright', 'trivia', 'certificates', 'scorecard', 'guess'],
  content: {
    know: [
      'What is {honoree}’s biggest pregnancy craving?',
      'What was {honoree}’s first thought when she saw the positive test?',
      'How many children does {honoree} want in total?',
      'What baby name was {honoree}’s runner-up choice?',
      'What is {honoree} most nervous about as a new mom?',
      'What is {honoree}’s guess for the baby’s birth date?',
      'What is {honoree}’s guess for the baby’s birth weight?',
      'Who will the baby look like most, according to {honoree}?',
      'What is the first meal {honoree} wants after delivery?',
      'What song does {honoree} already sing to the baby?'
    ],
    whosaid: [
      ['I cried at the first ultrasound', 'Mom'],
      ['I already bought the baby tiny sneakers', 'Dad'],
      ['I have read three parenting books this month', 'Mom'],
      ['I practiced diaper changes on a teddy bear', 'Dad'],
      ['I crave pickles in the middle of the night', 'Mom'],
      ['I talk to the bump every single night', 'Dad'],
      ['I organized the whole nursery in one weekend', 'Mom'],
      ['I teared up while assembling the crib', 'Dad']
    ],
    predictions: [
      'The baby will arrive on this date:',
      'The baby will weigh:',
      'The baby will be this long:',
      'The baby’s hair color will be:',
      'The baby’s eye color will be:',
      'The baby will look most like:',
      'The baby’s first word will be:',
      'The baby will grow up to be a:'
    ],
    advice: [
      'The best parenting advice I ever received:',
      'A product every new parent truly needs:',
      'How to survive the sleepless nights:',
      'Something I wish I had known before the baby:',
      'A date-night idea for after the baby arrives:',
      'Words of encouragement for {honoree}:'
    ],
    trivia: [
      ['How many bones are babies born with?', 'About 300 (adults have 206)'],
      ['What is the first sense a baby develops?', 'Touch'],
      ['At around what age do most babies say their first word?', 'Around 12 months'],
      ['How many diapers does a newborn go through in one day?', 'About 8 to 12'],
      ['Roughly what share of babies arrive on their exact due date?', 'About 5%'],
      ['How long is the average pregnancy, in weeks?', '40 weeks'],
      ['What is a baby kangaroo called?', 'A joey'],
      ['How many taste buds is a baby born with?', 'About 10,000'],
      ['Many babies are born with which eye color that often changes during the first year?', 'Blue or gray'],
      ['At what age do babies usually cut their first tooth?', 'Around 6 months'],
      ['How many hours a day does a newborn sleep, on average?', 'About 14 to 17 hours'],
      ['How big is a newborn’s stomach on day one?', 'About the size of a cherry'],
      ['What reflex makes a baby grip a finger placed in their palm?', 'The grasp (palmar) reflex'],
      ['In the classic song, how many little ducks went out one day?', 'Five'],
      ['What is the most common birthday month in the US?', 'September']
    ],
    scramble: ['DIAPER', 'BOTTLE', 'PACIFIER', 'ONESIE', 'CRADLE', 'BLANKET', 'STROLLER', 'RATTLE', 'NURSERY', 'LULLABY', 'SWADDLE', 'TEETHER'],
    pictionary: [
      ['🍼🚿', 'Baby Shower'],
      ['👶👣', 'Baby Steps'],
      ['🧸❤️', 'Bear Hug'],
      ['👶🎂', 'First Birthday'],
      ['🌙🎵', 'Lullaby'],
      ['👶🛁', 'Bath Time'],
      ['🍼🕛', 'Midnight Feeding'],
      ['👶📖', 'Bedtime Story'],
      ['🎁👶', 'Baby Gift'],
      ['🧦👶', 'Tiny Socks'],
      ['👶😴', 'Nap Time'],
      ['🤰💭', 'Baby Dreams']
    ],
    rather: [
      ['Change a diaper', 'Do the 3 a.m. feeding'],
      ['Sing a lullaby', 'Read a bedtime story'],
      ['Push the stroller', 'Carry the baby'],
      ['Host a big shower', 'Host a small shower'],
      ['Find out the gender early', 'Be surprised at birth'],
      ['Dress baby in onesies', 'Dress baby in outfits'],
      ['Take monthly milestone photos', 'Keep a baby journal'],
      ['Team Pink', 'Team Blue'],
      ['Rock the baby to sleep', 'Pat the baby to sleep'],
      ['Sleep when the baby sleeps', 'Catch up on chores']
    ],
    thisorthat: [
      ['Pink', 'Blue'], ['Bows', 'Bowties'], ['Onesies', 'Rompers'],
      ['Swaddle', 'Sleep sack'], ['Pastel nursery', 'Bright nursery'],
      ['Family name', 'Brand-new name'], ['Pacifier', 'Thumb'],
      ['Cloth diapers', 'Disposable diapers'], ['Story time', 'Song time'],
      ['Bottle', 'Sippy cup']
    ],
    overunder: [
      ['How many bones is a baby born with — over or under 250?', 'Over — 300'],
      ['How many diapers does a newborn use in a day — over or under 8?', 'Over — 8 to 12'],
      ['What share of babies arrive on their exact due date — over or under 10%?', 'Under — about 5%'],
      ['How big is a newborn’s stomach on day one — over or under the size of a golf ball?', 'Under — cherry-sized'],
      ['How many taste buds is a baby born with — over or under 5,000?', 'Over — 10,000'],
      ['At what age do most babies cut a first tooth — over or under 9 months?', 'Under — about 6 months'],
      ['How many hours a day does a newborn sleep — over or under 12?', 'Over — 14 to 17 hours'],
      ['How many days does a pregnancy last — over or under 250?', 'Over — 280 days']
    ],
    priceright: [
      ['Newborn diapers, 32-pack', '$11.49'],
      ['Baby wipes, 72-pack', '$3.49'],
      ['Onesie bodysuit, single', '$6.00'],
      ['Baby bottle, 9 oz', '$8.99'],
      ['Pacifiers, 2-pack', '$5.49'],
      ['Swaddle blanket', '$24.95'],
      ['Baby shampoo, 15 oz', '$5.99'],
      ['Infant car seat', '$129.99']
    ],
    truefalse: [
      ['Newborn babies have fully hardened, bony kneecaps at birth.', 'False'],
      ['Newborns can see clearly up to 3 feet away at birth.', 'False — about 8 to 12 inches'],
      ['Babies are born with more bones than adults have.', 'True'],
      ['A baby’s first teeth fall out before birth.', 'False'],
      ['Newborns recognize their mother’s voice from birth.', 'True'],
      ['Babies can taste salt from the day they are born.', 'False — salt taste develops around 4 months'],
      ['A newborn’s brain doubles in size during the first year.', 'True'],
      ['All babies keep the eye color they are born with.', 'False']
    ],
    finishphrase: [
      ['A baby’s laugh is _____', 'contagious'],
      ['Never wake a sleeping _____', 'baby'],
      ['First comes love, then comes marriage, then comes _____', 'a baby in a baby carriage'],
      ['Sleep like a _____', 'baby'],
      ['Twinkle, twinkle, little _____', 'star'],
      ['_____ makes the world go round', 'Love'],
      ['The best thing about being a parent is the _____', 'snuggles'],
      ['Don’t count your _____ before they hatch', 'chickens']
    ],
    madlibs: {
      title: 'The Day the Baby Came Home',
      story: 'On a [adjective] morning, {honoree} woke up feeling [adjective]. "Today is the day!" she said, grabbing her [noun] and calling {honoree2}. At the hospital, the nurse handed over a tiny bundle wrapped in a [color] blanket. The baby opened its eyes, made a [silly sound], and grabbed a [body part]. "She looks just like a little [animal]," whispered {honoree2}. Everyone agreed the baby would grow up to be a famous [profession] who drives a [vehicle] and eats [number] pancakes every morning. And so the adventure began — with love, laughter, and very little [noun].'
    },
    scavenger: [
      'Something pink', 'Something blue', 'A baby photo of {honoree}',
      'Something polka-dotted', 'A pacifier', 'Something that smells like baby powder',
      'A onesie', 'Something with an animal on it', 'A bottle',
      'Something handmade', 'Something older than {honoree}', 'Something shaped like a heart'
    ],
    photochallenge: [
      'Snap a selfie with {honoree}',
      'Capture the funniest face at your table',
      'Photograph the prettiest decoration',
      'Catch someone mid-laugh',
      'Recreate a famous baby-photo pose',
      'Find and photograph something tiny',
      'Spell B-A-B-Y with your arms — group photo',
      'Photograph the gift the baby will love most'
    ],
    awards: [
      ['Best Advice-Giver', 'For wisdom that will save many sleepless nights'],
      ['Diaper-Changing Champion', 'For the fastest hands at the changing table'],
      ['Best Baby-Name Brainstormer', 'For the most creative name suggestions'],
      ['Sweetest Well-Wisher', 'For the card that made {honoree} tear up'],
      ['Guessing Game Guru', 'For the closest guess in Guess the Number'],
      ['Shower Superstar', 'For bringing the best energy to the party']
    ],
    guess: { title: 'Guess How Many Candies in the Jar', unit: 'candies', note: 'Closest guess without going over wins the jar!' },
    phoneExtra: [['A photo of the nursery', 15], ['The baby registry saved', 10], ['A pregnancy or baby countdown app', 10]],
    purseExtra: [['A baby shower invitation', 20], ['A sonogram photo', 25], ['Lip balm', 5]],
    iceExtra: ['What is the best baby gift you have ever given or received?', 'What baby name do you secretly love?']
  }
}
];

/* ---------------- Bridal Shower ---------------- */
PTG_OCCASIONS.push({
  id: 'bridal', name: 'Bridal Shower', emoji: '💍',
  tagline: 'Games for celebrating the bride-to-be',
  honoreeLabel: 'Bride-to-Be', defaultHonoree: 'the Bride-to-Be', defaultHonoree2: 'the Groom',
  saidBy: ['Bride', 'Groom'],
  games: ['know', 'whosaid', 'predictions', 'advice', 'scramble', 'pictionary', 'rather', 'thisorthat', 'overunder', 'priceright', 'trivia', 'truefalse', 'finishphrase', 'madlibs', 'scavenger', 'photochallenge', 'memorylane', 'certificates', 'tags', 'scorecard', 'icebreaker', 'guess', 'phone', 'purse'],
  defaults: ['know', 'whosaid', 'predictions', 'advice', 'scramble', 'pictionary', 'trivia', 'priceright', 'certificates', 'scorecard', 'guess'],
  content: {
    know: [
      'Where did {honoree} and {honoree2} first meet?',
      'Who said "I love you" first?',
      'What is {honoree}’s biggest wedding-planning stress?',
      'What song must the DJ play at the reception, according to {honoree}?',
      'What is {honoree}’s dream honeymoon destination?',
      'How many children does {honoree} hope for?',
      'What is {honoree2}’s most annoying habit, according to {honoree}?',
      'What was {honoree}’s first impression of {honoree2}?',
      'Who is the better cook?',
      'What does {honoree} say is {honoree2}’s best quality?'
    ],
    whosaid: [
      ['I cried when I saw the ring', 'Bride'],
      ['I practiced the proposal speech in the mirror', 'Groom'],
      ['I had the wedding Pinterest board before we met', 'Bride'],
      ['I asked her father for permission first', 'Groom'],
      ['I picked the first dance song years ago', 'Bride'],
      ['I teared up at the venue tour', 'Groom'],
      ['I have tried on more than ten dresses', 'Bride'],
      ['I am in charge of exactly one thing: the cake tasting', 'Groom']
    ],
    predictions: [
      'The couple will live in (city/country):',
      'Their first big trip together will be to:',
      'The couple will have this many children:',
      'Their first pet will be a:',
      'In 10 years, the couple will be:',
      'The couple’s first married purchase will be:',
      'Who will say "sorry" first after arguments?',
      'The couple will celebrate their 25th anniversary by:'
    ],
    advice: [
      'The secret to a happy marriage is:',
      'Never go to bed angry about:',
      'A date-night idea that never fails:',
      'How to win an argument with your spouse:',
      'Something every couple should do once a year:',
      'Words of wisdom for {honoree} and {honoree2}:'
    ],
    trivia: [
      ['What is the most popular month for weddings in the US?', 'June'],
      ['What does the "something blue" in the old rhyme symbolize?', 'Fidelity and purity'],
      ['How long is the average engagement in the US?', 'About 12 to 15 months'],
      ['What is the traditional gift for a 25th wedding anniversary?', 'Silver'],
      ['Which finger is the wedding ring worn on in the US, and why that one?', 'The left ring finger — once believed to hold a vein to the heart'],
      ['What is the average cost of a wedding in the US (recent years)?', 'Around $30,000'],
      ['What flower is most requested for wedding bouquets?', 'The rose'],
      ['In the rhyme, what is "something borrowed" said to bring?', 'Good luck'],
      ['What percentage of proposals happen on a holiday?', 'About 40% cluster around Dec–Feb holidays'],
      ['What is a "first look" at a modern wedding?', 'The couple seeing each other before the ceremony, privately'],
      ['How many guests attend the average US wedding?', 'About 115'],
      ['What does RSVP stand for?', 'Répondez s’il vous plaît (French: please respond)'],
      ['Which anniversary is the "golden" one?', 'The 50th'],
      ['What is the most popular wedding-day of the week?', 'Saturday'],
      ['Throwing rice at weddings traditionally symbolized what?', 'Fertility and prosperity']
    ],
    scramble: ['BRIDE', 'GROOM', 'WEDDING', 'BOUQUET', 'HONEYMOON', 'VOWS', 'RINGS', 'BRIDESMAID', 'TOAST', 'DANCE', 'CAKE', 'FOREVER'],
    pictionary: [
      ['💍👰', 'The Proposal'],
      ['👰💐', 'Bouquet Toss'],
      ['🎂✂️', 'Cutting the Cake'],
      ['💃🕺', 'First Dance'],
      ['🥂🍾', 'Champagne Toast'],
      ['✈️🌴', 'Honeymoon'],
      ['💌📬', 'Save the Date'],
      ['👗✨', 'Wedding Dress'],
      ['🤵💍', 'The Groom'],
      ['🎶💒', 'Wedding March'],
      ['📸👰', 'Bride Portrait'],
      ['❤️🔒', 'Tying the Knot']
    ],
    rather: [
      ['Elope to the beach', 'Have a big hometown wedding'],
      ['Write your own vows', 'Use traditional vows'],
      ['Have a live band', 'Have a DJ'],
      ['See each other before the ceremony', 'Wait for the aisle moment'],
      ['Honeymoon adventure trip', 'Honeymoon beach resort'],
      ['Chocolate cake', 'Vanilla cake'],
      ['Outdoor wedding', 'Ballroom wedding'],
      ['Huge guest list', 'Tiny guest list'],
      ['Matching rings', 'Unique rings'],
      ['First look photos', 'Surprise reveal']
    ],
    thisorthat: [
      ['Band', 'DJ'], ['Indoor', 'Outdoor'], ['Buffet', 'Plated dinner'],
      ['White roses', 'Wildflowers'], ['Sparkler exit', 'Flower petal toss'],
      ['Long veil', 'No veil'], ['Sweetheart table', 'Head table'],
      ['Photo booth', 'Live painter'], ['Early night', 'Party till midnight'],
      ['Traditional', 'Modern']
    ],
    overunder: [
      ['The average US engagement lasts about 14 months — over or under 12?', 'Over — 12 to 15 months'],
      ['The average wedding hosts about 115 guests — over or under 100?', 'Over — about 115'],
      ['An average wedding cake serves 3 tiers — over or under 2?', 'Over — 3 tiers is typical'],
      ['Couples spend about $30,000 on a wedding — over or under $20,000?', 'Over — around $30,000'],
      ['A bride tries on about 10 dresses before choosing — over or under 5?', 'Over — around 10'],
      ['About 40% of proposals land in Dec–Feb — over or under 25%?', 'Over — about 40%'],
      ['The average bridal party has about 5 attendants per side — over or under 3?', 'Over — about 5'],
      ['A first dance usually lasts about 3 minutes — over or under 5?', 'Under — about 3 minutes']
    ],
    priceright: [
      ['Bridal bouquet, florist-made', '$185.00'],
      ['Wedding cake for 100 guests', '$650.00'],
      ['Bottle of champagne for the toast', '$45.00'],
      ['Set of 100 wedding invitations', '$320.00'],
      ['Pair of wedding bands (simple gold)', '$1,100.00'],
      ['Bridesmaid dress', '$130.00'],
      ['Bag of Jordan almonds (favors), 1 lb', '$9.99'],
      ['Sparkler send-off pack, 36 sparklers', '$24.95']
    ],
    truefalse: [
      ['The wedding ring finger was once believed to have a vein running straight to the heart.', 'True'],
      ['White has always been the traditional bridal color everywhere.', 'False — it became popular after Queen Victoria’s 1840 wedding'],
      ['The word "bride" comes from an old word for cook.', 'True'],
      ['Throwing the bouquet started as a way to share the bride’s luck.', 'True'],
      ['June weddings are linked to Juno, Roman goddess of marriage.', 'True'],
      ['A "shotgun wedding" refers to a ceremony with fireworks.', 'False'],
      ['The average engagement ring costs more than $10,000 in the US.', 'False — closer to $5,000–$6,000'],
      ['Honeymoons began as trips to visit relatives after the wedding.', 'True']
    ],
    finishphrase: [
      ['To have and to _____', 'hold'],
      ['Something old, something new, something borrowed, something _____', 'blue'],
      ['You may now kiss the _____', 'bride'],
      ['Happily ever _____', 'after'],
      ['First comes love, then comes _____', 'marriage'],
      ['Tie the _____', 'knot'],
      ['Love is _____', 'blind'],
      ['And the two shall become _____', 'one']
    ],
    madlibs: {
      title: 'The Wedding Day Story',
      story: 'It was a [adjective] day when {honoree} walked down the aisle wearing a [adjective] gown and carrying [number] [plural noun]. {honoree2} gasped and whispered, "You look more beautiful than a [animal] in the moonlight." The officiant cleared his throat and said, "We are gathered here to join this couple in holy [noun]." During the reception, the best man gave a toast about the time the couple [past-tense verb] in a [place], and everyone laughed until they cried. Then the DJ played a [adjective] song, and Grandma danced like a [profession]. It was, without a doubt, the most [adjective] wedding ever.'
    },
    scavenger: [
      'Something borrowed', 'Something blue', 'A love note or card',
      'Something sparkly', 'A photo of the couple', 'Something heart-shaped',
      'A flower', 'Something that smells sweet', 'A ring (any kind)',
      'Something white', 'A photo of {honoree} laughing', 'Something gold'
    ],
    photochallenge: [
      'Snap a selfie with {honoree}',
      'Capture the couple’s rings (or a drawing of them!)',
      'Photograph the prettiest table decoration',
      'Catch two guests slow-dancing',
      'Recreate a famous romantic movie pose',
      'Photograph something blue',
      'Get a photo of the oldest and youngest guests together',
      'Capture the moment someone tears up'
    ],
    memorylane: [
      'My favorite memory with {honoree} is:',
      'I knew {honoree} and {honoree2} were meant to be when:',
      'The funniest thing I have seen {honoree} do:',
      'A moment I will never forget with the couple:',
      '{honoree} once told me this about {honoree2}:',
      'My favorite photo of the couple is the one where:'
    ],
    awards: [
      ['Best Love Storyteller', 'For the sweetest tale of how the couple met'],
      ['Wedding Planning MVP', 'For heroic help with the big day'],
      ['Best Advice-Giver', 'For marriage wisdom worth framing'],
      ['Tearjerker Award', 'For the card that made {honoree} cry happy tears'],
      ['Guessing Game Guru', 'For the closest guess in Guess the Number'],
      ['Shower Superstar', 'For bringing the best energy to the party']
    ],
    guess: { title: 'Guess How Many Kisses in the Jar', unit: 'chocolate kisses', note: 'Closest guess without going over wins the jar!' },
    phoneExtra: [['A photo of the couple together', 20], ['The wedding registry or invite saved', 10], ['A love song in your recent plays', 10]],
    purseExtra: [['A wedding invitation or save-the-date', 20], ['Lipstick in a wedding-ready shade', 10], ['A tissue — for happy tears', 10]],
    iceExtra: ['What is the best marriage advice you have ever heard?', 'Where was your first date — or your dream first date?']
  }
});

/* ---------------- Bachelorette ---------------- */
PTG_OCCASIONS.push({
  id: 'bachelorette', name: 'Bachelorette Party', emoji: '🥂',
  tagline: 'Games for the bride tribe’s big night',
  honoreeLabel: 'Bride-to-Be', defaultHonoree: 'the Bride-to-Be', defaultHonoree2: 'the Groom',
  saidBy: ['Bride', 'Groom'],
  games: ['know', 'whosaid', 'predictions', 'advice', 'scramble', 'pictionary', 'rather', 'thisorthat', 'overunder', 'trivia', 'truefalse', 'finishphrase', 'madlibs', 'scavenger', 'photochallenge', 'certificates', 'tags', 'scorecard', 'icebreaker', 'guess', 'phone', 'purse'],
  defaults: ['know', 'whosaid', 'advice', 'scramble', 'pictionary', 'rather', 'trivia', 'scavenger', 'certificates', 'scorecard'],
  content: {
    know: [
      'What is {honoree}’s go-to karaoke song?',
      'What was {honoree}’s most embarrassing date ever?',
      'What is {honoree}’s signature dance move called?',
      'Who was {honoree}’s first celebrity crush?',
      'What does {honoree} say is {honoree2}’s best feature?',
      'What is {honoree}’s guilty-pleasure TV show?',
      'How did {honoree} describe {honoree2} after their first date?',
      'What is {honoree}’s drink of choice on a night out?',
      'What wedding task is {honoree} secretly dreading?',
      'Where does {honoree} want to travel with {honoree2} first?'
    ],
    whosaid: [
      ['I planned the proposal for months', 'Groom'],
      ['I want a choreographed entrance at the reception', 'Bride'],
      ['I cried at the ring, then asked about the warranty', 'Groom'],
      ['I have a spreadsheet for the seating chart', 'Bride'],
      ['I suggested a taco bar for the wedding dinner', 'Groom'],
      ['I practiced my signature as the future Mrs.', 'Bride'],
      ['I am more excited about the cake than the vows', 'Groom'],
      ['I picked our song on the second date', 'Bride']
    ],
    predictions: [
      'On the wedding night, the couple will:',
      'The couple’s first married trip will be to:',
      'The couple will have this many kids:',
      'Who will cry first at the ceremony?',
      'The couple’s first big purchase will be:',
      'In five years, the couple will be living in:',
      'Who will be in charge of the remote control?',
      'The couple will celebrate their first anniversary by:'
    ],
    advice: [
      'The secret to keeping the spark alive:',
      'Best date-night idea on a budget:',
      'How to survive meeting the in-laws:',
      'A rule every couple should follow:',
      'What to do when he leaves the seat up (again):',
      'One piece of advice for the wedding night:'
    ],
    trivia: [
      ['What city is most famous for bachelorette parties in the US?', 'Nashville, Tennessee'],
      ['What does "bridesmaid" originally mean in Old English tradition?', 'A close attendant/friend of the bride (from "bryd" + maid)'],
      ['In ancient Rome, bridesmaids dressed like the bride to do what?', 'Confuse evil spirits and jealous ex-suitors'],
      ['What is the traditional role of the maid of honor?', 'The bride’s chief attendant and witness'],
      ['How many bridesmaids does the average US bride have?', 'About 4 to 5'],
      ['What is a "bridezilla"?', 'A joking term for a bride who becomes demanding while planning'],
      ['What sparkly headpiece is a bachelorette-party staple?', 'A tiara (often with a veil)'],
      ['The tradition of a bride carrying a bouquet began partly to mask what?', 'Body odor, before regular bathing and deodorant'],
      ['What does the groom traditionally wear to match the bride’s bouquet?', 'A boutonnière made from the same flowers'],
      ['What is the most popular wedding month in the US?', 'October (recent years) or June (traditionally)'],
      ['What game has guests guess who said wedding quotes — bride or groom?', 'The "Who Said It" game'],
      ['What is a "stock the bar" party?', 'A shower where guests bring bottles for the couple’s home bar'],
      ['In the US, roughly what share of couples meet online today?', 'About 1 in 3 (recent studies)'],
      ['What does the bride traditionally throw to single guests?', 'Her bouquet'],
      ['A "Galentine’s" celebration happens on which date?', 'February 13']
    ],
    scramble: ['BRIDE', 'SASH', 'TIARA', 'CHEERS', 'DANCE', 'KARAOKE', 'GLITTER', 'TOAST', 'PARTY', 'BRIDESMAID', 'VEIL', 'SPARKLE'],
    pictionary: [
      ['👰🥂', 'Bride Tribe Cheers'],
      ['🎤🎶', 'Karaoke Night'],
      ['💃✨', 'Dance Floor'],
      ['💍📸', 'Ring Selfie'],
      ['👑👰', 'Bride Queen'],
      ['🍾🎉', 'Pop the Champagne'],
      ['💄💋', 'Glam Squad'],
      ['🌙🍸', 'Girls Night Out'],
      ['📸👯', 'Squad Photo'],
      ['🎂🥂', 'Cake and Champagne'],
      ['💌💍', 'She Said Yes'],
      ['🚗🎶', 'Road Trip Playlist']
    ],
    rather: [
      ['Karaoke night', 'Spa day'],
      ['Dance all night', 'Lounge and chat'],
      ['Matching outfits', 'Everyone in their own style'],
      ['Fancy dinner', 'Food truck feast'],
      ['Beach trip', 'City weekend'],
      ['Comedy club', 'Concert'],
      ['Cocktail class', 'Wine tasting'],
      ['Early night, big brunch', 'Out until sunrise'],
      ['Photo booth props', 'Polaroid camera'],
      ['Surprise party', 'Planned-to-perfection party']
    ],
    thisorthat: [
      ['Heels', 'Sneakers'], ['Glitter', 'Neon'], ['Sweet drinks', 'Dry drinks'],
      ['Karaoke', 'Dancing'], ['Tiara', 'Sash'], ['Night out', 'Night in'],
      ['Group chat planner', 'Go-with-the-flow'], ['Cake', 'Cocktails'],
      ['Matching tees', 'Little black dresses'], ['Toast first', 'Dance first']
    ],
    overunder: [
      ['The average bride has about 5 bridesmaids — over or under 3?', 'Over — about 4 to 5'],
      ['A bachelorette party usually lasts about 2 days — over or under 1?', 'Over — a full weekend is common'],
      ['About 1 in 3 couples meet online — over or under 1 in 4?', 'Over — about 1 in 3'],
      ['The average wedding costs about $30,000 — over or under $25,000?', 'Over — around $30,000'],
      ['Guests eat about 1 slice of wedding cake each — over or under 2?', 'Under — about 1 slice'],
      ['The average engagement is about 14 months — over or under 10?', 'Over — 12 to 15 months'],
      ['A bouquet toss tradition is about 500 years old in some form — over or under 100?', 'Over — centuries old'],
      ['The average first dance lasts about 3 minutes — over or under 5?', 'Under — about 3 minutes']
    ],
    truefalse: [
      ['Bridesmaids once dressed identically to the bride to confuse evil spirits.', 'True'],
      ['The bachelorette party tradition started in the 1990s.', 'False — it grew from 1960s–80s "hen party" traditions'],
      ['A maid of honor is always the bride’s sister.', 'False'],
      ['The bouquet toss is meant to pass the bride’s luck to the catcher.', 'True'],
      ['White bridesmaid dresses are a brand-new trend.', 'False — bridesmaids historically wore white too'],
      ['Galentine’s Day was invented by a TV show.', 'True — Parks and Recreation (2010)'],
      ['It is bad luck for the groom to see the dress before the wedding — an ancient Roman rule.', 'False — the superstition is much more recent'],
      ['The word "honeymoon" relates to mead, a honey drink.', 'True']
    ],
    finishphrase: [
      ['Pop the _____', 'bubbly'],
      ['Last ride for the _____', 'bride'],
      ['Girls just want to have _____', 'fun'],
      ['Diamonds are a girl’s best _____', 'friend'],
      ['Here comes the _____', 'bride'],
      ['She said _____', 'yes'],
      ['Love, laughter and happily ever _____', 'after'],
      ['Bride _____ (the group name)', 'tribe']
    ],
    madlibs: {
      title: 'The Big Night Out',
      story: 'The night began when {honoree} arrived wearing a [adjective] sash and a tiara shaped like a [noun]. Her best friends cheered and handed her a glass of [drink]. "Tonight," said {host}, "we celebrate love, friendship, and [plural noun]!" First, the group went to a [place] where a [profession] taught everyone how to [verb]. Then came karaoke: {honoree} sang a [adjective] version of a famous love song while standing on a [piece of furniture]. By midnight, everyone agreed this was the most [adjective] bachelorette party in history — and the perfect send-off before the big day on {date}.'
    },
    scavenger: [
      'A selfie with a stranger named like the groom',
      'Something sparkly', 'A menu or coaster from a bar or café',
      'A photo of the bride tribe jumping', 'Something borrowed from a stranger',
      'A napkin with a phone number (real or fake!)', 'A song request slip',
      'Something heart-shaped', 'A photo with someone celebrating a birthday',
      'A picture of matching shoes', 'Something blue', 'The bride’s autograph on a napkin'
    ],
    photochallenge: [
      'Snap the official bride-tribe group photo',
      'Capture {honoree}’s happiest laugh',
      'Photograph the fanciest drink of the night',
      'Recreate the proposal moment (actors welcome)',
      'Get a photo with matching poses, then and now',
      'Photograph something that sparkles',
      'Capture a toast in mid-air',
      'Take a photo that belongs on a movie poster'
    ],
    awards: [
      ['Best Wingwoman', 'For world-class support on the dance floor and beyond'],
      ['Karaoke Queen', 'For a performance nobody will forget'],
      ['Planner Extraordinaire', 'For organizing the night down to the last detail'],
      ['Best Toast', 'For the speech that made {honoree} laugh and cry'],
      ['Dance Floor Legend', 'For never sitting down, not even once'],
      ['Bride Tribe MVP', 'For bringing the best energy of the night']
    ],
    guess: { title: 'Guess How Many Rings in the Jar', unit: 'ring pops', note: 'Closest guess without going over wins the jar!' },
    phoneExtra: [['A group photo with the bride tribe', 20], ['A karaoke song in your recent plays', 10], ['The bride’s number saved with a nickname', 10]],
    purseExtra: [['A spare hair tie for the bride', 10], ['Glitter or sparkly makeup', 15], ['A mini perfume', 10]],
    iceExtra: ['What is your best advice for a great night out?', 'What was your most memorable party ever?']
  }
});

/* ---------------- Birthday (Adult) ---------------- */
PTG_OCCASIONS.push({
  id: 'birthdayadult', name: 'Birthday (Adult)', emoji: '🎂',
  tagline: 'Games for a grown-up birthday bash',
  honoreeLabel: 'Birthday Star', defaultHonoree: 'the Birthday Star', defaultHonoree2: 'the Host',
  saidBy: null,
  games: ['know', 'predictions', 'advice', 'scramble', 'pictionary', 'rather', 'thisorthat', 'overunder', 'priceright', 'trivia', 'truefalse', 'finishphrase', 'madlibs', 'scavenger', 'photochallenge', 'memorylane', 'certificates', 'tags', 'scorecard', 'icebreaker', 'guess', 'phone'],
  defaults: ['know', 'predictions', 'advice', 'scramble', 'pictionary', 'trivia', 'memorylane', 'certificates', 'scorecard', 'guess'],
  content: {
    know: [
      'What was {honoree}’s childhood dream job?',
      'What is {honoree}’s all-time favorite birthday memory?',
      'What song can {honoree} not resist dancing to?',
      'What is {honoree}’s biggest guilty pleasure?',
      'If {honoree} won the lottery tomorrow, what is the first thing they would buy?',
      'What is {honoree}’s most used emoji?',
      'What skill does {honoree} wish they had mastered?',
      'What is {honoree}’s favorite meal in the whole world?',
      'Who was {honoree}’s first celebrity crush?',
      'What is {honoree} most proud of from the past year?'
    ],
    predictions: [
      'This year, {honoree} will finally:',
      'The birthday star’s next big trip will be to:',
      'By next birthday, {honoree} will have:',
      'A new hobby {honoree} will try this year:',
      'The best thing that will happen to {honoree} this year:',
      'A goal {honoree} will crush before next birthday:',
      'Who at this party will {honoree} still call in 20 years?',
      'This time next year, {honoree} will be famous for:'
    ],
    advice: [
      'The best life advice I can give {honoree}:',
      'Something everyone should do at least once:',
      'A money tip that actually works:',
      'How to make this year the best one yet:',
      'A book, show or song {honoree} must try this year:',
      'My birthday wish for {honoree}:'
    ],
    trivia: [
      ['In which country did the tradition of birthday candles on a cake begin?', 'Germany (Kinderfest celebrations)'],
      ['The song "Happy Birthday" was originally titled what?', '"Good Morning to All"'],
      ['Roughly how many people share your exact birthday worldwide?', 'About 20 million'],
      ['Which month has the most birthdays in the US?', 'September'],
      ['Which day of the year is the most common birthday in the US?', 'September 9 (in several studies)'],
      ['What is the rarest birthday date in the US?', 'February 29 (leap day) — or Dec 25 in some lists'],
      ['The tradition of birthday cakes dates back to which ancient culture?', 'Ancient Greece (round cakes for Artemis, goddess of the moon)'],
      ['How much did the most expensive birthday cake ever made cost?', 'About $75 million (a jewel-encrusted cake in the UAE, 2015)'],
      ['What does a "golden birthday" mean?', 'Turning the age that matches your birth date (e.g. 25 on the 25th)'],
      ['In the UK, what does the Queen/King traditionally send for a 100th birthday?', 'A congratulatory card or message'],
      ['Which famous person shares more recorded birthdays than any other in history?', 'No single person — but Jesus is the most commonly celebrated (Dec 25)'],
      ['About how many birthday cards are sent each year in the US?', 'Around 2 billion'],
      ['What is a "birthday attack" in cryptography named after?', 'The birthday paradox (probability of shared birthdays)'],
      ['In a room of how many people is there a 50% chance two share a birthday?', 'Just 23 people'],
      ['Birthday balloons were first mass-produced in which decade?', 'The 1930s (rubber balloons; foil came in the 1970s)']
    ],
    scramble: ['CAKE', 'PARTY', 'CANDLES', 'BALLOON', 'WISHES', 'FRIENDS', 'MUSIC', 'DANCE', 'PRESENTS', 'CHEERS', 'SURPRISE', 'CELEBRATE'],
    pictionary: [
      ['🎂🕯️', 'Birthday Cake'],
      ['🎈🎉', 'Party Time'],
      ['🎁🎀', 'Wrapped Gift'],
      ['🥳🎤', 'Karaoke Party'],
      ['💃🪩', 'Disco Dancing'],
      ['🍕🎂', 'Pizza and Cake'],
      ['🎶🎧', 'DJ Music'],
      ['📸🥳', 'Party Selfie'],
      ['🍾🥂', 'Champagne Toast'],
      ['🎊🎈', 'Confetti Balloons'],
      ['🕯️💨', 'Blow Out the Candles'],
      ['🎁😲', 'Surprise Gift']
    ],
    rather: [
      ['Huge party', 'Small dinner with best friends'],
      ['Chocolate cake', 'Fruit cake'],
      ['Surprise party', 'Planned party'],
      ['Karaoke all night', 'Board games all night'],
      ['Birthday trip', 'Birthday shopping spree'],
      ['Cake for breakfast', 'Cake at midnight'],
      ['Funny card', 'Heartfelt card'],
      ['Dance party', 'Movie marathon'],
      ['Homemade cake', 'Bakery cake'],
      ['More birthdays', 'Fewer but bigger birthdays']
    ],
    thisorthat: [
      ['Chocolate', 'Vanilla'], ['Big bash', 'Cozy night in'], ['DJ', 'Live band'],
      ['Sweet', 'Savory'], ['Early party', 'Late night'], ['Balloons', 'Streamers'],
      ['Ice cream', 'Cake'], ['Group photo', 'Candid photos'], ['Toast', 'Roast'],
      ['This year', 'Next year']
    ],
    overunder: [
      ['About 2 billion birthday cards are sent yearly in the US — over or under 1 billion?', 'Over — about 2 billion'],
      ['In a group of 23 people, a shared birthday is 50% likely — over or under 30 people?', 'Under — just 23'],
      ['The average person has about 10 close friends at a birthday — over or under 5?', 'Over — about 10'],
      ['"Happy Birthday" is sung about 50 million times a year in the US alone — over or under 10 million?', 'Over — tens of millions'],
      ['September is the busiest birth month — over or under 300,000 US births?', 'Over — about 340,000 in September'],
      ['The world record for oldest living person passed 120 years — over or under 115?', 'Over — 122 years (Jeanne Calment)'],
      ['A leap-day birthday occurs once every 4 years — over or under 3?', 'Over — every 4 years'],
      ['The average American eats about 2 slices of cake at a party — over or under 1?', 'Over — about 2']
    ],
    priceright: [
      ['Greeting card, premium', '$6.50'],
      ['Number birthday candles, pack', '$4.99'],
      ['Party balloons, 50-pack', '$12.99'],
      ['Chocolate layer cake, bakery', '$42.00'],
      ['Disposable party plates, 100-pack', '$14.95'],
      ['Bottle of prosecco', '$13.99'],
      ['Photo booth prop set', '$16.99'],
      ['Gift bag, large', '$3.49']
    ],
    truefalse: [
      ['The "Happy Birthday" song was once under copyright in the US.', 'True — until a 2016 court ruling'],
      ['More people are born on February 29 than on December 25.', 'False — leap day is the rarest'],
      ['Birthday candles began as a way to send prayers to the gods.', 'True — smoke was believed to carry wishes upward'],
      ['Everyone in the world celebrates birthdays the same way.', 'False — traditions vary widely; some cultures mark group birthdays on New Year'],
      ['In a room of 23 people, a shared birthday is more likely than not.', 'True — about 50.7%'],
      ['The Queen of England sent birthday cards to everyone turning 90.', 'False — the tradition is for 100th birthdays'],
      ['Ancient Romans celebrated birthdays of gods and emperors, not ordinary people at first.', 'True'],
      ['Your "golden birthday" happens when you turn 50.', 'False — it is when your age matches your birth date']
    ],
    finishphrase: [
      ['Another year older, another year _____', 'wiser'],
      ['Make a _____ and blow out the candles', 'wish'],
      ['Age is just a _____', 'number'],
      ['Eat, drink and be _____', 'merry'],
      ['Hip hip _____', 'hooray'],
      ['Many happy _____', 'returns'],
      ['Over the _____ (milestone joke)', 'hill'],
      ['Born to _____', 'party']
    ],
    madlibs: {
      title: 'The Best Birthday Ever',
      story: 'When {honoree} arrived at the party, everyone jumped out and yelled, "[exclamation]!" The room was decorated with [number] balloons shaped like [plural animal]. {host} brought out a cake covered in [adjective] frosting and shaped like a [noun]. "Make a wish!" everyone shouted. {honoree} closed their eyes, wished for a lifetime supply of [plural noun], and blew out the candles so hard that a [piece of furniture] caught a gust and wobbled. Then the DJ played a [adjective] song, and even the family dog started to [verb]. It was officially the most [adjective] birthday in history.'
    },
    scavenger: [
      'Something that sparkles', 'A candle (unlit is fine!)',
      'Something older than {honoree}', 'A party hat or decoration',
      'Something chocolate', 'A photo of the birthday star as a kid',
      'Something that makes noise', 'A wrapped gift',
      'Something in {honoree}’s favorite color', 'A balloon',
      'Something sweet enough to eat', 'A card or note'
    ],
    photochallenge: [
      'Snap a selfie with {honoree}',
      'Capture the candle blow-out moment',
      'Photograph the best-dressed guest',
      'Recreate a childhood photo of the birthday star',
      'Catch someone mid-dance-move',
      'Photograph the cake from its best angle',
      'Get a photo of everyone making the same face',
      'Capture the funniest candid of the night'
    ],
    memorylane: [
      'My favorite memory with {honoree} is:',
      'The funniest thing I have ever seen {honoree} do:',
      'I first met {honoree} when:',
      'A road trip / night out with {honoree} I will never forget:',
      '{honoree} once said the most unforgettable thing:',
      'The moment I knew {honoree} was a friend for life:'
    ],
    awards: [
      ['Life of the Party', 'For unmatched energy from start to finish'],
      ['Best Storyteller', 'For the tale nobody wanted to end'],
      ['Dance Floor Legend', 'For moves that defied physics and dignity'],
      ['Best Gift-Giver', 'For the present that stole the show'],
      ['Sweetest Friend', 'For the card that made {honoree} tear up'],
      ['Birthday MVP', 'For helping make this day unforgettable']
    ],
    guess: { title: 'Guess How Many Candles on the Cake (Jar Edition)', unit: 'candies', note: 'Closest guess without going over wins the jar!' },
    phoneExtra: [['A birthday selfie from a past year', 15], ['The birthday star’s number saved with a nickname', 10], ['A party playlist saved', 10]],
    iceExtra: ['What is the best birthday you have ever had?', 'What would your perfect birthday day look like?']
  }
});

/* ---------------- Birthday (Kids) ---------------- */
PTG_OCCASIONS.push({
  id: 'birthdaykids', name: 'Birthday (Kids)', emoji: '🎈',
  tagline: 'Games for a kids’ birthday party',
  honoreeLabel: 'Birthday Star', defaultHonoree: 'the Birthday Star', defaultHonoree2: 'the Host',
  saidBy: null,
  games: ['know', 'predictions', 'advice', 'scramble', 'pictionary', 'rather', 'thisorthat', 'trivia', 'truefalse', 'finishphrase', 'madlibs', 'scavenger', 'photochallenge', 'certificates', 'tags', 'scorecard', 'icebreaker', 'guess'],
  defaults: ['know', 'predictions', 'scramble', 'pictionary', 'rather', 'trivia', 'scavenger', 'certificates', 'scorecard', 'guess'],
  content: {
    know: [
      'What is {honoree}’s favorite color?',
      'What is {honoree}’s favorite food?',
      'What does {honoree} want to be when they grow up?',
      'What is {honoree}’s favorite animal?',
      'What is {honoree}’s favorite movie or show?',
      'What is the birthday star’s favorite game to play?',
      'What superpower does {honoree} wish they had?',
      'What is {honoree}’s favorite ice cream flavor?',
      'What is the birthday star’s best friend’s name?',
      'What made {honoree} laugh the hardest this year?'
    ],
    predictions: [
      'This year, {honoree} will learn to:',
      'The birthday star’s new favorite thing will be:',
      'By next birthday, {honoree} will be able to:',
      'A new friend {honoree} will make this year:',
      'The coolest place {honoree} will visit this year:',
      'When {honoree} grows up, they will be a:',
      'The birthday star’s first pet will be a:',
      'This year {honoree} will surprise everyone by:'
    ],
    advice: [
      'My birthday wish for {honoree} is:',
      'Something fun the birthday star should try this year:',
      'A superpower I would give {honoree}:',
      'The best thing about being a kid is:',
      'A funny joke for the birthday star:',
      'Draw or write something to make {honoree} smile:'
    ],
    trivia: [
      ['How many candles go on a cake for a 10th birthday?', '10 (plus one for good luck, in some families!)'],
      ['Which animal is known as the birthday party piñata’s usual shape?', 'A donkey (the classic piñata)'],
      ['What do you say after someone sings "Happy Birthday"?', 'Make a wish and blow out the candles!'],
      ['Which planet is known as the Red Planet?', 'Mars'],
      ['How many legs does a spider have?', '8'],
      ['What is the biggest animal in the world?', 'The blue whale'],
      ['Which color do you get by mixing blue and yellow paint?', 'Green'],
      ['How many days are there in a leap year?', '366'],
      ['What is a baby frog called?', 'A tadpole'],
      ['Which fruit keeps the doctor away, according to the saying?', 'An apple a day'],
      ['How many sides does a hexagon have?', '6'],
      ['What is the fastest land animal?', 'The cheetah'],
      ['Which ocean is the biggest?', 'The Pacific Ocean'],
      ['What do caterpillars turn into?', 'Butterflies'],
      ['How many minutes are in one hour?', '60']
    ],
    scramble: ['CAKE', 'PARTY', 'BALLOON', 'CANDLE', 'GAMES', 'MUSIC', 'PIZZA', 'GIFTS', 'FRIEND', 'HAPPY', 'WISH', 'CLOWN'],
    pictionary: [
      ['🎂🕯️', 'Birthday Cake'],
      ['🎈🎈', 'Balloons'],
      ['🎁😀', 'Birthday Present'],
      ['🍕🎉', 'Pizza Party'],
      ['🦄✨', 'Magic Unicorn'],
      ['🐶🎈', 'Party Puppy'],
      ['🍦☀️', 'Ice Cream Day'],
      ['🎠🎡', 'Carnival Rides'],
      ['🦖🎂', 'Dinosaur Birthday'],
      ['🚀🌙', 'Trip to the Moon'],
      ['🐳🌊', 'Whale in the Ocean'],
      ['🍭🍬', 'Candy Land']
    ],
    rather: [
      ['Eat cake', 'Eat ice cream'],
      ['Play tag', 'Play hide and seek'],
      ['Have a pet dragon', 'Have a pet unicorn'],
      ['Swim in a pool of jelly', 'Jump on a cloud trampoline'],
      ['Be able to fly', 'Be invisible'],
      ['Have a treehouse', 'Have a secret fort'],
      ['Ride a roller coaster', 'Ride a merry-go-round'],
      ['Talk to animals', 'Talk to robots'],
      ['Have birthday every week', 'Have Christmas every week'],
      ['Be a superhero', 'Be a wizard']
    ],
    thisorthat: [
      ['Cake', 'Cupcakes'], ['Chocolate', 'Strawberry'], ['Games inside', 'Games outside'],
      ['Balloons', 'Bubbles'], ['Pizza', 'Burgers'], ['Singing', 'Dancing'],
      ['Superheroes', 'Dinosaurs'], ['Magic show', 'Puppet show'], ['Party hats', 'Party masks'],
      ['Presents first', 'Cake first']
    ],
    truefalse: [
      ['A group of flamingos is called a flamboyance.', 'True'],
      ['Goldfish have a memory of only 3 seconds.', 'False — they remember for months'],
      ['Bananas are berries, but strawberries are not.', 'True (botanically!)'],
      ['The Moon is made of cheese.', 'False'],
      ['Octopuses have three hearts.', 'True'],
      ['Penguins can fly.', 'False'],
      ['Honey never spoils.', 'True'],
      ['A snail can sleep for up to 3 years.', 'True']
    ],
    finishphrase: [
      ['Happy birthday to _____', 'you'],
      ['Make a _____ upon a star', 'wish'],
      ['Twinkle twinkle little _____', 'star'],
      ['The wheels on the _____ go round and round', 'bus'],
      ['If you’re happy and you know it, clap your _____', 'hands'],
      ['Rain rain go _____', 'away'],
      ['Hickory dickory dock, the mouse ran up the _____', 'clock'],
      ['Mary had a little _____', 'lamb']
    ],
    madlibs: {
      title: 'The Silliest Birthday Party',
      story: 'Today was {honoree}’s birthday party, and it was the silliest day ever! A giant [animal] arrived riding a [vehicle] and carrying [number] balloons. Everyone ate [adjective] cake with [color] frosting and drank cups of [drink]. Then a [profession] jumped out of a box and started to [verb] while wearing a [piece of clothing] on their head. {honoree} made a wish, blew out the candles, and shouted, "[exclamation]!" All the guests agreed: it was the most [adjective] party in the history of birthdays.'
    },
    scavenger: [
      'Something red', 'Something round', 'A balloon',
      'Something that makes music', 'Something sweet', 'A party hat',
      'Something with stripes', 'Something soft', 'A picture of an animal',
      'Something shiny', 'Something you can bounce', 'Something shaped like a star'
    ],
    photochallenge: [
      'Take a photo with {honoree}',
      'Make the silliest face you can',
      'Jump in the air — photo mid-jump!',
      'Photo with the biggest balloon',
      'Pretend to be your favorite animal',
      'Photo of the yummiest treat',
      'Strike a superhero pose',
      'Group photo — everyone pointing at the birthday star'
    ],
    awards: [
      ['Super Scavenger', 'For finding everything on the hunt list'],
      ['Best Dancer', 'For the coolest moves at the party'],
      ['Silliest Face Champion', 'For the funniest photo of the day'],
      ['Kindness Star', 'For sharing and helping friends'],
      ['Game Master', 'For winning the most games'],
      ['Best Birthday Helper', 'For helping make the party awesome']
    ],
    guess: { title: 'Guess How Many Candies in the Jar', unit: 'candies', note: 'Closest guess wins the jar!' },
    iceExtra: ['If you could have any animal as a pet, what would you pick?', 'What is the best thing about birthdays?']
  }
});

/* ---------------- Christmas ---------------- */
PTG_OCCASIONS.push({
  id: 'christmas', name: 'Christmas', emoji: '🎄',
  tagline: 'Games for holiday parties & family game night',
  honoreeLabel: 'Host', defaultHonoree: 'the Host', defaultHonoree2: 'Santa',
  saidBy: null,
  games: ['know', 'predictions', 'advice', 'scramble', 'pictionary', 'rather', 'thisorthat', 'overunder', 'priceright', 'trivia', 'truefalse', 'finishphrase', 'madlibs', 'scavenger', 'photochallenge', 'memorylane', 'certificates', 'tags', 'scorecard', 'icebreaker', 'guess', 'phone'],
  defaults: ['know', 'predictions', 'scramble', 'pictionary', 'rather', 'trivia', 'truefalse', 'madlibs', 'certificates', 'scorecard', 'guess'],
  content: {
    know: [
      'What is {host}’s favorite Christmas tradition?',
      'What was the best gift {host} ever received as a kid?',
      'What is {host}’s favorite Christmas movie?',
      'Which Christmas song can {host} sing by heart?',
      'What is the first decoration {host} puts up each year?',
      'What is {host}’s favorite holiday treat?',
      'Has {host} ever peeked at a present early? (Be honest!)',
      'What is {host}’s dream Christmas destination?',
      'Real tree or artificial tree — where does {host} stand?',
      'What does {host} want for Christmas this year?'
    ],
    predictions: [
      'Next year, our family will celebrate Christmas by:',
      'The most-wanted gift under next year’s tree will be:',
      'Next Christmas, the weather will be:',
      'A new tradition our family should start next year:',
      'The first person to fall asleep after Christmas dinner next year:',
      'Next year’s tree will be decorated with:',
      'The funniest thing that will happen next Christmas:',
      'By next Christmas, I hope to have:'
    ],
    advice: [
      'The secret to stress-free holidays is:',
      'Best tip for wrapping gifts like a pro:',
      'How to survive holiday cooking without tears:',
      'A gift idea that never fails:',
      'The best way to spread Christmas cheer:',
      'My Christmas wish for everyone here:'
    ],
    trivia: [
      ['In "The Twelve Days of Christmas," how many gifts are given in total?', '364'],
      ['Which country started the tradition of putting up a Christmas tree?', 'Germany'],
      ['What are the names of Santa’s reindeer in the classic poem? (Name any four)', 'Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Donner, Blitzen'],
      ['In which decade did electric Christmas lights first become common in homes?', 'The 1920s–30s (invented 1882, popularized later)'],
      ['What is the best-selling Christmas song of all time?', '"White Christmas" by Bing Crosby'],
      ['How fast does Santa supposedly travel to deliver all gifts in one night?', 'About 650 miles per second (by playful estimates)'],
      ['Which US state grows the most Christmas trees?', 'Oregon'],
      ['What color were Santa’s suits before Coca-Cola’s ads popularized red?', 'Varied — green, blue and tan all appeared'],
      ['In "A Christmas Carol," what is Scrooge’s first name?', 'Ebenezer'],
      ['What plant’s berries are traditionally kissed under?', 'Mistletoe'],
      ['Which country donates the Christmas tree for Trafalgar Square in London each year?', 'Norway'],
      ['What is the most recorded Christmas song in history?', '"Silent Night" (over 700 versions)'],
      ['How many points does a snowflake traditionally have?', 'Six'],
      ['What was the first company to use Santa Claus in advertising?', 'White Rock Beverages (1915/1923 ads)'],
      ['In the movie "Home Alone," where is the family going on vacation?', 'Paris']
    ],
    scramble: ['SANTA', 'REINDEER', 'SNOWMAN', 'MISTLETOE', 'GARLAND', 'PRESENTS', 'CAROLS', 'CHIMNEY', 'JINGLE', 'GINGERBREAD', 'ORNAMENT', 'TWINKLE'],
    pictionary: [
      ['🎅🎁', 'Santa Delivering Gifts'],
      ['🦌🔴', 'Rudolph the Red-Nosed Reindeer'],
      ['⛄🥕', 'Building a Snowman'],
      ['🎄✨', 'Decorating the Tree'],
      ['🍪🥛', 'Cookies for Santa'],
      ['🎶🔔', 'Jingle Bells'],
      ['❄️🏠', 'Snowy Cottage'],
      ['🎁🎀', 'Wrapped Present'],
      ['🦌🛷', 'Santa’s Sleigh'],
      ['☕🍫', 'Hot Chocolate'],
      ['🧦🔥', 'Stockings by the Fire'],
      ['👼🎺', 'Angel with a Trumpet']
    ],
    rather: [
      ['Real tree', 'Artificial tree'],
      ['Open gifts Christmas Eve', 'Open gifts Christmas morning'],
      ['Snowy Christmas', 'Sunny Christmas'],
      ['Give gifts', 'Receive gifts'],
      ['Christmas movies all day', 'Christmas music all day'],
      ['Host the dinner', 'Be a guest'],
      ['Matching pajamas', 'Fancy outfits'],
      ['Big family gathering', 'Quiet cozy Christmas'],
      ['Bake cookies', 'Buy cookies'],
      ['White lights', 'Colored lights']
    ],
    thisorthat: [
      ['Eggnog', 'Hot chocolate'], ['Gingerbread', 'Sugar cookies'], ['Star topper', 'Angel topper'],
      ['Secret Santa', 'White elephant'], ['Caroling', 'Movie night'], ['Snowball fight', 'Sledding'],
      ['Fireplace', 'Candles'], ['Wrapping paper', 'Gift bags'], ['Christmas Eve', 'Christmas Day'],
      ['Naughty', 'Nice']
    ],
    overunder: [
      ['The song "White Christmas" has sold about 50 million copies — over or under 25 million?', 'Over — about 50 million'],
      ['Americans send about 1.3 billion Christmas cards a year — over or under 1 billion?', 'Over — about 1.3 billion'],
      ['The tallest cut Christmas tree ever was about 221 feet — over or under 150 feet?', 'Over — 221 feet (Seattle, 1950)'],
      ['Santa would need to visit about 800 homes per second — over or under 100?', 'Over — by playful estimates'],
      ['The average US household spends about $900 on Christmas — over or under $500?', 'Over — around $900'],
      ['"Jingle Bells" was written about 165 years ago — over or under 100?', 'Over — written in 1857'],
      ['Norway has sent London a tree for over 75 years — over or under 50?', 'Over — since 1947'],
      ['A snowflake has 6 sides — over or under 4?', 'Over — exactly 6']
    ],
    priceright: [
      ['Fresh-cut Christmas tree, 6 ft', '$79.99'],
      ['String of 100 LED lights', '$14.99'],
      ['Gingerbread house kit', '$12.49'],
      ['Advent calendar with chocolates', '$9.99'],
      ['Roll of wrapping paper', '$4.99'],
      ['Ugly Christmas sweater', '$29.95'],
      ['Poinsettia plant', '$12.99'],
      ['Box of 24 candy canes', '$6.49']
    ],
    truefalse: [
      ['"Jingle Bells" was originally written for Thanksgiving.', 'True'],
      ['Santa Claus is based on a real person.', 'True — St. Nicholas, a 4th-century bishop'],
      ['Christmas was once banned in England and parts of America.', 'True — in the 1600s'],
      ['Reindeer are all female in Santa’s team, by antler timing.', 'True — males shed antlers before winter'],
      ['The North Pole has a real workshop you can visit.', 'False'],
      ['Mistletoe is a parasitic plant.', 'True'],
      ['The first Christmas cards were sent in the 1500s.', 'False — 1843'],
      ['Candy canes were originally all white, without stripes.', 'True']
    ],
    finishphrase: [
      ['Deck the halls with boughs of _____', 'holly'],
      ['’Twas the night before _____', 'Christmas'],
      ['All I want for Christmas is _____', 'you (or: my two front teeth)'],
      ['Frosty the _____', 'Snowman'],
      ['Making a list, checking it _____', 'twice'],
      ['Joy to the _____', 'world'],
      ['Silent night, holy _____', 'night'],
      ['Rockin’ around the Christmas _____', 'tree']
    ],
    madlibs: {
      title: 'A Very Merry Mix-Up',
      story: 'On Christmas Eve, {host} hung [number] stockings by the chimney with care, hoping that a [adjective] visitor soon would be there. Suddenly, there came a sound like a [animal] playing the drums on the roof! Down the chimney came a jolly man with a belly like a bowl full of [food]. "Ho ho ho!" he laughed, pulling a [adjective] [noun] from his sack. "This is for the one who wished for a [noun] that can [verb]!" Everyone cheered, drank mugs of [drink], and agreed it was the most [adjective] Christmas ever — especially when the reindeer started to [verb] on the lawn.'
    },
    scavenger: [
      'Something red', 'Something that twinkles', 'A candy cane',
      'Something shaped like a star', 'A snowflake (real or decoration)',
      'Something that smells like cinnamon or pine', 'A bell',
      'Something wrapped', 'A photo of someone in a Santa hat',
      'Something gold', 'An ornament with an animal on it', 'Something cozy'
    ],
    photochallenge: [
      'Snap a selfie with {host} by the tree',
      'Capture the best-decorated cookie',
      'Photograph everyone in their holiday outfits',
      'Catch someone mid-carol',
      'Recreate a classic Christmas card pose',
      'Photograph the prettiest light display you can find',
      'Get a photo of the tallest and shortest guests together',
      'Capture the moment a gift is opened'
    ],
    memorylane: [
      'My favorite Christmas memory ever is:',
      'The best gift I ever received was:',
      'The funniest holiday disaster I remember:',
      'A Christmas tradition from my childhood:',
      'The Christmas I will never forget is the one when:',
      'My favorite holiday food memory:'
    ],
    awards: [
      ['Best Cookie Baker', 'For treats that vanished in record time'],
      ['Most Festive Outfit', 'For holiday spirit worn head to toe'],
      ['Caroling King or Queen', 'For the loudest, proudest singing'],
      ['Gift-Wrapping Master', 'For corners sharper than a tailor’s crease'],
      ['Christmas Trivia Champion', 'For knowing Santa’s secrets best'],
      ['Holiday MVP', 'For making this celebration sparkle']
    ],
    guess: { title: 'Guess How Many Ornaments on the Tree (Jar Edition)', unit: 'candies', note: 'Closest guess without going over wins the jar!' },
    phoneExtra: [['A Christmas photo as your wallpaper', 15], ['A holiday playlist saved', 10], ['A photo of a Christmas tree', 10]],
    iceExtra: ['What is the best Christmas gift you ever gave?', 'What is your favorite holiday movie scene?']
  }
});

/* ---------------- Thanksgiving ---------------- */
PTG_OCCASIONS.push({
  id: 'thanksgiving', name: 'Thanksgiving', emoji: '🦃',
  tagline: 'Games for gratitude, family & feasting',
  honoreeLabel: 'Host', defaultHonoree: 'the Host', defaultHonoree2: 'the Cook',
  saidBy: null,
  games: ['know', 'predictions', 'advice', 'scramble', 'pictionary', 'rather', 'thisorthat', 'overunder', 'priceright', 'trivia', 'truefalse', 'finishphrase', 'madlibs', 'scavenger', 'photochallenge', 'memorylane', 'certificates', 'tags', 'scorecard', 'icebreaker', 'guess', 'phone'],
  defaults: ['know', 'advice', 'scramble', 'pictionary', 'trivia', 'memorylane', 'certificates', 'scorecard', 'guess'],
  content: {
    know: [
      'What dish does {host} insist must be on the Thanksgiving table?',
      'What is {host} most thankful for this year?',
      'What is {host}’s secret to a perfect turkey (or main dish)?',
      'Which Thanksgiving food would {host} happily skip forever?',
      'What is {host}’s favorite Thanksgiving memory?',
      'Who does {host} say makes the best pie?',
      'What is the first thing {host} eats on the big day?',
      'What Thanksgiving tradition did {host} start?',
      'How early does {host} start planning the feast?',
      'What leftovers does {host} call dibs on?'
    ],
    predictions: [
      'Next year, I will be thankful for:',
      'Next Thanksgiving, our table will include:',
      'A new dish our family should try next year:',
      'Next year, the first person to go back for seconds will be:',
      'By next Thanksgiving, I hope to have:',
      'A tradition our family should start:',
      'Next year’s pie lineup should include:',
      'The best thing that will happen before next Thanksgiving:'
    ],
    advice: [
      'The secret to a stress-free Thanksgiving is:',
      'Best tip for perfect mashed potatoes:',
      'How to make room for dessert:',
      'A way to show gratitude every day:',
      'The best use of leftovers is:',
      'Something I am thankful for that money cannot buy:'
    ],
    trivia: [
      ['In what year was the first Thanksgiving feast held at Plymouth?', '1621'],
      ['How long did the first Thanksgiving celebration last?', 'Three days'],
      ['Which US president officially proclaimed Thanksgiving a national holiday?', 'Abraham Lincoln (1863)'],
      ['Roughly how many turkeys are eaten on Thanksgiving in the US each year?', 'About 46 million'],
      ['What is the average weight of a Thanksgiving turkey bought in the US?', 'About 15–16 pounds'],
      ['Which state raises the most turkeys in the US?', 'Minnesota'],
      ['What is the name of the famous department-store parade held every Thanksgiving morning?', 'The Macy’s Thanksgiving Day Parade'],
      ['In what year was the first Macy’s parade?', '1924'],
      ['What part of the turkey is the "wishbone"?', 'The forked bone between the neck and breast'],
      ['Which president received the first ceremonial turkey "pardon" as an annual tradition?', 'George H. W. Bush (1989)'],
      ['How many calories does the average Thanksgiving dinner contain?', 'About 3,000 (or more with seconds!)'],
      ['What sauce made from berries is a Thanksgiving staple?', 'Cranberry sauce'],
      ['Which Native American tribe celebrated the first Thanksgiving with the Pilgrims?', 'The Wampanoag'],
      ['What is a baby turkey called?', 'A poult'],
      ['Black Friday got its name from which city’s police slang?', 'Philadelphia']
    ],
    scramble: ['TURKEY', 'PUMPKIN', 'HARVEST', 'FAMILY', 'DINNER', 'GRAVY', 'MASHED', 'CRANBERRY', 'THANKFUL', 'FEAST', 'PILGRIM', 'LEFTOVERS'],
    pictionary: [
      ['🦃🍽️', 'Thanksgiving Dinner'],
      ['🥧🎃', 'Pumpkin Pie'],
      ['🍂🍁', 'Autumn Leaves'],
      ['👨‍👩‍👧‍👦❤️', 'Family Gathering'],
      ['🦃🏃', 'Runaway Turkey'],
      ['🌽🧈', 'Buttered Corn'],
      ['🥔🥣', 'Mashed Potatoes'],
      ['🏈📺', 'Football Game'],
      ['🙏❤️', 'Giving Thanks'],
      ['🍗🍴', 'Turkey Leg'],
      ['🎈🎉', 'Holiday Parade'],
      ['🥧🍎', 'Apple Pie']
    ],
    rather: [
      ['Turkey', 'Ham'],
      ['Pumpkin pie', 'Pecan pie'],
      ['Mashed potatoes', 'Sweet potatoes'],
      ['Cook the feast', 'Wash the dishes'],
      ['Watch football', 'Take a post-dinner walk'],
      ['Cranberry sauce from a can', 'Homemade cranberry sauce'],
      ['Sit at the kids’ table', 'Sit at the grown-ups’ table'],
      ['Seconds of dinner', 'Seconds of dessert'],
      ['Host Thanksgiving', 'Travel for Thanksgiving'],
      ['Nap after dinner', 'Games after dinner']
    ],
    thisorthat: [
      ['Dark meat', 'White meat'], ['Stuffing', 'Dressing'], ['Gravy on everything', 'Gravy on the side'],
      ['Pie with ice cream', 'Pie with whipped cream'], ['Early dinner', 'Late dinner'],
      ['Football', 'Parade'], ['Cooking', 'Baking'], ['Stretchy pants', 'Fancy outfit'],
      ['Leftovers sandwich', 'Leftovers soup'], ['Gratitude toast', 'Silent thanks']
    ],
    overunder: [
      ['About 46 million turkeys are eaten at Thanksgiving — over or under 30 million?', 'Over — about 46 million'],
      ['The average Thanksgiving dinner runs about 3,000 calories — over or under 2,000?', 'Over — about 3,000'],
      ['The first Macy’s parade was in 1924 — over or under 100 years ago?', 'Over — 100+ years'],
      ['A typical Thanksgiving turkey weighs about 16 pounds — over or under 10?', 'Over — 15 to 16 pounds'],
      ['The first Thanksgiving lasted 3 days — over or under 1?', 'Over — three days'],
      ['Americans eat about 80 million pounds of cranberries at Thanksgiving — over or under 50 million?', 'Over — about 80 million'],
      ['The average host cooks for about 10 guests — over or under 5?', 'Over — about 10'],
      ['A turkey can run about 20 mph — over or under 10 mph?', 'Over — up to 20 mph']
    ],
    priceright: [
      ['Whole frozen turkey, 14 lb', '$21.00'],
      ['Pumpkin pie, bakery 9-inch', '$8.99'],
      ['Canned cranberry sauce', '$1.79'],
      ['Fresh sweet potatoes, 3 lb bag', '$3.49'],
      ['Box of stuffing mix', '$2.29'],
      ['Bag of russet potatoes, 10 lb', '$5.99'],
      ['Whipped topping tub', '$1.99'],
      ['Bag of fresh cranberries', '$2.49']
    ],
    truefalse: [
      ['The first Thanksgiving lasted three days.', 'True'],
      ['Benjamin Franklin wanted the turkey to be the US national bird.', 'True — he praised it in a letter (though the "national bird" story is simplified)'],
      ['Turkeys can fly.', 'True — wild turkeys can fly short distances'],
      ['The Pilgrims wore black-and-white outfits with big buckles, as often pictured.', 'False — that look is largely a later invention'],
      ['Thanksgiving is always the last Thursday of November.', 'False — it is the fourth Thursday'],
      ['A group of turkeys is called a rafter.', 'True'],
      ['Canned cranberry sauce was invented in the 1800s.', 'False — it arrived in the 1940s'],
      ['The president’s turkey pardon means the turkey is eaten later.', 'False — pardoned turkeys live out their days on farms or campuses']
    ],
    finishphrase: [
      ['Gobble till you _____', 'wobble'],
      ['Give _____', 'thanks'],
      ['Home is where the _____ is', 'heart'],
      ['Count your _____', 'blessings'],
      ['Feast your _____ on this', 'eyes'],
      ['Too blessed to be _____', 'stressed'],
      ['Grateful, thankful, truly _____', 'blessed'],
      ['Save room for _____', 'dessert']
    ],
    madlibs: {
      title: 'The Great Thanksgiving Feast',
      story: 'This year, {host} decided to cook the most [adjective] Thanksgiving feast ever. The turkey was so big it barely fit in the [piece of furniture]. "First, I will stuff it with [plural noun] and a sprinkle of [spice]," said {host}, wearing a [adjective] apron. When the family arrived, Uncle brought a pie made of [food], and Grandma carried a bowl of mashed [plural noun]. During dinner, everyone shared what they were thankful for: health, family, and a working [noun]. Then the dog stole a [food] off the table and ran [number] laps around the house. It was, without question, the most [adjective] Thanksgiving ever.'
    },
    scavenger: [
      'Something orange', 'A leaf in the shape of a heart',
      'Something that smells like cinnamon', 'A photo of the whole table',
      'Something made of pumpkin', 'A wishbone or a picture of one',
      'Something cozy', 'The oldest recipe you can find',
      'Something golden', 'A handwritten note of thanks',
      'Something that reminds you of fall', 'A photo of someone laughing'
    ],
    photochallenge: [
      'Snap a photo of the full table before anyone sits down',
      'Capture the carving of the turkey (or main dish)',
      'Photograph the prettiest plate',
      'Catch someone sneaking a taste in the kitchen',
      'Get three generations in one photo',
      'Photograph your plate — before and after',
      'Capture a moment of gratitude around the table',
      'Take a photo of the pie lineup'
    ],
    memorylane: [
      'My favorite Thanksgiving memory is:',
      'The funniest kitchen disaster I remember:',
      'A dish from childhood I still dream about:',
      'The Thanksgiving I will never forget is when:',
      'Something a grandparent taught me about gratitude:',
      'My favorite seat at the Thanksgiving table was:'
    ],
    awards: [
      ['Master Chef', 'For a feast worth remembering'],
      ['Pie Perfectionist', 'For the dessert everyone fought over'],
      ['Gratitude Champion', 'For the most heartfelt toast'],
      ['Leftovers Legend', 'For the most creative next-day plate'],
      ['Trivia Turkey', 'For gobbling up the most correct answers'],
      ['Holiday MVP', 'For making this gathering special']
    ],
    guess: { title: 'Guess How Many Candies in the Cornucopia Jar', unit: 'candies', note: 'Closest guess without going over wins the jar!' },
    phoneExtra: [['A photo of your plate today', 10], ['A family photo from a past Thanksgiving', 15], ['A recipe saved on your phone', 10]],
    iceExtra: ['What small thing are you most thankful for this year?', 'What family tradition do you hope never ends?']
  }
});

/* ---------------- Graduation ---------------- */
PTG_OCCASIONS.push({
  id: 'graduation', name: 'Graduation', emoji: '🎓',
  tagline: 'Games for celebrating the new graduate',
  honoreeLabel: 'Graduate', defaultHonoree: 'the Graduate', defaultHonoree2: 'the Host',
  saidBy: null,
  games: ['know', 'predictions', 'advice', 'scramble', 'pictionary', 'rather', 'thisorthat', 'overunder', 'priceright', 'trivia', 'truefalse', 'finishphrase', 'madlibs', 'scavenger', 'photochallenge', 'memorylane', 'certificates', 'tags', 'scorecard', 'icebreaker', 'guess', 'phone'],
  defaults: ['know', 'predictions', 'advice', 'scramble', 'pictionary', 'trivia', 'memorylane', 'certificates', 'scorecard', 'guess'],
  content: {
    know: [
      'What is {honoree}’s favorite subject of all time?',
      'What was {honoree}’s most embarrassing school moment?',
      'Who was {honoree}’s favorite teacher ever?',
      'What is {honoree}’s dream job right now?',
      'How many all-nighters did {honoree} pull this year (honest answer)?',
      'What is {honoree}’s go-to cafeteria food?',
      'What club or team is {honoree} proudest of joining?',
      'What song will always remind {honoree} of this school year?',
      'What is {honoree} most excited about after graduation?',
      'What will {honoree} miss most about school?'
    ],
    predictions: [
      'In 5 years, {honoree} will be:',
      'The graduate’s first job will be:',
      '{honoree} will live in (place):',
      'The graduate’s biggest adventure this year will be:',
      'In 10 years, {honoree} will be famous for:',
      'A skill {honoree} will master next:',
      'The graduate will visit this country first:',
      'By the next reunion, {honoree} will have:'
    ],
    advice: [
      'The best advice I got after graduating:',
      'Something I wish I had known at {honoree}’s age:',
      'A money rule for your first paycheck:',
      'How to make friends in a new place:',
      'A mistake worth making (and learning from):',
      'Words to remember when things get hard:'
    ],
    trivia: [
      ['What does the Latin phrase on many diplomas, "summa cum laude," mean?', 'With highest praise/honor'],
      ['In what year was the first known graduation ceremony held (University of Bologna era)?', 'The 12th–13th century — degrees began around 1088+'],
      ['Why do graduates throw their caps in the air?', 'A tradition traced to the US Naval Academy in 1912'],
      ['What is a "valedictorian"?', 'The top-ranked student who delivers the farewell speech'],
      ['The tassel is traditionally moved from which side to which at graduation (US)?', 'Right to left'],
      ['What does "alumni" mean in Latin?', 'Foster children / nourished ones (from alere, to nourish)'],
      ['Which country has the world’s oldest university still operating?', 'Morocco — University of al-Qarawiyyin (founded 859)'],
      ['What is the song "Pomp and Circumstance" also known as at graduations?', 'The traditional processional march (Elgar, 1901)'],
      ['How long does the average bachelor’s degree take in the US?', 'About 4 to 5 years (average closer to 5 for many students)'],
      ['What color tassel usually represents business degrees (US)?', 'Drab (a beige/tan shade)'],
      ['What is a "gap year"?', 'A year between school stages spent traveling, working or volunteering'],
      ['Which Ivy League school is the oldest in the US?', 'Harvard (1636)'],
      ['What does GPA stand for?', 'Grade Point Average'],
      ['In the UK, graduation ceremonies are often held in which grand venues?', 'Cathedrals, guildhalls and university great halls'],
      ['What is the traditional gift flower for graduations in Hawaii?', 'Leis (flower garlands)']
    ],
    scramble: ['GRADUATE', 'DIPLOMA', 'CAP', 'TASSEL', 'FUTURE', 'DREAMS', 'SUCCESS', 'JOURNEY', 'CLASS', 'HONORS', 'CAMPUS', 'PROUD'],
    pictionary: [
      ['🎓🎉', 'Graduation Day'],
      ['🎓💨', 'Cap Toss'],
      ['📜🎓', 'Diploma'],
      ['📚🌙', 'All-Night Study'],
      ['🏆🎓', 'Top of the Class'],
      ['✈️🌍', 'World Traveler'],
      ['💼🌟', 'Dream Job'],
      ['🎓📸', 'Graduation Photo'],
      ['🔑🏠', 'First Apartment'],
      ['🚗💨', 'Road Trip'],
      ['🎤🎓', 'Graduation Speech'],
      ['🌅🎓', 'Bright Future']
    ],
    rather: [
      ['Travel the world first', 'Start the dream job first'],
      ['Big graduation party', 'Graduation trip'],
      ['Frame the diploma', 'Keep it in a drawer of memories'],
      ['Move to a new city', 'Stay close to home'],
      ['More school (grad degree)', 'Done with classrooms'],
      ['Save the first paycheck', 'Celebrate with the first paycheck'],
      ['Keep every textbook', 'Sell them all back'],
      ['Early mornings', 'Night-owl schedule'],
      ['Handwritten thank-you notes', 'Group thank-you text'],
      ['Class reunion in 10 years', 'Skip reunions forever']
    ],
    thisorthat: [
      ['Front row seat', 'Aisle seat'], ['Cap and gown', 'Suit and tie'],
      ['Speech', 'Song'], ['Photos', 'Video'], ['Cake', 'Cupcakes'],
      ['Money gift', 'Thoughtful gift'], ['Big school', 'Small school'],
      ['Morning person', 'Night owl'], ['Library', 'Cafeteria'],
      ['Dream job', 'Dream city']
    ],
    overunder: [
      ['Harvard was founded in 1636 — over or under 400 years ago?', 'Under — about 390 years (as of 2026)'],
      ['The average bachelor’s degree takes about 5 years for many students — over or under 4?', 'Over — closer to 5 for many'],
      ['About 4 million students graduate US high schools yearly — over or under 2 million?', 'Over — about 3.5 to 4 million'],
      ['The cap toss tradition is about 110 years old — over or under 50?', 'Over — since 1912'],
      ['A graduate will change careers about 5 times in a lifetime (common estimate) — over or under 2?', 'Over — several changes are typical'],
      ['The world’s oldest university opened in 859 — over or under 1,000 years ago?', 'Over — more than 1,100 years'],
      ['The average graduation party hosts about 20 guests — over or under 10?', 'Over — about 20'],
      ['Graduation season peaks in May and June — over or under 2 months?', 'Under — about 2 months']
    ],
    priceright: [
      ['Cap and gown set', '$39.99'],
      ['Diploma frame', '$24.95'],
      ['Box of 25 thank-you notes', '$12.99'],
      ['Leather-bound journal', '$19.95'],
      ['"Oh, the Places You’ll Go!" book', '$18.99'],
      ['Balloon bouquet, 6 balloons', '$29.99'],
      ['Class ring (basic)', '$199.00'],
      ['Photo print, 8×10 framed', '$15.49']
    ],
    truefalse: [
      ['The cap-and-gown tradition comes from medieval universities.', 'True'],
      ['Graduates have always thrown their caps in the air.', 'False — the toss dates to 1912'],
      ['"Pomp and Circumstance" was written for a graduation.', 'False — Elgar composed it in 1901; Yale later used it at a ceremony'],
      ['The tassel color can represent the field of study.', 'True'],
      ['Harvard is the oldest university in the world.', 'False — al-Qarawiyyin (859) and Bologna (1088) are older'],
      ['A valedictorian is chosen by student vote.', 'False — it is by academic rank'],
      ['Diplomas were once made of sheepskin.', 'True — hence the nickname "sheepskin"'],
      ['Every country holds graduations in May.', 'False — dates vary worldwide']
    ],
    finishphrase: [
      ['The future belongs to those who believe in the beauty of their _____', 'dreams'],
      ['Oh, the places you’ll _____', 'go'],
      ['Shoot for the moon — even if you miss, you’ll land among the _____', 'stars'],
      ['Education is the most powerful _____', 'weapon (per Nelson Mandela)'],
      ['Once a student, always a _____', 'learner'],
      ['Class of _____ (fill in the year!)', 'this year'],
      ['The tassel was worth the _____', 'hassle'],
      ['And so the adventure _____', 'begins']
    ],
    madlibs: {
      title: 'The Graduation Day Story',
      story: 'On graduation morning, {honoree} woke up feeling [adjective] and put on a cap, a gown, and a pair of lucky [plural noun]. At the ceremony, the principal announced, "This class has achieved [number] amazing things, including the time they [past-tense verb] in the [place]." When {honoree}’s name was called, the crowd cheered louder than a [animal] at a rock concert. Holding the diploma high, {honoree} shouted, "Next stop: [place] — I am going to become the world’s greatest [profession]!" Everyone agreed the future looked [adjective] indeed.'
    },
    scavenger: [
      'A photo of {honoree} in cap and gown', 'Something in the school colors',
      'A tassel or a picture of one', 'Something that says the graduation year',
      'A diploma (or a drawing of one)', 'Something gold',
      'A photo of the proudest family member', 'Something that represents a dream job',
      'A book', 'Something that makes a happy noise',
      'A flower or lei', 'A photo of someone throwing a cap (safely!)'
    ],
    photochallenge: [
      'Snap the classic cap-toss photo',
      'Capture {honoree} holding the diploma high',
      'Photograph the graduate with their favorite teacher or mentor',
      'Get a photo of the whole cheering section',
      'Recreate a first-day-of-school photo',
      'Photograph the graduate’s happiest jump',
      'Capture a proud family moment',
      'Take a photo that belongs on next year’s holiday card'
    ],
    memorylane: [
      'My favorite memory of {honoree} at school is:',
      'I knew {honoree} would go far when:',
      'The funniest school story about {honoree}:',
      'A teacher or friend who changed {honoree}’s life:',
      'The moment I was proudest of {honoree}:',
      'Something {honoree} said as a kid that came true:'
    ],
    awards: [
      ['Most Likely to Succeed', 'For ambition that cannot be contained'],
      ['Best Comeback Story', 'For turning setbacks into stepping stones'],
      ['Class Clown Laureate', 'For making even the tough days fun'],
      ['Future CEO Award', 'For leadership spotted early'],
      ['Most Inspiring Graduate', 'For lifting everyone around them'],
      ['Proud Family Award', 'For the loudest cheer in the crowd']
    ],
    guess: { title: 'Guess How Many Candies in the Graduation Jar', unit: 'candies', note: 'Closest guess without going over wins the jar!' },
    phoneExtra: [['A graduation photo already taken today', 20], ['The ceremony program saved or photographed', 10], ['A school song in your library', 10]],
    iceExtra: ['What was your dream job when you were ten?', 'What advice would you give your younger self?']
  }
});

/* ---------------- Family Reunion ---------------- */
PTG_OCCASIONS.push({
  id: 'reunion', name: 'Family Reunion', emoji: '👨‍👩‍👧‍👦',
  tagline: 'Games for the whole clan, all ages',
  honoreeLabel: 'Host Family', defaultHonoree: 'our Family', defaultHonoree2: 'the Host',
  saidBy: null,
  games: ['know', 'predictions', 'advice', 'scramble', 'pictionary', 'rather', 'thisorthat', 'overunder', 'priceright', 'trivia', 'truefalse', 'finishphrase', 'madlibs', 'scavenger', 'photochallenge', 'memorylane', 'certificates', 'tags', 'scorecard', 'icebreaker', 'guess', 'phone'],
  defaults: ['know', 'advice', 'scramble', 'pictionary', 'trivia', 'memorylane', 'scavenger', 'certificates', 'scorecard'],
  content: {
    know: [
      'Who in the family traveled the farthest to be here?',
      'Who is the oldest person at this reunion? The youngest?',
      'Which family member is famous for their cooking?',
      'Who tells the best family stories?',
      'Which two family members look the most alike?',
      'Who in the family has the most grandchildren?',
      'Who is most likely to start the dance floor?',
      'Which family member knows everyone’s birthday by heart?',
      'Who has lived in the most different places?',
      'Who is the family’s reigning game champion?'
    ],
    predictions: [
      'At the next reunion, our family will:',
      'The next baby born into the family will be named:',
      'The next wedding in the family will be (who):',
      'By next reunion, the family will have visited:',
      'The family dish that will still be served in 50 years:',
      'A new tradition our family should start:',
      'The next family member to move somewhere new:',
      'At the next reunion, the oldest attendee will be:'
    ],
    advice: [
      'The best family advice I ever got from an elder:',
      'A recipe or skill the next generation must learn:',
      'How to keep family close across the miles:',
      'Something every family gathering needs:',
      'A lesson our family passes down:',
      'Words for the youngest generation:'
    ],
    trivia: [
      ['What is the average size of an American family reunion?', 'About 50 to 70 guests'],
      ['Which month hosts the most family reunions in the US?', 'July'],
      ['The word "family" comes from which language?', 'Latin (familia)'],
      ['Roughly how many generations are in a century?', 'About 4 to 5'],
      ['What is the study of family history called?', 'Genealogy'],
      ['How many second cousins does the average person have (rough estimate)?', 'Dozens — often estimated around 100+'],
      ['Which US state hosts the largest single-family reunion record attempts most often?', 'West Virginia is famous for huge reunions'],
      ['What is a "family crest" traditionally used for?', 'Identifying a family’s heritage and history'],
      ['The world’s largest family reunion (Guinness-listed gatherings) drew about how many people?', 'About 4,800+ (Lilly family and others)'],
      ['What percentage of Americans say they attend a family reunion at least every few years?', 'About 40%+ in surveys'],
      ['In genealogy, your mother’s sister’s child is your what?', 'First cousin'],
      ['How far back does the average family tree research typically go?', 'About 4 to 6 generations'],
      ['What is the term for a reunion of a military unit or school class vs family?', 'A reunion is general — family reunions focus on kin'],
      ['Which decade saw family reunions boom with affordable car travel in the US?', 'The 1950s'],
      ['A "clan" originally referred to families from which region?', 'Scotland and Ireland (Gaelic clann = children/descendants)']
    ],
    scramble: ['FAMILY', 'REUNION', 'COUSINS', 'GRANDMA', 'PICNIC', 'STORIES', 'PHOTOS', 'LAUGHTER', 'HUGS', 'ROOTS', 'TOGETHER', 'MEMORIES'],
    pictionary: [
      ['👨‍👩‍👧‍👦📸', 'Family Photo'],
      ['🌳👪', 'Family Tree'],
      ['🧺🌞', 'Family Picnic'],
      ['👵❤️', 'Grandma’s Hug'],
      ['🏆🎲', 'Game Champion'],
      ['🍗🔥', 'Family Barbecue'],
      ['📖👴', 'Grandpa’s Stories'],
      ['🎶💃', 'Dance Party'],
      ['🚗🗺️', 'Family Road Trip'],
      ['🏠❤️', 'Home Sweet Home'],
      ['👶👵', 'Youngest Meets Oldest'],
      ['🎂👨‍👩‍👧‍👦', 'Family Celebration']
    ],
    rather: [
      ['Huge reunion every year', 'Small reunion every few years'],
      ['Picnic in the park', 'Banquet hall dinner'],
      ['Family talent show', 'Family trivia night'],
      ['Matching family t-shirts', 'Everyone in their own style'],
      ['Old photo slideshow', 'New photo booth'],
      ['Cook together', 'Cater it all'],
      ['Games tournament', 'Storytelling circle'],
      ['Same place every year', 'New place each time'],
      ['Big group photo', 'Lots of candid photos'],
      ['Stay up late reminiscing', 'Early night, big breakfast']
    ],
    thisorthat: [
      ['Barbecue', 'Potluck'], ['Outdoor games', 'Card games'], ['Old photos', 'New photos'],
      ['Sweet tea', 'Lemonade'], ['Camping', 'Hotel'], ['Summer reunion', 'Holiday reunion'],
      ['Talent show', 'Karaoke'], ['Family shirts', 'Name tags'], ['Stories', 'Jokes'],
      ['Hugs', 'High fives']
    ],
    overunder: [
      ['The average reunion draws about 60 guests — over or under 40?', 'Over — about 50 to 70'],
      ['A century holds about 4 to 5 generations — over or under 3?', 'Over — 4 to 5'],
      ['The largest family reunions draw thousands — over or under 1,000?', 'Over — 4,800+ recorded'],
      ['Most reunions happen in July — over or under 6 months into the year?', 'Over — July is month 7'],
      ['The average person has dozens of second cousins — over or under 10?', 'Over — dozens'],
      ['Family reunions boomed in the 1950s — over or under 75 years ago?', 'Under — about 70 years (as of 2026)'],
      ['A family tree typically traces 5 generations — over or under 2?', 'Over — 4 to 6'],
      ['About 40% of Americans attend reunions regularly — over or under 25%?', 'Over — about 40%']
    ],
    priceright: [
      ['Disposable tablecloth, party pack', '$8.99'],
      ['Bag of charcoal, 15 lb', '$11.49'],
      ['Cooler, 48-quart', '$34.99'],
      ['Paper plates, 200-pack', '$16.95'],
      ['Family reunion t-shirt (custom)', '$14.99'],
      ['Outdoor game set (cornhole)', '$89.99'],
      ['Photo printing, 100 prints', '$12.00'],
      ['Name tag stickers, 100-pack', '$7.49']
    ],
    truefalse: [
      ['The word "cousin" comes from a Latin word meaning "mother’s sister’s child."', 'True (consobrinus)'],
      ['Everyone has exactly 4 grandparents and 8 great-grandparents.', 'False — pedigree collapse means trees can overlap'],
      ['Family reunions only became popular after the internet.', 'False — they boomed in the 1950s'],
      ['Genealogy is one of the most popular hobbies in the US.', 'True'],
      ['Your second cousin is your cousin’s child.', 'False — that is a first cousin once removed'],
      ['A family crest and a coat of arms are exactly the same thing.', 'False — arms belong to individuals/families by grant; crests sit atop them'],
      ['Identical twins share 100% of their DNA (nearly).', 'True — nearly identical'],
      ['The Lilly family reunion is among the largest in the US.', 'True']
    ],
    finishphrase: [
      ['Family is not an important thing — it is _____', 'everything'],
      ['Blood is thicker than _____', 'water'],
      ['Home is where your _____ is', 'heart (or: family)'],
      ['The apple doesn’t fall far from the _____', 'tree'],
      ['It runs in the _____', 'family'],
      ['Like father, like _____', 'son'],
      ['Charity begins at _____', 'home'],
      ['Reunions: where life begins and love never _____', 'ends']
    ],
    madlibs: {
      title: 'The Great Family Reunion',
      story: 'Every year, the whole family gathers at [place] for the reunion. This year, [number] relatives showed up, including Great-Aunt, who brought her famous [adjective] casserole made with secret [plural noun]. Grandpa told the story — for the [number]th time — about how he once [past-tense verb] all the way to [place] wearing only a [piece of clothing]. The cousins held a tournament of [game], and the trophy went to the youngest player, who celebrated by eating [number] servings of [dessert]. As the sun set, everyone agreed: family is the people who will always save you a seat, a plate of [food], and a lifetime supply of [plural noun].'
    },
    scavenger: [
      'A photo with the oldest relative', 'A photo with the youngest relative',
      'Something handmade by a family member', 'A family recipe card',
      'Something older than 50 years', 'Two relatives who look alike — photo proof',
      'Something in the family colors', 'A story written down in one sentence',
      'A photo of three generations together', 'Something that represents your hometown',
      'A relative’s signature', 'Something sweet to share'
    ],
    photochallenge: [
      'Take the biggest group photo you can organize',
      'Capture three (or four!) generations in one frame',
      'Recreate an old family photo',
      'Photograph the family chef in action',
      'Catch two relatives mid-laugh',
      'Get a photo of the longest-traveled guest',
      'Photograph everyone with the same last name initial pose',
      'Capture the sunset group shot'
    ],
    memorylane: [
      'My favorite family memory of all time is:',
      'The funniest thing that ever happened at a family gathering:',
      'Something a grandparent or elder taught me:',
      'The family story I never get tired of hearing:',
      'A place our family loves and why:',
      'The relative who shaped who I am, and how:'
    ],
    awards: [
      ['Traveled the Farthest', 'For crossing miles to be with family'],
      ['Family Historian', 'For keeping our stories alive'],
      ['Master of the Grill', 'For feeding the whole clan'],
      ['Best Storyteller', 'For tales that never get old'],
      ['Newest Member Welcome', 'For joining the family fun'],
      ['Reunion MVP', 'For making this gathering happen']
    ],
    guess: { title: 'Guess How Many Candies in the Family Jar', unit: 'candies', note: 'Closest guess without going over wins the jar!' },
    phoneExtra: [['A family photo from years ago', 20], ['A relative’s number saved with a funny nickname', 10], ['A photo of today’s reunion already', 15]],
    iceExtra: ['What family tradition do you hope lasts forever?', 'Which relative would you most want on your trivia team?']
  }
});

/* ---------------- Valentine's / Galentine's ---------------- */
PTG_OCCASIONS.push({
  id: 'valentine', name: 'Valentine’s / Galentine’s', emoji: '💘',
  tagline: 'Games for sweethearts, couples & best friends',
  honoreeLabel: 'Guest of Honor', defaultHonoree: 'the Guest of Honor', defaultHonoree2: 'their Sweetheart',
  saidBy: ['Partner A', 'Partner B'],
  games: ['know', 'whosaid', 'predictions', 'advice', 'scramble', 'pictionary', 'rather', 'thisorthat', 'overunder', 'priceright', 'trivia', 'truefalse', 'finishphrase', 'madlibs', 'scavenger', 'photochallenge', 'memorylane', 'certificates', 'tags', 'scorecard', 'icebreaker', 'guess', 'phone', 'purse'],
  defaults: ['know', 'whosaid', 'advice', 'scramble', 'pictionary', 'rather', 'trivia', 'madlibs', 'certificates', 'scorecard', 'guess'],
  content: {
    know: [
      'Where was {honoree}’s best date ever?',
      'What is {honoree}’s love language?',
      'What romantic movie can {honoree} watch on repeat?',
      'What is {honoree}’s idea of a perfect evening?',
      'Who was {honoree}’s first crush?',
      'What song does {honoree} call "our song" material?',
      'What is the sweetest thing anyone has done for {honoree}?',
      'Chocolate or flowers — where does {honoree} stand?',
      'What is {honoree}’s favorite thing about {honoree2}?',
      'What would {honoree} plan for a dream Valentine’s Day?'
    ],
    whosaid: [
      ['I believe in love at first sight', 'Partner A'],
      ['I plan dates like military operations', 'Partner B'],
      ['I cried at a rom-com last week', 'Partner A'],
      ['I show love by fixing things', 'Partner B'],
      ['I remember every anniversary without reminders', 'Partner A'],
      ['I steal the blankets every night', 'Partner B'],
      ['I wrote a poem once and never showed anyone', 'Partner A'],
      ['I would share my last bite of dessert', 'Partner B']
    ],
    predictions: [
      'This year, love will surprise {honoree} by:',
      'The most romantic moment of the year ahead will be:',
      'A trip the couple (or besties) should take this year:',
      'By next Valentine’s Day, {honoree} will have:',
      'The sweetest tradition to start this year:',
      'A goal for love and friendship this year:',
      'Who will plan the most romantic surprise?',
      'This time next year, we will all be celebrating:'
    ],
    advice: [
      'The secret to a lasting relationship is:',
      'Best first-date advice ever:',
      'How to say "I’m sorry" and mean it:',
      'A small gesture that means the world:',
      'What every friendship needs to thrive:',
      'My wish for {honoree}’s heart this year:'
    ],
    trivia: [
      ['On which date is Galentine’s Day celebrated?', 'February 13'],
      ['Which TV show invented Galentine’s Day?', 'Parks and Recreation (2010 episode)'],
      ['Roughly how many Valentine’s cards are exchanged each year worldwide?', 'About 1 billion'],
      ['Which country calls Valentine’s Day "Friend’s Day" (Ystävänpäivä)?', 'Finland'],
      ['Cupid is the Roman version of which Greek god?', 'Eros'],
      ['Which organ has symbolized love across cultures for centuries?', 'The heart'],
      ['About how much do Americans spend on Valentine’s Day in total (recent years)?', 'Around $25–26 billion'],
      ['Which candy has classic sayings printed on it for Valentine’s?', 'Conversation hearts (Sweethearts)'],
      ['In Victorian times, what did the way a fan was held secretly communicate?', 'Flirtation messages (the "language of the fan")'],
      ['What percentage of Valentine’s flowers are bought by men (US, approx.)?', 'About 70%+ in many surveys'],
      ['Which bird is a classic symbol of love and fidelity?', 'The dove'],
      ['Saint Valentine was from which country?', 'Italy (Roman Empire)'],
      ['What is the most popular Valentine’s gift in the US by spending?', 'Jewelry (by dollars); candy by number of givers'],
      ['In Japan, who traditionally gives chocolate on Valentine’s Day?', 'Women (men reciprocate on White Day, March 14)'],
      ['How many roses are typically grown for Valentine’s Day each year?', 'About 250 million roses']
    ],
    scramble: ['HEART', 'CUPID', 'ROSES', 'CANDY', 'KISSES', 'LOVE', 'SWEETHEART', 'ARROW', 'DINNER', 'FLOWERS', 'ROMANCE', 'VALENTINE'],
    pictionary: [
      ['💘🏹', 'Cupid’s Arrow'],
      ['🌹🍫', 'Roses and Chocolate'],
      ['💌❤️', 'Love Letter'],
      ['🕯️🍽️', 'Candlelit Dinner'],
      ['💑🌙', 'Romantic Evening'],
      ['🎁💐', 'Bouquet Surprise'],
      ['💍❤️', 'True Love'],
      ['🍬💬', 'Conversation Hearts'],
      ['👩‍❤️‍👩🎉', 'Galentine’s Party'],
      ['💃🕺', 'Slow Dance'],
      ['🧸💝', 'Teddy Bear Gift'],
      ['🌹💋', 'Rose Kiss']
    ],
    rather: [
      ['Fancy dinner out', 'Cozy homemade dinner'],
      ['Roses', 'Wildflowers'],
      ['Chocolate truffles', 'Candy hearts'],
      ['Romantic comedy', 'Love-story drama'],
      ['Handwritten love note', 'Surprise gift'],
      ['Couples’ night', 'Galentine’s night with friends'],
      ['Slow dance in the kitchen', 'Night out dancing'],
      ['Breakfast in bed', 'Dessert date'],
      ['Matching outfits', 'Coordinated colors only'],
      ['Big romantic gesture', 'Small daily kindnesses']
    ],
    thisorthat: [
      ['Red roses', 'Pink roses'], ['Dark chocolate', 'Milk chocolate'], ['Love letter', 'Love song'],
      ['Candlelight', 'Fairy lights'], ['Sweet', 'Spicy'], ['Hugs', 'Kisses'],
      ['Old romance movie', 'New romance movie'], ['Heart-shaped everything', 'Classic and simple'],
      ['Date night out', 'Date night in'], ['Flowers', 'Chocolates']
    ],
    overunder: [
      ['About 1 billion Valentine’s cards are exchanged yearly — over or under 500 million?', 'Over — about 1 billion'],
      ['Americans spend about $26 billion on Valentine’s Day — over or under $10 billion?', 'Over — around $25–26 billion'],
      ['About 250 million roses are grown for the day — over or under 100 million?', 'Over — about 250 million'],
      ['Galentine’s Day falls on Feb 13 — over or under a week before Valentine’s?', 'Under — just 1 day before'],
      ['Conversation hearts carry about 10 billion candies a year in peak production — over or under 1 billion?', 'Over — billions produced'],
      ['About 6 million couples get engaged on Valentine’s Day (US estimates) — over or under 1 million?', 'Over — millions of proposals'],
      ['The oldest known valentine poem dates to 1415 — over or under 600 years ago?', 'Over — 600+ years'],
      ['Jewelry leads Valentine’s spending — over or under $1 billion?', 'Over — several billion dollars']
    ],
    priceright: [
      ['Dozen red roses, florist', '$59.99'],
      ['Box of 24 chocolate truffles', '$34.95'],
      ['Heart-shaped balloon', '$6.99'],
      ['Scented candle, large', '$24.50'],
      ['Valentine’s card, premium', '$7.50'],
      ['Bag of conversation hearts', '$3.29'],
      ['Teddy bear, medium plush', '$19.99'],
      ['Bottle of sparkling rosé', '$16.99']
    ],
    truefalse: [
      ['Galentine’s Day was invented by a television show.', 'True — Parks and Recreation'],
      ['In Finland, Valentine’s Day celebrates friendship more than romance.', 'True'],
      ['Cupid’s Greek name is Apollo.', 'False — it is Eros'],
      ['The oldest surviving valentine was written from a prison cell.', 'True — Charles, Duke of Orléans, 1415'],
      ['Chocolate has always been the classic Valentine’s gift.', 'False — flowers and cards came first; chocolate grew in the 1800s'],
      ['In Japan, men give the chocolate on Valentine’s Day.', 'False — women give; men reciprocate on White Day'],
      ['Red roses symbolize love partly because of the goddess Venus.', 'True'],
      ['Valentine’s Day is a public holiday in the US.', 'False']
    ],
    finishphrase: [
      ['Love is in the _____', 'air'],
      ['Be _____ (the classic valentine ask)', 'mine'],
      ['Roses are red, violets are _____', 'blue'],
      ['You had me at _____', 'hello'],
      ['All you need is _____', 'love'],
      ['Crazy little thing called _____', 'love'],
      ['Love makes the world go _____', 'round'],
      ['Home is where the _____ is', 'heart']
    ],
    madlibs: {
      title: 'A Most Romantic Evening',
      story: 'It began when {honoree} received a mysterious note that said, "Meet me at the [place] at [number] o’clock — wear something [adjective]." There, waiting with a bouquet of [plural noun], was {honoree2}, smiling like a [animal] in the moonlight. They shared a dinner of [food] and sparkling [drink], then danced to a song about [plural noun]. "You are more wonderful than a [noun] on a [adjective] day," whispered {honoree2}. And as the stars began to [verb], both of them knew: this was the most [adjective] Valentine’s ever.'
    },
    scavenger: [
      'Something heart-shaped', 'Something red', 'Something pink',
      'A love note or sweet message', 'Something that smells like roses',
      'A photo of two people holding hands', 'Something sparkly',
      'A chocolate wrapper (evidence of joy)', 'Something with the word "love" on it',
      'A candle', 'Something shaped like an arrow', 'A photo of someone blowing a kiss'
    ],
    photochallenge: [
      'Snap a selfie with {honoree}',
      'Capture a heart shape found in the wild',
      'Photograph the prettiest dessert',
      'Recreate a famous romantic movie scene',
      'Get a photo of a toast with pink drinks',
      'Photograph something red in three different places',
      'Capture a friendship moment that says it all',
      'Take a photo worthy of a valentine card cover'
    ],
    memorylane: [
      'The sweetest thing a friend or partner ever did for me:',
      'My favorite Valentine’s memory is:',
      'A friendship moment I will never forget:',
      'The best compliment I have ever received:',
      'A love story (real!) that gives me hope:',
      'The moment I knew this friendship was for life:'
    ],
    awards: [
      ['Sweetest Heart', 'For kindness that never quits'],
      ['Best Love Storyteller', 'For the tale that made everyone sigh'],
      ['Galentine of the Year', 'For friendship above and beyond'],
      ['Romance Expert', 'For advice Cupid himself would envy'],
      ['Best Toast to Love', 'For words that warmed every heart'],
      ['Valentine MVP', 'For making this celebration sparkle']
    ],
    guess: { title: 'Guess How Many Kisses in the Jar', unit: 'chocolate kisses', note: 'Closest guess without going over wins the jar!' },
    phoneExtra: [['A heart emoji in your recent messages', 10], ['A photo with your favorite person', 15], ['A love song in your recent plays', 10]],
    purseExtra: [['Something heart-shaped', 20], ['A pink or red item', 10], ['A love note or sweet receipt', 15]],
    iceExtra: ['What is the most romantic movie scene ever?', 'What does your perfect day with your favorite people look like?']
  }
});

/* ---------------- library resolver ----------------
   Merges the shared base lists with each occasion's extras so
   phone / purse / icebreaker always reach full size. Returns
   fresh arrays (callers may edit freely). */

function ptgLibrary(occ) {
  var c = occ.content;
  var lib = {};
  Object.keys(c).forEach(function (k) { lib[k] = c[k]; });
  lib.phone = PTG_BASE_PHONE.concat(c.phoneExtra || []);
  lib.purse = PTG_BASE_PURSE.concat(c.purseExtra || []);
  lib.icebreaker = (c.icebreaker || []).concat(PTG_BASE_ICEBREAKER).concat(c.iceExtra || []);
  return lib;
}

function ptgOccasionById(id) {
  for (var i = 0; i < PTG_OCCASIONS.length; i++) if (PTG_OCCASIONS[i].id === id) return PTG_OCCASIONS[i];
  return PTG_OCCASIONS[0];
}

/* Content-library sizes per occasion (used by tests + reports). */
function ptgLibrarySizes() {
  return PTG_OCCASIONS.map(function (occ) {
    var lib = ptgLibrary(occ);
    var sizes = { occasion: occ.id, gamesOffered: occ.games.length };
    Object.keys(lib).forEach(function (k) {
      if (Array.isArray(lib[k])) sizes[k] = lib[k].length;
    });
    return sizes;
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PTG_GAMES: PTG_GAMES, ptgGameById: ptgGameById,
    PTG_OCCASIONS: PTG_OCCASIONS, ptgOccasionById: ptgOccasionById,
    ptgLibrary: ptgLibrary, ptgLibrarySizes: ptgLibrarySizes,
    PTG_BASE_PHONE: PTG_BASE_PHONE, PTG_BASE_PURSE: PTG_BASE_PURSE,
    PTG_BASE_ICEBREAKER: PTG_BASE_ICEBREAKER
  };
}
