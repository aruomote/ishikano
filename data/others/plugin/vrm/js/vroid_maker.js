(function(){

	//表情作成用
	VRoid.three.emoMaker = function (modelID) {

		//あったら閉じる
		$("#checker_exit").click()
		$("#maker_exit").click()

		const saveModel = TYRANO.kag.stat.VRoid.model[modelID];
		const vrm = this.model[modelID].vrm
		const expressionManager = vrm.expressionManager
		const blink = saveModel.blink
		const tmpBlink = blink.enable
		blink.enable = false
		
		//お気に入りの保存領域を作成
		if (TYRANO.kag.variable.sf.__emoMaker === undefined) {
			TYRANO.kag.variable.sf.__emoMaker = {};
		}
		if (TYRANO.kag.variable.sf.__emoMaker[modelID] === undefined) {
			TYRANO.kag.variable.sf.__emoMaker[modelID] = {};
		}

		const fontColor = "font-weight: bold; color: #000; text-shadow:rgb(255, 255, 255) 0px 2px,rgb(255, 255, 255) 0px -2px,rgb(255, 255, 255) 1px 2px,rgb(255, 255, 255) 1px -2px,rgb(255, 255, 255) 2px 0px,rgb(255, 255, 255) 2px 1px,rgb(255, 255, 255) 2px 2px ,rgb(255, 255, 255) 2px -1px,rgb(255, 255, 255) 2px -2px,rgb(255, 255, 255) -1px 2px,rgb(255, 255, 255) -1px -2px,rgb(255, 255, 255) -2px 0px,rgb(255, 255, 255) -2px 1px,rgb(255, 255, 255) -2px 2px,rgb(255, 255, 255) -2px -1px,rgb(255, 255, 255) -2px -2px;"

		html = "<div id='emoMaker' style='font-size: 20px; position: absolute; z-index: 9000000001; top: 0; left: 0; width: 320px; height: 100%;'>" +
				"<div style='z-index: 10; position: absolute; top: 0; left: 0; width: 285px; height: 78px; padding-right: 35px; padding-top: 10px; text-align: right; background-color: rgba(255, 255, 255, 0.5); line-height: 34px;'>" +
					"<button id='maker_material' type='button' style='cursor: pointer;'>マテリアル</button>　" +
					"<button id='maker_reset' type='button' style='cursor: pointer;'>リセット</button>　" +
					"<button id='maker_exit' type='button' style='cursor: pointer;'>閉じる</button><br>" +
					"<button id='maker_import' type='button' style='cursor: pointer;'>インポート</button>　" +
					"<button id='maker_export' type='button' style='cursor: pointer;'>エクスポート</button>" +
				"</div>" +
				"<div style='position: absolute; z-index: 10; top: 90px; left: 0; width: 320px; height: calc(100% - 90px); background-color: rgba(255, 255, 255, 0.5); overflow-y: scroll;'>"

				//お気に入りにチェックの付いているやつが先
				let i = 0;
				let arr = []
				for (const key in vrm.expressionManager._expressionMap) {
					if (key == "lookUp" || key == "lookDown" || key == "lookLeft" || key == "lookRight") continue
					if (TYRANO.kag.variable.sf.__emoMaker[modelID]["maker_fav_" + i]) {
						arr[i] = key
						html += "<span id='maker_fav_" + i + "' class='maker_fav' style='cursor: pointer; display: inline-block; height: 1em; line-height: 1em; width: 1em; margin: 0 6px 0 10px; font-size: 24px; transform: translateY(-8px); color: yellow;'>★</span>"
							+ "<textarea readonly rows='1' style='white-space: nowrap; overflow: hidden; resize: none;width: 220px;padding: 5px 10px; font-size: 14px; margin-top: 20px; margin-left: 5px; background:rgba(0,0,0,0); border: 2px solid rgba(255,255,255,0.5); border-radius: 6px;" + fontColor +"' title='" + key + "'>" + key + "</textarea><br>"
							+ "<input data-ename='" + key + "' id='maker_range_" + i + "' class='maker_range' type='range' value='0' min='0' max='1' step='0.01' style='cursor: pointer; margin-left: 40px;'><textarea readonly class='maker_textarea' data-ename='" + key + "' id='maker_text_" + i + "' rows='1' style='resize: none;width: 50px;padding: 5px 10px; font-size: 18px; margin-left: 20px; background:rgba(0,0,0,0); border: 2px solid rgba(255,255,255,0.5); border-radius: 6px;" + fontColor + "'>0</textarea>"
							+ "<br>"
					}
					i++;
				}
				
				i = 0;
				for (const key in vrm.expressionManager._expressionMap) {
					if (key == "lookUp" || key == "lookDown" || key == "lookLeft" || key == "lookRight") continue
					if (!TYRANO.kag.variable.sf.__emoMaker[modelID]["maker_fav_" + i]) {
						arr[i] = key
						html += "<span id='maker_fav_" + i + "' class='maker_fav' style='cursor: pointer; display: inline-block; height: 1em; line-height: 1em; width: 1em; margin: 0 6px 0 10px; font-size: 24px; transform: translateY(-8px);'>☆</span>"
							+ "<textarea readonly rows='1' style='white-space: nowrap; overflow: hidden; resize: none;width: 220px;padding: 5px 10px; font-size: 14px; margin-top: 20px; margin-left: 5px; background:rgba(0,0,0,0); border: 2px solid rgba(255,255,255,0.5); border-radius: 6px;" + fontColor +"' title='" + key + "'>" + key + "</textarea><br>"
							+ "<input data-ename='" + key + "' id='maker_range_" + i + "' class='maker_range' type='range' value='0' min='0' max='1' step='0.01' style='cursor: pointer; margin-left: 40px;'><textarea readonly class='maker_textarea' data-ename='" + key + "' id='maker_text_" + i + "' rows='1' style='resize: none;width: 50px;padding: 5px 10px; font-size: 18px; margin-left: 20px; background:rgba(0,0,0,0); border: 2px solid rgba(255,255,255,0.5); border-radius: 6px;" + fontColor + "'>0</textarea>"
							+ "<br>"
					}
					i++;
				}
				

			html += "<br></div></div>"

		if (document.getElementById("emoMaker")) {
			document.getElementById("emoMaker").remove();
		}
		$("#tyrano_base").append(html);

		//現在の状態の確認
		if (!saveModel.expression) {
			//設定がない時は初期化
			let i = 0;
			saveModel.expression = []

			expressionManager.expressions.forEach(function (data) {
				if (data.expressionName) saveModel.expression[i] = {expressionName: data.expressionName, val: 0}
				i++
			});
		} else {
			saveModel.expression.forEach(function (data) {
			
				const name = data.expressionName
				
				// data-enameがnameと一致する要素を取得
				const $maker_range = $(`input[data-ename="${name}"]`);
				const $maker_text = $(`textarea[data-ename="${name}"]`);

				$maker_range.val(data.val)
				$maker_text.html(data.val)
				if (data.val > 0) {
					$maker_text.css("background", "rgba(64,255,255,0.3)")
				} else {
					$maker_text.css("background", "rgba(0,0,0,0)")
				}
			});
		}

		$("#emoMaker").on('touchmove wheel', (e) => {
			e.stopPropagation();
		});

		$("#maker_reset").on('click', function() {
			arr.forEach((data, i) => {
				$("#maker_range_" + i).val(0);
				$("#maker_text_" + i).html(0).css("background", "rgba(0,0,0,0)");
				vrm.expressionManager.setValue(data, 0);
			});
		});

		$("#maker_import").on('click', function() {
			//import処理

			const input = document.createElement("input");
			input.type = "file";
			 
			input.addEventListener("change", e => {

				var result = e.target.files[0];
				var reader = new FileReader();

				reader.readAsText(result);
				reader.addEventListener("load", () => {

					let json
					try{
						json = JSON.parse(reader.result);
					}catch(e){
						alert("インポートしたファイルの形式が不正です！")
						return
					}
					
					//一旦リセット
					$("#maker_reset").click()
					for (const key in json) {
						arr.forEach((data, i) => {
							if (data == key) {
								$("#maker_range_" + i).val(json[key]);
								$("#maker_text_" + i).html(json[key]);
								if (Number(json[key]) > 0) {
									$("#maker_text_" + i).css("background", "rgba(64,255,255,0.3)")
								} else {
									$("#maker_text_" + i).css("background", "rgba(0,0,0,0)")
								}

								vrm.expressionManager.setValue(key, json[key]);
							}
						});
					}

				});
			});
			 
			//ダイアログを表示
			input.click();

		});

		$("#maker_export").on('click', function() {
			//export処理

			const emoData = {}
			
			arr.forEach((data, i) => {
				const val = $("#maker_range_" + i).val();
				if (val > 0) {
					emoData[data] = Number(val)
				}
			});

			const json = JSON.stringify(emoData, null, 2);
			const link = document.createElement("a");
			const ymd = new Date().toLocaleDateString('sv-SE');
			const time = new Date().toLocaleTimeString('ja-JP', {hour12:false});

			link.href = "data:text/plain," + encodeURIComponent(json);
			link.download = "new_emo_" + ymd + "_" + time + ".json";
			 
			//ファイルを保存
			link.click();

		});

		$("#maker_exit").one('click', function() {
			//セーブ用データに各ブレンドシェイプを格納
			saveModel.expression.forEach(function (data) {
			
				const name = data.expressionName

				const $maker_range = $(`input[data-ename="${name}"]`);
				
				data.val = Number($maker_range.val())

			});

			blink.enable = tmpBlink
			if (document.getElementById("emoMaker")) {
				document.getElementById("emoMaker").remove();
			}
		});

		$("#maker_material").one('click', function() {
			$("#maker_exit").click()
			VRoid.three.materialChecker(modelID)
		});

		$(".maker_range").on('change input', function() {
			const val = $(this).val();
			const id = ($(this).attr('id')).replace("maker_range_", "");
			$("#maker_text_" + id).html(val);
			if (Number(val) > 0) {
				$("#maker_text_" + id).css("background", "rgba(64,255,255,0.3)")
			} else {
				$("#maker_text_" + id).css("background", "rgba(0,0,0,0)")
			}
			
			vrm.expressionManager.setValue(arr[id], val);
			vrm.expressionManager.update()
			/*
			arr.forEach((data, i) => {
				const v = $("#maker_range_" + i).val();
				vrm.expressionManager.setValue(data, v);
			});
			*/
		});

		$(".maker_fav").on('click', function() {
			const val = $(this).text();
			if (val == "☆") {
				$(this).text("★").css("color", "yellow");
				TYRANO.kag.evalScript("sf.__emoMaker." + modelID + "." + $(this).attr('id') + " = true");
			} else {
				$(this).text("☆").css("color", "");
				TYRANO.kag.evalScript("sf.__emoMaker." + modelID + "." + $(this).attr('id') + " = false");
			}
		});

	}

	//マテリアルの表示非表示確認用
	VRoid.three.materialChecker = function (modelID) {

		//あったら閉じる
		$("#maker_exit").click()
		$("#checker_exit").click()

		const statVRoid = TYRANO.kag.stat.VRoid;
		const saveMaterial = statVRoid.model[modelID].material;

		const fontColor = "font-weight: bold; color: #000; text-shadow:rgb(255, 255, 255) 0px 2px,rgb(255, 255, 255) 0px -2px,rgb(255, 255, 255) 1px 2px,rgb(255, 255, 255) 1px -2px,rgb(255, 255, 255) 2px 0px,rgb(255, 255, 255) 2px 1px,rgb(255, 255, 255) 2px 2px ,rgb(255, 255, 255) 2px -1px,rgb(255, 255, 255) 2px -2px,rgb(255, 255, 255) -1px 2px,rgb(255, 255, 255) -1px -2px,rgb(255, 255, 255) -2px 0px,rgb(255, 255, 255) -2px 1px,rgb(255, 255, 255) -2px 2px,rgb(255, 255, 255) -2px -1px,rgb(255, 255, 255) -2px -2px;"

		html = "<div id='materialChecker' style='font-size: 20px; position: absolute; z-index: 9000000001; top: 0; left: 0; width: 320px; height: 100%;'>" +
				"<div style='z-index: 10; position: absolute; top: 0; left: 0; width: 285px; height: 78px; padding-right: 35px; padding-top: 10px; text-align: right; background-color: rgba(255, 255, 255, 0.5); line-height: 34px;'>" +
					"<button id='checker_emo' type='button' style='cursor: pointer;'>エモーション</button>　" +
					"<button id='checker_reset' type='button' style='cursor: pointer;'>リセット</button>　" +
					"<button id='checker_exit' type='button' style='cursor: pointer;'>閉じる</button><br>" +
					"<label for='checker_outline_sync' style='cursor: pointer; margin-left: 50px; font-size: 16px; line-height: 50px;'><input type='checkbox' id='checker_outline_sync' class='checker_outline_sync' name='checker_outline_sync'  style='position: relative;top: 2px;' checked> アウトライン同期</label>" +
				"</div>" +
				"<div style='position: absolute; z-index: 10; top: 90px; left: 0; width: 320px; height: calc(100% - 90px); background-color: rgba(255, 255, 255, 0.5); overflow-y: scroll;'>"

				for (const key in saveMaterial) {
					const id = saveMaterial[key].id
					html += "<div id='VRoid_test_materials_div_" + id + "' class='VRoid_test_materials_div' data-name='" + key + "'>"
						+ "<span class='maker_fav' style='cursor: pointer; display: inline-block; height: 1em; line-height: 1em; width: 1em; margin: 0 6px 0 10px; font-size: 16px; transform: translateY(-8px); text-align: right;'>" + id + "</span>"
						+ "<textarea readonly rows='1' style='white-space: nowrap; overflow: hidden; resize: none;width: 220px;padding: 5px 10px; font-size: 14px; margin-top: 20px; margin-left: 5px; background:rgba(0,0,0,0); border: 2px solid rgba(255,255,255,0.5); border-radius: 6px;" + fontColor +"' title='" + key + "'>" + key + "</textarea><br>"
					
						if (saveMaterial[key].visible) {
							html += "<label for='VRoid_test_materials_" + id + "' style='cursor: pointer; margin-left: 40px;'><input type='checkbox' id='VRoid_test_materials_" + id + "' class='VRoid_test_materials' name='materials_" + id + "'  style='position: relative;top: 2px;' checked> 表示　</label><span style='font-size: 8px;'>ここにテクスチャーファイルをドロップ</span><br>"
						} else {
							html += "<label for='VRoid_test_materials_" + id + "' style='cursor: pointer; margin-left: 40px;'><input type='checkbox' id='VRoid_test_materials_" + id + "' class='VRoid_test_materials' name='materials_" + id + "'  style='position: relative;top: 2px;'> 表示　</label><span style='font-size: 8px;'>ここにテクスチャーファイルをドロップ</span><br>"
						}
						
						html += "</div>"

				}

			html += "<br></div></div>"

		if (document.getElementById("materialChecker")) {
			document.getElementById("materialChecker").remove();
		}
		$("#tyrano_base").append(html);

		$("#materialChecker").on('touchmove wheel', (e) => {
			e.stopPropagation();
		});
		
		outline_sync()

		$("#checker_exit").one('click', function() {
			if (document.getElementById("materialChecker")) {
				document.getElementById("materialChecker").remove();
			}
		});

		$("#checker_emo").one('click', function() {
			$("#checker_exit").click()
			VRoid.three.emoMaker(modelID)
		});

		$("#checker_reset").on('click', function() {
			VRoid.three.material(modelID, null, true)
			$(".VRoid_test_materials").each(function() {
				const val = document.getElementById($(this).attr('id'));
				val.checked = true;
			});
		});

		$(".VRoid_test_materials").on('click', function() {
			const id = ($(this).attr('id')).replace("VRoid_test_materials_", "");
			const val = document.getElementById($(this).attr('id'));

			
			if (document.getElementById("checker_outline_sync").checked) {
				VRoid.three.material(modelID, id, val.checked, true)
				console.log("[VRoid_material modelID=" + modelID + " materialID=" + id + " visible=" + val.checked + "]")
			
			} else {
				VRoid.three.material(modelID, id, val.checked, false)

				//次のデータにアウトラインがない時はoutline=falseがいらない
				const name = $("#VRoid_test_materials_div_" + (id + 1)).data('name')
				if (name && name.endsWith(" (Outline)")) {
					console.log("[VRoid_material modelID=" + modelID + " materialID=" + id + " visible=" + val.checked + " outline=false]")
				} else {
					console.log("[VRoid_material modelID=" + modelID + " materialID=" + id + " visible=" + val.checked + "]")
				}

			}

		});

		$("#checker_outline_sync").on('click', function() {
			outline_sync()
		});
		
		function outline_sync () {
			let visible = "block"
			if (document.getElementById("checker_outline_sync").checked) {
				visible = "none"
			}
			for (const key in saveMaterial) {
				const id = saveMaterial[key].id
				
				if (key.endsWith(" (Outline)")) $("#VRoid_test_materials_div_" + id).css("display", visible)
			}
			
		}


		$(".VRoid_test_materials_div").on("dragover", function (event) {
			event.preventDefault(); //これがないとdropイベントが発火しない
			$(this).css("background-color", "#f0f0f0");
		});

		$(".VRoid_test_materials_div").on("dragleave", function () {
			$(this).css("background-color", "");
		});

		$(".VRoid_test_materials_div").on("drop", function (event) {
			event.preventDefault();

			let files = event.originalEvent.dataTransfer.files;
			if (files.length > 0) {
				let file = files[0]; // 最初のファイルを取得
				let blob = file; // File は Blob を継承しているためそのまま渡せる

				// changeTexture を呼び出す
				VRoid.three.changeTextureBlob(modelID, blob, $(this).data('name'))
			}
			$(this).css("background-color", "");

		});

	}

})();
