*scene_entry

[cm]
[clearfix]
@showmenubutton

[iscript]
var shotCount = f.story_shot_count.riko || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.riko = phase;
f.story_unlock_phase.riko = phase;
f.story_current_phase = phase;
if (phase >= 3) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_folded_arms_cool,pose_present_arm_up,pose_side_present,pose_bold_arc,pose_side_stretch,pose_hand_waist_neat,pose_hand_hip_bold,pose_confident_stand";
  f.story_expression_ids = "smile_soft,troubled_soft,cool,smile_closed_soft,relief_soft,embarrassed,eyes_closed,smile_bright,smile_open_soft";
  f.story_look_ids = "camera,slight_away,away";
} else if (phase >= 2) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_folded_arms_cool,pose_present_arm_up,pose_side_present,pose_hand_waist_neat,pose_hair_touch,pose_hand_chest";
  f.story_expression_ids = "smile_soft,troubled_soft,cool,smile_closed_soft,relief_soft,embarrassed";
  f.story_look_ids = "camera,slight_away";
} else if (phase >= 1) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_folded_arms_cool,pose_present_arm_up,pose_side_present";
  f.story_expression_ids = "smile_soft,troubled_soft,cool,smile_closed_soft,relief_soft";
  f.story_look_ids = "camera,slight_away";
} else {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_folded_arms_cool";
  f.story_expression_ids = "smile_soft,troubled_soft,cool";
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
[bg storage="room.jpg" time="200"]
#
昼休みの教材準備室には、次の授業に使うプリントがきれいに積み上がっていた。[p]

#鷹宮 莉子
お昼にまで来るなんて、本当に熱心ね。[p]
少しだけならいいけど、先生をあんまり困らせないでよ？[p]

#
軽く牽制しながらも、莉子は最初から追い返すつもりではなさそうだった。[p]
[jump target="*launch_photo"]

*lunch_phase_1
[bg storage="room.jpg" time="200"]
#鷹宮 莉子
昼休みの写真って、思ったより印象がやわらかいのよね。[p]
こういう短い時間まで残したくなるなんて、ちょっと困るわ。[p]
[jump target="*launch_photo"]

*lunch_phase_2
[bg storage="room.jpg" time="200"]
#鷹宮 莉子
今日は短いぶん、最初から少しだけ冒険してみたいの。[p]
せっかくだし、先生っぽくないところもちゃんと見せてみようかしら。[p]
昼休みの短さなら、少しくらい無防備でも言い訳できそうだし。 [p]
[jump target="*launch_photo"]

*lunch_phase_3
[bg storage="room.jpg" time="200"]
#鷹宮 莉子
昼休みなのに、あなたに会うと妙に気持ちがほどけるのよね。[p]
だから今日は、そのままの私をちゃんと撮ってちょうだい。[p]
[jump target="*launch_photo"]

*after_school_phase_0
[bg storage="room.jpg" time="200"]
#
放課後の教材準備室には、使い込まれた教材と紙の匂いが静かにこもっていた。[p]

#鷹宮 莉子
ほんとに来たのね。[p]
……一回だけよ。先生がこういうのに付き合ってるなんて、あんまり大きな声じゃ言えないんだから。[p]

#
冗談めかした口調のまま、それでも莉子は帰る素振りを見せなかった。[p]
[jump target="*launch_photo"]

*after_school_phase_1
[bg storage="room.jpg" time="200"]
#鷹宮 莉子
この前の写真、ちょっとだけ見返しちゃったのよね。[p]
思ったよりちゃんとしてて、困ったわ。軽い冗談のままでは済ませにくくなるじゃない。[p]

#
からかうように笑っているのに、その奥には少しだけ本気の興味が混ざっていた。[p]
[jump target="*launch_photo"]

*after_school_phase_2
[bg storage="room.jpg" time="200"]
#鷹宮 莉子
今日は私から一つお願いしてもいい？[p]
せっかくだし、先生っぽい顔じゃないほうも、少し試してみたくなっちゃって。[p]
あなたの前でなら、そのくらいの冒険をしてもいい気がするのよね。 [p]

#
役割を外したあとの表情を見せることに、莉子はもう前ほど抵抗していない。[p]
[jump target="*launch_photo"]

*after_school_phase_3
[bg storage="room.jpg" time="200"]
#鷹宮 莉子
あなたに撮られる時間って、不思議ね。[p]
先生でいるより先に、ただの私でいていい気がするの。困るわね、こういうの。[p]

#
一線は守ったままなのに、その空気だけが以前よりずっとやわらかかった。[p]
[jump target="*launch_photo"]

*launch_photo
[stone_photo_mvp heroine="riko" location="&f.story_current_location_id" pose_ids="&f.story_pose_ids" expression_ids="&f.story_expression_ids" look_ids="&f.story_look_ids" result="f.story_photo_result" commit_target="*photo_committed" cancel_target="*photo_cancelled"]

*photo_committed
[iscript]
f.story_last_photo_saved = true;
f.story_last_photo_heroine_id = "riko";
f.story_shot_count.riko = (f.story_shot_count.riko || 0) + 1;
f.story_last_shot_order.riko = f.story_action_index + 1;
var shotCount = f.story_shot_count.riko || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.riko = phase;
f.story_unlock_phase.riko = phase;
f.story_photo_notice = "莉子の写真を保存した。今週の保存回数は " + shotCount + " 回。";
f.story_action_summary = f.story_photo_notice;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みの短い時間なのに、今の一枚は少し危ないくらい自然だったわね。";
    f.story_reaction_line_2 = "午後の授業に戻るまで、平静を作るのが大変そうだわ。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の一枚、昼休みの短さがかえっていい緊張感になったみたい。";
    f.story_reaction_line_2 = "先生っぽくない顔も、あなたの前なら案外悪くないものね。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "昼休みの写真って、やっぱり思ったより印象がやわらかいのよね。";
    f.story_reaction_line_2 = "このまま午後まで少し困ってしまいそう。";
  } else {
    f.story_reaction_line_1 = "あら、ちゃんと残ったのね。";
    f.story_reaction_line_2 = "昼休みの一回だけで済まなかった気持ちも、少し分かるかも。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "……やっぱり、放課後に残ると特別だわ。";
    f.story_reaction_line_2 = "内緒にしておくには、少し惜しいくらいにはね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "ありがとう。";
    f.story_reaction_line_2 = "放課後の静かな空気だと、肩の力が抜けた私までちゃんと残るのね。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "今の、ちょっと自然すぎて危なかったわ。";
    f.story_reaction_line_2 = "放課後にこういう顔を残されると、先生として少し困るかもしれないわね。";
  } else {
    f.story_reaction_line_1 = "あら、ちゃんと残ったのね。";
    f.story_reaction_line_2 = "放課後にこうして残ると、軽い冗談のままでは済まなくなるじゃない。";
  }
}
[endscript]
#鷹宮 莉子
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]

