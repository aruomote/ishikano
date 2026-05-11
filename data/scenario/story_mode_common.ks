*start

[cm]
[clearfix]
[freeimage layer=0]
[layopt layer=0 visible=false]
[bg storage="room.jpg" time="300"]
[start_keyconfig]
@showmenubutton

[position layer="message0" left=120 top=470 width=1040 height=200 page=fore visible=true]
[position layer=message0 page=fore margint="34" marginl="42" marginr="42" marginb="32"]
@layopt layer=message0 visible=true
[ptext name="chara_name_area" layer="message0" color="white" size=28 bold=true x=150 y=480]
[chara_config ptext="chara_name_area"]

[iscript]
var heroineIds = ["heroine1", "yukino", "suzu", "ayane", "shiori", "riko", "rinka"];
var heroineDisplayNames = {
  heroine1: "陽菜",
  yukino: "雪乃",
  suzu: "すず",
  ayane: "彩音",
  shiori: "詩織",
  riko: "莉子",
  rinka: "凛花"
};
f.story_mode_enabled = true;
f.story_day = 1;
f.story_slot = "lunch";
f.story_action_index = 0;
f.story_current_location_id = "";
f.story_current_location_label = "";
f.story_current_heroine_id = "";
f.story_last_photo_heroine_id = "";
f.story_last_photo_saved = false;
f.story_route_heroine_id = "";
f.story_route_result = "none";
f.story_action_summary = "";
f.story_photo_result = null;
f.story_photo_notice = "";
f.story_selected_mode = "story";
f.story_day_card_shown_day = 0;
f.story_day_seven_intro_shown = false;
f.story_heroine_display_names = heroineDisplayNames;
f.story_shot_count = {};
f.story_last_shot_order = {};
f.story_talk_phase = {};
f.story_unlock_phase = {};
f.story_seen_events = {};
for (var i = 0; i < heroineIds.length; i++) {
  var heroineId = heroineIds[i];
  f.story_shot_count[heroineId] = 0;
  f.story_last_shot_order[heroineId] = 0;
  f.story_talk_phase[heroineId] = 0;
  f.story_unlock_phase[heroineId] = 0;
  f.story_seen_events[heroineId] = {};
}
sf.story_seen_mode_intro = sf.story_seen_mode_intro || false;
[endscript]

#
一週間のあいだ、昼休みと放課後の撮影を通して少しずつ距離を縮めていく。[p]
昼休みと放課後、毎日二回の行動で、誰と向き合うかを選んでいこう。[p]
今の試作版では、陽菜と彩音と詩織と雪乃とすずと莉子、そして家で会える凛花の導線から一週間の流れを試せるようにしてある。[p]

[iscript]
sf.story_seen_mode_intro = true;
[endscript]

[jump target="*story_dispatch"]

*story_dispatch
[iscript]
f.story_last_photo_saved = false;
f.story_photo_notice = "";
f.story_photo_result = null;
f.story_heroine_display_names = f.story_heroine_display_names || {
  heroine1: "陽菜",
  yukino: "雪乃",
  suzu: "すず",
  ayane: "彩音",
  shiori: "詩織",
  riko: "莉子",
  rinka: "凛花"
};
[endscript]
@jump target="*story_day_seven_intro" cond="f.story_day >= 7 && !f.story_day_seven_intro_shown"
@jump target="*story_ending_dispatch" cond="f.story_day >= 7"
@jump target="*story_day_intro" cond="f.story_slot == 'lunch' && f.story_day_card_shown_day != f.story_day"
@jump target="*lunch_menu" cond="f.story_slot == 'lunch'"
@jump target="*after_school_menu"

*story_day_intro
[cm]
[clearfix]
[bg storage="room.jpg" time="250"]
[wait time="180"]
[layopt layer=message0 visible=false]
[layopt layer=0 visible=true]
[freeimage layer=0]

[iscript]
f.story_day_card_label = "Day " + f.story_day;
if (f.story_day <= 1) {
  f.story_day_card_subtitle = "一週間の始まり";
} else {
  f.story_day_card_subtitle = "昼休み";
}
f.story_day_card_shown_day = f.story_day;
[endscript]

