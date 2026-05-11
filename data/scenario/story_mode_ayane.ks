*scene_entry

[cm]
[clearfix]
@showmenubutton

[iscript]
var shotCount = f.story_shot_count.ayane || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.ayane = phase;
f.story_unlock_phase.ayane = phase;
f.story_current_phase = phase;
if (phase >= 3) {
  f.story_pose_ids = "pose_cheer_up,pose_open_arm_invite,pose_arm_up_lively,pose_open_hands_bright,pose_reach_forward,pose_side_point,pose_light_step,pose_hands_up_cheer,pose_big_arm_present,pose_one_arm_boost,pose_double_peace";
  f.story_expression_ids = "smile_soft,cool,embarrassed,surprised,wink_left,wink_right,smile_bright,smile_open_soft,pout_soft";
  f.story_look_ids = "camera,slight_away,away";
} else if (phase >= 2) {
  f.story_pose_ids = "pose_cheer_up,pose_open_arm_invite,pose_open_hands_bright,pose_reach_forward,pose_side_point,pose_light_step,pose_sway_bright,pose_one_arm_boost";
  f.story_expression_ids = "smile_soft,cool,embarrassed,surprised,wink_left,wink_right,smile_bright,smile_open_soft,pout_soft";
  f.story_look_ids = "camera,slight_away";
} else if (phase >= 1) {
  f.story_pose_ids = "pose_cheer_up,pose_open_arm_invite,pose_arm_up_lively,pose_open_hands_bright,pose_reach_forward,pose_side_point";
  f.story_expression_ids = "smile_soft,cool,embarrassed,surprised,wink_left,wink_right";
  f.story_look_ids = "camera,slight_away";
} else {
  f.story_pose_ids = "pose_cheer_up,pose_open_arm_invite,pose_open_hands_bright";
  f.story_expression_ids = "smile_soft,cool,surprised";
  f.story_look_ids = "camera,slight_away";
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
[bg storage="rouka.jpg" time="200"]
#
昼休みの中庭では、彩音がベンチに片足を乗せてパンをかじっていた。[p]

#七瀬 彩音
お、いたいた。[p]
また撮影のこと考えてたんでしょ。[p]
しょうがないなあ。今日も少しくらいなら付き合ってあげる。[p]

#
軽口のままなのに、そのまま逃げる気配はない。[p]
[jump target="*launch_photo"]

*lunch_phase_1
[bg storage="rouka.jpg" time="200"]
#七瀬 彩音
この前の写真、思ったよりちゃんとしててびっくりした。[p]
……別に大げさに褒めてるわけじゃないけど、ちょっと嬉しかったかも。[p]

#
普段どおりの調子を崩さないようにしているぶん、照れがむしろ目立っていた。[p]
[jump target="*launch_photo"]

*lunch_phase_2
[bg storage="rouka.jpg" time="200"]
#七瀬 彩音
今日はさ、私からも少し提案していい？[p]
どうせ撮るなら、いつもよりちゃんといい感じにしたいし。[p]
友達ノリだけじゃなくて、もう少しだけ本気の私も見せてみたいんだよね。[p]

#
友達の距離のまま踏み込んでくるくせに、その一歩だけ妙に近い。[p]
[jump target="*launch_photo"]

*lunch_phase_3
[bg storage="rouka.jpg" time="200"]
#七瀬 彩音
最近、君に見られるとちょっと落ち着かなくなるんだけど。[p]
……だから今日は、ごまかさないでいちばんいい瞬間をちゃんと見つけてよね。[p]

#
冗談めかした声の奥で、彩音だけが少し本気だった。[p]
[jump target="*launch_photo"]

*after_school_phase_0
[bg storage="rouka.jpg" time="200"]
#
放課後の中庭は人通りが減って、昼より少しだけ風の音が近かった。[p]

#七瀬 彩音
まだ帰ってなかったんだ。[p]
じゃあさ、少しだけ付き合ってよ。昼より静かだし、今ならちゃんと向き合えそう。[p]
[jump target="*launch_photo"]

*after_school_phase_1
[bg storage="rouka.jpg" time="200"]
#七瀬 彩音
放課後って、昼より変に意識しちゃうんだよね。[p]
この前みたいに自然に撮られると、こっちまで落ち着かなくなるし。[p]
[jump target="*launch_photo"]

*after_school_phase_2
[bg storage="rouka.jpg" time="200"]
#七瀬 彩音
今日はもう少し欲張ってもいい？[p]
昼より長くいられるし、そのぶんちゃんといいところ見せたいんだよね。[p]
君が気づく顔、私もそろそろ待っちゃってるし。[p]
[jump target="*launch_photo"]

*after_school_phase_3
[bg storage="rouka.jpg" time="200"]
#七瀬 彩音
君とこうして残る時間、最近ちょっと特別に思えてきた。[p]
だから今日は、照れてるところまでちゃんと見抜いてよね。[p]
[jump target="*launch_photo"]

*launch_photo
[stone_photo_mvp heroine="ayane" location="&f.story_current_location_id" pose_ids="&f.story_pose_ids" expression_ids="&f.story_expression_ids" look_ids="&f.story_look_ids" result="f.story_photo_result" commit_target="*photo_committed" cancel_target="*photo_cancelled"]

*photo_committed
[iscript]
f.story_last_photo_saved = true;
f.story_last_photo_heroine_id = "ayane";
f.story_shot_count.ayane = (f.story_shot_count.ayane || 0) + 1;
f.story_last_shot_order.ayane = f.story_action_index + 1;
var shotCount = f.story_shot_count.ayane || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.ayane = phase;
f.story_unlock_phase.ayane = phase;
f.story_photo_notice = "彩音の写真を保存した。今週の保存回数は " + shotCount + " 回。";
f.story_action_summary = f.story_photo_notice;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みなのに、今の一枚は午後じゅうちょっと落ち着かなくなりそう。";
    f.story_reaction_line_2 = "……でも、そういうの嫌いじゃないかも。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "短い昼休みでも、ちゃんといい顔引き出せるんじゃん。";
    f.story_reaction_line_2 = "午後の授業中まで思い出しそうなくらい、ちょっと本気になってきたかも。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "今の、昼休みのノリって感じしないくらい自然だったね。";
    f.story_reaction_line_2 = "なんか午後も、少しいい気分でいられそう。";
  } else {
    f.story_reaction_line_1 = "今の、けっこうよかったんじゃない？ 短い時間のわりに。";
    f.story_reaction_line_2 = "ちょっと照れるけど、そのまま午後も機嫌よく過ごせそう。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "放課後にこれ残るの、ちょっと反則じゃない？";
    f.story_reaction_line_2 = "帰ってからも絶対思い出すし、君のせいだからね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の一枚、放課後の空気ごとちゃんと残った感じがする。";
    f.story_reaction_line_2 = "昼より長く一緒にいたぶん、私の本気まで見つかっちゃうんだね。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "さっきの、放課後のほうがちょっと自然に出ちゃったかも。";
    f.story_reaction_line_2 = "昼より静かだと、変にごまかせないんだよね。";
  } else {
    f.story_reaction_line_1 = "今の、けっこういい感じだったんじゃない？";
    f.story_reaction_line_2 = "放課後のぶん、昼よりちゃんと向き合えた気がする。";
  }
}
[endscript]
#七瀬 彩音
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]

