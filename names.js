// Hindi and Urdu names for everything a person taps to navigate: the seven
// categories, every crop, and the seed-bank entries. Kept apart from
// catalogue.js so the catalogue stays readable and a translator can work on
// this one file without touching the data model.
//
// The long agronomy prose in the Seed Bank (why / care / yield) is deliberately
// NOT here — see README. Guessing at agronomic advice in a language you do not
// speak is worse than leaving it in English.

export const CAT_NAMES = {
  veg:   { hi: 'सब्ज़ियाँ', ur: 'سبزیاں' },
  fruit: { hi: 'फल और मेवे', ur: 'پھل اور میوے' },
  grain: { hi: 'अनाज और आटा', ur: 'اناج اور آٹا' },
  seed:  { hi: 'बीज और पौधे', ur: 'بیج اور پودے' },
  dairy: { hi: 'दूध और मक्खन', ur: 'دودھ اور مکھن' },
  dry:   { hi: 'सूखा और सुरक्षित', ur: 'خشک اور محفوظ' },
  other: { hi: 'अन्य स्थानीय सामान', ur: 'دیگر مقامی اشیاء' },
};

export const CROP_NAMES = {
  // vegetables
  turnip:      { hi: 'शलजम', ur: 'شلجم' },
  radish:      { hi: 'मूली', ur: 'مولی' },
  potato:      { hi: 'आलू', ur: 'آلو' },
  cabbage:     { hi: 'पत्ता गोभी', ur: 'بند گوبھی' },
  cauliflower: { hi: 'फूल गोभी', ur: 'پھول گوبھی' },
  kohlrabi:    { hi: 'गांठ गोभी', ur: 'گانٹھ گوبھی' },
  spinach:     { hi: 'पालक', ur: 'پالک' },
  chard:       { hi: 'स्विस चार्ड', ur: 'سوئس چارڈ' },
  kale:        { hi: 'केल', ur: 'کیل' },
  pakchoi:     { hi: 'पाक चोई', ur: 'پاک چوئی' },
  lettuce:     { hi: 'सलाद पत्ता', ur: 'سلاد پتہ' },
  coriander:   { hi: 'धनिया', ur: 'دھنیا' },
  onion:       { hi: 'प्याज़', ur: 'پیاز' },
  garlic:      { hi: 'लहसुन', ur: 'لہسن' },
  carrot:      { hi: 'गाजर', ur: 'گاجر' },
  beetroot:    { hi: 'चुकंदर', ur: 'چقندر' },
  peas_green:  { hi: 'हरी मटर', ur: 'ہری مٹر' },
  broadbean:   { hi: 'बाकला', ur: 'باقلا' },
  pumpkin:     { hi: 'कद्दू', ur: 'کدو' },
  tomato:      { hi: 'टमाटर', ur: 'ٹماٹر' },
  cucumber:    { hi: 'खीरा', ur: 'کھیرا' },
  capsicum:    { hi: 'शिमला मिर्च', ur: 'شملہ مرچ' },
  broccoli:    { hi: 'ब्रोकली', ur: 'بروکلی' },
  mint:        { hi: 'पुदीना', ur: 'پودینہ' },

  // fruit and nuts
  apricot:      { hi: 'ताज़ी खुबानी', ur: 'تازہ خوبانی' },
  apricot_rk:   { hi: 'रक्तसे कारपो खुबानी (GI)', ur: 'رکتسے کارپو خوبانی (GI)' },
  apple:        { hi: 'सेब', ur: 'سیب' },
  walnut:       { hi: 'अखरोट', ur: 'اخروٹ' },
  almond:       { hi: 'बादाम', ur: 'بادام' },
  seabuckthorn: { hi: 'लेह बेरी', ur: 'لیہہ بیری' },
  mulberry:     { hi: 'शहतूत', ur: 'شہتوت' },
  grape:        { hi: 'अंगूर', ur: 'انگور' },
  blackcurrant: { hi: 'ब्लैक करंट', ur: 'بلیک کرنٹ' },
  strawberry:   { hi: 'स्ट्रॉबेरी', ur: 'اسٹرابیری' },
  melon:        { hi: 'खरबूजा / तरबूज़', ur: 'خربوزہ / تربوز' },
  pear:         { hi: 'नाशपाती', ur: 'ناشپاتی' },

  // grain and flour
  barley:     { hi: 'नंगा जौ (नस)', ur: 'ننگا جو (نس)' },
  tsampa:     { hi: 'भुना जौ का आटा', ur: 'بھنے جو کا آٹا' },
  wheat:      { hi: 'गेहूँ', ur: 'گندم' },
  wheatflour: { hi: 'गेहूँ का आटा', ur: 'گندم کا آٹا' },
  buckwheat:  { hi: 'कुट्टू', ur: 'کٹو' },
  peas_dry:   { hi: 'सूखी मटर', ur: 'خشک مٹر' },
  quinoa:     { hi: 'क्विनोआ', ur: 'کوینوا' },
  amaranth:   { hi: 'रामदाना / चौलाई', ur: 'رام دانہ' },
  mustardoil: { hi: 'सरसों / सरसों का तेल', ur: 'سرسوں / سرسوں کا تیل' },

  // seeds and saplings
  seed_veg:      { hi: 'सब्ज़ी के बीज', ur: 'سبزی کے بیج' },
  seed_grain:    { hi: 'अनाज के बीज', ur: 'اناج کے بیج' },
  seed_potato:   { hi: 'बीज आलू', ur: 'بیج آلو' },
  sapling_fruit: { hi: 'फल का पौधा', ur: 'پھل کا پودا' },
  sapling_tree:  { hi: 'विलो / पॉपलर पौधा', ur: 'بید / سفیدہ پودا' },
  seedling:      { hi: 'सब्ज़ी की पौध', ur: 'سبزی کی پنیری' },
  compost:       { hi: 'खाद / गोबर', ur: 'کھاد / گوبر' },

  // dairy
  butter:    { hi: 'मक्खन', ur: 'مکھن' },
  churpe:    { hi: 'सूखा पनीर (छुरपे)', ur: 'خشک پنیر (چھرپے)' },
  milk:      { hi: 'दूध', ur: 'دودھ' },
  curd:      { hi: 'दही', ur: 'دہی' },
  yakcheese: { hi: 'याक / ज़ो पनीर', ur: 'یاک / زو پنیر' },

  // dried and preserved
  phating:    { hi: 'सूखी खुबानी', ur: 'خشک خوبانی' },
  kernel:     { hi: 'खुबानी की गिरी', ur: 'خوبانی کی گری' },
  apricotoil: { hi: 'खुबानी की गिरी का तेल', ur: 'خوبانی کی گری کا تیل' },
  sbt_juice:  { hi: 'लेह बेरी जूस', ur: 'لیہہ بیری جوس' },
  dryveg:     { hi: 'धूप में सुखाई सब्ज़ी', ur: 'دھوپ میں خشک سبزی' },
  honey:      { hi: 'स्थानीय शहद', ur: 'مقامی شہد' },
  herbs_dry:  { hi: 'सूखी जड़ी-बूटी / चाय', ur: 'خشک جڑی بوٹی / چائے' },

  // other
  fodder:     { hi: 'चारा / अल्फाल्फा', ur: 'چارہ / الفالفا' },
  wool:       { hi: 'ऊन / पश्मीना', ur: 'اون / پشمینہ' },
  basket:     { hi: 'विलो की टोकरी / दस्तकारी', ur: 'بید کی ٹوکری / دستکاری' },
  other_item: { hi: 'कुछ और', ur: 'کچھ اور' },
};

