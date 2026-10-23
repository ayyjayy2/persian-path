// Content sourced from the app's data.js / culture.js, plus new teaching content.
// Word tuple: [persian, phonetic, english, example, writtenForm?, writtenPhonetic?]
const RAW = [
  ["greetings","Greetings","Hello, goodbye, and everyday courtesies","سلام",[
    ["سلام","Salaam","Hello","سلام! چطوری؟"],
    ["خدا","Khodaa","God","خدا حافظت باشه."],
    ["حافظ","Haafez","Protector / Memorizer","حافظ شیرازی شاعر بزرگیه."],
    ["خداحافظ","Khodaa Haafez","Goodbye (lit: May God protect you)","خداحافظ! فردا می‌بینمت."],
    ["صبح به خیر","Sob Bekheyr","Good Morning","صبح به خیر! خوب خوابیدی؟"],
    ["شب به خیر","Shab Bekheyr","Good Night","شب به خیر، خواب خوش."],
    ["خوش اومدید","Khosh Umadid","Welcome (lit: You came well)","خوش اومدید به خونه‌مون.","خوش آمدید","Khosh Aamadid"],
    ["خوشبختم","Khoshbakhtam","Nice to meet you (lit: I'm fortunate)","خوشبختم از آشناییتون."],
    ["ممنون","Mamnoon","Thank You / Grateful","ممنون از کمکت."],
    ["خواهش میکنم","Khaahesh Mikonam","You're Welcome (lit: I beg you to stop)","خواهش میکنم، مشکلی نیست."],
    ["لطفاً","Lotfan","Please","لطفاً صبر کن."],
    ["ببخشید","Bebakhshid","Sorry / Excuse Me","ببخشید، می‌تونید کمک کنید؟"],
    ["باشه","Baashe","Okay","باشه، بریم.","باشد","Baashad"],
    ["بفرمایید","Befarmaaeid","Here You Go / Go Ahead","بفرمایید، بنشینید."]]],
  ["expressions","Expressions","Toasts, celebrations, and everyday phrases","نوش جان",[
    ["سلامتی","Salaamati","Cheers / Health","سلامتی! به سلامت همه."],
    ["نوش جان","Nooshe Jaan","Bon Appétit (lit: May your soul enjoy it)","نوش جان! غذا خوشمزه‌ست."],
    ["خسته نباشی","Khaste Nabashi","Good Job / Hang In There (lit: May you not be tired)","خسته نباشی، کار خوبی کردی."],
    ["تولدت مبارک","Tavalodet Mobarak","Happy Birthday","تولدت مبارک عزیزم!"],
    ["چطوری؟","Chetori?","How Are You? (informal)","سلام! چطوری؟"],
    ["خوبم","Khubam","I'm Well","خوبم، ممنون. تو چطوری؟"],
    ["خوب","Khoob","Good / Well","امروز خوبه."],
    ["بد","Bad","Bad","حالم بده."],
    ["نمی‌فهمم","Nemifahmam","I don't understand","ببخشید، نمی‌فهمم."],
    ["فارسی بلدی؟","Faarsi boladi?","Do you know Persian?","فارسی بلدی؟"],
    ["کمی فارسی بلدم","Kami Faarsi baladam","I know a little Persian","کمی فارسی بلدم."],
    ["موفق باشی","Movaffaq baashi","Good Luck","موفق باشی تو امتحان."]]],
  ["numbers","Numbers","Count and use numbers","۱۲۳",[
    ["یک","Yek","One","یک سیب دارم."],["دو","Do","Two","دو تا بده."],["سه","Se","Three","سه روز دیگه."],
    ["چهار","Chahaar","Four","چهار نفر اومدن."],["پنج","Panj","Five","پنج دقیقه صبر کن."],["شش","Shesh","Six","شش ماه گذشت."],
    ["هفت","Haft","Seven","هفت روز هفته."],["هشت","Hasht","Eight","هشت ساعت خوابیدم."],["نه","Noh","Nine","نه نفر بودیم."],
    ["ده","Dah","Ten","ده دقیقه دیگه."],["بیست","Bist","Twenty","بیست سال دارم."],["صد","Sad","One Hundred","صد تا بخر."]]],
  ["colors","Colors","Learn all the colors","رنگ",[
    ["قرمز","Ghermez","Red","گل قرمز زیباست."],["آبی","Aabi","Blue","آسمان آبیه."],["سبز","Sabz","Green","درخت سبزه."],
    ["زرد","Zard","Yellow","خورشید زرده."],["سفید","Sefid","White","برف سفیده."],["مشکی","Meshki","Black","شب مشکیه."],
    ["نارنجی","Naaranji","Orange","پرتقال نارنجیه."],["بنفش","Banafsh","Purple","گل بنفشه."],["صورتی","Surati","Pink","لباس صورتیه."],
    ["قهوه‌ای","Ghahve'i","Brown","خاک قهوه‌اییه."],["خاکستری","Khaakestari","Gray","ابر خاکستریه."]]],
  ["family","Family","Family members — formal and informal","خانواده",[
    ["مامان","Maamaan","Mom (informal)","مامان، کجایی؟"],["مادر","Maadar","Mother (formal)","مادرم خوبه."],
    ["بابا","Baabaa","Dad (informal)","بابا، بریم؟"],["پدر","Pedar","Father (formal)","پدرم کار می‌کنه."],
    ["داداش","Daadaash","Bro / Brother (informal)","داداشم خونه‌ست."],["برادر","Baraadar","Brother (formal)","برادرم بزرگه."],
    ["آبجی","Aabji","Sis / Sister (informal)","آبجیم دانشجوئه."],["خواهر","Khaahar","Sister (formal)","خواهرم مهربونه."],
    ["بچه","Bache","Baby / Child","بچه‌ام خوابه."],["دختر","Dokhtar","Girl / Daughter","دختر کوچیکم."],
    ["پسر","Pesar","Boy / Son","پسر باهوشیه."],["مادربزرگ","Maadarbozorg","Grandmother","مادربزرگم مهربونه."]]],
  ["relationships","Relationships","Love, friendship, and romance","عشق",[
    ["دوست","Doost","Friend","دوستم خوبه."],["دوست پسر","Doost Pesar","Boyfriend (lit: boy friend)","دوست پسرم ایرانیه."],
    ["دوست دختر","Doost Dokhtar","Girlfriend (lit: girl friend)","دوست دخترم خوشگله."],["عشق","Eshgh","Love","عشق قشنگترین چیزه."],
    ["دوستت دارم","Dooset Daaram","I love you (softer, everyday)","دوستت دارم مامان."],["عاشقتم","Aasheghetam","I love you (stronger, romantic)","عاشقتم."],
    ["عزیزم","Azizam","My Dear (term of endearment)","عزیزم، حالت خوبه؟"],["عشقم","Eshgham","My Love","عشقم، دلم برات تنگ شده."],
    ["خوشگل","Khoshgel","Pretty / Beautiful","چقدر خوشگلی امروز!"],["خوشتیپ","Khoshtip","Handsome","دوست پسرت خیلی خوشتیپه."]]],
  ["food","Food & Drink","Essential food and drink vocabulary","چای",[
    ["غذا","Ghazaa","Food","غذا حاضره؟"],["آب","Aab","Water","آب بده لطفاً."],["نان","Naan","Bread","نان تازه می‌خوام."],
    ["چای","Chaai","Tea","چای می‌خوری؟"],["قهوه","Ghahve","Coffee","قهوه یا چای؟"],["برنج","Berenj","Rice","برنج ایرانی خوشمزه‌ست."],
    ["مرغ","Morgh","Chicken","مرغ کباب کردیم."],["گوشت","Gusht","Meat","گوشت گرونه."],["میوه","Mive","Fruit","میوه می‌خوری؟"],
    ["پنیر","Panir","Cheese","پنیر و نان."],["تخم مرغ","Tokhm-e morgh","Egg","تخم مرغ آب‌پز."],["شیر","Shir","Milk","شیر گرم بده."]]],
  ["questions","Question Words","Ask anything with these essential words","چی؟",[
    ["چی؟","Chi?","What?","چی گفتی؟","چه؟","Che?"],["کجا؟","Kojaa?","Where?","کجا میری؟"],["کِی؟","Key?","When? (pronounced 'kay')","کی میای؟"],
    ["کی؟","Ki?","Who?","کی اومد؟"],["چرا؟","Cheraa?","Why?","چرا نیومدی؟"],["چطور؟","Chetor?","How?","این کار رو چطور کردی؟"],
    ["چقدر؟","Cheghad?","How much? / How many?","این چقدره؟","چه قدر؟","Che ghadr?"],["کدوم؟","Kodoom?","Which?","کدوم رو می‌خوای؟","کدام؟","Kodaam?"],
    ["چند؟","Chand?","How many? / A few","چند تا؟"],["اسمت چیه؟","Esmat chiye?","What's your name?","سلام! اسمت چیه؟","اسم شما چیست؟","Esm-e shomaa chist?"]]],
  ["pronouns","Pronouns","I, you, we, they — the building blocks","من",[
    ["من","Man","I / Me / My","من ایرانی هستم."],["تو","To","You (singular, informal) — pronounced 'toe'","تو کجایی؟"],
    ["او","Oo","He / She / Him / Her","او خوبه."],["ما","Maa","We / Us","ما با هم رفتیم."],["شما","Shomaa","You (plural or formal)","شما چطورید؟"],
    ["آن ها","Aan Haa","They / Their","آن ها اومدن."],["این","In","This","این چیه؟"],["آن","Aan","That","آن رو بده."],
    ["ها","Haa","Plural marker (like -s in English)","کتاب‌ها کجاست؟"]]],
  ["home-life","Home & Daily Life","Your home, free time, and everyday things","خانه",[
    ["خونه","Khune","House / Home","بریم خونه.","خانه","Khaane"],["پول","Pool","Money","پول ندارم."],["کار","Kar","Work / Job","کارم خوبه."],
    ["وقت","Vaght","Time","وقت ندارم."],["خواب","Khaab","Sleep","خوابم میاد."],["رویا","Roya","Dream","رویای قشنگی دیدم."],
    ["فیلم","Film","Movie","فیلم می‌بینیم؟"],["سریال","Serial","TV Show","سریال ایرانی می‌بینم."],["مبل","Mobl","Couch","روی مبل نشستم."],
    ["تخت","Takht","Bed","تخت راحته."],["گربه","Gorbe","Cat","گربه‌ام نازه."],["سگ","Sag","Dog","سگم باهوشه."]]],
  ["getting-around","Getting Around","Travel, transport, and the world outside","شهر",[
    ["هواپیما","Hava-Peyma","Airplane (lit: air-measurer)","با هواپیما رفتم."],["قطار","Ghatar","Train","قطار دیر کرد."],
    ["ماشین","Maashin","Car","ماشینم تو پارکینگه."],["تاکسی","Taaksi","Taxi","تاکسی گرفتم."],["هوا","Hava","Air / Weather","هوا سرده امروز."],
    ["آسمون","Asemoon","Sky","آسمون آبیه.","آسمان","Aasemaan"],["کشور","Keshvar","Country","کشور قشنگیه."],["شهر","Shahr","City","این شهر بزرگه."],
    ["خیابان","Khiyaabaan","Street","خیابان شلوغه."],["فرودگاه","Forudgaah","Airport","فرودگاه کجاست؟"]]],
  ["clothing","Clothing","What to wear","لباس",[
    ["لباس","Lebaas","Clothes / Outfit","لباس قشنگی پوشیدی."],["پیرهن","Pirhan","Shirt","پیرهن آبی می‌خوام.","پیراهن","Piraahan"],
    ["شلوار","Shalvaar","Pants","شلوارم کجاست؟"],["کت","Kot","Coat / Jacket","کتم رو بیار."],["کفش","Kafsh","Shoes","کفشام نو هستن."],
    ["جوراب","Jooraab","Socks","جورابم گم شد."],["کلاه","Kolaah","Hat","کلاه سرت بذار."],["کیف","Kif","Bag / Purse","کیفم رو دیدی؟"],
    ["عینک","Eynak","Glasses","عینکم رو نمی‌بینم."],["ساعت","Saa'at","Watch / Clock / Hour","ساعت چنده؟"]]],
  ["days","Days of the Week","Days, months, and time expressions","شنبه",[
    ["شنبه","Shanbe","Saturday","شنبه تعطیله."],["یکشنبه","Yekshanbe","Sunday","یکشنبه بریم؟"],["دوشنبه","Doshanbe","Monday","دوشنبه کلاس دارم."],
    ["سه‌شنبه","Seshanbe","Tuesday","سه‌شنبه می‌ام."],["چهارشنبه","Chahaarshanbe","Wednesday","چهارشنبه جلسه دارم."],
    ["پنجشنبه","Panjshanbe","Thursday","پنجشنبه آزادم."],["جمعه","Jom'e","Friday","جمعه تعطیله."],["امروز","Emruz","Today","امروز خوبه."],
    ["فردا","Fardaa","Tomorrow","فردا می‌بینمت."],["دیروز","Diruz","Yesterday","دیروز رفتم."],["هفته","Hafte","Week","این هفته مشغولم."],["ماه","Maah","Month / Moon","این ماه بریم."]]],
  ["verbs","Essential Verbs","Action words to get started","رفتن",[
    ["رفتن","Raftan","To go","می‌خوام برم."],["آمدن","Aamadan","To come","بیا اینجا."],["خوردن","Khordan","To eat","چی می‌خوری؟"],
    ["نوشیدن","Nushidan","To drink","آب می‌نوشم."],["خواندن","Khaandan","To read / To sing","کتاب می‌خونم."],["نوشتن","Neveshtan","To write","نامه می‌نویسم."],
    ["دیدن","Didan","To see","فیلم می‌بینم."],["شنیدن","Shenidan","To hear / To listen","موزیک می‌شنوم."],["دانستن","Daanestan","To know","نمی‌دونم."],
    ["گفتن","Goftan","To say / To tell","چی گفتی؟"],["خوابیدن","Khaabidan","To sleep","می‌خوام بخوابم."],["بودن","Budan","To be","کجایی؟"]]],
  ["slang","Slang & Adult Words","Colorful language — you've been warned","ولش کن",[
    ["خفه شو","Khaffe sho","Shut up!","خفه شو، حوصله ندارم."],["دیوونه","Divooneh","Crazy / Insane","دیوونه شدی؟!","دیوانه","Divaane"],
    ["بی‌شعور","Bisho'oor","Idiot (lit: without sense)","چه آدم بی‌شعوریه."],["مزخرف","Mazakhraf","Nonsense / Crap","مزخرف نگو."],
    ["ولش کن","Valesh kon","Drop it / Forget it","ولش کن، ارزش نداره."],["بیخود","Bikhod","For no reason / In vain","بیخود اومدی."]]],
];

