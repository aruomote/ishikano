
[cm]

[stop_keyconfig]
[hidemenubutton]

@clearstack
@bg storage ="title_stonekano.png" time=100
@wait time = 200
[layopt layer=0 visible=true]
[layopt layer=message0 visible=false]
[freeimage layer=0]
[image layer="0" name="title_logo" storage="title/logo_stonekano_01.png" folder="image" x="56" y="42" width="520" height="217"]

*start 
[cm]
[clearfix]
@layopt layer=message0 visible=false

[button x=110 y=300 graphic="title/button_start.png" enterimg="title/button_start2.png"  target="*mode_select" keyfocus="1"]
[button x=110 y=390 graphic="title/button_load.png" enterimg="title/button_load2.png" role="load" keyfocus="2"]
[button x=110 y=480 graphic="title/button_config.png" enterimg="title/button_config2.png" role="sleepgame" storage="config.ks" keyfocus="3"]

[s]

*mode_select
[cm]
[clearfix]
@layopt layer=message0 visible=true
[position layer="message0" left=120 top=560 width=1040 height=120 page=fore visible=true]
[position layer=message0 page=fore margint="24" marginl="36" marginr="36" marginb="22"]

遊ぶモードを選んでください。[p]

[glink color="blue" size="28" x="150" y="310" width="460" text="ストーリーモード" storage="story_mode_common.ks" target="*start" keyfocus="1"]
[glink color="green" size="26" x="150" y="400" width="460" text="撮影体験版（フリーモード）" storage="stone_photo_public_release.ks" keyfocus="2"]
[glink color="gray" size="26" x="150" y="490" width="460" text="戻る" target="*start" keyfocus="3"]
[s]

*gamestart
[free layer=0 name="title_logo"]
[layopt layer=0 visible=false]
@jump storage="stone_photo_public_release.ks"
