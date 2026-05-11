*scene_entry

[cm]
[clearfix]
@showmenubutton

[iscript]
var shotCount = f.story_shot_count.yukino || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.yukino = phase;
f.story_unlock_phase.yukino = phase;
f.story_current_phase = phase;
if (phase >= 3) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_folded_arms_cool,pose_hand_waist_neat,pose_present_arm_up,pose_side_present,pose_hand_hip_bold,pose_side_stretch,pose_bold_arc,pose_confident_stand,pose_salute_up";
  f.story_expression_ids = "cool,smile_soft,troubled_soft,embarrassed,smile_bright,relief_soft,surprised,smile_closed_soft";
  f.story_look_ids = "camera,slight_away,away";
} else if (phase >= 2) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_folded_arms_cool,pose_hand_waist_neat,pose_present_arm_up,pose_side_present,pose_hand_hip_bold";
  f.story_expression_ids = "cool,smile_soft,troubled_soft,embarrassed,smile_closed_soft,relief_soft";
  f.story_look_ids = "camera,slight_away";
} else if (phase >= 1) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_folded_arms_cool,pose_hand_waist_neat,pose_present_arm_up,pose_side_present,pose_hand_hip_bold";
  f.story_expression_ids = "cool,smile_soft,troubled_soft,embarrassed,smile_bright";
  f.story_look_ids = "camera,slight_away";
} else {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_folded_arms_cool,pose_hand_waist_neat";
  f.story_expression_ids = "cool,smile_soft,troubled_soft";
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
昼休みの生徒会室は短い休憩の空気だけが流れ、机の上には資料がきちんと積まれていた。[p]

#朝倉 雪乃
来たのね。[p]
昼休みだから長くは取れないけれど、確認くらいなら付き合えるわ。手短に済ませましょう。[p]

#
きっぱりした口調のまま、それでも雪乃は最初からこちらを拒まなかった。[p]
[jump target="*launch_photo"]

*lunch_phase_1
[bg storage="room.jpg" time="200"]
#朝倉 雪乃
前の写真は確認したわ。[p]
昼休みの短い時間でも、思った以上にきちんと残るものなのね。[p]

#
事務的に言いながらも、その視線は前より少しだけ近い。[p]
[jump target="*launch_photo"]

*lunch_phase_2
[bg storage="room.jpg" time="200"]
#朝倉 雪乃
今日は、こちらでも少し考えてきたの。[p]
短い時間だからこそ、どう見せるかを最初に決めておきたいわ。[p]
あなたに委ねるだけでなく、私自身の意志で立つ時間にしたいの。 [p]

#
限られた時間のなかでも、雪乃はもう撮られる側として立ち始めている。[p]
[jump target="*launch_photo"]

*lunch_phase_3
[bg storage="room.jpg" time="200"]
#朝倉 雪乃
昼休みのわずかな時間でも、あなたの前なら取り繕わなくて済むみたい。[p]
だから今日は、そのままの私を見て判断して。[p]

#
短い沈黙のあいだにさえ、雪乃の信頼だけが静かに見えていた。[p]
[jump target="*launch_photo"]

*after_school_phase_0
[bg storage="room.jpg" time="200"]
#
放課後の生徒会室は静かで、紙をめくる音だけが小さく響いていた。[p]

#朝倉 雪乃
来たのね。[p]
今日は視察よ。撮影というものが、どういう段取りで進むのか確認するだけ……そのつもりで来たわ。[p]

#
言葉は固いが、その場を離れる気配はない。[p]
[jump target="*launch_photo"]

*after_school_phase_1
[bg storage="room.jpg" time="200"]
#朝倉 雪乃
この前の写真は確認したわ。[p]
記録として見たつもりだったのだけれど……想定より、ずっと悪くなかったわ。[p]

#
雪乃は平静を保とうとしているが、ほんの少しだけ語尾がやわらいでいる。[p]
[jump target="*launch_photo"]

*after_school_phase_2
[bg storage="room.jpg" time="200"]
#朝倉 雪乃
今日は、あなたの指示を待つだけではなくていいかしら。[p]
どう見せたいか、こちらでも考えてきたの。[p]
放課後のこの時間くらいは、会長ではなく私として向き合いたいから。 [p]

#
撮影の場でだけ、生徒会長の鎧が少しずつ外れ始めていた。[p]
[jump target="*launch_photo"]

*after_school_phase_3
[bg storage="room.jpg" time="200"]
#朝倉 雪乃
……あなたの前だと、必要以上に取り繕わなくていい気がする。[p]
だから今日は、そのままの私を見て判断して。[p]

#
静かな部屋の空気が、張りつめたままやわらかい。[p]
[jump target="*launch_photo"]

*launch_photo
[stone_photo_mvp heroine="yukino" location="&f.story_current_location_id" pose_ids="&f.story_pose_ids" expression_ids="&f.story_expression_ids" look_ids="&f.story_look_ids" result="f.story_photo_result" commit_target="*photo_committed" cancel_target="*photo_cancelled"]

*photo_committed
[iscript]
f.story_last_photo_saved = true;
f.story_last_photo_heroine_id = "yukino";
f.story_shot_count.yukino = (f.story_shot_count.yukino || 0) + 1;
f.story_last_shot_order.yukino = f.story_action_index + 1;
var shotCount = f.story_shot_count.yukino || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.yukino = phase;
f.story_unlock_phase.yukino = phase;
f.story_photo_notice = "雪乃の写真を保存した。今週の保存回数は " + shotCount + " 回。";
f.story_action_summary = f.story_photo_notice;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みのわずかな時間でも、今の一枚なら十分に意味があるわ。";
    f.story_reaction_line_2 = "午後のあいだも、あなたの視線を少し思い出してしまいそうね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "短い昼休みでも、今の一枚はきちんと残す価値があったわ。";
    f.story_reaction_line_2 = "限られた時間でも、自分の意志で立てた気がする。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "昼休みの短さにしては、ずいぶん自然に立てていたわね。";
    f.story_reaction_line_2 = "午後の業務にも、このまま余計な力みを持ち込まずに済みそうだわ。";
  } else {
    f.story_reaction_line_1 = "記録としても、昼休みの確認としては十分ね。";
    f.story_reaction_line_2 = "……ただ、それだけでは片づかない気もするけれど。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "放課後に残した一枚は、昼の記録よりずっと私に近いわね。";
    f.story_reaction_line_2 = "帰るころまで、少し平静を装うのに苦労しそうだわ。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の一枚は、私自身でも意外なくらい柔らかかったわ。";
    f.story_reaction_line_2 = "放課後の静けさだと、会長ではない私まで残るのかもしれないわね。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "少しだけ、力みすぎずに立てた気がするわ。";
    f.story_reaction_line_2 = "放課後のほうが、あなたの前で余計な構えを外しやすいのかもしれないわね。";
  } else {
    f.story_reaction_line_1 = "記録としても、きちんと成立しているわね。";
    f.story_reaction_line_2 = "……放課後に残ると、ただの確認では済まない気もするけれど。";
  }
}
[endscript]
#朝倉 雪乃
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]