*photo_cancelled
[iscript]
f.story_last_photo_saved = false;
f.story_photo_notice = "彩音との時間は過ごしたが、今日は保存までは進まなかった。";
f.story_action_summary = f.story_photo_notice;
var phase = f.story_talk_phase.ayane || 0;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みだけでも、君の反応見たら今日はまあ満足かも。";
    f.story_reaction_line_2 = "でも次はちゃんと残して。午後まで引っぱるんだから。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今日は昼休みで終わっちゃったけど、流れはかなりよかったよね。";
    f.story_reaction_line_2 = "次はそのまま、ちょっと本気のところまでちゃんと付き合ってよ。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "ちょっと惜しかったね。昼休みってほんとあっという間。";
    f.story_reaction_line_2 = "でも次は、もう少しだけ思いきってみてもいいかも。";
  } else {
    f.story_reaction_line_1 = "今日はこのくらいかな。昼休みだし、無理しなくていいよね。";
    f.story_reaction_line_2 = "次はもう少し、ちゃんといいところ見せてあげる。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "残らなくても、今日の放課後はちょっと特別だったし。";
    f.story_reaction_line_2 = "……でも次は、ちゃんと形にしてよ。約束。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の流れ、かなりよかったのにね。";
    f.story_reaction_line_2 = "放課後のぶん、次はもっとじっくり私のこと見てよ。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "惜しかったけど、放課後にここまで話せたなら悪くないかも。";
    f.story_reaction_line_2 = "次はもっと自然なところ、ちゃんと残してみようよ。";
  } else {
    f.story_reaction_line_1 = "今日はこのくらいでもいいんじゃない？";
    f.story_reaction_line_2 = "次はもう少し、放課後らしくちゃんと向き合ってあげる。";
  }
}
[endscript]
#七瀬 彩音
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]
