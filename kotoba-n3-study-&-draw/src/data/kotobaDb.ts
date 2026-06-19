/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KotobaItem {
  id: number;
  index: number;
  halaman: number;
  no: number;
  bagian: string;
  kanji: string;
  hiragana: string;
  arti: string;
  contohKalimat: string;
  contohKalimatHiragana: string;
  artiKalimat: string;
}

// Raw sanitized CSV string representing the default data
export const DEFAULT_RAW_CSV = `Index,Halaman,No,Bagian,Kanji,Hiragana,Arti,Contoh Kalimat,Contoh kalimat hiragana,Arti Kalimat
1,1,1,4日目,経済,けいざい,Ekonomi,国の経済を安定させることが重要です。,くにのけいざいをあんていさせることがじゅうようです。,Menstabilkan ekonomi negara adalah hal yang penting.
2,1,2,4日目,携帯,けいたい (する),Ponsel / HP,授業中は携帯をカバンにしまってください。,じゅぎょうchゅうはけいたいをかばんにしまってください。,Harap simpan ponsel Anda di dalam tas selama pelajaran berlangsung.
3,1,3,4日目,経由,けいゆ (する),Perantara / Transit,東京から京都へ行く、名古屋を経由するルートです。,とうきょうからきょうとへいく、なごやをけいゆするるーとです。,Ini adalah rute dari Tokyo ke Kyoto melalui (transit di) Nagoya.
4,1,4,4日目,今朝,けさ,Pagi ini,今朝は朝食を食べる時間がありませんでした。,けさはちょうしょくをたべるじかんがありませんでした。,Pagi ini saya tidak punya waktu untuk sarapan.
5,1,5,4日目,景色,けしき,Pemandangan,窓から見える海の景色がきれいです。,まどからみえるうみのけしきがきれいです。,Pemandangan laut yang terlihat dari jendela sangat indah.
6,1,6,4日目,血圧,けつあつ,Tekanan darah,最近、血圧が高くて心配です。,さいきん、けつあつがたかくてしんぱいです。,Akhir-akhir ini saya khawatir karena tekanan darah saya tinggi.
7,1,7,4日目,血液,けつえき,Darah,彼は血液についての研究をしています。,かれはけつえきについてのけんきゅうをしています。,Dia sedang melakukan penelitian tentang darah.
8,1,8,4日目,結果,けっか,Hasil,努力した結果、試験に合格しました。,どりょくしたけっか、しけんにごうかくしました。,Berkat hasil usaha keras, saya lulus ujian.
9,1,9,4日目,結婚,けっこん (する),Menikah,私たちは来年結婚する予定です。,わたしたちはらいねんけっこんするよていです。,Kami berencana untuk menikah tahun depan.
10,1,10,4日目,欠席,けっせき (する),Absen / tidak hadir,風邪をひいたので、今日の授業を欠席します。,かぜをひいたので、きょうのじゅぎょうをけっせきします。,Karena masuk angin, saya absen dari kelas hari ini.
11,1,11,4日目,欠点,けってん,Kekurangan / Kelemahan,誰にでも欠点はありますが、それを補う努力が大切です。,だれにでもけってんはありますが、それをおぎなうどりょくがたいせつです。,Semua orang memiliki kekurangan, namun usaha untuk memperbaikinya itu penting.
12,1,12,4日目,計画,けいかく (する),Rencana,来週の予定を計画しました。,らいしゅうのよていをけいかくしました。,Saya telah merencanakan agenda untuk minggu depan.
13,1,13,4日目,警告,けいこく,Pemberitahuan / Peringatan,警察官はスピード違反の運転手に警告しました。,けいさつかんはすぴーどいはんのうんてんしゅにけいこくしました。,Petugas polisi memberikan peringatan kepada pengemudi yang mengebut.
14,1,14,4日目,研究,けんきゅう (する),Penelitian,大学で新しい技術の研究を行っています。,だいがくであたらしいぎじゅつのけんきゅうをおこなっています。,Kami sedang melakukan penelitian teknologi baru di universitas.
15,1,15,4日目,検査,けんさ (する),Pemeriksaan,病院でアレルギーの検査を受けました。,びょういんであれるぎーのけんさをうけました。,Saya menjalani pemeriksaan alergi di rumah sakit.
16,1,16,4日目,建設,けんせつ (する),Pembangunan / konstruksi,駅の近くに新しい商業ビルが建設されています。,えきのちかくにあたらしいしょうぎょうびるがけんせつされています。,Gedung komersial baru sedang dibangun di dekat stasiun.
17,1,17,4日目,建築,けんちく (する),Arsitektur,彼は日本の伝統的な建築に興味があります。,かれはねほんのでんとうてきなけんちくにきょうみがあります。,Dia tertarik pada arsitektur tradisional Jepang.
18,1,18,4日目,見物,けんぶつ (する),Tamasya / melihat-lihat,京都の古いお寺を見物しました。,きょうとのふるいおてらをけんぶつしました。,Kami melihat-lihat kuil kuno di Kyoto.
19,1,19,4日目,芸術,げいじゅつ,Seni,芸術は人々の心を豊かにします。,げいじゅつはひとびとのこころをゆたかにします。,Seni memperkaya hati orang-orang.
20,1,20,4日目,下車,げしゃ (する),Turun (kendaraan),次の駅で下車してください。,つぎのえきでげしゃしてください。,Harap turun di stasiun berikutnya.
21,1,21,4日目,原因,げんいん,Penyebab,火事の原因はまだ分かっていません。,かじのげんいんはまだわかっていません。,Penyebab kebakaran masih belum diketahui.
22,1,22,4日目,玄関,げんかん,Pintu masuk (genkan),玄関で靴を脱いで上がってください。,げんかんでくつをぬいであがってください。,Harap lepas sepatu Anda di genkan sebelum masuk.
23,1,23,4日目,現金,げんきん,Uang tunai,このお店では現金しか使えません。,このおみせではげんきんしかつかえません。,Toko ini hanya menerima pembayaran tunai.
24,1,24,4日目,言語,げんご,Bahasa,世界には多くの言語が存在します。,せかいにはおおくのげんごがそんざいします。,Ada banyak bahasa yang ada di dunia.
25,1,25,4日目,原稿,げんこう,Naskah,締め切りまでに原稿を書き終えました。,しめきりまでにげんこうをかきおえました。,Saya selesai menulis naskah sebelum tenggat waktu.
26,1,26,4日目,現在,げんざい,Saat ini / sekarang,現在の気温は25度です。,げんざいのきおんはにじゅうごどです。,Suhu udara saat ini adalah 25 derajat.
27,1,27,4日目,減少,げんしょう (する),Penurunan / pengurangan,労働人口의 の減少が問題になっています。,ろうどうじんこうのげんしょうがもんだいになっています。,Penurunan populasi pekerja menjadi sebuah masalah.
28,1,28,4日目,原料,げんりょう,Bahan baku,チョコレートの原料はカカオです。,ちょこれーとのげんりょうはかかおです。,Bahan baku cokelat adalah kakao.
29,1,29,4日目,公園,こうえん,Taman,天気がいいので公園を散歩しましょう。,てきがいいのでこうえんをさんぽしましょう。,Karena cuacanya bagus, mari kita jalan-jalan di taman.
30,1,30,4日目,講演,こうえん (する),Ceramah / kuliah umum,有名な作家の講演を聞きに行きました。,ゆうめいなさっかのこうえんをききにいきました。,Saya pergi mendengar ceramah dari penulis terkenal.
31,1,31,4日目,高温,こうおん,Suhu tinggi,この製品は高温になる場所に置かないでください。,このせいひんはこうおんになるばしょにおかないでください。,Jangan letakkan produk ini di tempat yang bersuhu tinggi.
32,1,32,4日目,効果,こうか,Efek / khasiat,この薬は風邪によく効く効果があります。,このくすりはかぜによくきくこうかがあります。,Obat ini memiliki khasiat yang manjur untuk flu.
33,1,33,4日目,交換,こうかん (する),Pertukaran / bertukar,連絡先を交換しましょう。,れんらくさきをこうかんしましょう。,Mari kita bertukar kontak.
34,1,34,4日目,公共,こうきょう,Publik / umum,公共の場所では静かにしてください。,こうきょうのばしょではしずかにしてください。,Harap tenang di tempat umum.
35,1,35,4日目,工業,こうぎょう,Industri,この地域は工業が盛んです。,このちいきはこうぎょうがさかんです。,Daerah ini memiliki industri yang berkembang pesat.
36,1,36,4日目,広告,こうこく (する),Iklan,新聞で新しい車の広告を見ました。,しんぶんであたらしいくるまのこうこくをみました。,Saya melihat iklan mobil baru di koran.
37,1,37,4日目,工事,こうじ (する),Pekerjaan konstruksi,道路工事のため、片側交互通行になっています。,どうろこうじのため、かたがわこうごつうこうになっています。,Karena pekerjaan jalan, diberlakukan sistem buka-tutup satu jalur.
38,1,38,4日目,工場,こうじょう,Pabrik,彼は自動車を作る工場で働いています。,かれじどうしゃをつくるこうじょうではたらいています。,Dia bekerja di pabrik pembuat mobil.
39,1,39,4日目,紅茶,こうちゃ,Teh hitam,紅茶に砂糖を入れて飲みます。,こうちゃにさとうをいれてのみます。,Saya minum teh hitam dengan menambahkan gula.
40,1,40,4日目,校庭,こうてい,Halaman sekolah,生徒たちが校庭でサッカーをしています。,せいとたちがこうていでさっかーをしています。,Para siswa sedang bermain sepak bola di halaman sekolah.
41,1,41,4日目,行動,こうどう (する),Tindakan / perilaku,言葉だけでなく行動で示してください。,ことばだけでなくこうどうでしめしてください。,Jangan hanya lewat kata-kata, tunjukkanlah dengan tindakan.
42,1,42,4日目,後輩,こうはい,Junior,面倒見のいい先輩になって、後輩を助けたいです。,めんどうみのいいせんぱいになって、こうはいをたすけたいです。,Saya ingin menjadi senior yang baik dan membantu junior.
43,1,43,4日目,交番,こうばん,Pos polisi,道が分からないので交番で聞きました。,みちがわからないのでこうばんでききました。,Karena tidak tahu jalannya, saya bertanya di pos polisi.
44,1,44,4日目,好物,こうぶつ,Makanan kesukaan,私の好物は寿司とカレーです。,わたしのこうぶつはすしとかれーです。,Makanan kesukaan saya adalah sushi dan kari.
45,1,45,4日目,後方,こうほう,Bagian belakang,車をバックさせるときは後方に注意してください。,くるまをばっくさせるときはこうほうにちゅういしてください。,Harap perhatikan bagian belakang saat memundurkan mobil.
46,1,46,4日目,交流,こうりゅう (する),Interaksi / pertukaran,留学生との交流イベントに参加しました。,りゅうがくせいとのこうりゅういべんとにさんかしました。,Saya berparticipasi dalam acara interaksi dengan mahasiswa asing.
47,2,47,4日目,国際,こくさい,Internasional,成田空港は国際線が多いです。,なりたくうこうはこくさいせんがおおいです。,Bandara Narita memiliki banyak penerbangan internasional.
48,2,48,4日目,小声,こごえ,Suara pelan / berbisik,図書館では小声で話してください。,としょかんではこごえではなしてください。,Harap berbicara dengan suara pelan di perpustakaan.
49,2,49,4日目,故障,こしょう (する),Kerusakan (mesin/alat),パソコンが故障したので修理に出しました。,ぱそこんがこしょうしたのでしゅうりにだしました。,Karena komputer saya rusak, saya membawanya untuk diperbaiki.
50,2,50,4日目,個人,こじん,Individu / pribadi,これは個人の意見です。,これはこじんのいけんです。,Ini adalah pendapat pribadi.
51,2,51,4日目,小銭,こぜに,Uang receh,自動販売機を使うために小銭が必要です。,じどうはんばいきをつかうためにこぜにがひつようです。,Saya butuh uang receh untuk menggunakan mesin penjual otomatis.
52,2,52,4日目,小鳥,ことり,Burung kecil,庭 of木で小鳥がさえずっています。,にわのきでことりがさえずっています。,Burung kecil sedang berkicau di pohon halaman rumah.
53,2,53,4日目,混雑,こんざつ (する),Padat / macet / ramai,土曜日のデパートはとても混雑します。,どようびのでぱーとはとてもこんざつします。,Toserba sangat padat pada hari Sabtu.
54,2,54,4日目,今度,こんど,Lain kali / kali ini,今度、一緒に映画に行きませんか。,こんど、いっしょにえいがにいきませんか。,Lain kali, maukah pergi menonton film bersama?
55,2,55,4日目,合格,ごうかく (する),Lulus,大学の入試に合格しました。,だいがくのにゅうしにごうかくしました。,Saya lulus ujian masuk universitas.
56,2,56,4日目,合計,ごうけい (する),Jumlah total,買い物代金の合計は五千円です。,かいものだいきんのごうけいはごせんえんです。,Jumlah total belanjaan adalah lima ribu yen.
57,2,57,4日目,最近,さいきん,Akhir-akhir ini,最近、日本語の勉強を始めました。,さいきん、にほんごのべんきょうをはじめました。,Akhir-akhir ini, saya mulai belajar bahasa Jepang.
58,2,58,4日目,最後,さいご,Terakhir,これが最後のチャンスです。,これがさいごのちゃんすです。,Ini adalah kesempatan terakhir.
59,2,59,4日目,最終,さいしゅう,Paling akhir / final,最終の電車に間に合いました。,さいしゅうのでんしゃにまにあいました。,Saya sempat mengejar kereta terakhir.
60,2,60,4日目,最初,さいしょ,Pertama / awal,最初は誰でも初心者です。,さいしょはだれでもしょしんしゃです。,Awalnya siapapun adalah pemula.
61,2,61,4日目,最上,さいじょう,Paling atas / terbaik,最上階からの眺めは素晴らしい。,さいじょうかいからのながめはすばらしい。,Pemandangan dari lantai paling atas sangat indah.
62,2,62,4日目,財布,さいふ,Dompet,買い物に行ったら財布を忘れました。,かいものにいったらさいふをわすれました。,Saat pergi berbelanja, saya lupa membawa dompet.
63,2,63,4日目,坂道,さかみち,Jalan menanjak,自転車で坂道を上るのは大変です。,じてんしゃでさかみちをのぼるのはたいへんです。,Mendaki jalan menanjak dengan sepeda itu berat.
64,2,64,4日目,作物,さく物,Hasil bumi / tanaman,台風で多くの作物が被害を受けました。,たいふうでおおくのさくもつがひがいをうけました。,Banyak tanaman rusak karena badai.
65,2,65,4日目,左折,させつ (する),Belok kiri,次の交差点を左折してください。,つぎのこうさてんをさせつしてください。,Harap belok kiri di persimpangan berikutnya.
66,2,66,4日目,砂糖,さとう,Gula,コーヒーに砂糖を入れますか。,こーひーにさとうをいれますか。,Apakah Anda ingin memasukkan gula ke dalam kopi?
67,2,67,4日目,参加,さんか (する),Berpartisipasi,明日のイベントに参加しますか。,あしたのいべんとにさんかしますか。,Apakah Anda akan berparticipasi dalam acara besok?
68,2,68,4日目,算数,さんすう,Berhitung / matematika dasar,小学生のとき算数が苦手でした。,しょうがくせいのときさんすうがにがてでした。,Saat SD, saya lemah dalam berhitung.
69,2,69,4日目,散歩,さんぽ (する),Jalan-jalan santai,毎朝、犬と一緒に散歩しています。,まいあさ、いぬといっしょにさんぽしています。,Setiap pagi, saya jalan-jalan santai bersama anjing.
70,2,70,4日目,材料,ざいりょう,Bahan-bahan,ケーキを作る材料を買いに行きました。,けーきをつくるざいりょうをかいにいきました。,Saya pergi membeli bahan-bahan untuk membuat kue.
71,2,71,4日目,残業,ざんぎょう (する),Kerja lembur,今日は仕事が忙しいので残業します。,きょうはしごとがいそがしいのでざんぎょうします。,Hari ini saya kerja lembur karena pekerjaan sibuk.
72,2,72,4日目,試合,しあい (する),Pertandingan,明日のサッカーの試合が楽しみです。,あしたのさっかーのしあいがたのしみです。,Saya menantikan pertandingan sepak bola besok.
73,2,73,4日目,四角,しかく,Segi empat,この四角い箱の中に何が入っていますか。,このしかくいはこのなかになにがはいっていますか。,Apa yang ada di dalam kotak segi empat ini?
74,2,74,4日目,仕方,しかた,Cara / metode,この機械の使い方が分かりません。,このきかいのつかいかたがわかりません。,Saya tidak tahu cara menggunakan mesin ini.
75,2,75,4日目,支給,しきゅう (する),Pemberian / pembayaran,会社から交通費が支給されます。,かいしゃからこうつうひがしきゅうされます。,Biaya transportasi dibayarkan oleh perusahaan.
76,2,76,4日目,試験,しけん,Ujian,来週、日本語の試験があります。,らいしゅう、にほんごのしけんがあります。,Minggu depan ada ujian bahasa Jepang.
77,2,77,4日目,資源,しげん,Sumber daya,地球の資源を大切にしなければなりません。,ちきゅうのしげんをたいせつにしなければなりません。,Kita harus menghemat sumber daya bumi.
78,2,78,4日目,姿勢,しせい,Sikap tubuh / postur,パソコンを使うときは姿勢に気をつけましょう。,ぱそこんをつかうときはしせいにきをつけましょう。,Perhatikan postur tubuh saat menggunakan komputer.
79,2,79,4日目,湿気,しっけ,Kelembapan,部屋の湿気が高くてジメジメしています。,へやのしっけがたかくてじめじめしています。,Kelembapan di kamar tinggi dan terasa lembap.
80,2,80,4日目,失敗,しっぱい (する),Gagal,試験に失敗しても、諦めないでください。,しけんにしっぱいしても、あきらめないでください。,Meskipun gagal ujian, jangan menyerah.
81,2,81,4日目,指定,してい (する),Penentuan / reservasi,新幹線の指定席を予約しました。,しんかんせんのしていせきをよやくしました。,Saya telah memesan kursi reservasi di Shinkansen.
82,2,82,4日目,支店,してん,Kantor cabang,来月から大阪の支店で働きます。,らいげつからおおさかのしてんではたらきます。,Mulai bulan depan saya bekerja di kantor cabang Osaka.
83,2,83,4日目,指導,しどう (する),Membimbing,先生が学生を指導しています。,せんせいががくせいをしどうしています。,Guru sedang membimbing siswa.
84,2,84,4日目,始発,しはつ,Keberangkatan pertama,始発の電車に乗って東京へ行きました。,しはつのでんしゃに乗ってとうきょうへいきました。,Saya pergi ke Tokyo naik kereta keberangkatan pertama.
85,2,85,4日目,芝生,しばふ,Rumput / lapangan rumput,芝生に入らないでください。,しばふにはいらないでください。,Harap jangan menginjak rumput.
86,2,86,4日目,市民,しみん,Warga kota,市民のみなさんが公園をきれいにしています。,しみんのみなさんがこうえんをきれいにしています。,Para warga kota sedang membersihkan taman.
87,2,87,4日目,氏名,しめい,Nama lengkap,ここに氏名と住所を書いてください。,ここにしめいとじゅうしょを書いてください。,Tolong tulis nama lengkap dan alamat di sini.
88,2,88,4日目,社会,しゃかい,Masyarakat,大学を卒業して社会人になりました。,だいがくをそつぎょうしてしゃかいじんになりました。,Saya lulus universitas dan menjadi anggota masyarakat.
89,2,90,4日目,車道,しゃどう,Jalan raya kendaraan,歩行者は車道を歩いてはいけません。,ほこうしゃはしゃどうをあるいてはいけません。,Pejalan kaki tidak boleh berjalan di jalan raya kendaraan.
90,2,91,4日目,斜面,しゃめん,Lereng / kemiringan,山の斜面にたくさんの木が植えられています。,やまのしゃめんにたくさんのきがうえられています。,Banyak pohon ditanam di lereng gunung.
91,2,92,4日目,習慣,しゅうかん,Kebiasaan,早起きはとても良い習慣です。,はやおきはてともよいしゅうかんです。,Bangun pagi adalah kebiasaan yang sangat baik.
92,2,93,4日目,集合,しゅうごう (する),Berkumpul,明日の朝、駅の前に集合してください。,あしたのあさ、えきのまえにしゅうごうしてください。,Harap berkumpul di depan stasiun besok pagi.
93,2,94,4日目,就職,しゅうしょく (する),Mendapat pekerjaan,日本の会社に就職したいです。,にほんのかいしゃにしゅうしょくしたいです。,Saya ingin bekerja di perusahaan Jepang.
94,2,95,4日目,集中,しゅうちゅう (する),Konsentrasi / fokus,騒がしくて勉強に集中できません。,さわがしくてべんきょうにしゅうちゅうできません。,Bising sekali sampai saya tidak bisa fokus belajar.
95,2,96,4日目,終点,しゅうてん,Stasiun terakhir,この電車の終点は新宿駅です。,このでんしゃのしゅうてんはしんじゅくえきです。,Pemberhentian terakhir kereta ini adalah Stasiun Shinjuku.
96,2,97,4日目,収入,しゅうにゅう,Pendapatan,毎月の収入が増えてうれしいです。,まいつきのしゅうにゅうがふえてうれしいです。,Saya senang karena pendapatan bulanan saya meningkat.
97,2,98,4日目,修理,しゅうり (する),Memperbaiki,壊れた時計を修理してもらいました。,こわれたとけいをしゅうりしてもらいました。,Saya meminta jam tangan yang rusak diperbaiki.
98,2,99,4日目,終了,しゅうりょう (する),Selesai / berakhir,本日の営業は終了しました。,ほんじつのえいぎょうはしゅうりょうしました。,Operasional hari ini telah berakhir.
99,2,100,4日目,祝日,しゅくじつ,Hari libur nasional,カレンダーの赤い日は祝日です。,かれんだーのあかいひはしゅくじつです。,Hari berwarna merah di kalender adalah hari libur nasional.
100,3,1,5日目,縮小,しゅくしょう (する),Memperkecil,画像を縮小してメールで送ってください。,がぞうをしゅくしょうしてめーるでおくってください。,Harap perkecil gambar lalu kirim lewat email.
101,3,2,5日目,宿題,しゅくだい,Pekerjaan rumah (PR),今日の宿題はとても難しいです。,きょうのしゅくだいはてともむずかしいです。,PR hari ini sangat sulit.
102,3,3,5日目,手術,しゅじゅつ (する),Operasi medis,明日、胃の手術を受けます。,あした、いのしゅじゅつをうけます。,Besok saya akan menjalani operasi lambung.
103,3,4,5日目,手段,しゅdan,Sarana / cara,移動の手段として自転車を使っています。,いどうのしゅだんとしてじてんしゃをつかっています。,Saya menggunakan sepeda sebagai sarana mobilitas.
104,3,5,5日目,主張,しゅちょう (する),Menegaskan pendapat,彼は自分の意見を強く主張しました。,かれはじぶんのいけんをつよくしゅちょうしました。,Dia menegaskan pendapatnya dengan kuat.
105,3,6,5日目,出勤,しゅっきん (する),Masuk kerja,毎朝八時に出勤しています。,まいあさはちじにしゅっきんしています。,Saya masuk kerja setiap jam delapan pagi.
106,3,7,5日目,出身,しゅっしん,Asal daerah / negara,あなたの出身はどこですか。,あなたのしゅっしんはどこですか。,Dari mana daerah asal Anda?
107,3,8,5日目,出席,しゅっせき (する),Menghadiri / hadir,明日の会議に出席します。,あしたのかいぎにしゅっせきします。,Saya akan menghadiri rapat besok.
108,3,9,5日目,出張,しゅっちょう (する),Perjalanan dinas,来週、大阪へ出張します。,らいしゅう、おおさかへしゅっちょうします。,Minggu depan saya ada perjalanan dinas ke Osaka.
109,3,10,5日目,趣味,しゅみ,Hobi,私の趣味は音楽を聴くことです。,わたしのしゅみはおんがくをきくことです。,Hobi saya adalah mendengarkan musik.
110,3,11,5日目,種目,しゅもく,Nomor lomba / cabang,オリンピックの新しい種目が決まりました。,おりんぴっくのあたらしいしゅもくがきまりました。,Nomor lomba baru di Olimpiade telah ditentukan.
111,3,12,5日目,種類,しゅるい,Jenis / macam,この店にはたくさんの種類のパンがあります。,このみせにはたくさんのしゅるいのぱんがあります。,Toko ini menyediakan banyak jenis roti.
112,3,13,5日目,使用,しよう (する),Menggunakan,この部屋を使用するときは予約が必要です。,このへやをしようするときはよやくがひつようです。,Diperlukan reservasi untuk menggunakan ruangan ini.
113,3,14,5日目,紹介,しょうかい (する),Memperkenalkan,新しい友達をみんなに紹介します。,あたらしいともだちをみんなにしょうかいします。,Saya akan memperkenalkan teman baru kepada semuanya.
114,3,15,5日目,正月,しょうがつ,Tahun baru,お正月には家族と一緒に過ごします。,おしょうがつにはかぞくといっしょにすごします。,Saya menghabiskan waktu bersama keluarga pada saat tahun baru.
115,3,16,5日目,小説,しょうせつ,Novel,最近、面白い小説を読み始めました。,さいきん、おもしろいしょうせつをよみはじめました。,Akhir-akhir ini, saya mulai membaca novel yang menarik.
116,3,17,5日目,商売,しょうばい (する),Berdagang / bisnis,彼はこの町で商売を始めました。,かれはこのまちでしょうばいをはじめました。,Dia memulai bisnis di kota ini.
117,3,19,5日目,商品,しょうひん,Produk / barang dagangan,この店商品はすべて手作りです。,このみせのしょうひんはすべててづくりです。,Produk di toko ini semuanya buatan tangan.
118,3,20,5日目,証明,しょうめい (する),Membuktikan,身分を証明するものを持っていますか。,みぶんをしょうめいするものをもっていますか。,Apakah Anda membawa sesuatu yang membuktikan identitas Anda?
119,3,21,5日目,将来,しょうらい,Masa depan,将来は医者になりたいです。,しょうらいはいしゃになりたいです。,Di masa depan saya ingin menjadi dokter.
120,3,22,5日目,初級,しょきゅう,Tingkat dasar,この教科書は日本語の初級レベルです。,このきょうかしょはにほんごのしょきゅうれべるです。,Buku teks ini adalah tingkat dasar bahasa Jepang.
121,3,23,5日目,食堂,しょくどう,Kantin / tempat makan,昼休みは学校の食堂が混雑します。,ひるやすみはがっこうのしょくどうがこんざつします。,Kantin sekolah sangat padat saat istirahat siang.
122,3,24,5日目,食欲,しょくよく,Nafsu makan,風邪をひいて食欲がありません。,かぜをひいてしょくよくがありません。,Saya tidak punya nafsu makan karena masuk angin.
123,3,25,5日目,食器,しょっき,Peralatan makan,食事のあとに食器を洗いました。,しょくじのあとにしょっきをあらいました。,Saya mencuci peralatan makan setelah makan.
124,3,26,5日目,書類,しょるい,Dokumen,必要な書類をカバンに入れました。,ひつようなしょるいをかばんにいれました。,Saya memasukkan dokumen yang diperlukan ke dalam tas.
125,3,27,5日目,資料,しりょう,Bahan referensi / data,会議に使う資料を用意してください。,かいぎにつかうしりょうをよういしてください。,Harap siapkan dokumen bahan untuk rapat.
126,3,28,5日目,進学,しんがく (する),Melanjutkan sekolah,高校を卒業して大学へ進学します。,こうこうをそつぎょうしてだいがくへしんがくします。,Saya lulus SMA dan melanjutkan sekolah ke universitas.
127,3,29,5日目,進行,しんこう (する),Berlangsung / berjalan,プロジェクトはスムーズに進行しています。,ぷろじぇくとはすむーずにしんこうしています。,Proyek berjalan dengan lancar.
128,3,30,5日目,信号,しんごう,Lampu lalu lintas,赤信号では道路を渡ってはいけません。,あかしんごうではどうろをわたってはいけません。,Jangan menyeberang jalan saat lampu lalu lintas berwarna merah.
129,3,31,5日目,申請,しんせい (する),Mengajukan permohonan,パスポートの申請に行きました。,ぱすぽーとのしんせいにいきました。,Saya pergi untuk mengajukan permohonan paspor.
130,3,32,5日目,心臓,しんぞう,Jantung,走ったあとで心臓がどきどきしています。,はしったあとでしんぞうがどきどきしています。,Jantung saya berdebar-debar setelah berlari.
131,3,33,5日目,進歩,しんぽ (する),Kemajuan,科学技術は日々進歩しています。,かがくぎじゅつはひびしんぽしています。,Teknologi sains mengalami kemajuan setiap harinya.
132,3,34,5日目,親友,しんゆう,Sahabat / teman dekat,彼女は私の大切な親友です。,かのじょはわたしのたいせつなしんゆうです。,Dia adalah sahabat berharga saya.
133,3,35,5日目,森林,しんりん,Hutan lebat,この地域には豊かな森林が広がっています。,このちいきにはゆたかなしんりんがひろがっています。,Hutan yang lebat membentang luas di daerah ini.
134,3,36,5日目,時期,じき,Waktu / musim,今は旅行に行くのに良い時期です。,いまはりょこうにいくのによいじきです。,Sekaran adalah waktu yang tepat untuk pergi berwisata.
135,3,37,5日目,時給,じきゅう,Upah per jam,このアルバイトの時給は千円です。,このあるばいとのじきゅうはせんえんです。,Upah per jam kerja paruh waktu ini adalah seribu yen.
136,3,38,5日目,時差,じさ,Perbedaan waktu,日本とインドネシアの時差は二時間です。,にほんといんどねしあのじさはにじかんです。,Perbedaan waktu antara Jepang dan Indonesia adalah dua jam.
137,3,39,5日目,持参,じさん (する),Membawa serta,お弁当と水筒を持参してください。,おべんとうとすいとうをじさんしてください。,Harap membawa serta bekal makan siang dan botol minum.
138,3,40,5日目,辞書,じしょ,Kamus,分からない単語は辞書で調べてください。,わからないたんごはじしょでしらべてください。,Tolong cari kata yang tidak dimengerti di dalam kamus.
139,3,41,5日目,事情,じじょう,Keadaan / alasan,特別な事情があって遅刻しました。,とくべつなじじょうがあってちこくしました。,Saya terlambat karena ada keadaan khusus.
140,3,42,5日目,自信,じしん,Rasa percaya diri,練習を重ねて、試験に合格する自信がつきました。,れんしゅうをかさねて、しけんにごうかくするじしんがつきました。,Berkat latihan berulang kali, saya mendapatkan rasa percaya diri untuk lulus ujian.
141,3,43,5日目,時代,じだい,Zaman / masa,江戸時代について学校で学びました。,えどじだいについてがっこうでまなびました。,Saya belajar tentang zaman Edo di sekolah.
142,3,44,5日目,自宅,じたく,Rumah sendiri,週末は自宅でゆっくり過ごします。,しゅうまつはじたくでゆっくりすごします。,Saya menghabiskan waktu dengan santai di rumah sendiri saat akhir pekan.
143,3,45,5日目,実家,じっか,Rumah orang tua,お正月に実家へ帰りました。,おしょうがつにじっかへかえりました。,Saya pulang ke rumah orang tua saat tahun baru.
144,3,46,5日目,実験,じっけん (する),Eksperimen / uji coba,化学の授業で面白い実験をしました。,かがくのじゅぎょうでおもしろいじっけんをしました。,Kami melakukan eksperimen menarik di kelas kimia.
145,4,47,5日目,実行,じっこう (する),Melaksanakan,計画を立てたらすぐに実行しましょう。,けいかくをたてたらすぐにじっこうしましょう。,Mari segera laksanakan rencana setelah dibuat.
146,4,48,5日目,実物,じつぶつ,Barang asli / fisik,インターネットで見た服の実物を確認しました。,いんたーねっとでみたふくのじつぶつをかくにんしました。,Saya memeriksa fisik asli baju yang saya lihat di internet.
147,4,49,5日目,実力,じつりょく,Kemampuan nyata,自分の実力を試すために試験を受けました。,じぶんのじつりょくをためすためにしけんをうけました。,Saya mengikuti ujian untuk menguji kemampuan nyata saya.
148,4,50,5日目,自慢,じまん (する),Membanggakan,彼は自分の新しい車を自慢しています。,かれはじぶんのあたらしいくるまをじまんしています。,Dia membanggakan mobil barunya.
149,4,51,5日目,住所,じゅうしょ,Alamat,手紙を送るので住所を教えてください。,てがみをおくるのでじゅうしょをおしえてください。,Harap beri tahu alamat Anda karena saya akan mengirim surat.
150,4,52,5日目,静止,せいし,Diam,信号が赤のときは静止してください。,しんごうがあかのときはせいししてください。,Saat lampu merah, harap diam (berhenti).
151,4,53,5日目,柔道,じゅうどう,Yudo,日本の伝統的な武道である柔道を習っています。,にほんのでんとうてきなぶどうであるじゅうどうをならっています。,Saya sedang belajar Yudo, beladiri tradisional Jepang.
152,4,54,5日目,授業,じゅぎょう (する),Pelajaran / kelas,今日の授業はこれで終わります。,きょうのじゅぎょうはこれでおわります。,Kelas hari ini berakhir sampai di sini.
153,4,55,5日目,受験,じゅけん (する),Mengikuti ujian,来月、大学の試験を受験します。,らいげつ、だいがくのしけんをじゅけんします。,Bulan depan, saya akan mengikuti ujian universitas.
154,4,56,5日目,順番,じゅんばん,Urutan / giliran,名前を呼ばれるまで順番を待ってください。,なまえをよばれるまでじゅんばんをまってください。,Harap tunggu giliran sampai nama Anda dipanggil.
155,4,57,5日目,準備,じゅんび (する),Persiapan,出発の準備ができました。,しゅっぱつのじゅんびができました。,Persiapan keberangkatan sudah selesai.
156,4,58,5日目,上級,じょうきゅう,Tingkat lanjut,このクラスは上級者向けです。,このくらすはじょうきゅうしゃむけです。,Kelas ini ditujukan untuk tingkat lanjut.
157,4,59,5日目,上空,じょうくう,Angkasa / langit atas,飛行機が雲の上空を飛んでいます。,ひこうきがくものじょうくうをとんでいます。,Pesawat sedang terbang di angkasa di atas awan.
158,4,60,5日目,乗車,じょうしゃ (する),Naik kendaraan,乗車券を改札口に通してください。,じょうしゃけんをかいさつぐちにとおしてください。,Harap masukkan tiket naik kereta ke pintu gerbang tiket.
159,4,61,5日目,状態,じょうたい,Keadaan / kondisi,このパソコンはとても良い状態です。,このぱそこんはとてもよいじょうたいです。,Kondisi komputer ini sangat baik.
160,4,62,5日目,冗談,じょうだん,Candaan / gurauan,今の言葉はただの冗談です。,いまのことばはただのじょうだんです。,Kata-kata yang tadi hanyalah candaan.
161,4,63,5日目,情報,じょうほう,Informasi,最新の情報をインターネットで探しました。,さいしんのじょうほうをいんたーねっとでさがしました。,Saya mencari informasi terbaru di internet.
162,4,64,5日目,女性,じょせい,Perempuan,あの女性はとても親切です。,あのじょせいはとてもしんせつです。,Perempuan itu sangat baik hati.
163,4,65,5日目,神社,じんじゃ,Kuil Shinto,京都の有名な神社に行きました。,きょうとのゆうめいなじんじゃにいきました。,Saya pergi ke kuil Shinto terkenal di Kyoto.
164,4,66,5日目,人生,じんせい,Kehidupan,自分の人生は自分で決めます。,じぶんのじんせいはじぶんできめます。,Saya menentukan kehidupan saya sendiri.
165,4,67,5日目,人体,じんたい,Tubuh manusia,理科の授業で人体の仕組みを学びました。,りかのじゅぎょうでじんたいのしくみをまなびました。,Kami mempelajari struktur tubuh manusia di kelas sains.
166,4,68,5日目,水泳,すいえい (する),Bermain air / berenang,趣味は水泳とテニスです。,しゅみはすいえいとてにすです。,Hobi saya adalah berenang dan tenis.
167,4,69,5日目,水筒,すいとう,Botol minum,冷たいお茶を水筒に入れて持っていきます。,つめたいおちゃをすいとうにいれてもっていきます。,Saya membawa teh dingin yang dimasukkan ke dalam botol minum.
168,4,70,5日目,数回,すうかい,Beberapa kali,日本には数回行ったことがあります。,にほんには数回行ったことがあります。,Saya pernah pergi ke Jepang beberapa kali.
169,4,71,5日目,数学,すうがく,Matematika,数学の計算が難しくて苦労しました。,すうがくのけいさんがむずかしくてくろうしました。,Saya kesulitan karena perhitungan matematika yang rumit.
170,4,72,5日目,数字,すうじ,Angka,この書類に正しい数字を書いてください。,このしょるいにただしいすうじを書いてください。,Tolong tulis angka yang benar pada dokumen ini.
171,4,73,5日目,頭痛,ずつう,Sakit kepala,頭痛がするので、薬を飲んで寝ます。,ずつうがするので、くすりをのんでねます。,Saya minum obat dan tidur karena sakit kepala.
172,4,74,5日目,正解,せいかい (する),Jawaban benar,クイズの正解が分かりました。,くいずのせいかいがわかりました。,Saya tahu jawaban yang benar dari kuis tersebut.
173,4,75,5日目,性格,せいかく,Kepribadian / watak,彼女は明るくて優しい性格をしてます。,かのじょはあかるくてやさしいせいかくをしてます。,Dia memiliki kepribadian yang ceria dan ramah.
174,4,76,5日目,生活,せいかつ (する),Kehidupan sehari-hari,一人暮らしの生活にも慣れました。,ひとりぐらしのせいかつにもなれました。,Saya sudah terbiasa dengan kehidupan tinggal sendiri.
175,4,77,5日目,制限,せいげん (する),Membatasi,このエリアは速度制限があります。,このえりあはそくどせいげんがあります。,Area ini memiliki batasan kecepatan.
176,4,78,5日目,成功,せいこう (する),Sukses / berhasil,新しいビジネスに成功しました。,あたらしいびねすにせいこうしました。,Saya sukses dalam bisnis baru.
177,4,79,5日目,成績,せいせき,Nilai akademik,今学期の成績が良くて安心しました。,こんがっきのせいせきがよくてあんしんしました。,Saya lega karena nilai akademik semester ini bagus.
178,4,80,5日目,清掃,せいそう (する),Pembersihan,毎朝、みんなでオフィスの清掃をします。,まいあさ、みんなでおふぃすのせいそうをします。,Setiap pagi kami semua membersihkan kantor.
179,4,81,5日目,生徒,せいと,Murid / siswa,この学校にはたくさんの生徒がいます。,このがっこうにはたくさんのせいとがいます。,Ada banyak murid di sekolah ini.
180,4,82,5日目,正答,せいとう (する),Jawaban benar,試験の正答率が高かったです。,しけんのせいとうりつがたかかったです。,Tingkat jawaban benar pada ujian cukup tinggi.
181,4,83,5日目,製品,せいひん,Produk buatan / barang,日本の製品は品質が良いことで有名です。,にほんのせいひんはひんしつがよいことでゆうめいです。,Produk buatan Jepang terkenal karena kualitasnya yang bagus.
182,4,84,5日目,制服,せいふく,Seragam,高校生たちが制服を着て歩いています。,こうこうせいたちがせいふくをきてあるいています。,Para siswa SMA berjalan menggunakan seragam.
183,4,85,5日目,生物,せいぶつ,Makhluk hidup,地球上には多種多様な生物が暮らしています。,ちきゅうじょうにはたしゅたようなせいぶつがくらしています。,Berbagai jenis makhluk hidup tinggal di atas bumi.
184,4,86,5日目,性別,せいべつ,Jenis kelamin,書類に性別を記入してください。,しょるいにせいべつをきにゅうしてください。,Harap isi jenis kelamin pada dokumen.
185,4,87,5日目,整理,せいり (する),Merapikan,いらない書類を整理して捨てました。,いらないしょるいをせいりしてすてました。,Saya merapikan dokumen yang tidak perlu lalu membuangnya.
186,4,88,5日目,世界,せかい,Dunia,世界旅行をするのが私の夢です。,せかいりょこうをするのがわたしのゆめです。,Perjalanan keliling dunia adalah impian saya.
187,4,89,5日目,関心,かんしん,Minat / Ketertarikan,彼女は日本の社会問題に関心を持っています。,かのじょはにほんのしゃかいもんだいにかんしんをもっています。,Dia memiliki ketertarikan terhadap masalah sosial Jepang.
188,4,90,5日目,接近,せっきん (する),Mendekat,大きな台風がこの地域に接近しています。,おおきなたいふうがこのちいきにせっきんしています。,Badai besar sedang mendekati daerah ini.
189,4,91,5日目,説明,せつめい (する),Menjelaskan,このルールの意味を説明してください。,このるーるのいみをせつめいしてください。,Tolong jelaskan arti aturan ini.
190,4,92,5日目,背中,せなか,Punggung,荷物が重くて背中が痛いです。,にもつがおもくてせなかがいたいです。,Punggung saya sakit karena barang bawaan yang berat.
191,4,93,5日目,世話,せわ (する),Merawat / mengurus,祖母がペットの猫の世話をしています。,そぼがぺっとのねこのせわをしています。,Nenek sedang merawat kucing peliharaan.
192,4,94,5日目,洗剤,せんざい,Detergen,洗剤を入れて洗濯機を回しました。,せんざいをいれてせんたくきをまわしました。,Saya memasukkan detergen lalu menyalakan mesin cuci.
193,4,95,5日目,選手,せんしゅ,Atlet / pemain,彼は有名なサッカーの選手です。,かれはゆうめいなさっかーのせんしゅです。,Dia adalah pemain sepak bola terkenal.
194,4,96,5日目,先日,せんじつ,Beberapa hari yang lalu,先日、駅の前で山田さんに会いました。,せんじつ、えきのまえでやまださんにあいました。,Beberapa hari yang lalu, saya bertemu Pak Yamada di depan stasiun.
195,4,97,5日目,洗濯,せんたく (する),Mencuci baju,天気がいいので、今日はたくさん洗濯をします。,てんきがいいので、きょうはたくさんせんたくをします。,Karena cuaca bagus, hari ini saya akan banyak mencuci baju.
196,4,98,5日目,宣伝,せんでん (する),Siaran / Propagasi / Promo,新しいアプリをSNSで宣伝します。,あたらしいあぷりをえすえぬえすでせんでんします。,Mempromosikan aplikasi baru di media sosial.
197,4,99,5日目,先輩,せんぱい,Senior,先輩のアドバイスはとても役に立ちます。,せんぱいのあどばいすはてともやくに立ちます。,Nasihat dari senior sangat berguna.
298,7,4,7日目,同様,どうよう,Sama / serupa,去年と同様に、今年も運動会が開催されます。,きょねんとどうように、ことしもうんどうかいがかいさいされます。,Sama seperti tahun lalu, pesta olahraga juga akan diselenggarakan tahun ini.
299,7,5,7日目,努力,どりょく (する),Usaha keras / upaya,夢を叶えるためには、毎日の努力が必要です。,ゆめをかなえるためには、まいにちのどりょくがひつようです。,Upaya keras setiap hari diperlukan untuk mewujudkan impian.
558,13,4,10日目,炊飯器,すいはんき,Rice cooker / penanak nasi,新しい炊飯器を買ったので、ご飯が美味しく炊けました。,あたらしいすいはんきをかったので、ごはんがおいしくたけました。,Karena membeli cooker baru, nasinya bisa tanak dengan lezat.
624,14,101,10日目,色々,いろいろ,Berbagai / bermacam-macam,日本には、色々な美味しい食べ物があります。,にほんには、いろいろなおいしいたべものがあります。,Ada berbagai makanan lezat di Jepang.
739,17,37,12日目,努める,つとめる,Berusaha keras,問題を早く解決するように努めます。,もんだいをはやくかいけつするようにつとめます。,Saya akan berusaha keras untuk segera menyelesaikan masalah.`;

