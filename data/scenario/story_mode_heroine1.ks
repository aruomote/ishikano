*scene_entry

[cm]
[clearfix]
@showmenubutton

[iscript]
var shotCount = f.story_shot_count.heroine1 || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.heroine1 = phase;
f.story_unlock_phase.heroine1 = phase;
f.story_current_phase = phase;
if (phase >= 3) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_hand_hip_gentle,pose_cheek_touch_shy,pose_hand_chest,pose_hands_behind_soft,pose_open_arm_invite,pose_present_arm_up,pose_cute_double_fists,pose_hand_hip_flow,pose_hair_touch,pose_peace_near_face";
  f.story_expression_ids = "cool,smile_soft,embarrassed,smile_bright,smile_closed_soft,troubled_soft,relief_soft,eyes_closed_smile,smile_open_soft";
  f.story_look_ids = "camera,slight_away,away";
} else if (phase >= 2) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_hand_hip_gentle,pose_cheek_touch_shy,pose_hand_chest,pose_hands_behind_soft,pose_hair_touch,pose_hand_hip_flow,pose_finger_lips_soft";
  f.story_expression_ids = "cool,smile_soft,embarrassed,smile_bright,smile_closed_soft,troubled_soft,relief_soft,eyes_closed_smile";
  f.story_look_ids = "camera,slight_away";
} else if (phase >= 1) {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_hand_hip_gentle,pose_cheek_touch_shy,pose_hand_chest,pose_hands_behind_soft";
  f.story_expression_ids = "cool,smile_soft,embarrassed,smile_bright,smile_closed_soft,troubled_soft";
  f.story_look_ids = "camera,slight_away";
} else {
  f.story_pose_ids = "pose_stand_soft,pose_turn_half,pose_hand_hip_gentle";
  f.story_expression_ids = "cool,smile_soft,embarrassed";
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
昼休みの教室は、まだ少しだけざわついている。[p]
文化祭の準備で散らかった机のあいだに、陽菜の姿が見えた。[p]

#柊 陽菜
あ、来てくれたんだ。[p]
まだ慣れないけど、今日はちゃんと協力するね。[p]

#
まだ「頼まれたから」という空気は残っている。けれど、その声色は思ったよりやわらかかった。[p]
[jump target="*launch_photo"]

*lunch_phase_1
[bg storage="room.jpg" time="200"]
#柊 陽菜
この前の写真、あとで少し見返してたんだ。[p]
……私って、ああいうふうに笑うんだなって、ちょっと不思議だった。[p]

#
陽菜は照れたように目を伏せながら、それでも今日は逃げずにこっちを見る。[p]
[jump target="*launch_photo"]

*lunch_phase_2
[bg storage="room.jpg" time="200"]
#柊 陽菜
今日は、少しだけ自分でも試してみたいかも。[p]
いつもみたいに任せきりじゃなくて、どんな一枚にしたいか、休み時間のあいだずっと考えてたんだ。[p]

#
撮られる側の言葉に、はっきりとした期待が混ざり始めている。[p]
[jump target="*launch_photo"]

*lunch_phase_3
[bg storage="room.jpg" time="200"]
#柊 陽菜
君に撮ってもらう時間、もう文化祭の準備だけじゃない気がする。[p]
今日も、ちゃんと私を見ててね。[p]

#
教室の喧騒が遠のいて、陽菜の声だけがまっすぐ届いた。[p]
[jump target="*launch_photo"]

*after_school_phase_0
[bg storage="rouka.jpg" time="200"]
#
放課後。人の減った教室に、西日が長く差し込んでいる。[p]

#柊 陽菜
昼休みより、少し静かでいいかも。[p]
こういう時間なら、落ち着いて撮れそうだね。[p]
[jump target="*launch_photo"]

*after_school_phase_1
[bg storage="rouka.jpg" time="200"]
#柊 陽菜
最近、カメラを向けられても前ほど緊張しなくなってきたよ。[p]
君がちゃんと見てくれるって、わかってきたからかな。[p]
[jump target="*launch_photo"]

*after_school_phase_2
[bg storage="rouka.jpg" time="200"]
#柊 陽菜
今日はどんな感じで撮る？[p]
もし似合いそうなら、ちょっとだけ冒険した表情もやってみたい。[p]
君になら、そういう私も見せてみてもいい気がするから。[p]
[jump target="*launch_photo"]

*after_school_phase_3
[bg storage="rouka.jpg" time="200"]
#柊 陽菜
君の前だと、不思議と無理に笑わなくていいんだよね。[p]
だから、今日の一枚も楽しみにしてる。[p]
[jump target="*launch_photo"]

*launch_photo
[stone_photo_mvp heroine="heroine1" location="&f.story_current_location_id" pose_ids="&f.story_pose_ids" expression_ids="&f.story_expression_ids" look_ids="&f.story_look_ids" result="f.story_photo_result" commit_target="*photo_committed" cancel_target="*photo_cancelled"]

*photo_committed
[iscript]
f.story_last_photo_saved = true;
f.story_last_photo_heroine_id = "heroine1";
f.story_shot_count.heroine1 = (f.story_shot_count.heroine1 || 0) + 1;
f.story_last_shot_order.heroine1 = f.story_action_index + 1;
var shotCount = f.story_shot_count.heroine1 || 0;
var phase = 0;
if (shotCount >= 6) {
  phase = 3;
} else if (shotCount >= 4) {
  phase = 2;
} else if (shotCount >= 2) {
  phase = 1;
}
f.story_talk_phase.heroine1 = phase;
f.story_unlock_phase.heroine1 = phase;
f.story_photo_notice = "陽菜の写真を保存した。今週の保存回数は " + shotCount + " 回。";
f.story_action_summary = f.story_photo_notice;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みなのに、今の一枚だけは午後じゅう何度も思い出しそう。";
    f.story_reaction_line_2 = "君に見つけてもらえたって実感があると、そのあとまでずっとあったかいね。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "短い昼休みでも、今の一枚はちゃんと私らしかった気がする。";
    f.story_reaction_line_2 = "午後のあいだも、次はもっと自分から見せられるかもって考えちゃいそう。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "昼休みの短い時間でも、前より自然に笑えてたよね。";
    f.story_reaction_line_2 = "なんだかそのまま、午後も少しだけ頑張れそう。";
  } else {
    f.story_reaction_line_1 = "短い昼休みなのに、今の一枚はちゃんと残しておきたいって思えた。";
    f.story_reaction_line_2 = "午後も頑張れそうなくらい、少し元気が出たかも。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "放課後の静かな時間に残ると、君に撮ってもらう意味がもっとはっきりするね。";
    f.story_reaction_line_2 = "今日の一枚、帰ってからも大事に思い返しそう。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "放課後に残した一枚って、昼より少しだけ特別に見えるね。";
    f.story_reaction_line_2 = "今の感じなら、次はもっと自分から楽しみにして待てそう。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "昼より静かなぶん、今の笑顔もちゃんと残った気がする。";
    f.story_reaction_line_2 = "君とこうして残る時間、思ったより好きかもしれない。";
  } else {
    f.story_reaction_line_1 = "放課後の教室で残ると、昼より少しだけ特別に見えるね。";
    f.story_reaction_line_2 = "次はもう少しだけ、肩の力を抜いて立てる気がする。";
  }
}
[endscript]
#柊 陽菜
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]

