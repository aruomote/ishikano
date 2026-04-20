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
f.public_selected_heroine = f.public_selected_heroine || "heroine1";
f.public_selected_label = f.public_selected_label || "柊 陽菜";
f.public_release_notice = "";
[endscript]

#システム
石化撮影 体験版です。[p]
ヒロインを選び、通常状態で調整したあとに石化し、一枚をアルバムへ保存してください。[p]
保存が完了した時点で、このセッションはクリアです。[p]

[jump target="*main_menu"]

*main_menu
[glink color="blue" size="28" x="180" y="150" width="420" text="ヒロインを選ぶ" target="*heroine_select" keyfocus="1"]
[glink color="green" size="26" x="180" y="240" width="420" text="遊び方を見る" target="*how_to" keyfocus="2"]
[glink color="green" size="26" x="180" y="330" width="420" text="アルバムを見る" target="*open_album_from_menu" keyfocus="3"]
[glink color="gray" size="26" x="180" y="420" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="4"]
[s]

*how_to
#システム
通常状態では POSE / FACE / LOOK とカメラを調整できます。[p]
石化後はカメラのみ調整できます。構図が決まったら 撮影する を押してください。[p]
左ドラッグで回り込み、右ドラッグで位置調整、ホイールでズーム、ダブルクリックでカメラリセットです。[p]
撮影後に アルバムに残す を選ぶとクリア扱いになります。[p]

[glink color="blue" size="28" x="180" y="220" width="420" text="ヒロインを選ぶ" target="*heroine_select" keyfocus="1"]
[glink color="green" size="26" x="180" y="310" width="420" text="メニューへ戻る" target="*main_menu" keyfocus="2"]
[s]

*heroine_select
#システム
撮影するヒロインを選択してください。[p]

[glink color="blue" size="24" x="140" y="150" width="300" text="柊 陽菜" target="*pick_hina" keyfocus="1"]
[glink color="blue" size="24" x="470" y="150" width="300" text="朝倉 雪乃" target="*pick_yukino" keyfocus="2"]
[glink color="blue" size="24" x="800" y="150" width="300" text="小鳥遊 すず" target="*pick_suzu" keyfocus="3"]
[glink color="green" size="24" x="140" y="245" width="300" text="七瀬 彩音" target="*pick_ayane" keyfocus="4"]
[glink color="green" size="24" x="470" y="245" width="300" text="白石 詩織" target="*pick_shiori" keyfocus="5"]
[glink color="green" size="24" x="800" y="245" width="300" text="鷹宮 莉子" target="*pick_riko" keyfocus="6"]
[glink color="blue" size="24" x="305" y="340" width="300" text="柊 凛花" target="*pick_rinka" keyfocus="7"]
[glink color="gray" size="24" x="635" y="340" width="300" text="戻る" target="*main_menu" keyfocus="8"]
[s]

*pick_hina
[iscript]
f.public_selected_heroine = "heroine1";
f.public_selected_label = "柊 陽菜";
[endscript]
[jump target="*launch_photo"]

*pick_yukino
[iscript]
f.public_selected_heroine = "yukino";
f.public_selected_label = "朝倉 雪乃";
[endscript]
[jump target="*launch_photo"]

*pick_suzu
[iscript]
f.public_selected_heroine = "suzu";
f.public_selected_label = "小鳥遊 すず";
[endscript]
[jump target="*launch_photo"]

*pick_ayane
[iscript]
f.public_selected_heroine = "ayane";
f.public_selected_label = "七瀬 彩音";
[endscript]
[jump target="*launch_photo"]

*pick_shiori
[iscript]
f.public_selected_heroine = "shiori";
f.public_selected_label = "白石 詩織";
[endscript]
[jump target="*launch_photo"]

*pick_riko
[iscript]
f.public_selected_heroine = "riko";
f.public_selected_label = "鷹宮 莉子";
[endscript]
[jump target="*launch_photo"]

*pick_rinka
[iscript]
f.public_selected_heroine = "rinka";
f.public_selected_label = "柊 凛花";
[endscript]
[jump target="*launch_photo"]

*launch_photo
[stone_photo_mvp heroine="&f.public_selected_heroine" result="f.public_release_result" commit_target="*photo_committed" cancel_target="*photo_cancelled"]

*photo_committed
[iscript]
f.public_album_count = (sf.stone_photo_album && sf.stone_photo_album.length) || 0;
f.public_release_notice = "保存完了: " + f.public_selected_label + " / アルバム " + f.public_album_count + " 枚";
[endscript]

#システム
[emb exp="f.public_release_notice || ''"][p]

[jump target="*after_photo_menu"]

*photo_cancelled
[iscript]
f.public_release_notice = "撮影をキャンセルしました: " + f.public_selected_label;
[endscript]

#システム
[emb exp="f.public_release_notice || ''"][p]

[jump target="*cancel_menu"]

*after_photo_menu
[glink color="blue" size="28" x="180" y="150" width="420" text="今日はこの一枚で締める" target="*session_complete" keyfocus="1"]
[glink color="green" size="26" x="180" y="240" width="420" text="同じヒロインでもう一枚撮る" target="*launch_photo" keyfocus="2"]
[glink color="green" size="26" x="180" y="330" width="420" text="別のヒロインを選ぶ" target="*heroine_select" keyfocus="3"]
[glink color="green" size="26" x="180" y="420" width="420" text="アルバムを見る" target="*open_album_after" keyfocus="4"]
[glink color="gray" size="26" x="180" y="510" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="5"]
[s]

*cancel_menu
[glink color="blue" size="28" x="180" y="200" width="420" text="もう一度撮影に入る" target="*launch_photo" keyfocus="1"]
[glink color="green" size="26" x="180" y="290" width="420" text="別のヒロインを選ぶ" target="*heroine_select" keyfocus="2"]
[glink color="gray" size="26" x="180" y="380" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*session_complete
#システム
セッション完了です。[p]
保存した写真はアルバムから確認できます。[p]
続ける場合は別のヒロインを選択してください。[p]

[glink color="blue" size="28" x="180" y="220" width="420" text="別のヒロインを選ぶ" target="*heroine_select" keyfocus="1"]
[glink color="green" size="26" x="180" y="310" width="420" text="アルバムを見る" target="*open_album_complete" keyfocus="2"]
[glink color="gray" size="26" x="180" y="400" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*open_album_from_menu
[stone_photo_album]
[jump target="*main_menu"]

*open_album_after
[stone_photo_album]
[jump target="*after_photo_menu"]

*open_album_complete
[stone_photo_album]
[jump target="*session_complete"]