export function parseCSV(csvText: string): KotobaItem[] {
  const result: KotobaItem[] = [];
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) return [];

  // Parse header to get column mappings or use default map
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells: string[] = [];
    let currentCell = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(currentCell.trim());
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    if (cells.length < 5) continue;

    const index = parseInt(cells[0]) || i;
    const halaman = parseInt(cells[1]) || 1;
    const no = parseInt(cells[2]) || i;
    const bagian = cells[3] || "N/A";
    const kanji = cells[4] || "";
    const hiragana = cells[5] || "";
    const arti = cells[6] || "";
    const contohKalimat = cells[7] || "";
    const contohKalimatHiragana = cells[8] || "";
    const artiKalimat = cells[9] || "";

    result.push({
      id: index,
      index,
      halaman,
      no,
      bagian,
      kanji,
      hiragana,
      arti,
      contohKalimat,
      contohKalimatHiragana,
      artiKalimat: artiKalimat || ""
    });
  }

  return result;
}

// Key localStorage storage keys
const L_STORAGE_KEY_KOTOBA = "kotoba_n3_custom_list";
const L_STORAGE_KEY_FAVORITES = "kotoba_n3_favorites";
const L_STORAGE_KEY_LEARNED = "kotoba_n3_learned_status";
const L_STORAGE_KEY_STREAKS = "kotoba_n3_streak_data";