// Teacher's notes — one concept per chapter, written for English speakers.
export const NOTES = {
  "greetings": { t: "Ta'arof — the art of polite insistence", b: "Persian courtesy runs on ta'arof: offering, refusing, and offering again. When someone says befarmaaeid (please, go ahead), the polite reply is often to decline once before accepting. Khaahesh mikonam literally means “I beg you” — begging you to stop thanking them." },
  "expressions": { t: "Say it to anyone who is working", b: "Khaste nabaashi — “may you not be tired” — is said to a shopkeeper, a cook, a colleague at the end of a day. There is no English equivalent; it acknowledges effort, not result. The reply is salaamat baashi, “may you be healthy.”" },
  "numbers": { t: "Persian digits read left-to-right", b: "The script runs right-to-left, but numbers do not: ۱۴۰۵ is read as 1405, just like in English. Learn the digit shapes early — ۴ ۵ ۶ appear on every price tag, bus and clock." },
  "colors": { t: "The ezāfe: adjectives come after", b: "A red flower is gol-e ghermez — noun first, then a short -e linking it to the adjective. This little sound, the ezāfe, is rarely written, so you have to hear it. Listen for it in every example." },
  "family": { t: "Two registers for every relative", b: "Maamaan and baabaa are what you say at home; maadar and pedar are what you write or say to a stranger. Add -am to make it “my”: maadar-am, my mother." },
  "relationships": { t: "“I have you as a friend”", b: "Dooset daaram is literally “I have you as friend” — the everyday way to say I love you, to a parent or a partner. Aasheghetam, “I am your lover,” is the stronger, romantic version." },
  "food": { t: "You “eat” tea in Persian", b: "Iranians usually say chaai mikhoram — “I eat tea” — rather than “drink.” Khordan (to eat) covers most food and drink in speech; nushidan (to drink) sounds bookish." },
  "questions": { t: "Question words stay in place", b: "Unlike English, Persian doesn't move the question word to the front. “You're going where?” — kojaa miri? sits exactly where the answer would. Rising intonation does the rest." },
  "pronouns": { t: "To versus shomaa", b: "Use to with friends, family and children; shomaa with elders, strangers and anyone you'd call “sir” or “ma'am.” Pronouns are often dropped entirely — the verb ending already says who." },
  "home-life": { t: "Spoken āan becomes oon", b: "In everyday Tehran speech, written -aan- turns to -oon-: khaane → khune, aasemaan → aasemoon, nadaanam → nemidoonam. Switch the register setting to see both forms." },
  "getting-around": { t: "Words built like Lego", b: "Persian builds new words by joining old ones. Havaa-peymaa is “air-measurer”; forud-gaah is “landing-place.” Spot -gaah (place) and you'll decode dozens of words." },
  "clothing": { t: "Wearing is “covering”", b: "The verb for wearing clothes is pushidan, from the same root as “to cover.” For hats and glasses, you'll also hear gozaashtan, “to put.”" },
  "days": { t: "The week starts on Saturday", b: "Shanbe is Saturday, and the next days just count up from it: yek-shanbe (one-after-Saturday), do-shanbe (two), se-shanbe (three)… Friday, jom'e, is the weekend." },
  "verbs": { t: "Verbs go last", b: "Persian is subject–object–verb: man chaai mikhoram, “I tea eat.” Infinitives end in -an, but the present stem you'll actually use is often irregular: raftan → mi-r-am, I go." },
  "slang": { t: "Context matters", b: "These words are common in films and on the street. Learn them so you understand them — and be careful about when you use them." },
};