[ptext name="story_day_card_title" layer="0" x="480" y="230" size="54" color="0xF8F7F2" bold="true" text="&f.story_day_card_label"]
[ptext name="story_day_card_subtitle" layer="0" x="430" y="320" size="26" color="0xE7D9C4" bold="true" text="&f.story_day_card_subtitle"]
[wait time="720"]
[freeimage layer=0]
[layopt layer=0 visible=false]
[layopt layer=message0 visible=true]
[jump target="*lunch_menu"]

*story_day_seven_intro
[cm]
[clearfix]
[bg storage="room.jpg" time="250"]
[wait time="180"]
[layopt layer=message0 visible=false]
[layopt layer=0 visible=true]
[freeimage layer=0]

[iscript]
f.story_day_seven_intro_shown = true;
[endscript]

[ptext name="story_day_seven_title" layer="0" x="470" y="220" size="58" color="0xF8F7F2" bold="true" text="Day 7"]
[ptext name="story_day_seven_subtitle" layer="0" x="370" y="308" size="28" color="0xE7D9C4" bold="true" text="この一週間の答えへ"]
[wait time="900"]
[freeimage layer=0]
[layopt layer=0 visible=false]
[layopt layer=message0 visible=true]
[jump target="*story_ending_dispatch"]

*lunch_menu
[cm]
[clearfix]
[bg storage="room.jpg" time="200"]
[position layer="message0" left=120 top=60 width=1040 height=120 page=fore visible=true]
[position layer=message0 page=fore margint="22" marginl="32" marginr="32" marginb="18"]

[iscript]
f.story_slot_label = "昼休み";
f.story_day_label = "Day " + f.story_day;
var heroineIds = ["heroine1", "yukino", "suzu", "ayane", "shiori", "riko", "rinka"];
var heroineDisplayNames = f.story_heroine_display_names || {};
var totalShots = 0;
var leadHeroineId = "";
var leadShotCount = 0;
for (var i = 0; i < heroineIds.length; i++) {
  var heroineId = heroineIds[i];
  var count = f.story_shot_count[heroineId] || 0;
  totalShots += count;
  if (count > leadShotCount) {
    leadHeroineId = heroineId;
    leadShotCount = count;
  }
}
f.story_progress_label = "今週 " + (f.story_action_index + 1) + " / 12 行動目";
f.story_collection_label = "保存済み " + totalShots + " 枚";
f.story_lead_label = leadHeroineId
  ? "いちばん多く向き合っている相手: " + (heroineDisplayNames[leadHeroineId] || leadHeroineId) + "（" + leadShotCount + "回）"
  : "まだ誰の写真も保存していない。";
[endscript]

#システム
[emb exp="f.story_day_label"]　[emb exp="f.story_slot_label"]。[p]
[emb exp="f.story_progress_label"] / [emb exp="f.story_collection_label"]。[p]
[emb exp="f.story_lead_label"][p]
どこへ向かう？[p]

[glink color="blue" size="24" x="130" y="220" width="430" text="教室へ向かう（陽菜）" target="*go_heroine1_lunch" keyfocus="1"]
[glink color="green" size="22" x="130" y="305" width="430" text="中庭へ行く（彩音）" target="*go_ayane_lunch" keyfocus="2"]
[glink color="green" size="22" x="130" y="390" width="430" text="図書室へ行く（詩織）" target="*go_shiori_lunch" keyfocus="3"]
[glink color="green" size="22" x="610" y="220" width="430" text="生徒会室へ行く（雪乃）" target="*go_yukino_lunch" keyfocus="4"]
[glink color="green" size="22" x="610" y="305" width="430" text="美術室へ行く（すず）" target="*go_suzu_lunch" keyfocus="5"]
[glink color="green" size="22" x="610" y="390" width="430" text="教材準備室へ行く（莉子）" target="*go_riko_lunch" keyfocus="6"]
[glink color="gray" size="22" x="230" y="500" width="360" text="アルバムを見る" target="*open_album_lunch" keyfocus="7"]
[glink color="gray" size="22" x="670" y="500" width="360" text="タイトルへ戻る" storage="title.ks" keyfocus="8"]
[s]

*after_school_menu
[cm]
[clearfix]
[bg storage="rouka.jpg" time="200"]
[position layer="message0" left=120 top=60 width=1040 height=120 page=fore visible=true]
[position layer=message0 page=fore margint="22" marginl="32" marginr="32" marginb="18"]