*photo_cancelled
[iscript]
f.story_last_photo_saved = false;
f.story_photo_notice = "莉子との時間は過ごしたが、今日は保存までは進まなかった。";
f.story_action_summary = f.story_photo_notice;
var phase = f.story_talk_phase.riko || 0;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みだけでも、今日の空気は十分伝わった気がするわ。";
    f.story_reaction_line_2 = "でも次は、ちゃんと形にも残してくれたら嬉しいわね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の流れ、私としてはかなり好きだったのよ。";
    f.story_reaction_line_2 = "昼休みだからこそ、次はその無防備なところまでうまく残してくれないと困るわ。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "惜しかったけど、昼休みならこのくらいでも悪くないわ。";
    f.story_reaction_line_2 = "次はもう少し落ち着いて、ちゃんと残るところまで付き合う。";
  } else {
    f.story_reaction_line_1 = "今日はここまでにしておきましょうか。";
    f.story_reaction_line_2 = "先生にも昼休みなりの心の準備ってものがあるんだから、次はもう少し手加減してね。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "残らなくても、今日の放課後の空気は忘れないと思うわ。";
    f.story_reaction_line_2 = "でも次は、あなたの一番いいと思う私をちゃんと見せてね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の流れ、私としてはかなり好きだったのよ。";
    f.story_reaction_line_2 = "だから次は、放課後らしく少し冒険した私までちゃんと残してくれたら嬉しいわね。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "惜しかったけど、悪くなかったわ。";
    f.story_reaction_line_2 = "次はもっと落ち着いて、ちゃんと残るところまで付き合う。";
  } else {
    f.story_reaction_line_1 = "今日はここまでにしておきましょうか。";
    f.story_reaction_line_2 = "先生にも心の準備ってものがあるんだから、次はもう少し手加減してね。";
  }
}
[endscript]
#鷹宮 莉子
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]
