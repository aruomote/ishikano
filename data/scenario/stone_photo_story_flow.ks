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

[iscript]
f.story_photo_notice = "";
f.story_photo_result = null;
[endscript]

#
放課後の部室には、まだやわらかい西日が残っていた。[p]
今日は陽菜の撮影当番だ。機材の準備も、背景の確認も、もう済んでいる。[p]

#柊 陽菜
準備できたよ。今日は、どんな一枚にする？[p]

[jump target="*start_options"]

*start_options
[glink color="blue" size="28" x="180" y="180" width="420" text="陽菜の撮影を始める" target="*launch_photo" keyfocus="1"]
[glink color="green" size="26" x="180" y="270" width="420" text="アルバムを開く" target="*open_album" keyfocus="2"]
[glink color="gray" size="26" x="180" y="360" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="3"]
[s]

*launch_photo
[stone_photo_mvp heroine="heroine1" result="f.story_photo_result" commit_target="*photo_committed" cancel_target="*photo_cancelled"]

*photo_committed
[iscript]
f.story_photo_album_count = (sf.stone_photo_album && sf.stone_photo_album.length) || 0;
f.story_photo_notice = "陽菜の写真を一枚、アルバムに残した。今の保存枚数は " + f.story_photo_album_count + " 枚。";
[endscript]

#
シャッターの余韻が、静かな部室にゆっくり溶けていく。[p]
#柊 陽菜
今の、ちゃんと残しておきたいな。[p]
[jump target="*after_photo"]

*photo_cancelled
[iscript]
f.story_photo_notice = "撮影は見送りにして、いったんカメラを置いた。";
[endscript]

#
いったんカメラを下ろして、呼吸を整えることにした。[p]
#柊 陽菜
うん、今日は無理に急がなくても大丈夫。[p]
[jump target="*after_photo"]

*after_photo
[emb exp="f.story_photo_notice || ''"][p]

[jump target="*after_photo_options"]

*after_photo_options
[glink color="blue" size="28" x="180" y="180" width="420" text="もう一度この場面から撮影する" target="*launch_photo" keyfocus="1"]
[glink color="green" size="26" x="180" y="270" width="420" text="アルバムを確認する" target="*open_album_after" keyfocus="2"]
[glink color="green" size="26" x="180" y="360" width="420" text="会話を続ける" target="*resume_story" keyfocus="3"]
[glink color="gray" size="26" x="180" y="450" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="4"]
[s]

*open_album
[stone_photo_album]
[jump target="*start_options"]

*open_album_after
[stone_photo_album]
[jump target="*after_photo_options"]

*resume_story
#
撮影機材を片づけながら、さっきの一枚の印象を思い返す。[p]
#柊 陽菜
次は表情とか視線も、もう少し冒険してみたいかも。[p]
#
そうだな。次は会話の流れの中で、もっと自然に一枚を狙ってみよう。[p]

[glink color="blue" size="28" x="180" y="220" width="420" text="この場面を最初から見直す" target="*start" keyfocus="1"]
[glink color="green" size="26" x="180" y="310" width="420" text="タイトルへ戻る" storage="title.ks" keyfocus="2"]
[s]