[iscript]
f.story_slot_label = "放課後";
f.story_day_label = "Day " + f.story_day;
var heroineIds = ["heroine1", "yukino", "suzu", "ayane", "shiori", "riko", "rinka"];
var heroineDisplayNames = f.story_heroine_display_names || {};
var totalShots = 0;
var leadHeroineId = "";
var leadShotCount = 0;
for (var i = 0; i < heroineIds.length; i++) {
  var heroineId = heroineIds[i];
  var count = f.story_shot_count[heroineId] || 0;
  totalShots += count;
  if (count > leadShotCount) {
    leadHeroineId = heroineId;
    leadShotCount = count;
  }
}
f.story_progress_label = "今週 " + (f.story_action_index + 1) + " / 12 行動目";
f.story_collection_label = "保存済み " + totalShots + " 枚";
f.story_lead_label = leadHeroineId
  ? "いちばん多く向き合っている相手: " + (heroineDisplayNames[leadHeroineId] || leadHeroineId) + "（" + leadShotCount + "回）"
  : "まだ誰の写真も保存していない。";
[endscript]

#システム
[emb exp="f.story_day_label"]　[emb exp="f.story_slot_label"]。[p]
[emb exp="f.story_progress_label"] / [emb exp="f.story_collection_label"]。[p]
[emb exp="f.story_lead_label"][p]
授業が終わった。誰と向き合う？[p]

[glink color="blue" size="24" x="130" y="200" width="430" text="教室に残る（陽菜）" target="*go_heroine1_after_school" keyfocus="1"]
[glink color="green" size="22" x="130" y="275" width="430" text="中庭へ行く（彩音）" target="*go_ayane_after_school" keyfocus="2"]
[glink color="green" size="22" x="130" y="350" width="430" text="図書室へ行く（詩織）" target="*go_shiori_after_school" keyfocus="3"]
[glink color="green" size="22" x="130" y="425" width="430" text="生徒会室へ行く（雪乃）" target="*go_yukino_after_school" keyfocus="4"]
[glink color="green" size="22" x="610" y="200" width="430" text="美術室へ行く（すず）" target="*go_suzu_after_school" keyfocus="5"]
[glink color="green" size="22" x="610" y="275" width="430" text="教材準備室へ行く（莉子）" target="*go_riko_after_school" keyfocus="6"]
[glink color="green" size="22" x="610" y="350" width="430" text="家に帰る（凛花）" target="*go_rinka_after_school" keyfocus="7"]
[glink color="gray" size="22" x="230" y="520" width="360" text="アルバムを見る" target="*open_album_after_school" keyfocus="8"]
[glink color="gray" size="22" x="670" y="520" width="360" text="タイトルへ戻る" storage="title.ks" keyfocus="9"]
[s]

*go_heroine1_lunch
[iscript]
f.story_current_location_id = "classroom";
f.story_current_location_label = "教室";
f.story_current_heroine_id = "heroine1";
[endscript]
@jump storage="story_mode_heroine1.ks" target="*scene_entry"

*go_heroine1_after_school
[iscript]
f.story_current_location_id = "classroom_after";
f.story_current_location_label = "放課後の教室";
f.story_current_heroine_id = "heroine1";
[endscript]
@jump storage="story_mode_heroine1.ks" target="*scene_entry"

*go_ayane_lunch
[iscript]
f.story_current_location_id = "courtyard";
f.story_current_location_label = "中庭";
f.story_current_heroine_id = "ayane";
[endscript]
@jump storage="story_mode_ayane.ks" target="*scene_entry"

*go_ayane_after_school
[iscript]
f.story_current_location_id = "courtyard_after";
f.story_current_location_label = "放課後の中庭";
f.story_current_heroine_id = "ayane";
[endscript]
@jump storage="story_mode_ayane.ks" target="*scene_entry"

*go_shiori_lunch
[iscript]
f.story_current_location_id = "library";
f.story_current_location_label = "図書室";
f.story_current_heroine_id = "shiori";
[endscript]
@jump storage="story_mode_shiori.ks" target="*scene_entry"

*go_shiori_after_school
[iscript]
f.story_current_location_id = "library_after";
f.story_current_location_label = "放課後の図書室";
f.story_current_heroine_id = "shiori";
[endscript]
@jump storage="story_mode_shiori.ks" target="*scene_entry"