*photo_cancelled
[iscript]
f.story_last_photo_saved = false;
f.story_photo_notice = "陽菜との時間は過ごしたが、今日は保存までは進まなかった。";
f.story_action_summary = f.story_photo_notice;
var phase = f.story_talk_phase.heroine1 || 0;
if (f.story_slot == "lunch") {
  if (phase >= 3) {
    f.story_reaction_line_1 = "昼休みの短い時間でも、君と向き合えたならそれで大丈夫。";
    f.story_reaction_line_2 = "午後のあとでもう一度会えたら、その時はちゃんと残したいな。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今日は昼休みのぶんだけで終わっちゃったけど、試した感じはすごくよかったよ。";
    f.story_reaction_line_2 = "午後のあいだに、次はどんなふうに見つけてほしいか考えてみるね。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "少し惜しいけど、昼休みだもんね。こういう日もあるよ。";
    f.story_reaction_line_2 = "次はもっと自然に笑える瞬間を、ちゃんと残せる気がする。";
  } else {
    f.story_reaction_line_1 = "今日はここまででも大丈夫。昼休みに少し話せただけでも安心したし。";
    f.story_reaction_line_2 = "次はもう少し落ち着いて、ちゃんと向き合えたら嬉しいな。";
  }
} else {
  if (phase >= 3) {
    f.story_reaction_line_1 = "今夜は残らなくても平気。君と過ごした放課後はちゃんと覚えていたいから。";
    f.story_reaction_line_2 = "次に残す一枚は、今日よりもっと大事なものになる気がする。";
  } else if (phase >= 2) {
    f.story_reaction_line_1 = "今日は残さなかったけど、放課後にゆっくり試せたのはよかったよ。";
    f.story_reaction_line_2 = "次はもっと自信を持って、君の前に立てそう。";
  } else if (phase >= 1) {
    f.story_reaction_line_1 = "少し惜しいけど、こうして放課後に話せたのは嬉しかったな。";
    f.story_reaction_line_2 = "また次に、今よりいい瞬間を探してみよう。";
  } else {
    f.story_reaction_line_1 = "今日は急がなくて大丈夫。放課後はまだ少し緊張しちゃうし。";
    f.story_reaction_line_2 = "次に撮るときは、もう少しだけ落ち着いて向き合えたら嬉しいな。";
  }
}
[endscript]
#柊 陽菜
[emb exp="f.story_reaction_line_1"][p]
[emb exp="f.story_reaction_line_2"][p]
[jump storage="story_mode_common.ks" target="*after_action"]
