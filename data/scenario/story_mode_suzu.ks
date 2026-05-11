*scene_entry

[cm]
[clearfix]
@showmenubutton

[iscript]
var shotCount = f.story_shot_count.suzu || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.suzu = phase;
f.story_unlock_phase.suzu = phase;
f.story_current_phase = phase;
if (phase >= 3) {
  f.story_pose_ids = "pose_stand_soft,pose_open_hands_bright,pose_light_step,pose_hands_up_cheer,pose_hands_near_head,pose_cute_double_fists,pose_peace_near_face,pose_open_arm_invite";
  f.story_expression_ids = "smile_soft,embarrassed,cool,surprised,wink_left,wink_right,smile_bright,smile_open_soft,eyes_closed_smile";
  f.story_look_ids = "camera,slight_away,away";
} else if (phase >= 2) {
  f.story_pose_ids = "pose_stand_soft,pose_open_hands_bright,pose_light_step,pose_hand_chest,pose_cheek_touch_shy,pose_open_arm_invite,pose_reach_forward";
  f.story_expression_ids = "smile_soft,embarrassed,cool,surprised,smile_bright,smile_open_soft,eyes_closed_smile";
  f.story_look_ids = "camera,slight_away";
} else if (phase >= 1) {
  f.story_pose_ids = "pose_stand_soft,pose_open_hands_bright,pose_light_step,pose_hands_up_cheer,pose_hands_near_head,pose_cute_double_fists";
  f.story_expression_ids = "smile_soft,embarrassed,cool,surprised,wink_left,wink_right";
  f.story_look_ids = "camera,slight_away";
} else {
  f.story_pose_ids = "pose_stand_soft,pose_open_hands_bright,pose_light_step";
  f.story_expression_ids = "smile_soft,embarrassed,surprised";
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
昼休みの美術室には、乾きかけの絵の具と紙の匂いがまだ残っていた。[p]

#小鳥遊 すず
あ、先輩！ ちょうどいいところでした。[p]
昼休みのあいだだけでも大丈夫なら、今日も少し撮ってみたいです！[p]

#
短い時間でも、すずの期待は最初から隠れなかった。[p]
[jump target="*launch_photo"]

*lunch_phase_1
[bg storage="room.jpg" time="200"]
#小鳥遊 すず
昼休みでも、前よりちゃんと落ち着けるようになってきた気がするんです。[p]
先輩に見てもらえるって思うと、ちょっとだけ頑張れちゃうので。[p]
[jump target="*launch_photo"]

*lunch_phase_2
[bg storage="room.jpg" time="200"]
#小鳥遊 すず
今日は短いぶん、最初からいろいろ試してみたいです！[p]
せっかくだし、成長したところをぎゅっと見せたいので。[p]
先輩に「前より変わった」って思ってもらいたいんです。[p]
[jump target="*launch_photo"]

*lunch_phase_3
[bg storage="room.jpg" time="200"]
#小鳥遊 すず
昼休みでも、先輩に撮ってもらえるとすごく元気が出るんです。[p]
だから今日も、私のいちばんいい瞬間をちゃんと見つけてくださいね。[p]
[jump target="*launch_photo"]

*after_school_phase_0
[bg storage="room.jpg" time="200"]
#
放課後の美術室には、絵の具の匂いと乾いた木の匂いが混ざっていた。[p]

#小鳥遊 すず
あ、先輩！ ちょうどよかったです。[p]
今日も撮影、やってみたいです。今度はもうちょっと上手にできる気がします！[p]

#
緊張はしている。それでも、すずの足はもう前に出ていた。[p]
[jump target="*launch_photo"]

*after_school_phase_1
[bg storage="room.jpg" time="200"]
#小鳥遊 すず
前より、カメラの前で固まらなくなってきた気がするんです。[p]
まだ恥ずかしいですけど、先輩がいるともうちょっと頑張ってみようって思えるんです。[p]

#
言葉のたびに表情が変わるぶん、前よりずっと撮りたくなる瞬間が多い。[p]
[jump target="*launch_photo"]

*after_school_phase_2
[bg storage="room.jpg" time="200"]
#小鳥遊 すず
今日はですね、私からもいろいろ試してみたいんです！[p]
せっかくだし、前よりちゃんと成長したところ見せたいので。[p]
放課後なら、そのぶん少し大人っぽい私も見せられる気がして。[p]

#
好奇心だけだったはずの声に、今は少しだけ背伸びした気持ちも混ざっている。[p]
[jump target="*launch_photo"]

*after_school_phase_3
[bg storage="room.jpg" time="200"]
#小鳥遊 すず
先輩に撮ってもらうと、前より自分に自信が持てるんです。[p]
だから今日は、私のいちばんいい顔をちゃんと見つけてくださいね。[p]

#
あどけなさの奥で、すずはもうはっきりとこちらを見返していた。[p]
[jump target="*launch_photo"]

*launch_photo
[stone_photo_mvp heroine="suzu" location="&f.story_current_location_id" pose_ids="&f.story_pose_ids" expression_ids="&f.story_expression_ids" look_ids="&f.story_look_ids" result="f.story_photo_result" commit_target="*photo_committed" cancel_target="*photo_cancelled"]

*photo_committed
[iscript]
f.story_last_photo_saved = true;
f.story_last_photo_heroine_id = "suzu";
f.story_shot_count.suzu = (f.story_shot_count.suzu || 0) + 1;
f.story_last_shot_order.suzu = f.story_action_index + 1;
var shotCount = f.story_shot_count.suzu || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.suzu = phase;
f.story_unlock_phase.suzu = phase;
f.story_photo_notice = "すずの写真を保存した。今週の保存回数は " + shotCount + " 回。";
f.story_action_summary = f.story_photo_notice;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みでも、今の一枚があると午後までずっと元気でいられそうです！";
    f.story_reaction_line_2 = "先輩に見つけてもらえたって思うと、なんだかすごく頑張れます。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の一枚、短い昼休みなのにちゃんと成長した感じが出てますよね。";
    f.story_reaction_line_2 = "午後のあいだも、次はもっと変わったところを見せたいって考えちゃいそうです。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "昼休みでも、前よりちゃんと笑えてた気がします。";
    f.story_reaction_line_2 = "そのまま午後も、もう少しだけ自信を持っていられそうです。";
  } else {
    f.story_reaction_line_1 = "わあ、残ったんですね！ 短い時間でもちゃんと写るんだ……。";
    f.story_reaction_line_2 = "まだドキドキしますけど、このまま午後も頑張れそうです。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "放課後に残ると、今の一枚がもっと特別に見えますね。";
    f.story_reaction_line_2 = "今日は帰ってからも、たぶんずっと嬉しいです。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の一枚、私もすごく好きです！";
    f.story_reaction_line_2 = "放課後のぶん、昼よりちょっと大人っぽいところまで出せた気がします。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "前よりちゃんと笑えてた気がします。";
    f.story_reaction_line_2 = "放課後って、先輩に見つけてもらえる感じが昼より近いんですね。";
  } else {
    f.story_reaction_line_1 = "わあ、残ったんですね！";
    f.story_reaction_line_2 = "まだちょっとドキドキしますけど、放課後のぶんすごく嬉しいです。";
  }
}
[endscript]
#小鳥遊 すず
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]

