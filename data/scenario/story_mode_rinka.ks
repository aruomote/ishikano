*scene_entry

[cm]
[clearfix]
@showmenubutton

[iscript]
var shotCount = f.story_shot_count.rinka || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.rinka = phase;
f.story_unlock_phase.rinka = phase;
f.story_current_phase = phase;
if (phase >= 3) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_hands_near_head,pose_peace_near_face,pose_cute_double_fists,pose_open_hands_bright,pose_reach_forward,pose_light_step";
  f.story_expression_ids = "cool,smile_bright,embarrassed,surprised,wink_left,wink_right,pout_soft,smile_soft,smile_open_soft";
  f.story_look_ids = "away,slight_away,camera";
} else if (phase >= 2) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_hands_near_head,pose_peace_near_face,pose_cute_double_fists,pose_cheek_touch_shy,pose_reach_forward";
  f.story_expression_ids = "cool,smile_bright,embarrassed,surprised,wink_left,wink_right,pout_soft,smile_soft";
  f.story_look_ids = "away,slight_away,camera";
} else if (phase >= 1) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_hands_near_head,pose_peace_near_face,pose_cute_double_fists";
  f.story_expression_ids = "cool,smile_bright,embarrassed,surprised,wink_left,wink_right";
  f.story_look_ids = "away,slight_away";
} else {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_hands_near_head";
  f.story_expression_ids = "cool,smile_bright,surprised";
  f.story_look_ids = "away,slight_away";
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
昼休みの家は思ったより静かで、リビングには凛花の私物だけが気配を残していた。[p]

#柊 凛花
えっ、お昼に帰ってきたの？[p]
……別にいいけど。どうせなら、ちょっとだけ相手してあげてもいいよ。[p]

#
そっぽを向いたままなのに、凛花はもうその場から逃げていない。[p]
[jump target="*launch_photo"]

*lunch_phase_1
[bg storage="room.jpg" time="200"]
#柊 凛花
前の写真、ちょっとだけ見たけど……まあ、悪くなかったし。[p]
変にかわいく撮れてたの、ちょっと悔しいけどね。[p]

#
拗ねた言い方の奥に、期待のほうが少しだけ勝ち始めている。[p]
[jump target="*launch_photo"]

*lunch_phase_2
[bg storage="room.jpg" time="200"]
#柊 凛花
今日はさ、私からも少し言っていい？[p]
どうせ撮るなら、前よりちゃんとかわいく見えるのがいいし。[p]
お昼に帰ってきたぶん、ちょっと特別な私を見せてもいいかなって。 [p]

#
照れを隠しながらも、凛花はもう撮られる側として自分の意思を見せていた。[p]
[jump target="*launch_photo"]

*lunch_phase_3
[bg storage="room.jpg" time="200"]
#柊 凛花
最近、お昼に帰ってくるとちょっと嬉しいんだけど。[p]
……だから今日は、いちばんいいところちゃんと見つけてよね。お兄ちゃん。[p]

#
生意気な口調のまま、凛花の声だけが少しやわらかかった。[p]
[jump target="*launch_photo"]

*after_school_phase_0
[bg storage="room.jpg" time="200"]
#
放課後の家には夕方の光が差し込み、凛花はソファでだらけた姿勢のままこちらを見上げた。[p]

#柊 凛花
また帰ってきたの？[p]
……まあ、暇だったし。少しくらいなら付き合ってあげてもいいけど。[p]

#
投げやりに見える態度のまま、凛花はカメラを向けられることをちゃんと待っていた。[p]
[jump target="*launch_photo"]

*after_school_phase_1
[bg storage="room.jpg" time="200"]
#柊 凛花
放課後に撮るほうが、なんか変に落ち着かないんだよね。[p]
でも前みたいに見られると、ちょっとだけ期待しちゃうし……もう、ずるい。[p]
[jump target="*launch_photo"]

*after_school_phase_2
[bg storage="room.jpg" time="200"]
#柊 凛花
今日は私が決めてもいい？[p]
どうせなら、学校の子たちよりかわいく写ってるほうがいいに決まってるし。[p]
家で撮るんだから、そのくらい特別扱いしてもらわないと困るもん。 [p]
[jump target="*launch_photo"]

*after_school_phase_3
[bg storage="room.jpg" time="200"]
#柊 凛花
家でこうしてるとさ、前よりちゃんと見てほしいって思うようになったんだよね。[p]
だから今日は、ごまかさないで一番かわいい私を撮ってよ。[p]
[jump target="*launch_photo"]

*launch_photo
[stone_photo_mvp heroine="rinka" location="&f.story_current_location_id" pose_ids="&f.story_pose_ids" expression_ids="&f.story_expression_ids" look_ids="&f.story_look_ids" result="f.story_photo_result" commit_target="*photo_committed" cancel_target="*photo_cancelled"]

*photo_committed
[iscript]
f.story_last_photo_saved = true;
f.story_last_photo_heroine_id = "rinka";
f.story_shot_count.rinka = (f.story_shot_count.rinka || 0) + 1;
f.story_last_shot_order.rinka = f.story_action_index + 1;
var shotCount = f.story_shot_count.rinka || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.rinka = phase;
f.story_unlock_phase.rinka = phase;
f.story_photo_notice = "凛花の写真を保存した。今週の保存回数は " + shotCount + " 回。";
f.story_action_summary = f.story_photo_notice;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "お昼にこれ残るの、なんかずるいんだけど。";
    f.story_reaction_line_2 = "午後のあいだも、ちょっと嬉しかったの思い出しちゃいそう。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の一枚、かなり好きかも。";
    f.story_reaction_line_2 = "お昼に帰ってきたからこその特別扱い、ちょっと伝わったかも。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "さっきの、思ったよりちゃんとかわいかったし。";
    f.story_reaction_line_2 = "午後までちょっと機嫌よくなっちゃうの、そっちのせいだからね。";
  } else {
    f.story_reaction_line_1 = "……今の、ちょっとよかったかも。";
    f.story_reaction_line_2 = "お昼に帰ってきたわりには、ちゃんと見る目あるじゃん。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "ありがと。";
    f.story_reaction_line_2 = "放課後にお兄ちゃんに撮られると、意地張ってるだけじゃいられなくなるんだよね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の一枚、かなり好きかも。";
    f.story_reaction_line_2 = "家でゆっくり撮るほうが、ちょっと特別な私まで見せやすいし。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "さっきの、思ったよりちゃんとかわいかったし。";
    f.story_reaction_line_2 = "放課後にそういう顔見つけるの、ちょっとずるくない？";
  } else {
    f.story_reaction_line_1 = "……今の、ちょっとよかったかも。";
    f.story_reaction_line_2 = "べ、別に毎回こうしてほしいってわけじゃないけどね。";
  }
}
[endscript]
#柊 凛花
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]