export const SEED_NAMES = {
  quinoa:           { hi: 'क्विनोआ', ur: 'کوینوا' },
  seabuckthorn:     { hi: 'लेह बेरी (सी बकथॉर्न)', ur: 'لیہہ بیری' },
  kale:             { hi: 'साइबेरियन केल', ur: 'سائبیرین کیل' },
  pakchoi:          { hi: 'पाक चोई', ur: 'پاک چوئی' },
  chard:            { hi: 'स्विस चार्ड', ur: 'سوئس چارڈ' },
  broccoli:         { hi: 'ब्रोकली', ur: 'بروکلی' },
  asparagus:        { hi: 'शतावरी (एस्पैरेगस)', ur: 'اسپیریگس' },
  fodderbeet:       { hi: 'चारा चुकंदर', ur: 'چارہ چقندر' },
  buckwheat_bitter: { hi: 'कड़वा कुट्टू', ur: 'کڑوا کٹو' },
  amaranth:         { hi: 'रामदाना / चौलाई', ur: 'رام دانہ' },
  garlic_local:     { hi: 'लद्दाख़ी लहसुन', ur: 'لداخی لہسن' },
  turnip:           { hi: 'शलजम', ur: 'شلجم' },
  barley_naked:     { hi: 'नंगा जौ (नस)', ur: 'ننگا جو (نس)' },
  alfalfa:          { hi: 'अल्फाल्फा (ओल)', ur: 'الفالفا (اول)' },
  seedpotato:       { hi: 'बीज आलू', ur: 'بیج آلو' },
  cherrytomato:     { hi: 'चेरी टमाटर', ur: 'چیری ٹماٹر' },
  strawberry:       { hi: 'स्ट्रॉबेरी', ur: 'اسٹرابیری' },
  blackcurrant:     { hi: 'ब्लैक करंट', ur: 'بلیک کرنٹ' },
  hops:             { hi: 'हॉप्स', ur: 'ہاپس' },
  rhodiola:         { hi: 'रोडिओला (सोलो)', ur: 'رودیولا (سولو)' },
  broadbean:        { hi: 'बाकला', ur: 'باقلا' },
  kohlrabi:         { hi: 'गांठ गोभी', ur: 'گانٹھ گوبھی' },
  lettuce:          { hi: 'सलाद पत्ता', ur: 'سلاد پتہ' },
  apricot_rk:       { hi: 'रक्तसे कारपो खुबानी', ur: 'رکتسے کارپو خوبانی' },
};

export const ZONE_NAMES = {
  low:  { hi: 'नीची घाटियाँ', ur: 'نچلی وادیاں' },
  mid:  { hi: 'लेह पट्टी', ur: 'لیہہ پٹی' },
  high: { hi: 'ऊँचा पठार', ur: 'اونچا سطح مرتفع' },
  gh:   { hi: 'ग्रीनहाउस / ट्रेंच', ur: 'گرین ہاؤس / ٹرینچ' },
};

// Fold the translations into the catalogue the client receives, so the client
// never has to know two shapes.
export function localise(cat) {
  const put = (arr, map) => arr.forEach((x) => { if (map[x.key]) x.i18n = map[x.key]; });
  put(cat.CATEGORIES, CAT_NAMES);
  put(cat.CROPS, CROP_NAMES);
  put(cat.SEEDS, SEED_NAMES);
  put(cat.ZONES, ZONE_NAMES);
  return cat;
}
