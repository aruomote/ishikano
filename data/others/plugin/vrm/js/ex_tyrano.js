(function(){
	//ティラノの既存機能拡張用

	if (TYRANO.kag.stat.mp.displayLoading && TYRANO.kag.stat.mp.displayLoading === "false" ) {
		VRoid.displayLoading = false
	} else {
		VRoid.displayLoading = true
	}

	//ロードゲーム拡張
	const _loadGameData = TYRANO.kag.menu.loadGameData;
	TYRANO.kag.menu.loadGameData = function(data, options) {

		if (VRoid.displayLoading) {
			//ゲームの解像度を取得
			const w = 10 + Number(TYRANO.kag.config.scWidth)
			const h = 10 + Number(TYRANO.kag.config.scHeight)

			//ロード用のマスクレイヤーを追加する
			$("#tyrano_base").append(
				"<div id='VRoid_loading_mask' " +

				"style='" +
					"animation-fill-mode: both; " +
					"animation-duration: 300ms; " +
					"z-index: 1000000000; " +
					"position: absolute; " +
					//ロード用の背景も設定できる
					//"background-image: url(\"./data/bgimage/rouka.jpg\"); " +
					"background-repeat: no-repeat; " +
					"background-position: 5px 5px; " +
					"background-color: rgb(0, 0, 0); " +
					"width: " + w + "px; " +
					"height: " + h + "px; " +
					"line-height: " + h + "px; " +
					"top: -5px; " +
					"left: -5px; " +
					"color: #fff; " +
					"font-size: 30px; " +
					"font-family: " + TYRANO.kag.config.userFace + ";" +
					"text-align: center; " +
					"backface-visibility: hidden; " +
				"'>" +
					"<div style='animation-name: fadeInDown; animation-fill-mode: both; animation-duration: 1000ms;'>　Loading...<div id='loading_circle'></div></div>" +
				"</div>"
			);
		}
		
		//全レイヤーオブジェクトの削除
		for (const key in VRoid.three.layer) {
			VRoid.three.dispose(key)
		}

		_loadGameData.apply(this, arguments);
		VRoid.three.statLoad(cb)
		
		//処理完了時にマスクをフェードアウトさせる。
		function cb() {
			if (VRoid.displayLoading) {
				setTimeout(function() {
					$("#VRoid_loading_mask").css("animation-name", "fadeOut").one('animationend', function() {
						$(this).remove();

					});
				}, 100);
			}
		}

	};

	//ロード中のキーコンフィグを強制無効化
	const _doActionTag = TYRANO.kag.key_mouse.doActionTag
	TYRANO.kag.key_mouse.doActionTag = function(action_tag, event) {
		
		if (document.getElementById("VRoid_loading_mask")) {
			return false;
		}
		
		_doActionTag.apply(this, arguments);
	};

	//リップシンク実装
	const _play = TYRANO.kag.tag.playbgm.play;
	TYRANO.kag.tag.playbgm.play = async function(pm) {

		_play.apply(this, arguments);
		
		//リップシンク条件を満たしている場合実行
		if (this.kag.stat.VRoid && pm.lipSync !== "false" && pm.target === "se") {
			const saveModel = this.kag.stat.VRoid.model
			for (const modelID in saveModel) {
				const lipSync = saveModel[modelID].lipSync
				if (lipSync && lipSync.isSync && lipSync.buf === Number(pm.buf)) {
					if (lipSync.isSyncPos) {
						this.kag.tmp.map_se[pm.buf].once("load", () => {
							//位置情報を先にセット
							VRoid.three.lipSync (pm, modelID, lipSync, true)
						});
					}

					this.kag.tmp.map_se[pm.buf].once("play", () => {
						VRoid.three.lipSync (pm, modelID, lipSync)
					});
				}
			}
		}
	}

})();
