*start

[cm]
[clearfix]
[bg storage="room.jpg" time="300"]
[start_keyconfig]
@showmenubutton

[position layer="message0" left=120 top=470 width=1040 height=200 page=fore visible=true]
[position layer=message0 page=fore margint="34" marginl="42" marginr="42" marginb="32"]
@layopt layer=message0 visible=true
[ptext name="chara_name_area" layer="message0" color="white" size=28 bold=true x=150 y=480]
[chara_config ptext="chara_name_area"]

# 
部室には、いつもの撮影機材が並んでいる。[p]
今日は誰の写真を撮ろうか。[p]

[iscript]
f.stone_photo_selected_heroine = f.stone_photo_selected_heroine || "heroine1";
f.stone_photo_selected_label = f.stone_photo_selected_label || "柊 陽菜";
f.stone_photo_notice = f.stone_photo_notice || "";
[endscript]

[glink color="blue" size="28" x="180" y="180" width="420" text="撮影を始める" target="*heroine_select" keyfocus="1"]
[glink color="green" size="26" x="180" y="270" width="420" text="アルバムを見る" target="*open_album" keyfocus="2"]
[glink color="gray" size="26" x="180" y="360" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*heroine_select
# 
撮影に誘う相手を選ぼう。[p]

[glink color="blue" size="24" x="140" y="160" width="300" text="柊 陽菜" target="*pick_hina" keyfocus="1"]
[glink color="blue" size="24" x="470" y="160" width="300" text="朝倉 雪乃" target="*pick_yukino" keyfocus="2"]
[glink color="blue" size="24" x="800" y="160" width="300" text="小鳥遊 すず" target="*pick_suzu" keyfocus="3"]
[glink color="green" size="24" x="140" y="255" width="300" text="七瀬 彩音" target="*pick_ayane" keyfocus="4"]
[glink color="green" size="24" x="470" y="255" width="300" text="白石 詩織" target="*pick_shiori" keyfocus="5"]
[glink color="green" size="24" x="800" y="255" width="300" text="鷹宮 莉子" target="*pick_riko" keyfocus="6"]
[glink color="blue" size="24" x="140" y="350" width="300" text="柊 凛花" target="*pick_rinka" keyfocus="7"]
[glink color="gray" size="24" x="470" y="380" width="300" text="戻る" target="*start" keyfocus="8"]
[s]

*pick_hina
[iscript]
f.stone_photo_selected_heroine = "heroine1";
f.stone_photo_selected_label = "柊 陽菜";
[endscript]
[jump target="*launch_photo"]

*pick_yukino
[iscript]
f.stone_photo_selected_heroine = "yukino";
f.stone_photo_selected_label = "朝倉 雪乃";
[endscript]
[jump target="*launch_photo"]

*pick_suzu
[iscript]
f.stone_photo_selected_heroine = "suzu";
f.stone_photo_selected_label = "小鳥遊 すず";
[endscript]
[jump target="*launch_photo"]

*pick_ayane
[iscript]
f.stone_photo_selected_heroine = "ayane";
f.stone_photo_selected_label = "七瀬 彩音";
[endscript]
[jump target="*launch_photo"]

*pick_shiori
[iscript]
f.stone_photo_selected_heroine = "shiori";
f.stone_photo_selected_label = "白石 詩織";
[endscript]
[jump target="*launch_photo"]

*pick_riko
[iscript]
f.stone_photo_selected_heroine = "riko";
f.stone_photo_selected_label = "鷹宮 莉子";
[endscript]
[jump target="*launch_photo"]

*pick_rinka
[iscript]
f.stone_photo_selected_heroine = "rinka";
f.stone_photo_selected_label = "柊 凛花";
[endscript]
[jump target="*launch_photo"]

*launch_photo
[stone_photo_mvp heroine="&f.stone_photo_selected_heroine" result="f.stone_photo_result" commit_target="*photo_committed" cancel_target="*photo_cancelled"]

*photo_committed
[iscript]
f.stone_photo_album_count = (sf.stone_photo_album && sf.stone_photo_album.length) || 0;
f.stone_photo_notice = f.stone_photo_selected_label + " の写真をアルバムに残した。アルバムには今 " + f.stone_photo_album_count + " 枚の写真がある。";
[endscript]
[jump target="*photo_menu"]

*photo_cancelled
[iscript]
f.stone_photo_notice = f.stone_photo_selected_label + " の撮影を切り上げた。";
[endscript]
[jump target="*photo_menu"]

*photo_menu
[emb exp="f.stone_photo_notice || ''"][p]

[jump target="*photo_menu_options"]

*photo_menu_options
[glink color="blue" size="28" x="180" y="160" width="420" text="同じヒロインでもう一度撮影する" target="*launch_photo" keyfocus="1"]
[glink color="green" size="26" x="180" y="250" width="420" text="別のヒロインを選ぶ" target="*heroine_select" keyfocus="2"]
[glink color="green" size="26" x="180" y="340" width="420" text="アルバムを見る" target="*open_album" keyfocus="3"]
[glink color="gray" size="26" x="180" y="430" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="4"]
[s]

*open_album
[stone_photo_album]

[iscript]
f.stone_photo_notice = "";
[endscript]
[jump target="*photo_menu_options"]