*photo_cancelled
[iscript]
f.story_last_photo_saved = false;
f.story_photo_notice = "凛花との時間は過ごしたが、今日は保存までは進まなかった。";
f.story_action_summary = f.story_photo_notice;
var phase = f.story_talk_phase.rinka || 0;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "お昼だけでも、今日の反応見たらちょっと満足かも。";
    f.story_reaction_line_2 = "……でも次はちゃんと残して。午後まで待たせるんだから。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の流れ、かなりよかったのに。";
    f.story_reaction_line_2 = "次はお昼でも、その特別扱いがちゃんと残るところまで付き合ってよね。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "ちょっと惜しかったかも。";
    f.story_reaction_line_2 = "でも次は、もう少しだけ近くで見てもいいよ。";
  } else {
    f.story_reaction_line_1 = "今日はこのくらいでいいんじゃない？";
    f.story_reaction_line_2 = "次はもう少し、お昼でもちゃんとかわいく撮ってよね。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "残らなくても、今日の反応見たらちょっと満足かも。";
    f.story_reaction_line_2 = "……でも次は絶対ちゃんと残して。約束だからね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の流れ、かなりよかったのに。";
    f.story_reaction_line_2 = "次はちゃんと、特別扱いしてるって分かるところまで残してよね、お兄ちゃん。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "ちょっと惜しかったかも。";
    f.story_reaction_line_2 = "でも次は、放課後のぶんもう少しだけ近くで見てもいいよ。";
  } else {
    f.story_reaction_line_1 = "今日はこのくらいでいいんじゃない？";
    f.story_reaction_line_2 = "次はもう少し、ちゃんとかわいく撮ってよね。";
  }
}
[endscript]
#柊 凛花
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]