// ===== The plan: zero → fluent =====
// Five stages, roughly aligned to CEFR. Each stage ends with a conversation checkpoint
// with a native speaker — the skill the whole course builds toward.
export const STAGES = [
  { id: "s1", n: 1, name: "Foundations", fa: "پایه", level: "Pre-A1", weeks: "Weeks 1–3",
    goal: "Read the script, pronounce every sound, and get through a first meeting.",
    cando: ["Read and write all 32 letters", "Greet people and introduce yourself", "Count to 100 and say your age", "Use to and shomaa correctly"],
    items: [{ kind: "script", title: "The alphabet", desc: "32 letters, four forms each" }, { kind: "lesson", id: "greetings" }, { kind: "lesson", id: "numbers" }, { kind: "lesson", id: "pronouns" }],
    checkpoint: { id: "first-meeting", title: "First meeting", desc: "Meet Maryam at a friend's party" } },
  { id: "s2", n: 2, name: "Survival", fa: "روزمره", level: "A1", weeks: "Weeks 4–8",
    goal: "Handle everyday needs: food, family, time and simple questions.",
    cando: ["Order food and drink", "Ask who, what, where, when and why", "Talk about your family", "Say the day and make plans"],
    items: [{ kind: "lesson", id: "expressions" }, { kind: "lesson", id: "family" }, { kind: "lesson", id: "food" }, { kind: "lesson", id: "questions" }, { kind: "lesson", id: "days" }, { kind: "lesson", id: "colors" }],
    checkpoint: { id: "tea-house", title: "At the tea house", desc: "Order tea and sweets, then pay" } },
  { id: "s3", n: 3, name: "Building sentences", fa: "جمله‌سازی", level: "A2", weeks: "Weeks 9–16",
    goal: "Make your own sentences in the present and past — not just phrases.",
    cando: ["Conjugate any regular verb in the present", "Tell a story in the past tense", "Link nouns and adjectives with the ezāfe", "Mark direct objects with ro"],
    items: [{ kind: "lesson", id: "verbs" }, { kind: "grammar", title: "Present tense: mi- + stem", desc: "mi-ravam, mi-khoram, mi-bínam" }, { kind: "grammar", title: "The ezāfe", desc: "ketaab-e man — my book" }, { kind: "lesson", id: "home-life" }, { kind: "grammar", title: "Past tense", desc: "raftam, khordam, didam" }, { kind: "grammar", title: "The object marker ro", desc: "chaai ro khordam" }, { kind: "lesson", id: "getting-around" }, { kind: "lesson", id: "clothing" }],
    checkpoint: { id: "taxi", title: "Taking a taxi", desc: "Give directions across Tehran" } },
  { id: "s4", n: 4, name: "Conversation", fa: "گفتگو", level: "B1", weeks: "Months 5–9",
    goal: "Hold a ten-minute conversation with a native speaker on everyday topics.",
    cando: ["Speak about the future and give reasons", "Navigate ta'arof as a guest and a host", "Haggle and handle money", "Understand native speech at natural speed"],
    items: [{ kind: "grammar", title: "Future & subjunctive", desc: "mikhaam beram — I want to go" }, { kind: "conversation", title: "Dinner at an Iranian home", desc: "Ta'arof, compliments and seconds" }, { kind: "conversation", title: "At the bazaar", desc: "Ask prices and haggle politely" }, { kind: "skill", title: "Listening at full speed", desc: "Real street interviews, slowed then natural" }, { kind: "grammar", title: "Formal vs. colloquial", desc: "Read written Persian, speak Tehrani" }],
    checkpoint: { id: "family-visit", title: "Meeting the family", desc: "A full visit, start to goodbye" } },
  { id: "s5", n: 5, name: "Fluency", fa: "تسلط", level: "B2–C1", weeks: "Month 10 onward",
    goal: "Follow films, express opinions, and enjoy Persian on its own terms.",
    cando: ["Follow an Iranian film without subtitles", "Argue a point and disagree politely", "Use common idioms naturally", "Read and recite a couplet of Hafez"],
    items: [{ kind: "skill", title: "Idioms & proverbs", desc: "Speak like a native, not a textbook" }, { kind: "skill", title: "Film & podcast club", desc: "Weekly native audio with transcripts" }, { kind: "skill", title: "Opinions & debate", desc: "Agree, disagree, persuade" }, { kind: "skill", title: "Poetry: Hafez & Rumi", desc: "Read the classics aloud" }],
    checkpoint: { id: "open-talk", title: "Open conversation", desc: "Free talk with a tutor, any topic" } },
];