*go_yukino_lunch
[iscript]
f.story_current_location_id = "student_council_room_lunch";
f.story_current_location_label = "昼休みの生徒会室";
f.story_current_heroine_id = "yukino";
[endscript]
@jump storage="story_mode_yukino.ks" target="*scene_entry"

*go_yukino_after_school
[iscript]
f.story_current_location_id = "student_council_room";
f.story_current_location_label = "生徒会室";
f.story_current_heroine_id = "yukino";
[endscript]
@jump storage="story_mode_yukino.ks" target="*scene_entry"

*go_suzu_lunch
[iscript]
f.story_current_location_id = "art_room_lunch";
f.story_current_location_label = "昼休みの美術室";
f.story_current_heroine_id = "suzu";
[endscript]
@jump storage="story_mode_suzu.ks" target="*scene_entry"

*go_suzu_after_school
[iscript]
f.story_current_location_id = "art_room";
f.story_current_location_label = "美術室";
f.story_current_heroine_id = "suzu";
[endscript]
@jump storage="story_mode_suzu.ks" target="*scene_entry"

*go_riko_lunch
[iscript]
f.story_current_location_id = "reference_room_lunch";
f.story_current_location_label = "昼休みの教材準備室";
f.story_current_heroine_id = "riko";
[endscript]
@jump storage="story_mode_riko.ks" target="*scene_entry"

*go_riko_after_school
[iscript]
f.story_current_location_id = "reference_room";
f.story_current_location_label = "教材準備室";
f.story_current_heroine_id = "riko";
[endscript]
@jump storage="story_mode_riko.ks" target="*scene_entry"

*go_rinka_lunch
[iscript]
f.story_current_location_id = "home_day";
f.story_current_location_label = "家";
f.story_current_heroine_id = "rinka";
[endscript]
@jump storage="story_mode_rinka.ks" target="*scene_entry"

*go_rinka_after_school
[iscript]
f.story_current_location_id = "home_evening";
f.story_current_location_label = "家";
f.story_current_heroine_id = "rinka";
[endscript]
@jump storage="story_mode_rinka.ks" target="*scene_entry"

*coming_soon_lunch
#システム
この時間帯の別ヒロイン導線は、これから作る予定です。[p]
今の試作版では、陽菜ルートから週進行の手触りを確認できます。[p]
[jump target="*lunch_menu"]

*coming_soon_after_school
#システム
放課後の別ヒロイン導線は、これから作る予定です。[p]
今の試作版では、陽菜ルートから週進行の手触りを確認できます。[p]
[jump target="*after_school_menu"]

*open_album_lunch
[stone_photo_album]
[jump target="*lunch_menu"]

*open_album_after_school
[stone_photo_album]
[jump target="*after_school_menu"]

*after_action
[cm]
[clearfix]
@showmenubutton

[iscript]
var heroineDisplayNames = f.story_heroine_display_names || {};
var currentHeroineName = heroineDisplayNames[f.story_current_heroine_id] || "";
var currentLocationLabel = f.story_current_location_label || "";
if (currentLocationLabel && currentHeroineName) {
  f.story_scene_heading = currentLocationLabel + "で" + currentHeroineName + "と過ごした。";
} else if (currentHeroineName) {
  f.story_scene_heading = currentHeroineName + "と過ごした。";
} else {
  f.story_scene_heading = "";
}
if (f.story_slot === "lunch") {
  f.story_after_action_transition = f.story_last_photo_saved
    ? "昼休みの余韻を残したまま、午後の時間が近づいてくる。"
    : "少し心残りを抱えたまま、午後の時間が近づいてくる。";
  f.story_next_action_label = "放課後へ進む";
} else if (f.story_day >= 6) {
  f.story_after_action_transition = f.story_last_photo_saved
    ? "今日まで重ねた一枚一枚が、この一週間の答えにつながっていく。"
    : "まだ言葉にならない気持ちを抱えたまま、一週間の答えへ向かう。";
  f.story_next_action_label = "七日目へ進む";
} else {
  f.story_after_action_transition = f.story_last_photo_saved
    ? "今日の一枚を胸に、明日はもう少し近づける気がした。"
    : "今日のやり取りを胸に、明日はもう少し踏み込める気がした。";
  f.story_next_action_label = "次の日へ進む";
}
[endscript]