export function getKotobaData(): KotobaItem[] {
  const custom = localStorage.getItem(L_STORAGE_KEY_KOTOBA);
  if (custom) {
    try {
      return JSON.parse(custom);
    } catch (e) {
      console.error("Failed to parse custom local Kotoba data, resetting to default.", e);
    }
  }
  return parseCsvData(DEFAULT_RAW_CSV);
}

export function saveKotobaData(data: KotobaItem[]) {
  localStorage.setItem(L_STORAGE_KEY_KOTOBA, JSON.stringify(data));
}

export function resetKotobaData() {
  localStorage.removeItem(L_STORAGE_KEY_KOTOBA);
}

export function getFavorites(): number[] {
  const favorites = localStorage.getItem(L_STORAGE_KEY_FAVORITES);
  return favorites ? JSON.parse(favorites) : [];
}

export function saveFavorites(favorites: number[]) {
  localStorage.setItem(L_STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
}

// Learned map: {[id: number]: "unlearned" | "learning" | "mastered"}
export interface ProgressMap {
  [id: number]: "unlearned" | "learning" | "mastered";
}

export function getProgressMap(): ProgressMap {
  const progress = localStorage.getItem(L_STORAGE_KEY_LEARNED);
  return progress ? JSON.parse(progress) : {};
}

export function saveProgressMap(progress: ProgressMap) {
  localStorage.setItem(L_STORAGE_KEY_LEARNED, JSON.stringify(progress));
}

// Streak data
export interface StreakData {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: string[]; // YYYY-MM-DD list
  averageDrawingScore: number;
  charactersDrawn: number;
}

export function getStreakData(): StreakData {
  const defaults: StreakData = {
    streak: 0,
    lastActiveDate: "",
    history: [],
    averageDrawingScore: 0,
    charactersDrawn: 0
  };
  const stringified = localStorage.getItem(L_STORAGE_KEY_STREAKS);
  return stringified ? { ...defaults, ...JSON.parse(stringified) } : defaults;
}

export function saveStreakData(data: StreakData) {
  localStorage.setItem(L_STORAGE_KEY_STREAKS, JSON.stringify(data));
}

export function incrementStreak(): StreakData {
  const today = new Date().toISOString().split('T')[0];
  const current = getStreakData();
  
  if (current.history.indexOf(today) === -1) {
    current.history.push(today);
  }
  
  if (current.lastActiveDate === today) {
    // Already active today
    return current;
  }
  
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterday = yesterdayObj.toISOString().split('T')[0];
  
  if (current.lastActiveDate === yesterday) {
    current.streak += 1;
  } else {
    current.streak = 1; // Reset or start new streak
  }
  
  current.lastActiveDate = today;
  saveStreakData(current);
  return current;
}

export function addCharacterDrawn(score: number) {
  const current = getStreakData();
  const prevCount = current.charactersDrawn;
  current.charactersDrawn += 1;
  current.averageDrawingScore = Math.round(
    (current.averageDrawingScore * prevCount + score) / current.charactersDrawn
  );
  saveStreakData(current);
}

// Basic CSV Parser matching our exact dataset fields
function parseCsvData(csvText: string): KotobaItem[] {
  return parseCSV(csvText);
}