// One "can-do" outcome per chapter — what the learner will be able to say.
export const CANDO = {
  greetings: "Say hello, goodbye, please and thank you — and reply politely.",
  expressions: "React like a local: cheers, bon appétit, good luck, I don't understand.",
  numbers: "Count to 100, read Persian digits and say your age.",
  colors: "Describe things with colors — noun first, then the adjective.",
  family: "Name your family members at home and in polite company.",
  relationships: "Talk about friends and partners, and use terms of endearment.",
  food: "Ask for food and drink at a table or a shop.",
  questions: "Ask the six essential questions and understand the answers.",
  pronouns: "Choose to or shomaa, and know when to drop the pronoun.",
  "home-life": "Talk about your home, work and free time.",
  "getting-around": "Get from the airport to the city and talk about the weather.",
  clothing: "Shop for clothes and describe what someone is wearing.",
  days: "Say the day, and make plans for today, tomorrow and next week.",
  verbs: "Use twelve core verbs to say what you do every day.",
  slang: "Understand what you hear in films and on the street.",
};

// Conversation checkpoints. npc lines play automatically; "you" turns are multiple choice.
export const SCENARIOS = {
  "first-meeting": { title: "First meeting", setting: "A friend's party in Tehran. Maryam comes to the door.", npc: "Maryam", npcFa: "مریم",
    turns: [
      { who: "npc", fa: "سلام! خوش اومدید.", lat: "Salaam! Khosh umadid.", en: "Hello! Welcome." },
      { who: "you", choices: [
        { fa: "سلام، ممنون.", lat: "Salaam, mamnoon.", en: "Hello, thank you.", ok: true },
        { fa: "شب به خیر.", lat: "Shab bekheyr.", en: "Good night.", why: "Shab bekheyr is said when leaving at night — not on arrival." },
        { fa: "خداحافظ.", lat: "Khodaa haafez.", en: "Goodbye.", why: "That's goodbye — you've only just arrived!" }] },
      { who: "npc", fa: "اسمت چیه؟", lat: "Esmat chiye?", en: "What's your name?" },
      { who: "you", choices: [
        { fa: "من ایرانی هستم.", lat: "Man irani hastam.", en: "I am Iranian.", why: "That says where you're from, not your name." },
        { fa: "اسمم سامه.", lat: "Esmam Sam-e.", en: "My name is Sam.", ok: true, tip: "Esm + -am = esmam, “my name.” The -e at the end is spoken “is.”" }] },
      { who: "npc", fa: "خوشبختم! فارسی بلدی؟", lat: "Khoshbakhtam! Faarsi baladi?", en: "Nice to meet you! Do you know Persian?" },
      { who: "you", choices: [
        { fa: "خسته نباشی.", lat: "Khaste nabaashi.", en: "May you not be tired.", why: "Lovely phrase — but it's for someone who has been working." },
        { fa: "کمی فارسی بلدم.", lat: "Kami faarsi baladam.", en: "I know a little Persian.", ok: true }] },
      { who: "npc", fa: "آفرین! چای می‌خوری؟", lat: "Aafarin! Chaai mikhori?", en: "Well done! Will you have some tea?" },
      { who: "you", choices: [
        { fa: "ممنون، زحمت نکشید.", lat: "Mamnoon, zahmat nakeshid.", en: "Thanks, please don't go to any trouble.", ok: true, tip: "Ta'arof: a guest politely declines once. Your host will insist." },
        { fa: "آره، چای بده.", lat: "Aare, chaai bede.", en: "Yeah, give me tea.", why: "Grammatically fine, but blunt. A guest usually declines once first — ta'arof." }] },
      { who: "npc", fa: "بفرمایید، تعارف نکنید!", lat: "Befarmaaeid, ta'arof nakonid!", en: "Please, go ahead — don't be shy!" },
      { who: "you", choices: [
        { fa: "باشه، ممنون.", lat: "Baashe, mamnoon.", en: "Okay, thank you.", ok: true, tip: "Now that she has insisted, accepting is perfectly polite." },
        { fa: "نمی‌فهمم.", lat: "Nemifahmam.", en: "I don't understand.", why: "You did understand! She's insisting — now you can accept." }] },
      { who: "npc", fa: "نوش جان!", lat: "Nooshe jaan!", en: "Enjoy! (lit: may your soul enjoy it)" },
    ] },
  "tea-house": { title: "At the tea house", setting: "A traditional chaikhaneh. Reza, the waiter, greets you.", npc: "Reza", npcFa: "رضا",
    turns: [
      { who: "npc", fa: "سلام، خوش اومدید. بفرمایید.", lat: "Salaam, khosh umadid. Befarmaaeid.", en: "Hello, welcome. Please, have a seat." },
      { who: "you", choices: [
        { fa: "خوبم.", lat: "Khubam.", en: "I'm well.", why: "Nobody has asked how you are yet." },
        { fa: "سلام، ممنون.", lat: "Salaam, mamnoon.", en: "Hello, thank you.", ok: true }] },
      { who: "npc", fa: "چی میل دارید؟", lat: "Chi meyl daarid?", en: "What would you like?" },
      { who: "you", choices: [
        { fa: "یک چای، لطفاً.", lat: "Yek chaai, lotfan.", en: "One tea, please.", ok: true, tip: "Number + noun, never plural: yek chaai, do chaai, se chaai." },
        { fa: "چای کجا؟", lat: "Chaai kojaa?", en: "Tea where?", why: "That asks where the tea is. Try number + noun + please." }] },
      { who: "npc", fa: "با نبات؟", lat: "Baa nabaat?", en: "With rock candy?" },
      { who: "you", choices: [
        { fa: "صد.", lat: "Sad.", en: "One hundred.", why: "Sad is 100 — he's asking yes or no." },
        { fa: "آره، ممنون.", lat: "Aare, mamnoon.", en: "Yes, thanks.", ok: true, tip: "Nabaat — saffron rock candy — is the classic way to sweeten tea." }] },
      { who: "npc", fa: "بفرمایید. نوش جان!", lat: "Befarmaaeid. Nooshe jaan!", en: "Here you go. Enjoy!" },
      { who: "you", choices: [
        { fa: "چقدر می‌شه؟", lat: "Cheghadr mishe?", en: "How much is it?", ok: true, tip: "Mishe — “it becomes” — is how you ask for a total." },
        { fa: "تولدت مبارک!", lat: "Tavalodet mobaarak!", en: "Happy birthday!", why: "Kind, but it isn't his birthday. Ask the price with cheghadr." }] },
      { who: "npc", fa: "قابل نداره.", lat: "Ghaabel nadaare.", en: "It's nothing (lit: it's not worthy of you)." },
      { who: "you", choices: [
        { fa: "باشه، خداحافظ!", lat: "Baashe, khodaa haafez!", en: "Okay, goodbye!", why: "Walking out would be a shock — this is ta'arof, not a gift!" },
        { fa: "نه، خواهش می‌کنم.", lat: "Na, khaahesh mikonam.", en: "No, please — I insist.", ok: true, tip: "Ghaabel nadaare is ta'arof. Insist once and you'll be told the real price." }] },
      { who: "npc", fa: "بیست هزار تومن. ممنون!", lat: "Bist hezaar toman. Mamnoon!", en: "Twenty thousand toman. Thank you!" },
    ] },
};
export const CANDO_NEEDS = { s1: ["script", "greetings", "numbers", "pronouns"], s2: ["food", "questions", "family", "days"] };