#システム
[emb exp="f.story_scene_heading"][p]
[emb exp="f.story_action_summary || ''"][p]
[emb exp="f.story_after_action_transition"][p]

[if exp="f.story_slot == 'lunch'"]
[glink color="blue" size="28" x="150" y="220" width="420" text="&f.story_next_action_label" target="*advance_action" keyfocus="1"]
[elsif exp="f.story_day >= 6"]
[glink color="blue" size="28" x="150" y="220" width="420" text="&f.story_next_action_label" target="*advance_action" keyfocus="1"]
[else]
[glink color="blue" size="28" x="150" y="220" width="420" text="&f.story_next_action_label" target="*advance_action" keyfocus="1"]
[endif]
[glink color="green" size="24" x="150" y="310" width="420" text="アルバムを見る" target="*open_album_after_action" keyfocus="2"]
[glink color="gray" size="24" x="150" y="400" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*open_album_after_action
[stone_photo_album]
[jump target="*after_action"]

*advance_action
[iscript]
f.story_action_index += 1;
if (f.story_slot === "lunch") {
  f.story_slot = "after_school";
} else {
  f.story_slot = "lunch";
  f.story_day += 1;
}
[endscript]
[jump target="*story_dispatch"]

*story_ending_dispatch
[iscript]
var heroineIds = ["heroine1", "yukino", "suzu", "ayane", "shiori", "riko", "rinka"];
var selectedHeroineId = "";
var topCount = 0;
var topOrder = 0;
for (var i = 0; i < heroineIds.length; i++) {
  var heroineId = heroineIds[i];
  var count = f.story_shot_count[heroineId] || 0;
  var order = f.story_last_shot_order[heroineId] || 0;
  if (count > topCount || (count === topCount && count > 0 && order > topOrder)) {
    selectedHeroineId = heroineId;
    topCount = count;
    topOrder = order;
  }
}
f.story_route_heroine_id = selectedHeroineId;
f.story_route_photo_count = topCount;
[endscript]

@jump target="*ending_heroine1" cond="f.story_route_heroine_id == 'heroine1'"
@jump target="*ending_ayane" cond="f.story_route_heroine_id == 'ayane'"
@jump target="*ending_yukino" cond="f.story_route_heroine_id == 'yukino'"
@jump target="*ending_suzu" cond="f.story_route_heroine_id == 'suzu'"
@jump target="*ending_shiori" cond="f.story_route_heroine_id == 'shiori'"
@jump target="*ending_riko" cond="f.story_route_heroine_id == 'riko'"
@jump target="*ending_rinka" cond="f.story_route_heroine_id == 'rinka'"
@jump target="*ending_none"

*ending_heroine1
[cm]
[clearfix]
[bg storage="room.jpg" time="300"]

#システム
七日目。今週いちばん多く向き合ったのは、陽菜だった。[p]

#柊 陽菜
最初は文化祭の手伝いのつもりだったのに、今週は君に撮ってもらう時間そのものを待ってた。[p]
どんなふうに見つけてくれるのか、それが少しずつ楽しみになってたんだと思う。[p]

#
シャッターを切るたびに、陽菜が少しずつ自然な顔を見せてくれるようになった。[p]

#柊 陽菜
誰かのためにじゃなくて、自分の気持ちでここに立てた気がするの。[p]
……次も、君に私のことを見つけてほしいな。[p]

[iscript]
sf.story_cleared_heroine_ids = Array.isArray(sf.story_cleared_heroine_ids) ? sf.story_cleared_heroine_ids : [];
if (sf.story_cleared_heroine_ids.indexOf("heroine1") < 0) {
  sf.story_cleared_heroine_ids.push("heroine1");
}
f.story_route_result = "cleared";
[endscript]

[glink color="blue" size="28" x="150" y="240" width="420" text="もう一度ストーリーモードを始める" target="*start" keyfocus="1"]
[glink color="green" size="24" x="150" y="330" width="420" text="撮影体験版へ行く" storage="stone_photo_public_release.ks" keyfocus="2"]
[glink color="gray" size="24" x="150" y="420" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*ending_ayane
[cm]
[clearfix]
[bg storage="room.jpg" time="300"]

#システム
七日目。今週いちばん多く向き合ったのは、彩音だった。[p]

#七瀬 彩音
最初は気楽に付き合うだけのつもりだったのに、今週は君といる時間が思ってたよりずっと特別になってた。[p]
いつの間にか、次はいつ撮ってくれるのかなって待ってたんだよね。[p]

#
いつもの軽さの奥で、彩音の言葉だけが少し震えていた。[p]

#七瀬 彩音
友達のままでもよかったはずなのに、もうそれだけじゃ足りないかも。[p]
……だから次も、ちゃんと私のこと一番に見てよね。[p]

[iscript]
sf.story_cleared_heroine_ids = Array.isArray(sf.story_cleared_heroine_ids) ? sf.story_cleared_heroine_ids : [];
if (sf.story_cleared_heroine_ids.indexOf("ayane") < 0) {
  sf.story_cleared_heroine_ids.push("ayane");
}
f.story_route_result = "cleared";
[endscript]

[glink color="blue" size="28" x="150" y="240" width="420" text="もう一度ストーリーモードを始める" target="*start" keyfocus="1"]
[glink color="green" size="24" x="150" y="330" width="420" text="撮影体験版へ行く" storage="stone_photo_public_release.ks" keyfocus="2"]
[glink color="gray" size="24" x="150" y="420" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*ending_yukino
[cm]
[clearfix]
[bg storage="room.jpg" time="300"]

#システム
七日目。今週いちばん多く向き合ったのは、雪乃だった。[p]

#朝倉 雪乃
最初はただの確認作業のつもりだったわ。[p]
でも今は、この一週間がそれだけでは説明できない時間だったとはっきりわかる。[p]

#
端正に保たれていた雪乃の表情が、今は静かにほどけていた。[p]

#朝倉 雪乃
会長としての私ではなく、一人の私を見てくれたのは、きっとあなただけ。[p]
……次も、その視線の前では取り繕わずに立ってみせるわ。[p]

[iscript]
sf.story_cleared_heroine_ids = Array.isArray(sf.story_cleared_heroine_ids) ? sf.story_cleared_heroine_ids : [];
if (sf.story_cleared_heroine_ids.indexOf("yukino") < 0) {
  sf.story_cleared_heroine_ids.push("yukino");
}
f.story_route_result = "cleared";
[endscript]

[glink color="blue" size="28" x="150" y="240" width="420" text="もう一度ストーリーモードを始める" target="*start" keyfocus="1"]
[glink color="green" size="24" x="150" y="330" width="420" text="撮影体験版へ行く" storage="stone_photo_public_release.ks" keyfocus="2"]
[glink color="gray" size="24" x="150" y="420" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*ending_suzu
[cm]
[clearfix]
[bg storage="room.jpg" time="300"]

#システム
七日目。今週いちばん多く向き合ったのは、すずだった。[p]

#小鳥遊 すず
先輩と撮ってるうちに、最初よりずっと自分に自信が持てるようになりました。[p]
それに今は、先輩に見てもらえるのがもう待ち遠しいんです。[p]

#
無邪気だった笑顔の奥に、以前よりはっきりした想いが見えた。[p]

#小鳥遊 すず
もっと成長したところ、これからも先輩に見てほしいです。[p]
……だから次も、私のこといっぱい見つけてくださいね。[p]

[iscript]
sf.story_cleared_heroine_ids = Array.isArray(sf.story_cleared_heroine_ids) ? sf.story_cleared_heroine_ids : [];
if (sf.story_cleared_heroine_ids.indexOf("suzu") < 0) {
  sf.story_cleared_heroine_ids.push("suzu");
}
f.story_route_result = "cleared";
[endscript]

[glink color="blue" size="28" x="150" y="240" width="420" text="もう一度ストーリーモードを始める" target="*start" keyfocus="1"]
[glink color="green" size="24" x="150" y="330" width="420" text="撮影体験版へ行く" storage="stone_photo_public_release.ks" keyfocus="2"]
[glink color="gray" size="24" x="150" y="420" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*ending_shiori
[cm]
[clearfix]
[bg storage="room.jpg" time="300"]

#システム
七日目。今週いちばん多く向き合ったのは、詩織だった。[p]

#白石 詩織
最初は、君に見られるのが少し怖かったの。[p]
でも今は、見つけてもらえることを少し待っている自分がいる。[p]

#
静かだった詩織の声に、以前よりはっきりとした温度が宿っていた。[p]

#白石 詩織
君が撮ってくれたから、私も私を見つけられた気がするの。[p]
……次も、隠れないでちゃんとここにいるね。[p]

[iscript]
sf.story_cleared_heroine_ids = Array.isArray(sf.story_cleared_heroine_ids) ? sf.story_cleared_heroine_ids : [];
if (sf.story_cleared_heroine_ids.indexOf("shiori") < 0) {
  sf.story_cleared_heroine_ids.push("shiori");
}
f.story_route_result = "cleared";
[endscript]

[glink color="blue" size="28" x="150" y="240" width="420" text="もう一度ストーリーモードを始める" target="*start" keyfocus="1"]
[glink color="green" size="24" x="150" y="330" width="420" text="撮影体験版へ行く" storage="stone_photo_public_release.ks" keyfocus="2"]
[glink color="gray" size="24" x="150" y="420" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*ending_riko
[cm]
[clearfix]
[bg storage="room.jpg" time="300"]

#システム
七日目。今週いちばん多く向き合ったのは、莉子先生だった。[p]

#鷹宮 莉子
最初は、ほんの出来心だったのよ。[p]
少しだけ付き合うつもりだったのに……気づけば私のほうが、この内緒の時間を待っていたみたい。[p]

#
教師として引いていた一歩のぶんだけ、莉子の声は静かに近くなっていた。[p]

#鷹宮 莉子
先生と生徒のままでいいの。[p]
でも、あなたと過ごしたこの一週間はきっと少し特別だったわ。[p]
……だから次も、内緒の冒険の続きに付き合ってくれる？[p]

[iscript]
sf.story_cleared_heroine_ids = Array.isArray(sf.story_cleared_heroine_ids) ? sf.story_cleared_heroine_ids : [];
if (sf.story_cleared_heroine_ids.indexOf("riko") < 0) {
  sf.story_cleared_heroine_ids.push("riko");
}
f.story_route_result = "cleared";
[endscript]

[glink color="blue" size="28" x="150" y="240" width="420" text="もう一度ストーリーモードを始める" target="*start" keyfocus="1"]
[glink color="green" size="24" x="150" y="330" width="420" text="撮影体験版へ行く" storage="stone_photo_public_release.ks" keyfocus="2"]
[glink color="gray" size="24" x="150" y="420" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*ending_rinka
[cm]
[clearfix]
[bg storage="room.jpg" time="300"]

#システム
七日目。今週いちばん多く向き合ったのは、凛花だった。[p]

#柊 凛花
家に帰ってくるたびにカメラ持ってるの、今思うとちょっとずるいよね。[p]
最初は面倒だと思ってたのに……気づいたら、今日も来るかなって待ってた自分がいたし。[p]

#
拗ねたような声の奥に、凛花らしい素直さが少しだけ混ざっていた。[p]

#柊 凛花
べ、別に毎日帰ってきてほしいとかじゃないから。[p]
でも次も撮るなら、ちゃんと一番かわいいところ見つけてよね。お兄ちゃん。[p]

[iscript]
sf.story_cleared_heroine_ids = Array.isArray(sf.story_cleared_heroine_ids) ? sf.story_cleared_heroine_ids : [];
if (sf.story_cleared_heroine_ids.indexOf("rinka") < 0) {
  sf.story_cleared_heroine_ids.push("rinka");
}
f.story_route_result = "cleared";
[endscript]

[glink color="blue" size="28" x="150" y="240" width="420" text="もう一度ストーリーモードを始める" target="*start" keyfocus="1"]
[glink color="green" size="24" x="150" y="330" width="420" text="撮影体験版へ行く" storage="stone_photo_public_release.ks" keyfocus="2"]
[glink color="gray" size="24" x="150" y="420" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*ending_none
[cm]
[clearfix]
[bg storage="room.jpg" time="300"]

#システム
七日目になったが、今週は誰か一人に強く踏み込むところまでは届かなかった。[p]
次は、もっと一枚一枚と向き合ってみよう。[p]

[glink color="blue" size="28" x="150" y="240" width="420" text="もう一度ストーリーモードを始める" target="*start" keyfocus="1"]
[glink color="green" size="24" x="150" y="330" width="420" text="撮影体験版へ行く" storage="stone_photo_public_release.ks" keyfocus="2"]
[glink color="gray" size="24" x="150" y="420" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]
