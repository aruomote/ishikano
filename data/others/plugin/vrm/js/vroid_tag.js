(function(){
	const resolveVRoidModuleUrl = (storage) => {
		const normalizedStorage = String(storage || "").replace(/^\.?\//, "");
		return new URL("./data/others/" + normalizedStorage, document.baseURI).href;
	};

	const loadVRoidModuleOnce = (storage) => {
		const moduleUrl = resolveVRoidModuleUrl(storage);
		const cache = window.__vroidModulePromiseCache || (window.__vroidModulePromiseCache = {});
		if (!cache[moduleUrl]) {
			cache[moduleUrl] = import(moduleUrl);
		}
		return cache[moduleUrl];
	};

	//VRoid用タグ
	//V520未満のmodule対応
	TYRANO.kag.ftag.master_tag.VRoid_module = {
		vital: ["storage"],
		pm: {
		},

		start: function(pm) {
			loadVRoidModuleOnce(pm.storage).then((module) => {
				this.kag.ftag.nextOrder();
			}).catch((error) => {
				console.error("VRoid_module load failed:", resolveVRoidModuleUrl(pm.storage), error);
			});
		},
		
		kag: TYRANO.kag
	};

	//VRoid表示用のレイヤー作成
	//[VRoid_new layerID="VRoid"]
	TYRANO.kag.ftag.master_tag.VRoid_new = {
		vital: ["layerID"],
		pm: {
			layer: "0",
			name: "",	//隠しオプション。animタグで変更した内容はセーブされない
			zindex: "10",
			visible: "true",
			antialias: "auto",
			samples: "4",
			quality: "auto",
			limitFPS: "auto",
			lightType: "directional",
			perspective: "true",
			fov: "30",
			near: "0.01",
			far: "100",
			highLight: "0.3141592653589793",
			useWebGL2: "true",
			showFPS: "true",
			screenshot: "true",
			width: "0",
			height: "0",
			top: "0",
			left: "0",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.visible = pm.visible !== "false";

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.screenshot = pm.screenshot !== "false";

			if (pm.antialias == "auto") {
				//"auto"はPCの場合true それ以外はfalseに設定する
				pm.antialias = $.userenv() == 'pc';
			} else {
				//"false"を明示的に渡される以外はtrueを設定する。
				pm.antialias = pm.antialias !== "false";
			}
			
			if (pm.limitFPS == "auto") {
				//"auto"はPCの場合false それ以外はtrueに設定する(antialiasと逆)
				pm.limitFPS = $.userenv() != 'pc';
			} else {
				//"false"を明示的に渡される以外はtrueを設定する。
				pm.limitFPS = pm.limitFPS !== "false";
			}

			pm.width = parseInt(pm.width)
			pm.height = parseInt(pm.height)

			pm.top = parseInt(pm.top)
			pm.left = parseInt(pm.left)

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.perspective = pm.perspective !== "false";

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.useWebGL2 = pm.useWebGL2 !== "false";

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.showFPS = pm.showFPS !== "false";

			pm.zindex = Number(pm.zindex)
			pm.fov = Number(pm.fov)
			pm.near = Number(pm.near)
			pm.far = Number(pm.far)
			pm.highLight = Number(pm.highLight)
			pm.samples = Number(pm.samples)
			
			//quality処理
			if (isNaN(pm.quality) == false) {
				//数字直接指定
				pm.quality = Number(pm.quality)
				//2より大きければ2にする
				if (pm.quality > 2) pm.quality = 2
				//0.1より小さければ0.1にする
				if (pm.quality < 0.1) pm.quality = 0.1
			} else {
				//パラメータ名指定　auto or autoHigh or autoLow or normal or high or low
				if (pm.quality.toUpperCase() == "AUTOHIGH") {
					if ($.userenv() == 'pc') {
						pm.quality = 1.5
					} else {
						pm.quality = 1.25
					}

				} else if (pm.quality.toUpperCase() == "AUTOLOW") {
					if ($.userenv() == 'pc') {
						pm.quality = 1
					} else {
						pm.quality = 0.8
					}
				} else if (pm.quality.toUpperCase() == "NORMAL") {
					pm.quality = 1
				} else if (pm.quality.toUpperCase() == "HIGH") {
					pm.quality = 1.25
				} else if (pm.quality.toUpperCase() == "LOW") {
					pm.quality = 0.8
				} else {
					//autoやどれにも該当しない場合。
					if ($.userenv() == 'pc') {
						pm.quality = 1.25
					} else {
						pm.quality = 1
					}
				}
			}

			VRoid.three.create(pm)
			this.kag.ftag.nextOrder();
		},
		
		kag: TYRANO.kag
	};

	TYRANO.kag.ftag.master_tag.VRoid_light = {
		vital: ["layerID"],
		pm: {
			easing: "default",
			time: "0",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0;
			pm.time = Number(pm.time)

			VRoid.three.light(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};


	//VRoid表示用のレイヤーの表示
	//[VRoid_layer_show layerID="VRoid"]
	TYRANO.kag.ftag.master_tag.VRoid_layer_show = {
		vital: ["layerID"],
		pm: {
			time: "0",
			wait: "true",
			skip: "false",
			easing: "default",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0

			pm.time = Number(pm.time)
			pm.visible = 1

			VRoid.three.layerAnime(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//VRoid表示用のレイヤーの非表示
	//[VRoid_layer_hide layerID="VRoid"]
	TYRANO.kag.ftag.master_tag.VRoid_layer_hide = {
		vital: ["layerID"],
		pm: {
			time: "0",
			wait: "true",
			skip: "false",
			easing: "default",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0

			pm.time = Number(pm.time)
			pm.visible = 0

			VRoid.three.layerAnime(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//VRoid表示用のレイヤーの移動
	//[VRoid_layer_move layerID="VRoid" left=100 time=1000]
	TYRANO.kag.ftag.master_tag.VRoid_layer_move = {
		vital: ["layerID"],
		pm: {
			time: "0",
			wait: "true",
			skip: "false",
			easing: "default",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0

			pm.time = Number(pm.time)
			pm.visible = 0

			VRoid.three.layer_move(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//VRoid表示用のレイヤーの破棄
	//[VRoid_dispose layerID="VRoid"]
	TYRANO.kag.ftag.master_tag.VRoid_dispose = {
		vital: ["layerID"],
		pm: {
		},

		start: function(pm) {
			VRoid.three.dispose(pm.layerID)
			this.kag.ftag.nextOrder();
		},
		
		kag: TYRANO.kag
	};

	//表情データのインポート ファイル名がnameになる
	//[VRoid_import_emotion storage="sample.json"]
	TYRANO.kag.ftag.master_tag.VRoid_import_emotion = {
		vital: ["storage"],
		pm: {
		},

		start: function(pm) {
			VRoid.three.import(pm.storage, cb, "_emotion")

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//アニメーション用の表情データのインポート ファイル名がnameになる
	//[VRoid_import_anim_emo_timeline storage="sample.json"]
	TYRANO.kag.ftag.master_tag.VRoid_import_anim_emo_timeline = {
		vital: ["storage"],
		pm: {
		},

		start: function(pm) {
			VRoid.three.import(pm.storage, cb, "_animEmo")

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//ポーズデータのインポート ファイル名がnameになる
	//[VRoid_import_pose storage="usamimi.json"]
	TYRANO.kag.ftag.master_tag.VRoid_import_pose = {
		vital: ["storage"],
		pm: {
		},

		start: function(pm) {
			VRoid.three.import(pm.storage, cb, "_pose")

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//レイヤーのキャプチャ rateがでかいときはtimeout増やした方がいいかも
	//[VRoid_capture layerID="VRoid" rate=3]
	TYRANO.kag.ftag.master_tag.VRoid_capture = {
		vital: ["layerID"],
		pm: {
			rate: "1",
			timeout: "100",
		},

		start: function(pm) {
			VRoid.three.capture(pm.layerID, pm.rate, pm.timeout)
			this.kag.ftag.nextOrder();
		},
		
		kag: TYRANO.kag
	};

	//カメラを移動させる
	//[VRoid_move_camera layerID="VRoid" z=-0.5 easing="easeOutBack" time=1000]
	TYRANO.kag.ftag.master_tag.VRoid_camera_move = {
		vital: ["layerID"],
		pm: {
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {
		
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0;
			pm.time = Number(pm.time)

			pm.type = "layer"

			VRoid.three.move(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//テストカメラを起動する modelIDを指定した場合はposeのテストも可能
	//VRoid_emo_makerとの同時起動も可能。VRoid_emo_makerはシナリオ非同期、VRoid_camera_testはシナリオ同期なので
	//VRoid_emo_makerを先に起動させている必要あり。
	//[VRoid_camera_test layerID="VRoid" modelID="model1"]
	TYRANO.kag.ftag.master_tag.VRoid_camera_test = {
		vital: ["layerID"],
		pm: {
			modelID: "",
			isAdvanced: "false",
		},

		start: function(pm) {
			//"true"を明示的に渡される以外はfalseを設定する。
			pm.isAdvanced = pm.isAdvanced === "true";

			VRoid.three.testCamera(pm.layerID, pm.modelID, cb, pm.isAdvanced)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//モデルのロード
	//[VRoid_load modelID="model1" storage="AliciaSolid.vrm"]
	TYRANO.kag.ftag.master_tag.VRoid_load = {
		vital: ["modelID", "storage"],
		pm: {
			wait: "true",
			maker: "false",
		},

		start: function(pm) {
			const storage = "./data/others/plugin/vrm/model/" + pm.storage

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.maker = pm.maker === "true";

			VRoid.three.load(pm.modelID, storage, cb, pm.wait, pm.maker)
			
			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//emoMakerの表示
	//[VRoid_emo_maker modelID="model1"]
	TYRANO.kag.ftag.master_tag.VRoid_emo_maker = {
		vital: ["modelID"],
		pm: {
		},

		start: function(pm) {

			VRoid.three.emoMaker(pm.modelID)
			this.kag.ftag.nextOrder();

		},
		
		kag: TYRANO.kag
	};

	//materialCheckerの表示
	//[VRoid_materialChecker modelID="model1"]
	TYRANO.kag.ftag.master_tag.VRoid_materialChecker = {
		vital: ["modelID"],
		pm: {
		},

		start: function(pm) {

			VRoid.three.materialChecker(pm.modelID)
			this.kag.ftag.nextOrder();

		},
		
		kag: TYRANO.kag
	};

	//モデルをレイヤーに追加
	//[VRoid_add layerID="VRoid" modelID="model1" pose="pose3" shake=false]
	TYRANO.kag.ftag.master_tag.VRoid_add = {
		vital: ["layerID", "modelID"],
		pm: {
			pose: "default",
			visible: "true",
			x: "0",
			y: "0",
			z: "0",
			rotX: "0",
			rotY: "0",
			rotZ: "0",
			scaleX: "1",
			scaleY: "1",
			scaleZ: "1",
			firstShake: "false",
			lookingCamera: "false",
			waitingAnimation: "true",
			shake: "true",
			waitingAnimationVal: "15",
			shakeSpeed: "1",
			waitingAnimationSpeed: "1",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.visible = pm.visible !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.firstShake = pm.firstShake === "true";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.lookingCamera = pm.lookingCamera === "true";

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.waitingAnimation = pm.waitingAnimation !== "false";

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.shake = pm.shake !== "false";

			//数字に型変換
			const numList = [
				"x",
				"y",
				"z",
				"rotX",
				"rotY",
				"rotZ",
				"scaleX",
				"scaleY",
				"scaleZ",
				"waitingAnimationVal",
				"shakeSpeed",
				"waitingAnimationSpeed",
			]
			numList.forEach(key => {
				pm[key] = Number(pm[key]);
			});

			VRoid.three.add(pm)

			requestAnimationFrame(() => {
				this.kag.ftag.nextOrder();
			});

		},
		
		kag: TYRANO.kag
	};

	//モデルをレイヤーから削除
	//[VRoid_delete modelID="model1"]
	TYRANO.kag.ftag.master_tag.VRoid_delete = {
		vital: ["modelID"],
		pm: {
		},

		start: function(pm) {
			VRoid.three.delete(pm.modelID)
			this.kag.ftag.nextOrder();
		},
		
		kag: TYRANO.kag
	};

	//モデルのマテリアルの表示非表示設定
	//[VRoid_material modelID="model1" materialID=0 visible=false]
	TYRANO.kag.ftag.master_tag.VRoid_material = {
		vital: ["modelID"],
		pm: {
			materialID: null,
			visible: "true",
			outline: "true",
		},

		start: function(pm) {
			//"true"を明示的に渡される以外はfalseを設定する。
			pm.visible = pm.visible === "true";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.outline = pm.outline === "true";

			VRoid.three.material(pm.modelID, pm.materialID, pm.visible, pm.outline)
			this.kag.ftag.nextOrder();

		},
		
		kag: TYRANO.kag
	};

	//マテリアルのテクスチャーを変更
	TYRANO.kag.ftag.master_tag.VRoid_change_texture = {
		vital: ["modelID", "materialID", "storage"],
		pm: {
			outline: "true",
		},

		start: function(pm) {
			//"true"を明示的に渡される以外はfalseを設定する。
			pm.outline = pm.outline === "true";

			VRoid.three.changeTexture(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//マテリアルのカラーを変更
	TYRANO.kag.ftag.master_tag.VRoid_change_color = {
		vital: ["modelID", "materialID"],
		pm: {
			easing: "default",
			time: "0",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0;
			pm.time = Number(pm.time)

			VRoid.three.changeColor(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//モデルに風をあてる
	//[VRoid_wind modelID="model1"]
	TYRANO.kag.ftag.master_tag.VRoid_wind = {
		vital: ["modelID"],
		pm: {
		},

		start: function(pm) {

			VRoid.three.wind(pm.modelID, pm.val, pm.speed, pm.x, pm.y, pm.z, pm.excl, pm.minRatio, pm.forceWind)
			this.kag.ftag.nextOrder();

		},
		
		kag: TYRANO.kag
	};


	//風をとめる
	//[VRoid_stop_wind modelID="model1"]
	TYRANO.kag.ftag.master_tag.VRoid_stop_wind = {
		vital: ["modelID"],
		pm: {
		},

		start: function(pm) {

			VRoid.three.stopWind(pm.modelID)
			this.kag.ftag.nextOrder();

		},
		
		kag: TYRANO.kag
	};


	//モデルの状態を変更する
	//[VRoid_model_config modelID="model1"]
	TYRANO.kag.ftag.master_tag.VRoid_model_config = {
		vital: ["modelID"],
		pm: {
			lookingCamera: null,
			waitingAnimation: null,
			shake: null,
			waitingAnimationVal: null,
			shakeSpeed: null,
			waitingAnimationSpeed: null,
		},

		start: function(pm) {
			if (pm.lookingCamera !== null) {
				//"true"を明示的に渡される以外はfalseを設定する。
				pm.lookingCamera = pm.lookingCamera === "true";
			}

			if (pm.waitingAnimation !== null) {
				//"false"を明示的に渡される以外はtrueを設定する。
				pm.waitingAnimation = pm.waitingAnimation !== "false";
			}

			if (pm.shake !== null) {
				//"false"を明示的に渡される以外はtrueを設定する。
				pm.shake = pm.shake !== "false";
			}

			if (pm.waitingAnimationVal !== null) {
				//数字に型変換
				pm.waitingAnimationVal = Number(pm.waitingAnimationVal);
			}

			if (pm.shakeSpeed !== null) {
				//数字に型変換
				pm.shakeSpeed = Number(pm.shakeSpeed);
			}

			if (pm.waitingAnimationSpeed !== null) {
				//数字に型変換
				pm.waitingAnimationSpeed = Number(pm.waitingAnimationSpeed);
			}

			VRoid.three.modelConfig(pm.modelID, pm.lookingCamera, pm.shake, pm.shakeSpeed, pm.waitingAnimation, pm.waitingAnimationVal, pm.waitingAnimationSpeed)
			this.kag.ftag.nextOrder();
		},
		
		kag: TYRANO.kag
	};

	//モデルの注視先を指定する
	//[VRoid_lookAt modelID="model1" x=1 y=1 time=2000]
	TYRANO.kag.ftag.master_tag.VRoid_lookAt = {
		vital: ["modelID"],
		pm: {
			x: 0,
			y: 0,
			z: 0,
			time: 0,
			base: "camera",    //camera or model
			wait: "true",
			skip: "false",
			easing: "default",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) {pm.time = 0;}

			VRoid.three.lookAt(pm.modelID, Number(pm.x), Number(pm.y), Number(pm.z), pm.time, pm.easing, pm.base, cb, pm.wait, pm.skip)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}

		},
		
		kag: TYRANO.kag
	};

	//モデルの注視先をカメラにする
	//[VRoid_lookAtCamera modelID="model1" time=2000]
	TYRANO.kag.ftag.master_tag.VRoid_lookAtCamera = {
		vital: ["modelID"],
		pm: {
			time: 0,
			wait: "true",
			skip: "false",
			easing: "default",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) {pm.time = 0;}

			VRoid.three.lookAtCamera(pm.modelID, pm.time, pm.easing, cb, pm.wait, pm.skip)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}

		},
		
		kag: TYRANO.kag
	};

	//モデルの表示状態を表示にする
	//pm用意してるけど瞬間表示以外できない
	//[VRoid_show modelID="model1"]
	TYRANO.kag.ftag.master_tag.VRoid_show = {
		vital: ["modelID"],
		pm: {
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";
			
			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) {pm.time = 0;}

			VRoid.three.show(pm.modelID, Number(pm.time), pm.easing, cb, pm.wait)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//モデルの表示状態を非表示にする
	//pm用意してるけど瞬間表示以外できない
	//[VRoid_hide modelID="model1"]
	TYRANO.kag.ftag.master_tag.VRoid_hide = {
		vital: ["modelID"],
		pm: {
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) {pm.time = 0;}

			VRoid.three.hide(pm.modelID, Number(pm.time), pm.easing, cb, pm.wait)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};


	//モデルのポーズを変更する
	//表情も同時に変更できる
	//[VRoid_pose modelID="model1" pose="pose1"]
	TYRANO.kag.ftag.master_tag.VRoid_pose = {
		vital: ["modelID"],
		pm: {
			pose: "default",
			emo: null,
			emoID: "",
			emoval: "100",
			emo_diff: "false",
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを10に変更する
			if (this.kag.stat.is_skip && pm.skip) {pm.time = 10;}

			//se_storageが指定されていた場合、se_の付いたパラメーターでplayseを実行する
			VRoid.three.animation_playse(pm)

			//emoかemoIDが指定されていたら表情も同時に変更する
			if (pm.emo || pm.emoID) {

				//"true"を明示的に渡される以外はfalseを設定する。
				pm.emo_diff = pm.emo_diff === "true";

				VRoid.three.emotion(pm.modelID, pm.emo, Number(pm.time), pm.easing, null, pm.wait, pm.skip, pm.emo_diff, pm.emoID, pm.emoval)
			}

			VRoid.three.pose(pm.modelID, pm.pose, Number(pm.time), pm.easing, cb, pm.wait, pm.skip, pm.rotThreshold)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//アニメーションファイルをインポートする
	//[VRoid_import_anim storage="VRMA_01.vrma, VRMA_02.vrma"]
	TYRANO.kag.ftag.master_tag.VRoid_import_animation = {
		vital: ["storage"],
		pm: {
			wait: "true",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			VRoid.three.importAnimation(pm.storage, pm.wait, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//VRMAを再生する
	//[VRoid_animation modelID="model1" name="VRMA_01"]
	TYRANO.kag.ftag.master_tag.VRoid_animation = {
		vital: ["modelID", "name"],
		pm: {
			rate: "1",
			loop: "1",	//実質false
			fadeIn: "0",
			fadeOut: "0",
			fadeLoop: "0",
			wait: "true",
			skip: "false",
			keep: "false",
			startTime: "0",
			endTime: "0",
			emoTimeline: "",
			resetHips: "true",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.keep = pm.keep === "true";

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.resetHips = pm.resetHips !== "false";
			
			//loopにtrueとfalseを渡したときの処理
			if (pm.loop === "true") pm.loop = 0
			if (pm.loop === "false") pm.loop = 1
			
			//durationが設定されている場合はstartTimeに上書き
			if (pm.duration !== undefined) pm.startTime = pm.duration

			//数字に型変換
			const numList = [
				"rate",
				"loop",
				"fadeIn",
				"fadeOut",
				"fadeLoop",
				"startTime",
				"endTime",
			]
			numList.forEach(key => {
				pm[key] = Number(pm[key]);
			});

			VRoid.three.animation(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//loop中のVRoid_actionや、wait=falseで処理中の再生を停止する
	//[VRoid_stop_animation modelID="model1" fadeOut=1000]
	TYRANO.kag.ftag.master_tag.VRoid_stop_animation = {
		vital: ["modelID"],
		pm: {
			fadeOut: "0",
			wait: "true",
			skip: "false",
			keep: "false",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.keep = pm.keep === "true";

			VRoid.three.stop_animation(pm.modelID, Number(pm.fadeOut), pm.wait, pm.skip, cb, pm.keep)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//モデルの表情を変更する
	//[VRoid_emo modelID="model1" name="happy"]
	TYRANO.kag.ftag.master_tag.VRoid_emo = {
		vital: ["modelID"],
		pm: {
			emo: "default",
			emoID: "",
			emoval: "1",
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
			diff: "false",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.diff = pm.diff === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) {pm.time = 0;}

			//se_storageが指定されていた場合、se_の付いたパラメーターでplayseを実行する
			VRoid.three.animation_playse(pm)

			VRoid.three.emotion(pm.modelID, pm.emo, Number(pm.time), pm.easing, cb, pm.wait, pm.skip, pm.diff, pm.emoID, pm.emoval)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//モデルを移動させる
	//[VRoid_move_model modelID="model1" z=-0.5 easing="easeOutBack" time=1000]
	TYRANO.kag.ftag.master_tag.VRoid_model_move = {
		vital: ["modelID"],
		pm: {
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0;
			pm.time = Number(pm.time)

			pm.type = "model"

			VRoid.three.move(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	TYRANO.kag.ftag.master_tag.VRoid_lip_config = {
		vital: ["modelID"],
		pm: {
		},

		start: function(pm) {
			if (this.kag.stat.VRoid.model[pm.modelID].lipSync){
				const lipSync = this.kag.stat.VRoid.model[pm.modelID].lipSync
				
				if (pm.isSync !== undefined) lipSync.isSync = pm.isSync === "true"
				if (pm.isSyncPos !== undefined) lipSync.isSyncPos = pm.isSyncPos === "true"

				if (pm.buf !== undefined) {
					if (isNaN(pm.buf)) {
						if (pm.buf == "null") lipSync.buf = null
					} else {
						lipSync.buf = Number(pm.buf)
					}
				}

				//位置感度
				if (pm.posRate !== undefined) lipSync.posRate = Number(pm.posRate)
				
				//入力感度
				if (pm.micVolume !== undefined) lipSync.micVolume = Number(pm.micVolume)

				//入力閾値
				if (pm.micMinLevel !== undefined) lipSync.micMinLevel = Number(pm.micMinLevel)

				//既存表情データのミックス値
				if (pm.micMix !== undefined) lipSync.micMix = Number(pm.micMix)

				//口パクから元に戻る時間
				if (pm.fadeOut !== undefined) lipSync.fadeOut = Number(pm.fadeOut)

				//カンマ区切りで前後をトリムして無効リストに入れる配列を挿入
				if (pm.invalidList !== undefined) lipSync.invalidList = pm.invalidList.split(',').map(s => s.trim());

				if (pm.aa !== undefined) lipSync.lipData.aa = Math.max(0, Math.min(1, Number(pm.aa)));
				if (pm.ih !== undefined) lipSync.lipData.ih = Math.max(0, Math.min(1, Number(pm.ih)));
				if (pm.ou !== undefined) lipSync.lipData.ou = Math.max(0, Math.min(1, Number(pm.ou)));
				if (pm.ee !== undefined) lipSync.lipData.ee = Math.max(0, Math.min(1, Number(pm.ee)));
				if (pm.oh !== undefined) lipSync.lipData.oh = Math.max(0, Math.min(1, Number(pm.oh)));
			}

			this.kag.ftag.nextOrder();
		},
		
		kag: TYRANO.kag
	};

	TYRANO.kag.ftag.master_tag.VRoid_import_blinkSetting = {
		vital: ["storage", "modelID"],
		pm: {
		},

		start: function(pm) {
			that = this;

			$.getJSON("./data/others/plugin/vrm/_blink/" + pm.storage).done(function(json) {

				that.kag.stat.VRoid.model[pm.modelID].blinkData = json
				that.kag.ftag.nextOrder();

			}).fail(function(err) { 
				VRoid.three.error(pm.storage + " ファイルが存在しないか、jsonファイルの記述が間違っています。 ");
				that.kag.ftag.nextOrder();
			});

		},
		
		kag: TYRANO.kag
	};

	TYRANO.kag.ftag.master_tag.VRoid_blink_config = {
		vital: ["modelID"],
		pm: {
		},

		start: function(pm) {
			const blink = this.kag.stat.VRoid.model[pm.modelID].blink

			if (pm.enable !== undefined) blink.enable = pm.enable !== "false"

			if (pm.stroke !== undefined) blink.stroke = Number(pm.stroke)

			if (pm.speed !== undefined) blink.speed = Number(pm.speed)

			this.kag.ftag.nextOrder();
		},
		
		kag: TYRANO.kag
	};

	TYRANO.kag.ftag.master_tag.VRoid_effect_preload = {
		vital: ["name"],
		pm: {
		},

		start: function(pm) {
			VRoid.three.effect_import(pm.name, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}

		},
		
		kag: TYRANO.kag
	};

	TYRANO.kag.ftag.master_tag.VRoid_effect = {
		vital: ["layerID", "name"],
		pm: {
		},

		start: function(pm) {
			const option = {}

			//pmのlayerIDとname以外をoptionに格納する
			for (let key in pm) {
				if (key != "layerID" && key != "name") {
					//数字かどうかチェック
					if (isNaN(pm[key]) === false) {
						option[key] = Number(pm[key])
					} else {
						//それ以外はtrue or false
						if (pm[key].toUpperCase() === "TRUE") option[key] = true
						if (pm[key].toUpperCase() === "FALSE") option[key] = false
					}
				}
			}
			
			VRoid.three.effect(pm.layerID, pm.name, option, cb)
			
			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
			
		},
		
		kag: TYRANO.kag
	};

	TYRANO.kag.ftag.master_tag.VRoid_effect_delete = {
		vital: ["layerID"],
		pm: {
			name: null,
		},

		start: function(pm) {
			VRoid.three.effect_delete(pm.layerID, pm.name)
			this.kag.ftag.nextOrder();
		},
		
		kag: TYRANO.kag
	};

	//画像を追加する
	TYRANO.kag.ftag.master_tag.VRoid_img_add = {
		vital: ["layerID", "imgID", "storage"],
		pm: {
			visible: "true",
			x: "0",
			y: "0",
			z: "0",
			rotX: "0",
			rotY: "0",
			rotZ: "0",
			scaleX: "1",
			scaleY: "1",
			scaleZ: "0",
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
			cache: "true",
			side: "DoubleSide",
			renderOrder: "0",
		},

		start: function(pm) {
			//"false"を明示的に渡される以外はtrueを設定する。
			pm.visible = pm.visible !== "false";

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0;
			pm.time = Number(pm.time)

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.cache = pm.cache !== "false";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0;

			//数字に型変換
			const numList = [
				"x",
				"y",
				"z",
				"rotX",
				"rotY",
				"rotZ",
				"scaleX",
				"scaleY",
				"scaleZ",
				"time",
				"renderOrder",
			]
			numList.forEach(key => {
				pm[key] = Number(pm[key]);
			});

			VRoid.three.add_img(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//画像を削除する
	TYRANO.kag.ftag.master_tag.VRoid_img_delete = {
		vital: ["imgID"],
		pm: {
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0;
			pm.time = Number(pm.time)

			VRoid.three.delete_img(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//画像を移動する
	TYRANO.kag.ftag.master_tag.VRoid_img_move = {
		vital: ["imgID"],
		pm: {
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0;
			pm.time = Number(pm.time)

			pm.type = "img"

			VRoid.three.move(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//画像を表示する
	TYRANO.kag.ftag.master_tag.VRoid_img_show = {
		vital: ["imgID"],
		pm: {
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0;
			pm.time = Number(pm.time)

			pm.type = "img"

			VRoid.three.show_img(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

	//画像を非表示にする
	TYRANO.kag.ftag.master_tag.VRoid_img_hide = {
		vital: ["imgID"],
		pm: {
			time: "0",
			easing: "default",
			wait: "true",
			skip: "false",
		},

		start: function(pm) {

			//"false"を明示的に渡される以外はtrueを設定する。
			pm.wait = pm.wait !== "false";

			//"true"を明示的に渡される以外はfalseを設定する。
			pm.skip = pm.skip === "true";

			//skip時はtimeを0に変更する
			if (this.kag.stat.is_skip && pm.skip) pm.time = 0;
			pm.time = Number(pm.time)

			pm.type = "img"

			VRoid.three.hide_img(pm, cb)

			//callback用のnextOrderを用意する
			function cb() {
				TYRANO.kag.ftag.nextOrder();
			}
		},
		
		kag: TYRANO.kag
	};

})();

/*
	TYRANO.kag.ftag.master_tag.VRoid_ = {
		vital: ["name"],
		pm: {
			parameter: "",
		},

		start: function(pm) {
			this.kag.ftag.nextOrder();
		},
		
		kag: TYRANO.kag
	};
*/