export const ACTIVITIES = [
  { id: "flashcard", title: "Flashcards", desc: "Meet each word with native audio", mins: 3, icon: "layers" },
  { id: "quiz", title: "Recognition", desc: "Both directions — Persian to English and back", mins: 4, icon: "list" },
  { id: "listen", title: "Listening", desc: "Hear it, then pick the meaning", mins: 3, icon: "headphones" },
  { id: "build", title: "Sentence builder", desc: "Put words in Persian order — verb last", mins: 4, icon: "blocks", isNew: true },
  { id: "speak", title: "Speaking", desc: "Shadow a native speaker, then compare", mins: 3, icon: "mic", isNew: true },
];

export const SENTENCES = [
  { en: "I am Iranian.", tiles: [["من","man"],["ایرانی","irani"],["هستم","hastam"]], extra: [["تو","to"]], tip: "The verb hastam (I am) goes at the very end." },
  { en: "I am American.", tiles: [["من","man"],["آمریکایی","aamrikaa'i"],["هستم","hastam"]], extra: [["ایرانی","irani"]], tip: "Add -i to a country to make a nationality: Aamrikaa → aamrikaa'i." },
  { en: "I drink tea.", tiles: [["من","man"],["چای","chaai"],["می‌خورم","mikhoram"]], extra: [["آب","aab"]], tip: "Iranians “eat” tea — mikhoram, from khordan." },
  { en: "Where are you going?", tiles: [["تو","to"],["کجا","kojaa"],["میری","miri"]], extra: [["چی","chi"]], tip: "The question word sits where the answer would: “you where go?”" },
  { en: "What is your name?", tiles: [["اسم","esm-e"],["شما","shomaa"],["چیه","chiye"]], extra: [["من","man"]], tip: "Esm-e shomaa — the ezāfe -e links “name” to “you.”" },
];

