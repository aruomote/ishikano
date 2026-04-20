
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

[button x=110 y=300 graphic="title/button_start.png" enterimg="title/button_start2.png"  target="gamestart" keyfocus="1"]
[button x=110 y=390 graphic="title/button_load.png" enterimg="title/button_load2.png" role="load" keyfocus="2"]
[button x=110 y=480 graphic="title/button_config.png" enterimg="title/button_config2.png" role="sleepgame" storage="config.ks" keyfocus="3"]

[s]

*gamestart
;一番最初のシナリオファイルへジャンプする
[free layer=0 name="title_logo"]
[layopt layer=0 visible=false]
@jump storage="stone_photo_public_release.ks"
