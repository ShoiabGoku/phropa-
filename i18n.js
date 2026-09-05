// Four languages, because Ladakh needs four: Ladakhi across Leh, Nubra, Sham and
// Zanskar; Urdu across Kargil and Drass; Hindi and English everywhere.
//
// The Ladakhi strings are romanised, not Bhoti script — Bhoti renders as empty
// boxes on many Android phones, and romanised Ladakhi is what people actually
// type. Ladakhi speech mixes in English words freely, and these strings follow
// that rather than inventing purist coinages.
//
// NOTE FOR DEPLOYMENT: the Ladakhi and Urdu strings are careful best-effort and
// should be read over by a native speaker from Leh and one from Kargil before
// this goes to a real village. See README.

export const LANGS = [
  { key: 'en', label: 'English', native: 'English', dir: 'ltr' },
  { key: 'hi', label: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  { key: 'lbj', label: 'Ladakhi', native: 'Ladakhi', dir: 'ltr' },
  { key: 'ur', label: 'Urdu', native: 'اردو', dir: 'rtl' },
];

const S = {
  // --- shell -------------------------------------------------------------
  app_tag:        ['Ladakh Local Market', 'लद्दाख़ का अपना बाज़ार', 'Ladakh-i rang-gi tsongra', 'لداخ کی اپنی منڈی'],
  nav_bazaar:     ['Bazaar', 'बाज़ार', 'Tsongra', 'بازار'],
  nav_seeds:      ['Seeds', 'बीज', 'Sa-bön', 'بیج'],
  nav_sell:       ['Sell', 'बेचें', 'Tsong', 'بیچیں'],
  nav_chats:      ['Chats', 'बातचीत', 'Tam', 'بات چیت'],
  nav_me:         ['Me', 'मैं', 'Nga', 'میں'],

  greet:          ['Julley', 'जुले', 'Julley', 'جولے'],
  greet_sub:      ['Fresh from Ladakh\'s own fields', 'लद्दाख़ के खेतों से ताज़ा', 'Ladakh-i zhing-nas sarpa', 'لداخ کے کھیتوں سے تازہ'],
  search_ph:      ['Search apricot, turnip, barley…', 'खुबानी, शलगम, जौ खोजें…', 'Chuli, nyungma, nas tshol…', 'خوبانی، شلجم، جو تلاش کریں…'],
  offline:        ['You are offline — showing saved items', 'आप ऑफ़लाइन हैं — सहेजी हुई चीज़ें', 'Offline yod — nyar-pai cha-lag', 'آپ آف لائن ہیں — محفوظ اشیاء'],

  // --- home --------------------------------------------------------------
  browse_cat:     ['What do you need?', 'आपको क्या चाहिए?', 'Khyorang-la chi gos?', 'آپ کو کیا چاہیے؟'],
  rates_title:    ['Today\'s rates', 'आज के भाव', 'Deringi rin', 'آج کے نرخ'],
  rates_sub:      ['What people are paying', 'लोग क्या दे रहे हैं', 'Mi-tshos rin chi ter', 'لوگ کیا دے رہے ہیں'],
  wanted_title:   ['Wanted', 'माँग', 'Gos-pa', 'ضرورت'],
  wanted_sub:     ['Buyers looking for crops', 'ख़रीदार क्या ढूँढ रहे हैं', 'Nyo-mkhan-gyi re-wa', 'خریدار کیا ڈھونڈ رہے ہیں'],
  notices_title:  ['Notices', 'सूचनाएँ', 'Sung-wa', 'اطلاعات'],
  notices_sub:    ['Schemes, tips, warnings', 'योजनाएँ और सलाह', 'Scheme-tang lab-ja', 'اسکیمیں اور مشورے'],
  seedbank_title: ['Seed Bank', 'बीज बैंक', 'Sa-bön Bank', 'بیج بینک'],
  seedbank_sub:   ['What else grows up here', 'यहाँ और क्या उग सकता है', 'Dir-la gzhan chi skye-thub', 'یہاں اور کیا اُگ سکتا ہے'],
  fresh_today:    ['Fresh listings', 'नई चीज़ें', 'Sarpa', 'نئی اشیاء'],
  see_all:        ['See all', 'सब देखें', 'Tsang-ma ta', 'سب دیکھیں'],
  nothing_yet:    ['Nothing here yet', 'अभी कुछ नहीं', 'Da-lta chang med', 'ابھی کچھ نہیں'],
  nothing_yet_sub:['Be the first to list something from your field.', 'अपने खेत से पहली चीज़ डालें।', 'Khyorang-i zhing-nas thog-ma tang.', 'اپنے کھیت سے پہلی چیز ڈالیں۔'],

  // --- listings ----------------------------------------------------------
  filter_all:     ['All', 'सभी', 'Tsang-ma', 'سب'],
  filter_deliver: ['Delivers to me', 'मुझ तक पहुँचाए', 'Nga-i sa-cha-la skyel', 'میرے پاس پہنچائے'],
  filter_organic: ['Organic', 'जैविक', 'Organic', 'نامیاتی'],
  filter_near:    ['Near me', 'मेरे पास', 'Nga-i nye-sa', 'میرے قریب'],
  sort_new:       ['Newest', 'नए', 'Sarpa', 'نئے'],
  sort_cheap:     ['Cheapest', 'सस्ते', 'Khe-po', 'سستے'],
  per:            ['per', 'प्रति', 'per', 'فی'],
  available:      ['available', 'उपलब्ध', 'yod', 'دستیاب'],
  qty_avail:      ['Amount available', 'कितना उपलब्ध है', 'Ga-tshod yod', 'کتنا دستیاب ہے'],
  negotiable:     ['Price negotiable', 'भाव पर बात हो सकती है', 'Rin-la tam byed-chog', 'قیمت پر بات ہو سکتی ہے'],
  fixed_price:    ['Fixed price', 'भाव तय', 'Rin tan-tan', 'قیمت مقرر'],
  delivers_badge: ['Delivers', 'पहुँचाते हैं', 'Skyel-thub', 'ترسیل'],
  organic_badge:  ['Organic', 'जैविक', 'Organic', 'نامیاتی'],
  harvested:      ['Harvested', 'कटाई', 'Bsdus-pa', 'کٹائی'],
  views:          ['views', 'बार देखा', 'ta-grangs', 'مرتبہ دیکھا'],
  seller:         ['Seller', 'बेचने वाला', 'Tsong-mkhan', 'بیچنے والا'],
  deals_done:     ['deals', 'सौदे', 'tsong-las', 'سودے'],
  chat_now:       ['Chat with seller', 'बात करें', 'Tam byed', 'بات کریں'],
  report:         ['Report this', 'शिकायत करें', 'Nyes-brjod', 'شکایت کریں'],
  reported:       ['Reported. Thank you.', 'शिकायत मिल गई। धन्यवाद।', 'Thob-song. Julley.', 'شکایت موصول ہوئی۔ شکریہ۔'],
  my_listing:     ['This is your listing', 'यह आपकी चीज़ है', 'Di khyorang-i yin', 'یہ آپ کی چیز ہے'],
  mark_sold:      ['Mark as sold', 'बिक गया', 'Tsong-tshar', 'فروخت ہو گیا'],
  pause_listing:  ['Pause', 'रोकें', 'Kag', 'روکیں'],
  resume_listing: ['Put back', 'फिर लगाएँ', 'Yang tang', 'دوبارہ لگائیں'],
  delete_listing: ['Remove', 'हटाएँ', 'Phyir-len', 'ہٹائیں'],

  // --- sell --------------------------------------------------------------
  sell_title:     ['Sell something', 'कुछ बेचें', 'Cha-lag tsong', 'کچھ بیچیں'],
  step_what:      ['What are you selling?', 'आप क्या बेच रहे हैं?', 'Khyorang chi tsong-in?', 'آپ کیا بیچ رہے ہیں؟'],
  step_price:     ['How much, and what price?', 'कितना और क्या भाव?', 'Tshad tang rin ga-tshod?', 'کتنا اور کیا قیمت؟'],
  step_photo:     ['Add a photo', 'फ़ोटो लगाएँ', 'Par tang', 'تصویر لگائیں'],
  step_deliver:   ['Can you deliver?', 'क्या आप पहुँचा सकते हैं?', 'Khyorang skyel-thub-a?', 'کیا آپ پہنچا سکتے ہیں؟'],
  price_label:    ['Price in ₹', '₹ में भाव', 'Rin ₹', 'قیمت ₹'],
  qty_label:      ['How much do you have?', 'कितना है आपके पास?', 'Khyorang-la ga-tshod yod?', 'آپ کے پاس کتنا ہے؟'],
  unit_label:     ['Sold by', 'किस हिसाब से', 'Tshad-gzhi', 'کس حساب سے'],
  note_label:     ['Anything to add? (optional)', 'कुछ और? (ज़रूरी नहीं)', 'Gzhan chig yod-na? (mi-gos kyang chog)', 'کچھ اور؟ (ضروری نہیں)'],
  note_ph:        ['e.g. picked this morning, no spray used', 'जैसे: आज सुबह तोड़ा, कोई दवा नहीं', 'Dper-na: de-ring zhogs-pa bsdus, sman med', 'مثلاً: آج صبح توڑا، کوئی دوا نہیں'],
  photo_help:     ['A clear photo sells much faster. Point at the crop in daylight.', 'साफ़ फ़ोटो से जल्दी बिकता है। दिन के उजाले में लें।', 'Par yag-po yod-na myur-du tsong. Nyi-ma-i od-la tong.', 'صاف تصویر جلدی بکتی ہے۔ دن کی روشنی میں لیں۔'],
  take_photo:     ['Take photo', 'फ़ोटो लें', 'Par gyab', 'تصویر لیں'],
  choose_photo:   ['Choose from gallery', 'गैलरी से चुनें', 'Gallery-nas dam', 'گیلری سے منتخب کریں'],
  skip_photo:     ['Skip photo', 'फ़ोटो छोड़ें', 'Par med-par song', 'تصویر چھوڑیں'],
  can_deliver:    ['Yes, I can deliver', 'हाँ, मैं पहुँचा सकता हूँ', 'Yin, nga skyel-thub', 'ہاں، میں پہنچا سکتا ہوں'],
  cannot_deliver: ['No, buyer collects', 'नहीं, ख़रीदार आकर ले जाए', 'Min, nyo-mkhan yong-ste khyer', 'نہیں، خریدار آ کر لے جائے'],
  publish:        ['Put it on the market', 'बाज़ार में लगाएँ', 'Tsongra-la tang', 'بازار میں لگائیں'],
  published:      ['Listed. Buyers can see it now.', 'लग गया। अब ख़रीदार देख सकते हैं।', 'Tang-tshar. Da nyo-mkhan-tshos mthong-thub.', 'لگ گیا۔ اب خریدار دیکھ سکتے ہیں۔'],
  back:           ['Back', 'पीछे', 'Phyir', 'واپس'],
  next:           ['Next', 'आगे', 'Phar', 'آگے'],

  // --- chat --------------------------------------------------------------
  chats_title:    ['Your chats', 'आपकी बातचीत', 'Khyorang-i tam', 'آپ کی بات چیت'],
  no_chats:       ['No chats yet', 'अभी कोई बात नहीं', 'Da-lta tam med', 'ابھی کوئی بات چیت نہیں'],
  no_chats_sub:   ['Find something in the bazaar and message the seller.', 'बाज़ार में कुछ चुनें और बेचने वाले से बात करें।', 'Tsongra-nas cha-lag dam-ste tsong-mkhan-la tam byed.', 'بازار سے کچھ منتخب کریں اور بیچنے والے سے بات کریں۔'],
  msg_ph:         ['Write a message…', 'संदेश लिखें…', 'Tam bri…', 'پیغام لکھیں…'],
  chat_opened:    ['Chat started. Agree on the price here, then phone numbers open up.', 'बातचीत शुरू। यहाँ भाव तय करें, फिर फ़ोन नंबर खुलेंगे।', 'Tam go-tshugs. Dir rin gtan-la phab-na phone number thon-yong.', 'بات چیت شروع۔ یہاں قیمت طے کریں، پھر فون نمبر کھلیں گے۔'],
  q_available:    ['Is this still available?', 'क्या यह अभी है?', 'Da-rung yod-a?', 'کیا یہ ابھی موجود ہے؟'],
  q_bestprice:    ['What is your best price?', 'आपका आख़िरी भाव क्या है?', 'Khyorang-i rin yag-shos ga-tshod?', 'آپ کی آخری قیمت کیا ہے؟'],
  q_deliver:      ['Can you deliver to my village?', 'क्या मेरे गाँव तक पहुँचा सकते हैं?', 'Nga-i yul-la skyel-thub-a?', 'کیا میرے گاؤں تک پہنچا سکتے ہیں؟'],
  q_when:         ['When was it harvested?', 'कब काटा गया?', 'Nam bsdus-pa yin?', 'کب کاٹا گیا؟'],
  q_take:         ['I will take it.', 'मैं ले लूँगा।', 'Nga-s len-in.', 'میں لے لوں گا۔'],
  q_julley:       ['Julley 🙏', 'जुले 🙏', 'Julley 🙏', 'جولے 🙏'],
  make_offer:     ['Offer a price', 'भाव लगाएँ', 'Rin tang', 'قیمت پیش کریں'],
  offered:        ['offers', 'भाव लगाया', 'rin tang-song', 'قیمت پیش کی'],
  agree_deal:     ['Agree the deal', 'सौदा पक्का करें', 'Tsong-las gtan-la phab', 'سودا پکا کریں'],
  deal_pending:   ['Waiting for the other side to agree', 'दूसरी तरफ़ के हाँ का इंतज़ार', 'Pha-rol-po-i yin-zer sgug-in', 'دوسری طرف کی ہاں کا انتظار'],
  deal_they_want: ['They have proposed this deal', 'उन्होंने यह सौदा रखा है', 'Khong-gis tsong-las di bshad-song', 'انہوں نے یہ سودا رکھا ہے'],
  deal_accept:    ['I agree', 'मैं राज़ी हूँ', 'Nga yang yin-zer', 'میں راضی ہوں'],
  deal_change:    ['Change the terms', 'शर्तें बदलें', 'Gan-rgya bsgyur', 'شرائط بدلیں'],
  deal_withdraw:  ['Withdraw', 'वापस लें', 'Phyir-len', 'واپس لیں'],
  deal_sealed:    ['Deal agreed', 'सौदा पक्का', 'Tsong-las gtan-la phab-song', 'سودا پکا'],
  deal_sealed_sub:['Phone numbers are now open. Call each other and finish it.', 'फ़ोन नंबर अब खुल गए। फ़ोन करके पूरा करें।', 'Phone number thon-song. Phone gyab-ste tshar-du chug.', 'فون نمبر اب کھل گئے۔ فون کر کے مکمل کریں۔'],
  deal_item:      ['Item', 'चीज़', 'Cha-lag', 'چیز'],
  deal_qty:       ['Quantity', 'मात्रा', 'Tshad', 'مقدار'],
  deal_rate:      ['Rate', 'भाव', 'Rin', 'نرخ'],
  deal_total:     ['Total', 'कुल', 'Bsdoms', 'کل'],
  deal_pickup:    ['Buyer collects', 'ख़रीदार ले जाएगा', 'Nyo-mkhan-gis khyer', 'خریدار لے جائے گا'],
  deal_delivery:  ['Seller delivers', 'बेचने वाला पहुँचाएगा', 'Tsong-mkhan-gis skyel', 'بیچنے والا پہنچائے گا'],
  call_now:       ['Call', 'फ़ोन करें', 'Phone gyab', 'فون کریں'],
  whatsapp:       ['WhatsApp', 'व्हाट्सएप', 'WhatsApp', 'واٹس ایپ'],
  pay_direct:     ['Tsongra never takes your money. Pay each other directly — cash, UPI, whatever you both trust.', 'सोंगरा आपका पैसा नहीं लेता। आपस में सीधे दें — नक़द, UPI, जो दोनों को ठीक लगे।', 'Tsongra-s dngul mi-len. Phan-tshun thad-kar ster — dngul-ngo, UPI, gang yag.', 'سونگرا آپ کا پیسہ نہیں لیتا۔ آپس میں براہِ راست دیں — نقد، UPI، جو دونوں کو ٹھیک لگے۔'],
  phone_locked:   ['Phone numbers open once you both agree on the deal.', 'दोनों के राज़ी होते ही फ़ोन नंबर खुलेंगे।', 'Gnyis-ka yin-zer-na phone number thon-yong.', 'دونوں کے راضی ہوتے ہی فون نمبر کھلیں گے۔'],
  rate_them:      ['How did it go?', 'सौदा कैसा रहा?', 'Tsong-las ga-dra byung?', 'سودا کیسا رہا؟'],
  rate_send:      ['Send rating', 'रेटिंग भेजें', 'Rating tang', 'ریٹنگ بھیجیں'],
  rated_thanks:   ['Thank you — this helps everyone.', 'धन्यवाद — इससे सबको मदद मिलती है।', 'Julley — di-s tsang-ma-la phan.', 'شکریہ — اس سے سب کو مدد ملتی ہے۔'],

  // --- seeds -------------------------------------------------------------
  seeds_title:    ['Seed Bank', 'बीज बैंक', 'Sa-bön Bank', 'بیج بینک'],
  seeds_intro:    ['Crops that do well in Ladakh\'s cold and dry — including ones almost nobody here grows yet.', 'लद्दाख़ की ठंड और सूखे में अच्छी उगने वाली फ़सलें — कुछ ऐसी भी जो यहाँ कोई नहीं उगाता।', 'Ladakh-i grang-mo tang skam-po-la yag-po skye-ba-i lo-tog — kha-shas su-yang ma-btab-pa.', 'لداخ کی سردی اور خشکی میں اچھی اُگنے والی فصلیں — کچھ ایسی بھی جو یہاں کوئی نہیں اُگاتا۔'],
  zone_pick:      ['Where is your land?', 'आपकी ज़मीन कहाँ है?', 'Khyorang-i zhing ga-ru yod?', 'آپ کی زمین کہاں ہے؟'],
  st_traditional: ['Grown here for centuries', 'सदियों से यहाँ', 'Dus-rabs mang-po-nas dir', 'صدیوں سے یہاں'],
  st_emerging:    ['New for Ladakh', 'लद्दाख़ के लिए नया', 'Ladakh-la sar-pa', 'لداخ کے لیے نیا'],
  st_rare:        ['High value, needs patience', 'ऊँचा दाम, धीरज चाहिए', 'Rin mtho, bzod-pa dgos', 'زیادہ قیمت، صبر درکار'],
  why_here:       ['Why it works here', 'यहाँ क्यों चलती है', 'Ci-phyir dir yag', 'یہاں کیوں چلتی ہے'],
  when_sow:       ['When to sow', 'कब बोएँ', 'Nam btab', 'کب بوئیں'],
  when_harvest:   ['When to harvest', 'कब काटें', 'Nam bsdu', 'کب کاٹیں'],
  how_care:       ['What to watch out for', 'किस बात का ध्यान रखें', 'Ci-la dgongs-pa byed', 'کس بات کا خیال رکھیں'],
  days_ready:     ['Days to ready', 'कितने दिन में तैयार', 'Zhag ga-tshod-la grub', 'کتنے دن میں تیار'],
  frost_tol:      ['Frost', 'पाला', 'Ba-mo', 'پالا'],
  water_need:     ['Water', 'पानी', 'Chu', 'پانی'],
  expect_yield:   ['Expected yield', 'अनुमानित उपज', 'Thon-skyed tshod-dpag', 'متوقع پیداوار'],
  expect_price:   ['What it sells for', 'क्या भाव मिलता है', 'Rin ga-tshod thob', 'کیا قیمت ملتی ہے'],
  where_seed:     ['Where to get seed', 'बीज कहाँ मिलेगा', 'Sa-bön ga-nas', 'بیج کہاں ملے گا'],
  who_sells:      ['Who is selling this near me', 'यह मेरे पास कौन बेच रहा है', 'Di nga-i nye-sa-ru su-s tsong', 'یہ میرے قریب کون بیچ رہا ہے'],
  calendar_title: ['Sowing calendar', 'बुआई कैलेंडर', 'Btab-pa-i lo-tho', 'بوائی کیلنڈر'],
  legend_sow:     ['Sow', 'बोएँ', 'Btab', 'بوئیں'],
  legend_harv:    ['Harvest', 'काटें', 'Bsdu', 'کاٹیں'],
  not_here:       ['Not suited to this zone', 'इस इलाक़े के लिए नहीं', 'Sa-khul di-la mi-os', 'اس علاقے کے لیے نہیں'],

  // --- account -----------------------------------------------------------
  welcome:        ['Julley — welcome', 'जुले — स्वागत है', 'Julley — legs-so', 'جولے — خوش آمدید'],
  pick_lang:      ['Choose your language', 'अपनी भाषा चुनें', 'Khyorang-i skad dam', 'اپنی زبان منتخب کریں'],
  signup:         ['Create account', 'खाता बनाएँ', 'Account sar-pa', 'اکاؤنٹ بنائیں'],
  login:          ['Log in', 'लॉग इन', 'Log in', 'لاگ اِن'],
  your_name:      ['Your name', 'आपका नाम', 'Khyorang-i ming', 'آپ کا نام'],
  phone_label:    ['Mobile number', 'मोबाइल नंबर', 'Mobile number', 'موبائل نمبر'],
  pin_label:      ['Set a 4-digit PIN', '4 अंकों का PIN बनाएँ', 'PIN grangs-bzhi bzo', '4 ہندسوں کا PIN بنائیں'],
  pin_login:      ['Your PIN', 'आपका PIN', 'Khyorang-i PIN', 'آپ کا PIN'],
  district_label: ['District', 'ज़िला', 'Rdzong', 'ضلع'],
  village_label:  ['Village or town', 'गाँव या क़स्बा', 'Yul-tsho', 'گاؤں یا قصبہ'],
  role_label:     ['What will you use this for?', 'आप इसे किसलिए इस्तेमाल करेंगे?', 'Khyorang-gis chi-la spyod?', 'آپ اسے کس لیے استعمال کریں گے؟'],
  role_buyer:     ['Buying only', 'सिर्फ़ ख़रीदना', 'Nyo-ba kho-na', 'صرف خریدنا'],
  role_seller:    ['Selling my produce', 'अपनी उपज बेचना', 'Rang-gi thon-skyed tsong', 'اپنی پیداوار بیچنا'],
  role_both:      ['Both', 'दोनों', 'Gnyis-ka', 'دونوں'],
  have_account:   ['I already have an account', 'मेरा खाता पहले से है', 'Nga-la account yod-zin', 'میرا اکاؤنٹ پہلے سے ہے'],
  new_here:       ['New here? Create an account', 'नए हैं? खाता बनाएँ', 'Sar-pa yin-na account bzo', 'نئے ہیں؟ اکاؤنٹ بنائیں'],
  phone_never:    ['Your number stays hidden until you and a buyer agree on a deal.', 'सौदा पक्का होने तक आपका नंबर छिपा रहता है।', 'Tsong-las gtan-la ma-phab bar-du khyorang-i number sbas-nas yod.', 'سودا پکا ہونے تک آپ کا نمبر چھپا رہتا ہے۔'],

  me_title:       ['My account', 'मेरा खाता', 'Nga-i account', 'میرا اکاؤنٹ'],
  my_listings:    ['My listings', 'मेरी चीज़ें', 'Nga-i cha-lag', 'میری اشیاء'],
  delivery_setup: ['Delivery settings', 'डिलीवरी सेटिंग', 'Skyel-dren setting', 'ترسیل کی ترتیبات'],
  delivery_on:    ['I offer delivery', 'मैं डिलीवरी देता हूँ', 'Nga-s skyel-dren byed', 'میں ترسیل کرتا ہوں'],
  delivery_on_sub:['Turn this on and buyers in the areas you pick will see a "Delivers" mark on everything you list.', 'यह चालू करें और आपके चुने इलाक़ों के ख़रीदारों को हर चीज़ पर "पहुँचाते हैं" दिखेगा।', 'Di on byas-na khyorang-gis dam-pa-i sa-khul-gyi nyo-mkhan-tshos "skyel-thub" mthong-yong.', 'یہ آن کریں اور آپ کے منتخب علاقوں کے خریداروں کو ہر چیز پر "ترسیل" نظر آئے گا۔'],
  delivery_where: ['Where do you deliver?', 'आप कहाँ पहुँचाते हैं?', 'Khyorang ga-ru skyel-thub?', 'آپ کہاں پہنچاتے ہیں؟'],
  delivery_fee:   ['Delivery charge ₹', 'डिलीवरी शुल्क ₹', 'Skyel-gla ₹', 'ترسیل کی فیس ₹'],
  free_above:     ['Free above ₹ (0 = never free)', '₹ से ऊपर मुफ़्त (0 = कभी नहीं)', 'Rin ₹ yan-chad rin-med (0 = med)', '₹ سے اوپر مفت (0 = کبھی نہیں)'],
  delivery_note:  ['Anything buyers should know', 'ख़रीदार को क्या पता होना चाहिए', 'Nyo-mkhan-gyis shes dgos-pa', 'خریدار کو کیا معلوم ہونا چاہیے'],
  delivery_note_ph:['e.g. I come to Leh on Tuesdays and Fridays', 'जैसे: मैं मंगल और शुक्र को लेह आता हूँ', 'Dper-na: nga mig-dmar tang pa-sangs-la Leh-la yong', 'مثلاً: میں منگل اور جمعہ کو لیہہ آتا ہوں'],
  save:           ['Save', 'सहेजें', 'Nyar', 'محفوظ کریں'],
  saved:          ['Saved', 'सहेजा गया', 'Nyar-tshar', 'محفوظ ہو گیا'],
  logout:         ['Log out', 'लॉग आउट', 'Log out', 'لاگ آؤٹ'],
  install_app:    ['Install on your phone', 'फ़ोन में इंस्टॉल करें', 'Phone-la install byed', 'فون میں انسٹال کریں'],
  install_sub:    ['Works without internet for saved pages and the whole Seed Bank.', 'सहेजे पन्ने और पूरा बीज बैंक बिना इंटरनेट चलते हैं।', 'Nyar-ba-i shog-bu tang Sa-bön Bank internet med-par kyang khyab.', 'محفوظ صفحات اور پورا بیج بینک بغیر انٹرنیٹ چلتے ہیں۔'],
  install_ios:    ['On iPhone: tap Share ⬆️, then “Add to Home Screen”.', 'आईफ़ोन पर: Share ⬆️ दबाएँ, फिर “Add to Home Screen”।', 'iPhone-la: Share ⬆️ non-te, “Add to Home Screen” dam.', 'آئی فون پر: Share ⬆️ دبائیں، پھر “Add to Home Screen”۔'],
  install_android:['Tap the ⋮ menu in your browser, then “Install app”.', 'ब्राउज़र में ⋮ मेन्यू दबाएँ, फिर “Install app”।', 'Browser-i ⋮ menu non-te, “Install app” dam.', 'براؤزر میں ⋮ مینو دبائیں، پھر “Install app”۔'],
  install_done:   ['Installed ✓', 'इंस्टॉल हो गया ✓', 'Install byas-tshar ✓', 'انسٹال ہو گیا ✓'],
  install_later:  ['Not now', 'अभी नहीं', 'Da-lta min', 'ابھی نہیں'],
  language:       ['Language', 'भाषा', 'Skad', 'زبان'],

  // --- rates & wanted ----------------------------------------------------
  report_price:   ['Report a price', 'भाव बताएँ', 'Rin bshad', 'قیمت بتائیں'],
  report_price_sub:['Tell everyone what you were paid or charged today. It keeps prices honest.', 'बताएँ आज क्या भाव मिला। इससे भाव सही रहते हैं।', 'De-ring rin ga-tshod byung bshad. Di-s rin drang-po nyar.', 'بتائیں آج کیا قیمت ملی۔ اس سے نرخ درست رہتے ہیں۔'],
  market_label:   ['Which market', 'कौन सा बाज़ार', 'Tsongra gang', 'کون سی منڈی'],
  median_price:   ['Usual price', 'आम भाव', 'Rgyun-gyi rin', 'عام قیمت'],
  from_reports:   ['reports', 'रिपोर्ट', 'bshad-pa', 'رپورٹس'],
  post_wanted:    ['Post what you need', 'अपनी ज़रूरत डालें', 'Gos-pa tang', 'اپنی ضرورت ڈالیں'],
  wanted_qty:     ['How much do you need?', 'कितना चाहिए?', 'Ga-tshod gos?', 'کتنا چاہیے؟'],
  i_have_this:    ['I have this', 'यह मेरे पास है', 'Di nga-la yod', 'یہ میرے پاس ہے'],

  // --- generic -----------------------------------------------------------
  loading:        ['Loading…', 'लोड हो रहा है…', 'Skye-in…', 'لوڈ ہو رہا ہے…'],
  retry:          ['Try again', 'फिर कोशिश करें', 'Yang bad', 'دوبارہ کوشش کریں'],
  cancel:         ['Cancel', 'रद्द करें', 'Phyir-thin', 'منسوخ کریں'],
  confirm:        ['Confirm', 'पक्का करें', 'Gtan-la phab', 'تصدیق کریں'],
  close:          ['Close', 'बंद करें', 'Sgo rgyab', 'بند کریں'],
  need_login:     ['Please log in first', 'पहले लॉग इन करें', 'Thog-mar log in byed', 'پہلے لاگ اِن کریں'],
  today:          ['today', 'आज', 'de-ring', 'آج'],
  yesterday:      ['yesterday', 'कल', 'kha-sang', 'کل'],
  days_ago:       ['days ago', 'दिन पहले', 'zhag sngon', 'دن پہلے'],
};

let cur = 0;
const idx = { en: 0, hi: 1, lbj: 2, ur: 3 };

export function setLang(key) {
  cur = idx[key] ?? 0;
  const lang = LANGS[cur];
  document.documentElement.lang = lang.key === 'lbj' ? 'bo' : lang.key;
  document.documentElement.dir = lang.dir;
  try { localStorage.setItem('tsongra.lang', key); } catch {}
}

export function getLang() { return LANGS[cur].key; }
export function isRTL() { return LANGS[cur].dir === 'rtl'; }

export function t(key) {
  const row = S[key];
  if (!row) return key;
  return row[cur] || row[0];
}

export function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('tsongra.lang'); } catch {}
  setLang(saved && idx[saved] !== undefined ? saved : 'en');
  return !saved;
}