// 32 letters. [letter, name, sound, exampleWord, examplePhonetic, exampleEnglish, persianOnly, group]
const L = [
  ["ا","alef","aa / a","آب","aab","water",0,""],["ب","be","b","بابا","baabaa","dad",0,""],["پ","pe","p","پدر","pedar","father",1,""],
  ["ت","te","t","تاکسی","taaksi","taxi",0,"t"],["ث","se","s","ثانیه","saaniye","second",0,"s"],["ج","jim","j","جوراب","jooraab","socks",0,""],
  ["چ","che","ch","چای","chaai","tea",1,""],["ح","he-ye jimi","h","حافظ","haafez","protector",0,"h"],["خ","khe","kh","خانه","khaane","home",0,""],
  ["د","daal","d","دوست","doost","friend",0,""],["ذ","zaal","z","ذرت","zorrat","corn",0,"z"],["ر","re","r","رویا","roya","dream",0,""],
  ["ز","ze","z","زرد","zard","yellow",0,"z"],["ژ","zhe","zh","ژاکت","zhaakat","jacket",1,""],["س","sin","s","سلام","salaam","hello",0,"s"],
  ["ش","shin","sh","شیر","shir","milk",0,""],["ص","saad","s","صد","sad","hundred",0,"s"],["ض","zaad","z","ضعیف","za'if","weak",0,"z"],
  ["ط","taa","t","طلا","talaa","gold",0,"t"],["ظ","zaa","z","ظهر","zohr","noon",0,"z"],["ع","eyn","’ (glottal stop)","عشق","eshgh","love",0,""],
  ["غ","gheyn","gh","غذا","ghazaa","food",0,"gh"],["ف","fe","f","فیلم","film","movie",0,""],["ق","ghaaf","gh","قطار","ghatar","train",0,"gh"],
  ["ک","kaaf","k","کفش","kafsh","shoes",0,""],["گ","gaaf","g","گربه","gorbe","cat",1,""],["ل","laam","l","لباس","lebaas","clothes",0,""],
  ["م","mim","m","مادر","maadar","mother",0,""],["ن","nun","n","نان","naan","bread",0,""],["و","vaav","v / oo / o","وقت","vaght","time",0,""],
  ["ه","he","h / e","هفت","haft","seven",0,"h"],["ی","ye","y / ee","یک","yek","one",0,""],
];
const NON_CONNECT = new Set(["ا","د","ذ","ر","ز","ژ","و"]);
const ZWJ = "\u200D";
export const LETTERS = L.map(([ch, name, sound, ex, exLat, exEn, pOnly, group]) => {
  const nc = NON_CONNECT.has(ch);
  return { ch, name, sound, ex, exLat, exEn, persianOnly: !!pOnly, group, connects: !nc,
    forms: { isolated: ch, initial: nc ? ch : ch + ZWJ, medial: nc ? ZWJ + ch : ZWJ + ch + ZWJ, final: ZWJ + ch } };
});
export const SOUND_GROUPS = { z: "Four letters sound like z: ذ ز ض ظ. Most everyday words use ز.", s: "Three letters sound like s: ث س ص. س is by far the most common.", t: "Two letters sound like t: ت ط.", h: "Two letters sound like h: ح ه.", gh: "غ and ق are pronounced the same in Iranian Persian — a throaty gh." };

