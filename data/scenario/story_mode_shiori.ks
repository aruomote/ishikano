*scene_entry

[cm]
[clearfix]
@showmenubutton

[iscript]
var shotCount = f.story_shot_count.shiori || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.shiori = phase;
f.story_unlock_phase.shiori = phase;
f.story_current_phase = phase;
if (phase >= 3) {
  f.story_pose_ids = "pose_bowed_shy,pose_polite_front,pose_folded_hands_soft,pose_thinking_lips,pose_collar_touch,pose_hair_touch,pose_hands_together_front";
  f.story_expression_ids = "cool,smile_soft,embarrassed,sad_soft,smile_closed_soft,relief_soft,troubled_soft,eyes_closed_smile";
  f.story_look_ids = "slight_away,camera,away";
} else if (phase >= 2) {
  f.story_pose_ids = "pose_bowed_shy,pose_polite_front,pose_folded_hands_soft,pose_thinking_lips,pose_collar_touch,pose_hands_together_front";
  f.story_expression_ids = "cool,smile_soft,embarrassed,sad_soft,smile_closed_soft,relief_soft,troubled_soft";
  f.story_look_ids = "slight_away,camera";
} else if (phase >= 1) {
  f.story_pose_ids = "pose_bowed_shy,pose_polite_front,pose_folded_hands_soft,pose_thinking_lips,pose_collar_touch";
  f.story_expression_ids = "cool,smile_soft,embarrassed,sad_soft,smile_closed_soft";
  f.story_look_ids = "slight_away,camera";
} else {
  f.story_pose_ids = "pose_bowed_shy,pose_polite_front,pose_folded_hands_soft";
  f.story_expression_ids = "cool,smile_soft,sad_soft";
  f.story_look_ids = "slight_away,camera";
}
[endscript]

@jump target="*lunch_phase_3" cond="f.story_slot == 'lunch' && f.story_current_phase >= 3"
@jump target="*lunch_phase_2" cond="f.story_slot == 'lunch' && f.story_current_phase >= 2"
@jump target="*lunch_phase_1" cond="f.story_slot == 'lunch' && f.story_current_phase >= 1"
@jump target="*lunch_phase_0" cond="f.story_slot == 'lunch'"
@jump target="*after_school_phase_3" cond="f.story_current_phase >= 3"
@jump target="*after_school_phase_2" cond="f.story_current_phase >= 2"
@jump target="*after_school_phase_1" cond="f.story_current_phase >= 1"
@jump target="*after_school_phase_0"

*lunch_phase_0
[bg storage="room.jpg" time="200"]
#
昼休みの図書室は静かで、ページをめくる音だけが近くに落ちていた。[p]

#白石 詩織
……また、来たんだ。[p]
この前探していた資料、棚の奥にあったから。……よければ、今日もここにいて。[p]

#
差し出された本よりも、その仕草のほうに目がいった。[p]
[jump target="*launch_photo"]

*lunch_phase_1
[bg storage="room.jpg" time="200"]
#白石 詩織
前の写真……少しだけ見返したの。[p]
私でも、ああいうふうに写るんだって、まだ少し信じられないけど。[p]

#
詩織は視線を逸らしたまま、それでも前より言葉を続けてくれる。[p]
[jump target="*launch_photo"]

*lunch_phase_2
[bg storage="room.jpg" time="200"]
#白石 詩織
今日は、撮られる前に少しだけ考えてきたの。[p]
もし変じゃなかったら……その、試してみたい。[p]
君に見つけてもらえるなら、少しだけ自分から差し出してみたくて。[p]

#
小さな声のなかに、ちゃんと自分の意思が混ざり始めている。[p]
[jump target="*launch_photo"]

*lunch_phase_3
[bg storage="room.jpg" time="200"]
#白石 詩織
君の前だと、隠れなくてもいい気がするの。[p]
だから今日は、目を逸らさないでちゃんと見ていてほしい。[p]

#
図書室の静けさが、詩織の言葉をまっすぐ浮かび上がらせた。[p]
[jump target="*launch_photo"]

*after_school_phase_0
[bg storage="room.jpg" time="200"]
#
放課後の図書室は、昼よりさらに静かで、棚の影だけが長く伸びていた。[p]

#白石 詩織
……来てくれたんだ。[p]
この時間なら、人も少ないから。少しだけ、昼より落ち着いていられる気がするの。[p]
[jump target="*launch_photo"]

*after_school_phase_1
[bg storage="room.jpg" time="200"]
#白石 詩織
放課後に会うと、昼より少しだけ息がしやすいの。[p]
前みたいに撮られても、すぐに隠れたくならなくなってきたからかも。[p]
[jump target="*launch_photo"]

