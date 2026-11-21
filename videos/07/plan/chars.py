# Locked character blocks for video 07. Each token in shots.py is replaced by its block, word for word.
BASE = ("Cinematic realistic historical film still, 16:9, ancient Elam and Mesopotamia, palette of deep lapis-lazuli blue and burnt terracotta "
        "with warm gold highlights, low-key dramatic lighting, oil-lamp and torch glow, volumetric dust and smoke, shallow depth of field, "
        "35mm anamorphic lens, subtle film grain, historically accurate costume and architecture, no text, no letters, no logos, no watermark, "
        "no modern objects, no cartoon, no knitted or fur hats, no modern brimmed hats.")

# name: (persian title, role, era, block)
C = {
"SCRIBE": ("کاتب (ساختگی)", "قهرمان نمادین؛ اول و آخر فیلم", "۶۴۶ پ.م",
  "a young Elamite temple scribe about 20 years old, thin oval face, large dark almond eyes, thick black eyebrows, a small pale scar on the chin, "
  "short black curly hair held by a thin ochre cloth headband tied at the back, sparse young beard, clay-stained fingertips, "
  "plain undyed wool tunic to the knees with a fringed hem and a narrow red belt"),
"ASHURBANIPAL": ("آشوربانیپال، شاه آشور", "شخصیت منفی اصلی", "۶۵۳ تا ۶۴۵ پ.م",
  "Ashurbanipal king of Assyria, about 40 years old, hawk-like nose, narrow cold eyes lined with black kohl, long rectangular black beard curled in tight horizontal rows "
  "with a few gold rings woven in, shoulder-length curled hair, tall truncated-cone white-and-gold royal tiara with a small point on top and two long ribbons behind, "
  "heavy fringed robe embroidered with rosettes in red and gold, gold rosette bracelets on both wrists, a dagger in his belt"),
"ASSYRIAN-QUEEN": ("ملکه‌ی آشور (لیبالی‌شرت)", "صحنه‌ی جشن باغ", "۶۴۵ پ.م",
  "Libbali-sharrat queen of Assyria, about 35, calm face, black hair under a crenellated city-wall crown, long fringed robe with rosettes, heavy gold necklaces"),
"SHAMASH-SHUM-UKIN": ("شمش‌شوم‌اوکین، برادر بزرگ، شاه بابل", "جنگ دو برادر", "۶۵۲ تا ۶۴۸ پ.م",
  "Shamash-shum-ukin king of Babylon, about 45, same family face as Ashurbanipal but heavier and older, tired resentful eyes, shorter curled black beard with grey at the chin, "
  "tall rounded Babylonian royal cap with a gold band, long fringed robe in deep orange and blue"),
"ESARHADDON": ("اسرحدون، پدرشان", "بستر مرگ", "۶۶۹ پ.م",
  "Esarhaddon old king of Assyria, about 60, sick and pale, long white curled beard in horizontal rows, royal tiara set aside on a table, white linen robe"),
"TEUMMAN": ("تئومان، شاه ایلام", "نبرد اولای", "۶۵۳ پ.م",
  "Teumman king of Elam, about 50, strongly receding hairline with short grey hair at the back, broad royal headband tied at the back, short grey pointed beard, "
  "tired sunken eyes, knee-length fringed royal tunic in dark blue with gold edging, a large bow, in battle wounded by an arrow in his back"),
"HUMBAN-HALTASH": ("هومبان هلتاش (اومن‌الداش)، شاه ایلام", "فرار و ارابه", "۶۴۶ تا ۶۴۵ پ.م",
  "Humban-haltash III king of Elam, about 40, gaunt face, hollow cheeks, short black beard, black hair bound by a narrow royal headband, haunted eyes, "
  "dark red fringed tunic; when captured: the same face, dirty, torn tunic, the headband gone leaving a pale mark on the forehead"),
"UNTASH": ("اونتاش ناپیریشا، شاه ایلام", "سازنده‌ی چغازنبیل", "حدود ۱۲۵۰ پ.م",
  "Untash-Napirisha king of Elam, about 45, calm wise face, long full black beard in vertical ripples, low rounded royal cap of smooth dark felt that hugs the skull, with a narrow rolled brim and a thin gold band (ancient Elamite royal cap, not a modern brimmed hat), "
  "ankle-length wool robe with heavy fringed hem and a shawl wrapped over one shoulder, a bronze mace with a gold head, gold armlets"),
"NAPIRASU": ("ناپیرآسو، ملکه", "مجسمه و نفرین", "حدود ۱۲۵۰ پ.م",
  "Napir-Asu queen of Elam, about 35, oval calm face, straight nose, dark eyes, black hair gathered under a fine veil, hands clasped at the waist, "
  "short-sleeved fitted gown and a bell-shaped ankle-length skirt with rows of fringes and an embroidered hem, many thin bracelets"),
"SHUTRUK": ("شوتروک ناهونته، شاه ایلام", "غارت بابل", "حدود ۱۱۵۸ پ.م",
  "Shutruk-Nahhunte king of Elam, about 50, hard ambitious face, deep-set eyes, broad shoulders, long black beard streaked with grey and tied at the end, "
  "brimless tall round cap with a gold band, dark robe with red fringes, a bronze sword at the hip"),
"PUZUR": ("پوزور اینشوشیناک", "اولین قهرمان ایلام", "حدود ۲۱۰۰ پ.م",
  "Puzur-Inshushinak ruler of Elam, about 40, broad nose, fierce bright eyes, full black beard, a close-fitting smooth felt skullcap with a rolled rim (no fur, no knitted texture), long fringed robe over one shoulder, a copper mace"),
"IBBI-SIN": ("ایبی‌سین، شاه اور", "سقوط اور", "حدود ۲۰۰۴ پ.م",
  "Ibbi-Sin last king of Ur, about 45, Sumerian king with a full long beard, round royal cap of smooth felt with a thick rolled brim (no knitted texture), long tufted wool robe over the left shoulder, a defeated proud face"),
"SARGON": ("سارگون اکدی", "امپراتوری اکد", "حدود ۲۳۰۰ پ.م",
  "Sargon of Akkad, about 50, stern face, elaborately braided long beard, hair gathered in a bun at the back held by a headband, long robe, a curved bronze sickle-sword"),
"HAMMURABI": ("حمورابی، شاه بابل", "دشمن ایلام", "حدود ۱۷۶۴ پ.م",
  "Hammurabi king of Babylon around 1760 BCE, about 45, long rectangular beard, low round cap of smooth felt with a thick rolled brim (no crown, no feathers), plain long robe draped over one shoulder, right hand raised in a gesture of respect, in a plain sun-dried mud-brick palace (no blue glazed bricks, no lion reliefs)"),
"NEBUCHADNEZZAR": ("نبوکدنصر یکم، شاه بابل", "انتقام مردوخ", "حدود ۱۱۱۰ پ.م",
  "Nebuchadnezzar I king of Babylon around 1110 BCE, about 40, intense determined face, long black beard, tall smooth cylindrical royal cap with a small crest at the top, belted fringed robe, a bronze sword, in a plain mud-brick hall (no blue glazed bricks, no lion or dragon reliefs, no Ishtar Gate)"),
"CYRUS": ("کوروش", "شاه انشان", "۵۶۰ تا ۵۳۹ پ.م",
  "Cyrus the Great, about 40, calm intelligent face, short rounded black beard, dark eyes, simple Persian court robe with wide sleeves, a plain fluted gold-trimmed cap; "
  "as a young prince around 560 BCE: about 20, light beard, riding cloak"),
"PERSIAN-SCRIBE": ("کاتب هخامنشی", "آخر فیلم", "حدود ۵۰۰ پ.م",
  "an Achaemenid scribe about 30, neat squared black beard, tall smooth fluted felt cap with vertical pleats (Achaemenid style, no knitted texture), Persian court robe with wide pleated sleeves, writing Elamite cuneiform on a clay tablet with a reed stylus"),
# generic soldiers and people (types, not faces)
"ELAMITE-SOLDIER-OLD": ("سرباز ایلامی کهن", "", "۲۳۰۰ تا ۱۷۰۰ پ.م",
  "early Elamite infantrymen around 2000 BCE, bearded, leather caps or bare heads, wool kilts, tall rectangular hide shields, long spears, copper axes, war carts pulled by onagers, no horses"),
"ELAMITE-SOLDIER-MIDDLE": ("سرباز ایلامی میانه", "", "حدود ۱۱۵۰ پ.م",
  "Middle Elamite soldiers around 1150 BCE, bearded, simple domed bronze helmets, belted fringed tunics, composite bows, bronze spears, light two-wheeled chariots"),
"ELAMITE-SOLDIER-NEO": ("سرباز ایلامی نو", "", "قرن ۷ پ.م",
  "Neo-Elamite soldiers of the 7th century BCE, short hair bound with broad cloth headbands tied in a knot at the back, short beards, knee-length belted tunics, "
  "large composite bows and quivers, short daggers, no helmets"),
"ASSYRIAN-SOLDIER": ("سرباز آشوری", "", "قرن ۷ پ.م",
  "Neo-Assyrian soldiers, pointed conical iron helmets, scale-lamellar armor shirts, long curled black beards, short kilts, round wicker or bronze shields, long spears, laced boots"),
"BABYLONIAN-SOLDIER": ("سرباز بابلی", "", "حدود ۱۱۰۰ پ.م",
  "Babylonian soldiers of the 12th century BCE, long beards, simple domed bronze helmets, belted wool tunics, bronze sickle-swords and spears, wicker shields"),
"AKKADIAN-SOLDIER": ("سرباز اکدی", "", "حدود ۲۳۰۰ پ.م",
  "Akkadian soldiers around 2300 BCE, bearded, conical leather helmets, kilts, bows and spears, war carts pulled by onagers, no horses"),
"SUMERIAN": ("مردم و سربازان سومری", "", "حدود ۲۱۰۰ تا ۲۰۰۰ پ.م",
  "Sumerian people of Ur around 2000 BCE, men with shaved heads or long beards, tufted wool kilts, women in long wrapped robes"),
"ELAMITE-PRIEST": ("کاهن ایلامی", "", "همه‌ی دوره‌ها",
  "Elamite priests with shaved heads and long fringed white wool robes, carrying torches and offering bowls"),
}