*photo_cancelled
[iscript]
f.story_last_photo_saved = false;
f.story_photo_notice = "すずとの時間は過ごしたが、今日は保存までは進まなかった。";
f.story_action_summary = f.story_photo_notice;
var phase = f.story_talk_phase.suzu || 0;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みだけでも、先輩がちゃんと見てくれたなら大丈夫です！";
    f.story_reaction_line_2 = "午後のあとでもう一回会えたら、その時は絶対いい顔見せますね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今日は昼休みで終わっちゃいましたけど、流れはかなりよかったと思うんです。";
    f.story_reaction_line_2 = "次は先輩にもっと成長したところ、ちゃんと見せたいです！";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "ちょっと惜しかったですけど、昼休みでも前よりできてる感じはありましたよね。";
    f.story_reaction_line_2 = "次はもう一回、挑戦したいです！";
  } else {
    f.story_reaction_line_1 = "今日はここまでですね。昼休みってやっぱりあっという間です。";
    f.story_reaction_line_2 = "でも大丈夫です、次はもっといいのにしたいです！";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "残らなくても、先輩がちゃんと見てくれたなら平気です。";
    f.story_reaction_line_2 = "でも次は、放課後のぶんいちばんいい顔をちゃんと残してくださいね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今の流れ、かなりよかったと思うんです。";
    f.story_reaction_line_2 = "次は放課後の時間を使って、ちょっと大人っぽいところまでちゃんと残したいです。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "ちょっと惜しかったですけど、前よりできてる感じはありましたよね。";
    f.story_reaction_line_2 = "次は放課後らしく、もう少しだけ長く挑戦したいです！";
  } else {
    f.story_reaction_line_1 = "今日はここまでですね。";
    f.story_reaction_line_2 = "でも大丈夫です、次はもっといいのにしたいです！";
  }
}
[endscript]
#小鳥遊 すず
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]
