window.VRoid = {};

//インポートしたファイルにはキャッシュ対策が施されていないため、ライブラリアップデート時には注意すること

import * as THREE from './module/three/three.module.min.js';
import { GLTFLoader } from './module/three/loaders/GLTFLoader.js';

import { EffectComposer } from './module/three/postprocessing/EffectComposer.js';
import { OutlinePass } from './module/three/postprocessing/OutlinePass.js';
import { RenderPass } from './module/three/postprocessing/RenderPass.js';
import { ShaderPass } from './module/three/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from './module/three/shaders/GammaCorrectionShader.js';

import { VRMLoaderPlugin, VRMUtils, VRMHumanBoneName, VRMExpression, VRMExpressionMorphTargetBind, VRMHumanBoneList } from './module/three-vrm/three-vrm.module.min.js';

(function(){
	//セーブデータ用のオブジェクト
	TYRANO.kag.stat.VRoid = {
		layer:{},
		model:{},
		img:{},
		module:{}
	};

	VRoid.three = {
		layer:{},
		model:{},
		img:{},
		vrma: {},
		fbx: {},
		animType: {},
		animEmo: {},
		isWebglcontextlost: false,
		isRestoringContext: false,
		restoreRetryTimeoutId: 0,
		restoreRunTimeoutId: 0,
		restoreLoadTimeoutId: 0,

		clearRestoreTimers: function () {
			clearTimeout(this.restoreRetryTimeoutId);
			clearTimeout(this.restoreRunTimeoutId);
			clearTimeout(this.restoreLoadTimeoutId);
			this.restoreRetryTimeoutId = 0;
			this.restoreRunTimeoutId = 0;
			this.restoreLoadTimeoutId = 0;
		},

		cancelRestore: function () {
			this.clearRestoreTimers();
			this.isWebglcontextlost = false;
			this.isRestoringContext = false;
			const loadingMask = document.getElementById("VRoid_loading_mask2");
			if (loadingMask) {
				loadingMask.remove();
			}
		},


		test: function (pm) {

		},

		//表示レイヤーの作成
		// VRoid.three.create()
		create: function (pm) {

			const {
				layerID,
				layer = "0",
				name = "",
				zindex = 10,
				visible = true,
				antialias = true,
				samples = 4,
				quality = 1.25,
				lightType = "directional",
				limitFPS = false,
				perspective = true,
				fov = 30,
				near = 0.01,
				far = 100,
				highLight = 0.3141592653589793,
				useWebGL2 = true,
				showFPS = true,
				screenshot = true,

				x = 0,
				y = 0,
				z = 0,
				rotX = 0,
				rotY = 0,
				rotZ = 0,
				scaleX = 1,
				scaleY = 1,
				scaleZ = 1,
				zoom = 1,

				width = 0,
				height = 0,
				top = 0,
				left = 0,
			} = pm;


			//WebGL1のみ環境テスト用
			const WebGL1Test = false
			if (WebGL1Test) console.warn("WebGL1Test")
		
			if (document.getElementById(layerID)) {
				this.error(layerID + " 同一IDのレイヤーは作成できません。")
				return
			}

			//オブジェクトの初期化
			const thisLayer = this.layer[layerID] = {};
			thisLayer.layerID = layerID;

			//セーブデータ用のオブジェクトを作成
			const statVRoid = TYRANO.kag.stat.VRoid;
			pm.type = "layer"
			if (!statVRoid.layer[layerID]) statVRoid.layer[layerID] = $.extend(true,{}, pm);
			const saveLayer = statVRoid.layer[layerID];

			// シーンの準備
			const scene = thisLayer.scene = new THREE.Scene()
			scene.name = scene.layerID = layerID;

			// ライトの設定 AmbientLight or DirectionalLight
			//ライトのセーブデータがなければ初期化
			if (!saveLayer.light) {
				saveLayer.light = {
					layerID: layerID,
					r: 1,
					g: 1,
					b: 1,
					x: 0,
					y: 0,
					z: -1,
					val: 1,	//Math.PIをかける前の数字を設定
				};
			}
			
			const saveLight = saveLayer.light
			if (lightType == "ambient") {
				thisLayer.light = new THREE.AmbientLight(0xffffff)
			} else {
				thisLayer.light = new THREE.DirectionalLight(0xffffff)
			}
			const lightObj = thisLayer.light
			lightObj.position.set(saveLight.x, saveLight.y, saveLight.z).normalize()
			lightObj.intensity = saveLight.val * Math.PI
			scene.add(lightObj)
			scene.add(lightObj.target);
			
			//霧を表示させるテスト(色, 開始距離, 終点距離)
			//scene.fog = new THREE.Fog(0xffffff, -1, 10);

			const scWidth = thisLayer.scWidth = width || Number(TYRANO.kag.config.scWidth)
			const scHeight = thisLayer.scHeight = height || Number(TYRANO.kag.config.scHeight)
			const aspect = scWidth / scHeight

			// カメラの準備
			if (perspective) {
				thisLayer.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
			} else {
				thisLayer.camera = new THREE.OrthographicCamera((fov * aspect) / -100, (fov * aspect) / 100, fov / 100, fov / -100, near, far);
			}
			
			const camera = thisLayer.camera
			camera.position.set(x, y, z)
			camera.rotation.set(rotX, rotY, rotZ)
			camera.scale.set(scaleX, scaleY, scaleZ)
			camera.zoom = zoom
			camera.updateProjectionMatrix()

			// レンダラーの準備
			if (!useWebGL2 || WebGL1Test) {
				thisLayer.renderer = new THREE.WebGL1Renderer({ antialias: false, alpha: true, preserveDrawingBuffer: screenshot, powerPreference: 'high-performance' })
			} else {
				//GL2はここでantialiasをかけない
				thisLayer.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: screenshot, powerPreference: 'high-performance' })
			}
			const renderer = thisLayer.renderer

			//パフォーマンス警告を表示させない
			renderer.debug.checkShaderErrors = false
			renderer.setSize(scWidth, scHeight)
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			renderer.setClearColor(0x000000, 0);

			//renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
			//renderer.useLegacyLights = true

			// レンダラーに指定した属性を付与
			const domElement = renderer.domElement;
			domElement.id = layerID;
			domElement.classList.add(layerID, "VRoidCanvasLayer");

			domElement.style.position = "absolute";
			domElement.style.zIndex = zindex;
			domElement.style.pointerEvents = "none";
			domElement.style.top = top + "px";
			domElement.style.left = left + "px";

			//WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost　対策
			domElement.removeEventListener("webglcontextlost", this.webglcontextlost);
			domElement.addEventListener("webglcontextlost", this.webglcontextlost);

			//レイヤーを追加
			TYRANO.kag.layer.getLayer(layer).append(domElement);

			//name指定があったらclassを追加
			//animタグが使用できるようになるがセーブデータには反映されない為、隠しオプション
			if (name) $.setName($("#" + layerID), name)

			//composerのセットアップ
			const isWebGL2Available = () => {
				try {
					return !!window.WebGL2RenderingContext && document.createElement('canvas').getContext('webgl2');
				} catch (e) {
					return false;
				}
			};

			const renderTargetOptions = {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				colorSpace: THREE.SRGBColorSpace,
			}
			if (antialias && isWebGL2Available() && !WebGL1Test) renderTargetOptions.samples = samples

			const renderTarget = thisLayer.renderTarget = new THREE.WebGLRenderTarget(1, 1, renderTargetOptions)
			const composer = thisLayer.composer = new EffectComposer(renderer, renderTarget);
			composer.setSize(scWidth, scHeight)

			const fadePass = thisLayer.fadePass = new ShaderPass({
				uniforms: {
					'tDiffuse': { value: null },
					'opacity': { value: 1.0 }
				},
				vertexShader: `
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
				`,
				fragmentShader: `
					uniform float opacity;
					uniform sampler2D tDiffuse;
					varying vec2 vUv;

					void main() {
						gl_FragColor = linearToOutputTexel(texture2D( tDiffuse, vUv )) * opacity;
					}
				`
			});
			const opacity = fadePass.uniforms.opacity

			if (!visible) {
				opacity.value = 0;
			} else {
				opacity.value = 1;
			}

			composer.addPass( new RenderPass(scene, camera) );
			composer.addPass(fadePass);
			const passes = composer.passes;

			//オフスクリーンレンダリング用
			//ここを通さないと透過PNGの透過度に問題が出る
			const fadeMaterial = new THREE.ShaderMaterial({
				uniforms: {
					tDiffuse: { value: renderTarget.texture },
					'opacity': { value: 1.0 }
				},
				vertexShader: `
					varying vec2 vUv;
					void main() {
						vUv = uv;
						gl_Position = vec4(position, 1.0);
					}
				`,
				fragmentShader: `
					uniform float opacity;
					uniform sampler2D tDiffuse;
					varying vec2 vUv;

					void main() {
						gl_FragColor = linearToOutputTexel(texture2D(tDiffuse, vUv)) * opacity;
					}
				`
			});

			//opacityをfadePassと同期
			fadeMaterial.uniforms.opacity = opacity
			const fadeQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeMaterial);
			//fadeQuad.frustumCulled = false;
			fadeMaterial.depthWrite = false;
			fadeMaterial.depthTest = false;
			fadeMaterial.transparent = true;

			const fadeScene = thisLayer.fadeScene = new THREE.Scene();
			fadeScene.add(fadeQuad);
			const fadeCamera = thisLayer.fadeCamera = new THREE.Camera();

			// アニメーションループの開始
			let halfFPS = true;
			let zeroCount = 0

			const clock = new THREE.Clock();
			const thisModel = this.model

			//動的にPixelRatioを更新する
			let tmpRatio
			//何フレームごとに更新をチェックするか
			const updateRatioVal = 30
			let countRatio = updateRatioVal
			//最低レートはdevicePixelRatioに1以下のqualityから算出。大抵の場合は1になる
			const minRatio = Math.min(1, window.devicePixelRatio) * Math.min(1, quality)
			//4k対応xquality
			const maxRatio = 3 * quality
			//ベースとなる解像度の割合
			const baseWidth = scWidth / window.devicePixelRatio / quality

			//ウインドウサイズ計測用の要素を作成する
			if (!document.getElementById("VRoidBoundingClientRect")) $("#tyrano_base").append("<div id='VRoidBoundingClientRect' style='position: absolute; z-index: -1; top: 0; left: 0; width: " + scWidth + "px'></div>")
			const boundingClientRect = document.getElementById("VRoidBoundingClientRect")
			const that = this;

			thisLayer.tick = function () {

				//restoreが必要な場合
				if (that.isWebglcontextlost) {
					that.restore()
					return
				}

				if (thisLayer) {

					if (that.visibilitychange !== true) {
						thisLayer.tickID = requestAnimationFrame(thisLayer.tick)
					} else {
						thisLayer.visibilitychangeID = setTimeout(thisLayer.tick, 100)
					}

					if (limitFPS && (halfFPS = !halfFPS)) return;

					//FPS計測
					if (thisLayer.stats) thisLayer.stats.begin();

					//30フレームに1回PixelRatioの更新を確認
					if (++countRatio > updateRatioVal) {
						countRatio = 0;
						//getBoundingClientRectが取得できないときは処理しない
						const ClientRect = boundingClientRect.getBoundingClientRect().width
						if (ClientRect) {
							const ratio = Math.max(minRatio, Math.min(maxRatio, ClientRect / baseWidth))
							if (tmpRatio !== ratio) {
								tmpRatio = ratio
								renderer.setPixelRatio(ratio)
								composer.setPixelRatio(ratio)
							}
						}
					}

					//モデルの更新
					const delta = clock.getDelta();
					const elapsedTime = clock.elapsedTime;
					for (const modelID in thisModel) {
						const model = thisModel[modelID];
						if (model.layerID === layerID) model.tick(delta, elapsedTime);
					}

					//レンダーの更新
					if (opacity.value == 1) {
						if (fadePass.enabled) fadePass.enabled = false
						zeroCount = 0

						if (passes.length < 3) {
							renderer.setRenderTarget(renderTarget);
							renderer.render(scene, camera);

							renderer.setRenderTarget(null);
							renderer.render(fadeScene, fadeCamera);

						} else {
							composer.render()
						}

					} else if (opacity.value !== 0 || zeroCount <= 30) {
						if (opacity.value !== 0) {
							zeroCount = 0
						} else {
							zeroCount++
						}

						if (passes.length < 3) {
							if (fadePass.enabled) fadePass.enabled = false
							renderer.setRenderTarget(renderTarget);
							renderer.render(scene, camera);

							renderer.setRenderTarget(null);
							renderer.render(fadeScene, fadeCamera);

						} else {
							if (!fadePass.enabled) fadePass.enabled = true
							composer.render()
						}
					}

					if (thisLayer.stats) thisLayer.stats.end();

				} else {
					//idが存在しない場合は処理を終了し、オブジェクトを削除する。
					VRoid.three.dispose(layerID)
				}
			}
			thisLayer.tick()
			
			if (showFPS) this.showFPS(layerID)
			
		},

		// VRoid.three.forceRenderUpdate("VRoid")
		forceRenderUpdate: function (layerID) {
			const thisLayer = this.layer[layerID]
		
			if (thisLayer.composer.passes.length < 3) {
				thisLayer.renderer.setRenderTarget(thisLayer.renderTarget);
				thisLayer.renderer.render(thisLayer.scene, thisLayer.camera);

				thisLayer.renderer.setRenderTarget(null);
				thisLayer.renderer.render(thisLayer.fadeScene, thisLayer.fadeCamera);

			} else {
				thisLayer.composer.render()
			}
		},

		//VRoid.three.layer_move( {layerID:"VRoid", x=100, time: 1000} )
		layer_move: function (pm, cb) {

			const {
				layerID,
				top,
				left,
				time = 0,
				wait = true,
				skip = false,
				easing = "default",

			} = pm;

			const thisLayer = this.layer[layerID]
			const domElement = document.getElementById(layerID)
			if (thisLayer === undefined || !domElement ) {
				if (cb && typeof cb === 'function') cb()
				return
			}

			const style = domElement.style

			//開始時の状態を保存
			const startVal = {
				top: parseInt(style.top) || 0,
				left: parseInt(style.left) || 0,
			}

			//セーブデータ
			const tStat = TYRANO.kag.stat;
			const saveData = tStat.VRoid.layer[layerID];

			//終了時の状態を保存
			const endVal = {
				top: createTarget(top, saveData.top),
				left: createTarget(left, saveData.left),
			}

			//セーブデータに保存
			saveData.top = endVal.top
			saveData.left = endVal.left


			//先に計算できる値をキャッシュ
			const moveTop = endVal.top - startVal.top
			const moveLeft = endVal.left - startVal.left

			const hasTop = moveTop !== 0
			const hasLeft = moveLeft !== 0

			cancelAnimationFrame(thisLayer.moveTickID)
			const easingFunc = this.easing[easing];
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1
				
				const val = easingFunc(progress);
				
				if (hasTop) style.top = (val * moveTop + startVal.top) + "px"
				if (hasLeft) style.left = (val * moveLeft + startVal.left) + "px"

				if (progress < 1) {
					thisLayer.moveTickID = requestAnimationFrame(tick);
				} else {
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			tick(startTime);

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()


			function createTarget(val, initialVal = 0) {
				
				//変更する値がない場合は現在値(セーブ値)を返す
				if (val === undefined) return initialVal
			
				//先頭2文字を取得
				const str = String(val).slice(0, 2);
				const tmpVal = Number(String(val).slice(2))
				let endVal;

				if (str == "+=") {
					endVal = initialVal + tmpVal
				} else if (str == "-=") {
					endVal = initialVal - tmpVal
				} else if (str == "*=") {
					endVal = initialVal * tmpVal
				} else if (str == "/=") {
					//0除算回避
					if ( tmpVal !== 0 ) {
						endVal = initialVal / tmpVal
					} else {
						endVal = 0
					}
				} else if (str == "%=") {
					endVal = initialVal % tmpVal
				} else {
					//いずれでもない場合は数字のはず
					endVal = Number(val)
				}
				
				return endVal;
			}

		},

		//VRoid.three.light({layerID:"VRoid", x:1, time:1000})
		light: function (pm, cb) {

			const {
				layerID,
				r,
				g,
				b,
				x,
				y,
				z,
				targetX,
				targetY,
				targetZ,
				val,
				time = 0,
				wait = true,
				skip = false,
				easing = "default",
			} = pm;

			const thisLayer = this.layer[layerID];
			
			if (thisLayer === undefined) {
				//そんなレイヤーは存在しない
				if (cb && typeof cb === 'function') cb()
				return
			}
			
			const light = thisLayer.light


			//開始時の状態を保存
			const startVal = {
				r: light.color.r,
				g: light.color.g,
				b: light.color.b,
				x: light.position.x,
				y: light.position.y,
				z: light.position.z,
				val: light.intensity !== 0 ? light.intensity / Math.PI : 0,
			}

			//セーブデータ
			const tStat = TYRANO.kag.stat
			const saveLayer = tStat.VRoid.layer[layerID];
			const saveData = saveLayer.light

			//終了時の状態を保存
			const endVal = {
				r: createTarget(r, saveData.r || 1),
				g: createTarget(g, saveData.g || 1),
				b: createTarget(b, saveData.b || 1),
				x: createTarget(x, saveData.x || 0),
				y: createTarget(y, saveData.y || 0),
				z: createTarget(z, saveData.z || 0),
				targetX: createTarget(targetX, saveData.targetX || 0),
				targetY: createTarget(targetY, saveData.targetY || 0),
				targetZ: createTarget(targetZ, saveData.targetZ || 0),
				val: createTarget(val, saveData.val || 1),
			}

			//target追加対応
			if (light.target) {
				startVal.targetX = light.target.position.x
				startVal.targetY = light.target.position.y
				startVal.targetZ = light.target.position.z
				endVal.targetX = createTarget(targetX, saveData.targetX || 0)
				endVal.targetY = createTarget(targetY, saveData.targetY || 0)
				endVal.targetZ = createTarget(targetZ, saveData.targetZ || 0)
			}

			//セーブデータに保存
			for (const key in endVal) {
				saveData[key] = endVal[key]
			}
			saveData.layerID = layerID

			cancelAnimationFrame(thisLayer.lightTickID)
			const easingFunc = this.easing[easing];
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1
				
				const value = easingFunc(progress);

				const valR = startVal.r + (endVal.r - startVal.r) * value
				const valG = startVal.g + (endVal.g - startVal.g) * value
				const valB = startVal.b + (endVal.b - startVal.b) * value
				light.color.set(valR, valG, valB)

				light.position.set (
					startVal.x + (endVal.x - startVal.x) * value,
					startVal.y + (endVal.y - startVal.y) * value,
					startVal.z + (endVal.z - startVal.z) * value
				)
				
				if (light.target) {
					light.target.position.set (
						startVal.targetX + (endVal.targetX - startVal.targetX) * value,
						startVal.targetY + (endVal.targetY - startVal.targetY) * value,
						startVal.targetZ + (endVal.targetZ - startVal.targetZ) * value
					)
				}

				const intensityVal = startVal.val + (endVal.val - startVal.val) * value
				light.intensity = intensityVal * Math.PI

				//髪のハイライト処理
				for (const modelID in this.model) {
					const model = this.model[modelID]
					if (model.vrm && model.layerID === layerID) {
						model.vrm.scene.traverse((obj) => {
							if (obj.isMesh && obj.material && obj.name.includes('Hair')) {
								obj.material.emissiveIntensity = intensityVal * saveLayer.highLight * Math.PI
							}
						});
					}
				}

				//追加したメッシュの色合い変更
				for (const key in this.img) {
					const mesh = this.img[key]
					if (mesh.layerID === layerID) {
						mesh.material.color.r = valR * intensityVal
						mesh.material.color.g = valG * intensityVal
						mesh.material.color.b = valB * intensityVal
					}
				}

				if (progress < 1) {
					thisLayer.lightTickID = requestAnimationFrame(tick);
				} else {
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			tick(startTime);

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()


			function createTarget(value, initialVal) {
				//ないものはない
				if (initialVal === undefined) return undefined
				
				//変更する値がない場合は現在値(セーブ値)を返す
				if (value === undefined) return initialVal
			
				//先頭2文字を取得
				const str = String(value).slice(0, 2);
				const tmpVal = Number(String(value).slice(2))
				let endVal;

				if (str == "+=") {
					endVal = initialVal + tmpVal
				} else if (str == "-=") {
					endVal = initialVal - tmpVal
				} else if (str == "*=") {
					endVal = initialVal * tmpVal
				} else if (str == "/=") {
					//0除算回避
					if ( tmpVal !== 0 ) {
						endVal = initialVal / tmpVal
					} else {
						endVal = 0
					}
				} else if (str == "%=") {
					endVal = initialVal % tmpVal
				} else {
					//いずれでもない場合は数字のはず
					endVal = Number(value)
				}
				
				return endVal;
			}
		},

		// jsonのimport カンマ区切りで複数一気に読み込める
		// VRoid.three.import("sample.json", null, "_emotion")
		// VRoid.three.import("usamimi.json", null, "_pose")
		// VRoid.three.import("usamimi2.json", null, "_pose")
		import: function (storage, cb, property) {
			const storageArr = storage.split(',');
			const promises = [];
			
			const emotionObj = this.emotionObj
			const poseJson = this.poseJson
			const animEmoJson = this.animEmo

			storageArr.forEach(function(file) {
				file = file.trim();

				// 先頭が./なら削除
				if (file.startsWith("./")) {
					file = file.substring(2);
				}

				// 拡張子を削除してnameにする
				let name;
				const dotIndex = file.lastIndexOf(".");

				// .以降を削除
				if (dotIndex >= 0) {
					name = file.substring(0, dotIndex);
				} else {
					name = file;
				}

				const promise = new Promise(function(resolve, reject) {
					$.getJSON("./data/others/plugin/vrm/" + property + "/" + file).done(function(json) {

						if (property == "_emotion") {
							//表情データの追加
							const expressions = Object.keys(json).map(key => ({
								expressionName: key,
								val: json[key]
							}));

							emotionObj[name] = expressions;

						} if (property == "_pose") {
							//ポーズデータの追加
							//お手軽ポーズのバージョンによってインポート処理を変更する
							if (json.pose) {
								poseJson[name] = json.pose;
								Object.keys(poseJson[name]).forEach((key) => {
									if (poseJson[name][key].rotation) {
										poseJson[name][key].rotation[0] = poseJson[name][key].rotation[0] * (-1)
										poseJson[name][key].rotation[2] = poseJson[name][key].rotation[2] * (-1)
									}
								});
							} else {
								poseJson[name] = json;
							}
							//かけてるパーツがある場合は初期値で補完
							Object.keys(VRMHumanBoneList).forEach((key) => {
								const parts = VRMHumanBoneList[key]
								if (!poseJson[name][parts]) {
									poseJson[name][parts] = {rotation: [0, 0, 0, 1]}
								}
							});
							
							/*
							//デバッグ比較用
							function sortObjectKeys(obj) {
								// オブジェクトのキーをソート
								const sortedKeys = Object.keys(obj).sort();
							    
								// ソートされたキー順に新しいオブジェクトを作成
								const sortedObj = {};
								sortedKeys.forEach(key => {
									sortedObj[key] = obj[key];
								});
							    
								return sortedObj;
							}
							console.log(JSON.stringify(sortObjectKeys(poseJson[name])))
							*/
						} if (property == "_animEmo") {
							//アニメーション用タイムラインを追加
							const timeline = Object.keys(json).map(key => ({
								expressionName: key,
								val: json[key]
							}));

							animEmoJson[name] = json;
						
						}

						resolve();
					}).fail(function(err) { 
						VRoid.three.error(storage + " ファイルが存在しないか、jsonファイルの記述が間違っています。", err);
						resolve();
					});
				});

				promises.push(promise);
			});

			// 全ての処理が終了後にnextorder
			Promise.all(promises).then(function() {
				const statVRoid = TYRANO.kag.stat.VRoid;

				if (property == "_emotion") {
					//表情データのセーブ
					statVRoid["emotionObj"] = $.extend(true,{}, emotionObj);

				} if (property == "_pose") {
					//ポーズデータのセーブ
					statVRoid["poseJson"] = $.extend(true,{}, poseJson);

				} if (property == "_animEmo") {
					//ポーズデータのセーブ
					statVRoid["_animEmo"] = $.extend(true,{}, animEmoJson);

				}
				if (cb && typeof cb === 'function') cb()
			});
		},


		//ロード時の設定やレイヤー復元
		statLoad: function (cb) {
			const statVRoid = TYRANO.kag.stat.VRoid;

			if (statVRoid.emotionObj) {
				this.emotionObj = $.extend(true,{}, statVRoid.emotionObj);
			}
			
			if (statVRoid.poseJson) {
				this.poseJson = $.extend(true,{}, statVRoid.poseJson);
			}

			if (statVRoid.anim) {
				statVRoid.anim.forEach(function(storage) {
					VRoid.three.importAnimation(storage)
				});
			}


			//VRoidCanvasLayerを全部削除する
			const canvasLayer = document.getElementsByClassName("VRoidCanvasLayer");
			const arr = Array.from(canvasLayer);

			arr.forEach(function(elem) {
				elem.parentNode.removeChild(elem);
			});
			
			//moduleのロード
			for (const key in statVRoid.module) {
				this.importModule("import", [key])
			}

			// モデルをロードしてから復元する
			if (statVRoid) {

				for (const key in this.layer) {
					delete this.layer[key]
				}
				for (const key in this.model) {
					delete this.model[key]
				}
				for (const key in this.img) {
					delete this.img[key]
				}

				// レイヤーの復元
				const layerPromises = Object.entries(statVRoid.layer).map(([layerID, saveLayer]) => {
					return new Promise((resolve) => {
						this.create(saveLayer);

						//ライトの復元
						this.light(saveLayer.light)

						//カメラ設定の復元
						this.move(saveLayer);

						//レイヤーに表示するメッシュの復元
						for (const key in statVRoid.img) {
							const saveImg = statVRoid.img[key]
							if (saveImg.layerID === layerID) {
								this.add_img(saveImg)
							}
						}
						
						//エフェクトをかけた順番に復元
						if (saveLayer.effect) {
							const tmpEffect = saveLayer.effect.concat();
							tmpEffect.forEach((number) => {
								this.effect(layerID, number.name, number.option)
							});
						}

						resolve();
					});
				});

				// レイヤーの復元が終わるまで待つ
				Promise.all(layerPromises).then(() => {
					// モデルをロードしてからシーンの復元をする
					const modelPromises = Object.entries(statVRoid.model).map(([modelID, modelData]) => {
						return new Promise((resolve, reject) => {
							this.load(modelID, modelData.file, async () => {
								try {
									await loadVRoid(modelID);
									resolve();
								} catch (error) {
									reject(error);
								}
							}, true);
						});
					});

					// モデルの復元が終わるまで待つ
					Promise.all(modelPromises)
						.then(() => {
							if (cb && typeof cb === 'function') cb(true)
						})
						.catch((error) => {
							that.error("VRoidモデルの復元に失敗しました", error);
							if (cb && typeof cb === 'function') cb(false, error)
						});
				});
			}

			const that = this;
			
			async function loadVRoid (modelID) {
				//シーンの復元
				const saveModel = TYRANO.kag.stat.VRoid.model[modelID];
				const model = that.model[modelID]
				const vrm = model.vrm;
				const expressionManager = vrm.expressionManager

				if (saveModel.layerID) {
					// シーンへの追加
					that.add(saveModel)

					//モデルシーンの復元(addに統合)
					//that.move(saveModel)

					//表情の復元
					// 各ブレンドシェイプを適用
					if (saveModel.expression) {
						saveModel.expression.forEach(function (data) {
							let expressionName = data.expressionName;
							let currentValue = data.val;

							expressionManager.setValue(expressionName, currentValue);
						});
					}

					expressionManager.update();

					//LOOP状態のactionの復元
					if (saveModel.mixer && !saveModel.mixer.keep) {
						//ループの場合はこちらから表情復元
						expressionManager.resetValues()
						if (saveModel.mixer.expression) {
							saveModel.mixer.expression.forEach(function (data) {
								let expressionName = data.expressionName;
								let currentValue = data.val;

								expressionManager.setValue(expressionName, currentValue);
							});
						} else {
							//存在しない場合はリセット
							delete saveModel.expression
						}
						
						//actionPoseが残っていたら復元してからアニメーション
						if (saveModel.actionPose) vrm.humanoid.setNormalizedPose(saveModel.actionPose)
						
						//旧バージョンではmodelIDが入っていない為、互換で代入
						saveModel.mixer.modelID = modelID
						//旧バージョンではstorageを使用していたためnameに変換
						if (saveModel.mixer.storage) {
							saveModel.mixer.name = saveModel.mixer.storage
							delete saveModel.mixer.storage
						}
						if (saveModel.mixer.duration) {
							saveModel.mixer.startTime = saveModel.mixer.duration
							delete saveModel.mixer.duration
						}
						saveModel.mixer.loop = 0
						await that.animation(saveModel.mixer)
						model.mixer.update( 10000 );
						vrm.update( 10000 );

					}
					
					//KEEP状態のactionの復元
					if (saveModel.mixer && saveModel.mixer.keep) {
						//actionPoseが残っていたら復元してからアニメーション
						if (saveModel.actionPose) vrm.humanoid.setNormalizedPose(saveModel.actionPose)

						//旧バージョンではmodelIDが入っていない為、互換で代入
						saveModel.mixer.modelID = modelID
						if (saveModel.mixer.duration) {
							saveModel.mixer.startTime = saveModel.mixer.duration
							delete saveModel.mixer.duration
						}
						await that.animation(saveModel.mixer)
						model.mixer.update( 10000 );
						vrm.update( 10000 );

					}
					
					//saveModel.keepPoseがあれば復元
					if (saveModel.keepPose) {
						vrm.humanoid.setNormalizedPose(saveModel.keepPose)
						//待機モーションの再設定
						model.waitingClock.start()
						that.saveWaitingAnimationVal(model.waitingBone, model.waitingAnimationVal)
						vrm.update( 10000 );
					}
				}
			}

		},


		//表示レイヤーの破棄
		// VRoid.three.dispose("VRoid")
		dispose: function (layerID, options = {}) {

			const {
				skipGlDisposal = false,
			} = options;

			this.isWebglcontextlost = false
			const statVRoid = TYRANO.kag.stat.VRoid;
		
			if (!this.layer[layerID]) {
				if (document.getElementById(layerID)) {
					document.getElementById(layerID).remove();
				}
				delete statVRoid.layer[layerID];
				if (
					Object.keys(this.layer).length === 0 &&
					Object.keys(statVRoid.layer).length === 0
				) {
					this.cancelRestore();
				}
				return
			}
		
			const scene = this.layer[layerID].scene
			const renderer = this.layer[layerID].renderer
			const composer = this.layer[layerID].composer

			//イベントの削除
			if (renderer.domElement) renderer.domElement.removeEventListener("webglcontextlost", this.webglcontextlost);

			cancelAnimationFrame(this.layer[layerID].tickID)
			cancelAnimationFrame(this.layer[layerID].layerAnimeTickID)
			cancelAnimationFrame(this.layer[layerID].moveTickID)
			clearTimeout(this.layer[layerID].visibilitychangeID)

			//レイヤーに読み込んでいるモデルを完全消去
			for (const key in this.model) {
				try {
					const modelID = this.model[key]
					if (modelID.layerID === layerID && modelID.vrm) {
						cancelAnimationFrame(modelID.tickID)
						cancelAnimationFrame(modelID.resetHipsTickID)
						cancelAnimationFrame(modelID.poseRequestId)
						cancelAnimationFrame(modelID.moveTickID)
						scene.remove( modelID.vrm.scene );
						if (!skipGlDisposal) {
							VRMUtils.deepDispose( modelID.vrm.scene );
						}
						
						delete this.model[key]
					}
				} catch (e) {}
			}

			//レイヤーに読み込んでいるメッシュを完全消去
			for (const key in this.img) {
				try {
					const mesh = this.img[key]
					if (mesh.layerID === layerID) {
						cancelAnimationFrame(mesh.tickID)
						if (!skipGlDisposal) {
							mesh.geometry.dispose();
							mesh.material.dispose();
						}
						scene.remove( mesh );

						delete this.img[key]
					}
				} catch (e) {}
			}

			if (renderer && !skipGlDisposal) {
				renderer.dispose(); // WebGLRendererを破棄
				renderer.forceContextLoss(); // WebGLコンテキストを強制解放
			}
			if (composer && !skipGlDisposal) composer.dispose();
			
			//FPSカウンターがあれば削除
			if (document.getElementById(layerID + "statsPanel")) {
				document.getElementById(layerID + "statsPanel").remove();
			}

			//レイヤーオブジェクトを破棄
			delete this.layer[layerID];

			//セーブデータの破棄
			delete statVRoid.layer[layerID];

			//canvasの削除
			if (document.getElementById(layerID)) {
				document.getElementById(layerID).remove();
			}

			if (
				!skipGlDisposal &&
				Object.keys(this.layer).length === 0 &&
				Object.keys(statVRoid.layer).length === 0
			) {
				this.cancelRestore();
			}
		},

		//表示レイヤーの表示状態の変更
		// VRoid.three.layerAnime( {layerID:"VRoid", time:1000, visible: 1} )
		layerAnime: function (pm, cb) {

			const { 
				layerID,
				time = 0,
				wait = true,
				skip = false,
				easing = "default",
				visible = 1,			//1でfadeIn 0でfadeOut
			} = pm;

			//IDの確認。なければ即終了
			if (!document.getElementById(layerID)) {
				if (cb && typeof cb === 'function') cb()
				return
			}

			//表示状態の保存
			const tStat = TYRANO.kag.stat
			const saveLayer = tStat.VRoid.layer[layerID];
			saveLayer.visible = visible;

			const thisLayer = this.layer[layerID];
			const opacity = thisLayer.fadePass.uniforms.opacity

			cancelAnimationFrame(thisLayer.layerAnimeTickID)
			const easingFunc = this.easing[easing];
			const startTime = performance.now();

			const fadeIn = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1

				opacity.value = easingFunc(progress);

				if (progress < 1) {
					thisLayer.layerAnimeTickID = requestAnimationFrame(fadeIn);
				} else {
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};

			const fadeOut = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1

				opacity.value = 1 - easingFunc(progress);

				if (progress < 1) {
					thisLayer.layerAnimeTickID = requestAnimationFrame(fadeOut);
				} else {
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};

			if (visible == 1) {
				fadeIn(startTime);
			} else {
				fadeOut(startTime);
			}

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()

		},

		
		//モデルのロード。
		// VRoid.three.load("model1", "./data/others/plugin/vrm/model/AliciaSolid.vrm")
		load: function (modelID, file, cb, wait, maker) {
			//waitのデフォルト値をセット
			if (wait === undefined) wait = true;

			if (this.model[modelID]) {
				this.error(modelID + " 同一IDのキャラクターは作成できません。")
				if (cb && typeof cb === 'function') cb()
				return
			}
			
			//モデル用セーブデータオブジェクト
			const statVRoid = TYRANO.kag.stat.VRoid;
			if (!statVRoid.model[modelID]) {
				statVRoid.model[modelID] = {};
			}
			const saveModel = statVRoid.model[modelID];
			saveModel.file = file;

			this.model[modelID] = {};
			
			const loader = new GLTFLoader();
			//loader.crossOrigin = 'anonymous';
			loader.register((parser) => {
				return new VRMLoaderPlugin(parser, { autoUpdateHumanBones: true } );
			});

			loader.load(

				// URL of the VRM you want to load
				file,

				// called when the resource is loaded
				(gltf) => {

					const model = this.model[modelID]
					model.modelID = modelID
					model.vrm = gltf.userData.vrm;
					const vrm = model.vrm

					VRMUtils.removeUnnecessaryVertices( gltf.scene );
					VRMUtils.combineSkeletons( gltf.scene ); // introduced in v3.2.0
					VRMUtils.rotateVRM0(vrm);

					//Y軸の補正を保存
					model.correctionRotateY = vrm.scene.rotation.y

					const expressionMap = {};

					vrm.scene.traverse( ( obj ) => {
						obj.frustumCulled = false;

						//透過マテリアルの減色回避
						if (obj.isMesh) {
							if (obj.material && obj.material.map) {
								obj.material.map.colorSpace = THREE.SRGBColorSpace;
								obj.material.map.minFilter = THREE.LinearFilter;
								obj.material.map.magFilter = THREE.LinearFilter;
								//obj.material.alphaToCoverage = true
							}

							//表情データの取得
							if (obj.morphTargetDictionary) {
								//for (const key in obj.morphTargetDictionary) {
								for (const key of Object.keys(obj.morphTargetDictionary)) {
									const bind = new VRMExpressionMorphTargetBind({
										index: obj.morphTargetDictionary[key],
										primitives: [obj],
										weight: 1,
									});

									if (!expressionMap[key]) {
										expressionMap[key] = new VRMExpression(key);
									}

									expressionMap[key].addBind(bind);
								}
							}
						}

					});

					// 表情データの登録
					for (const key in expressionMap) {
						vrm.expressionManager._expressionMap[key] = expressionMap[key];
						vrm.expressionManager._expressions.push(expressionMap[key]);
					}

					VRMUtils.combineMorphs( vrm ); // introduces in v3.3.0

					//debugが有効ならemoMakerを立ち上げる
					if (maker) this.emoMaker(modelID)

					//hips positionを記憶
					model.hips = vrm.humanoid.getNormalizedBoneNode('hips')
					model.hipsPos = vrm.humanoid.getNormalizedBoneNode('hips').position.clone();
					
					//風の為に揺れ物のデフォルト値を取得
					const wind = model.wind = {default:[]}
					
					//揺れ物制御を追加
					const springBoneManager = vrm.springBoneManager
					springBoneManager._enabled = true

					const origUpdate = springBoneManager.update.bind(springBoneManager);
					springBoneManager.update = (delta) => {
						if (springBoneManager._enabled) origUpdate(delta);
					};

					//揺れ物のデフォルト値を取得
					springBoneManager._objectSpringBonesMap.forEach(element => {
						element.forEach((node) => {
							wind.default.push({
								gravityDir: node.settings.gravityDir,
								gravityPower: node.settings.gravityPower
							});
							//風処理した時の補正値 0の場合はnullを入れて風処理のときに補正させない
							if (node.settings.gravityPower !== 0) { 
								node.windCorrection = node.settings.gravityDir.clone();
								node.windCorrection.multiplyScalar(node.settings.gravityPower);
							} else {
								node.windCorrection = null
							}
						});
					});

					//待機モーション用の参照
					const humanoid = vrm.humanoid
					model.waitingBone = {
						rotNeck: humanoid.getNormalizedBoneNode(VRMHumanBoneName.Neck).rotation,
						rotChest: humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest).rotation,
						rotRightShoulder: humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightShoulder).rotation,
						rotLeftUpperArm: humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm).rotation,

						rotSpine: humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine).rotation,
						rotRightUpperArm: humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm).rotation,
						rotLeftShoulder: humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftShoulder).rotation,
					}
					model.waitingAnimationVal = {}

					//if (cb && typeof cb === 'function' && wait) cb()
					//setTimeoutで呼び出さないと後続のコードのエラーまでcatchしてしまう
					if (cb && typeof cb === 'function' && wait) setTimeout(cb, 0)
					
				},
				// called while loading is progressing
				(progress) => {
					//console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%')
				},

				// called when loading has errors
				(error) => {
					VRoid.three.error("モデルデータのロード時にエラーが発生しました。")
					if (cb && typeof cb === 'function' && wait) cb()
				}
			)

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()
		},

		//待機モーションのアップデート
		updateWaitingAnimation: function (waitingBone, waitingAnimationVal, s) {
			waitingBone.rotNeck.x          = s + waitingAnimationVal.Neck
			waitingBone.rotChest.x         = s + waitingAnimationVal.Chest
			waitingBone.rotRightShoulder.z = s + waitingAnimationVal.RightShoulder
			waitingBone.rotLeftUpperArm.z  = s + waitingAnimationVal.LeftUpperArm

			const minusS = -1 * s
			waitingBone.rotSpine.x         = minusS + waitingAnimationVal.Spine
			waitingBone.rotRightUpperArm.z = minusS + waitingAnimationVal.RightUpperArm
			waitingBone.rotLeftShoulder.z  = minusS + waitingAnimationVal.LeftShoulder
		},
		
		//待機モーションの基準位置を保存する
		saveWaitingAnimationVal: function (waitingBone, waitingAnimationVal) {
			waitingAnimationVal.Neck          = waitingBone.rotNeck.x,
			waitingAnimationVal.Chest         = waitingBone.rotChest.x,
			waitingAnimationVal.Spine         = waitingBone.rotSpine.x,
			waitingAnimationVal.RightShoulder = waitingBone.rotRightShoulder.z,
			waitingAnimationVal.RightUpperArm = waitingBone.rotRightUpperArm.z,
			waitingAnimationVal.LeftShoulder  = waitingBone.rotLeftShoulder.z,
			waitingAnimationVal.LeftUpperArm  = waitingBone.rotLeftUpperArm.z
		},

		//ブリンク処理
		runBlink: function (expressionManager, model, val) {
			//まばたき追加 表情変更中は動かさない
			if (model.isEmotion !== true) {
				let bName = "blink"
				let bInvalid = ""
				let minVal = 0
				let invalidVal = 0
				const modelID = model.modelID
				const statModel = TYRANO.kag.stat.VRoid.model[modelID]

				//blinkDataの条件を検索
				const blinkData = statModel.blinkData
				const expression = statModel.expression
				blinkTable : for (let data in blinkData) {
					for (let key in expression) {
						if (data == expression[key].expressionName && expression[key].val > 0) {
							bName = blinkData[data].set;
							bInvalid = blinkData[data].invalid;
							break blinkTable;
						}
					}
				}

				//ブリンクするデータの現在の値を取得
				for (let key in expression) {
					if (bName == expression[key].expressionName) minVal = expression[key].val;
				
					//ブリンク中0にする値
					if (bInvalid !== "" && bInvalid == expression[key].expressionName) invalidVal = expression[key].val
				}

				let bVal = val
				if (bVal <= 0.01) {
					bVal = 0
				} else {
					invalidVal = invalidVal * (1 - bVal)
				}
				
				//model.noBlinkがtrueの時はbValが0になるまでブリンクさせない
				if (model.noBlink && bVal == 0) {
					model.noBlink = false
				} else if (model.noBlink && bVal > 0) {
					bName = ""
				}
				
				model.isBlink = bVal > 0 //値が0以上になっている場合はブリンク中判定
				
				//bNameが空白でなければブリンクを実行
				if (bName !== "") {
					expressionManager.setValue(bName, Math.max(bVal, minVal))
					if (bInvalid) expressionManager.setValue(bInvalid, invalidVal)
					
				}
			} else {
				model.noBlink = true
			}
		},

		//モデルの追加
		// VRoid.three.add("vroidID", "model1")
		add: function (pm) {

			const {
				layerID,
				modelID,
				
				pose = "default",
				visible = true,

				x = 0,
				y = 0,
				z = 0,
				rotX = 0,
				rotY = 0,
				rotZ = 0,
				scaleX = 1,
				scaleY = 1,
				scaleZ = 1,

				firstShake = false,
				lookingCamera = false,
				waitingAnimation = true,
				shake = true,
				waitingAnimationVal = 15,
				shakeSpeed = 1,
				waitingAnimationSpeed = 1,

			} = pm;

			const model = this.model[modelID]
			const vrm = model.vrm
			const thisLayer = this.layer[layerID]
			const scene = thisLayer.scene
			const camera = thisLayer.camera

			if (model.layerID) {
				this.error(modelID + " 既に追加済みのIDのキャラクターは追加できません")
				return
			}

			model.layerID = layerID
			model.isAnimating = false;
			
			//目線変更用オブジェクト
			model.lookAtTarget = new THREE.Object3D()
			vrm.scene.add(model.lookAtTarget);

			//セーブデータ用
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveLayer = statVRoid.layer[layerID];
			
			pm.type = "model"
			const saveModel = statVRoid.model[modelID];

			//セーブデータに保存
			for (const key in pm) {
				saveModel[key] = pm[key]
			}

			//髪のハイライトのギラつきを抑える対応
			vrm.scene.traverse((obj) => {
				if (obj.isMesh && obj.material && obj.name.includes('Hair')) {
					obj.material.emissiveIntensity = saveLayer.highLight * thisLayer.light.intensity
				}
			});

			if (!saveModel.material) {
				//初期読み込み時にmaterial情報を取得（IDや配列準が読み込むタイミングで変わる為）
				this.initializeMaterial(modelID)
			} else {
				//データがあるときは状態をロード
				this.loadMaterial(modelID)
			}

			if (!saveModel.wind) {
				saveModel.wind = {
					enable: false,
					val: 0.5,
					speed: 1,
					x: 1,
					y: 0,
					z: 0,
					rotX: this.layer[model.layerID].camera.rotation.x,
					rotY: this.layer[model.layerID].camera.rotation.y,
					rotZ: this.layer[model.layerID].camera.rotation.z,
					excl: "Bust",
					min: 0.5,
					forceWind: false,
				}
			}
			//Ver222追加対応。以前のデータ互換のためminは0に設定
			if (saveModel.wind.excl === undefined) saveModel.wind.excl = "Bust"
			if (saveModel.wind.min === undefined) saveModel.wind.min = 0
			model.windVec = new THREE.Vector3(saveModel.wind.x, saveModel.wind.y, saveModel.wind.z)
			model.windVec.applyEuler(new THREE.Euler(saveModel.wind.rotX, saveModel.wind.rotY, saveModel.wind.rotZ, "XYZ"))

			//Ver321追加対応
			if (saveModel.wind.forceWind === undefined) saveModel.wind.forceWind = false

			if (!saveModel.lipSync) {
				saveModel.lipSync = {
					isSync: false,
					buf: null,
					micVolume: 2,
					micMinLevel: 0,
					micMix: 0.75,
					fadeOut: 500,
					invalidList: ["aa", "ih", "ou", "ee", "oh"],
					lipData: {
						aa: 1,
						ih: 0,
						ou: 0,
						ee: 0,
						oh: 0,
					}
				}
			}
			//V240追加
			if (!saveModel.lipSync.isSyncPos) saveModel.lipSync.isSyncPos = false
			if (!saveModel.lipSync.posRate) saveModel.lipSync.posRate = 3

			//まばたき設定
			if (!saveModel.blinkData) {
				saveModel.blinkData = {
					"blinkLeft": {"set": "blinkRight", "invalid":""},
					"blinkRight": {"set": "blinkLeft", "invalid":""},
					"happy": {"set": "happy", "invalid":""},
				}
			}

			if (!saveModel.blink) {
				saveModel.blink = {
					enable: true,
					stroke: 1,
					speed: 1,
				}
			}

			vrm.scene.position.set(x, y, z)
			vrm.scene.rotation.set(rotX, rotY + model.correctionRotateY, rotZ)
			vrm.scene.scale.set(scaleX, scaleY, scaleZ)

			vrm.scene.visible = visible;
			vrm.scene.name = modelID;

			//カメラ目線
			vrm.lookAt.autoUpdate = true;
			if (lookingCamera) {
				vrm.lookAt.target = camera;
			} else if (saveModel.lookAtTarget) {
				//目線データがある場合は復元する
				this.loadLookAt(modelID);
			}

			const resolvedInitialPose = this.resolvePoseName(saveModel.pose || pose, modelID)
			if (resolvedInitialPose) {
				saveModel.pose = resolvedInitialPose
			}

			//初期ポーズの設定
			if (resolvedInitialPose) {
				const poseJson = this.poseJson[resolvedInitialPose]
				vrm.humanoid.setNormalizedPose(this.poseCorrection(poseJson, vrm))
			}

			vrm.update( 0.0001 );

			scene.add(vrm.scene);

			//待機モーションの設定
			this.saveWaitingAnimationVal(model.waitingBone, model.waitingAnimationVal)

			//モデル追加時の揺れを抑制する処理
			//揺れを止める前にresetしないとおかしくなる
			if (!firstShake || !shake) {
				vrm.springBoneManager.reset()
				vrm.update( 1000 );
			}
			vrm.springBoneManager._enabled = shake
			
			this.makeModelTick(modelID)

			this.forceRenderUpdate(layerID)
		},

		//モデルの更新処理作成
		makeModelTick: function (modelID) {
			const that = VRoid.three
			
			const model = this.model[modelID]
			const vrm = model.vrm

			const tStat = TYRANO.kag.stat
			const saveModel = tStat.VRoid.model[modelID];

			const waitingClock = model.waitingClock = new THREE.Clock();

			let windEnd = false

			const objectSpringBonesMap = vrm.springBoneManager._objectSpringBonesMap
			const blink = saveModel.blink
			const saveWind = saveModel.wind
			const expressionManager = vrm.expressionManager

			const waitingBone = model.waitingBone
			const waitingAnimationVal = model.waitingAnimationVal

			model.tick = function (delta, elapsedTime) {

				if ( !vrm ) return

				if ( model.mixer && model.mixer.action && model.mixer.action.enabled) {
					const mixer = model.mixer
					mixer.update( delta );
					
					//タイムラインがある場合は実行
					const action = mixer.action
					const timeline = action.emoTimeline
					if (timeline) {
						const nowTime = action.time
						for (const key in timeline) {
							//開始時間より先のタイムラインを実行する
							const keyTime = Number(key) * 0.001
							if (keyTime >= action.startTime && keyTime <= nowTime && !timeline[key].isDone) {
								const pm = timeline[key]
								pm.isDone = true

								//se_storageが指定されていた場合、se_の付いたパラメーターでplayseを実行する
								that.animation_playse(pm)

								//emoかemoIDがあれば実行
								if (pm.emo !== undefined || pm.emoID !== undefined) that.emotion(modelID, pm.emo, Number(pm.time) / mixer.timeScale, pm.easing, null, false, false, pm.diff === "true", pm.emoID, pm.emoval)
								break
							}
						}
					}
					
					//終了時間が設定されている場合は停止処理
					if (action.endTime && action.endTime <= action.time) {
						if (!action.paused) mixer.dispatchEvent({ type: 'finished', action: action })
					}
				} else {

					//待機モーション ポーズの変更時は止める
					if (!model.isAnimating && saveModel.waitingAnimation) {
						//waitingValの数字を大きくすると待機モーションの動きが大きくなる
						const waitingVal = saveModel.waitingAnimationVal * 0.001;
						waitingClock.getDelta();
						that.updateWaitingAnimation(waitingBone, waitingAnimationVal, waitingVal * (Math.sin( Math.PI * (waitingClock.elapsedTime * saveModel.waitingAnimationSpeed))))
					}
				}

				
				//風処理
				if (saveWind.enable) {
					const minValue = saveWind.val * saveWind.min; // 最小値
					const amplitude = saveWind.val - minValue; // 振幅
					const gravityPower = minValue + amplitude * Math.abs(Math.sin(Math.PI * (elapsedTime * saveWind.speed)));

					objectSpringBonesMap.forEach(element => {
						element.forEach(node => {
							//指定されたボーンを除外して風をあてる
							if (saveWind.exclList.some(exclude => node.bone.name.includes(exclude))) return

							let currentGravity = node.settings.gravityDir.clone().add(model.windVec);;

							if (saveWind.forceWind) {
								//forceWindが有効な時は元のモデルの重力設定を無視
								node.settings.gravityDir = currentGravity.normalize();
								node.settings.gravityPower = gravityPower;
								return
							}

							if (gravityPower !== 0) {
								//0以外の場合は元の重力設定の補正を乗せる
								if (node.windCorrection) {
									currentGravity.add(node.windCorrection.clone().divideScalar(gravityPower))
								}
								
								node.settings.gravityDir = currentGravity.normalize();
								node.settings.gravityPower = gravityPower;

							} else if (node.windCorrection) {
								//0の場合は元々の重力設定を復元（windCorrectionに1のPowerを与えるとdefault）
								node.settings.gravityDir = node.windCorrection.clone();
								node.settings.gravityPower = 1;
							} else {
								node.settings.gravityDir = currentGravity.normalize();
								node.settings.gravityPower = 0;
							}
							
						});
					});
					windEnd = false

				} else {
					if (!windEnd) {
						let i = 0
						objectSpringBonesMap.forEach(element => {
							element.forEach(node => {
								node.settings.gravityDir = model.wind.default[i].gravityDir;
								node.settings.gravityPower = model.wind.default[i].gravityPower;
							});
							i++
						});
						windEnd = true
					}
				}

				//またばき処理 まばたき中に無効化してもストロークが終わるまでは処理
				if (blink.enable || model.isBlink) {
					const bStroke = blink.stroke
					const bSpeed = blink.speed * 1024 * bStroke
					
					let bVal =
						(Math.abs(Math.sin(elapsedTime * 1 / (3 * bStroke))) ** (bSpeed * bStroke))
						//二つの周期を合わせたい場合。有効にする場合はbStrokeに*2した方が良い
						// + (Math.abs(Math.sin(elapsedTime * 4 / (7 * bStroke))) ** (bSpeed * bStroke))
					bVal = Math.min(Math.max(0, bVal), 1)

					that.runBlink(
						expressionManager,
						model,
						bVal,
					)
				}

				//アニメーションの切り替え時に無効化
				if ( model.isNoUpdate ) return

				if (!tStat.is_skip) {
					//saveModel.shakeSpeedの小さい数字ほど揺れ物の揺れが遅くなる
					vrm.update( delta * saveModel.shakeSpeed );
				} else {
					//大きな数字を渡して実質揺れないようにする。動きが激しいと多少は揺れる
					//スキップ中も揺れない
					vrm.update( 10000 );
				}

			}
			
		},

		//VRoid_poseやemo、アニメーション時にならすSE関数
		//カンマ区切りでファイル名が渡された場合、ランダムで鳴らす
		// VRoid.three.animation_playse({se_storage: "test.wav"})
		animation_playse: function (pm) {
			//se_storageが指定されていた場合、se_の付いたパラメーターでplayseを実行する
			if (!pm.se_storage) return

			// pm.se_storage にカンマ区切りでファイル名が入っている場合、ランダムで1つ鳴らす
			const seList = pm.se_storage.split(',')
				.map(name => name.trim()) // 前後のスペースを削除
				.filter(name => name);    // 空要素を除去（カンマが連続していた場合など）

			// ランダムに1つ選択する
			const se_storage = seList[Math.floor(Math.random() * seList.length)];

			TYRANO.kag.ftag.startTag("playse", {
				storage: se_storage,
				buf: pm.se_buf,
				loop: pm.se_loop,
				sprite_time: pm.se_sprite_time,
				clear: pm.se_clear,
				volume: pm.se_volume,
				html5: pm.se_html5,
				stop: "true",
			});

		},

		//シーンに追加したモデルを削除
		// VRoid.three.delete("VRoid", "model1")
		delete: function (modelID) {

			const model = this.model[modelID]
			const vrm = model.vrm

			//セーブデータ用
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];

			const scene = this.layer[saveModel.layerID].scene

			delete saveModel.layerID


			//action関係の削除
			$(model.mixer).off();
			delete saveModel.mixer

			scene.remove(vrm.scene);

		},
		
		//モデルの設定変更
		modelConfig: function (modelID, lookingCamera, shake, shakeSpeed, waitingAnimation, waitingAnimationVal, waitingAnimationSpeed) {
			const model = this.model[modelID]
			const vrm = this.model[modelID].vrm
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];
			
			let camera
			if (model.layerID) {
				camera = this.layer[model.layerID].camera
			}

			if (lookingCamera !== undefined && lookingCamera !== null) {
				saveModel.lookingCamera = lookingCamera
				cancelAnimationFrame(model.requestlookAtId)
				if (camera) {
					if (lookingCamera) {
						vrm.lookAt.target = camera;
						delete saveModel.lookAtTarget;
					} else {
						delete vrm.lookAt.target
						vrm.lookAt.reset()
					}
				}
			}

			if (shake !== undefined && shake !== null) {
				saveModel.shake = shake
			}
			if (saveModel.shake !== undefined) {
				if (saveModel.shake !== vrm.springBoneManager._enabled) {
					vrm.springBoneManager.reset()
					vrm.update( 1000 )
				}
				vrm.springBoneManager._enabled = saveModel.shake
			}

			if (shakeSpeed !== undefined && shakeSpeed !== null) {
				saveModel.shakeSpeed = shakeSpeed
			}
			
			if (waitingAnimation !== undefined && waitingAnimation !== null) {
				saveModel.waitingAnimation = waitingAnimation
			}
			
			if (waitingAnimationVal !== undefined && waitingAnimationVal !== null) {
				saveModel.waitingAnimationVal = waitingAnimationVal
			}

			if (waitingAnimationSpeed !== undefined && waitingAnimationSpeed !== null) {
				saveModel.waitingAnimationSpeed = waitingAnimationSpeed
			}
			
		},

		//モデルの表示
		// VRoid.three.show("model1")
		show: function (modelID, time, func, cb, wait) {
			this.model[modelID].vrm.scene.visible = true;

			//セーブデータ用
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];
			saveModel.visible = true

			if (cb && typeof cb === 'function') cb()

		},

		//モデルの非表示
		// VRoid.three.hide("model1", time, func, cb, wait)
		hide: function (modelID, time, func, cb, wait) {
			this.model[modelID].vrm.scene.visible = false;

			//セーブデータ用
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];
			saveModel.visible = false

			if (cb && typeof cb === 'function') cb()

		},

		//マテリアルの表示設定
		material: function (modelID, materialID, visible, outline) {
			//セーブデータ用
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];
			
			const materials = this.model[modelID].vrm.materials

			if (materialID != null) {
				const materialArr = materialID.split(',');

				materialArr.forEach(function(ID) {
					ID = ID.trim();

					//materialIDからnameを取得
					let name
					for (const key in saveModel.material) {
						if (saveModel.material[key].id == ID) name = key
					}

					let outlineName
					if (name) {
						outlineName = name + " (Outline)"
						for (const key in materials) {
							const mateName = materials[key].name
							if (name == mateName) {
								materials[key].visible = visible;
								saveModel.material[name].visible = visible;
							}
						}
					}

					//アウトラインも処理するかどうか
					//次のIDの名前の後ろに" (Outline)"を付けたものと一致した場合は処理する
					if (outline) {
						name = null
						const nextMaterialID = Number(ID) + 1
						for (const key in saveModel.material) {
							if (saveModel.material[key].id == nextMaterialID) name = key
						}

						if (name && outlineName == name) {
							for (const key in materials) {
								const mateName = materials[key].name
								if (name == mateName) {
									materials[key].visible = visible;
									saveModel.material[name].visible = visible;
								}
							}
						}
					}
				});

			} else {
				//materialIDの指定がない場合は全てに処理を実行
				for (const key in materials) {
					materials[key].visible = visible;
				}
				for (const key in saveModel.material) {
					saveModel.material[key].visible = visible;
				}

			}

		},
		
		//初回ロード時のmaterial情報取得処理
		initializeMaterial: function (modelID) {
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];

			const materials = this.model[modelID].vrm.materials
			
			const tmp = []
			
			//重複がないように追加してソート
			for (const key in materials) {
				const name = materials[key].name;
				if (!tmp.includes(name)) tmp.push(name)
			}
			tmp.sort()
			
			//セーブデータの作成（初期状態は全て表示）
			saveModel.material = {}
			for (let i = 0; i < tmp.length; i++) {
				saveModel.material[tmp[i]] = {"id": i, "visible": true}
			}
		},
		
		//モデルのロード時（addのタイミング）に使用
		loadMaterial: function (modelID) {
			//セーブデータ用
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];

			const materials = this.model[modelID].vrm.materials

			for (const saveName in saveModel.material) {
				for (const key in materials) {
					const name = materials[key].name

					if (name == saveName) {
						materials[key].visible = saveModel.material[saveName].visible;
						
						//テクスチャー画像の変更があった場合
						if (saveModel.material[saveName].storage) {
							this.changeTexture({modelID: modelID, materialID: saveModel.material[saveName].id, storage: saveModel.material[saveName].storage})
						}
						
						//テクスチャー色の変更があった場合
						if (saveModel.material[saveName].color) {
							const tmpPM = $.extend(true,{}, saveModel.material[saveName].color);
							tmpPM.modelID = modelID
							tmpPM.materialID = saveModel.material[saveName].id
							this.changeColor(tmpPM)
						}
					}
				}
			}
		},

		//vroid_maker ファイルドロップ用
		changeTextureBlob: async function (modelID, blob, name) {
			try {
				// Blob から Texture を生成
				const texture = await createTextureFromBlob(blob);

				const materials = this.model[modelID].vrm.materials

				let outlineName;
				if (name) {
					outlineName = name + " (Outline)";
					for (const key in materials) {
						const mateName = materials[key].name;
						if (name == mateName) {
							materials[key].map = texture;
							materials[key].shadeMultiplyTexture = texture;
						}
					}
				}

				// アウトライン処理
				if (name && outlineName) {
					for (const key in materials) {
						const mateName = materials[key].name;
						if (outlineName == mateName) {
							materials[key].map = texture;
							materials[key].shadeMultiplyTexture = texture;
						}
					}
				}
			} catch (error) {
				console.error("テクスチャのロードに失敗しました：", error);
			}

			async function createTextureFromBlob (blob) {
				return new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = function (event) {
						const img = new Image();
						img.onload = function () {
							const texture = new THREE.Texture(img);
							texture.needsUpdate = true;
							texture.colorSpace = THREE.SRGBColorSpace;
							texture.minFilter = THREE.LinearFilter;
							texture.magFilter = THREE.LinearFilter;
							texture.flipY = false;
							texture.transparent = true;

							resolve(texture);
						};
						img.onerror = reject;
						img.src = event.target.result;
					};
					reader.onerror = reject;
					reader.readAsDataURL(blob);
				});
			}

		},


		//モデルに風をあてる 風が出る方向は実行時のカメラ基準
		// VRoid.three.wind("model1", 0.5, 1, 1, 0, 0)
		// VRoid.three.wind("model1", 0.1)
		wind: function (modelID, val, speed, x, y, z, excl, min) {
			//セーブデータ用
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];
			const model = this.model[modelID]

			if (val !== undefined) saveModel.wind.val = Number(val)
			if (speed !== undefined) saveModel.wind.speed = Number(speed)
			if (x !== undefined) saveModel.wind.x = Number(x)
			if (y !== undefined) saveModel.wind.y = Number(y)
			if (z !== undefined) saveModel.wind.z = Number(z)
			if (excl !== undefined) saveModel.wind.excl = excl
			if (min !== undefined) saveModel.wind.min = Number(min)
			
			//指定された文字列を含むボーン名には風をあてない
			if (saveModel.wind.excl) {
				saveModel.wind.exclList = saveModel.wind.excl.split(",").map(str => str.trim())
			} else {
				saveModel.wind.exclList = []
			}

			saveModel.wind.rotX = this.layer[model.layerID].camera.rotation.x
			saveModel.wind.rotY = this.layer[model.layerID].camera.rotation.y
			saveModel.wind.rotZ = this.layer[model.layerID].camera.rotation.z
			saveModel.wind.enable = true

		},

		//風をとめる
		// VRoid.three.stopWind("model1")
		stopWind: function (modelID) {
			//セーブデータ用
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];

			saveModel.wind.enable = false

		},
		poseCorrection: function (poseJson, vrm) {
			let cprrPose = $.extend(true,{}, poseJson);
		
			if (vrm.meta.metaVersion === '1') {
				Object.keys(poseJson).forEach((key) => {
					if (poseJson[key].rotation) {
						cprrPose[key].rotation[0] = poseJson[key].rotation[0] * (-1)
						cprrPose[key].rotation[2] = poseJson[key].rotation[2] * (-1)
					}
				});
			}
			//} else if (vrm.meta.metaVersion === '0') {}
			return cprrPose
		},

		resolvePoseName: function (poseName, modelID) {
			if (poseName && this.poseJson[poseName]) {
				return poseName
			}

			const fallbackPoseName = this.poseJson.default
				? "default"
				: Object.keys(this.poseJson || {}).find((key) => Boolean(this.poseJson[key]))

			if (poseName && fallbackPoseName && poseName !== fallbackPoseName) {
				console.warn(`[VRoid] Missing pose "${poseName}" for ${modelID}. Fallback to "${fallbackPoseName}".`)
			}

			return fallbackPoseName || ""
		},
		
		//モデルのポージング
		// VRoid.three.pose("model1", "")
		pose: function (modelID, poseName, time, func, cb, wait, skip, rotThreshold=1.5) {
			//waitのデフォルト値をセット
			if (wait === undefined) wait = true;

			const model = this.model[modelID]
			const vrm = this.model[modelID].vrm;
			const that = this;

			let initialValues = {};
			let targetValues = {};
			let poseJson;
			const resolvedPoseName = this.resolvePoseName(poseName, modelID)
			
			if (!vrm) return
			
			if (resolvedPoseName && this.poseJson[resolvedPoseName]) {
				poseJson = $.extend(true,{}, this.poseJson[resolvedPoseName]);
			} else {
				this.error(poseName + " に設定されたポーズデータがありません。")
				if (cb && typeof cb === 'function') cb()
				return;
			}
			
			//モデルのバージョンによってrotation補正
			poseJson = this.poseCorrection(poseJson, vrm)

			//セーブデータ用
			const tStat = TYRANO.kag.stat
			const statVRoid = tStat.VRoid;
			const saveModel = statVRoid.model[modelID];
			
			//keepPoseがあれば削除
			delete saveModel.keepPose

			cancelAnimationFrame(model.poseRequestId)

			saveModel.pose = resolvedPoseName
			const humanoid = vrm.humanoid

			//時間指定がなければ瞬間変更
			if (!time){
			
				model.waitingClock.start()
				humanoid.setNormalizedPose(poseJson)
				//resetHips
				const resetPose = {hips:{position: [0, 0, 0]}}
				humanoid.setNormalizedPose(resetPose)
				
				//待機モーションの再設定
				this.saveWaitingAnimationVal(model.waitingBone, model.waitingAnimationVal)

				if (cb && typeof cb === 'function') cb()
				return
			}

			//アニメーション中は待機モーションを強制的に止める
			model.isAnimating = true;


			// 初期値と目標値をセットアップ
			const tmpPose = humanoid.getNormalizedPose();

			//hipsのリセットが必要かどうか
			let isResetHips = true
			if (tmpPose.hips.position[0] === 0 && tmpPose.hips.position[1] === 0 && tmpPose.hips.position[2] === 0) isResetHips = false
			
			for (const key in poseJson) {
				//数値の異なるrotationのみ処理する
				if (tmpPose[key] && array_equal(tmpPose[key].rotation, poseJson[key].rotation) == false ) {
					initialValues[key] = tmpPose[key].rotation;
					targetValues[key] = poseJson[key].rotation;
				}
			}

			//配列の比較用
			function array_equal(arr1, arr2) {
				return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
			}

			//変更する箇所の領域確保
			const currentValue = {};
			for (const key in targetValues) {
				currentValue[key] = { rotation: new Array(initialValues[key].length) };
			}

			//計算結果のキャッシュ
			const diffs = {};
			const useSlerp = {};
			for (const key in targetValues) {
				diffs[key] = targetValues[key].map((t, i) => t - initialValues[key][i]);
				const diffNorm = diffs[key].reduce((sum, v) => sum + Math.abs(v), 0);
				useSlerp[key] = diffNorm > rotThreshold;  // デフォルト値1.5だと約90度を超える回転をslerpで処理する
			}

			const qStart = new THREE.Quaternion();
			const qEnd = new THREE.Quaternion();
			const qTmp = new THREE.Quaternion();

			const easingFunc = this.easing[func] || this.easing.default;
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1
				

				if (progress < 1) {
				
					const val = easingFunc(progress);

					// イージングの計算を適用
					for (const key in targetValues) {
						const diffNorm = diffs[key].reduce((sum, v) => sum + Math.abs(v), 0);
						if (useSlerp[key]) {
							qStart.fromArray(initialValues[key]);
							qEnd.fromArray(targetValues[key]);

							if (qStart.dot(qEnd) < 0) qEnd.set(-qEnd.x, -qEnd.y, -qEnd.z, -qEnd.w);

							qTmp.copy(qStart).slerp(qEnd, val);
							currentValue[key].rotation = qTmp.toArray();
						} else {
							currentValue[key].rotation = initialValues[key].map((v, i) => v + diffs[key][i] * val);
						}
					}

					humanoid.setNormalizedPose(currentValue)
				
					model.poseRequestId = requestAnimationFrame(tick);
				} else {
					//完了時
					humanoid.setNormalizedPose(targetValues);

					//待機モーションの再設定
					model.waitingClock.start()
					that.saveWaitingAnimationVal(model.waitingBone, model.waitingAnimationVal)
					model.isAnimating = false;

					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			tick(startTime);
			
			//resetHipsを必ず実行する
			if (isResetHips) this.resetHips(modelID, time, skip, func)

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()

		},

		//目線変更
		// VRoid.three.lookAt("model1", 0.5, 0, 0)
		lookAt: function (modelID, x, y, z, time, func, base, cb, wait, skip) {
			//waitのデフォルト値をセット
			if (wait === undefined) wait = true;
			time = Number(time)

			const model = this.model[modelID]
			const vrm = this.model[modelID].vrm;

			const tStat = TYRANO.kag.stat
			const statVRoid = tStat.VRoid;
			const saveModel = statVRoid.model[modelID];
			
			//セーブデータのカメラ目線を解除
			saveModel.lookingCamera = false

			//現在のポジションをターゲットから取得
			let startPosition
			if (vrm.lookAt.target) {
				startPosition = new THREE.Vector3(vrm.lookAt.target.position.x, vrm.lookAt.target.position.y, vrm.lookAt.target.position.z)
			}

			//セーブデータの作成
			//カメラ目線に戻すときにsaveModel.lookAtTargetは削除される
			if (!saveModel.lookAtTarget) saveModel.lookAtTarget = {}

			let saveData
			//camera or model
			if (base == "model" && startPosition) {
				//現在のtargetを基準にする。ない場合はカメラ指定に回す
				saveData = startPosition.clone();
			} else {
				//カメラを基準にする
				saveData = this.layer[model.layerID].camera.position.clone();
			}
			saveData.add(new THREE.Vector3(x, y, z))

			saveModel.lookAtTarget.x = saveData.x
			saveModel.lookAtTarget.y = saveData.y
			saveModel.lookAtTarget.z = saveData.z
			
			const endPosition = new THREE.Vector3(saveModel.lookAtTarget.x, saveModel.lookAtTarget.y, saveModel.lookAtTarget.z)

			// 注視するオブジェクトの初期化
			model.lookAtTarget = new THREE.Object3D()

			//前回の変更が残っていたら止める
			cancelAnimationFrame(model.requestlookAtId)

			//時間指定、もしくは前回のtargetがなければ瞬間変更
			if (!time || !startPosition){
				model.lookAtTarget.position.copy(endPosition);
				vrm.lookAt.target = model.lookAtTarget

				if (cb && typeof cb === 'function') cb()
				return
			}

			const easingFunc = this.easing[func] || this.easing.default;
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1

				if (progress < 1) {
					const val = easingFunc(progress);

					model.lookAtTarget.position.copy(new THREE.Vector3(startPosition.x + (endPosition.x - startPosition.x) * val, startPosition.y + (endPosition.y - startPosition.y) * val, startPosition.z + (endPosition.z - startPosition.z) * val));
					model.requestlookAtId = requestAnimationFrame(tick);
				} else {
					model.lookAtTarget.position.copy(endPosition);
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			model.lookAtTarget.position.copy(startPosition)
			vrm.lookAt.target = model.lookAtTarget
			tick(startTime);


			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()

		},

		//データロード時に使用
		loadLookAt: function (modelID) {
			const model = this.model[modelID]
			const vrm = this.model[modelID].vrm;
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];
			
			const lookAtTarget = saveModel.lookAtTarget
			
			model.lookAtTarget = new THREE.Object3D()
			model.lookAtTarget.position.copy(new THREE.Vector3(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z));
			vrm.lookAt.target = model.lookAtTarget
		
		},

		//カメラ目線に戻すときに使用
		// VRoid.three.lookAtCamera("model1", 1000)
		lookAtCamera: function (modelID, time, func, cb, wait, skip) {
			//waitのデフォルト値をセット
			if (wait === undefined) wait = true;
			time = Number(time)

			const model = this.model[modelID]
			const vrm = this.model[modelID].vrm;

			const tStat = TYRANO.kag.stat
			const statVRoid = tStat.VRoid;
			const saveModel = statVRoid.model[modelID];
			
			//セーブデータのカメラ目線を有効化
			saveModel.lookingCamera = true
			
			//現在のポジションをターゲットから取得
			let startPosition
			if (vrm.lookAt.target) {
				startPosition = new THREE.Vector3(vrm.lookAt.target.position.x, vrm.lookAt.target.position.y, vrm.lookAt.target.position.z)
			}

			//セーブデータの作成
			//saveModel.lookAtTargetを削除する
			delete saveModel.lookAtTarget

			// 注視するオブジェクト 再びnewする必要あり
			model.lookAtTarget = new THREE.Object3D()

			//前回の変更が残っていたら止める
			cancelAnimationFrame(model.requestlookAtId)

			const camera = this.layer[model.layerID].camera
			//時間指定、もしくは前回のtargetがなければ瞬間変更
			if (!time || !startPosition){
				vrm.lookAt.target = camera

				if (cb && typeof cb === 'function') cb()
				return
			}

			const easingFunc = this.easing[func] || this.easing.default;
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1

				if (progress < 1) {
					const val = easingFunc(progress);

					model.lookAtTarget.position.copy(new THREE.Vector3(startPosition.x + (camera.position.x - startPosition.x) * val, startPosition.y + (camera.position.y - startPosition.y) * val, startPosition.z + (camera.position.z - startPosition.z) * val));
					model.requestlookAtId = requestAnimationFrame(tick);
				} else {
					vrm.lookAt.target = camera
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			model.lookAtTarget.position.copy(startPosition)
			vrm.lookAt.target = model.lookAtTarget
			tick(startTime);

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()

		},

		//アニメーションファイルのimport。
		// VRoid.three.importAnimation("VRMA_01.vrma, VRMA_02.vrma")
		importAnimation: function (storage, wait, cb) {
			//インポートの保存
			const statVRoid = TYRANO.kag.stat.VRoid;
			if (!statVRoid.anim) statVRoid.anim = []

			//新しい要素を追加する前に、すでに存在するかどうかをチェック
			if (!statVRoid.anim.some(exisElem => exisElem === storage)) {
				statVRoid.anim.push(storage);
			}

			const storageArr = storage.split(',');
			const promises = [];
			const _warn = console.warn;

			storageArr.forEach(function(file) {
				file = file.trim();

				// 先頭が./なら削除
				if (file.startsWith("./")) {
					file = file.substring(2);
				}
				
				// 拡張子を取り出す
				const type = file.substring(file.lastIndexOf(".") + 1).toLowerCase();
				
				// 拡張子を削除してnameにする
				let name;
				const dotIndex = file.lastIndexOf(".");

				// .以降を削除
				if (dotIndex >= 0) {
					name = file.substring(0, dotIndex);
				} else {
					name = file;
				}

				if (VRoid.three[type] && !VRoid.three[type][name]) {
					//一時的に警告を無効化
					console.warn = function() {};

					const promise = new Promise(function(resolve, reject) {
					
						if (type == "vrma") {
							const moduleURL = "./module/three-vrm/three-vrm-animation.module.min.js"
							TYRANO.kag.stat.VRoid.module[moduleURL] = true

							VRoid.three.importModule("VRMAnimationLoaderPlugin", moduleURL).then( ( VRMAnimationLoaderPlugin ) => {

								const loader = new GLTFLoader();
								//loader.crossOrigin = 'anonymous';
								loader.register((parser) => {
									return new VRMAnimationLoaderPlugin(parser);
								});


								loader.load(

									"./data/others/plugin/vrm/_animation/" + file,

									// called when the resource is loaded
									(gltf) => {
										const vrmAnimations = gltf.userData.vrmAnimations
										if (vrmAnimations != null) {
											VRoid.three.vrma[name] = vrmAnimations
											VRoid.three.animType[name] = "vrma"
										}
										resolve();
									},
									// called while loading is progressing
									(progress) => {
										//console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%')
									},

									// called when loading has errors
									(error) => {
										console.log(error)
										VRoid.three.error("VRMAデータのロード時にエラーが発生しました。")
										resolve();
									}
								)

							});

						} else if (type == "fbx") {
							const moduleURL = "./module/mixamo/loadMixamoAnimation.js"
							TYRANO.kag.stat.VRoid.module[moduleURL] = true

							VRoid.three.importModule("loadMixamoAsset", moduleURL).then( ( loadMixamoAsset ) => {

								loadMixamoAsset( "./data/others/plugin/vrm/_animation/" + file ).then( ( asset ) => {
									if (asset != null) {
										VRoid.three.fbx[name] = asset
										VRoid.three.animType[name] = "fbx"
									}
									resolve();
								}).catch((error) => {
									console.log(error)
									VRoid.three.error("FBXデータのロード時にエラーが発生しました。")
									resolve();
								});
							}).catch((error) => {
								console.log(error)
								VRoid.three.error("FBXデータのロード時にエラーが発生しました。")
								resolve();
							});
						}
					
					});
					
					promises.push(promise);
				}

			});

			// 全ての処理が終了後にnextorder
			Promise.all(promises).then(function() {
				//警告を戻す
				console.warn = _warn;
				if (cb && typeof cb === 'function' && wait) setTimeout(cb, 0)
			});
			
			if (cb && typeof cb === 'function' && !wait) cb()
		},

		//登録したVRMAやFBXファイルの再生
		//VRoid.three.animation({modelID: "model1", name: "VRMA_01"})
		animation: async function (pm, cb) {
			let {
				modelID,
				name,
				rate = 1,
				loop = 1,
				fadeIn = 0,
				fadeOut = 0,
				fadeLoop = 0,
				wait = true,
				skip = false,
				keep = false,
				startTime = 0,
				endTime = 0,
				emoTimeline,
				resetHips = true,
			} = pm;


			const model = this.model[modelID]
			const vrm = this.model[modelID].vrm;
			const hips = model.hips
			const humanoid = vrm.humanoid
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];

			//ループが0(無限)の時のみセーブデータから再現するため保存
			if (loop === 0) {
				let expression
				if (saveModel.expression) expression = $.extend(true, [], saveModel.expression)
				saveModel.mixer = {
					modelID: modelID,
					rate: rate,
					name: name,
					fadeIn: 0,	//fadeは強制的に0にする
					fadeOut: 0,
					fadeLoop: fadeLoop,
					startTime: startTime,
					endTime: endTime,
					emoTimeline: emoTimeline,
					resetHips: resetHips,
					expression: expression,
				}
				
				//無限ループの場合はwaitを強制的にfalse
				wait = false;
			} else {
				delete saveModel.mixer
			}

			// 初回だけ mixer を作る
			if (!model.mixer) {
				model.mixer = new THREE.AnimationMixer(vrm.scene);
			} else {
				$(model.mixer).off();
			}
			
			const mixer = model.mixer

			//クリップ作成直前の状態のVRMを操作してhipsを操作
			cancelAnimationFrame(model.resetHipsTickID)
			if (model.currentAction) model.currentAction.paused = true
			const currentPose = humanoid.getNormalizedPose()
			const tmpPos = currentPose.hips.position.concat();

			//セーブデータにポーズを記憶。ロード時に読み込んでからanimationを叩く
			saveModel.actionPose = currentPose;

			if (resetHips) currentPose.hips.position = [0, 0, 0]

			//vrmupdateが走るとチラつく可能性があるから無効化する
			model.isNoUpdate = true

			mixer.stopAllAction()
			humanoid.setNormalizedPose(currentPose)

			currentPose.hips.position = tmpPos.concat();
			model.currentAction = null

			//一時的に警告を無効化
			const _warn = console.warn;
			console.warn = function() {};
			let clip
			if ("fbx" == this.animType[name]) {
				const loadMixamoClip = await this.importModule("loadMixamoClip", "./module/mixamo/loadMixamoAnimation.js")
				clip = loadMixamoClip(this.fbx[name], vrm ) 
			} else {
				const createVRMAnimationClip = await this.importModule("createVRMAnimationClip", "./module/three-vrm/three-vrm-animation.module.min.js")
				clip = createVRMAnimationClip(this.vrma[name][0], vrm);
			}
			console.warn = _warn;

			//クリップを取得したらhipsを戻す
			if (resetHips) humanoid.setNormalizedPose(currentPose)
			model.isNoUpdate = false

			//クリップの長さ
			const clipDuration = clip.duration
			
			//startTimeがclipDuration以上の場合、clipDurationに合わせてループを強制的に無効化
			if (startTime >= clipDuration) {
				startTime = clipDuration
				loop = 1
			}

			//endTimeが0より大きく、startTimeより短く設定されていた場合はstartTimeに合わせる
			if (endTime > 0 && endTime < startTime) endTime = startTime
			
			//endTimeがclipDuration以上の場合は0にして無効化
			if (endTime >= clipDuration) endTime = 0

			//startTimeが0より大きく、endTimeが同じ場合はループを強制的に無効化
			if (startTime > 0 && startTime === endTime) loop = 1

			//ループではなく、keepが指定されていた場合は最終フレームを記憶しておく
			if (loop !== 0 && keep) {
				//endTimeの方が小さければendTimeを優先
				let tmpDuration = clipDuration
				if (endTime > 0 && endTime < clipDuration) {
					tmpDuration = endTime
				}
				saveModel.mixer = {
					name: name,
					keep: true,
					startTime: tmpDuration,
					endTime: endTime,
					resetHips: resetHips,
				}
			}

			//msをsに変換
			fadeIn *= 0.001
			fadeOut *= 0.001
			fadeLoop *= 0.001

			//waitが有効でスキップ時は速度を上げる
			if (wait && TYRANO.kag.stat.is_skip && skip) {
				fadeIn *= 0.1
				fadeOut *= 0.1
				rate *= 10
			}

			mixer.timeScale = rate
			
			const action = model.currentAction = mixer.clipAction( clip )
			action.setLoop(THREE.LoopOnce);
			
			//開始時間を記録
			action.startTime = startTime

			//終了時間を追加
			if (endTime) action.endTime = endTime

			//emoTimelineを設定
			setTimeline()
			
			//最後の体勢を維持
			action.clampWhenFinished = true;
			action.reset().fadeIn(fadeIn).play();

			//何秒から再生するか(play後に設定する必要あり)
			action.time = startTime;

			runResetHips(fadeIn)

			model.isNoUpdate = false
			mixer.action = action

			let loopCount = 0
			$(mixer).on('finished', function(e) {

				//メインaction以外は反応させない
				if (e.originalEvent.action != action) return

				loopCount++;
				if (loop === 0 || loopCount < loop) {

					//ループ時処理
					if (fadeLoop > 0) {
						model.isNoUpdate = true
						const currentPose = humanoid.getNormalizedPose()
						mixer.stopAllAction()
						humanoid.setNormalizedPose(currentPose)
						action.reset().fadeIn(fadeLoop).play();
						action.time = startTime;
						if (resetHips) runResetHips(fadeLoop)
						model.isNoUpdate = false
					} else {
						action.reset().play();
						action.time = startTime;
					}

					//emoTimelineを最設定
					setTimeline()

				} else {
					//アニメーション終了時 stop_animationを呼び出す
					if (!wait) cb = null
					VRoid.three.stop_animation(modelID, fadeOut * 1000, wait, skip, cb, keep)
				}
			});

			//waitがfalseの時は読み込んだ後にNextOrder
			if (cb && typeof cb === 'function' && !wait) cb()

			function runResetHips (fadeTime) {
				//位置を元に戻すアニメーション
				const Pos = hips.position.clone();
				const times = [0, fadeTime];

				//model.hipsPosにはload時に基準を保存済み optionで補正を無効にできる
				const values = [Pos.x, Pos.y, Pos.z, model.hipsPos.x, model.hipsPos.y, model.hipsPos.z];

				const track = new THREE.VectorKeyframeTrack(hips.name + '.position', times, values);
				const resetClip = new THREE.AnimationClip('resetHips', times[times.length-1], [track]);
				const resetAction = mixer.clipAction(resetClip);
				resetAction.setLoop(THREE.LoopOnce);
				resetAction.clampWhenFinished = true;
				resetAction.reset().play();
				model.resetAction = resetAction

				resetAction.crossFadeTo(action, fadeTime, false)
			}

			function setTimeline () {
				if (emoTimeline) {
					if (VRoid.three.animEmo[emoTimeline]) {
						action.emoTimeline = $.extend(true,{}, VRoid.three.animEmo[emoTimeline]);
					}
				}
			}
		},

		//VRoid.three.stop_animation("model1", 2000)
		stop_animation: function (modelID, fadeOut, wait, skip, cb, keep) {

			const model = this.model[modelID]
			const vrm = model.vrm
			const humanoid = vrm.humanoid
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveModel = statVRoid.model[modelID];

			$(model.mixer).off();
			delete saveModel.mixer
			delete saveModel.actionPose

			//actionを停止
			if (model.currentAction) model.currentAction.paused = true

			//ポーズを復元
			//action終了時のポーズに確定させる
			const currentPose = humanoid.getNormalizedPose()

			//vrmupdateが走るとチラつく可能性があるから無効化する
			model.isNoUpdate = true

			//アニメーションの完全停止
			if (model.mixer) model.mixer.stopAllAction()
			model.resetAction = null
			model.currentAction = null
			model.mixer = null

			humanoid.setNormalizedPose(currentPose)
			model.isNoUpdate = false

			if (keep) {
				//keepする場合はwait無視
				//待機モーションの再設定
				model.waitingClock.start()
				this.saveWaitingAnimationVal(model.waitingBone, model.waitingAnimationVal)

				//keep時はセーブデータに保存 poseで変更すると消える
				saveModel.keepPose = currentPose
				if (cb && typeof cb === 'function') cb()
				return
			}
			//keepしない場合はsaveModelでposeを呼び出す
			//関数先でnextOrder
			this.pose(modelID, saveModel.pose, fadeOut, null, cb, wait, skip)
		},

		//poseから呼ばれる
		resetHips: function (modelID, time, skip, func) {
			const model = this.model[modelID]
			const vrm = model.vrm
			const humanoid = vrm.humanoid

			const currentPose = humanoid.getNormalizedPose()
			const tmpPos = currentPose.hips.position.concat()
			const resetPose = {hips:{position: [0, 0, 0]}}
			
			//値が同じ場合は終了
			if (tmpPos[0] === 0 && tmpPos[1] === 0 && tmpPos[2] === 0) return
			
			//timeが0の場合直接入れて終了
			if (!time){
				humanoid.setNormalizedPose(resetPose)
				return
			}

			//resetHipsを実行する
			cancelAnimationFrame(model.resetHipsTickID)
			const easingFunc = this.easing[func] || this.easing.default;
			const startTime = performance.now();

			const resetHipsTick = (timestamp) => {
				const elapsedTime = timestamp - startTime;
				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1

				const val = 1 - easingFunc(progress)
				resetPose.hips.position[0] = tmpPos[0] * val
				resetPose.hips.position[1] = tmpPos[1] * val
				resetPose.hips.position[2] = tmpPos[2] * val

				humanoid.setNormalizedPose(resetPose)

				if (progress < 1) model.resetHipsTickID = requestAnimationFrame(resetHipsTick);

			};
			resetHipsTick(startTime)

		},

		//モデルの表情変更
		// VRoid.three.emotion("model1", "joy", 1000)
		emotion: function (modelID, eName, time, func, cb, wait, skip, diff, emoID, emoval) {
			//waitのデフォルト値をセット
			if (wait === undefined) wait = true;

			const model = this.model[modelID]
			const vrm = this.model[modelID].vrm;

			let initialValues = {};
			let targetValues = {};
			let requestId;
			let emotionObj;
			
			//nameとIDどちらも指定していた場合はemoID優先
			if (eName && emoID) {
				eName = ""
			}

			if (eName && this.emotionObj[eName]) {
				emotionObj = this.emotionObj[eName]
			} else if (eName) {
				if (this.emotionObj.default) {
					console.warn(`[VRoid] Missing emotion "${eName}" for ${modelID}. Fallback to "default".`);
					emotionObj = this.emotionObj.default
				} else {
					this.error(eName + " に設定された表情データがありません。")
					if (cb && typeof cb === 'function') cb()
					return;
				}
			} else {
				//emoIDが指定されているパターン。emoIDとemovalをもとにemotionObjの作成
				emotionObj = [{"expressionName": emoID, "val": Number(emoval)}]
			}

			model.isEmotion = true

			const tStat = TYRANO.kag.stat
			const statVRoid = tStat.VRoid;
			const saveModel = statVRoid.model[modelID];
			const expressionManager = vrm.expressionManager

			// 初期値と目標値をセットアップ
			// セーブ用のデータも保存
			if (!diff) {
				//差分が無効の場合はtarget全てに0を入れる
				expressionManager.expressions.forEach(function (data) {
					targetValues[data.expressionName] = 0;
				});
				//前回の変更が残っていたら止める
				cancelAnimationFrame(model.requestEmoId)
			}


			//現在値の設定
			expressionManager.expressions.forEach(function (data) {
				initialValues[data.expressionName] = expressionManager.getValue(data.expressionName);
			});

			//目標値の設定
			emotionObj.forEach(function (data) {
				targetValues[data.expressionName] = data.val;
			});

			//データの保存
			if (!saveModel.expression) {
				//設定がない時は初期化
				let i = 0;
				saveModel.expression = []

				expressionManager.expressions.forEach(function (data) {
					if (data.expressionName) {
						//saveModel.expression[i] = {expressionName: data.expressionName, val: expressionManager.getValue(data.expressionName)}
						saveModel.expression[i] = {expressionName: data.expressionName, val: 0}
					}
					i++
				});
				//delete i
				i = undefined;
			}
			//セーブ用データに各ブレンドシェイプを格納
			saveModel.expression.forEach(function (data) {
				let expressionName = data.expressionName;
				let currentValue = targetValues[expressionName];
				if (currentValue !== undefined) {
					data.val = currentValue;
				}
			});

			//時間指定がなければ瞬間変更
			if (!time){
				// 各ブレンドシェイプを適用
				for (const expressionName in targetValues) {
					expressionManager.setValue(expressionName, targetValues[expressionName]);
				}
				
				cancelAnimationFrame(model.requestEmoId)
				expressionManager.update();

				model.isEmotion = false
				if (cb && typeof cb === 'function') cb()
				return;
			}

			//同一値を削除
			// 先に計算結果をキャッシュ
			const diffs = {};
			for (const expressionName in targetValues) {
				const initialValue = initialValues[expressionName];
				const targetValue = targetValues[expressionName];
				const diffValue = targetValue - initialValue

				if (0 === diffValue) {
					delete initialValues[expressionName]
					delete targetValues[expressionName]
				} else {
					diffs[expressionName] = diffValue
				}
				
			}

			const easingFunc = this.easing[func] || this.easing.default;
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1
				
				const val = easingFunc(progress);

				// 各ブレンドシェイプに対してアニメーションを適用
				for (const expressionName in diffs) {
					const currentValue = initialValues[expressionName] + diffs[expressionName] * val;
					expressionManager.setValue(expressionName, currentValue);
				}

				if (progress < 1) {
					model.requestEmoId = requestAnimationFrame(tick);
				} else {
					model.isEmotion = false
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			model.isEmotion = true
			tick(startTime);

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()

		},

		//VRoid.three.capture("VRoid", 3)
		capture: function (layerID, rate, timeOut, cb) {
			const thisLayer = this.layer[layerID];
			const tmpPR = thisLayer.renderer.getPixelRatio();
			
			if (timeOut === undefined) timeOut = 100

			if (rate === undefined) rate = 1

			//高画質化
			thisLayer.renderer.setPixelRatio(Number(rate));
			thisLayer.composer.setPixelRatio(Number(rate));

			//PixelRatio変更を少し待ってから処理
			setTimeout(() => {
				//preserveDrawingBufferを切っていても直前で更新すればとれる
				this.forceRenderUpdate(layerID)
				requestAnimationFrame(() => {
					const canvas = document.getElementById(layerID);

					canvas.toBlob(function(blob) {
						//PixelRatioを戻す
						thisLayer.renderer.setPixelRatio(tmpPR);
						thisLayer.composer.setPixelRatio(tmpPR);
					
						if (cb && typeof cb === 'function') {
							//cbがあればblobを返す
							cb(blob)
						} else {
							const ymd = new Date().toLocaleDateString('sv-SE');
							const time = new Date().toLocaleTimeString('ja-JP', {hour12:false});
							const fileName = layerID + "_"+ ymd + "_" + time;

							const link = document.createElement('a');
							link.download = fileName + ".png";
							link.href = URL.createObjectURL(blob);
							link.click();

						}

						//テストカメラ時のIDがあったらCSSを戻す
						$("#VRoid_test_camera_capture").css("pointer-events", "")

					}, "image/png");

				});
			}, Number(timeOut));

		},

		
		//生ポーズデータ入力して圧縮
		//VRoid.three.inputJson()
		inputJson: function () {
			$.getJSON("./data/others/plugin/vrm/_pose/input.json").done(function(json) {

				const strJson = JSON.stringify(json, null)

				//console.log(JSON.stringify(json, null, 2));
				console.log(strJson);
				
				const strComp = LZString.compressToBase64(strJson)

				console.log('json = "' + strComp + '"');
				
				const strDeco = LZString.decompressFromBase64(strComp);
				
				console.log(strJson == strDeco);

				const obj = JSON.parse(strDeco);
				console.log(obj);

			}).fail(function(err) { 
				VRoid.three.error(storage + " ファイルが存在しないか、jsonファイルの記述が間違っています。 ");
			});
		},

		//VRoid.three.poseJsonを圧縮して出力（VRoid_import_poseで取り込み時）
		//VRoid.three.convertJson()
		convertJson: function () {

			const strJson = JSON.stringify(VRoid.three.poseJson, null)

			//console.log(JSON.stringify(json, null));
			console.log(strJson);
			
			const strComp = LZString.compressToBase64(strJson)

			console.log('json = "' + strComp + '"');
			
			const strDeco = LZString.decompressFromBase64(strComp);
			
			console.log(strJson == strDeco);

			const obj = JSON.parse(strDeco);
			console.log(obj);

		},

		//圧縮された文字列を展開してjsonオブジェクトを返す
		decodeJson: function (str) {
			const strDeco = LZString.decompressFromBase64(str)
			return JSON.parse(strDeco);
		},
		
		/*
		//{"rotation":[0,0,0,1]}を補完
		//このコードで初期値の項目を削除できる
		json.replace(
		  /,\s*"\w+":\{"rotation":\[\s*0\s*,\s*0\s*,\s*0\s*,\s*1\s*\]\}|\s*"\w+":\{"rotation":\[\s*0\s*,\s*0\s*,\s*0\s*,\s*1\s*\]\},?/g,
		  ''
		);
		*/
		fixPose: function (poseJson) {
			for (const name in poseJson) {
				Object.keys(VRMHumanBoneList).forEach((key) => {
					const parts = VRMHumanBoneList[key]
					if (!poseJson[name][parts]) {
						poseJson[name][parts] = {rotation: [0, 0, 0, 1]}
					}
				});
			}
			return poseJson
		},

		//VRoid.three.testCamera("VRoid", "model1") //modelIDは省略可
		//VRoid.three.layer.VRoid.camera.position
		testCamera: async function (layerID, modelID, cb, isAdvanced) {

			//最初に既にあった場合は閉じる
			if (document.getElementById('VRoid_test_camera_move') && document.getElementById('VRoid_test_camera_move').checked) $("#VRoid_test_camera_move").click()
			if ($("#VRoid_test_camera_animation").text() == "RETURN") $("#VRoid_test_camera_animation").click()
			$("#VRoid_test_camera_close").click()

			//is_stopをtrue ゲームを停止状態にする
			const tmp_is_stop = TYRANO.kag.stat.is_stop;
			TYRANO.kag.stat.is_stop = true
		
			//キーコンフィグを保存して無効にする
			const tmpKeyconfig = TYRANO.kag.stat.enable_keyconfig;
			TYRANO.kag.stat.enable_keyconfig = false;
		
			const thisLayer = this.layer[layerID];

			//元のcameraの向きと距離を計算して初期状態を決定
			const lookAtDistance = thisLayer.camera.position.distanceTo(new THREE.Vector3(0, 0 , 0));
			const cameraDirection = new THREE.Vector3();
			thisLayer.camera.getWorldDirection(cameraDirection);

			const targetPosition = new THREE.Vector3();
			targetPosition.copy(thisLayer.camera.position).add(cameraDirection.multiplyScalar(lookAtDistance));

			const OrbitControls = await this.importModule("OrbitControls", "./module/three/controls/OrbitControls.js")
			thisLayer.controls = new OrbitControls(thisLayer.camera, thisLayer.renderer.domElement)

			// 取得した方向を targetに設定
			thisLayer.controls.target.copy(targetPosition);
			thisLayer.controls.update();

			//以下を設定すると動きはなめらかになるけどlogの出力が増えて邪魔
			//thisLayer.controls.screenSpacePanning = true
			//thisLayer.controls.enableDamping = true;
			
			const $layerID = $("#" + layerID)
			
			//移動前の位置を保存
			const tmpParent = $layerID.parent();
			const tmpIndex = $layerID.css("z-index");
			
			$("#tyrano_base").append("<div id='VRoid_test_camera' style='position: absolute; z-index: 900000001;width: 100%;'></div>")
			$layerID.css({"z-index": "1", "pointer-events": "auto"}).appendTo('#VRoid_test_camera');
			thisLayer.controls.update()

			$("#VRoid_test_camera").on('touchmove wheel', (e) => {
				e.stopPropagation();
			});
		
			const pos = thisLayer.camera.position
			const rot = thisLayer.camera.rotation

			function outputLog(pos, rot) {
				/*
				console.log("pos.x = " + minRound(pos.x) + "\n" +
							"pos.y = " + minRound(pos.y) + "\n" +
							"pos.z = " + minRound(pos.z) + "\n" +
							"rot.x = " + minRound(rot.x) + "\n" +
							"rot.y = " + minRound(rot.y) + "\n" +
							"rot.z = " + minRound(rot.z))
				console.log("========")
				*/
				console.log("[VRoid_camera_move layerID=" + layerID + " x=" + minRound(pos.x) + " y=" + minRound(pos.y) + " z=" + minRound(pos.z) + " rotX=" + minRound(rot.x) + " rotY=" + minRound(rot.y) + " rotZ=" + minRound(rot.z) + "]")
				//console.log("========")
			}
			outputLog(pos, rot)

			//thisLayer.controls.addEventListener("change", () => {
			thisLayer.controls.addEventListener("end", () => {
				outputLog(pos, rot)
			});


			const scHeight = Number(TYRANO.kag.config.scHeight)

			let html = "<div id='VRoid_test_camera_close' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 20px; height: 50px; line-height: 50px;right: 0; text-align: center;cursor: pointer;'>CLOSE</div>" +
				"<div id='VRoid_test_camera_capture' style='position: absolute; z-index: 2; background-color: rgba(255,255,255,0.5); color:#000; width: 105px; font-size: 14px; height: 50px; line-height: 50px;right: 0; top: " + (scHeight - 50)  + "px; text-align: center;cursor: pointer;'>CAPTURE</div>" +
				"<div id='VRoid_test_camera_range' style='position: absolute; z-index: 2; right: 125px; top: " + (scHeight - 42)  + "px;'><input id='capture_range' type='range' value='1' min='0.5' max='5' step='0.5' style='cursor: pointer; margin-left: 40px;'><textarea readonly id='capture_text' rows='1' style='resize: none;width: 30px;padding: 5px 10px; font-size: 14px; margin-left: 20px; background:rgba(255,255,255,0.8); border: 2px solid rgba(255,255,255,0.5); border-radius: 6px; overflow: hidden;'>x1.0</textarea></div>"

			//modelIDの指定があった場合のみ、ポーズ変更や編集を追加
			const modelPosition = {}; //モデルの初期値を格納する
			if (modelID) {
				modelPosition.x = TYRANO.kag.stat.VRoid.model[modelID].x
				modelPosition.y = TYRANO.kag.stat.VRoid.model[modelID].y
				modelPosition.z = TYRANO.kag.stat.VRoid.model[modelID].z
				html += "<select id='select_pose' style='background-color: rgba(255,255,255,0.8); position: absolute; z-index: 2; right: 120px; width: 144px; height: 39px; text-align: center; font-size: 18px; padding-left: 10px;'>"
					for (const key in VRoid.three.poseJson) {
						html += "<option value='" + key + "' id='" + key + "'>" + key + "</option>"
					}
				html += "</select>" +
				"<div id='VRoid_test_camera_lookAt_div' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 14px; height: 50px; line-height: 50px;right: 0; text-align: center; top:60px;'><label for='VRoid_test_camera_lookAt' style='cursor: pointer;'><input type='checkbox' id='VRoid_test_camera_lookAt' name='lookAt'  style='position: relative;top: 2px;'> カメラ目線</label></div>" +
				"<div id='VRoid_test_camera_custom_div' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 14px; height: 50px; line-height: 50px;right: 0; text-align: center; top:120px;'><label for='VRoid_test_camera_custom' style='cursor: pointer;'><input type='checkbox' id='VRoid_test_camera_custom' name='lookAt'  style='position: relative;top: 2px;'> ポーズ編集</label></div>" +
				"<div id='yure_range_div' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 14px; height: 300px; line-height: 20px;right: 0; text-align: center; top:180px; padding-top: 14px;'>" +
					"モデルを揺らす<br><br>" +
					"X<br>" +
					"<input id='yure_range_x' class='yure_range' type='range' value='0' min='0' max='1' step='0.01' style='cursor: pointer; width: 80%;'><br>" +
					"Y<br>" +
					"<input id='yure_range_y' class='yure_range' type='range' value='0' min='0' max='1' step='0.01' style='cursor: pointer; width: 80%;'><br>" +
					"Z<br>" +
					"<input id='yure_range_z' class='yure_range' type='range' value='0' min='0' max='1' step='0.01' style='cursor: pointer; width: 80%;'><br>" +
					"Speed<br>" +
					"<input id='yure_range_t' class='yure_range' type='range' value='1' min='0.2' max='3' step='0.01' style='cursor: pointer; width: 80%;'><br>" +
					"<br><button id='yure_reset' type='button' style='cursor: pointer;'>リセット</button>" +
				"</div>" +

				"<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 12px; height: 50px; line-height: 50px;right: 0; text-align: center; top:510px; cursor: pointer;' id='VRoid_test_camera_animation'>アニメーション</div>"
			}

			$("#VRoid_test_camera").append(html)

			let tickID
			const clock = new THREE.Clock();
			function tick() {
				thisLayer.controls.update()
				tickID = requestAnimationFrame(tick)
				if (modelID) yureTest()
			}
			tick()
			
			
			$("#yure_reset").on("click", (e) => {
				document.getElementById('yure_range_x').value = 0;
				document.getElementById('yure_range_y').value = 0;
				document.getElementById('yure_range_z').value = 0;
				document.getElementById('yure_range_t').value = 1;
				VRoid.three.model[modelID].vrm.scene.position.set(modelPosition.x, modelPosition.y, modelPosition.z)
			})

			$("#VRoid_test_camera_close").on("click", (e) => {
				// 元の位置に戻す
				cancelAnimationFrame(tickID)
				thisLayer.controls.dispose();
				$layerID.css({"z-index": tmpIndex, "pointer-events": "none"}).appendTo(tmpParent);
				$("#yure_reset").click()

				//ポーズ編集が有効の時は削除する
				if (document.getElementById('VRoid_test_camera_custom') && document.getElementById('VRoid_test_camera_custom').checked) $("#VRoid_test_camera_custom").click()
				$("#VRoid_test_camera").remove();

				//ゲーム変数に保存するために実行
				this.move({type: "layer", layerID: layerID, x: pos.x, y:pos.y, z:pos.z, rotX:rot.x, rotY:rot.y, rotZ:rot.z})

				//キーコンフィグを戻す
				TYRANO.kag.stat.enable_keyconfig = tmpKeyconfig;

				//is_stopを戻す
				TYRANO.kag.stat.is_stop = tmp_is_stop;
				
				//カメラ目線を直す
				if (modelID) {
					if (tmpLookAt) {
						vrm.lookAt.target = thisLayer.camera;
					} else {
						delete vrm.lookAt.target
						vrm.lookAt.reset()
					}
				}

				
				$(document).off(".test_camera")
				
				//nextOrder
				if (cb && typeof cb === 'function') cb()

				e.stopPropagation();
			})

			$("#VRoid_test_camera_capture").on("click", (e) => {
				//スクリーンショット撮影
				$("#VRoid_test_camera_capture").css("pointer-events", "none")
				this.capture(layerID, $("#capture_range").val())
				e.stopPropagation();
			})

			$("#capture_range").on('change input', function() {
				$("#capture_text").html("x" + $(this).val());
			});
			
			$("#select_pose").change(function() {
				VRoid.three.pose(modelID, $(this).val())
			});

			//↑↓キーを押した時の処理
			$(document).on("keydown.test_camera",function(e){
				const select = $('#select_pose');
				if (select.length && (e.which == 38 || e.which == 40)) {
					e.preventDefault();
					const options = select.find('option');
					let selectedIndex = select.prop('selectedIndex');
					if (e.which == 38 && selectedIndex > 0) {
						selectedIndex--;
					} else if (e.which == 40 && selectedIndex < options.length - 1) {
						selectedIndex++;
					}
					select.prop('selectedIndex', selectedIndex);
					VRoid.three.pose(modelID, select.val())
				}
			});

			let vrm
			let tmpLookAt = false
			if (modelID) {
				//カメラ目線の初期設定
				vrm = this.model[modelID].vrm
				let camera_lookAt = document.getElementById('VRoid_test_camera_lookAt');
				if (vrm.lookAt.target) {
					camera_lookAt.checked = true;
					tmpLookAt = true;
				}

				$("#VRoid_test_camera_lookAt").on("click", (e) => {
					if (document.getElementById('VRoid_test_camera_lookAt').checked) {
						vrm.lookAt.target = thisLayer.camera;
					} else {
						delete vrm.lookAt.target
						vrm.lookAt.reset()
					}
					e.stopPropagation();
				});

				$("#VRoid_test_camera_custom").one("click", (e) => {
					e.stopPropagation();
					document.getElementById('VRoid_test_camera_custom').checked = true;
					this.useTransformControls(modelID)
				});

				$("#VRoid_test_camera_animation").one("click", (e) => {
					//アニメーションファイルプレビュー機能
					e.stopPropagation();
					this.animationPreview(modelID)
				})

			}

			let VRoid_test_camera = document.getElementById('VRoid_test_camera');

			VRoid_test_camera.addEventListener('click', function(e){
				e.stopPropagation();
			});

			//小さい数を四捨五入
			function minRound(val) {
				const digit = 10000000
				return (Math.round(val * digit) / digit)
			}
			
			//揺れテスト
			function yureTest() {
				const elapsedTime = clock.getElapsedTime();
				const xAmplitude = parseFloat(document.getElementById('yure_range_x').value);
				const yAmplitude = parseFloat(document.getElementById('yure_range_y').value);
				const zAmplitude = parseFloat(document.getElementById('yure_range_z').value);
				const timeScale = parseFloat(document.getElementById('yure_range_t').value);

				// sin波で揺れを計算
				const newX = modelPosition.x + xAmplitude * Math.sin(elapsedTime * Math.PI * timeScale);
				const newY = modelPosition.y + yAmplitude * Math.sin(elapsedTime * Math.PI * timeScale);
				const newZ = modelPosition.z + zAmplitude * Math.sin(elapsedTime * Math.PI * timeScale);

				VRoid.three.model[modelID].vrm.scene.position.set(newX, newY, newZ)

			}

			//スライダー変更時にclockリセット
			document.querySelectorAll('.yure_range').forEach(slider => {
				slider.addEventListener('input', clock.start());
			});
		},

		//アニメーションプレビュー
		animationPreview: async function (modelID) {
			const name = "__VRoidPluginAnimationTest"
			let isImport = false
			const that = this
			
			//データ初期化
			this.animType[name] = null
			this.vrma[name] = null
			this.fbx[name] = null
			this.animEmo[name] = null
			
			let currentAnim = ""
			let currentEmo = ""
			let currentDuration = 0
			let currentTime = 0

			//揺れチェック機能をとめる
			$("#yure_reset").click()
			$("#yure_range_div").css("display", "none")
			$("#select_pose").css("display", "none")
			$("#VRoid_test_camera_lookAt_div").css("display", "none")
			$("#VRoid_test_camera_custom_div").css("display", "none")
			$("#VRoid_test_camera_move_div").css("display", "none")
			$("#VRoid_test_camera_close").css("display", "none")
			$("#VRoid_test_camera_animation").css({"font-size": "18px", "top": "0"}).text("RETURN")

			let html = "<div id='VRoid_test_animation_div' style=' position: absolute; z-index: 1; top:0; left:0; width:100%;'>"
					+ "<div style='position: absolute; z-index: 1; background-color: rgba(0,0,0,0.5); color:#fff; width: 500px; font-size: 12px; height: 20px; line-height: 20px; right: 120px; text-align: center; top:0px;'>アニメーションファイル（vrma,fbx）やemoTimelineファイルをウインドウにドロップ</div>"
					+ "<div id='animInfo' style='overflow: hidden; white-space: nowrap; position: absolute; z-index: 1; background-color: rgba(0,0,0,0.5); color:#fff; width: 500px; font-size: 12px; height: 14px; line-height: 14px; right: 120px; text-align: left; top:20px; display: none;'></div>"
					+ "<div id='animTime' style='overflow: hidden; white-space: nowrap;position: absolute; z-index: 1; background-color: rgba(0,0,0,0.5); color:#fff; width: 500px; font-size: 12px; height: 20px; line-height: 20px; right: 120px; text-align: left; top:34px; display: none;'></div>"

					+ "<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 14px; height: 50px; line-height: 50px;right: 0; text-align: left; top:60px;' id='VRoid_test_loop_div'><label for='VRoid_test_loop' style='cursor: pointer;'>　<input class='VRoid_test_animation' type='checkbox' id='VRoid_test_loop' name='loop'  style='position: relative;top: 2px;'> loop</label></div>"
					+ "<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 14px; height: 50px; line-height: 50px;right: 0; text-align: left; top:120px;' id='VRoid_test_resetHips_div'><label for='VRoid_test_resetHips' style='cursor: pointer;'>　<input class='VRoid_test_animation' type='checkbox' id='VRoid_test_resetHips' name='resetHips' checked style='position: relative;top: 2px;'> resetHips</label></div>"
					+ "<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 14px; height: 50px; line-height: 50px;right: 0; text-align: left; top:180px;' id='VRoid_test_keep_div'><label for='VRoid_test_keep' style='cursor: pointer;'>　<input class='VRoid_test_animation' type='checkbox' id='VRoid_test_keep' name='keep'  style='position: relative;top: 2px;'> keep</label></div>"


					+ "<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 8px; height: 50px; line-height: 50px;right: 0; text-align: left; top:240px;' id='VRoid_test_rate_div'> <input class='VRoid_test_animation' type='text' name='rate' value=1 size=2 oninput=\"this.value = this.value.replace(/[^0-9.]/g, '');\" style='margin-left: 10px; text-align: right;'> rate</div>"
					+ "<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 8px; height: 50px; line-height: 50px;right: 0; text-align: left; top:300px;' id='VRoid_test_fadeIn_div'> <input class='VRoid_test_animation' type='text' name='fadeIn' value=0 size=2 oninput=\"this.value = this.value.replace(/[^0-9]/g, '');\" style='margin-left: 10px; text-align: right;'> fadeIn</div>"
					+ "<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 8px; height: 50px; line-height: 50px;right: 0; text-align: left; top:360px;' id='VRoid_test_fadeOut_div'> <input class='VRoid_test_animation' type='text' name='fadeOut' value=0 size=2 oninput=\"this.value = this.value.replace(/[^0-9]/g, '');\" style='margin-left: 10px; text-align: right;'> fadeOut</div>"
					+ "<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 8px; height: 50px; line-height: 50px;right: 0; text-align: left; top:420px;' id='VRoid_test_fadeLoop_div'> <input class='VRoid_test_animation' type='text' name='fadeLoop' value=0 size=2 oninput=\"this.value = this.value.replace(/[^0-9]/g, '');\" style='margin-left: 10px; text-align: right;'> fadeLoop</div>"

					+ "<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 8px; height: 50px; line-height: 50px;right: 0; text-align: left; top:480px;' id='VRoid_test_startTime_div'> <input class='VRoid_test_animation' type='text' name='startTime' value=0 size=2 oninput=\"this.value = this.value.replace(/[^0-9.]/g, '');\" style='margin-left: 10px; text-align: right;'> startTime</div>"
					+ "<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 8px; height: 50px; line-height: 50px;right: 0; text-align: left; top:540px;' id='VRoid_test_endTime_div'> <input class='VRoid_test_animation' type='text' name='endTime' value=0 size=2 oninput=\"this.value = this.value.replace(/[^0-9.]/g, '');\" style='margin-left: 10px; text-align: right;'> endTime</div>"

					+ "<div style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 18px; height: 50px; line-height: 50px;right: 0; text-align: center; top:600px; cursor: pointer;' id='VRoid_test_stop'>STOP</div>"

				+ "</div>"

			$("#VRoid_test_camera").append(html)
			
			$(".VRoid_test_animation").on("input", (e) => {
			
				if (!isImport) return

				const params = {
					modelID: modelID,
					name: name,
					rate: Number($("input[name='rate']").val() || 1),
					loop: $("input[name='loop']").prop("checked") ? 0 : 1,
					fadeIn: Number($("input[name='fadeIn']").val() || 0),
					fadeOut: Number($("input[name='fadeOut']").val() || 0),
					fadeLoop: Number($("input[name='fadeLoop']").val() || 0),
					wait: true,
					skip: false,
					keep: $("input[name='keep']").prop("checked"),
					startTime: Number($("input[name='startTime']").val() || 0),
					endTime: Number($("input[name='endTime']").val() || 0),
					resetHips: $("input[name='resetHips']").prop("checked"),
					emoTimeline: name,
				};

				//アニメーションStart
				that.animation(params)
				isStop = false

			});

			let isStop = false
			$("#VRoid_test_stop").on("click", (e) => {
				//アニメーションStop
				that.stop_animation(modelID, Number($("input[name='fadeOut']").val() || 0), null, null, null, $("input[name='keep']").prop("checked"))
				isStop = true
			});
			$("#VRoid_test_stop").click()

			$("#VRoid_test_camera").on("dragover", function (event) {
				event.preventDefault(); //これがないとdropイベントが発火しない
				//$(this).css("background-color", "rgba(240, 240, 240, 0.5)");
			});

			$("#VRoid_test_camera").on("dragleave", function () {
				//$(this).css("background-color", "");
			});

			$("#VRoid_test_camera").on("drop", function (event) {
				event.preventDefault();

				let files = event.originalEvent.dataTransfer.files;
				if (files.length > 0) {
					const promises = [];
					const _warn = console.warn;
					
					let file = files[0].path
					let fileName = files[0].name

					// 拡張子を取り出す
					const type = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
					
					// nameは__VRoidPluginAnimationTest固定済み

					//一時的に警告を無効化
					console.warn = function() {};
					
					let animData = null
					const promise = new Promise(function(resolve, reject) {
					
						if (type == "vrma") {
							const moduleURL = "./module/three-vrm/three-vrm-animation.module.min.js"
							that.importModule("VRMAnimationLoaderPlugin", moduleURL).then( ( VRMAnimationLoaderPlugin ) => {

								const loader = new GLTFLoader();
								loader.register((parser) => {
									return new VRMAnimationLoaderPlugin(parser);
								});


								loader.load(

									file,

									// called when the resource is loaded
									(gltf) => {
										animData = gltf.userData.vrmAnimations
										if (animData != null) {
											that.vrma[name] = animData
											that.animType[name] = "vrma"
											currentDuration = animData[0].duration
											currentAnim = fileName
										}
										resolve();
									},
									// called while loading is progressing
									(progress) => {
										//console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%')
									},

									// called when loading has errors
									(error) => {
										console.log(error)
										that.error("VRMAデータのロード時にエラーが発生しました。")
										resolve();
									}
								)

							});

						} else if (type == "fbx") {
							const moduleURL = "./module/mixamo/loadMixamoAnimation.js"
							that.importModule("loadMixamoAsset", moduleURL).then( ( loadMixamoAsset ) => {

								loadMixamoAsset( file ).then( ( asset ) => {
									animData = asset
									if (asset != null) {
										that.fbx[name] = asset
										that.animType[name] = "fbx"
										currentDuration = asset.animations[0].duration
										currentAnim = fileName

									}
									resolve();
								}).catch((error) => {
									console.log(error)
									that.error("FBXデータのロード時にエラーが発生しました。")
									resolve();
								});
							}).catch((error) => {
								console.log(error)
								that.error("FBXデータのロード時にエラーが発生しました。")
								resolve();
							});
						} else if (type == "json") {
							//jsonファイルはemo用と判定する
							$.getJSON(file).done(function(json) {

								//アニメーション用タイムラインを追加
								const timeline = Object.keys(json).map(key => ({
									expressionName: key,
									val: json[key]
								}));

								that.animEmo[name] = json;
								currentEmo = fileName

								resolve();
							}).fail(function(err) { 
								that.error(storage + " ファイルが存在しないか、jsonファイルの記述が間違っています。", err);
								resolve();
							});
						}
					
					});
					
					promises.push(promise);

					Promise.all(promises).then(function() {
						//警告を戻す
						console.warn = _warn;

						const params = {
							modelID: modelID,
							name: name,
							rate: Number($("input[name='rate']").val() || 1),
							loop: $("input[name='loop']").prop("checked") ? 0 : 1,
							fadeIn: Number($("input[name='fadeIn']").val() || 0),
							fadeOut: Number($("input[name='fadeOut']").val() || 0),
							fadeLoop: Number($("input[name='fadeLoop']").val() || 0),
							wait: true,
							skip: false,
							keep: $("input[name='keep']").prop("checked"),
							startTime: Number($("input[name='startTime']").val() || 0),
							endTime: Number($("input[name='endTime']").val() || 0),
							resetHips: $("input[name='resetHips']").prop("checked"),
							emoTimeline: name,
						};


						$("#animInfo").css("display", "").text("　ファイル名：" + currentAnim + "　/　emoTimeline：" + currentEmo)
						$("#animTime").css("display", "").text("　総再生時間：" + currentDuration + "　/　再生時間：" + currentTime)

						//アニメーションStart
						if (animData || isImport) {
							that.animation(params)
							isImport = true
							isStop = false
						}

					});
			
				}
				//$(this).css("background-color", "");

			});

			//再生時間表示
			let tickID
			const model = this.model[modelID]
			const $animTime = $("#animTime")
			function tick() {
				tickID = requestAnimationFrame(tick)
				if (model && model.mixer && model.mixer.action) {
					currentTime = model.mixer.action.time
					$animTime.text("　総再生時間：" + currentDuration + "　再生時間：" + currentTime)
				} else if (model.mixer === null && currentTime > 0) {
					if (!isStop) {
						//ストップボタンを使わずにアニメーションが終了したときは総再生時間を入れる
						currentTime = currentDuration
						$animTime.text("　総再生時間：" + currentDuration + "　再生時間：" + currentTime)
					}
				}
			}
			tick()

			//終了処理
			$("#VRoid_test_camera_animation").one("click", (e) => {
				e.stopPropagation();
				cancelAnimationFrame(tickID)
				$("#VRoid_test_animation_div").remove()
				$("#yure_range_div").css("display", "")
				$("#select_pose").css("display", "")
				$("#VRoid_test_camera_lookAt_div").css("display", "")
				$("#VRoid_test_camera_custom_div").css("display", "")
				$("#VRoid_test_camera_move_div").css("display", "")
				$("#VRoid_test_camera_close").css("display", "")
				$("#VRoid_test_camera_animation").css({"font-size": "12px", "top": "510px"}).text("アニメーション")

				$("#VRoid_test_camera").off("dragover").off("dragleave").off("drop");

				$("#VRoid_test_camera_animation").one("click", (e) => {
					//アニメーションファイルプレビュー機能
					e.stopPropagation();
					$("#VRoid_test_camera_capture").css("pointer-events", "none")
					this.animationPreview(modelID)
					e.stopPropagation();
				})
			});

		},
		
		//リップシンク
		lipSync: function (pm, modelID, lipSyncData, posOnly) {
			const model = VRoid.three.model[modelID]
			const vrm = model.vrm
			const vo = TYRANO.kag.tmp.map_se[pm.buf]
			const lipList = lipSyncData.invalidList
			
			const that = this
			const headPosition = new THREE.Vector3();
			const cameraPosition = new THREE.Vector3();
			const camera = that.layer[model.layerID].camera
			const head = vrm.humanoid.getNormalizedBoneNode('head');
			
			if (posOnly) {
				const pos = getModelPos()
				vo.pos(pos[0], pos[1], pos[2])
				return
			}

			const analyser = Howler.ctx.createAnalyser();
			analyser.fftSize = 256;
			
			vo._sounds[0]._node.connect(analyser);


			const tStat = TYRANO.kag.stat
			const saveModel = tStat.VRoid.model[modelID];
			const expression = saveModel.expression
			function tick() {
				if ( vrm ) {

					if (vo && vo.playing()) {
						requestAnimationFrame(tick)

						//モデルの位置で再生位置を変更する
						if (lipSyncData.isSyncPos) {
							const pos = getModelPos()
							vo.pos(pos[0], pos[1], pos[2])
						}

						//無効リストに入っている表情を0に
						for (let i = 1; i < lipList.length; i++) {
							vrm.expressionManager.setValue(lipList[i], 0)
						}

						//既存の表情をmicMix値で合成
						for (const lip in lipSyncData.lipData) {
							let minVal = 0;
							for (let key in expression) {
								if (lip == expression[key].expressionName) {
									minVal = expression[key].val * lipSyncData.micMix;
								}
							}
							vrm.expressionManager.setValue(lip, Math.max(getByteFrequencyDataAverage(analyser, lipSyncData.lipData[lip]), minVal))
						}

					} else {
						for (let key in expression) {
							for (let i = 0; i < lipList.length; i++) {
								if (lipList[i] == expression[key].expressionName) {
									VRoid.three.emotion(modelID, "", lipSyncData.fadeOut, "default", null, false, false, true, lipList[i], expression[key].val)
								}
							}
						}

					}

				}
			}
			tick()
			

			function getModelPos (){
				head.getWorldPosition(headPosition)
				camera.getWorldPosition(cameraPosition);
				// 各軸の距離を計算
				const distanceX = (headPosition.x - cameraPosition.x) * lipSyncData.posRate;
				const distanceY = (headPosition.y - cameraPosition.y) * lipSyncData.posRate;
				const distanceZ = (headPosition.z - cameraPosition.z);

				return [distanceX, distanceY, distanceZ]
			}

			//再生中の音量を正規化して取得
			function getByteFrequencyDataAverage(analyser, val) {
				const bufferLength = analyser.frequencyBinCount;
				const dataArray = new Uint8Array(bufferLength);

				analyser.getByteFrequencyData(dataArray);

				let sum = 0;
				for (let i = 0; i < bufferLength; i++) {
					sum += dataArray[i];
				}

				const average = sum / bufferLength;
				let normalizedValue = average / 255;  // 0から1の範囲に正規化
				
				normalizedValue = normalizedValue * val;  //1～0が入っているはず
				
				//最後にコンフィグvolumeで補正する　ボリューム0.2くらいまではいい感じ
				const voVolume = vo.volume()
				normalizedValue = normalizedValue * (1 + Math.pow(1 - voVolume, 2));
				normalizedValue = Math.min(normalizedValue  * lipSyncData.micVolume, 1);  //micVolumeの値で補正
				
				//閾値以下なら0にする
				if (normalizedValue <= lipSyncData.micMinLevel) normalizedValue = 0

				return normalizedValue
			}
		},

		//ポーズデータ編集用の追加関数
		//VRoid.three.useTransformControls("model1")
		useTransformControls: async function (modelID) {
			const model = this.model[modelID]
			const vrm = model.vrm
			const scene = vrm.scene
			const layerID = model.layerID
			const thisLayer = this.layer[layerID];
		
			//待機モーションを止める
			const tmpIsAnimating = model.isAnimating
			model.isAnimating = true
			this.updateWaitingAnimation(model.waitingBone, model.waitingAnimationVal, 0)
			
			//揺れチェック機能をとめる
			$("#yure_reset").click()
			$("#yure_range_div").css("display", "none")
			$("#VRoid_test_camera_animation").css("display", "none")
		
			//TransformControlsのインポート
			const TransformControls = await this.importModule("TransformControls", "./module/three/controls/TransformControls.js")

			const tcSize = 0.2
			const sensitivity = 1;  // 感度調整用のスケール（0.1～1.0などの範囲で調整）　未使用
			
			const historyData = [];
			let historyData2 = [];

			let transformControlsMap = {};
			const normalizedPose = vrm.humanoid.getNormalizedPose()
			Object.keys(normalizedPose).forEach((key) => {
				const transformControls = new TransformControls(thisLayer.camera, thisLayer.renderer.domElement);

				// OrbitControlsとTransformControlsのイベント設定
				transformControls.addEventListener('dragging-changed', function (event) {
					thisLayer.controls.enabled = !event.value;  // OrbitControlsの無効化/有効化
					
					if (event.value) {
						const pose = vrm.humanoid.getNormalizedPose()
						if (historyData.length > 0) {
							if (JSON.stringify(historyData[historyData.length - 1], null) !== JSON.stringify(pose, null)) {
								historyData.push(pose)

								$VRoid_test_camera_undo.css("opacity", "")
								historyData2 = []
								$VRoid_test_camera_redo.css("opacity", "0.5")

							}
						} else {
							historyData.push(pose)
							historyData2 = []
							$VRoid_test_camera_redo.css("opacity", "0.5")
						}
					} else {
						if (historyData.length > 0) $VRoid_test_camera_undo.css("opacity", "")
					}
					
					Object.values(transformControlsMap).forEach(tc => {
						tc.size = tcSize;
						tc.visible = false;
						tc.enabled = false;
					})
					transformControls.size = 1.5;
					transformControls.visible = true
					transformControls.enabled = true
					$VRoid_test_camera_bonename.text(transformControls.object.name.replace("Normalized_", ""))
					
					$VRoid_test_camera_betsu.css("opacity", "")
				});

				// ドラッグイベントで感度を調整
				transformControls.addEventListener('objectChange', function () {
					if (transformControls.dragging && transformControls.getMode() === 'rotate') {
						const rotation = transformControls.object.rotation;
						//感度調整未使用
						//rotation.x *= sensitivity;
						//rotation.y *= sensitivity;
						//rotation.z *= sensitivity;
						$VRoid_test_camera_bonex.text("x: " + rotation.x)
						$VRoid_test_camera_boney.text("y: " + rotation.y)
						$VRoid_test_camera_bonez.text("z: " + rotation.z)
					}
				});

				const boneNode = vrm.humanoid.getNormalizedBoneNode(key)
				thisLayer.scene.add(transformControls);
				transformControls.setMode('rotate');
				transformControls.attach(boneNode)
				transformControls.size = tcSize;

				transformControlsMap[boneNode.uuid] = transformControls;
			});

			let html = "<div class='VRoid_test_camera_custom_ui' id='VRoid_test_camera_import' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 20px; height: 50px; line-height: 50px; left: 340px; text-align: center; top:0px;cursor: pointer;'>IMPORT</div>" +
				"<div class='VRoid_test_camera_custom_ui' id='VRoid_test_camera_export' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 20px; height: 50px; line-height: 50px; left: 464px; text-align: center; top:0px;cursor: pointer;'>EXPORT</div>" +
				"<div class='VRoid_test_camera_custom_ui' id='VRoid_test_camera_undo' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 20px; height: 50px; line-height: 50px; left: 588px; text-align: center; top:0px;cursor: pointer;'>UNDO</div>" +
				"<div class='VRoid_test_camera_custom_ui' id='VRoid_test_camera_redo' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 20px; height: 50px; line-height: 50px; left: 712px; text-align: center; top:0px;cursor: pointer;'>REDO</div>" +
				"<div class='VRoid_test_camera_custom_ui' id='VRoid_test_camera_betsu' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; font-size: 20px; height: 50px; line-height: 50px; left: 836px; text-align: center; top:0px;cursor: pointer;'>選択解除</div>" +
				"<div class='VRoid_test_camera_custom_ui' id='VRoid_test_camera_bonename' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 600px; font-size: 20px; height: 30px; line-height: 30px;left: 340px; text-align: center; top:690px'></div>" +
				"<div class='VRoid_test_camera_custom_ui' id='VRoid_test_camera_bonex' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; padding: 0 10px; width: 180px; font-size: 12px; height: 20px; line-height: 30px;left: 340px; text-align: left; top:670px; white-space: nowrap;'></div>" +
				"<div class='VRoid_test_camera_custom_ui' id='VRoid_test_camera_boney' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; padding: 0 10px; width: 180px; font-size: 12px; height: 20px; line-height: 30px;left: 540px; text-align: left; top:670px; white-space: nowrap;'></div>" +
				"<div class='VRoid_test_camera_custom_ui' id='VRoid_test_camera_bonez' style=' position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; padding: 0 10px; width: 180px; font-size: 12px; height: 20px; line-height: 30px;left: 740px; text-align: left; top:670px; white-space: nowrap;'></div>"

				+ "<div class='VRoid_test_camera_custom_ui' style='font-size: 12px; position: absolute; z-index: 2; background-color: rgba(0,0,0,0.5); color:#fff; width: 105px; height: 480px; line-height: 1em; right: 0; text-align: center; top:180px;'>"
					+ "<div style='position: absolute; z-index: 2; top: 10px; left: 10px; font-size: 14px;'>右手</div>"
					+ "<div style='position: absolute; z-index: 2; top: 10px; right: 10px;'><label for='yubi_r_ikkatu' style='cursor: pointer;'><input type='checkbox' id='yubi_r_ikkatu' name='right'  style='position: relative;top: 2px;'> 一括</label></div>"

					+ "<div style='position: absolute; z-index: 2; top: 30px; left: 10px;'>親指</div>"
					+ "<div style='position: absolute; z-index: 2; top: 70px; left: 10px;'>人差し指</div>"
					+ "<div style='position: absolute; z-index: 2; top: 110px; left: 10px;'>中指</div>"
					+ "<div style='position: absolute; z-index: 2; top: 150px; left: 10px;'>薬指</div>"
					+ "<div style='position: absolute; z-index: 2; top: 190px; left: 10px;'>小指</div>"

					+ "<div id='rightThumb_val'  style='position: absolute; z-index: 2; top: 32px; width: 45px; right: 10px; font-size: 10px; text-align: right;'>0.000</div>"
					+ "<div id='rightIndex_val'  style='position: absolute; z-index: 2; top: 72px; width: 45px; right: 10px; font-size: 10px; text-align: right;'>0.000</div>"
					+ "<div id='rightMiddle_val' style='position: absolute; z-index: 2; top: 112px; width: 45px; right: 10px; font-size: 10px; text-align: right;'>0.000</div>"
					+ "<div id='rightRing_val'   style='position: absolute; z-index: 2; top: 152px; width: 45px; right: 10px; font-size: 10px; text-align: right;'>0.000</div>"
					+ "<div id='rightLittle_val' style='position: absolute; z-index: 2; top: 192px; width: 45px; right: 10px; font-size: 10px; text-align: right;'>0.000</div>"

					+ "<input id='rightThumb'  class='yubi_range' type='range' value='0' min='-0.5' max='1' step='0.001' style='display: block; cursor: pointer; width: 85px; left:10px; position: absolute; z-index: 2; top: 45px;'>"
					+ "<input id='rightIndex'  class='yubi_range' type='range' value='0' min='-0.5' max='1' step='0.001' style='display: block; cursor: pointer; width: 85px; left:10px; position: absolute; z-index: 2; top: 85px;'>"
					+ "<input id='rightMiddle' class='yubi_range' type='range' value='0' min='-0.5' max='1' step='0.001' style='display: block; cursor: pointer; width: 85px; left:10px; position: absolute; z-index: 2; top: 125px;'>"
					+ "<input id='rightRing'   class='yubi_range' type='range' value='0' min='-0.5' max='1' step='0.001' style='display: block; cursor: pointer; width: 85px; left:10px; position: absolute; z-index: 2; top: 165px;'>"
					+ "<input id='rightLittle' class='yubi_range' type='range' value='0' min='-0.5' max='1' step='0.001' style='display: block; cursor: pointer; width: 85px; left:10px; position: absolute; z-index: 2; top: 205px;'>"


					+ "<div style='position: absolute; z-index: 2; top: 240px; left: 10px; font-size: 14px;'>左手</div>"
					+ "<div style='position: absolute; z-index: 2; top: 240px; right: 10px;'><label for='yubi_l_ikkatu' style='cursor: pointer;'><input type='checkbox' id='yubi_l_ikkatu' name='left'  style='position: relative;top: 2px;'> 一括</label></div>"

					+ "<div style='position: absolute; z-index: 2; top: 260px; left: 10px;'>親指</div>"
					+ "<div style='position: absolute; z-index: 2; top: 300px; left: 10px;'>人差し指</div>"
					+ "<div style='position: absolute; z-index: 2; top: 340px; left: 10px;'>中指</div>"
					+ "<div style='position: absolute; z-index: 2; top: 380px; left: 10px;'>薬指</div>"
					+ "<div style='position: absolute; z-index: 2; top: 420px; left: 10px;'>小指</div>"

					+ "<div id='leftThumb_val'  style='position: absolute; z-index: 2; top: 262px; width: 45px; right: 10px; font-size: 10px; text-align: right;'>0.000</div>"
					+ "<div id='leftIndex_val'  style='position: absolute; z-index: 2; top: 302px; width: 45px; right: 10px; font-size: 10px; text-align: right;'>0.000</div>"
					+ "<div id='leftMiddle_val' style='position: absolute; z-index: 2; top: 342px; width: 45px; right: 10px; font-size: 10px; text-align: right;'>0.000</div>"
					+ "<div id='leftRing_val'   style='position: absolute; z-index: 2; top: 382px; width: 45px; right: 10px; font-size: 10px; text-align: right;'>0.000</div>"
					+ "<div id='leftLittle_val' style='position: absolute; z-index: 2; top: 422px; width: 45px; right: 10px; font-size: 10px; text-align: right;'>0.000</div>"

					+ "<input id='leftThumb'  class='yubi_range' type='range' value='0' min='-0.5' max='1' step='0.001' style='display: block; cursor: pointer; width: 85px; left:10px; position: absolute; z-index: 2; top: 275px;'>"
					+ "<input id='leftIndex'  class='yubi_range' type='range' value='0' min='-0.5' max='1' step='0.001' style='display: block; cursor: pointer; width: 85px; left:10px; position: absolute; z-index: 2; top: 315px;'>"
					+ "<input id='leftMiddle' class='yubi_range' type='range' value='0' min='-0.5' max='1' step='0.001' style='display: block; cursor: pointer; width: 85px; left:10px; position: absolute; z-index: 2; top: 355px;'>"
					+ "<input id='leftRing'   class='yubi_range' type='range' value='0' min='-0.5' max='1' step='0.001' style='display: block; cursor: pointer; width: 85px; left:10px; position: absolute; z-index: 2; top: 395px;'>"
					+ "<input id='leftLittle' class='yubi_range' type='range' value='0' min='-0.5' max='1' step='0.001' style='display: block; cursor: pointer; width: 85px; left:10px; position: absolute; z-index: 2; top: 435px;'>"
					
				+ "</div>"

			$("#VRoid_test_camera").append(html)

			const $VRoid_test_camera_undo = $("#VRoid_test_camera_undo")
			const $VRoid_test_camera_redo = $("#VRoid_test_camera_redo")
			const $VRoid_test_camera_bonename = $("#VRoid_test_camera_bonename")
			const $VRoid_test_camera_betsu = $("#VRoid_test_camera_betsu")
			const $VRoid_test_camera_bonex = $("#VRoid_test_camera_bonex")
			const $VRoid_test_camera_boney = $("#VRoid_test_camera_boney")
			const $VRoid_test_camera_bonez = $("#VRoid_test_camera_bonez")

			$("#VRoid_test_camera_custom").one("click", (e) => {
				e.stopPropagation();
				document.getElementById('VRoid_test_camera_custom').checked = false;
				Object.values(transformControlsMap).forEach(transformControls => {
					thisLayer.scene.remove(transformControls);
					transformControls.dispose();
				});
				transformControlsMap = {};
				$(".VRoid_test_camera_custom_ui").remove()
				$("#yure_range_div").css("display", "")
				$("#VRoid_test_camera_animation").css("display", "")
				
				//待機モーションを更新
				this.saveWaitingAnimationVal(model.waitingBone, model.waitingAnimationVal)
				model.isAnimating = tmpIsAnimating

				$("#VRoid_test_camera_custom").one("click", (e) => {
					e.stopPropagation();
					document.getElementById('VRoid_test_camera_custom').checked = true;
					this.useTransformControls(modelID)
				});

			});

			$VRoid_test_camera_undo.css("opacity", "0.5").on("click", (e) => {
				if (historyData.length === 0) return
				
				$VRoid_test_camera_redo.css("opacity", "")
				historyData2.push(vrm.humanoid.getNormalizedPose())
				vrm.humanoid.setNormalizedPose(historyData.pop())
				if (historyData.length === 0) $VRoid_test_camera_undo.css("opacity", "0.5")

				$VRoid_test_camera_bonex.text("")
				$VRoid_test_camera_boney.text("")
				$VRoid_test_camera_bonez.text("")
			})
			
			$VRoid_test_camera_redo.css("opacity", "0.5").on("click", (e) => {
				if (historyData2.length === 0) return
				
				$VRoid_test_camera_undo.css("opacity", "")
				historyData.push(vrm.humanoid.getNormalizedPose())
				vrm.humanoid.setNormalizedPose(historyData2.pop())

				if (historyData2.length === 0) $VRoid_test_camera_redo.css("opacity", "0.5")

				$VRoid_test_camera_bonex.text("")
				$VRoid_test_camera_boney.text("")
				$VRoid_test_camera_bonez.text("")

			})
			
			$VRoid_test_camera_betsu.css("opacity", "0.5").on("click", (e) => {
				$VRoid_test_camera_betsu.css("opacity", "0.5")
				$VRoid_test_camera_bonename.text("")
				$VRoid_test_camera_bonex.text("")
				$VRoid_test_camera_boney.text("")
				$VRoid_test_camera_bonez.text("")
				Object.values(transformControlsMap).forEach(tc => {
					tc.size = tcSize;
					tc.visible = true;
					tc.enabled = true;
				})
			})

			$("#VRoid_test_camera_import").on("click", (e) => {
				//ポーズデータのインポート
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
							//VRM1以上の場合はrotationを補正
							if (vrm.meta.metaVersion !== '0') {
								Object.keys(json).forEach((key) => {
									//VRM1以上の場合はrotationを補正
									if (json[key].rotation) {
										json[key].rotation[0] = json[key].rotation[0] * (-1)
										json[key].rotation[2] = json[key].rotation[2] * (-1)
									}
								});
							}
							vrm.humanoid.setNormalizedPose(json)
						}catch(e){
							alert("インポートしたファイルの形式が不正です！")
						}
					});
				});
				 
				//ダイアログを表示
				input.click();
				e.stopPropagation();
			})

			$("#VRoid_test_camera_export").on("click", (e) => {
				//ポーズデータのエクスポート
				const poseData = vrm.humanoid.getNormalizedPose()
				
				//positionを削除
				Object.keys(poseData).forEach((key) => {
					if (poseData[key].position) delete poseData[key].position

					//VRM1以上の場合はrotationを補正
					if (vrm.meta.metaVersion !== '0') {
						if (poseData[key].rotation) {
							poseData[key].rotation[0] = poseData[key].rotation[0] * (-1)
							poseData[key].rotation[2] = poseData[key].rotation[2] * (-1)
						}
					}

				});
				
				
				const json = JSON.stringify(poseData, null, 2);
				const link = document.createElement("a");
				const ymd = new Date().toLocaleDateString('sv-SE');
				const time = new Date().toLocaleTimeString('ja-JP', {hour12:false});

				link.href = "data:text/plain," + encodeURIComponent(json);
				link.download = "new_pose_" + ymd + "_" + time + ".json";
				 
				//ファイルを保存
				link.click();
				e.stopPropagation();
			})

			$("#VRoid_test_camera_lookAt").on("click", (e) => {
				//カメラ目線のオンオフ
				e.stopPropagation();
			})

			//指スライダー処理
			$(".yubi_range").on('change input', function handler() {
				const id = $(this).attr('id')
				const val = parseFloat($(this).val())
				
				if (id.includes("right")) {
					if (document.getElementById('yubi_r_ikkatu').checked) {
						ikkatu(id, val)
						return
					}
				} else {
					if (document.getElementById('yubi_l_ikkatu').checked) {
						ikkatu(id, val)
						return
					}
				}
				
				$("#" + id + "_val").text(val.toFixed(3))
				setFingerPose(id, val)

				function ikkatu (id, val) {
					let lr = "left"
					if (id.includes("right")) lr = "right"
					
					$(".yubi_range").off("change input", handler);
					 
					const Thumb = lr + "Thumb"
					const Index = lr + "Index"
					const Middle = lr + "Middle"
					const Ring = lr + "Ring"
					const Little = lr + "Little"

					document.getElementById(Thumb).value = val;
					document.getElementById(Index).value = val;
					document.getElementById(Middle).value = val;
					document.getElementById(Ring).value = val;
					document.getElementById(Little).value = val;

					$("#" + Thumb + "_val").text(val.toFixed(3))
					$("#" + Index + "_val").text(val.toFixed(3))
					$("#" + Middle + "_val").text(val.toFixed(3))
					$("#" + Ring + "_val").text(val.toFixed(3))
					$("#" + Little + "_val").text(val.toFixed(3))

					setFingerPose(Thumb, val)
					setFingerPose(Index, val)
					setFingerPose(Middle, val)
					setFingerPose(Ring, val)
					setFingerPose(Little, val)
					
					$(".yubi_range").on("change input", handler);
				}

			});

			//指処理
			function setFingerPose (fingerName, poseStrength) {
				const fingerList = [
					"rightThumbProximal",
					"rightThumbDistal",

					"rightIndexProximal",
					"rightIndexIntermediate",
					"rightIndexDistal",

					"rightMiddleProximal",
					"rightMiddleIntermediate",
					"rightMiddleDistal",

					"rightRingProximal",
					"rightRingIntermediate",
					"rightRingDistal",

					"rightLittleProximal",
					"rightLittleIntermediate",
					"rightLittleDistal",


					"leftThumbProximal",
					"leftThumbDistal",

					"leftIndexProximal",
					"leftIndexIntermediate",
					"leftIndexDistal",

					"leftMiddleProximal",
					"leftMiddleIntermediate",
					"leftMiddleDistal",

					"leftRingProximal",
					"leftRingIntermediate",
					"leftRingDistal",

					"leftLittleProximal",
					"leftLittleIntermediate",
					"leftLittleDistal",
				]

				const isRightHand = fingerName.includes("right");
				const isThumb = fingerName.includes("Thumb");
				const direction = isRightHand ? -1 : 1;
				let thumbScale = 1;

				fingerList.forEach((boneName) => {
					if (!boneName.includes(fingerName)) return;

					const bone = vrm.humanoid.getNormalizedBoneNode(boneName);
					if (!bone) return;

					if (isThumb) {
						bone.rotation.y = direction * poseStrength * Math.PI * 0.5 * thumbScale;
						thumbScale *= 0.6;
					} else {
						bone.rotation.z = direction * poseStrength * Math.PI * 0.5;
					}
				});

			};
		},

		importModule: async function (name, url) {
			const module = await import(url);
			if (name) {
				return module[name];
			}
		},

		effectList: {
			AFTERIMAGE: {
				AfterimagePass: "./module/three/postprocessing/AfterimagePass.js",
			},

			BLOOM: {
				BloomPass: "./module/three/postprocessing/BloomPass.js",
			},

			BOKEH: {	//不具合あり（追加した画像の完全透過部分が処理されない。仕様？）
				BokehPass: "./module/three/postprocessing/BokehPass.js",
			},

			DOTSCREEN: {
				DotScreenPass: "./module/three/postprocessing/DotScreenPass.js",
			},
			
			FILM: {
				FilmPass: "./module/three/postprocessing/FilmPass.js",
			},
			
			GLITCH: {
				GlitchPass: "./module/three/postprocessing/GlitchPass.js",
			},
			
			
			RENDERPIXELATED: {
				RenderPixelatedPass: "./module/three/postprocessing/RenderPixelatedPass.js",
			},
			
			UNREALBLOOM: {
				UnrealBloomPass: "./module/three/postprocessing/UnrealBloomPass.js",
			},
			
			
			HORIZONTALBLUR: {
				HorizontalBlurShader: "./module/three/shaders/HorizontalBlurShader.js",
			},
			
			MIRROR: {
				MirrorShader: "./module/three/shaders/MirrorShader.js",
			},

			OUTLINE: {
				OutlinePass: "./module/three/postprocessing/OutlinePass.js",
			},

		},

		//エフェクトをプリロードするときに使う
		effect_import: async function (name, cb) {
			const statModule = TYRANO.kag.stat.VRoid.module;

			//大文字に統一
			name = name.toUpperCase()

			if (this.effectList[name]) {
				for (let key in this.effectList[name]) {
					const url = this.effectList[name][key]
					//セーブデータにプリロード済みフラグを設定
					statModule[url] = true
					await this.importModule(key, url)
				}
				
				//GammaCorrectionShaderは全module共通
				const url = "./module/three/shaders/GammaCorrectionShader.js"
				statModule[url] = true
				await this.importModule("GammaCorrectionShader", url)
			}
			
			if (cb && typeof cb === 'function') cb()

		},


		//VRoid.three.effect("VRoid", "Afterimage", {})
		effect: async function (layerID, name, option, cb) {
			const thisLayer = this.layer[layerID];
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveLayer = statVRoid.layer[layerID];
			option = option || {};
			
			if (!thisLayer.effect) thisLayer.effect = {};
			if (!saveLayer.effect) saveLayer.effect = [];
			
			//大文字に統一
			name = name.toUpperCase()

			//既に設定されていた場合は削除
			if (thisLayer.effect[name]) {
				thisLayer.effect[name].forEach((number) => {
					thisLayer.composer.removePass(number);
				});
			}
			thisLayer.effect[name] = []
			
			saveLayer.effect.forEach((number, index) => {
				if (number.name === name) {
					saveLayer.effect.splice(index, 1)
				}
			});

			//何らかのeffectが有効になったらtrue
			let isEffect = false

			switch (name) {
				case "AFTERIMAGE":
					isEffect = true
					//セーブデータに保存
					saveLayer.effect.push( {"name": name, "option": option} )

					const AfterimagePass = await this.importModule("AfterimagePass", this.effectList[name].AfterimagePass)

					//初期値の設定
					//constructor( damp = 0.96 )
					if (option.damp === undefined) option.damp = 0.96
					
					thisLayer.effect[name].push( new AfterimagePass(option.damp) )
					thisLayer.composer.addPass( thisLayer.effect[name][0] );

					break;


				case "BLOOM":
					isEffect = true
					//セーブデータに保存
					saveLayer.effect.push( {"name": name, "option": option} )
				
					const BloomPass = await this.importModule("BloomPass", this.effectList[name].BloomPass)

					//初期値の設定
					//constructor( strength = 1, kernelSize = 25, sigma = 4 )
					if (option.strength === undefined) option.strength = 1.25
					if (option.kernelSize === undefined) option.kernelSize = 5
					if (option.sigma === undefined) option.sigma = 0.5
					
					thisLayer.effect[name].push( new BloomPass(option.strength, option.kernelSize, option.sigma) )
					thisLayer.composer.addPass( thisLayer.effect[name][0] );

					break;


				case "BOKEH":
					isEffect = true
					//セーブデータに保存
					saveLayer.effect.push( {"name": name, "option": option} )
				
					const BokehPass = await this.importModule("BokehPass", this.effectList[name].BokehPass)

					//初期値の設定
					//constructor( scene, camera, {focus=1.0, aperture=0.025, maxblur=1.0} )
					if (option.focus === undefined) option.focus = 1.5
					if (option.aperture === undefined) option.aperture = 0.01
					if (option.maxblur === undefined) option.maxblur = 1
					
					thisLayer.effect[name].push( new BokehPass(thisLayer.scene, thisLayer.camera, {focus:option.focus, aperture:option.aperture, maxblur:option.maxblur}) )
					thisLayer.composer.addPass( thisLayer.effect[name][0] );
				
					break;


				case "DOTSCREEN":
					isEffect = true
					//セーブデータに保存
					saveLayer.effect.push( {"name": name, "option": option} )
				
					const DotScreenPass = await this.importModule("DotScreenPass", this.effectList[name].DotScreenPass)

					//初期値の設定
					//constructor( center=new THREE.Vector2( 0.5, 0.5 ), angle=1.57, scale=1 )
					if (option.centerX === undefined) option.centerX = 0.5
					if (option.centerY === undefined) option.centerY = 0.5
					if (option.angle === undefined) option.angle = 1.57
					if (option.scale === undefined) option.scale = 1
					
					thisLayer.effect[name].push( new DotScreenPass(new THREE.Vector2( option.centerX, option.centerY ), option.angle, option.scale) )
					thisLayer.composer.addPass( thisLayer.effect[name][0] );

					break;


				case "FILM":
					isEffect = true
					//セーブデータに保存
					saveLayer.effect.push( {"name": name, "option": option} )
				
					const FilmPass = await this.importModule("FilmPass", this.effectList[name].FilmPass)

					//初期値の設定
					//constructor( intensity = 0.5, grayscale = false)
					if (option.intensity === undefined) option.intensity = 1
					if (option.grayscale === undefined) option.grayscale = true
					
					thisLayer.effect[name].push( new FilmPass(option.intensity, option.grayscale) )
					thisLayer.composer.addPass( thisLayer.effect[name][0] );
				
					break;


				case "GLITCH":
					isEffect = true
					//セーブデータに保存
					saveLayer.effect.push( {"name": name, "option": option} )
				
					const GlitchPass = await this.importModule("GlitchPass", this.effectList[name].GlitchPass)

					//初期値の設定
					//constructor( dt_size = 64 )
					if (option.dt_size === undefined) option.dt_size = 64
					if (option.goWild === undefined) option.goWild = false
					
					thisLayer.effect[name].push( new GlitchPass(option.dt_size) )
					thisLayer.effect[name][0].goWild = option.goWild
					thisLayer.composer.addPass( thisLayer.effect[name][0] );
				
					break;


				case "RENDERPIXELATED":
					isEffect = true
					//セーブデータに保存
					saveLayer.effect.push( {"name": name, "option": option} )
				
					const RenderPixelatedPass = await this.importModule("RenderPixelatedPass", this.effectList[name].RenderPixelatedPass)

					//初期値の設定
					//constructor( pixelSize, scene, camera, options = {} ) ※options部分は未使用
					if (option.pixelSize === undefined) option.pixelSize = 12
					
					thisLayer.effect[name].push( new RenderPixelatedPass(option.pixelSize, thisLayer.scene, thisLayer.camera) )
					thisLayer.composer.addPass( thisLayer.effect[name][0] );
				
					break;


				case "UNREALBLOOM":
					isEffect = true
					//セーブデータに保存
					saveLayer.effect.push( {"name": name, "option": option} )
				
					const UnrealBloomPass = await this.importModule("UnrealBloomPass", this.effectList[name].UnrealBloomPass)

					//初期値の設定
					//constructor( resolution=new THREE.Vector2( 256, 256 ), strength=1, radius=0, threshold=0 )
					if (option.strength === undefined) option.strength = 0.2	//光の強さ
					if (option.radius === undefined) option.radius = 1			//光の広がり　大きくするとよりボヤっと広がる
					if (option.threshold === undefined) option.threshold = 0.8	//閾値（1～0）
					
					thisLayer.effect[name].push( new UnrealBloomPass(new THREE.Vector2( thisLayer.renderer.domElement.width, thisLayer.renderer.domElement.height ), option.strength, option.radius, option.threshold) )
					thisLayer.composer.addPass( thisLayer.effect[name][0] );

					break;


				case "HORIZONTALBLUR":
					isEffect = true
					//セーブデータに保存
					saveLayer.effect.push( {"name": name, "option": option} )
				
					const HorizontalBlurShader = await this.importModule("HorizontalBlurShader", this.effectList[name].HorizontalBlurShader)

					//初期値の設定
					//constructor(  )
					
					thisLayer.effect[name].push( new ShaderPass(HorizontalBlurShader) )
					thisLayer.composer.addPass( thisLayer.effect[name][0] );

					break;


				case "MIRROR":
					isEffect = true
					//セーブデータに保存
					saveLayer.effect.push( {"name": name, "option": option} )
				
					const MirrorShader = await this.importModule("MirrorShader", this.effectList[name].MirrorShader)

					//初期値の設定
					//constructor(  )
					
					thisLayer.effect[name].push( new ShaderPass(MirrorShader) )
					thisLayer.composer.addPass( thisLayer.effect[name][0] );

					break;


				case "OUTLINE":
					const selectedObjects = [];
					if (Array.isArray(option.selectedObjects)) {
						option.selectedObjects.forEach((object) => {
							if (object && typeof object.traverse === "function") {
								selectedObjects.push(object);
							}
						});
					} else if (Array.isArray(option.selectedObjectNames) && thisLayer.scene && typeof thisLayer.scene.getObjectByName === "function") {
						option.selectedObjectNames.forEach((objectName) => {
							if (!objectName) return;
							const object = thisLayer.scene.getObjectByName(objectName);
							if (object) {
								selectedObjects.push(object);
							}
						});
					}

					if (!selectedObjects.length) {
						delete thisLayer.effect[name]
						break;
					}

					isEffect = true
					const selectedObjectNames = selectedObjects
						.map((object) => object && object.name)
						.filter((objectName) => typeof objectName === "string" && objectName);
					const saveOption = Object.assign({}, option, {
						selectedObjectNames,
					});
					delete saveOption.selectedObjects;
					saveLayer.effect.push( {"name": name, "option": saveOption} )

					const outlinePass = new OutlinePass(
						new THREE.Vector2(thisLayer.renderer.domElement.width, thisLayer.renderer.domElement.height),
						thisLayer.scene,
						thisLayer.camera,
						selectedObjects
					)
					outlinePass.edgeGlow = option.edgeGlow === undefined ? 0 : option.edgeGlow
					outlinePass.edgeStrength = option.edgeStrength === undefined ? 2.2 : option.edgeStrength
					outlinePass.edgeThickness = option.edgeThickness === undefined ? 1.25 : option.edgeThickness
					outlinePass.downSampleRatio = option.downSampleRatio === undefined ? 2 : option.downSampleRatio
					outlinePass.pulsePeriod = option.pulsePeriod === undefined ? 0 : option.pulsePeriod
					if (option.visibleEdgeColor !== undefined) {
						outlinePass.visibleEdgeColor.set(option.visibleEdgeColor)
					}
					if (option.hiddenEdgeColor !== undefined) {
						outlinePass.hiddenEdgeColor.set(option.hiddenEdgeColor)
					}

					thisLayer.effect[name].push(outlinePass)
					thisLayer.composer.addPass(thisLayer.effect[name][0]);

					break;

				default:
					this.error("指定されたエフェクト名は存在しません")
			}
			
			//GammaCorrectionShaderを最後に追加する
			if (isEffect) {
				if (thisLayer.effect["GammaCorrectionShader"]) {
					thisLayer.composer.removePass(thisLayer.effect["GammaCorrectionShader"][0]);
				}
				thisLayer.effect["GammaCorrectionShader"] = []
				thisLayer.effect["GammaCorrectionShader"].push( new ShaderPass(GammaCorrectionShader) )
				thisLayer.composer.addPass( thisLayer.effect["GammaCorrectionShader"][0] );
			}

			if (cb && typeof cb === 'function') cb()

		},

		//VRoid.three.effect_delete("VRoid", "Afterimage")
		effect_delete: function (layerID, name) {
			const thisLayer = this.layer[layerID];
			const statVRoid = TYRANO.kag.stat.VRoid;
			const saveLayer = statVRoid.layer[layerID];

			//name指定がなければ全消去
			if (!name) {
				if (thisLayer.effect) {
					for (let key in thisLayer.effect) {
						thisLayer.effect[key].forEach((number) => {
							thisLayer.composer.removePass(number);
						});
						delete thisLayer.effect[key]
					}
					delete saveLayer.effect
				}
			} else {
				//大文字に統一
				name = name.toUpperCase()

				if (thisLayer.effect && thisLayer.effect[name]) {
					thisLayer.effect[name].forEach((number) => {
						thisLayer.composer.removePass(number);
					});
					
					if (thisLayer.composer.passes.length <= 3) {
						//全てのエフェクトがなくなったらGammaCorrectionShaderも削除する
						if (thisLayer.effect["GammaCorrectionShader"]) {
							thisLayer.composer.removePass(thisLayer.effect["GammaCorrectionShader"][0]);
							delete thisLayer.effect["GammaCorrectionShader"]
						}
					}
					
					delete thisLayer.effect[name]
					saveLayer.effect.forEach((number, index) => {
						if (number.name === name) {
							saveLayer.effect.splice(index, 1)
						}
					});

				}
			}
		},

		//VRoid.three.showFPS("VRoid")
		showFPS: async function (layerID, cb) {
		
			//リロードボタンが存在している場合のみ処理
			if ($(".ui-draggable").length > 0) {
				const thisLayer = this.layer[layerID];
				
				if (!thisLayer.stats) {
					const Stats = await this.importModule("default", "./module/three/libs/stats.module.js")

					thisLayer.stats = new Stats();
					thisLayer.stats.showPanel(0);
					thisLayer.stats.dom.setAttribute("id", layerID + "statsPanel");
					$(".ui-draggable").append(thisLayer.stats.dom)
					$(thisLayer.stats.dom).css({"margin-top": "10px", "position": "initial"})
				}
			}
			
			if (cb && typeof cb === 'function') cb()
		},
		
		//VRoid.three.add_img( {layerID: "VRoid", imgID:"imgID", storage:"./data/bgimage/room.jpg", y: 1, z:-2, scaleX: 0.5, scaleY:0.5} )
		add_img: async function (pm, cb) {

			const { 
				layerID,
				storage,
				imgID,
				visible = true,
				x = 0,
				y = 0,
				z = 0,
				rotX = 0,
				rotY = 0,
				rotZ = 0,
				scaleX = 1,
				scaleY = 1,
				scaleZ = 0,
				time = 0,
				easing = "default",
				wait = true,
				skip = false,
				cache = true,
				side = "DoubleSide",
				renderOrder = 999,
			} = pm;


			//セーブ領域の作成
			const tStat = TYRANO.kag.stat
			const saveImg = tStat.VRoid.img
			pm.time = 0
			pm.wait = true
			pm.type = "img"
			saveImg[imgID] = $.extend(true,{}, pm);

			const thisLayer = this.layer[layerID];
			
			let cacheUrl = ""
			if (!cache) cacheUrl = "?" + new Date().getTime()

			let mesh = this.img[imgID]
			if (mesh) {
				//既に同じIDがあった場合は削除してから処理を進める
				cancelAnimationFrame(mesh.tickID)
				mesh.geometry.dispose();
				mesh.material.dispose();
				thisLayer.scene.remove( mesh );
				mesh = null;
			}

			const loader = new THREE.TextureLoader();
			//loader.crossOrigin = 'anonymous';
			const texture = loader.load(storage + cacheUrl, 

				(texture) => {
					texture.colorSpace = THREE.SRGBColorSpace;
					texture.minFilter = THREE.LinearFilter;
					texture.magFilter = THREE.LinearFilter;

					texture.wrapS = THREE.ClampToEdgeWrapping;
					texture.wrapT = THREE.ClampToEdgeWrapping;

					const width = texture.image.width / 500;
					const height = texture.image.height / 500;

					const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
					const material = new THREE.MeshBasicMaterial({
						map: texture,
						transparent: true,
						opacity: 0,
						side: THREE[side],
						alphaToCoverage: true,
					});

					this.img[imgID] = new THREE.Mesh(geometry, material);
					mesh = this.img[imgID]
					
					mesh.layerID = layerID;
					mesh.frustumCulled = false;
					mesh.renderOrder = renderOrder;

					mesh.position.x = x
					mesh.position.y = y
					mesh.position.z = z
					
					mesh.rotation.x = rotX
					mesh.rotation.y = rotY
					mesh.rotation.z = rotZ

					mesh.scale.x = scaleX
					mesh.scale.y = scaleY
					mesh.scale.z = scaleZ
					
					//ライトの状態をみて色合い変更
					const meshMaterial = mesh.material
					const intensityVal = thisLayer.light.intensity !== 0 ? thisLayer.light.intensity / Math.PI : 0
					meshMaterial.color.r = thisLayer.light.color.r * intensityVal
					meshMaterial.color.g = thisLayer.light.color.g * intensityVal
					meshMaterial.color.b = thisLayer.light.color.b * intensityVal
					
					mesh.visible = visible

					thisLayer.scene.add(mesh);

					const easingFunc = this.easing[easing];
					const startTime = performance.now();

					const tick = (timestamp) => {
						const elapsedTime = timestamp - startTime;

						let progress
						if (time !== 0) {
							progress = Math.max(0, Math.min(elapsedTime / time, 1))
						} else {
							progress = 1
						}

						//スキップが有効の場合は割り込み処理
						if (skip && tStat.is_skip) progress = 1
						
						meshMaterial.opacity = easingFunc(progress);

						if (progress < 1) {
							mesh.tickID = requestAnimationFrame(tick);
						} else {
							//setTimeoutで呼び出さないと後続のコードのエラーまでcatchしてしまう
							if (cb && typeof cb === 'function' && wait) requestAnimationFrame(cb)
						}
					};
					tick(startTime);

					//waitがfalseの時は即NextOrder
					//setTimeoutで呼び出さないと後続のコードのエラーまでcatchしてしまう
					if (cb && typeof cb === 'function' && !wait) requestAnimationFrame(cb)
			
				},
				undefined,
				(error) => {
					//読み込み失敗時
					console.error(storage + " のロードに失敗しました：", error);
					if (cb && typeof cb === 'function') cb()
				}
			)

		},

		//VRoid.three.delete_img( {imgID:"imgID", time:1000} )
		delete_img: function (pm, cb) {
			const { 
				imgID,
				time = 0,
				wait = true,
				skip = false,
				easing = "default",
			} = pm;

			//セーブ領域の削除
			const tStat = TYRANO.kag.stat
			const saveImg = tStat.VRoid.img
			delete saveImg[imgID]

			const mesh = this.img[imgID]
			if (!mesh) {
				//存在しないIDであれば即return
				if (cb && typeof cb === 'function') cb()
				return
			}
			
			const thisLayer = this.layer[mesh.layerID];

			cancelAnimationFrame(mesh.tickID)
			const easingFunc = this.easing[easing];
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1
				
				mesh.material.opacity = 1 - easingFunc(progress);

				if (progress < 1) {
					mesh.tickID = requestAnimationFrame(tick);
				} else {
					mesh.geometry.dispose();
					mesh.material.dispose();
					thisLayer.scene.remove( mesh );

					delete this.img[imgID]

					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			tick(startTime);

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()

		},

		//VRoid.three.show_img( {imgID:"imgID", time:1000} )
		show_img: function (pm, cb) {
			const { 
				imgID,
				time = 0,
				wait = true,
				skip = false,
				easing = "default",
			} = pm;


			const mesh = this.img[imgID]
			if (!mesh) {
				//存在しないIDであれば即return
				if (cb && typeof cb === 'function') cb()
				return
			}

			//セーブデータの更新
			const tStat = TYRANO.kag.stat
			const saveImg = tStat.VRoid.img[imgID]
			saveImg.visible = true

			const thisLayer = this.layer[mesh.layerID];

			mesh.material.opacity = 0
			mesh.visible = true

			cancelAnimationFrame(mesh.tickID)
			const easingFunc = this.easing[easing];
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1
				
				mesh.material.opacity = easingFunc(progress);

				if (progress < 1) {
					mesh.tickID = requestAnimationFrame(tick);
				} else {
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			tick(startTime);

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()

		},

		//VRoid.three.hide_img( {imgID:"imgID", time:1000} )
		hide_img: function (pm, cb) {
			const { 
				imgID,
				time = 0,
				wait = true,
				skip = false,
				easing = "default",
			} = pm;


			const mesh = this.img[imgID]
			if (!mesh) {
				//存在しないIDであれば即return
				if (cb && typeof cb === 'function') cb()
				return
			}

			//セーブデータの更新
			const tStat = TYRANO.kag.stat
			const saveImg = tStat.VRoid.img[imgID]
			saveImg.visible = false

			const thisLayer = this.layer[mesh.layerID];

			mesh.material.opacity = 1
			//showと違い、既に隠れているものは隠れたままという仕様の方が使いやすそう
			//mesh.visible = true

			cancelAnimationFrame(mesh.tickID)
			const easingFunc = this.easing[easing];
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1
				
				mesh.material.opacity = 1 - easingFunc(progress);

				if (progress < 1) {
					mesh.tickID = requestAnimationFrame(tick);
				} else {
					mesh.visible = false
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			tick(startTime);

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()

		},

		//VRoid.three.move( {type:"img", id:"imgID", x:-2, y:0.5, time:1000} )
		move: function (pm, cb) {

			//カメラのみscaleではなくzoomを使用可
			const {
				type,	//layer or model or img
				x,
				y,
				z,
				rotX,
				rotY,
				rotZ,
				scaleX,
				scaleY,
				scaleZ,
				zoom,
				time = 0,
				wait = true,
				skip = false,
				easing = "default",
			} = pm;
			
			const id = pm[type + "ID"]

			const objID = this[type][id]
			if (objID === undefined) {
				//そんなIDは存在しない
				if (cb && typeof cb === 'function') cb()
				return
			}
			
			//typeによって変更する箇所を選択
			let objType
			if (type == "layer") {
				objType = objID.camera
			} else if (type == "model"){
				objType = objID.vrm.scene
			} else if (type == "img"){
				objType = objID
			}
			
			const pos = objType.position;
			const rot = objType.rotation;
			const scale = objType.scale;

			//開始時の状態を保存
			const startVal = {
				x: pos.x,
				y: pos.y,
				z: pos.z,
				rotX: rot.x,
				rotY: rot.y,
				rotZ: rot.z,
				scaleX: scale.x,
				scaleY: scale.y,
				scaleZ: scale.z,
			}

			//セーブデータ
			const tStat = TYRANO.kag.stat
			const saveData = tStat.VRoid[type][id]

			//終了時の状態を保存
			const endVal = {
				x: createTarget(x, saveData.x !== undefined ? saveData.x : 0),
				y: createTarget(y, saveData.y !== undefined ? saveData.y : 0),
				z: createTarget(z, saveData.z !== undefined ? saveData.z : 0),
				rotX: createTarget(rotX, saveData.rotX !== undefined ? saveData.rotX : 0),
				rotY: createTarget(rotY, saveData.rotY !== undefined ? saveData.rotY : 0),
				rotZ: createTarget(rotZ, saveData.rotZ !== undefined ? saveData.rotZ : 0),
				scaleX: createTarget(scaleX, saveData.scaleX !== undefined ? saveData.scaleX : 1),
				scaleY: createTarget(scaleY, saveData.scaleY !== undefined ? saveData.scaleY : 1),
				scaleZ: createTarget(scaleZ, saveData.scaleZ !== undefined ? saveData.scaleZ : 1),
			}
			
			//zoomがあるのはlayerだけ
			const isLayer = (type == "layer")
			if (isLayer) {
				startVal.zoom = objType.zoom
				endVal.zoom = createTarget(zoom, saveData.zoom !== undefined ? saveData.zoom : 1)


				//cameraのscaleにマイナス値が入るとテクスチャーがバグるから0以下にさせない
				if (endVal.scaleX < 0) endVal.scaleX = 0
				if (endVal.scaleY < 0) endVal.scaleY = 0
				if (endVal.scaleZ < 0) endVal.scaleZ = 0
			}
			
			//モデルはscaleに0が入るとテクスチャーが崩壊するから避ける
			//0.000000000000000000000000001を指定
			const isModel = (type == "model")
			if (isModel) {
				if (endVal.scaleX === 0) endVal.scaleX = 0.000000000000000000000000001
				if (endVal.scaleY === 0) endVal.scaleY = 0.000000000000000000000000001
				if (endVal.scaleZ === 0) endVal.scaleZ = 0.000000000000000000000000001
			}

			//セーブデータに保存
			for (const key in endVal) {
				saveData[key] = endVal[key]
			}
			//復元に使用するtimeとwaitを強制上書き
			saveData.wait = true
			saveData.time = 0

			//VRM1.0の場合はrotYに補正が必要
			const correctionRotateY = objID.correctionRotateY || 0
			endVal.rotY += correctionRotateY

			//先に計算できる値をキャッシュ
			const moveX = endVal.x - startVal.x
			const moveY = endVal.y - startVal.y
			const moveZ = endVal.z - startVal.z

			const moveRotX = endVal.rotX - startVal.rotX
			const moveRotY = endVal.rotY - startVal.rotY
			const moveRotZ = endVal.rotZ - startVal.rotZ

			const moveScaleX = endVal.scaleX - startVal.scaleX
			const moveScaleY = endVal.scaleY - startVal.scaleY
			const moveScaleZ = endVal.scaleZ - startVal.scaleZ
			
			const moveZoom = endVal.zoom - startVal.zoom

			//更新の必要があるか
			const hasPosition = moveX !== 0 || moveY !== 0 || moveZ !== 0
			const hasRotation = moveRotX !== 0 || moveRotY !== 0 || moveRotZ !== 0
			const hasScale = moveScaleX !== 0 || moveScaleY !== 0 || moveScaleZ !== 0
			const hasZoom = moveZoom !== 0


			cancelAnimationFrame(objID.moveTickID)
			const easingFunc = this.easing[easing];
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1
				
				const val = easingFunc(progress);

				if (hasPosition) {
					pos.set (
						val * moveX + startVal.x,
						val * moveY + startVal.y,
						val * moveZ + startVal.z
					)
				}

				if (hasRotation) {
					rot.set (
						val * moveRotX + startVal.rotX,
						val * moveRotY + startVal.rotY,
						val * moveRotZ + startVal.rotZ
					)
				}

				if (hasScale) {
					let sx = val * moveScaleX + startVal.scaleX;
					let sy = val * moveScaleY + startVal.scaleY;
					let sz = val * moveScaleZ + startVal.scaleZ;

					if (isModel) {
						if (sx === 0) sx = 0.000000000000000000000000001
						if (sy === 0) sy = 0.000000000000000000000000001
						if (sz === 0) sz = 0.000000000000000000000000001
					}

					scale.set(sx, sy, sz)
				}

				if (isLayer && hasZoom) {
					objType.zoom = val * moveZoom + startVal.zoom;
					objType.updateProjectionMatrix()
				}

				if (progress < 1) {
					objID.moveTickID = requestAnimationFrame(tick);
				} else {
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			tick(startTime);

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()


			function createTarget(val, initialVal) {
				//ないものはない
				if (initialVal === undefined) return undefined
				
				//変更する値がない場合は現在値(セーブ値)を返す
				if (val === undefined) return initialVal
			
				//先頭2文字を取得
				const str = String(val).slice(0, 2);
				const tmpVal = Number(String(val).slice(2))
				let endVal;

				if (str == "+=") {
					endVal = initialVal + tmpVal
				} else if (str == "-=") {
					endVal = initialVal - tmpVal
				} else if (str == "*=") {
					endVal = initialVal * tmpVal
				} else if (str == "/=") {
					//0除算回避
					if ( tmpVal !== 0 ) {
						endVal = initialVal / tmpVal
					} else {
						endVal = 0
					}
				} else if (str == "%=") {
					endVal = initialVal % tmpVal
				} else {
					//いずれでもない場合は数字のはず
					endVal = Number(val)
				}
				
				return endVal;
			}

		},

		changeTexture: async function (pm, cb) {
			const {
				modelID,
				materialID,
				storage,
				outline = true,
			} = pm;
			
			const saveModel = TYRANO.kag.stat.VRoid.model[modelID];
			const materials = this.model[modelID].vrm.materials
			
			
			try {

				const texture = await this.getTexture("./data/others/plugin/vrm/_texture/" + storage)

				//materialIDからnameを取得
				let name
				for (const key in saveModel.material) {
					if (saveModel.material[key].id == materialID) name = key
				}

				let outlineName
				if (name) {
					outlineName = name + " (Outline)"
					for (const key in materials) {
						const mateName = materials[key].name
						if (name == mateName) {
							materials[key].map = texture;
							materials[key].shadeMultiplyTexture = texture;
							saveModel.material[name].storage = storage;
						}
					}
				}

				//アウトラインも処理するかどうか
				//次のIDの名前の後ろに" (Outline)"を付けたものと一致した場合は処理する
				if (outline) {
					name = null
					const nextMaterialID = Number(materialID) + 1
					for (const key in saveModel.material) {
						if (saveModel.material[key].id == nextMaterialID) name = key
					}

					if (name && outlineName == name) {
						for (const key in materials) {
							const mateName = materials[key].name
							if (name == mateName) {
								materials[key].map = texture;
								materials[key].shadeMultiplyTexture = texture;
								saveModel.material[name].storage = storage;
							}
						}
					}
				}

				//setTimeoutで呼び出さないと後続のコードのエラーまでcatchしてしまう
				if (cb && typeof cb === 'function') setTimeout(cb, 0)

			} catch (error) {
				console.error(storage + " のロードに失敗しました：", error);
				if (cb && typeof cb === 'function') cb();
			}

		},

		getTexture: async function (url) {
			return new Promise((resolve, reject) => {
				const loader = new THREE.TextureLoader();
				//loader.crossOrigin = 'anonymous';
				loader.load(
					url,
					(texture) => {
						texture.colorSpace = THREE.SRGBColorSpace;
						texture.minFilter = THREE.LinearFilter;
						texture.magFilter = THREE.LinearFilter;
						texture.flipY = false;
						resolve(texture);
					},
					undefined,
					(error) => {
						reject(error);
					}
				);
			});
		},

		//マテリアルの色変更
		changeColor: function (pm, cb) {

			const {
				modelID,
				materialID,
				r,
				g,
				b,
				shadeR,
				shadeG,
				shadeB,
				time = 0,
				wait = true,
				skip = false,
				easing = "default",
			} = pm;

			const saveModel = TYRANO.kag.stat.VRoid.model[modelID];
			const thisModel = this.model[modelID]
			const materials = thisModel.vrm.materials
			let material
			let saveData
			
			//アウトラインかどうかで処理を変える
			let isOutline

			//materialIDから変更するマテリアルを取得
			let name
			for (const key in saveModel.material) {
				if (saveModel.material[key].id == materialID) {
					name = key

					//セーブデータの取得となかったら初期化
					if (!saveModel.material[key].color) saveModel.material[key].color = {}
					saveData = saveModel.material[key].color
				}
			}

			if (name) {
				for (const key in materials) {
					const mateName = materials[key].name
					if (name == mateName) {
						material = materials[key]
					}
				}
				
				//アウトライン判定
				if (name.endsWith(" (Outline)")) isOutline = true
				
			}

			if (!material) {
				//そんなマテリアルは存在しない
				if (cb && typeof cb === 'function') cb()
				return
			}
			
			let tmpR = material.color.r
			let tmpG = material.color.g
			let tmpB = material.color.b
			if (isOutline) {
				tmpR = material.outlineColorFactor.r
				tmpG = material.outlineColorFactor.g
				tmpB = material.outlineColorFactor.b
			}

			//開始時の状態を保存
			const startVal = {
				r: tmpR,
				g: tmpG,
				b: tmpB,
				shadeR: material.shadeColorFactor.r,
				shadeG: material.shadeColorFactor.g,
				shadeB: material.shadeColorFactor.b,
			}


			//終了時の状態を保存
			const endVal = {
				r: createTarget(r, saveData.r || tmpR),
				g: createTarget(g, saveData.g || tmpG),
				b: createTarget(b, saveData.b || tmpB),
				shadeR: createTarget(shadeR, saveData.shadeR || material.shadeColorFactor.r),
				shadeG: createTarget(shadeG, saveData.shadeG || material.shadeColorFactor.g),
				shadeB: createTarget(shadeB, saveData.shadeB || material.shadeColorFactor.b),
			}

			//セーブデータに保存
			for (const key in endVal) {
				saveData[key] = endVal[key]
			}
			
			//アニメーション用IDの作成
			if (!thisModel.changeMaterialColorTickID) thisModel.changeMaterialColorTickID = {}

			cancelAnimationFrame(thisModel.changeMaterialColorTickID[materialID])
			const easingFunc = this.easing[easing];
			const startTime = performance.now();

			const tick = (timestamp) => {
				const elapsedTime = timestamp - startTime;

				let progress
				if (time !== 0) {
					progress = Math.max(0, Math.min(elapsedTime / time, 1))
				} else {
					progress = 1
				}

				//スキップが有効の場合は割り込み処理
				if (skip && tStat.is_skip) progress = 1
				
				const value = easingFunc(progress);

				const valR = startVal.r + (endVal.r - startVal.r) * value
				const valG = startVal.g + (endVal.g - startVal.g) * value
				const valB = startVal.b + (endVal.b - startVal.b) * value

				if (!isOutline) {
					material.color.set(valR, valG, valB)

					const valShadeR = startVal.shadeR + (endVal.shadeR - startVal.shadeR) * value
					const valShadeG = startVal.shadeG + (endVal.shadeG - startVal.shadeG) * value
					const valShadeB = startVal.shadeB + (endVal.shadeB - startVal.shadeB) * value
					material.shadeColorFactor.set(valShadeR, valShadeG, valShadeB)

				} else {
					material.outlineColorFactor.set(valR, valG, valB)
				}

				if (progress < 1) {
					thisModel.changeMaterialColorTickID[materialID] = requestAnimationFrame(tick);
				} else {
					if (cb && typeof cb === 'function' && wait) cb()
				}
			};
			tick(startTime);

			//waitがfalseの時は即NextOrder
			if (cb && typeof cb === 'function' && !wait) cb()


			function createTarget(value, initialVal) {
				//ないものはない
				if (initialVal === undefined) return undefined
				
				//変更する値がない場合は現在値(セーブ値)を返す
				if (value === undefined) return initialVal
			
				//先頭2文字を取得
				const str = String(value).slice(0, 2);
				const tmpVal = Number(String(value).slice(2))
				let endVal;

				if (str == "+=") {
					endVal = initialVal + tmpVal
				} else if (str == "-=") {
					endVal = initialVal - tmpVal
				} else if (str == "*=") {
					endVal = initialVal * tmpVal
				} else if (str == "/=") {
					//0除算回避
					if ( tmpVal !== 0 ) {
						endVal = initialVal / tmpVal
					} else {
						endVal = 0
					}
				} else if (str == "%=") {
					endVal = initialVal % tmpVal
				} else {
					//いずれでもない場合は数字のはず
					endVal = Number(value)
				}
				
				return endVal;
			}
		},

		// const THREE = VRoid.three.getTHREE()
		getTHREE: function () {
			return THREE
		},

		//エラー処理
		error: function (message, err) {
				const current_storage = TYRANO.kag.stat.current_scenario;
				const line = parseInt(TYRANO.kag.stat.current_line) + 1;
				const line_str = $.lang("line", { line });
				const error_str = `Error: ${current_storage}:${line_str}\n\n${message}`;
				if (err) {
					console.error(error_str, err)
				} else {
					console.error(error_str)
				}
			if (TYRANO.kag.config["debugMenu.visible"] == "true") {
				$.error_message(error_str);
			}
		},

		//WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost　対策
		webglcontextlost: function (e) {
			// デフォルトの挙動（完全停止）を防ぐ
			e.preventDefault();
			console.log(new Date())
			VRoid.three.isWebglcontextlost = true
			if (window && typeof window.dispatchEvent === "function" && window.CustomEvent) {
				window.dispatchEvent(new CustomEvent("vroid:contextlost"));
			}
		},

		restore: function () {
			//webglcontextlost後のrestore
			if (!VRoid.three.isWebglcontextlost) return
			if (Object.keys(VRoid.three.layer).length === 0) {
				VRoid.three.cancelRestore();
				return
			}

			VRoid.three.clearRestoreTimers()
			VRoid.three.isWebglcontextlost = false
			VRoid.three.isRestoringContext = true
			if (window && typeof window.dispatchEvent === "function" && window.CustomEvent) {
				window.dispatchEvent(new CustomEvent("vroid:restore-start"));
			}
		
			//ゲームの解像度を取得
			const w = 10 + Number(TYRANO.kag.config.scWidth)
			const h = 10 + Number(TYRANO.kag.config.scHeight)

			//ロード用のマスクレイヤーを追加する
			if (!document.getElementById("VRoid_loading_mask2")) {
				$("#tyrano_base").append(
					"<div id='VRoid_loading_mask2' " +

					"style='" +
						"animation-fill-mode: both; " +
						"animation-duration: 300ms; " +
						"z-index: 2000000000; " +
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
						"<div style='animation-name: fadeInDown; animation-fill-mode: both; animation-duration: 1000ms;'>　Restore Loading...<div id='loading_circle' style='left: -50px;'></div></div>" +
					"</div>"
				);
			}

			//WebGLRendererが作成できるまでループ
			const tick = () => {
				if (!VRoid.three.isRestoringContext) return
				if (Object.keys(VRoid.three.layer).length === 0) {
					VRoid.three.cancelRestore();
					return
				}
				
				try{

					const renderer = new THREE.WebGLRenderer({})

					try {
						//少し待ってから復旧を試みる
						if (renderer) VRoid.three.restoreRunTimeoutId = setTimeout(VRoid.three.restoreRun, 3000)
					} finally {
						if (renderer && renderer.domElement && renderer.domElement.parentNode) {
							renderer.domElement.parentNode.removeChild(renderer.domElement)
						}
						if (renderer) {
							try { renderer.dispose(); } catch (e) {}
							try { renderer.forceContextLoss(); } catch (e) {}
						}
					}

				}catch(e){
					//エラーの場合はループ
					VRoid.three.restoreRetryTimeoutId = setTimeout(tick, 1000);
				}
			};
			tick();
		},

		restoreRun: function () {
			VRoid.three.clearRestoreTimers()
			if (!VRoid.three.isRestoringContext) return
			if (
				Object.keys(VRoid.three.layer).length === 0 &&
				Object.keys(TYRANO.kag.stat.VRoid.layer).length === 0
			) {
				VRoid.three.cancelRestore();
				return
			}

			//セーブデータの退避
			const tmpSave = $.extend(true,{}, TYRANO.kag.stat.VRoid);

			//全レイヤーオブジェクトの削除
			for (const key in VRoid.three.layer) {
				VRoid.three.dispose(key, { skipGlDisposal: true })
			}
			
			//セーブデータを戻す
			TYRANO.kag.stat.VRoid = $.extend(true,{}, tmpSave);

			//タイミングを遅らせてから再読み込み
			VRoid.three.restoreLoadTimeoutId = setTimeout(function() {
				if (!VRoid.three.isRestoringContext) return
				VRoid.three.statLoad(cb)

				//処理完了時にマスクをフェードアウトさせる。
				function cb(success, error) {
					VRoid.three.clearRestoreTimers()
					VRoid.three.isRestoringContext = false
					const isSuccess = success !== false
					if (window && typeof window.dispatchEvent === "function" && window.CustomEvent) {
						window.dispatchEvent(new CustomEvent(isSuccess ? "vroid:restore-complete" : "vroid:restore-failed", {
							detail: error ? { message: String(error.message || error) } : undefined,
						}));
					}
					setTimeout(function() {
						$("#VRoid_loading_mask2").css("animation-name", "fadeOut").one('animationend', function() {
							$(this).remove();
						});
					}, 100);
				}
			}, 1000);

		},

		//省電力対策
		//VRoid.three.lowPerformanceSetting()
		lowPerformanceSetting: function (flg = true) {

			//重複登録対策で最初に必ず削除
			document.removeEventListener('visibilitychange', this.onVisibilityChange);

			if (flg) {
				document.addEventListener('visibilitychange', this.onVisibilityChange);
			} else {
				for (const thisLayer of Object.values(this.layer)) {
					clearTimeout(thisLayer.visibilitychangeID)
					cancelAnimationFrame(thisLayer.tickID)
					thisLayer.tickID = requestAnimationFrame(thisLayer.tick)
				}
			}

		},

		//vsync有効時、非アクティブ対策
		onVisibilityChange: function () {
			const that = VRoid.three
			if (!document.hidden) {
				//非アクティブが解除されたら全てのsetTimeoutを解除してrequestAnimationFrameを再設定
				for (const thisLayer of Object.values(that.layer)) {
					clearTimeout(thisLayer.visibilitychangeID)
					cancelAnimationFrame(thisLayer.tickID)
					thisLayer.tickID = requestAnimationFrame(thisLayer.tick)
				}
			} else {
				//非アクティブになったら最大10fpsで実行モード。実際はブラウザ側で1fpsに規制される
				for (const thisLayer of Object.values(that.layer)) {
					clearTimeout(thisLayer.visibilitychangeID)
					cancelAnimationFrame(thisLayer.tickID)
					thisLayer.visibilitychangeID = setTimeout(thisLayer.tick, 100)
				}
			}

			that.visibilitychange = document.hidden
		},

	}
	
	//非アクティブ対策をデフォルトで有効化する
	VRoid.three.lowPerformanceSetting(true)

	//リロードボタン時にdisposeしてメモリリーク回避
	$(".ui-draggable").find("button").off("click").on("click", (e) => {
		//全レイヤーオブジェクトの削除
		for (const key in VRoid.three.layer) {
			VRoid.three.dispose(key)
		}
		location.reload();
	});

})();
