import { RadicalInfo } from "../types";

export const RADICALS_DATA: RadicalInfo[] = [
  {
    id: "water",
    name: "Water",
    symbol: "水",
    variants: ["氵", "氺"],
    kanjiList: ["水", "海", "活", "汽", "池", "泳", "温", "漢", "決", "湖", "港", "消", "深", "注", "湯", "波", "氷", "油", "洋", "流", "求", "泣", "漁", "治", "清", "浅", "法", "満", "浴", "永", "液", "演", "河", "潔", "減", "混", "準", "測", "沿", "激", "源", "済", "泉", "洗", "潮", "派", "汚", "汗", "況", "沼", "浸", "沢", "濁", "淡", "沖", "澄", "沈", "滴", "添", "渡", "濃", "泊", "浜", "浮", "漫", "溶", "涙", "滑", "湿", "潤", "瀬", "潜", "滞", "滝", "泌", "漂", "没", "滅", "濫", "浪", "漏", "湾", "浦", "渦", "涯", "潟", "渇", "渓", "江", "洪", "溝", "滋", "漆", "汁", "渋", "淑", "渉", "浄", "津", "漸", "濯", "漬", "泥", "洞", "漠", "沸", "泡", "涼", "淫", "潰", "沙", "汰", "溺", "氾", "汎", "湧", "沃", "泰"],
    meaning: "Water, liquid, flow",
    description: "Represents water, rivers, liquid, and items or states with flowing, wet, clean, or cold qualities."
  },
  {
    id: "person",
    name: "Person",
    symbol: "人",
    variants: ["亻", "𠆢"],
    kanjiList: ["人", "休", "何", "会", "今", "作", "体", "係", "仕", "使", "住", "他", "代", "倍", "以", "位", "億", "健", "候", "借", "信", "倉", "側", "仲", "低", "停", "伝", "働", "付", "便", "令", "例", "仮", "価", "件", "個", "似", "修", "像", "任", "備", "俵", "仏", "保", "余", "供", "傷", "仁", "値", "俳", "優", "依", "偉", "介", "儀", "仰", "傾", "伺", "侵", "僧", "俗", "倒", "傍", "佳", "企", "偶", "倹", "債", "催", "侍", "伸", "促", "伐", "伴", "伏", "倣", "偽", "傑", "佐", "傘", "儒", "俊", "償", "仙", "但", "偵", "伯", "侮", "併", "偏", "俸", "僕", "僚", "倫", "俺", "伎", "僅", "傲", "侶"],
    meaning: "Human, person, society",
    description: "Associated with human actions, occupations, relationships, states of being, and bodily posture."
  },
  {
    id: "hand",
    name: "Hand",
    symbol: "手",
    variants: ["扌"],
    kanjiList: ["手", "才", "指", "持", "拾", "打", "投", "挙", "折", "技", "採", "授", "招", "承", "接", "損", "提", "拡", "揮", "捨", "推", "操", "担", "探", "拝", "批", "握", "扱", "援", "押", "拠", "掘", "撃", "抗", "振", "拓", "抵", "摘", "拍", "抜", "搬", "描", "払", "捕", "抱", "掛", "換", "掲", "携", "拘", "控", "搾", "撮", "擦", "掌", "摂", "措", "掃", "択", "抽", "排", "揚", "揺", "擁", "抑", "拐", "括", "擬", "拒", "挟", "拷", "抄", "据", "拙", "捜", "挿", "挑", "撤", "搭", "把", "披", "扶", "撲", "摩", "抹", "挨", "拳", "挫", "拶", "摯", "拭", "捉", "捗", "捻", "拉"],
    meaning: "Hand, action, manual force",
    description: "Indicates manual labor, physical touch, carrying, pulling, gestures, and active physical manipulation."
  },
  {
    id: "tree",
    name: "Tree",
    symbol: "木",
    variants: ["木"],
    kanjiList: ["木", "本", "林", "森", "校", "村", "楽", "東", "来", "横", "橋", "業", "根", "植", "柱", "板", "様", "案", "栄", "果", "械", "機", "極", "材", "札", "松", "束", "梅", "標", "末", "未", "桜", "格", "検", "構", "査", "枝", "条", "株", "机", "権", "樹", "染", "棒", "枚", "模", "朽", "枯", "朱", "柔", "桃", "杯", "柄", "欄", "架", "概", "棋", "棄", "桑", "某", "楼", "核", "棺", "栽", "桟", "枢", "杉", "析", "栓", "槽", "棚", "棟", "朴", "柳", "枠", "椅", "楷", "柿", "桁", "梗", "柵", "椎", "栃", "梨", "枕", "麓"],
    meaning: "Tree, wood, forest",
    description: "Represents wood, plants, trees, forest structures, construction materials, and wooden tools."
  },
  {
    id: "heart",
    name: "Heart",
    symbol: "心",
    variants: ["忄", "㣺"],
    kanjiList: ["心", "思", "悪", "意", "感", "急", "想", "息", "悲", "愛", "念", "必", "応", "恩", "快", "慣", "志", "情", "性", "態", "憲", "忠", "忘", "憶", "恐", "恵", "恒", "惨", "慎", "恥", "怒", "悩", "怖", "忙", "慢", "慮", "恋", "惑", "慰", "悦", "怪", "悔", "慨", "忌", "愚", "憩", "悟", "慌", "恨", "慈", "惜", "憎", "怠", "慕", "憂", "懐", "患", "憾", "恭", "慶", "懸", "懇", "愁", "惰", "懲", "悼", "忍", "憤", "愉", "悠", "怨", "惧", "憬", "恣", "憧", "慄"],
    meaning: "Heart, mind, emotion",
    description: "Represents human feelings, thoughts, internal psychological states, memory, morals, and emotions."
  },
  {
    id: "mouth",
    name: "Mouth",
    symbol: "口",
    variants: ["口"],
    kanjiList: ["口", "右", "名", "古", "合", "台", "同", "員", "君", "向", "号", "商", "品", "味", "命", "問", "和", "各", "喜", "器", "告", "史", "司", "周", "唱", "可", "句", "吸", "呼", "善", "否", "含", "叫", "咲", "召", "吹", "嘆", "吐", "唐", "噴", "哀", "喚", "吉", "喫", "啓", "嘱", "哲", "吏", "嚇", "喝", "吟", "呉", "唆", "嗣", "唇", "喪", "呈", "唯", "咽", "唄", "嗅", "喉", "叱", "呪", "唾", "嘲", "哺", "喩", "呂"],
    meaning: "Mouth, speech, opening",
    description: "Relates to talking, eating, breathing, openings, command vocalization, and vessels/products."
  },
  {
    id: "say",
    name: "To Say",
    symbol: "言",
    variants: ["言"],
    kanjiList: ["言", "記", "計", "語", "読", "話", "詩", "談", "調", "課", "議", "訓", "試", "説", "許", "護", "講", "識", "謝", "証", "設", "評", "警", "誤", "詞", "誌", "諸", "誠", "誕", "討", "認", "訪", "訳", "論", "詰", "誇", "詳", "訴", "誉", "謡", "詠", "該", "諮", "譲", "請", "託", "諾", "訂", "謀", "誘", "謁", "謹", "謙", "詐", "訟", "詔", "診", "誓", "謄", "譜", "諭", "諧", "詣", "詮", "誰", "諦", "謎", "訃"],
    meaning: "Words, speech, language",
    description: "Denotes verbal communication, books, language, plans, debates, trials, and intellectual interactions."
  },
  {
    id: "thread",
    name: "Thread",
    symbol: "糸",
    variants: ["糸"],
    kanjiList: ["糸", "絵", "細", "紙", "線", "組", "級", "終", "緑", "練", "紀", "給", "結", "続", "約", "経", "織", "績", "絶", "素", "総", "統", "編", "綿", "系", "絹", "紅", "縦", "縮", "純", "納", "維", "緯", "縁", "繰", "継", "紫", "紹", "繁", "網", "紋", "絡", "緩", "緊", "絞", "綱", "紺", "繕", "締", "縛", "紛", "縫", "糾", "繭", "索", "緒", "縄", "紳", "繊", "紡", "累", "綻", "緻"],
    meaning: "Thread, fiber, connection",
    description: "Implies fine strings, rope, weaving, textiles, colors, relations, systematic linkage, and continuity."
  },
  {
    id: "path",
    name: "Path",
    symbol: "辶",
    variants: ["辶"],
    kanjiList: ["道", "遠", "近", "週", "通", "運", "進", "送", "速", "追", "返", "遊", "選", "達", "辺", "連", "過", "逆", "述", "造", "退", "適", "迷", "遺", "違", "迎", "遣", "込", "遅", "途", "逃", "透", "迫", "避", "遇", "遵", "遂", "遭", "逮", "逸", "還", "遮", "迅", "逝", "遷", "逐", "逓", "迭", "遍", "遡", "遜"],
    meaning: "Road, motion, walking",
    description: "Depicts travel, walking, advance, retreating, distance, and time passing."
  },
  {
    id: "ground",
    name: "Ground",
    symbol: "土",
    variants: ["土"],
    kanjiList: ["土", "場", "地", "坂", "塩", "型", "堂", "圧", "基", "境", "均", "在", "増", "墓", "報", "域", "城", "垂", "壊", "堅", "執", "堤", "塔", "壁", "坊", "塊", "坑", "墾", "壇", "墜", "塗", "墳", "墨", "埋", "垣", "堪", "塾", "壌", "塑", "堕", "塚", "坪", "培", "塀", "堀", "塁", "塞", "埼", "堆", "填"],
    meaning: "Soil, earth, place",
    description: "Related to land, territory, physical foundations, mounds of clay, structures, and local spots."
  },
  {
    id: "plant",
    name: "Plant",
    symbol: "サ",
    variants: ["サ", "艹"],
    kanjiList: ["花", "草", "茶", "荷", "苦", "薬", "葉", "落", "英", "芽", "芸", "菜", "若", "蒸", "蔵", "著", "芋", "菓", "荒", "芝", "薪", "蓄", "薄", "茂", "華", "菊", "葬", "藩", "苗", "芳", "菌", "薫", "茎", "薦", "荘", "藻", "萎", "茨", "苛", "蓋", "葛", "芯", "藤", "蔽", "蔑", "藍"],
    meaning: "Herb, vegetation, grass",
    description: "Indicates herbs, agricultural crops, flowers, weeds, medicines, or vegetative qualities."
  },
  {
    id: "meat",
    name: "Meat",
    symbol: "肉",
    variants: ["月"],
    kanjiList: ["肉", "育", "胃", "腸", "脈", "能", "肥", "胸", "臓", "脳", "背", "肺", "腹", "脚", "肩", "脂", "脱", "胴", "腐", "膚", "肪", "腰", "腕", "肝", "脅", "胎", "胆", "胞", "膨", "膜", "肯", "肢", "肖", "肌", "臆", "股", "腫", "腎", "脊", "腺", "膳", "膝", "肘", "脇"],
    meaning: "Meat, body, physical organ",
    description: "Primarily written as the character for 'moon' on the left side, representing animal tissues and human anatomy."
  },
  {
    id: "city-wall",
    name: "City Wall",
    symbol: "阜",
    variants: ["阝"],
    kanjiList: ["都", "部", "郡", "郷", "郵", "郎", "郭", "郊", "邪", "邦", "邸", "那", "阜", "院", "階", "陽", "隊", "陸", "険", "限", "際", "防", "降", "除", "障", "陛", "陰", "隠", "陣", "隣", "隔", "随", "阻", "陳", "陶", "陪", "隆", "陵", "陥", "隅", "附", "隙", "阪"],
    meaning: "Wall, mound, boundary",
    description: "Indicates hills, high steps, barriers, fortifications, partitions, and regional centers."
  },
  {
    id: "sun",
    name: "Sun",
    symbol: "日",
    variants: ["日"],
    kanjiList: ["日", "早", "時", "春", "星", "晴", "昼", "明", "曜", "暗", "暑", "昭", "昔", "景", "昨", "易", "旧", "暴", "映", "暖", "晩", "暮", "暇", "旨", "旬", "是", "曇", "普", "暦", "暫", "昇", "晶", "暁", "昆", "曖", "旺", "旦", "昧"],
    meaning: "Sun, day, light, time",
    description: "Relates to daylight, time sequences, solar positions, brightness, and seasons."
  },
  {
    id: "woman",
    name: "Woman",
    symbol: "女",
    variants: ["女"],
    kanjiList: ["女", "姉", "妹", "委", "始", "好", "妻", "婦", "姿", "威", "婚", "姓", "奴", "妙", "娘", "嫁", "娯", "如", "嬢", "婿", "婆", "姫", "妨", "姻", "嫌", "妊娠", "妥", "嫡", "妊", "媒", "妃", "妄", "媛", "嫉", "妬", "妖"],
    meaning: "Woman, feminine, family",
    description: "Related to women, birth, marital status, relationships, and ancient gender classifications."
  },
  {
    id: "roof",
    name: "Roof",
    symbol: "宀",
    variants: ["宀"],
    kanjiList: ["家", "室", "安", "寒", "客", "宮", "実", "守", "宿", "定", "害", "完", "官", "察", "寄", "富", "容", "宇", "宗", "宣", "宅", "宙", "宝", "密", "寂", "寝", "宴", "審", "寡", "寛", "宜", "宰", "宵", "寧", "寮", "宛"],
    meaning: "Roof, shelter, indoor state",
    description: "Denotes buildings, rooms, safe structures, households, or conditions kept indoors."
  },
  {
    id: "shell",
    name: "Shell",
    symbol: "貝",
    variants: ["貝"],
    kanjiList: ["貝", "買", "負", "貨", "賞", "貯", "費", "格", "財", "賛", "資", "質", "責", "貸", "貧", "貿", "貴", "賃", "贈", "販", "賦", "貫", "賢", "賊", "貢", "購", "賜", "貞", "賠", "賓", "賄", "貼", "賭", "貪", "賂"],
    meaning: "Shell, money, trade value",
    description: "Rooted in ancient cowrie shells used as currency. Relates to assets, purchase, debts, and finance."
  },
  {
    id: "metal",
    name: "Metal",
    symbol: "金",
    variants: ["金"],
    kanjiList: ["金", "銀", "鉄", "鏡", "録", "鉱", "銭", "銅", "鋼", "針", "鋭", "鉛", "鑑", "鎖", "鈍", "錯", "鐘", "錠", "鍛", "鋳", "鎮", "錬", "銃", "釣", "鉢", "銘", "鈴", "釜", "鎌", "錦", "鍵", "錮", "鍋"],
    meaning: "Metal, gold, hard tool",
    description: "Denotes minerals, currency, metallic tools, containers, weapons, and iron craftsmanship."
  },
  {
    id: "sword",
    name: "Sword",
    symbol: "刀",
    variants: ["刂"],
    kanjiList: ["刀", "切", "前", "分", "列", "刷", "初", "副", "別", "利", "刊", "券", "制", "則", "判", "割", "劇", "刻", "創", "刈", "剣", "剤", "刺", "到", "刑", "削", "剛", "剰", "刃", "剖", "刹", "剥"],
    meaning: "Knife, blade, clean cut",
    description: "Associated with cutting, dividing, sharp blades, laws, physical separations, and surgical craft."
  },
  {
    id: "fire",
    name: "Fire",
    symbol: "火",
    variants: ["灬"],
    kanjiList: ["火", "点", "炭", "焼", "照", "然", "灯", "熱", "無", "災", "燃", "灰", "熟", "為", "煙", "煮", "燥", "爆", "烈", "炎", "焦", "炊", "炉", "煩", "熊", "煎"],
    meaning: "Fire, heat, combustion",
    description: "Represents flame, heat, illumination, dynamic energy, cooking, dry state, or fiery destruction."
  },
  {
    id: "bamboo",
    name: "Bamboo",
    symbol: "竹",
    variants: ["竹"],
    kanjiList: ["竹", "算", "答", "第", "笛", "等", "箱", "筆", "管", "笑", "節", "築", "簡", "筋", "策", "箇", "範", "籍", "篤", "符", "簿", "筒", "箋", "箸", "籠"],
    meaning: "Bamboo, framework, writing material",
    description: "Relates to items made of bamboo stalks, flutes, records, grids, measurement rods, and light construction."
  },
  {
    id: "to-go",
    name: "To Go (Step)",
    symbol: "行",
    variants: ["彳"],
    kanjiList: ["行", "後", "待", "役", "街", "径", "徒", "得", "衛", "往", "術", "徳", "復", "従", "律", "御", "征", "徴", "彼", "微", "徐", "衝", "衡", "循", "徹"],
    meaning: "Step, move forward, path",
    description: "Depicts steps, paths, streets, performance, behavioral discipline, and physical distance."
  },
  {
    id: "power",
    name: "Power",
    symbol: "力",
    variants: ["力"],
    kanjiList: ["力", "助", "勝", "動", "勉", "加", "功", "努", "勇", "労", "効", "勢", "務", "勤", "勧", "劣", "勘", "募", "励", "劾", "勲", "勅", "勃"],
    meaning: "Power, force, effort",
    description: "Implies muscular strain, plow hand tool, leverage, victory, mental focus, and energetic push."
  },
  {
    id: "grain",
    name: "Grain",
    symbol: "禾",
    variants: ["禾"],
    kanjiList: ["科", "秋", "秒", "種", "積", "移", "税", "程", "穀", "私", "秘", "稿", "秀", "称", "稲", "穏", "穫", "穂", "稚", "稼", "租", "秩", "稽"],
    meaning: "Grain crop, harvest, measure",
    description: "Rooted in agricultural stalks, rice grains, scales, national crop taxes, private shares, and schedules."
  },
  {
    id: "head",
    name: "Head / Page",
    symbol: "頁",
    variants: ["頁"],
    kanjiList: ["顔", "頭", "題", "願", "順", "類", "額", "預", "領", "頂", "項", "頼", "顧", "頑", "顕", "頒", "頻", "顎", "頃", "須", "頓", "頬"],
    meaning: "Head, facial section, page",
    description: "Related to human faces, neck directions, items on top, lists of categories, and pages."
  },
  {
    id: "cloak",
    name: "Cloak / Clothing",
    symbol: "衣",
    variants: ["衣", "衤"],
    kanjiList: ["衣", "表", "製", "複", "裁", "装", "補", "裏", "襲", "被", "衰", "袋", "裸", "裂", "褐", "襟", "衷", "褒", "裕", "袖", "裾"],
    meaning: "Clothing, dress, surface cover",
    description: "Signifies clothes, bags, linings, external styling, ornaments, and pocket covers."
  },
  {
    id: "rice-field",
    name: "Rice Field",
    symbol: "田",
    variants: ["田"],
    kanjiList: ["田", "男", "町", "画", "番", "界", "申", "畑", "由", "略", "留", "異", "畳", "甲", "畜", "畔", "畝", "畏", "畿"],
    meaning: "Rice field, division, farming land",
    description: "Associated with structured field squares, agriculture, borders, local maps, or layout order."
  },
  {
    id: "eye",
    name: "Eye",
    symbol: "目",
    variants: ["目"],
    kanjiList: ["目", "直", "県", "真", "相", "省", "眼", "看", "瞬", "盾", "眠", "睡", "眺", "督", "盲", "瞳", "眉", "睦", "瞭"],
    meaning: "Eye, vision, checking",
    description: "Relates to optical acts, waking, sleep depth, careful inspecting, eyelashes, and mental gaze."
  },
  {
    id: "big",
    name: "Big",
    symbol: "大",
    variants: ["大"],
    kanjiList: ["大", "天", "太", "央", "失", "夫", "奏", "奮", "奥", "奇", "契", "奪", "奉", "奨", "奔", "爽", "奈"],
    meaning: "Large, grand state",
    description: "Portrays a person standing with outstretched limbs. Corresponds to size, heavens, and major forces."
  },
  {
    id: "cloth",
    name: "Cloth / Banner",
    symbol: "巾",
    variants: ["巾"],
    kanjiList: ["帰", "市", "帳", "希", "席", "帯", "師", "常", "布", "幕", "幅", "帽", "帝", "帆", "帥", "幣", "巾"],
    meaning: "Cloth, towel, scroll, sheet",
    description: "Associated with woven tissues, town standards, sails, decorative wraps, and caps."
  },
  {
    id: "building",
    name: "Building / Cliff",
    symbol: "广",
    variants: ["广"],
    kanjiList: ["広", "店", "庫", "庭", "度", "康", "底", "府", "序", "座", "庁", "床", "廉", "廊", "庶", "廃", "庸"],
    meaning: "Building, house on a slope",
    description: "Represents structures built against a cliff side, large halls, storage facilities, or administrative departments."
  },
  {
    id: "dog",
    name: "Dog / Animal",
    symbol: "犬",
    variants: ["犭"],
    kanjiList: ["犬", "状", "独", "犯", "獲", "狂", "狭", "狩", "獣", "猛", "獄", "猟", "猿", "献", "猫", "猶", "狙"],
    meaning: "Dog, wild creature, beast",
    description: "Implies four-legged animals, aggression, hunting, traps, confinement, and simple visual states."
  },
  {
    id: "one",
    name: "One",
    symbol: "一",
    variants: ["一"],
    kanjiList: ["一", "下", "三", "七", "上", "万", "世", "丁", "両", "不", "並", "丘", "丈", "与", "且", "丙"],
    meaning: "One, horizontal boundary",
    description: "The simplest stroke. Acts as a baseline, roof, or basic counting marker."
  },
  {
    id: "mountain",
    name: "Mountain",
    symbol: "山",
    variants: ["山"],
    kanjiList: ["山", "岩", "岸", "島", "峠", "峰", "岳", "岐", "峡", "崩", "崎", "崇", "岬", "嵐", "岡", "崖"],
    meaning: "Mountain, peek, slope",
    description: "Stands for natural terrain, elevation heights, cliffs, stones, and geographic barriers."
  },
  {
    id: "action",
    name: "Action / Strike",
    symbol: "攵",
    variants: ["攵"],
    kanjiList: ["教", "数", "整", "放", "改", "救", "散", "敗", "故", "政", "敵", "敬", "攻", "敏", "敷", "敢"],
    meaning: "Activity, strike, command",
    description: "Often depicts a hand swinging a stick or rule, symbolizing guidance, enforcement, and change."
  },
  {
    id: "stone",
    name: "Stone",
    symbol: "石",
    variants: ["石"],
    kanjiList: ["石", "研", "確", "破", "砂", "磁", "砲", "硬", "礎", "碑", "碁", "砕", "硝", "礁", "磨", "硫"],
    meaning: "Stone, hard mineral",
    description: "Associated with rocks, concrete buildings, polishing, tools, or heavy items cut from cliffs."
  },
  {
    id: "corpse",
    name: "Corpse / Ruin",
    symbol: "尸",
    variants: ["尸"],
    kanjiList: ["屋", "局", "居", "属", "尺", "層", "展", "届", "屈", "尽", "尾", "尿", "尼", "履", "尻"],
    meaning: "Corpse, structural frame, seat",
    description: "Initially represented a seat or a body structure. Commonly tied to homes, layers, or physical limits."
  },
  {
    id: "jewel",
    name: "Jewel",
    symbol: "玉",
    variants: ["王"],
    kanjiList: ["王", "玉", "理", "球", "現", "班", "環", "珍", "琴", "璽", "珠", "玩", "璧", "璃", "瑠"],
    meaning: "Jade, ruler, precious jewel",
    description: "Signifies jade beads on a string, ruler status, circular spheres, refinement, and beauty."
  },
  {
    id: "illness",
    name: "Illness",
    symbol: "疒",
    variants: ["疒"],
    kanjiList: ["病", "痛", "疲", "療", "疾", "痘", "癖", "疫", "症", "痴", "癒", "痢", "痕", "痩", "瘍"],
    meaning: "Illness, physical suffering",
    description: "Depicting a person sick in bed, relating to diseases, physical aches, scars, and dynamic recovery."
  },
  {
    id: "altar",
    name: "Altar / Show",
    symbol: "示",
    variants: ["ネ"],
    kanjiList: ["社", "祭", "神", "福", "礼", "祝", "票", "禁", "示", "祖", "祈", "祉", "禍", "祥", "禅"],
    meaning: "Altar, sign, sacred rite",
    description: "Originates from a sacrificial table, implying divine guidance, holy spirits, and national rites."
  },
  {
    id: "vehicle",
    name: "Vehicle",
    symbol: "車",
    variants: ["車"],
    kanjiList: ["車", "軽", "転", "軍", "輪", "輸", "較", "輝", "軒", "載", "輩", "軌", "軸", "轄", "軟"],
    meaning: "Car, wagon, rolling mechanism",
    description: "Depicts a cart with wheels looked from above, relating to vehicles, rotation, and transportation."
  },
  {
    id: "bottle",
    name: "Bottle / Wine",
    symbol: "酉",
    variants: ["酉"],
    kanjiList: ["酒", "配", "酸", "酵", "酔", "酷", "酢", "酌", "酬", "醜", "醸", "酪", "醒", "酎"],
    meaning: "Sake bottle, fermentation",
    description: "Refers to standard clay wine flasks, fermentations, vinegars, distribution, and alcohol behaviors."
  },
  {
    id: "rain",
    name: "Rain",
    symbol: "雨",
    variants: ["雨"],
    kanjiList: ["雨", "雲", "雪", "電", "需", "震", "霧", "雷", "露", "零", "霊", "霜", "雰"],
    meaning: "Rain, atmospheric water",
    description: "Relates to weather conditions, moisture falling from above, clouds, and electricity."
  },
  {
    id: "enclosure",
    name: "Enclosure",
    symbol: "囗",
    variants: ["囗"],
    kanjiList: ["四", "園", "回", "国", "図", "囲", "固", "因", "団", "困", "圏", "囚"],
    meaning: "Enclosure, outline, border",
    description: "Forming a full bounding box around characters, denoting borders, limits, traps, and round shapes."
  },
  {
    id: "inch",
    name: "Inch / Rule",
    symbol: "寸",
    variants: ["寸"],
    kanjiList: ["寺", "対", "導", "射", "将", "寸", "専", "尊", "尋", "寿", "封", "尉"],
    meaning: "Inch, custom measure, constraint",
    description: "Related to ancient wrist measurement scales, rules, guidance, specialized roles, and control."
  },
  {
    id: "eat",
    name: "To Eat",
    symbol: "食",
    variants: ["食"],
    kanjiList: ["食", "飲", "館", "飯", "養", "飼", "飾", "餓", "飽", "飢", "餌", "餅"],
    meaning: "Food, dining, meal",
    description: "Related to culinary products, dining rooms, satisfying hunger, and decorative spreads."
  },
  {
    id: "ten",
    name: "Ten",
    symbol: "十",
    variants: ["十"],
    kanjiList: ["十", "千", "午", "南", "半", "協", "卒", "博", "卓", "卑", "升"],
    meaning: "Ten, cross intersection",
    description: "Represents the number ten, a complete count, orientation, or crosses."
  },
  {
    id: "bow",
    name: "Bow",
    symbol: "弓",
    variants: ["弓"],
    kanjiList: ["弓", "引", "強", "弱", "弟", "張", "弾", "弧", "弦", "弔", "弥"],
    meaning: "Bow string, spring curve",
    description: "Relates to dynamic bending force, elasticity, strings of tools, or tension patterns."
  },
  {
    id: "foot",
    name: "Foot",
    symbol: "足",
    variants: ["足"],
    kanjiList: ["足", "路", "距", "跡", "跳", "踏", "躍", "踊", "践", "蹴", "踪"],
    meaning: "Foot, step, action",
    description: "Tied to walking paths, dance steps, jumping heights, and trace distances."
  },
  {
    id: "gate",
    name: "Gate",
    symbol: "門",
    variants: ["門"],
    kanjiList: ["門", "間", "開", "関", "閣", "閉", "闘", "閲", "閑", "閥", "闇"],
    meaning: "Gate, double doors, barrier",
    description: "Represents double-door frames, entry paths, locks, or activities inside a doorway."
  },
  {
    id: "horse",
    name: "Horse",
    symbol: "馬",
    variants: ["馬"],
    kanjiList: ["馬", "駅", "験", "驚", "駆", "騒", "騎", "駐", "駄", "騰", "駒"],
    meaning: "Horse, dynamic animal",
    description: "Associated with horses, stations, galloping speed, shock, or high structures."
  }
];