export const ARTICLES = [
  { id: "persian-vs-farsi", title: "Persian or Farsi?", subtitle: "Why we say “Persian”, not “Farsi”", category: "Language", readTime: "3 min read", fa: "فارسی",
    preview: "The word ‘Farsi’ is what Persian speakers call their own language — but in English, the correct term is Persian.",
    sections: [
      { h: "The short answer", p: ["Every language has two names: what its own speakers call it (the endonym), and what outsiders call it (the exonym). Using “Farsi” in English is like an English speaker saying “Français” instead of “French”, or “Deutsch” instead of “German” — technically understandable, but not how English works."] },
      { h: "How languages get their English names", p: ["English has a long tradition of using its own names for foreign languages:"], list: ["Speakers of Nihongo → we say Japanese", "Speakers of Español → we say Spanish", "Speakers of Zhōngwén → we say Chinese", "Speakers of Fârsi → we say Persian"], after: "“Farsi” became trendy in English during the 1980s–90s, partly due to political sensitivities around the word “Persian” after the Iranian Revolution. But linguists, the United Nations, Oxford University Press, and Cambridge all continue to use Persian as the standard English term." },
      { h: "What do Persian speakers say?", p: ["In Persian, the language is called فارسی (Fârsi) — which comes from Pârsi, itself derived from the ancient province of Pârs (the modern province of Fars in southern Iran). The shift from P→F happened after the Arab conquest in 651 AD, since Arabic doesn't have a P sound.", "The country's name in Persian is ایران (Irân), while outsiders historically called it Persia. Iran officially requested the international community use “Iran” in 1935 — but the language kept its English name: Persian."] },
      { h: "Three flavors of Persian", p: ["Persian is spoken across three countries under different official names:"], list: ["Iran — called Fârsi · ~85 million speakers", "Afghanistan — called Dari · ~15 million speakers", "Tajikistan — called Tajik · ~8 million speakers (written in Cyrillic)"], after: "These are mutually intelligible — a Persian speaker from Tehran can generally understand an Afghan speaker of Dari. Together, they make Persian one of the world's major languages with over 110 million native speakers." },
      { h: "The script", p: ["Persian is written right-to-left in a modified Arabic script called the Perso-Arabic script. It adds four letters not found in Arabic: پ (p), چ (ch), ژ (zh), and گ (g). Before the Arab conquest, Old Persian was written in cuneiform — the wedge-shaped script also used for Sumerian and Babylonian."] },
    ] },
  { id: "history", title: "History of Persia", subtitle: "From Cyrus the Great to the present day", category: "History & Geography", readTime: "8 min read", fa: "تاریخ",
    preview: "One of the world's oldest civilizations, Persia once ruled an empire stretching from Greece to India — and gave humanity some of its greatest poets, scientists, and kings." },
  { id: "iranian-flags", title: "The Iranian Flag", subtitle: "Lion, sun, and the colors of a nation", category: "Culture", readTime: "4 min read", fa: "پرچم", preview: "The flags of Iran across the centuries, and what each emblem meant." },
  { id: "geography", title: "Persian World: Geography", subtitle: "Mountains, deserts and the cities between", category: "History & Geography", readTime: "5 min read", fa: "جغرافیا", preview: "Where Persian is spoken today, with an interactive map of its great cities." },
  { id: "holidays", title: "Persian Holidays", subtitle: "Nowruz, Yalda and the year's festivals", category: "Culture", readTime: "6 min read", fa: "جشن", preview: "From the spring equinox of Nowruz to the longest night of Yalda." },
];