*after_school_phase_2
[bg storage="room.jpg" time="200"]
#白石 詩織
今日は、少しだけ自分から試してみたいの。[p]
昼より長くいられるから、そのぶんちゃんと向き合ってみたくて。[p]
隠れていない私を、もう少しだけ見てもらいたいの。[p]
[jump target="*launch_photo"]

*after_school_phase_3
[bg storage="room.jpg" time="200"]
#白石 詩織
この時間の君には、前よりずっと隠さなくていい気がする。[p]
だから今日は、目を逸らさない私を見ていてほしいの。[p]
[jump target="*launch_photo"]

*launch_photo
[stone_photo_mvp heroine="shiori" location="&f.story_current_location_id" pose_ids="&f.story_pose_ids" expression_ids="&f.story_expression_ids" look_ids="&f.story_look_ids" result="f.story_photo_result" commit_target="*photo_committed" cancel_target="*photo_cancelled"]

*photo_committed
[iscript]
f.story_last_photo_saved = true;
f.story_last_photo_heroine_id = "shiori";
f.story_shot_count.shiori = (f.story_shot_count.shiori || 0) + 1;
f.story_last_shot_order.shiori = f.story_action_index + 1;
var shotCount = f.story_shot_count.shiori || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.shiori = phase;
f.story_unlock_phase.shiori = phase;
f.story_photo_notice = "詩織の写真を保存した。今週の保存回数は " + shotCount + " 回。";
f.story_action_summary = f.story_photo_notice;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みの短さでも、今の一枚はちゃんと心に残るね。";
    f.story_reaction_line_2 = "午後のあいだも、君が見てくれたことを思い出していられそう。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の一枚……短い昼休みのぶん、余計に大事に思えるの。";
    f.story_reaction_line_2 = "残ったことで、少しだけ自分から差し出せた気がするよ。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "前より、昼休みでもちゃんと立てていた気がするの。";
    f.story_reaction_line_2 = "午後のあいだも、少しだけそのままの気持ちでいられそう。";
  } else {
    f.story_reaction_line_1 = "……ありがとう。短い時間だったけど、残してもいいって思えた。";
    f.story_reaction_line_2 = "そのまま午後も、少しだけ落ち着いて過ごせそう。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "放課後の静かな図書室で残ると、君に見てもらえたことがもっと近く感じるの。";
    f.story_reaction_line_2 = "今日は帰ってからも、たぶん少しだけ嬉しいままだと思う。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の一枚……放課後の静けさごと、ちゃんと残った気がする。";
    f.story_reaction_line_2 = "昼より長くいられたぶん、隠れないでいる勇気が出たのかも。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "放課後のほうが、前よりちゃんと息をしながら立てていた気がするの。";
    f.story_reaction_line_2 = "見てもらえるって、こんなふうに落ち着くんだね。";
  } else {
    f.story_reaction_line_1 = "……ありがとう。少し怖かったけど、放課後ならちゃんと残してもいいって思えた。";
    f.story_reaction_line_2 = "昼より静かなぶん、今は少しだけ安心してる。";
  }
}
[endscript]
#白石 詩織
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]

*photo_cancelled
[iscript]
f.story_last_photo_saved = false;
f.story_photo_notice = "詩織との時間は過ごしたが、今日は保存までは進まなかった。";
f.story_action_summary = f.story_photo_notice;
var phase = f.story_talk_phase.shiori || 0;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みだけでも、君が見てくれたことはちゃんと残るよ。";
    f.story_reaction_line_2 = "午後のあとでもう一度会えたら、その時はもっとまっすぐ立てると思う。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今日は昼休みで終わってしまったけど、進めた感じはちゃんとあるの。";
    f.story_reaction_line_2 = "次は、今よりもう少しだけ自分から前に出られると思う。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "少し惜しいけど、昼休みだものね。";
    f.story_reaction_line_2 = "次は、もう少しだけ前を向けると思う。";
  } else {
    f.story_reaction_line_1 = "今日は、ここまでで大丈夫。昼休みに来てくれただけでも嬉しかったから。";
    f.story_reaction_line_2 = "また次に、もう少し落ち着いて向き合えたらいいな。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "残らなくても、放課後に君が見てくれたことは消えないよ。";
    f.story_reaction_line_2 = "次は、私のほうからちゃんと立つね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今日のことは、ちゃんと進んでいる気がするの。";
    f.story_reaction_line_2 = "放課後の静かなぶん、次はもっとまっすぐ立てると思う。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "少し惜しいけど、無理に残すより今日はこのまま覚えていたいかも。";
    f.story_reaction_line_2 = "次は、今よりもう少し落ち着いて向き合える気がする。";
  } else {
    f.story_reaction_line_1 = "今日は、ここまでで大丈夫。放課後に来てくれたから、少し安心できたの。";
    f.story_reaction_line_2 = "急がなくても、また君が来てくれるなら……その時に。";
  }
}
[endscript]
#白石 詩織
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]