*photo_cancelled
[iscript]
f.story_last_photo_saved = false;
f.story_photo_notice = "雪乃との時間は過ごしたが、今日は保存までは進まなかった。";
f.story_action_summary = f.story_photo_notice;
var phase = f.story_talk_phase.yukino || 0;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みの短い時間でも、あなたと向き合えたこと自体に意味はあるわ。";
    f.story_reaction_line_2 = "次は、もう少しだけ余裕を持って残してみせる。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今日の試み自体は悪くなかったわ。";
    f.story_reaction_line_2 = "昼休みで終わるなら、次はもっと私の意志が見える形にしたいわね。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "惜しかったわね。昼休みだもの、急いで形にする必要はないわ。";
    f.story_reaction_line_2 = "次はもう少し、納得できる一枚に近づけたい。";
  } else {
    f.story_reaction_line_1 = "今日はここまででいいわ。昼休みの確認としては十分だもの。";
    f.story_reaction_line_2 = "続きはまた、落ち着いてやりましょう。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "形に残らなくても、放課後にあなたと向き合った時間は消えないわ。";
    f.story_reaction_line_2 = "次は、きちんと残してみせる。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今日の試み自体は悪くなかったわ。";
    f.story_reaction_line_2 = "次は放課後の時間を使って、もう少し一人の私として歩み寄れる気がする。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "惜しかったわね。";
    f.story_reaction_line_2 = "でも、放課後に急いで残すより、納得できる一枚にしたいわ。";
  } else {
    f.story_reaction_line_1 = "今日はここまででいいわ。";
    f.story_reaction_line_2 = "確認はできたし、続きはまた落ち着いてやりましょう。";
  }
}
[endscript]
#朝倉 雪乃
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]