export const ACHIEVEMENTS = [
  { id: "first_step", title: "First Step", desc: "Complete your first lesson activity" },
  { id: "on_fire", title: "On Fire", desc: "Reach a 3-day streak" },
  { id: "dedicated", title: "Dedicated", desc: "Reach a 7-day streak" },
  { id: "rising_star", title: "Rising Star", desc: "Fully complete 3 lessons" },
  { id: "scholar", title: "Scholar", desc: "Fully complete all lessons" },
  { id: "centurion", title: "Centurion", desc: "Reach 100 XP" },
  { id: "master", title: "Master", desc: "Reach Level 5 (400 XP)" },
  { id: "word_collector", title: "Word Collector", desc: "Learn words from 5 lessons" },
];

// Numeric value of each number word, shown as Persian digits alongside the word
const DIGITS = { Yek: 1, Do: 2, Se: 3, Chahaar: 4, Panj: 5, Shesh: 6, Haft: 7, Hasht: 8, Noh: 9, Dah: 10, Bist: 20, Sad: 100 };

export const LESSONS = RAW.map(([id, title, description, glyph, words]) => ({
  id, title, description, glyph, mature: id === "slang",
  words: words.map(([persian, phonetic, english, example, written, writtenPhonetic]) => ({ key: id + ":" + phonetic, persian, phonetic, english, example, written, writtenPhonetic, digit: id === "numbers" ? DIGITS[phonetic] : undefined })),
}));

// Every recording in audio/ (regenerate this list when audio is added)
const AUDIO = new Set(["air-weather-hava","airplane-hava-peyma","airport-forudgaah","ass-butt-koon","baby-child-bache","bad-bad","bag-purse-kif","bed-takht","black-meshki","blue-aabi","bon-apptit-nooshe-jaan","boy-son-pesar","boyfriend-doost-pesar","bread-naan","bro-brother-daadaash","brother-baraadar","brown-ghahvei","car-maashin","cat-gorbe","cheers-health-salaamati","cheese-panir","chicken-morgh","city-shahr","clothes-outfit-lebaas","coat-jacket-kot","cock-dick-kir","coffee-ghahve","couch-mobl","country-keshvar","crazy-insane-divooneh","dad-baabaa","do-you-know-persian-faarsi-boladi","dog-sag","dream-roya","drop-it-forget-it-valesh-kon","egg-tokhm-e-morgh","eight-hasht","father-pedar","five-panj","food-ghazaa","for-no-reason-in-vain-bikhod","four-chahaar","friday-jome","friend-doost","fruit-mive","girl-daughter-dokhtar","girlfriend-doost-dokhtar","glasses-eynak","god-khodaa","good-job-hang-in-there-khaste-nabashi","good-luck-movaffaq-baashi","good-morning-sob-bekheyr","good-night-shab-bekheyr","good-well-khoob","goodbye-khodaa-haafez","grandmother-maadarbozorg","gray-khaakestari","green-sabz","handsome-khoshtip","happy-birthday-tavalodet-mobarak","hat-kolaah","he-she-him-her-oo","hello-salaam","here-you-go-go-ahead-befarmaaeid","house-home-khaane","how-are-you-chetori","how-chetor","how-many-a-few-chand","how-much-how-many-cheghad","i-dont-understand-nemifahmam","i-know-a-little-persian-kami-faarsi-baladam","i-love-you-aasheghetam","i-love-you-dooset-daaram","i-me-my-man","idiot-bishooor","im-well-khubam","love-eshgh","meat-gusht","milk-shir","mom-maamaan","monday-doshanbe","money-pool","month-moon-maah","mother-maadar","movie-film","my-dear-azizam","my-love-eshgham","nice-to-meet-you-khoshbakhtam","nine-noh","nonsense-crap-mazakhraf","okay-baashe","one-hundred-sad","one-yek","orange-naaranji","pants-shalvaar","pink-surati","please-lotfan","plural-marker-haa","pretty-beautiful-khoshgel","protector-memorizer-haafez","purple-banafsh","pussy-kos","red-ghermez","rice-berenj","saturday-shanbe","seven-haft","shirt-pirhan","shit-goh","shoes-kafsh","shut-up-khaffe-sho","sis-sister-aabji","sister-khaahar","six-shesh","sky-asemoon","sleep-khaab","socks-jooraab","sorry-excuse-me-bebakhshid","street-khiyaabaan","sunday-yekshanbe","taxi-taaksi","tea-chaai","ten-dah","thank-you-grateful-mamnoon","that-aan","they-their-aan-haa","this-in","three-se","thursday-panjshanbe","time-vaght","to-be-budan","to-come-aamadan","to-drink-nushidan","to-eat-khordan","to-go-raftan","to-hear-to-listen-shenidan","to-know-daanestan","to-read-to-sing-khaandan","to-say-to-tell-goftan","to-see-didan","to-sleep-khaabidan","to-write-neveshtan","today-emruz","tomorrow-fardaa","train-ghatar","tuesday-seshanbe","tv-show-serial","twenty-bist","two-do","watch-clock-hour-saaat","water-aab","we-us-maa","wednesday-chahaarshanbe","week-hafte","welcome-khosh-umadid","what-chi","whats-your-name-esmat-chiye","when-key","where-kojaa","which-kodoom","white-sefid","who-ki","why-cheraa","work-job-kar","yellow-zard","yesterday-diruz","you-shomaa","you-to","youre-welcome-khaahesh-mikonam"]);
// Same file-naming rule as the app's toAudioFileName()
export function audioFile(english, phonetic) {
  const clean = s => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/—.*$/, "").replace(/[/|]/g, " ").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const base = `${clean(english)}-${clean(phonetic)}`;
  return AUDIO.has(base) ? `audio/${base}.wav` : null;
}
