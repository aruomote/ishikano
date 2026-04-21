(function () {
    const MODEL_CONFIG_URL = "./data/others/stone-photo-models.json";
    const ALBUM_STORAGE_KEY = "stone_photo_album";
    const PHOTO_DB_NAME = "stone-photo-captures";
    const PHOTO_DB_VERSION = 1;
    const PHOTO_DB_STORE = "captures";
    const CAPTURE_IMAGE_QUALITY = 0.9;
    const THUMBNAIL_IMAGE_QUALITY = 0.82;
    const CAPTURE_MAX_WIDTH = 1280;
    const THUMBNAIL_MAX_WIDTH = 320;
    const ALBUM_MAX_ENTRIES = 120;
    const ALBUM_PAGE_SIZE = 4;
    const BULK_EXPORT_DELAY_MS = 180;

    const DEFAULT_STATE = {
        heroineId: "test_heroine",
        locationId: "club_room",
        themeId: "graceful_portrait",
        stoneState: "normal",
        poseId: "pose_stand_soft",
        expressionId: "cool",
        lookAtId: "camera",
        modelRotY: 0,
        modelRotX: 0,
        camera: {
            distance: 1.08,
            orbitPitch: 0,
            orbitYaw: 0,
            panX: 0,
            panY: 0,
        },
    };
    const DEFAULT_CAMERA_FRAMING = {
        distanceOffset: 0,
        eyeLineOffsetY: 0,
        eyeLineScreenY: 0.38,
        headroom: 0.08,
        bustBottomScreenY: 0.8,
        centerX: 0.5,
        sideMargin: 0.08,
    };
    const ENABLE_AUTO_CAMERA_FRAMING = false;

    const CAMERA_LIMITS = {
        distanceMax: 1.8,
        distanceMin: 0.2,
        orbitPitchMax: 42,
        orbitPitchMin: -58,
    };

    const PLUGIN_LIGHTING = {
        ambientIntensity: 0.34,
        b: 1,
        g: 1,
        hemiGround: 0x69717f,
        hemiIntensity: 0.18,
        hemiSky: 0xf2f5ff,
        r: 1,
        targetX: 0,
        targetY: 1,
        targetZ: 0,
        val: 1.16,
        x: 0.1,
        y: 1.42,
        z: 1.34,
    };

    const STONE_MATERIAL_TUNING = {
        clearcoatScale: 0.28,
        emissiveIntensity: 0.24,
        emissiveLift: 0.16,
        envMapIntensityScale: 0.45,
        metalnessScale: 0.18,
        normalScale: 0.35,
        roughnessFloor: 0.72,
    };

    const DEFAULT_OUTLINE_SETTINGS = {
        normal: {
            enabled: true,
        },
        stone: {
            enabled: true,
        },
    };

    const OUTLINE_RENDER_PRESETS = {
        normal: {
            downSampleRatio: 2,
            edgeGlow: 0,
            edgeStrength: 1.4,
            edgeThickness: 1,
            hiddenEdgeColor: "#3d4652",
            pulsePeriod: 0,
            visibleEdgeColor: "#94a0af",
        },
        stone: {
            downSampleRatio: 2,
            edgeGlow: 0,
            edgeStrength: 2.6,
            edgeThickness: 1.55,
            hiddenEdgeColor: "#4e5663",
            pulsePeriod: 0,
            visibleEdgeColor: "#d5deea",
        },
    };

    const DEFAULT_MODEL_CONFIG = {
        defaultModelPath: "data/others/vrm/models/test_heroine.vrm",
        defaultHeroineId: "test_heroine",
        heroineModels: {
            test_heroine: "data/others/vrm/models/test_heroine.vrm",
        },
        heroinePluginModels: {
            test_heroine: "test_heroine.vrm",
        },
        heroineStoneModels: {},
        heroineStonePluginModels: {},
        heroineProfiles: {},
        outline: DEFAULT_OUTLINE_SETTINGS,
        pluginExpectedFolder: "data/others/plugin/",
    };

    const POSE_ID_PATTERN = /^pose\d+$/;

    const OPTIONS = {
        albumSorts: [
            { value: "newest", label: "新しい順" },
            { value: "oldest", label: "古い順" },
            { value: "heroine_asc", label: "ヒロイン名順" },
        ],
        expressions: [
            { value: "smile_soft", label: "やわらかい微笑み" },
            { value: "smile_bright", label: "明るく笑う" },
            { value: "smile_closed_soft", label: "口を閉じてやさしく笑う" },
            { value: "embarrassed", label: "少し照れる" },
            { value: "relief_soft", label: "ほっとやわらぐ" },
            { value: "cool", label: "澄ました表情" },
            { value: "angry_soft", label: "むっとする" },
            { value: "sad_soft", label: "しゅんとする" },
            { value: "surprised", label: "はっとする" },
            { value: "startled", label: "強く驚く" },
            { value: "troubled_soft", label: "困って眉を寄せる" },
            { value: "pout_soft", label: "少しふくれる" },
            { value: "eyes_closed", label: "そっと目を閉じる" },
            { value: "eyes_closed_smile", label: "目を閉じて微笑む" },
            { value: "wink_left", label: "左ウィンク" },
            { value: "wink_right", label: "右ウィンク" },
            { value: "mouth_open_aa", label: "口を大きく開く" },
            { value: "smile_open_soft", label: "口を開けて笑う" },
            { value: "mouth_narrow_ih", label: "口をきゅっと細める" },
            { value: "mouth_round_ou", label: "口をすぼめる" },
            { value: "mouth_wide_ee", label: "口角を横に広げる" },
            { value: "mouth_round_oh", label: "口を丸く開く" },
        ],
        looks: [
            { value: "camera", label: "まっすぐ見る" },
            { value: "slight_away", label: "少しだけ外す" },
            { value: "away", label: "視線を逃がす" },
        ],
    };

    const LABELS = {
        locations: {
            club_room: "部室",
        },
        themes: {
            graceful_portrait: "優雅なポートレート",
        },
        stoneStates: {
            normal: "通常",
            stone: "石化中",
        },
    };

    const CURATED_POSE_CATALOG = [
        { value: "pose_stand_soft", label: "正面にやわらかく立つ", storage: "pose1001", group: "standard", exposed: true, scope: "common" },
        { value: "pose_hand_hip_gentle", label: "腰に手を添えてやさしく見せる", storage: "pose1003", group: "standard", exposed: true, scope: "common" },
        { value: "pose_hand_waist_neat", label: "片手を腰に添えて姿勢を整える", storage: "pose1008", group: "standard", exposed: true, scope: "common" },
        { value: "pose_turn_half", label: "少し振り返る", storage: "pose1012", group: "standard", exposed: true, scope: "common" },
        { value: "pose_hand_hip_soft", label: "腰に手を当てて立つ", storage: "pose1020", group: "standard", exposed: true, scope: "common" },
        { value: "pose_hand_hip_flow", label: "腰に手を添えて軽く流す", storage: "pose1022", group: "standard", exposed: true, scope: "common" },
        { value: "pose_hands_behind_soft", label: "後ろ手でおとなしく立つ", storage: "pose1025", group: "standard", exposed: true, scope: "common" },
        { value: "pose_hand_chest", label: "胸元に手を添える", storage: "pose1030", group: "standard", exposed: true, scope: "common" },
        { value: "pose_cheek_touch_shy", label: "頬に手を寄せて首を傾ける", storage: "pose1038", group: "standard", exposed: true, scope: "common" },
        { value: "pose_hair_touch", label: "髪に手を添えて見上げる", storage: "pose1043", group: "standard", exposed: true, scope: "common" },
        { value: "pose_finger_lips_soft", label: "口元へ指を寄せて静かに見る", storage: "pose1044", group: "standard", exposed: true, scope: "common" },
        { value: "pose_thinking_lips", label: "口元に指を添えて考える", storage: "pose1049", group: "standard", exposed: true, scope: "common" },
        { value: "pose_relaxed_front", label: "肩の力を抜いてまっすぐ立つ", storage: "pose1050", group: "standard", exposed: true, scope: "common" },
        { value: "pose_folded_hands_soft", label: "前で手を寄せて落ち着く", storage: "pose1090", group: "standard", exposed: true, scope: "common" },
        { value: "pose_collar_touch", label: "襟元に手を添える", storage: "pose1102", group: "standard", exposed: true, scope: "common" },
        { value: "pose_hands_together_front", label: "両手を前でそろえる", storage: "pose1119", group: "standard", exposed: true, scope: "common" },
        { value: "pose_bowed_shy", label: "少しうつむいて身を寄せる", storage: "pose1145", group: "standard", exposed: true, scope: "common" },
        { value: "pose_polite_front", label: "正面で手を重ねる", storage: "pose1181", group: "standard", exposed: true, scope: "common" },
        { value: "pose_open_arm_invite", label: "大きく手を開いて迎える", storage: "pose1016", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_small_fist_cheer", label: "小さく拳を作って気合いを見せる", storage: "pose1028", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_arm_up_lively", label: "片手を高く上げて弾む", storage: "pose1035", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_cheer_up", label: "元気に片手を上げる", storage: "pose1062", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_sway_bright", label: "身をひねって明るく寄せる", storage: "pose1060", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_open_hands_bright", label: "手を広げて明るく見せる", storage: "pose1066", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_reach_forward", label: "手を伸ばして誘う", storage: "pose1075", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_side_point", label: "横を指し示す", storage: "pose1080", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_light_step", label: "軽く踏み出して動きを出す", storage: "pose1157", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_hands_up_cheer", label: "両手を上げてはしゃぐ", storage: "pose1192", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_big_arm_present", label: "大きく腕を伸ばして見せる", storage: "pose1276", group: "cheerful", exposed: true, scope: "common" },
        { value: "pose_one_arm_boost", label: "片腕を曲げて元気に決める", storage: "pose1054", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_hands_near_head", label: "両手を頭のそばに寄せる", storage: "pose1059", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_present_arm_up", label: "上向きに手を差し出す", storage: "pose1085", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_bold_arc", label: "大きく身体をくの字に傾ける", storage: "pose1125", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_side_stretch", label: "横へ大きく伸びて決める", storage: "pose1126", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_folded_arms_cool", label: "腕を組んでクールに立つ", storage: "pose1162", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_salute_up", label: "敬礼気味に手を上げる", storage: "pose1252", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_side_present", label: "横向きで手を差し出す", storage: "pose1259", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_hand_hip_bold", label: "腰に手を当てて強気に立つ", storage: "pose1282", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_confident_stand", label: "両手を腰に当てて堂々と立つ", storage: "pose2001", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_cute_double_fists", label: "両手を顔のそばに寄せる", storage: "pose2005", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_peace_near_face", label: "ピースを顔のそばに寄せる", storage: "pose2011", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_double_peace", label: "ダブルピースで決める", storage: "pose2024", group: "showcase", exposed: true, scope: "common" },
        { value: "pose_low_angle_guard", label: "身をすぼめて前をかばう", storage: "pose1031", group: "special", exposed: false, scope: "system" },
    ];

    const TRAY_INFO = {
        poses: {
            title: "POSE",
            caption: "標準 / 元気 / 決め の順で、雰囲気に合う立ち姿を選びます",
        },
        expressions: {
            title: "FACE",
            caption: "基本 / 感情 / 遊び / 口元 の順で、雰囲気に合う表情を整えます",
        },
        looks: {
            title: "LOOK",
            caption: "視線の向きで、写真の距離感や空気感を調整します",
        },
    };

    const POSE_TRAY_GROUPS = [
        {
            id: "standard",
            label: "標準",
            caption: "まず試しやすい自然な立ち姿",
            values: [
                "pose_stand_soft",
                "pose_hand_hip_gentle",
                "pose_hand_waist_neat",
                "pose_turn_half",
                "pose_hand_hip_soft",
                "pose_hand_hip_flow",
                "pose_hands_behind_soft",
                "pose_hand_chest",
                "pose_cheek_touch_shy",
                "pose_hair_touch",
                "pose_finger_lips_soft",
                "pose_thinking_lips",
                "pose_relaxed_front",
                "pose_folded_hands_soft",
                "pose_collar_touch",
                "pose_hands_together_front",
                "pose_bowed_shy",
                "pose_polite_front",
            ],
        },
        {
            id: "cheerful",
            label: "元気",
            caption: "明るさや動きを足したいとき",
            values: [
                "pose_open_arm_invite",
                "pose_small_fist_cheer",
                "pose_arm_up_lively",
                "pose_cheer_up",
                "pose_sway_bright",
                "pose_open_hands_bright",
                "pose_reach_forward",
                "pose_side_point",
                "pose_light_step",
                "pose_hands_up_cheer",
                "pose_big_arm_present",
            ],
        },
        {
            id: "showcase",
            label: "決め",
            caption: "写真映えを強めたいとき",
            values: [
                "pose_one_arm_boost",
                "pose_hands_near_head",
                "pose_present_arm_up",
                "pose_bold_arc",
                "pose_side_stretch",
                "pose_folded_arms_cool",
                "pose_salute_up",
                "pose_side_present",
                "pose_hand_hip_bold",
                "pose_confident_stand",
                "pose_cute_double_fists",
                "pose_peace_near_face",
                "pose_double_peace",
            ],
        },
    ];

    const POSE_BUNDLE_DEFINITIONS = {
        library_standard: POSE_TRAY_GROUPS[0].values.slice(),
        library_cheerful: POSE_TRAY_GROUPS[1].values.slice(),
        library_showcase: POSE_TRAY_GROUPS[2].values.slice(),
    };

    const EXPRESSION_BUNDLE_DEFINITIONS = {
        face_base: ["cool", "smile_soft", "smile_bright", "smile_closed_soft", "embarrassed", "relief_soft"],
        face_emotion: ["angry_soft", "sad_soft", "surprised", "startled", "troubled_soft", "pout_soft"],
        face_playful: ["eyes_closed", "eyes_closed_smile", "wink_left", "wink_right"],
        face_mouth: ["mouth_open_aa", "smile_open_soft", "mouth_narrow_ih", "mouth_round_ou", "mouth_wide_ee", "mouth_round_oh"],
    };

    const EXPRESSION_TRAY_GROUPS = [
        {
            id: "base",
            label: "基本",
            caption: "まず試しやすい素直な表情",
            values: ["cool", "smile_soft", "smile_bright", "smile_closed_soft", "embarrassed", "relief_soft"],
        },
        {
            id: "emotion",
            label: "感情",
            caption: "気分や温度感を大きく変えたいとき",
            values: ["angry_soft", "sad_soft", "surprised", "startled", "troubled_soft", "pout_soft"],
        },
        {
            id: "playful",
            label: "遊び",
            caption: "写真にアクセントを足したいとき",
            values: ["eyes_closed", "eyes_closed_smile", "wink_left", "wink_right"],
        },
        {
            id: "mouth",
            label: "口元",
            caption: "表情のニュアンスを口の形で変えたいとき",
            values: ["mouth_open_aa", "smile_open_soft", "mouth_narrow_ih", "mouth_round_ou", "mouth_wide_ee", "mouth_round_oh"],
        },
    ];

    const AUTO_REACTION_LABELS = {
        closeup_blush: "近距離で照れる",
        low_angle_guard: "ローアングルで身構える",
    };

    const AUTO_REACTION_OVERRIDES = {
        expression: false,
        lookAt: false,
        pose: false,
    };

    const DEFAULT_POSE_MAP = CURATED_POSE_CATALOG.reduce((map, item) => {
        map[item.value] = item.storage;
        return map;
    }, {});

    const DEFAULT_EXPRESSION_MAP = {
        angry_soft: "angry",
        cool: "neutral",
        embarrassed: "relaxed",
        eyes_closed: "blink",
        eyes_closed_smile: "eyes_closed_smile",
        mouth_narrow_ih: "ih",
        mouth_open_aa: "aa",
        mouth_round_oh: "oh",
        mouth_round_ou: "ou",
        mouth_wide_ee: "ee",
        pout_soft: "pout_soft",
        relief_soft: "relief_soft",
        sad_soft: "sad",
        smile_bright: "smile_bright",
        smile_closed_soft: "smile_closed_soft",
        smile_open_soft: "smile_open_soft",
        smile_soft: "happy",
        startled: "Surprised",
        surprised: "surprised",
        troubled_soft: "troubled_soft",
        wink_left: "blinkLeft",
        wink_right: "blinkRight",
    };

    const CUSTOM_EXPRESSION_PRESETS = {
        eyes_closed_smile: [
            { expressionName: "blink", val: 1 },
            { expressionName: "happy", val: 0.48 },
            { expressionName: "relaxed", val: 0.16 },
        ],
        pout_soft: [
            { expressionName: "angry", val: 0.16 },
            { expressionName: "ou", val: 0.3 },
            { expressionName: "ih", val: 0.1 },
        ],
        relief_soft: [
            { expressionName: "relaxed", val: 0.62 },
            { expressionName: "happy", val: 0.12 },
            { expressionName: "ih", val: 0.08 },
        ],
        smile_bright: [
            { expressionName: "happy", val: 0.78 },
            { expressionName: "relaxed", val: 0.1 },
            { expressionName: "ee", val: 0.16 },
        ],
        smile_closed_soft: [
            { expressionName: "happy", val: 0.34 },
            { expressionName: "relaxed", val: 0.42 },
        ],
        smile_open_soft: [
            { expressionName: "happy", val: 0.52 },
            { expressionName: "aa", val: 0.28 },
            { expressionName: "ee", val: 0.1 },
        ],
        troubled_soft: [
            { expressionName: "sad", val: 0.28 },
            { expressionName: "relaxed", val: 0.22 },
            { expressionName: "ih", val: 0.14 },
        ],
    };

    const DEFAULT_LOOK_MAP = {
        away: { mode: "lookAt", x: 0.52, y: 0.08 },
        camera: { mode: "camera" },
        slight_away: { mode: "lookAt", x: 0.18, y: 0.03 },
    };

    let cachedModelConfigPromise = null;
    let cachedPhotoDbPromise = null;
    let cachedPreferredImageType = "";
    let cachedPoseCatalog = null;
    let stoneBlinkPatchInstalled = false;

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function toFiniteNumber(value, fallback) {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    }

    function toBoolean(value, fallback) {
        if (typeof value === "boolean") {
            return value;
        }
        if (typeof value === "string") {
            const normalized = value.trim().toLowerCase();
            if (normalized === "true") return true;
            if (normalized === "false") return false;
        }
        return fallback;
    }

    function normalizeOutlineSettings(outlineSettings) {
        const source = outlineSettings && typeof outlineSettings === "object" ? outlineSettings : {};
        return {
            normal: {
                enabled: toBoolean(
                    source.normal && source.normal.enabled,
                    DEFAULT_OUTLINE_SETTINGS.normal.enabled
                ),
            },
            stone: {
                enabled: toBoolean(
                    source.stone && source.stone.enabled,
                    DEFAULT_OUTLINE_SETTINGS.stone.enabled
                ),
            },
        };
    }

    function getCameraOrbit(cameraState, legacyYaw, legacyPitch) {
        const state = cameraState && typeof cameraState === "object" ? cameraState : {};
        return {
            pitch: clamp(
                toFiniteNumber(state.orbitPitch, toFiniteNumber(legacyPitch, 0)),
                CAMERA_LIMITS.orbitPitchMin,
                CAMERA_LIMITS.orbitPitchMax
            ),
            yaw: normalizeAngleDegrees(toFiniteNumber(state.orbitYaw, toFiniteNumber(legacyYaw, 0))),
        };
    }

    function normalizeAngleDegrees(value) {
        const angle = toFiniteNumber(value, 0);
        let normalized = ((angle + 180) % 360 + 360) % 360 - 180;
        if (normalized === -180) {
            normalized = 180;
        }
        return normalized;
    }

    function ensureCustomEmotionPresets() {
        if (!window.VRoid || !window.VRoid.three) {
            return;
        }

        if (!window.VRoid.three.emotionObj || typeof window.VRoid.three.emotionObj !== "object") {
            window.VRoid.three.emotionObj = {};
        }

        const baseEmotionObj = deepClone(window.VRoid.three.emotionObj);

        Object.keys(CUSTOM_EXPRESSION_PRESETS).forEach((presetId) => {
            window.VRoid.three.emotionObj[presetId] = deepClone(CUSTOM_EXPRESSION_PRESETS[presetId]);
        });

        const kag = getKag();
        if (!kag || !kag.stat || !kag.stat.VRoid) {
            return;
        }

        if (!kag.stat.VRoid.emotionObj || typeof kag.stat.VRoid.emotionObj !== "object") {
            kag.stat.VRoid.emotionObj = deepClone(baseEmotionObj);
        } else {
            Object.keys(baseEmotionObj).forEach((presetId) => {
                if (!(presetId in kag.stat.VRoid.emotionObj)) {
                    kag.stat.VRoid.emotionObj[presetId] = deepClone(baseEmotionObj[presetId]);
                }
            });
        }

        Object.keys(CUSTOM_EXPRESSION_PRESETS).forEach((presetId) => {
            kag.stat.VRoid.emotionObj[presetId] = deepClone(CUSTOM_EXPRESSION_PRESETS[presetId]);
        });
    }

    function syncCameraOrbitState(sessionState) {
        if (!sessionState || typeof sessionState !== "object") {
            return { pitch: 0, yaw: 0 };
        }
        if (!sessionState.camera || typeof sessionState.camera !== "object") {
            sessionState.camera = deepClone(DEFAULT_STATE.camera);
        }
        const orbit = getCameraOrbit(sessionState.camera, sessionState.modelRotY, sessionState.modelRotX);
        sessionState.camera.orbitYaw = orbit.yaw;
        sessionState.camera.orbitPitch = orbit.pitch;
        sessionState.modelRotY = orbit.yaw;
        sessionState.modelRotX = orbit.pitch;
        sessionState.camera.distance = clamp(
            toFiniteNumber(sessionState.camera.distance, DEFAULT_STATE.camera.distance),
            CAMERA_LIMITS.distanceMin,
            CAMERA_LIMITS.distanceMax
        );
        sessionState.camera.panX = toFiniteNumber(sessionState.camera.panX, DEFAULT_STATE.camera.panX);
        sessionState.camera.panY = toFiniteNumber(sessionState.camera.panY, DEFAULT_STATE.camera.panY);
        return orbit;
    }

    function findOptionItem(groupName, value) {
        const list = getAllOptionItems(groupName);
        return list.find((item) => item.value === value) || null;
    }

    function getOptionValues(groupName) {
        return getAllOptionItems(groupName).map((item) => item.value);
    }

    function makeGenericPoseCatalogItem(poseId) {
        const numberPart = String(poseId).replace(/^pose/, "");
        return {
            value: poseId,
            label: `ポーズ ${numberPart}`,
            storage: poseId,
            group: "library",
            exposed: false,
            scope: "common",
        };
    }

    function buildPoseCatalog() {
        const catalog = CURATED_POSE_CATALOG.map((item) => Object.assign({}, item));
        const seenValues = {};
        const seenStorages = {};

        catalog.forEach((item) => {
            seenValues[item.value] = true;
            if (item.storage) {
                seenStorages[item.storage] = true;
            }
        });

        const poseJson = window.VRoid && window.VRoid.three && window.VRoid.three.poseJson;
        const runtimePoseIds = poseJson
            ? Object.keys(poseJson).filter((key) => POSE_ID_PATTERN.test(key)).sort()
            : [];

        runtimePoseIds.forEach((poseId) => {
            if (seenValues[poseId] || seenStorages[poseId]) {
                return;
            }
            catalog.push(makeGenericPoseCatalogItem(poseId));
            seenValues[poseId] = true;
        });

        return catalog;
    }

    function getPoseCatalog() {
        const hasRuntimePoses = Boolean(window.VRoid && window.VRoid.three && window.VRoid.three.poseJson);
        if (!cachedPoseCatalog || (hasRuntimePoses && cachedPoseCatalog.length <= CURATED_POSE_CATALOG.length)) {
            cachedPoseCatalog = buildPoseCatalog();
        }
        return cachedPoseCatalog.slice();
    }

    function getDefaultOptionItems(groupName) {
        if (groupName === "poses") {
            return getPoseCatalog().filter((item) => item.exposed !== false);
        }
        return OPTIONS[groupName] || [];
    }

    function getAllOptionItems(groupName) {
        if (groupName === "poses") {
            return getPoseCatalog();
        }
        return OPTIONS[groupName] || [];
    }

    function pushConfigWarning(warnings, message) {
        if (Array.isArray(warnings)) {
            warnings.push(message);
        }
    }

    function toStringArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item) => typeof item === "string" && item);
    }

    function normalizeOptionIds(groupName, configuredValues, heroineId, warnings) {
        const allowedValues = getOptionValues(groupName);
        const sourceValues = Array.isArray(configuredValues) ? configuredValues : [];
        const seen = {};
        const normalized = [];

        sourceValues.forEach((value) => {
            if (typeof value !== "string" || !value) {
                pushConfigWarning(warnings, `[${heroineId}] options.${groupName} に空の値があります`);
                return;
            }
            if (groupName === "poses" && POSE_ID_PATTERN.test(value) && !findOptionItem(groupName, value)) {
                normalized.push(value);
                seen[value] = true;
                return;
            }
            if (!findOptionItem(groupName, value)) {
                pushConfigWarning(warnings, `[${heroineId}] options.${groupName} に未定義のID "${value}" があります`);
                return;
            }
            if (seen[value]) {
                return;
            }
            seen[value] = true;
            normalized.push(value);
        });

        if (!normalized.length) {
            pushConfigWarning(warnings, `[${heroineId}] options.${groupName} が空だったため既定値へ戻しました`);
            return allowedValues;
        }

        return normalized;
    }

    function resolvePoseOptionIds(options, heroineId, warnings) {
        const source = options && typeof options === "object" ? options : {};
        const bundleIds = toStringArray(source.poseBundles);
        const explicitPoses = toStringArray(source.poses);
        const poseRemovals = toStringArray(source.poseRemovals);
        const removalMap = {};
        const merged = [];

        bundleIds.forEach((bundleId) => {
            const bundleValues = POSE_BUNDLE_DEFINITIONS[bundleId];
            if (!bundleValues) {
                pushConfigWarning(warnings, `[${heroineId}] options.poseBundles に未定義のID "${bundleId}" があります`);
                return;
            }
            merged.push(...bundleValues);
        });

        explicitPoses.forEach((poseId) => {
            merged.push(poseId);
        });

        poseRemovals.forEach((poseId) => {
            if (removalMap[poseId]) {
                return;
            }
            removalMap[poseId] = true;
            if (POSE_ID_PATTERN.test(poseId) || findOptionItem("poses", poseId)) {
                return;
            }
            pushConfigWarning(warnings, `[${heroineId}] options.poseRemovals に未定義のID "${poseId}" があります`);
        });

        const filtered = merged.filter((poseId) => !removalMap[poseId]);
        return normalizeOptionIds("poses", filtered, heroineId, warnings);
    }

    function resolveExpressionOptionIds(options, heroineId, warnings) {
        const source = options && typeof options === "object" ? options : {};
        const bundleIds = toStringArray(source.expressionBundles);
        const explicitExpressions = toStringArray(source.expressions);
        const expressionRemovals = toStringArray(source.expressionRemovals);
        const removalMap = {};
        const merged = [];

        bundleIds.forEach((bundleId) => {
            const bundleValues = EXPRESSION_BUNDLE_DEFINITIONS[bundleId];
            if (!bundleValues) {
                pushConfigWarning(warnings, `[${heroineId}] options.expressionBundles に未定義のID "${bundleId}" があります`);
                return;
            }
            merged.push(...bundleValues);
        });

        explicitExpressions.forEach((expressionId) => {
            merged.push(expressionId);
        });

        expressionRemovals.forEach((expressionId) => {
            if (removalMap[expressionId]) {
                return;
            }
            removalMap[expressionId] = true;
            if (findOptionItem("expressions", expressionId)) {
                return;
            }
            pushConfigWarning(warnings, `[${heroineId}] options.expressionRemovals に未定義のID "${expressionId}" があります`);
        });

        const filtered = merged.filter((expressionId) => !removalMap[expressionId]);
        return normalizeOptionIds("expressions", filtered, heroineId, warnings);
    }

    function normalizeLookMapEntry(entry) {
        if (!entry || typeof entry !== "object") {
            return null;
        }
        if (entry.mode === "camera") {
            return { mode: "camera" };
        }
        if (entry.mode !== "lookAt") {
            return null;
        }
        return {
            mode: "lookAt",
            targetType: entry.targetType || "camera",
            x: toFiniteNumber(entry.x, 0),
            y: toFiniteNumber(entry.y, 0),
        };
    }

    function normalizeCameraDefaults(cameraDefaults, heroineId, warnings) {
        const source = cameraDefaults && typeof cameraDefaults === "object" ? cameraDefaults : {};
        const normalized = Object.assign({}, DEFAULT_STATE.camera);

        if ("yaw" in source && !("orbitYaw" in source)) {
            normalized.orbitYaw = toFiniteNumber(source.yaw, DEFAULT_STATE.camera.orbitYaw);
            pushConfigWarning(warnings, `[${heroineId}] defaults.camera.yaw は古いキーです。orbitYaw へ読み替えました`);
        } else {
            normalized.orbitYaw = toFiniteNumber(source.orbitYaw, DEFAULT_STATE.camera.orbitYaw);
        }

        if ("pitch" in source && !("orbitPitch" in source)) {
            normalized.orbitPitch = toFiniteNumber(source.pitch, DEFAULT_STATE.camera.orbitPitch);
            pushConfigWarning(warnings, `[${heroineId}] defaults.camera.pitch は古いキーです。orbitPitch へ読み替えました`);
        } else {
            normalized.orbitPitch = toFiniteNumber(source.orbitPitch, DEFAULT_STATE.camera.orbitPitch);
        }

        normalized.distance = clamp(
            toFiniteNumber(source.distance, DEFAULT_STATE.camera.distance),
            CAMERA_LIMITS.distanceMin,
            CAMERA_LIMITS.distanceMax
        );
        normalized.panX = toFiniteNumber(source.panX, DEFAULT_STATE.camera.panX);
        normalized.panY = toFiniteNumber(source.panY, DEFAULT_STATE.camera.panY);

        return normalized;
    }

    function normalizeCameraFramingDefaults(framingDefaults) {
        const source = framingDefaults && typeof framingDefaults === "object" ? framingDefaults : {};
        return {
            distanceOffset: toFiniteNumber(source.distanceOffset, DEFAULT_CAMERA_FRAMING.distanceOffset),
            eyeLineOffsetY: toFiniteNumber(source.eyeLineOffsetY, DEFAULT_CAMERA_FRAMING.eyeLineOffsetY),
            eyeLineScreenY: clamp(
                toFiniteNumber(source.eyeLineScreenY, DEFAULT_CAMERA_FRAMING.eyeLineScreenY),
                0.22,
                0.62
            ),
            headroom: clamp(
                toFiniteNumber(source.headroom, DEFAULT_CAMERA_FRAMING.headroom),
                0.02,
                0.28
            ),
            bustBottomScreenY: clamp(
                toFiniteNumber(source.bustBottomScreenY, DEFAULT_CAMERA_FRAMING.bustBottomScreenY),
                0.6,
                0.92
            ),
            centerX: clamp(
                toFiniteNumber(source.centerX, DEFAULT_CAMERA_FRAMING.centerX),
                0.35,
                0.65
            ),
            sideMargin: clamp(
                toFiniteNumber(source.sideMargin, DEFAULT_CAMERA_FRAMING.sideMargin),
                0.03,
                0.22
            ),
        };
    }

    function normalizeHeroineProfile(modelConfig, heroineId, profile) {
        const warnings = [];
        const source = profile && typeof profile === "object" ? profile : {};
        const models = source.models && typeof source.models === "object" ? source.models : {};
        const options = source.options && typeof source.options === "object" ? source.options : {};
        const defaults = source.defaults && typeof source.defaults === "object" ? source.defaults : {};
        const plugin = source.plugin && typeof source.plugin === "object" ? source.plugin : {};

        const normalized = {
            label: typeof source.label === "string" && source.label.trim() ? source.label.trim() : humanizeIdentifier(heroineId),
            models: {
                normalPath:
                    models.normalPath ||
                    (modelConfig.heroineModels && modelConfig.heroineModels[heroineId]) ||
                    "",
                pluginStorage:
                    models.pluginStorage ||
                    (modelConfig.heroinePluginModels && modelConfig.heroinePluginModels[heroineId]) ||
                    "",
                stonePath:
                    models.stonePath ||
                    (modelConfig.heroineStoneModels && modelConfig.heroineStoneModels[heroineId]) ||
                    "",
                stonePluginStorage:
                    models.stonePluginStorage ||
                    (modelConfig.heroineStonePluginModels && modelConfig.heroineStonePluginModels[heroineId]) ||
                    "",
            },
            options: {
                poses: resolvePoseOptionIds(options, heroineId, warnings),
                expressions: resolveExpressionOptionIds(options, heroineId, warnings),
                looks: normalizeOptionIds("looks", options.looks, heroineId, warnings),
            },
            defaults: {
                stoneState: defaults.stoneState === "stone" ? "stone" : DEFAULT_STATE.stoneState,
                locationId: typeof defaults.locationId === "string" && defaults.locationId ? defaults.locationId : DEFAULT_STATE.locationId,
                themeId: typeof defaults.themeId === "string" && defaults.themeId ? defaults.themeId : DEFAULT_STATE.themeId,
                camera: normalizeCameraDefaults(defaults.camera, heroineId, warnings),
                framing: normalizeCameraFramingDefaults(defaults.framing),
            },
            plugin: {
                poseMap: plugin.poseMap && typeof plugin.poseMap === "object" ? deepClone(plugin.poseMap) : {},
                expressionMap: plugin.expressionMap && typeof plugin.expressionMap === "object" ? deepClone(plugin.expressionMap) : {},
                lookMap: {},
            },
        };

        if (!normalized.models.normalPath) {
            pushConfigWarning(warnings, `[${heroineId}] models.normalPath が未設定です`);
        }
        if (!normalized.models.pluginStorage && normalized.models.normalPath) {
            normalized.models.pluginStorage = getFileName(normalized.models.normalPath);
            pushConfigWarning(warnings, `[${heroineId}] models.pluginStorage が空だったためファイル名から補完しました`);
        }
        if (!normalized.models.stonePath) {
            pushConfigWarning(warnings, `[${heroineId}] models.stonePath が未設定です`);
        }
        if (!normalized.models.stonePluginStorage && normalized.models.stonePath) {
            normalized.models.stonePluginStorage = getFileName(normalized.models.stonePath);
            pushConfigWarning(warnings, `[${heroineId}] models.stonePluginStorage が空だったためファイル名から補完しました`);
        }

        normalized.defaults.poseId =
            normalized.options.poses.indexOf(defaults.poseId) >= 0
                ? defaults.poseId
                : normalized.options.poses[0];
        normalized.defaults.expressionId =
            normalized.options.expressions.indexOf(defaults.expressionId) >= 0
                ? defaults.expressionId
                : normalized.options.expressions[0];
        normalized.defaults.lookAtId =
            normalized.options.looks.indexOf(defaults.lookAtId) >= 0
                ? defaults.lookAtId
                : normalized.options.looks[0];

        if (defaults.poseId && defaults.poseId !== normalized.defaults.poseId) {
            pushConfigWarning(warnings, `[${heroineId}] defaults.poseId "${defaults.poseId}" は options.poses に無いため差し替えました`);
        }
        if (defaults.expressionId && defaults.expressionId !== normalized.defaults.expressionId) {
            pushConfigWarning(
                warnings,
                `[${heroineId}] defaults.expressionId "${defaults.expressionId}" は options.expressions に無いため差し替えました`
            );
        }
        if (defaults.lookAtId && defaults.lookAtId !== normalized.defaults.lookAtId) {
            pushConfigWarning(warnings, `[${heroineId}] defaults.lookAtId "${defaults.lookAtId}" は options.looks に無いため差し替えました`);
        }

        Object.keys(DEFAULT_LOOK_MAP).forEach((lookId) => {
            normalized.plugin.lookMap[lookId] = deepClone(DEFAULT_LOOK_MAP[lookId]);
        });
        Object.keys(plugin.lookMap || {}).forEach((lookId) => {
            const normalizedEntry = normalizeLookMapEntry(plugin.lookMap[lookId]);
            if (!normalizedEntry) {
                pushConfigWarning(warnings, `[${heroineId}] plugin.lookMap.${lookId} の形式が不正なため既定値を使います`);
                return;
            }
            normalized.plugin.lookMap[lookId] = normalizedEntry;
        });

        if (warnings.length) {
            console.warn("StonePhotoMvp heroine profile warnings:\n" + warnings.join("\n"));
        }

        return normalized;
    }

    function normalizeModelConfig(rawConfig) {
        const source = rawConfig && typeof rawConfig === "object" ? rawConfig : {};
        const normalized = {
            defaultModelPath: source.defaultModelPath || DEFAULT_MODEL_CONFIG.defaultModelPath,
            defaultHeroineId: source.defaultHeroineId || DEFAULT_MODEL_CONFIG.defaultHeroineId,
            heroineModels: Object.assign({}, DEFAULT_MODEL_CONFIG.heroineModels, source.heroineModels),
            heroinePluginModels: Object.assign({}, DEFAULT_MODEL_CONFIG.heroinePluginModels, source.heroinePluginModels),
            heroineStoneModels: Object.assign({}, DEFAULT_MODEL_CONFIG.heroineStoneModels, source.heroineStoneModels),
            heroineStonePluginModels: Object.assign({}, DEFAULT_MODEL_CONFIG.heroineStonePluginModels, source.heroineStonePluginModels),
            heroineProfiles: {},
            outline: normalizeOutlineSettings(source.outline),
            pluginExpectedFolder: source.pluginExpectedFolder || DEFAULT_MODEL_CONFIG.pluginExpectedFolder,
        };
        const profileSource =
            source.heroineProfiles && typeof source.heroineProfiles === "object" ? source.heroineProfiles : {};

        Object.keys(profileSource).forEach((heroineId) => {
            normalized.heroineProfiles[heroineId] = normalizeHeroineProfile(normalized, heroineId, profileSource[heroineId]);
        });

        if (!normalized.heroineProfiles[normalized.defaultHeroineId]) {
            const firstProfileId = Object.keys(normalized.heroineProfiles)[0];
            normalized.defaultHeroineId = firstProfileId || DEFAULT_MODEL_CONFIG.defaultHeroineId;
        }

        if (normalized.heroineProfiles[normalized.defaultHeroineId]) {
            const defaultModelEntry = getHeroineModelEntry(normalized, normalized.defaultHeroineId);
            normalized.defaultModelPath = defaultModelEntry.normalPath || normalized.defaultModelPath;
        }

        return normalized;
    }

    function getHeroineProfile(modelConfig, heroineId) {
        if (!modelConfig || !heroineId || !modelConfig.heroineProfiles) {
            return null;
        }
        return modelConfig.heroineProfiles[heroineId] || null;
    }

    function getHeroineLabel(modelConfig, heroineId) {
        const profile = getHeroineProfile(modelConfig, heroineId);
        return (profile && profile.label) || heroineId || DEFAULT_STATE.heroineId;
    }

    function getHeroineOptionList(modelConfig, heroineId, groupName) {
        const profile = getHeroineProfile(modelConfig, heroineId);
        const configuredValues =
            profile &&
            profile.options &&
            Array.isArray(profile.options[groupName]) &&
            profile.options[groupName].length
                ? profile.options[groupName]
                : null;

        if (!configuredValues) {
            return getDefaultOptionItems(groupName);
        }

        const filtered = configuredValues
            .map((value) => findOptionItem(groupName, value) || (groupName === "poses" && POSE_ID_PATTERN.test(value) ? makeGenericPoseCatalogItem(value) : null))
            .filter(Boolean);

        return filtered.length ? filtered : getDefaultOptionItems(groupName);
    }

    function getHeroineModelEntry(modelConfig, heroineId) {
        const profile = getHeroineProfile(modelConfig, heroineId);
        const profileModels = (profile && profile.models) || {};

        return {
            normalPath:
                profileModels.normalPath ||
                (modelConfig.heroineModels && modelConfig.heroineModels[heroineId]) ||
                modelConfig.defaultModelPath ||
                "",
            normalPluginStorage:
                profileModels.pluginStorage ||
                (modelConfig.heroinePluginModels && modelConfig.heroinePluginModels[heroineId]) ||
                "",
            stonePath:
                profileModels.stonePath ||
                (modelConfig.heroineStoneModels && modelConfig.heroineStoneModels[heroineId]) ||
                "",
            stonePluginStorage:
                profileModels.stonePluginStorage ||
                (modelConfig.heroineStonePluginModels && modelConfig.heroineStonePluginModels[heroineId]) ||
                "",
        };
    }

    function getHeroinePluginMap(modelConfig, heroineId, key, fallback) {
        const profile = getHeroineProfile(modelConfig, heroineId);
        const plugin = (profile && profile.plugin) || {};
        const map = plugin[key];
        if (!map || typeof map !== "object") {
            return fallback;
        }
        return Object.assign({}, fallback, map);
    }

    function getHeroinePoseStorage(modelConfig, heroineId, poseId) {
        const poseMap = getHeroinePluginMap(modelConfig, heroineId, "poseMap", DEFAULT_POSE_MAP);
        const catalogItem = findOptionItem("poses", poseId) || (POSE_ID_PATTERN.test(poseId || "") ? makeGenericPoseCatalogItem(poseId) : null);
        return (
            poseMap[poseId] ||
            (catalogItem && catalogItem.storage) ||
            poseMap[DEFAULT_STATE.poseId] ||
            DEFAULT_POSE_MAP[DEFAULT_STATE.poseId]
        );
    }

    function getHeroineExpressionStorage(modelConfig, heroineId, expressionId) {
        const expressionMap = getHeroinePluginMap(modelConfig, heroineId, "expressionMap", DEFAULT_EXPRESSION_MAP);
        return expressionMap[expressionId] || "default";
    }

    function getHeroineLookConfig(modelConfig, heroineId, lookAtId) {
        const lookMap = getHeroinePluginMap(modelConfig, heroineId, "lookMap", DEFAULT_LOOK_MAP);
        return lookMap[lookAtId] || lookMap.camera || DEFAULT_LOOK_MAP.camera;
    }

    function getOutlineSettings(modelConfig) {
        return (modelConfig && modelConfig.outline) || DEFAULT_OUTLINE_SETTINGS;
    }

    function applyHeroineDefaults(baseState, modelConfig, heroineId, explicitOverrides, behavior) {
        const nextState = deepClone(baseState);
        const profile = getHeroineProfile(modelConfig, heroineId);
        const defaults = (profile && profile.defaults) || {};
        const overrides = explicitOverrides || {};
        const options = behavior || {};

        nextState.heroineId = heroineId || nextState.heroineId;
        nextState.poseId = defaults.poseId || nextState.poseId;
        nextState.expressionId = defaults.expressionId || nextState.expressionId;
        nextState.lookAtId = defaults.lookAtId || nextState.lookAtId;
        nextState.stoneState = defaults.stoneState || nextState.stoneState;

        if (!overrides.locationId && defaults.locationId) {
            nextState.locationId = defaults.locationId;
        }
        if (!overrides.themeId && defaults.themeId) {
            nextState.themeId = defaults.themeId;
        }

        if (options.includeCamera) {
            const defaultCamera = (defaults.camera && typeof defaults.camera === "object") ? defaults.camera : {};
            nextState.camera = Object.assign({}, nextState.camera, defaultCamera);
        }

        const poseOptions = getHeroineOptionList(modelConfig, heroineId, "poses");
        const expressionOptions = getHeroineOptionList(modelConfig, heroineId, "expressions");
        const lookOptions = getHeroineOptionList(modelConfig, heroineId, "looks");

        if (!poseOptions.some((item) => item.value === nextState.poseId) && poseOptions[0]) {
            nextState.poseId = poseOptions[0].value;
        }
        if (!expressionOptions.some((item) => item.value === nextState.expressionId) && expressionOptions[0]) {
            nextState.expressionId = expressionOptions[0].value;
        }
        if (!lookOptions.some((item) => item.value === nextState.lookAtId) && lookOptions[0]) {
            nextState.lookAtId = lookOptions[0].value;
        }

        syncCameraOrbitState(nextState);
        return nextState;
    }

    function getFileName(path) {
        if (!path) {
            return "";
        }
        return String(path).split("/").pop();
    }

    function getKag() {
        return window.TYRANO && window.TYRANO.kag;
    }

    function humanizeIdentifier(value) {
        if (!value) {
            return "";
        }
        return String(value)
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, (match) => match.toUpperCase());
    }

    function getMappedLabel(map, value) {
        if (!value) {
            return "";
        }
        return map[value] || humanizeIdentifier(value);
    }

    function getLocationLabel(locationId) {
        return getMappedLabel(LABELS.locations, locationId);
    }

    function getThemeLabel(themeId) {
        return getMappedLabel(LABELS.themes, themeId);
    }

    function getStoneStateLabel(stoneState) {
        return LABELS.stoneStates[stoneState] || LABELS.stoneStates.normal;
    }

    function isActionableStatusText(text) {
        if (!text) {
            return false;
        }
        return /失敗|見つかりません|必要です/.test(String(text));
    }

    function buildAlbumEntryMarkup(entry, modelConfig, isActive) {
        const heroineLabel = getHeroineLabel(modelConfig, entry && entry.heroineId);
        const timestamp = formatTimestamp(entry && entry.createdAt);

        return `
            <button class="stone-photo-mvp__album-item${isActive ? " is-active" : ""}" data-capture-id="${escapeHtml(entry.captureId)}" type="button">
                <img src="" alt="album thumbnail" />
                <div class="stone-photo-mvp__album-item-meta">
                    <strong>${escapeHtml(heroineLabel)}</strong>
                    <span>${escapeHtml(timestamp)}</span>
                </div>
            </button>
        `;
    }

    function buildAlbumCaptionMarkup(entry, modelConfig) {
        if (!entry) {
            return `<div class="stone-photo-mvp__album-caption-empty">写真を選ぶと、ここに基本情報が表示されます。</div>`;
        }

        const heroineLabel = getHeroineLabel(modelConfig, entry.heroineId);
        const timestamp = formatTimestamp(entry.createdAt);
        const stateLabel = getStoneStateLabel(entry.stoneState);

        return `
            <strong>${escapeHtml(heroineLabel)}</strong>
            <span>${escapeHtml(timestamp)}</span>
            <span>${escapeHtml(stateLabel)}</span>
        `;
    }

    function getAutoReactionLabel(reactionId) {
        return getMappedLabel(AUTO_REACTION_LABELS, reactionId);
    }

    function getMessageLayers(kag) {
        const layers = [];
        if (!kag || !kag.layer || !kag.layer.map_layer_fore) {
            return layers;
        }
        Object.keys(kag.layer.map_layer_fore).forEach((key) => {
            if (key.indexOf("message") === 0) {
                const layer = kag.layer.getLayer(key, "fore");
                if (layer && layer.length) {
                    layers.push(layer);
                }
            }
        });
        return layers;
    }

    function captureTyranoUiState() {
        const kag = getKag();
        const menuButton = $(".button_menu");
        const menuLayer = $(".layer_menu");
        const messageLayers = getMessageLayers(kag);

        return {
            shouldRestoreMessageLayers: Boolean(kag && kag.layer && !kag.stat.is_hide_message),
            messageLayerVisibility: messageLayers.map((layer) => ({
                layer,
                display: layer.css("display"),
                visibleAttr: layer.attr("l_visible"),
            })),
            menuButtonDisplay: menuButton.css("display"),
            menuButtonWasVisible: menuButton.is(":visible"),
            menuLayerDisplay: menuLayer.css("display"),
            menuLayerWasVisible: menuLayer.is(":visible"),
            visibleMenuButtonFlag: Boolean(kag && kag.stat && kag.stat.visible_menu_button),
        };
    }

    function hideTyranoUiForHud() {
        const kag = getKag();
        const snapshot = captureTyranoUiState();

        if (snapshot.shouldRestoreMessageLayers && kag && kag.layer && typeof kag.layer.hideMessageLayers === "function") {
            kag.layer.hideMessageLayers();
        }

        $(".button_menu").hide();
        $(".layer_menu").hide();

        if (kag && kag.stat) {
            kag.stat.visible_menu_button = false;
        }

        return snapshot;
    }

    function restoreTyranoUiAfterHud(snapshot) {
        if (!snapshot) {
            return;
        }

        const kag = getKag();

        if (snapshot.shouldRestoreMessageLayers && kag && kag.layer && typeof kag.layer.showMessageLayers === "function") {
            kag.layer.showMessageLayers();
        }

        if (Array.isArray(snapshot.messageLayerVisibility)) {
            snapshot.messageLayerVisibility.forEach((item) => {
                if (!item || !item.layer || !item.layer.length) {
                    return;
                }
                if (item.visibleAttr != null) {
                    item.layer.attr("l_visible", item.visibleAttr);
                }
                item.layer.css("display", item.display || "");
            });
        }

        const menuButton = $(".button_menu");
        menuButton.css("display", snapshot.menuButtonDisplay || "");
        if (!snapshot.menuButtonWasVisible) {
            menuButton.hide();
        }

        const menuLayer = $(".layer_menu");
        menuLayer.css("display", snapshot.menuLayerDisplay || "");
        if (!snapshot.menuLayerWasVisible) {
            menuLayer.hide();
        }

        if (kag && kag.stat) {
            kag.stat.visible_menu_button = snapshot.visibleMenuButtonFlag;
        }
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function getSystemVariable(key, fallbackValue) {
        const kag = getKag();
        if (!kag || !kag.variable || !kag.variable.sf) {
            return fallbackValue;
        }
        return key in kag.variable.sf ? kag.variable.sf[key] : fallbackValue;
    }

    function setSystemVariable(key, value) {
        const kag = getKag();
        if (!kag || !kag.variable || !kag.variable.sf) {
            return;
        }
        kag.variable.sf[key] = value;
        if (typeof kag.saveSystemVariable === "function") {
            kag.saveSystemVariable();
        }
    }

    function getAlbumEntries() {
        const raw = getSystemVariable(ALBUM_STORAGE_KEY, []);
        return Array.isArray(raw) ? deepClone(raw) : [];
    }

    function appendAlbumEntry(entry) {
        const albumEntries = getAlbumEntries();
        albumEntries.unshift(deepClone(entry));
        const trimmedEntries = albumEntries.slice(0, ALBUM_MAX_ENTRIES);
        const removedEntries = albumEntries.slice(ALBUM_MAX_ENTRIES);
        setSystemVariable(ALBUM_STORAGE_KEY, trimmedEntries);
        return {
            entries: trimmedEntries,
            removedEntries,
        };
    }

    function setAlbumEntries(entries) {
        setSystemVariable(ALBUM_STORAGE_KEY, Array.isArray(entries) ? deepClone(entries) : []);
    }

    function removeAlbumEntry(captureId) {
        const albumEntries = getAlbumEntries().filter((entry) => entry.captureId !== captureId);
        setAlbumEntries(albumEntries);
        return albumEntries;
    }

    function formatTimestamp(isoString) {
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) {
            return isoString || "-";
        }

        const parts = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ];
        const time = [
            String(date.getHours()).padStart(2, "0"),
            String(date.getMinutes()).padStart(2, "0"),
        ].join(":");
        return `${parts.join("/")} ${time}`;
    }

    function makeCaptureId() {
        const stamp = Date.now().toString(36);
        const random = Math.random().toString(36).slice(2, 8);
        return `photo_${stamp}_${random}`;
    }

    function revokeObjectUrl(url) {
        if (url) {
            window.URL.revokeObjectURL(url);
        }
    }

    function openPhotoDatabase() {
        if (!window.indexedDB) {
            return Promise.reject(new Error("IndexedDB が利用できません"));
        }

        if (!cachedPhotoDbPromise) {
            cachedPhotoDbPromise = new Promise((resolve, reject) => {
                const request = window.indexedDB.open(PHOTO_DB_NAME, PHOTO_DB_VERSION);

                request.onupgradeneeded = () => {
                    const database = request.result;
                    if (!database.objectStoreNames.contains(PHOTO_DB_STORE)) {
                        database.createObjectStore(PHOTO_DB_STORE, { keyPath: "captureId" });
                    }
                };

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error || new Error("IndexedDB の初期化に失敗しました"));
            }).catch((error) => {
                cachedPhotoDbPromise = null;
                throw error;
            });
        }

        return cachedPhotoDbPromise;
    }

    function runPhotoDbTransaction(mode, executor) {
        return openPhotoDatabase().then(
            (database) =>
                new Promise((resolve, reject) => {
                    const transaction = database.transaction(PHOTO_DB_STORE, mode);
                    const store = transaction.objectStore(PHOTO_DB_STORE);
                    const request = executor(store);

                    transaction.oncomplete = () => resolve(request ? request.result : undefined);
                    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB トランザクションに失敗しました"));
                    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB トランザクションが中断されました"));
                })
        );
    }

    function saveCaptureToDatabase(entry) {
        return runPhotoDbTransaction("readwrite", (store) =>
            store.put({
                captureId: entry.captureId,
                createdAt: entry.createdAt,
                imageBlob: entry.imageBlob,
                thumbnailBlob: entry.thumbnailBlob,
                imageType: entry.imageType,
                thumbnailType: entry.thumbnailType,
                captureSize: entry.captureSize,
            })
        );
    }

    function loadCaptureFromDatabase(captureId) {
        return runPhotoDbTransaction("readonly", (store) => store.get(captureId));
    }

    function deleteCaptureFromDatabase(captureId) {
        return runPhotoDbTransaction("readwrite", (store) => store.delete(captureId));
    }

    function detectPreferredImageType() {
        if (cachedPreferredImageType) {
            return cachedPreferredImageType;
        }

        const canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 2;

        try {
            const dataUrl = canvas.toDataURL("image/webp", 0.8);
            cachedPreferredImageType = dataUrl.indexOf("data:image/webp") === 0 ? "image/webp" : "image/jpeg";
        } catch (error) {
            cachedPreferredImageType = "image/jpeg";
        }

        return cachedPreferredImageType;
    }

    function createScaledCanvas(sourceCanvas, maxWidth) {
        const width = sourceCanvas.width || 1;
        const height = sourceCanvas.height || 1;
        const scale = Math.min(1, maxWidth / width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
        return canvas;
    }

    function canvasToBlob(canvas, mimeType, quality) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                        return;
                    }
                    reject(new Error("画像Blobの生成に失敗しました"));
                },
                mimeType,
                quality
            );
        });
    }

    function getGameBackgroundCaptureTarget() {
        const selectors = [
            "#tyrano_base .base_fore",
            "#tyrano_base #root_layer_game",
            "#tyrano_base",
        ];

        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0) {
                return el;
            }
        }

        return null;
    }

    async function captureGameBackgroundCanvas(scale) {
        const captureTarget = getGameBackgroundCaptureTarget();
        if (!captureTarget || typeof window.html2canvas !== "function") {
            return null;
        }

        const bgCanvas = await window.html2canvas(captureTarget, {
            backgroundColor: null,
            logging: false,
            scale,
            useCORS: true,
        });

        if (!bgCanvas || bgCanvas.width <= 0 || bgCanvas.height <= 0) {
            return null;
        }

        return bgCanvas;
    }

    async function captureViewportImage(viewportElement) {
        if (!viewportElement || typeof window.html2canvas !== "function") {
            throw new Error("html2canvas が利用できません");
        }

        viewportElement.classList.add("is-capturing");

        try {
            await new Promise((resolve) => window.setTimeout(resolve, 40));

            const scale = Math.min(window.devicePixelRatio || 1, 2);

            const backgroundCanvas = await captureGameBackgroundCanvas(scale);
            if (!backgroundCanvas) {
                throw new Error("背景CGのキャプチャに失敗しました");
            }

            // Capture model viewport (transparent bg)
            const modelCanvas = await window.html2canvas(viewportElement, {
                backgroundColor: null,
                logging: false,
                scale,
                useCORS: true,
            });

            // Composite: background CG + model
            const compositeCanvas = document.createElement("canvas");
            compositeCanvas.width = modelCanvas.width;
            compositeCanvas.height = modelCanvas.height;
            const ctx = compositeCanvas.getContext("2d");

            ctx.drawImage(backgroundCanvas, 0, 0, compositeCanvas.width, compositeCanvas.height);
            ctx.drawImage(modelCanvas, 0, 0);

            const imageType = detectPreferredImageType();
            const thumbnailType = imageType;
            const imageCanvas = createScaledCanvas(compositeCanvas, CAPTURE_MAX_WIDTH);
            const thumbnailCanvas = createScaledCanvas(compositeCanvas, THUMBNAIL_MAX_WIDTH);
            const imageBlob = await canvasToBlob(imageCanvas, imageType, CAPTURE_IMAGE_QUALITY);
            const thumbnailBlob = await canvasToBlob(thumbnailCanvas, thumbnailType, THUMBNAIL_IMAGE_QUALITY);

            return {
                imageBlob,
                thumbnailBlob,
                imageType,
                thumbnailType,
                previewImageUrl: window.URL.createObjectURL(imageBlob),
                previewThumbnailUrl: window.URL.createObjectURL(thumbnailBlob),
                captureSize: {
                    width: imageCanvas.width,
                    height: imageCanvas.height,
                },
            };
        } finally {
            viewportElement.classList.remove("is-capturing");
        }
    }

    async function loadModelConfig() {
        if (!cachedModelConfigPromise) {
            cachedModelConfigPromise = window
                .fetch(MODEL_CONFIG_URL, { cache: "no-cache" })
                .then((response) => (response.ok ? response.json() : DEFAULT_MODEL_CONFIG))
                .then((config) => normalizeModelConfig(config))
                .catch(() => normalizeModelConfig(DEFAULT_MODEL_CONFIG));
        }
        return cachedModelConfigPromise;
    }

    function ensureStoneBlinkPatch() {
        if (stoneBlinkPatchInstalled || !window.VRoid || !window.VRoid.three || typeof window.VRoid.three.runBlink !== "function") {
            return;
        }

        const originalRunBlink = window.VRoid.three.runBlink;
        window.VRoid.three.runBlink = function patchedRunBlink(expressionManager, model, val) {
            if (model && model.stonePhotoBlinkDisabled) {
                if (model) {
                    model.isBlink = false;
                    model.noBlink = true;
                }
                return;
            }

            return originalRunBlink.call(this, expressionManager, model, val);
        };

        stoneBlinkPatchInstalled = true;
    }

    function setVariable(resultVar, payload) {
        const kag = getKag();
        if (!kag || !resultVar) {
            return;
        }
        const script = `${resultVar} = ${JSON.stringify(payload)};`;
        kag.evalScript(script);
    }

    function makeResultPayload(status, payload) {
        return Object.assign(
            {
                status,
                cancelled: status !== "committed",
            },
            payload || {}
        );
    }

    function getAutoReaction(state) {
        if (!state || state.stoneState === "stone") {
            return null;
        }

            const orbit = getCameraOrbit(state.camera, state.modelRotY, state.modelRotX, state.stoneState);
        const distance = toFiniteNumber(state.camera && state.camera.distance, DEFAULT_STATE.camera.distance);
        const panY = toFiniteNumber(state.camera && state.camera.panY, DEFAULT_STATE.camera.panY);
        const showsLowerBodyArea = panY <= -16;

        if (orbit.pitch <= -42 && distance <= 1.35 && showsLowerBodyArea) {
            return {
                expressionId: "embarrassed",
                id: "low_angle_guard",
                lookAtId: "slight_away",
                poseId: "pose_low_angle_guard",
            };
        }

        if (distance <= 0.42) {
            return {
                expressionId: "embarrassed",
                id: "closeup_blush",
            };
        }

        return null;
    }

    function hasEnabledAutoReactionOverrides() {
        return Object.keys(AUTO_REACTION_OVERRIDES).some((key) => AUTO_REACTION_OVERRIDES[key]);
    }

    function getEffectiveShotState(baseState) {
        const nextState = deepClone(baseState);
        const reaction = getAutoReaction(nextState);
        nextState.autoReactionId = reaction && hasEnabledAutoReactionOverrides() ? reaction.id : "";
        if (reaction) {
            if (AUTO_REACTION_OVERRIDES.pose && reaction.poseId) {
                nextState.poseId = reaction.poseId;
            }
            if (AUTO_REACTION_OVERRIDES.expression && reaction.expressionId) {
                nextState.expressionId = reaction.expressionId;
            }
            if (AUTO_REACTION_OVERRIDES.lookAt && reaction.lookAtId) {
                nextState.lookAtId = reaction.lookAtId;
            }
        }
        return nextState;
    }

    function createVroidPluginAdapter(onUpdate) {
        const state = {
            ambientFillLight: null,
            canvas: null,
            framingVector: null,
            hemisphereFillLight: null,
            host: null,
            layerId: "StonePhotoLayer",
            loadError: "",
            loading: false,
            modelConfig: null,
            normalModelId: "StonePhotoModelNormal",
            stoneModelId: "StonePhotoModelStone",
            modelPath: "",
            modelVersion: 0,
            normalPluginStorage: "",
            ready: false,
            stoneModelPath: "",
            stoneModelReady: false,
            stonePluginStorage: "",
            sessionHeroineId: DEFAULT_STATE.heroineId,
            outlineMode: "",
        };

        function syncLayerSaveDataFromCamera(camera) {
            const saveLayer = getKag().stat && getKag().stat.VRoid && getKag().stat.VRoid.layer
                ? getKag().stat.VRoid.layer[state.layerId]
                : null;
            if (!camera || !saveLayer) {
                return;
            }
            saveLayer.x = camera.position.x;
            saveLayer.y = camera.position.y;
            saveLayer.z = camera.position.z;
            saveLayer.rotX = camera.rotation.x;
            saveLayer.rotY = camera.rotation.y;
            saveLayer.rotZ = camera.rotation.z;
            saveLayer.zoom = camera.zoom;
        }

        function applyCanonicalLayerCamera(cameraState) {
            const layer = hasPluginSupport() && window.VRoid.three.layer
                ? window.VRoid.three.layer[state.layerId]
                : null;
            if (!layer || !layer.camera) {
                return;
            }
            applyCameraPlacement(layer.camera, cameraState || DEFAULT_STATE.camera);
            syncLayerSaveDataFromCamera(layer.camera);
        }

        function hasPluginSupport() {
            return Boolean(window.VRoid && window.VRoid.three);
        }

        function getPluginTHREE() {
            if (!hasPluginSupport()) {
                return window.THREE || null;
            }
            if (typeof window.VRoid.three.getTHREE === "function") {
                return window.VRoid.three.getTHREE();
            }
            return window.THREE || null;
        }

        function usesRealViewport() {
            return Boolean(state.ready && !state.loadError && isPluginRuntimeReady());
        }

        function clearHost() {
            if (!state.host) {
                return;
            }
            while (state.host.firstChild) {
                state.host.removeChild(state.host.firstChild);
            }
        }

        function attachCanvasToHost() {
            if (!state.host) {
                return;
            }

            const canvas = document.getElementById(state.layerId);
            if (!canvas) {
                return;
            }

            state.canvas = canvas;
            clearHost();
            state.host.appendChild(canvas);
            canvas.style.position = "absolute";
            canvas.style.inset = "0";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.pointerEvents = "none";
            canvas.style.zIndex = "0";
        }

        function hasRequiredRuntimeModel(modelId) {
            const runtimeModel =
                hasPluginSupport() && window.VRoid.three.model
                    ? window.VRoid.three.model[modelId]
                    : null;
            return Boolean(runtimeModel && runtimeModel.vrm && runtimeModel.vrm.scene);
        }

        function hasOperationalRuntimeModel(modelId) {
            const runtimeModel = getRuntimeModel(modelId);
            return Boolean(
                runtimeModel &&
                runtimeModel.vrm &&
                runtimeModel.vrm.scene &&
                runtimeModel.vrm.humanoid &&
                runtimeModel.waitingClock
            );
        }

        function ensureRuntimeCanvasAttached() {
            if (!state.host) {
                return false;
            }

            const canvas =
                document.getElementById(state.layerId) ||
                (
                    hasPluginSupport() &&
                    window.VRoid.three.layer &&
                    window.VRoid.three.layer[state.layerId] &&
                    window.VRoid.three.layer[state.layerId].renderer
                        ? window.VRoid.three.layer[state.layerId].renderer.domElement
                        : null
                );

            if (!canvas) {
                state.canvas = null;
                return false;
            }

            if (state.canvas !== canvas || canvas.parentElement !== state.host) {
                attachCanvasToHost();
            }

            return Boolean(state.canvas && state.canvas.parentElement === state.host);
        }

        function isPluginRuntimeReady() {
            if (!hasPluginSupport() || window.VRoid.three.isWebglcontextlost) {
                return false;
            }

            const layer = window.VRoid.three.layer && window.VRoid.three.layer[state.layerId];
            if (!layer || !layer.camera) {
                return false;
            }

            if (!hasRequiredRuntimeModel(state.normalModelId)) {
                return false;
            }

            if (state.stoneModelReady && !hasRequiredRuntimeModel(state.stoneModelId)) {
                return false;
            }

            return ensureRuntimeCanvasAttached();
        }

        function purgePluginModelRegistration(modelId) {
            if (!hasPluginSupport() || !modelId) {
                return;
            }

            const runtimeModel = window.VRoid.three.model ? window.VRoid.three.model[modelId] : null;
            if (runtimeModel) {
                try {
                    ["tickID", "poseRequestId", "requestEmoId", "moveTickID", "resetHipsTickID", "requestlookAtId"].forEach((key) => {
                        if (runtimeModel[key]) {
                            cancelAnimationFrame(runtimeModel[key]);
                            runtimeModel[key] = null;
                        }
                    });
                } catch (e) {}

                try {
                    if (runtimeModel.vrm && runtimeModel.vrm.scene && runtimeModel.vrm.scene.parent) {
                        runtimeModel.vrm.scene.parent.remove(runtimeModel.vrm.scene);
                    }
                } catch (e) {}

                delete window.VRoid.three.model[modelId];
            }

            const kag = getKag();
            if (kag && kag.stat && kag.stat.VRoid && kag.stat.VRoid.model) {
                delete kag.stat.VRoid.model[modelId];
            }
        }

        function purgePluginModelRegistrations() {
            purgePluginModelRegistration(state.normalModelId);
            purgePluginModelRegistration(state.stoneModelId);
        }

        function disposeLayer() {
            if (hasPluginSupport() && window.VRoid.three.layer && window.VRoid.three.layer[state.layerId]) {
                window.VRoid.three.dispose(state.layerId);
            }
            purgePluginModelRegistrations();
            clearHost();
            state.ambientFillLight = null;
            state.canvas = null;
            state.framingVector = null;
            state.hemisphereFillLight = null;
            state.outlineMode = "";
            state.ready = false;
            state.modelVersion += 1;
            state.stoneModelReady = false;
        }

        function ensurePluginLayer(width, height) {
            disposeLayer();

            window.VRoid.three.create({
                antialias: true,
                height,
                highLight: 0.9,
                layer: "0",
                layerID: state.layerId,
                left: 0,
                lightType: "directional",
                limitFPS: false,
                perspective: true,
                quality: 1.25,
                screenshot: true,
                showFPS: false,
                top: 0,
                visible: true,
                width,
            });
            applyCanonicalLayerCamera(DEFAULT_STATE.camera);

            applyLayerLighting();
        }

        function ensureSupplementalLights() {
            const THREE = getPluginTHREE();
            if (!hasPluginSupport() || !THREE || !window.VRoid.three.layer || !window.VRoid.three.layer[state.layerId]) {
                return;
            }

            const scene = window.VRoid.three.layer[state.layerId].scene;
            if (!scene) {
                return;
            }

            const ambientNeedsCreate =
                !state.ambientFillLight ||
                !(state.ambientFillLight instanceof THREE.AmbientLight);
            if (ambientNeedsCreate) {
                state.ambientFillLight = new THREE.AmbientLight(0xffffff, 0.16);
                state.ambientFillLight.name = "StonePhotoAmbientFill";
            }
            if (state.ambientFillLight.parent !== scene) {
                scene.add(state.ambientFillLight);
            }

            const hemisphereNeedsCreate =
                !state.hemisphereFillLight ||
                !(state.hemisphereFillLight instanceof THREE.HemisphereLight);
            if (hemisphereNeedsCreate) {
                state.hemisphereFillLight = new THREE.HemisphereLight(0xf1f5ff, 0x5f6775, 0.12);
                state.hemisphereFillLight.position.set(0, 1.8, 0);
                state.hemisphereFillLight.name = "StonePhotoHemisphereFill";
            }
            if (state.hemisphereFillLight.parent !== scene) {
                scene.add(state.hemisphereFillLight);
            }
        }

        function applyLayerLighting() {
            if (!hasPluginSupport() || !window.VRoid.three.layer || !window.VRoid.three.layer[state.layerId]) {
                return;
            }

            ensureSupplementalLights();
            window.VRoid.three.light(
                Object.assign(
                    {
                        layerID: state.layerId,
                        time: 0,
                    },
                    PLUGIN_LIGHTING
                )
            );

            if (state.ambientFillLight) {
                state.ambientFillLight.intensity = PLUGIN_LIGHTING.ambientIntensity || 0;
            }
            if (state.hemisphereFillLight) {
                state.hemisphereFillLight.intensity = PLUGIN_LIGHTING.hemiIntensity || 0;
                state.hemisphereFillLight.color.setHex(PLUGIN_LIGHTING.hemiSky || 0xf1f5ff);
                state.hemisphereFillLight.groundColor.setHex(PLUGIN_LIGHTING.hemiGround || 0x5f6775);
            }
        }

        function tuneStoneMaterial(material) {
            if (!material || (material.userData && material.userData.stonePhotoTuned)) {
                return;
            }

            material.userData = material.userData || {};
            material.userData.stonePhotoTuned = true;

            if (typeof material.roughness === "number") {
                material.roughness = Math.max(material.roughness, STONE_MATERIAL_TUNING.roughnessFloor);
            }
            if (typeof material.metalness === "number") {
                material.metalness *= STONE_MATERIAL_TUNING.metalnessScale;
            }
            if (typeof material.clearcoat === "number") {
                material.clearcoat *= STONE_MATERIAL_TUNING.clearcoatScale;
            }
            if (typeof material.envMapIntensity === "number") {
                material.envMapIntensity *= STONE_MATERIAL_TUNING.envMapIntensityScale;
            }

            if (material.normalScale) {
                const baseScale =
                    typeof material.normalScale.x === "number" ? material.normalScale.x : 1;
                if (typeof material.normalScale.setScalar === "function") {
                    material.normalScale.setScalar(baseScale * STONE_MATERIAL_TUNING.normalScale);
                } else {
                    material.normalScale.x = baseScale * STONE_MATERIAL_TUNING.normalScale;
                    material.normalScale.y = baseScale * STONE_MATERIAL_TUNING.normalScale;
                }
            }

            if (material.color && material.emissive && typeof material.emissive.copy === "function") {
                material.emissive.copy(material.color).multiplyScalar(STONE_MATERIAL_TUNING.emissiveLift);
                material.emissiveIntensity = STONE_MATERIAL_TUNING.emissiveIntensity;
            }

            material.needsUpdate = true;
        }

        function applyStoneMaterialTuning(modelId) {
            if (!hasPluginSupport() || !window.VRoid.three.model || !window.VRoid.three.model[modelId]) {
                return;
            }

            const runtimeModel = window.VRoid.three.model[modelId];
            if (
                runtimeModel.stonePhotoMaterialsTuned ||
                !runtimeModel.vrm ||
                !runtimeModel.vrm.scene
            ) {
                return;
            }

            runtimeModel.vrm.scene.traverse((node) => {
                if (!node || !node.isMesh || !node.material) {
                    return;
                }
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach(tuneStoneMaterial);
            });

            runtimeModel.stonePhotoMaterialsTuned = true;
        }

        function getLoadedModelIds() {
            const ids = [state.normalModelId];
            if (state.stoneModelReady) {
                ids.push(state.stoneModelId);
            }
            return ids;
        }

        function getActiveModelId(stoneState) {
            if (stoneState === "stone" && state.stoneModelReady) {
                return state.stoneModelId;
            }
            return state.normalModelId;
        }

        function getOutlinePreset(stoneState) {
            const mode = stoneState === "stone" ? "stone" : "normal";
            const settings = getOutlineSettings(state.modelConfig);
            return Object.assign({}, OUTLINE_RENDER_PRESETS[mode], settings[mode], {
                enabled: Boolean(settings[mode] && settings[mode].enabled),
                mode,
            });
        }

        function loadPluginModel(modelId, storageName) {
            return new Promise((resolve) => {
                window.VRoid.three.load(
                    modelId,
                    `./data/others/plugin/vrm/model/${storageName}`,
                    () => {
                        const runtimeModel = getRuntimeModel(modelId);
                        if (runtimeModel) {
                            delete runtimeModel.stonePhotoFramingMetrics;
                            delete runtimeModel.stonePhotoMaterialsTuned;
                        }
                        resolve();
                    },
                    true,
                    false
                );
            });
        }

        function getRuntimeModel(modelId) {
            if (!hasPluginSupport() || !window.VRoid.three.model) {
                return null;
            }
            return window.VRoid.three.model[modelId] || null;
        }

        function getVector3Class() {
            const layer = hasPluginSupport() && window.VRoid.three.layer
                ? window.VRoid.three.layer[state.layerId]
                : null;
            if (layer && layer.camera && layer.camera.position && layer.camera.position.constructor) {
                return layer.camera.position.constructor;
            }

            const runtimeModel = getRuntimeModel(state.normalModelId) || getRuntimeModel(state.stoneModelId);
            if (
                runtimeModel &&
                runtimeModel.vrm &&
                runtimeModel.vrm.scene &&
                runtimeModel.vrm.scene.position &&
                runtimeModel.vrm.scene.position.constructor
            ) {
                return runtimeModel.vrm.scene.position.constructor;
            }

            return null;
        }

        function createVector3(x, y, z) {
            const Vector3Class = getVector3Class();
            return Vector3Class ? new Vector3Class(x || 0, y || 0, z || 0) : null;
        }

        function cloneBounds(bounds) {
            if (!bounds) {
                return null;
            }
            return {
                max: { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z },
                min: { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
            };
        }

        function computeSceneBounds(scene) {
            if (!scene) {
                return null;
            }

            const min = { x: Infinity, y: Infinity, z: Infinity };
            const max = { x: -Infinity, y: -Infinity, z: -Infinity };
            const corner = createVector3(0, 0, 0);
            if (!corner) {
                return null;
            }

            let hasPoint = false;
            scene.updateMatrixWorld(true);
            scene.traverse((node) => {
                if (!node || !node.isMesh || !node.geometry) {
                    return;
                }
                const geometry = node.geometry;
                if (!geometry.boundingBox && typeof geometry.computeBoundingBox === "function") {
                    geometry.computeBoundingBox();
                }
                const box = geometry.boundingBox;
                if (!box || !box.min || !box.max) {
                    return;
                }

                const xs = [box.min.x, box.max.x];
                const ys = [box.min.y, box.max.y];
                const zs = [box.min.z, box.max.z];
                for (let xi = 0; xi < xs.length; xi += 1) {
                    for (let yi = 0; yi < ys.length; yi += 1) {
                        for (let zi = 0; zi < zs.length; zi += 1) {
                            corner.set(xs[xi], ys[yi], zs[zi]).applyMatrix4(node.matrixWorld);
                            min.x = Math.min(min.x, corner.x);
                            min.y = Math.min(min.y, corner.y);
                            min.z = Math.min(min.z, corner.z);
                            max.x = Math.max(max.x, corner.x);
                            max.y = Math.max(max.y, corner.y);
                            max.z = Math.max(max.z, corner.z);
                            hasPoint = true;
                        }
                    }
                }
            });

            return hasPoint ? { min, max } : null;
        }

        function getOutlineTargetObject(stoneState) {
            const runtimeModel = getRuntimeModel(getActiveModelId(stoneState));
            return runtimeModel && runtimeModel.vrm && runtimeModel.vrm.scene ? runtimeModel.vrm.scene : null;
        }

        function applyOutlineForState(sessionState) {
            if (
                !hasPluginSupport() ||
                typeof window.VRoid.three.effect !== "function" ||
                typeof window.VRoid.three.effect_delete !== "function"
            ) {
                return;
            }

            const preset = getOutlinePreset(sessionState && sessionState.stoneState);
            if (!preset.enabled) {
                state.outlineMode = "";
                window.VRoid.three.effect_delete(state.layerId, "OUTLINE");
                return;
            }

            const targetObject = getOutlineTargetObject(sessionState && sessionState.stoneState);
            if (!targetObject) {
                state.outlineMode = "";
                window.VRoid.three.effect_delete(state.layerId, "OUTLINE");
                return;
            }

            state.outlineMode = preset.mode;
            window.VRoid.three.effect(state.layerId, "OUTLINE", {
                downSampleRatio: preset.downSampleRatio,
                edgeGlow: preset.edgeGlow,
                edgeStrength: preset.edgeStrength,
                edgeThickness: preset.edgeThickness,
                hiddenEdgeColor: preset.hiddenEdgeColor,
                pulsePeriod: preset.pulsePeriod,
                selectedObjects: [targetObject],
                visibleEdgeColor: preset.visibleEdgeColor,
            });
        }

        function getHumanoidBoneWorldPosition(vrm, boneName) {
            if (!vrm || !vrm.humanoid || typeof vrm.humanoid.getNormalizedBoneNode !== "function") {
                return null;
            }
            const bone = vrm.humanoid.getNormalizedBoneNode(boneName);
            if (!bone || typeof bone.getWorldPosition !== "function") {
                return null;
            }
            state.framingVector = state.framingVector || createVector3(0, 0, 0);
            if (!state.framingVector) {
                return null;
            }
            return bone.getWorldPosition(state.framingVector).clone();
        }

        function getHumanoidBoneWorldY(vrm, boneName) {
            const position = getHumanoidBoneWorldPosition(vrm, boneName);
            return position ? position.y : null;
        }

        function getModelFramingMetrics(modelId) {
            const runtimeModel = getRuntimeModel(modelId);
            if (!runtimeModel || runtimeModel.stonePhotoFramingMetrics || !runtimeModel.vrm || !runtimeModel.vrm.scene) {
                return runtimeModel ? runtimeModel.stonePhotoFramingMetrics || null : null;
            }

            const scene = runtimeModel.vrm.scene;
            scene.updateMatrixWorld(true);

            const leftEyeY = getHumanoidBoneWorldY(runtimeModel.vrm, "leftEye");
            const rightEyeY = getHumanoidBoneWorldY(runtimeModel.vrm, "rightEye");
            const headY = getHumanoidBoneWorldY(runtimeModel.vrm, "head");
            const neckY = getHumanoidBoneWorldY(runtimeModel.vrm, "neck");
            const hipsY = getHumanoidBoneWorldY(runtimeModel.vrm, "hips");
            const chestY = getHumanoidBoneWorldY(runtimeModel.vrm, "chest");
            const upperChestY = getHumanoidBoneWorldY(runtimeModel.vrm, "upperChest");
            const spineY = getHumanoidBoneWorldY(runtimeModel.vrm, "spine");
            const leftShoulder = getHumanoidBoneWorldPosition(runtimeModel.vrm, "leftShoulder");
            const rightShoulder = getHumanoidBoneWorldPosition(runtimeModel.vrm, "rightShoulder");
            if (headY == null) {
                return null;
            }

            const headToNeck = Math.max(0.08, headY - (neckY == null ? headY - 0.14 : neckY));
            const eyeLineY =
                leftEyeY != null && rightEyeY != null
                    ? (leftEyeY + rightEyeY) * 0.5
                    : headY - headToNeck * 0.18;
            const headTopY = headY + Math.max(0.08, headToNeck * 1.05);
            const bounds = computeSceneBounds(scene);
            const shoulderCenterY =
                leftShoulder && rightShoulder
                    ? (leftShoulder.y + rightShoulder.y) * 0.5
                    : upperChestY != null
                      ? upperChestY + headToNeck * 0.35
                      : chestY != null
                        ? chestY + headToNeck * 0.65
                        : neckY != null
                          ? neckY - headToNeck * 0.15
                          : headY - headToNeck * 1.35;
            const upperTorsoAnchorY =
                upperChestY != null
                    ? upperChestY
                    : chestY != null
                      ? chestY
                      : spineY != null
                        ? spineY + headToNeck * 0.75
                        : shoulderCenterY - headToNeck * 0.8;
            const bustBottomY = Math.max(
                bounds && Number.isFinite(bounds.min.y) ? bounds.min.y : 0,
                Math.min(
                    upperTorsoAnchorY - Math.max(0.1, headToNeck * 1.15),
                    shoulderCenterY - Math.max(0.12, headToNeck * 1.65)
                )
            );
            const metrics = {
                bodyCenterY:
                    bounds && Number.isFinite(bounds.min.y) && Number.isFinite(bounds.max.y)
                        ? (bounds.min.y + bounds.max.y) * 0.5
                        : 0.9,
                bounds: cloneBounds(bounds),
                bustBottomY,
                eyeLineY,
                headTopY,
                height:
                    bounds && Number.isFinite(bounds.min.y) && Number.isFinite(bounds.max.y)
                        ? bounds.max.y - bounds.min.y
                        : null,
                hipsY: hipsY != null ? hipsY : 0,
            };
            runtimeModel.stonePhotoFramingMetrics = metrics;
            return metrics;
        }

        function applyCameraPlacement(camera, cameraState) {
            const orbit = getCameraOrbit(cameraState, 0, 0);
            const panX = cameraState && cameraState.panX ? cameraState.panX : 0;
            const panY = cameraState && cameraState.panY ? cameraState.panY : 0;
            const distance = 0.7 + clamp(
                toFiniteNumber(cameraState && cameraState.distance, DEFAULT_STATE.camera.distance),
                CAMERA_LIMITS.distanceMin,
                CAMERA_LIMITS.distanceMax
            ) * 0.72;
            const targetX = panX * 0.01;
            const targetY = 0.98 + panY * 0.01;
            const yawRad = orbit.yaw * (Math.PI / 180);
            const pitchRad = orbit.pitch * (Math.PI / 180);
            const cosPitch = Math.cos(pitchRad);
            const x = targetX + Math.sin(yawRad) * cosPitch * distance;
            const y = targetY + 0.3 + Math.sin(pitchRad) * distance;
            const z = Math.cos(yawRad) * cosPitch * distance;

            camera.position.set(x, y, z);
            camera.lookAt(targetX, targetY, 0);
            camera.updateMatrixWorld(true);
            camera.updateProjectionMatrix();
        }

        function projectWorldPointToViewport(cameraState, x, y, z) {
            const layer = window.VRoid.three.layer[state.layerId];
            if (!layer || !layer.camera) {
                return null;
            }

            applyCameraPlacement(layer.camera, cameraState);
            state.framingVector = state.framingVector || createVector3(0, 0, 0);
            if (!state.framingVector) {
                return null;
            }
            state.framingVector.set(x, y, z).project(layer.camera);
            if (!Number.isFinite(state.framingVector.x) || !Number.isFinite(state.framingVector.y)) {
                return null;
            }
            return {
                x: (state.framingVector.x + 1) * 0.5,
                y: (1 - state.framingVector.y) * 0.5,
            };
        }

        function projectWorldYToViewport(cameraState, worldY) {
            const projected = projectWorldPointToViewport(cameraState, cameraState.panX * 0.01, worldY, 0);
            return projected ? projected.y : null;
        }

        function getUpperBodyBounds(metrics) {
            if (!metrics || !metrics.bounds) {
                return null;
            }
            const bounds = cloneBounds(metrics.bounds);
            bounds.min.y = clamp(
                metrics.bustBottomY,
                bounds.min.y,
                bounds.max.y - 0.05
            );
            return bounds;
        }

        function projectBoundsToViewport(cameraState, bounds) {
            if (!bounds) {
                return null;
            }

            const min = bounds.min;
            const max = bounds.max;
            const corners = [
                [min.x, min.y, min.z],
                [min.x, min.y, max.z],
                [min.x, max.y, min.z],
                [min.x, max.y, max.z],
                [max.x, min.y, min.z],
                [max.x, min.y, max.z],
                [max.x, max.y, min.z],
                [max.x, max.y, max.z],
            ];
            let left = Infinity;
            let right = -Infinity;
            let top = Infinity;
            let bottom = -Infinity;
            for (let i = 0; i < corners.length; i += 1) {
                const [x, y, z] = corners[i];
                const projected = projectWorldPointToViewport(cameraState, x, y, z);
                if (!projected) {
                    return null;
                }
                left = Math.min(left, projected.x);
                right = Math.max(right, projected.x);
                top = Math.min(top, projected.y);
                bottom = Math.max(bottom, projected.y);
            }
            return {
                bottom,
                centerX: (left + right) * 0.5,
                left,
                right,
                top,
            };
        }

        function refineCameraDefaultsForModel(sessionState, modelId) {
            const runtimeModel = getRuntimeModel(modelId);
            if (!runtimeModel || !runtimeModel.vrm || !runtimeModel.vrm.scene) {
                return null;
            }

            const profile = getHeroineProfile(state.modelConfig, sessionState.heroineId);
            const framing = normalizeCameraFramingDefaults(profile && profile.defaults && profile.defaults.framing);
            const metrics = getModelFramingMetrics(modelId);
            const layer = window.VRoid.three.layer[state.layerId];
            if (!metrics || !layer || !layer.camera) {
                return null;
            }
            const upperBodyBounds = getUpperBodyBounds(metrics);
            if (!upperBodyBounds) {
                return null;
            }

            const preferredDistance = clamp(
                toFiniteNumber(sessionState.camera && sessionState.camera.distance, DEFAULT_STATE.camera.distance) + framing.distanceOffset,
                CAMERA_LIMITS.distanceMin,
                CAMERA_LIMITS.distanceMax
            );
            const preferredPanX = toFiniteNumber(sessionState.camera && sessionState.camera.panX, DEFAULT_STATE.camera.panX);
            const preferredPanY = toFiniteNumber(sessionState.camera && sessionState.camera.panY, DEFAULT_STATE.camera.panY);
            let bestCamera = null;
            let bestError = Infinity;

            for (let distance = preferredDistance - 0.16; distance <= preferredDistance + 0.16; distance += 0.04) {
                const candidateDistance = clamp(distance, CAMERA_LIMITS.distanceMin, CAMERA_LIMITS.distanceMax);
                for (let panX = preferredPanX - 8; panX <= preferredPanX + 8; panX += 1) {
                    for (let panY = preferredPanY - 24; panY <= preferredPanY + 24; panY += 1) {
                        const candidate = Object.assign({}, sessionState.camera, {
                            distance: candidateDistance,
                            panX,
                            panY,
                        });
                        const eyeLineScreenY = projectWorldYToViewport(candidate, metrics.eyeLineY + framing.eyeLineOffsetY);
                        const upperBodyFrame = projectBoundsToViewport(candidate, upperBodyBounds);
                        if (eyeLineScreenY == null || !upperBodyFrame) {
                            continue;
                        }

                        let framingError = Math.abs(eyeLineScreenY - framing.eyeLineScreenY) * 8;
                        framingError += Math.abs(upperBodyFrame.bottom - framing.bustBottomScreenY) * 6;
                        framingError += Math.abs(upperBodyFrame.centerX - framing.centerX) * 5;

                        if (upperBodyFrame.top < framing.headroom) {
                            framingError += (framing.headroom - upperBodyFrame.top) * 55;
                        }
                        if (upperBodyFrame.bottom > 0.94) {
                            framingError += (upperBodyFrame.bottom - 0.94) * 65;
                        }
                        if (upperBodyFrame.left < framing.sideMargin) {
                            framingError += (framing.sideMargin - upperBodyFrame.left) * 90;
                        }
                        if (upperBodyFrame.right > 1 - framing.sideMargin) {
                            framingError += (upperBodyFrame.right - (1 - framing.sideMargin)) * 90;
                        }

                        framingError += Math.abs(candidateDistance - preferredDistance) * 1.2;
                        framingError += Math.abs(panX - preferredPanX) * 0.08;
                        framingError += Math.abs(panY - preferredPanY) * 0.03;

                        if (framingError < bestError) {
                            bestError = framingError;
                            bestCamera = candidate;
                        }
                    }
                }
            }

            return bestCamera || null;
        }

        function addPluginModel(modelId, visible, heroineId) {
            window.VRoid.three.add({
                layerID: state.layerId,
                lookingCamera: true,
                modelID: modelId,
                pose: getHeroinePoseStorage(state.modelConfig, heroineId, DEFAULT_STATE.poseId),
                shake: false,
                visible,
                waitingAnimation: false,
                waitingAnimationVal: 0,
                waitingAnimationSpeed: 1,
                x: 0,
                y: 0,
                z: 0,
            });

            window.VRoid.three.modelConfig(modelId, true, false, 1, false, 0, 1);
            attachCanvasToHost();
        }

        function setModelVisibility(modelId, visible) {
            if (!hasPluginSupport() || !window.VRoid.three.model || !window.VRoid.three.model[modelId]) {
                return;
            }

            if (visible) {
                window.VRoid.three.show(modelId, 0, "default", null, false);
            } else {
                window.VRoid.three.hide(modelId, 0, "default", null, false);
            }
        }

        function freezeCurrentLookTarget(modelId) {
            const THREE = getPluginTHREE();
            if (
                !hasPluginSupport() ||
                !window.VRoid.three.model ||
                !window.VRoid.three.model[modelId] ||
                !THREE ||
                !getKag()
            ) {
                return;
            }

            const runtimeModel = window.VRoid.three.model[modelId];
            const vrm = runtimeModel.vrm;
            const saveModel = getKag().stat && getKag().stat.VRoid && getKag().stat.VRoid.model
                ? getKag().stat.VRoid.model[modelId]
                : null;

            if (!vrm || !vrm.lookAt || !saveModel) {
                return;
            }

            let targetPosition = null;
            if (vrm.lookAt.target && vrm.lookAt.target.position) {
                targetPosition = vrm.lookAt.target.position.clone();
            } else if (saveModel.lookAtTarget) {
                targetPosition = new THREE.Vector3(
                    Number(saveModel.lookAtTarget.x || 0),
                    Number(saveModel.lookAtTarget.y || 0),
                    Number(saveModel.lookAtTarget.z || 0)
                );
            }

            if (!targetPosition) {
                return;
            }

            saveModel.lookingCamera = false;
            saveModel.lookAtTarget = {
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z,
            };

            if (runtimeModel.requestlookAtId) {
                cancelAnimationFrame(runtimeModel.requestlookAtId);
            }

            runtimeModel.lookAtTarget = new THREE.Object3D();
            runtimeModel.lookAtTarget.position.copy(targetPosition);
            vrm.lookAt.target = runtimeModel.lookAtTarget;
        }

        function setAdditionalStoneMotionLock(runtimeModel, locked) {
            if (!runtimeModel) {
                return;
            }

            const activeAction =
                runtimeModel.currentAction ||
                (runtimeModel.mixer && runtimeModel.mixer.action ? runtimeModel.mixer.action : null);

            if (locked) {
                ["poseRequestId", "requestEmoId", "moveTickID", "resetHipsTickID"].forEach((key) => {
                    if (runtimeModel[key]) {
                        cancelAnimationFrame(runtimeModel[key]);
                        runtimeModel[key] = null;
                    }
                });

                runtimeModel.stonePhotoMixerPauseState =
                    activeAction && typeof activeAction.paused === "boolean" ? activeAction.paused : null;
                if (activeAction && typeof activeAction.paused === "boolean") {
                    activeAction.paused = true;
                }

                runtimeModel.isAnimating = false;
                runtimeModel.isEmotion = false;
                runtimeModel.isNoUpdate = false;
                return;
            }

            if (
                activeAction &&
                typeof activeAction.paused === "boolean" &&
                typeof runtimeModel.stonePhotoMixerPauseState === "boolean"
            ) {
                activeAction.paused = runtimeModel.stonePhotoMixerPauseState;
            }
            runtimeModel.stonePhotoMixerPauseState = null;
        }

        function setStoneMotionLock(modelId, locked, sessionState) {
            if (!hasPluginSupport() || !window.VRoid.three.model || !window.VRoid.three.model[modelId] || !getKag()) {
                return;
            }

            const runtimeModel = window.VRoid.three.model[modelId];
            const saveModel = getKag().stat && getKag().stat.VRoid && getKag().stat.VRoid.model
                ? getKag().stat.VRoid.model[modelId]
                : null;
            runtimeModel.stonePhotoBlinkDisabled = Boolean(locked);
            runtimeModel.stonePhotoMotionLocked = Boolean(locked);

            if (locked) {
                freezeCurrentLookTarget(modelId);
            }

            setAdditionalStoneMotionLock(runtimeModel, locked);

            window.VRoid.three.modelConfig(modelId, locked ? false : null, false, 1, false, 0, 1);

            if (saveModel) {
                saveModel.shake = false;
                saveModel.shakeSpeed = 1;
                saveModel.waitingAnimation = false;
                saveModel.waitingAnimationVal = 0;
                saveModel.waitingAnimationSpeed = 1;
            }

            if (!locked && sessionState) {
                applyLookToModel(modelId, sessionState.lookAtId);
            }
        }

        function applyCamera(sessionState) {
            const cameraState = sessionState.camera || {};
            const layer = window.VRoid.three.layer[state.layerId];
            if (!layer || !layer.camera) {
                return;
            }

            const camera = layer.camera;
            const normalizedSessionState = {
                camera: Object.assign({}, cameraState),
                modelRotX: sessionState.modelRotX,
                modelRotY: sessionState.modelRotY,
            };
            syncCameraOrbitState(normalizedSessionState);

            applyCameraPlacement(camera, normalizedSessionState.camera);
            syncLayerSaveDataFromCamera(camera);
        }

        function applyModelRotation() {
            const modelIds = getLoadedModelIds();
            modelIds.forEach((modelId) => {
                const runtimeModel = window.VRoid.three.model[modelId];
                if (!runtimeModel || !runtimeModel.vrm || !runtimeModel.vrm.scene) {
                    return;
                }
                const scene = runtimeModel.vrm.scene;
                scene.rotation.set(0, 0, 0, "YXZ");
                scene.position.set(0, 0, 0);
            });
        }

        function applyLookToModel(modelId, lookAtId) {
            if (!window.VRoid.three.model[modelId]) {
                return;
            }

            const lookConfig = getHeroineLookConfig(state.modelConfig, state.sessionHeroineId, lookAtId);
            if (!lookConfig || lookConfig.mode === "camera") {
                window.VRoid.three.lookAtCamera(modelId, 0, "default", null, false, false);
                return;
            }

            window.VRoid.three.lookAt(
                modelId,
                Number(lookConfig.x || 0),
                Number(lookConfig.y || 0),
                Number(lookConfig.targetX || 0),
                Number(lookConfig.targetY || 0),
                lookConfig.speed || "default",
                lookConfig.targetType || "camera",
                null,
                false,
                false
            );
        }

        function applyLook(lookAtId) {
            getLoadedModelIds().forEach((modelId) => applyLookToModel(modelId, lookAtId));
        }

        function applyExpressionPresetToModel(modelId, expressionStorage) {
            if (!window.VRoid.three.model || !window.VRoid.three.model[modelId]) {
                return;
            }

            const runtimeModel = window.VRoid.three.model[modelId];
            const expressionManager =
                runtimeModel &&
                runtimeModel.vrm &&
                runtimeModel.vrm.expressionManager;

            if (!expressionManager || typeof expressionManager.setValue !== "function") {
                return;
            }

            const expressionList = Array.isArray(expressionManager.expressions) && expressionManager.expressions.length
                ? expressionManager.expressions
                : (Array.isArray(expressionManager._expressions) ? expressionManager._expressions : []);
            const targetValues = {};
            const presetValues = CUSTOM_EXPRESSION_PRESETS[expressionStorage] || (
                expressionStorage && expressionStorage !== "default"
                    ? [{ expressionName: expressionStorage, val: 1 }]
                    : []
            );

            expressionList.forEach((entry) => {
                if (entry && entry.expressionName) {
                    targetValues[entry.expressionName] = 0;
                }
            });

            presetValues.forEach((entry) => {
                if (entry && entry.expressionName) {
                    targetValues[entry.expressionName] = entry.val;
                }
            });

            Object.keys(targetValues).forEach((expressionName) => {
                expressionManager.setValue(expressionName, targetValues[expressionName]);
            });

            if (typeof expressionManager.update === "function") {
                expressionManager.update();
            }

            if (runtimeModel.requestEmoId) {
                cancelAnimationFrame(runtimeModel.requestEmoId);
                runtimeModel.requestEmoId = null;
            }
            runtimeModel.isEmotion = false;

            const kag = getKag();
            const saveModel = kag && kag.stat && kag.stat.VRoid && kag.stat.VRoid.model
                ? kag.stat.VRoid.model[modelId]
                : null;

            if (!saveModel || !expressionList.length) {
                return;
            }

            if (!Array.isArray(saveModel.expression) || !saveModel.expression.length) {
                saveModel.expression = expressionList
                    .filter((entry) => entry && entry.expressionName)
                    .map((entry) => ({ expressionName: entry.expressionName, val: 0 }));
            }

            saveModel.expression.forEach((entry) => {
                if (!entry || !entry.expressionName) {
                    return;
                }
                entry.val = targetValues[entry.expressionName] !== undefined
                    ? targetValues[entry.expressionName]
                    : 0;
            });
        }

        function applyPoseAndExpressionToModel(modelId, sessionState) {
            if (!hasOperationalRuntimeModel(modelId)) {
                return;
            }

            const poseId = getHeroinePoseStorage(state.modelConfig, sessionState.heroineId, sessionState.poseId);
            const expressionId = getHeroineExpressionStorage(
                state.modelConfig,
                sessionState.heroineId,
                sessionState.expressionId
            );

            window.VRoid.three.pose(modelId, poseId, 0, "default", null, false, false);
            applyExpressionPresetToModel(modelId, expressionId);
        }

        function applyPoseAndExpression(sessionState) {
            getLoadedModelIds().forEach((modelId) => applyPoseAndExpressionToModel(modelId, sessionState));
        }

        function syncStoneState(sessionState) {
            const useStoneModel = sessionState.stoneState === "stone";
            setModelVisibility(state.normalModelId, !useStoneModel);
            if (state.stoneModelReady) {
                setModelVisibility(state.stoneModelId, useStoneModel);
                setStoneMotionLock(state.stoneModelId, useStoneModel, sessionState);
            }
            setStoneMotionLock(state.normalModelId, false, sessionState);
        }

        return {
            isAvailable() {
                return isPluginRuntimeReady();
            },

            usesRealViewport,

            getMode() {
                return "vrm-plugin";
            },

            async onOpen(sessionState, root, context = {}) {
                const isCurrentRequest =
                    context && typeof context.isCurrent === "function" ? context.isCurrent : () => true;
                state.host = root.find(".stone-photo-mvp__render-host").get(0);
                state.loading = true;
                state.loadError = "";
                state.ready = false;
                state.stoneModelPath = "";
                state.stoneModelReady = false;
                state.stonePluginStorage = "";
                state.modelVersion += 1;
                onUpdate();

                if (!hasPluginSupport()) {
                    state.loading = false;
                    onUpdate();
                    return;
                }

                try {
                    ensureStoneBlinkPatch();
                    state.modelConfig = await loadModelConfig();
                    if (!isCurrentRequest()) {
                        return;
                    }
                    state.sessionHeroineId = sessionState.heroineId;
                    const modelEntry = getHeroineModelEntry(state.modelConfig, sessionState.heroineId);
                    state.modelPath = modelEntry.normalPath;
                    state.normalPluginStorage = modelEntry.normalPluginStorage || getFileName(state.modelPath);
                    state.stoneModelPath = modelEntry.stonePath;
                    state.stonePluginStorage = modelEntry.stonePluginStorage || getFileName(state.stoneModelPath);

                    if (!state.normalPluginStorage) {
                        state.loadError = "VRoidプラグイン用のモデル設定が見つかりません";
                        return;
                    }
                    if (!state.stonePluginStorage) {
                        state.loadError = "石化モデルの設定が見つかりません";
                        return;
                    }

                    const width = (state.host && state.host.clientWidth) || 720;
                    const height = (state.host && state.host.clientHeight) || 520;

                    if (!isCurrentRequest()) {
                        return;
                    }
                    ensurePluginLayer(width, height);
                    purgePluginModelRegistrations();
                    await loadPluginModel(state.normalModelId, state.normalPluginStorage);
                    if (!isCurrentRequest()) {
                        return;
                    }
                    addPluginModel(state.normalModelId, true, sessionState.heroineId);
                    await loadPluginModel(state.stoneModelId, state.stonePluginStorage);
                    if (!isCurrentRequest()) {
                        return;
                    }
                    addPluginModel(state.stoneModelId, false, sessionState.heroineId);
                    applyStoneMaterialTuning(state.stoneModelId);
                    state.stoneModelReady = true;
                    if (ENABLE_AUTO_CAMERA_FRAMING) {
                        const framedCamera = this.refineCameraDefaults(sessionState);
                        if (framedCamera) {
                            sessionState.camera = framedCamera;
                        }
                    }

                    ensureCustomEmotionPresets();
                    if (!isCurrentRequest()) {
                        return;
                    }
                    this.applyState(sessionState);
                    if (!isCurrentRequest()) {
                        return;
                    }
                    state.ready = true;
                } catch (error) {
                    if (!isCurrentRequest()) {
                        return;
                    }
                    console.error(error);
                    state.loadError = "VRoidプラグインでのモデル初期化に失敗しました";
                } finally {
                    if (!isCurrentRequest()) {
                        return;
                    }
                    state.loading = false;
                    onUpdate();
                }
            },

            applyState(sessionState) {
                if (!hasPluginSupport()) {
                    return;
                }

                ensureCustomEmotionPresets();

                if (!window.VRoid.three.model[state.normalModelId]) {
                    return;
                }
                applyPoseAndExpression(sessionState);
                applyLook(sessionState.lookAtId);
                syncCameraOrbitState(sessionState);
                applyLayerLighting();
                applyCamera(sessionState);
                applyModelRotation();
                syncStoneState(sessionState);
                applyOutlineForState(sessionState);
            },

            refreshRuntimeView(sessionState) {
                if (!hasPluginSupport()) {
                    return;
                }
                state.canvas = null;
                state.ambientFillLight = null;
                state.hemisphereFillLight = null;
                state.outlineMode = "";
                ensureRuntimeCanvasAttached();
                this.applyState(sessionState);
            },

            refineCameraDefaults(sessionState) {
                if (!ENABLE_AUTO_CAMERA_FRAMING) {
                    return null;
                }
                if (!hasPluginSupport() || !window.VRoid.three.model[state.normalModelId]) {
                    return null;
                }
                let workingState = deepClone(sessionState);
                let framedCamera = null;
                for (let i = 0; i < 3; i += 1) {
                    const candidate = refineCameraDefaultsForModel(workingState, state.normalModelId);
                    if (!candidate) {
                        break;
                    }
                    framedCamera = deepClone(candidate);
                    workingState.camera = deepClone(candidate);
                }
                return framedCamera;
            },

            onClose() {
                disposeLayer();
                state.loading = false;
                state.loadError = "";
            },

            getStatusText(sessionState) {
                if (!hasPluginSupport()) {
                    return "VRoidプラグインが見つかりません";
                }
                if (state.loading) {
                    return "モデルを読み込んでいます。しばらくお待ちください。";
                }
                if (state.loadError) {
                    return state.loadError;
                }
                if (state.normalPluginStorage) {
                    const stoneNote =
                        sessionState && sessionState.stoneState === "stone"
                            ? `石化モデル表示中: ${state.stonePluginStorage || "stone model"}`
                            : "ポーズ・表情・視線・カメラは実接続中";
                    return `VRoidプラグイン接続中: ${state.normalPluginStorage} / ${stoneNote}`;
                }
                return "VRoidプラグイン待機中";
            },

            isLoading() {
                return Boolean(state.loading);
            },

            getModelPath() {
                return state.stoneModelPath
                    ? `${state.modelPath} | stone=${state.stoneModelPath}`
                    : state.modelPath || state.normalPluginStorage;
            },

            getModelConfig() {
                return state.modelConfig;
            },
        };
    }

    function createUnavailableAdapter() {
        return {
            isAvailable() {
                return false;
            },

            usesRealViewport() {
                return false;
            },

            getMode() {
                return "unavailable";
            },

            onOpen() {},

            applyState() {},

            onClose() {},

            getStatusText() {
                return "VRoidプラグインが必要です";
            },

            isLoading() {
                return false;
            },

            getModelPath() {
                return "";
            },

            getModelConfig() {
                return null;
            },
        };
    }

    function ensureAdapter(onUpdate) {
        if (window.StonePhotoVrAdapter) {
            return window.StonePhotoVrAdapter;
        }

        if (window.VRoid && window.VRoid.three) {
            return createVroidPluginAdapter(onUpdate);
        }

        return createUnavailableAdapter();
    }

    function getGameViewportRect() {
        const tyranoBase = document.getElementById("tyrano_base");
        if (tyranoBase) {
            const rect = tyranoBase.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                return rect;
            }
        }

        return {
            left: 0,
            top: 0,
            width: window.innerWidth || document.documentElement.clientWidth || 0,
            height: window.innerHeight || document.documentElement.clientHeight || 0,
        };
    }

    function syncRootToGameViewport(root) {
        if (!root || !root.length) {
            return;
        }

        const rect = getGameViewportRect();
        root.css({
            left: `${Math.round(rect.left)}px`,
            top: `${Math.round(rect.top)}px`,
            width: `${Math.round(rect.width)}px`,
            height: `${Math.round(rect.height)}px`,
        });
        root
            .toggleClass("is-compact-height", rect.height <= 260)
            .toggleClass("is-ultra-compact-height", rect.height <= 210)
            .toggleClass("is-narrow-width", rect.width <= 420)
            .toggleClass("is-ultra-narrow-width", rect.width <= 340)
            .toggleClass(
                "is-landscape-compact",
                rect.width >= rect.height && rect.height <= 430 && rect.width <= 900
            );
    }

    function createRoot() {
        const root = $(`
            <div class="stone-photo-mvp hidden">
                <div class="stone-photo-mvp__viewport">
                    <div class="stone-photo-mvp__render-host"></div>
                    <div class="stone-photo-mvp__model">
                        <div class="stone-photo-mvp__silhouette"></div>
                    </div>
                    <div class="stone-photo-mvp__loading hidden" aria-live="polite" aria-atomic="true">
                        <div class="stone-photo-mvp__loading-card">
                            <div class="stone-photo-mvp__loading-spinner" aria-hidden="true"></div>
                            <div class="stone-photo-mvp__loading-title">3Dモデルを読み込み中…</div>
                            <div class="stone-photo-mvp__loading-text">モデルを読み込んでいます。しばらくお待ちください。</div>
                        </div>
                    </div>
                    <div class="stone-photo-mvp__hud">
                        <div class="stone-photo-mvp__hud-top">
                            <div class="stone-photo-mvp__hud-top-left">
                                <span class="stone-photo-mvp__heroine-name"></span>
                                <span class="stone-photo-mvp__theme-name"></span>
                            </div>
                            <div class="stone-photo-mvp__hud-top-right">
                                <span class="stone-photo-mvp__state-badge">通常</span>
                                <button class="stone-photo-mvp__btn stone-photo-mvp__btn-ui-toggle" data-action="toggle-ui" type="button" title="UI表示切替">⚙</button>
                            </div>
                        </div>
                        <div class="stone-photo-mvp__status hidden"></div>
                        <div class="stone-photo-mvp__hud-sub">
                            <button class="stone-photo-mvp__btn" data-action="open-tray" data-tray="poses" type="button">POSE</button>
                            <button class="stone-photo-mvp__btn" data-action="open-tray" data-tray="expressions" type="button">FACE</button>
                            <button class="stone-photo-mvp__btn" data-action="open-tray" data-tray="looks" type="button">LOOK</button>
                        </div>
                        <div class="stone-photo-mvp__tray">
                            <div class="stone-photo-mvp__tray-panel">
                                <div class="stone-photo-mvp__tray-header">
                                    <div class="stone-photo-mvp__tray-title"></div>
                                    <div class="stone-photo-mvp__tray-caption"></div>
                                </div>
                                <div class="stone-photo-mvp__tray-inner"></div>
                            </div>
                        </div>
                        <div class="stone-photo-mvp__hud-main">
                            <button class="stone-photo-mvp__btn stone-photo-mvp__btn-random" data-action="randomize-style" type="button">ランダム</button>
                            <button class="stone-photo-mvp__btn stone-photo-mvp__btn-stone" data-action="toggle-stone" type="button">石化する</button>
                            <button class="stone-photo-mvp__btn stone-photo-mvp__btn-shutter" data-action="shutter" type="button">撮影する</button>
                        </div>
                        <div class="stone-photo-mvp__hud-bottom-left">
                            <button class="stone-photo-mvp__btn stone-photo-mvp__btn-aux" data-action="reset" type="button">RESET</button>
                            <button class="stone-photo-mvp__btn stone-photo-mvp__btn-aux" data-action="open-album" type="button">ALBUM</button>
                        </div>
                        <div class="stone-photo-mvp__hud-bottom-right">
                            <button class="stone-photo-mvp__btn stone-photo-mvp__btn-aux" data-action="back" type="button">BACK</button>
                        </div>
                        <div class="stone-photo-mvp__camera-guide">
                            <div class="stone-photo-mvp__camera-guide-text"></div>
                        </div>
                        <div class="stone-photo-mvp__controls-help">
                            <kbd>左ドラッグ</kbd> 回り込み　<kbd>右ドラッグ</kbd> フレーム移動　<kbd>ホイール</kbd> 前後移動　<kbd>ダブルクリック</kbd> リセット　<kbd>Space</kbd> UI非表示
                        </div>
                    </div>
                </div>
                <div class="stone-photo-mvp__preview hidden">
                    <div class="stone-photo-mvp__photo-viewer stone-photo-mvp__preview-card">
                        <div class="stone-photo-mvp__viewer-top">
                            <h2 class="stone-photo-mvp__viewer-title">撮影結果</h2>
                            <button class="stone-photo-mvp__viewer-close" data-action="retake" type="button">戻る</button>
                        </div>
                        <div class="stone-photo-mvp__viewer-stage">
                            <img class="stone-photo-mvp__preview-image" alt="撮影プレビュー" />
                        </div>
                        <div class="stone-photo-mvp__viewer-actions stone-photo-mvp__preview-actions">
                            <button class="stone-photo-mvp__btn stone-photo-mvp__btn-retake" data-action="retake" type="button">撮り直す</button>
                            <button class="stone-photo-mvp__btn stone-photo-mvp__btn-commit" data-action="commit" type="button">アルバムに残す</button>
                        </div>
                    </div>
                </div>
                <div class="stone-photo-mvp__album hidden">
                    <div class="stone-photo-mvp__photo-viewer stone-photo-mvp__album-card">
                        <div class="stone-photo-mvp__viewer-top stone-photo-mvp__album-top">
                            <h2 class="stone-photo-mvp__viewer-title stone-photo-mvp__album-title">アルバム</h2>
                            <div class="stone-photo-mvp__album-tools">
                                <label class="stone-photo-mvp__album-filter">
                                    ヒロイン
                                    <select class="stone-photo-mvp__select stone-photo-mvp__album-filter-select" data-field="albumFilter"></select>
                                </label>
                                <label class="stone-photo-mvp__album-sort">
                                    並び順
                                    <select class="stone-photo-mvp__select stone-photo-mvp__album-sort-select" data-field="albumSort"></select>
                                </label>
                                <button class="stone-photo-mvp__album-bulk-export" data-action="export-filtered-album" type="button">まとめて書き出す</button>
                                <button class="stone-photo-mvp__album-close" data-action="close-album" type="button">閉じる</button>
                            </div>
                        </div>
                        <div class="stone-photo-mvp__album-body">
                            <aside class="stone-photo-mvp__album-sidebar">
                                <div class="stone-photo-mvp__album-count"></div>
                                <div class="stone-photo-mvp__album-list"></div>
                                <div class="stone-photo-mvp__album-paging">
                                    <button class="stone-photo-mvp__album-page-btn" data-action="album-prev-page" type="button">前へ</button>
                                    <span class="stone-photo-mvp__album-page-label"></span>
                                    <button class="stone-photo-mvp__album-page-btn" data-action="album-next-page" type="button">次へ</button>
                                </div>
                            </aside>
                            <div class="stone-photo-mvp__album-main">
                                <div class="stone-photo-mvp__viewer-stage stone-photo-mvp__album-stage">
                                    <div class="stone-photo-mvp__album-empty">まだ写真がありません</div>
                                    <img class="stone-photo-mvp__album-image hidden" alt="保存済み写真" />
                                </div>
                                <div class="stone-photo-mvp__album-caption"></div>
                                <div class="stone-photo-mvp__viewer-actions stone-photo-mvp__album-actions">
                                    <button class="stone-photo-mvp__btn stone-photo-mvp__btn-export" data-action="export-album-item" type="button">書き出す</button>
                                    <button class="stone-photo-mvp__btn stone-photo-mvp__btn-delete" data-action="delete-album-item" type="button">削除する</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        $("body").append(root);
        syncRootToGameViewport(root);
        return root;
    }

    const StonePhotoMvp = {
        root: null,
        state: deepClone(DEFAULT_STATE),
        session: null,
        adapter: null,
        previewResult: null,
        previewCaptureAssets: null,
        albumEntries: [],
        albumSelectionId: "",
        albumFilter: "all",
        albumPage: 1,
        albumSort: "newest",
        isCapturing: false,
        mode: "shoot",
        modelConfig: null,
        modelConfigPromise: null,
        profileDefaultsApplied: false,
        profileFramingApplied: false,
        explicitStateOverrides: {},
        albumRenderToken: 0,
        activeTray: "",
        dragState: null,
        hudPinnedHidden: false,
        hudHoldHidden: false,
        cameraGuideTimer: 0,
        helpHintTimer: 0,
        rootFrameSyncTimer: 0,
        trayDismissHandler: null,
        modelConfigLoadWarning: "",
        runtimeStatusMessage: "",
        runtimeStatusTone: "",
        tyranoUiState: null,
        assetUrlCache: {
            image: new Map(),
            thumbnail: new Map(),
        },

        revokePreviewAssets() {
            if (this.root) {
                this.root.find(".stone-photo-mvp__preview-image").attr("src", "");
            }
            if (!this.previewCaptureAssets) {
                return;
            }
            revokeObjectUrl(this.previewCaptureAssets.previewImageUrl);
            revokeObjectUrl(this.previewCaptureAssets.previewThumbnailUrl);
            this.previewCaptureAssets = null;
        },

        revokeAlbumAssetCache() {
            if (this.root) {
                this.root.find(".stone-photo-mvp__album-image").attr("src", "");
                this.root.find(".stone-photo-mvp__album-item img").attr("src", "");
            }
            Object.values(this.assetUrlCache).forEach((cacheMap) => {
                cacheMap.forEach((url) => revokeObjectUrl(url));
                cacheMap.clear();
            });
        },

        invalidateAlbumRender() {
            this.albumRenderToken += 1;
        },

        clearTransientAssets() {
            this.invalidateAlbumRender();
            this.revokePreviewAssets();
            this.revokeAlbumAssetCache();
        },

        sortAlbumEntries(entries) {
            const sorted = Array.isArray(entries) ? entries.slice() : [];

            sorted.sort((left, right) => {
                switch (this.albumSort) {
                    case "oldest":
                        return String(left.createdAt || "").localeCompare(String(right.createdAt || ""));
                    case "heroine_asc":
                        return String(left.heroineId || "").localeCompare(String(right.heroineId || "")) ||
                            String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
                    case "newest":
                    default:
                        return String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
                }
            });

            return sorted;
        },

        filterAlbumEntries(entries) {
            const filteredEntries = Array.isArray(entries) ? entries : [];
            if (!this.albumFilter || this.albumFilter === "all") {
                return filteredEntries;
            }
            return filteredEntries.filter((entry) => entry.heroineId === this.albumFilter);
        },

        getAlbumPageCount(entries) {
            return Math.max(1, Math.ceil((entries.length || 0) / ALBUM_PAGE_SIZE));
        },

        clampAlbumPage(entries) {
            const pageCount = this.getAlbumPageCount(entries);
            this.albumPage = Math.max(1, Math.min(pageCount, Number(this.albumPage) || 1));
            return pageCount;
        },

        syncRootFrame() {
            syncRootToGameViewport(this.root);
        },

        scheduleRootFrameSync(shouldRender = false) {
            clearTimeout(this.rootFrameSyncTimer);
            this.syncRootFrame();
            this.rootFrameSyncTimer = window.setTimeout(() => {
                this.rootFrameSyncTimer = 0;
                this.syncRootFrame();
                if (shouldRender && this.root && !this.root.hasClass("hidden")) {
                    this.render();
                }
            }, 450);
        },

        ensureUi() {
            if (this.root) return;
            this.root = createRoot();
            this.bindUi();
            this.populateSelects();
            this.scheduleRootFrameSync();
        },

        ensureModelConfig() {
            if (this.modelConfigPromise) {
                return this.modelConfigPromise;
            }

            this.modelConfigPromise = loadModelConfig()
                .then((config) => {
                    this.modelConfig = config;
                    this.modelConfigLoadWarning = "";
                    this.profileDefaultsApplied = false;
                    this.profileFramingApplied = false;
                    this.render();
                    return config;
                })
                .catch((error) => {
                    console.error(error);
                    this.modelConfig = DEFAULT_MODEL_CONFIG;
                    this.modelConfigLoadWarning =
                        "モデル設定の読込に失敗したため、既定の設定で起動しています。";
                    this.profileDefaultsApplied = false;
                    this.profileFramingApplied = false;
                    this.render();
                    return this.modelConfig;
                });

            return this.modelConfigPromise;
        },

        getActiveModelConfig() {
            if (this.adapter && typeof this.adapter.getModelConfig === "function") {
                return this.adapter.getModelConfig() || this.modelConfig || DEFAULT_MODEL_CONFIG;
            }
            return this.modelConfig || DEFAULT_MODEL_CONFIG;
        },

        getActiveHeroineLabel() {
            return getHeroineLabel(this.getActiveModelConfig(), this.state.heroineId);
        },

        markHelpAsSeen() {
            clearTimeout(this.helpHintTimer);
            if (this.root) {
                this.root.addClass("is-help-dimmed");
            }
        },

        scheduleHelpHintFade() {
            clearTimeout(this.helpHintTimer);
            if (!this.root) {
                return;
            }
            this.root.removeClass("is-help-dimmed");
            this.helpHintTimer = window.setTimeout(() => {
                if (this.root) {
                    this.root.addClass("is-help-dimmed");
                }
            }, 3200);
        },

        hasViewerOverlayOpen() {
            if (!this.root) {
                return false;
            }
            return (
                this.root.find(".stone-photo-mvp__preview:not(.hidden)").length > 0 ||
                this.root.find(".stone-photo-mvp__album:not(.hidden)").length > 0
            );
        },

        syncHudVisibility() {
            if (!this.root) {
                return;
            }
            this.root.toggleClass("is-hud-hidden", Boolean(this.hudPinnedHidden || this.hudHoldHidden));
        },

        getHudStatus() {
            if (this.awaitingContextRestore) {
                return {
                    message:
                        this.runtimeStatusMessage ||
                        "表示を復旧しています。戻らない場合は BACK で閉じて開き直してください。",
                    tone: this.runtimeStatusTone || "warning",
                };
            }

            if (this.runtimeStatusMessage) {
                return {
                    message: this.runtimeStatusMessage,
                    tone: this.runtimeStatusTone || "warning",
                };
            }

            if (this.modelConfigLoadWarning) {
                return {
                    message: this.modelConfigLoadWarning,
                    tone: "warning",
                };
            }

            if (this.adapter && typeof this.adapter.getStatusText === "function") {
                const adapterStatus = this.adapter.getStatusText(this.state);
                if (isActionableStatusText(adapterStatus)) {
                    return {
                        message: adapterStatus,
                        tone: /失敗|見つかりません|必要です/.test(String(adapterStatus)) ? "error" : "warning",
                    };
                }
            }

            return null;
        },

        isAdapterLoading() {
            return Boolean(this.adapter && typeof this.adapter.isLoading === "function" && this.adapter.isLoading());
        },

        getLoadingOverlayText() {
            if (this.awaitingContextRestore) {
                return this.runtimeStatusMessage || "表示を復旧しています。しばらくお待ちください。";
            }
            if (this.isAdapterLoading()) {
                return "モデルを読み込んでいます。しばらくお待ちください。";
            }
            if (this.adapter && typeof this.adapter.getStatusText === "function") {
                const adapterStatus = this.adapter.getStatusText(this.state);
                if (adapterStatus) {
                    return adapterStatus;
                }
            }
            return "モデルを読み込んでいます。しばらくお待ちください。";
        },

        hideGameUi() {
            this.tyranoUiState = hideTyranoUiForHud();
        },

        restoreGameUi() {
            restoreTyranoUiAfterHud(this.tyranoUiState);
            this.tyranoUiState = null;
        },

        applyProfileDefaultsIfNeeded() {
            if (this.profileDefaultsApplied) {
                return;
            }

            const modelConfig = this.getActiveModelConfig();
            if (!modelConfig) {
                return;
            }

            if (
                !this.explicitStateOverrides.heroineId &&
                modelConfig.defaultHeroineId &&
                this.state.heroineId === DEFAULT_STATE.heroineId
            ) {
                this.state.heroineId = modelConfig.defaultHeroineId;
            }

            this.state = applyHeroineDefaults(
                this.state,
                modelConfig,
                this.state.heroineId,
                this.explicitStateOverrides
            );
            this.profileDefaultsApplied = true;
        },

        populateSelects() {
            const albumSortSelect = this.root.find('select[data-field="albumSort"]');
            albumSortSelect.html(OPTIONS.albumSorts.map((item) => `<option value="${item.value}">${item.label}</option>`).join(""));
            this.root.find('select[data-field="albumFilter"]').html(`<option value="all">全員</option>`);
        },

        getTrayItems(trayName) {
            const modelConfig = this.getActiveModelConfig();
            const heroineId = this.state.heroineId;
            return getHeroineOptionList(modelConfig, heroineId, trayName);
        },

        getTrayFieldName(trayName) {
            if (trayName === "poses") return "poseId";
            if (trayName === "expressions") return "expressionId";
            if (trayName === "looks") return "lookAtId";
            return "";
        },

        getTrayGroups(trayName, items) {
            let definitions = null;
            if (trayName === "poses") {
                definitions = POSE_TRAY_GROUPS;
            } else if (trayName === "expressions") {
                definitions = EXPRESSION_TRAY_GROUPS;
            }

            if (!definitions) {
                return [
                    {
                        id: "default",
                        label: "",
                        caption: "",
                        items,
                    },
                ];
            }

            const itemMap = {};
            items.forEach((item) => {
                itemMap[item.value] = item;
            });

            const groups = definitions.map((group) => ({
                id: group.id,
                label: group.label,
                caption: group.caption,
                items: group.values.map((value) => itemMap[value]).filter(Boolean),
            })).filter((group) => group.items.length);

            const groupedValues = {};
            groups.forEach((group) => {
                group.items.forEach((item) => {
                    groupedValues[item.value] = true;
                });
            });

            const uncategorizedItems = items.filter((item) => !groupedValues[item.value]);
            if (uncategorizedItems.length) {
                groups.push({
                    id: "other",
                    label: "その他",
                    caption: "特殊用途の候補",
                    items: uncategorizedItems,
                });
            }

            return groups;
        },

        pickRandomTrayValue(trayName, currentValue) {
            const items = this.getTrayItems(trayName).filter(Boolean);
            if (!items.length) {
                return currentValue || "";
            }

            const alternatives = items.filter((item) => item.value !== currentValue);
            const pool = alternatives.length ? alternatives : items;
            const picked = pool[Math.floor(Math.random() * pool.length)];
            return picked ? picked.value : currentValue || "";
        },

        randomizePoseAndExpression() {
            if (this.state.stoneState === "stone") {
                return;
            }

            this.markHelpAsSeen();
            this.state.poseId = this.pickRandomTrayValue("poses", this.state.poseId);
            this.state.expressionId = this.pickRandomTrayValue("expressions", this.state.expressionId);
            this.render();
            if (this.activeTray) {
                this.renderTray(this.activeTray);
            }
            this.showCameraGuide("RANDOM");
        },

        renderTray(trayName) {
            const fieldName = this.getTrayFieldName(trayName);
            const items = this.getTrayItems(trayName);
            const groups = this.getTrayGroups(trayName, items);
            const currentValue = this.state[fieldName] || "";
            const tray = this.root.find(".stone-photo-mvp__tray");
            const inner = tray.find(".stone-photo-mvp__tray-inner");
            const meta = TRAY_INFO[trayName] || { title: humanizeIdentifier(trayName), caption: "" };
            tray.attr("data-tray", trayName);
            tray.find(".stone-photo-mvp__tray-title").text(meta.title);
            tray.find(".stone-photo-mvp__tray-caption").text(meta.caption);
            inner.html(groups.map((group) => {
                const renderedItems = group.items.map((item) => {
                    const isActive = item.value === currentValue;
                    return `
                        <button class="stone-photo-mvp__tray-item${isActive ? " is-active" : ""}" data-tray-value="${escapeHtml(item.value)}" type="button">
                            <span class="stone-photo-mvp__tray-item-label">${escapeHtml(item.label)}</span>
                            <span class="stone-photo-mvp__tray-item-state">${isActive ? "現在の選択" : "クリックで適用"}</span>
                        </button>
                    `;
                }).join("");

                if (!group.label) {
                    return renderedItems;
                }

                return `
                    <section class="stone-photo-mvp__tray-group" data-group="${escapeHtml(group.id)}">
                        <header class="stone-photo-mvp__tray-group-header">
                            <div class="stone-photo-mvp__tray-group-title">${escapeHtml(group.label)}</div>
                            <div class="stone-photo-mvp__tray-group-caption">${escapeHtml(group.caption)}</div>
                        </header>
                        <div class="stone-photo-mvp__tray-group-items">${renderedItems}</div>
                    </section>
                `;
            }).join(""));
            tray.addClass("is-open");
            this.root.find('.stone-photo-mvp__hud-sub .stone-photo-mvp__btn').removeClass('is-active');
            this.root.find(`.stone-photo-mvp__hud-sub [data-tray="${trayName}"]`).addClass('is-active');
        },

        openTray(trayName) {
            if (this.state.stoneState === "stone") return;
            if (this.activeTray === trayName) {
                this.closeTray();
                return;
            }
            this.markHelpAsSeen();
            this.activeTray = trayName;
            this.renderTray(trayName);
        },

        closeTray() {
            this.activeTray = "";
            this.root.find(".stone-photo-mvp__tray").removeClass("is-open").removeAttr("data-tray");
            this.root.find('.stone-photo-mvp__hud-sub .stone-photo-mvp__btn').removeClass('is-active');
        },

        showCameraGuide(mode) {
            const cam = this.state.camera;
            const guide = this.root.find(".stone-photo-mvp__camera-guide");
            const text = this.root.find(".stone-photo-mvp__camera-guide-text");
            const orbit = syncCameraOrbitState(this.state);
            text.html(
                `<strong>${escapeHtml(mode)}</strong><br>回り込み: ${orbit.yaw.toFixed(1)}° / ${orbit.pitch.toFixed(1)}°<br>距離: ${cam.distance.toFixed(2)}<br>フレーム: ${(cam.panX || 0).toFixed(1)} / ${(cam.panY || 0).toFixed(1)}`
            );
            guide.addClass("is-visible");
            clearTimeout(this.cameraGuideTimer);
            this.cameraGuideTimer = setTimeout(() => guide.removeClass("is-visible"), 1200);
        },

        hideCameraGuide() {
            clearTimeout(this.cameraGuideTimer);
            this.root.find(".stone-photo-mvp__camera-guide").removeClass("is-visible");
        },

        bindUi() {
            const root = this.root;
            const self = this;
            const viewport = root.find(".stone-photo-mvp__viewport");

            $(window).off("resize.stonePhotoHudFrame").on("resize.stonePhotoHudFrame", () => {
                self.scheduleRootFrameSync(true);
            });
            const trayDismissEvents = ["pointerdown", "mousedown", "touchstart"];
            if (this.trayDismissHandler) {
                trayDismissEvents.forEach((eventName) => {
                    document.removeEventListener(eventName, this.trayDismissHandler, true);
                });
            }
            this.trayDismissHandler = (event) => {
                if (!self.activeTray || !self.root || self.root.hasClass("hidden")) {
                    return;
                }
                const target = $(event.target);
                if (
                    target.closest(".stone-photo-mvp__tray").length ||
                    target.closest('[data-action="open-tray"]').length
                ) {
                    return;
                }
                self.closeTray();
            };
            trayDismissEvents.forEach((eventName) => {
                document.addEventListener(eventName, this.trayDismissHandler, true);
            });

            // --- Main actions ---
            root.on("click", '[data-action="back"]', () => this.cancel());
            root.on("click", '[data-action="toggle-stone"]', () => {
                this.markHelpAsSeen();
                this.state.stoneState = this.state.stoneState === "stone" ? "normal" : "stone";
                this.closeTray();
                this.render();
            });
            root.on("click", '[data-action="shutter"]', () => this.openPreview());
            root.on("click", '[data-action="retake"]', () => this.closePreview());
            root.on("click", '[data-action="commit"]', () => this.commit());
            root.on("click", '[data-action="reset"]', () => {
                this.markHelpAsSeen();
                if (this.state.stoneState === "stone") {
                    this.resetCamera();
                } else {
                    this.resetState();
                }
            });
            root.on("click", '[data-action="open-album"]', () => this.openAlbumPanel());
            root.on("click", '[data-action="close-album"]', () => this.closeAlbumPanel());
            root.on("click", '[data-action="randomize-style"]', () => this.randomizePoseAndExpression());

            // --- Tray ---
            root.on("click", '[data-action="open-tray"]', (event) => {
                const trayName = $(event.currentTarget).data("tray");
                this.openTray(trayName);
            });
            root.on("click", ".stone-photo-mvp__tray-item", (event) => {
                const value = $(event.currentTarget).data("trayValue");
                const fieldName = this.getTrayFieldName(this.activeTray);
                if (fieldName) {
                    this.state[fieldName] = value;
                }
                this.render();
                if (this.activeTray) {
                    this.renderTray(this.activeTray);
                }
            });

            // --- UI toggle ---
            root.on("click", '[data-action="toggle-ui"]', () => {
                this.markHelpAsSeen();
                this.hudPinnedHidden = !this.hudPinnedHidden;
                this.syncHudVisibility();
            });

            // --- Album sort & items ---
            root.on("change", 'select[data-field="albumSort"]', (event) => {
                this.albumSort = $(event.currentTarget).val();
                this.albumPage = 1;
                this.renderAlbum();
            });
            root.on("change", 'select[data-field="albumFilter"]', (event) => {
                this.albumFilter = $(event.currentTarget).val() || "all";
                this.albumPage = 1;
                this.albumSelectionId = "";
                this.renderAlbum();
            });
            root.on("click", '[data-action="album-prev-page"]', () => {
                this.albumPage = Math.max(1, this.albumPage - 1);
                this.albumSelectionId = "";
                this.renderAlbum();
            });
            root.on("click", '[data-action="album-next-page"]', () => {
                this.albumPage += 1;
                this.albumSelectionId = "";
                this.renderAlbum();
            });
            root.on("click", '[data-action="delete-album-item"]', () => this.deleteSelectedAlbumItem());
            root.on("click", '[data-action="export-album-item"]', () => this.exportSelectedAlbumItem());
            root.on("click", '[data-action="export-filtered-album"]', () => this.exportFilteredAlbumItems());
            root.on("click", ".stone-photo-mvp__album-item", (event) => {
                const captureId = $(event.currentTarget).data("captureId");
                this.selectAlbumEntry(captureId);
            });

            // --- Space key: hold to hide HUD ---
            $(document).on("keydown.stonePhotoHud", (event) => {
                if (!self.root || self.root.hasClass("hidden")) return;
                if (self.mode !== "shoot" || self.hasViewerOverlayOpen()) return;
                const target = event.target;
                if (
                    target &&
                    (target.tagName === "INPUT" ||
                        target.tagName === "TEXTAREA" ||
                        target.tagName === "SELECT" ||
                        target.tagName === "BUTTON" ||
                        target.isContentEditable)
                ) {
                    return;
                }
                if (event.code === "Space" && !event.repeat) {
                    event.preventDefault();
                    self.hudHoldHidden = true;
                    self.syncHudVisibility();
                }
            });
            $(document).on("keyup.stonePhotoHud", (event) => {
                if (event.code === "Space") {
                    event.preventDefault();
                    self.hudHoldHidden = false;
                    self.syncHudVisibility();
                }
            });

            // --- Photographer-style controls ---
            // Left drag = orbit, Right/Middle drag = pan, Wheel = dolly
            let dragStartX = 0, dragStartY = 0;
            let dragStartOrbitYaw = 0, dragStartOrbitPitch = 0, dragStartPanX = 0, dragStartPanY = 0;
            let dragMode = "";

            viewport.on("contextmenu", (event) => event.preventDefault());

            viewport.on("mousedown", (event) => {
                if ($(event.target).closest(".stone-photo-mvp__hud").length) return;
                event.preventDefault();
                self.markHelpAsSeen();
                dragStartX = event.clientX;
                dragStartY = event.clientY;
                if (event.button === 0) {
                    const orbit = syncCameraOrbitState(self.state);
                    dragStartOrbitYaw = orbit.yaw;
                    dragStartOrbitPitch = orbit.pitch;
                    dragMode = "orbit";
                } else if (event.button === 2 || event.button === 1) {
                    dragStartPanX = self.state.camera.panX || 0;
                    dragStartPanY = self.state.camera.panY || 0;
                    dragMode = "pan";
                }
                viewport.addClass("is-dragging");
            });

            $(document).on("mousemove.stonePhotoDrag", (event) => {
                if (!dragMode) return;
                const dx = event.clientX - dragStartX;
                const dy = event.clientY - dragStartY;
                if (dragMode === "orbit") {
                    self.state.camera.orbitYaw = normalizeAngleDegrees(dragStartOrbitYaw + dx * 0.35);
                    self.state.camera.orbitPitch = clamp(
                        dragStartOrbitPitch - dy * 0.3,
                        CAMERA_LIMITS.orbitPitchMin,
                        CAMERA_LIMITS.orbitPitchMax
                    );
                    syncCameraOrbitState(self.state);
                    self.showCameraGuide("ORBIT");
                } else if (dragMode === "pan") {
                    self.state.camera.panX = dragStartPanX + dx * 0.5;
                    self.state.camera.panY = dragStartPanY - dy * 0.5;
                    self.showCameraGuide("PAN");
                }
                self.render();
            });

            $(document).on("mouseup.stonePhotoDrag", () => {
                if (dragMode) {
                    dragMode = "";
                    viewport.removeClass("is-dragging");
                }
            });

            // --- Wheel zoom ---
            viewport.on("wheel", (event) => {
                if ($(event.target).closest(".stone-photo-mvp__hud").length) return;
                event.preventDefault();
                self.markHelpAsSeen();
                const delta = event.originalEvent.deltaY > 0 ? 0.05 : -0.05;
                self.state.camera.distance = clamp(
                    (self.state.camera.distance || DEFAULT_STATE.camera.distance) + delta,
                    CAMERA_LIMITS.distanceMin,
                    CAMERA_LIMITS.distanceMax
                );
                self.showCameraGuide("DOLLY");
                self.render();
            });

            // --- Double-click reset ---
            viewport.on("dblclick", (event) => {
                if ($(event.target).closest(".stone-photo-mvp__hud").length) return;
                self.markHelpAsSeen();
                self.resetCamera();
                self.showCameraGuide("RESET");
            });

            // --- Touch: 1-finger = orbit, 2-finger = pan + pinch-zoom ---
            let touchStartDist = 0;
            let touchStartDistance = 0;

            viewport.on("touchstart", (event) => {
                if ($(event.target).closest(".stone-photo-mvp__hud").length) return;
                self.markHelpAsSeen();
                const touches = event.originalEvent.touches;
                if (touches.length === 1) {
                    dragStartX = touches[0].clientX;
                    dragStartY = touches[0].clientY;
                    const orbit = syncCameraOrbitState(self.state);
                    dragStartOrbitYaw = orbit.yaw;
                    dragStartOrbitPitch = orbit.pitch;
                    dragMode = "orbit";
                } else if (touches.length === 2) {
                    dragMode = "pinch";
                    touchStartDist = Math.hypot(
                        touches[1].clientX - touches[0].clientX,
                        touches[1].clientY - touches[0].clientY
                    );
                    touchStartDistance = self.state.camera.distance;
                    dragStartPanX = self.state.camera.panX || 0;
                    dragStartPanY = self.state.camera.panY || 0;
                    dragStartX = (touches[0].clientX + touches[1].clientX) / 2;
                    dragStartY = (touches[0].clientY + touches[1].clientY) / 2;
                }
            });

            viewport.on("touchmove", (event) => {
                if (!dragMode) return;
                event.preventDefault();
                const touches = event.originalEvent.touches;
                if (dragMode === "orbit" && touches.length === 1) {
                    const dx = touches[0].clientX - dragStartX;
                    const dy = touches[0].clientY - dragStartY;
                    self.state.camera.orbitYaw = normalizeAngleDegrees(dragStartOrbitYaw + dx * 0.35);
                    self.state.camera.orbitPitch = clamp(
                        dragStartOrbitPitch - dy * 0.3,
                        CAMERA_LIMITS.orbitPitchMin,
                        CAMERA_LIMITS.orbitPitchMax
                    );
                    syncCameraOrbitState(self.state);
                    self.showCameraGuide("ORBIT");
                    self.render();
                } else if (dragMode === "pinch" && touches.length === 2) {
                    const dist = Math.hypot(
                        touches[1].clientX - touches[0].clientX,
                        touches[1].clientY - touches[0].clientY
                    );
                    const scale = touchStartDist / Math.max(dist, 1);
                    self.state.camera.distance = clamp(
                        touchStartDistance * scale,
                        CAMERA_LIMITS.distanceMin,
                        CAMERA_LIMITS.distanceMax
                    );
                    const mx = (touches[0].clientX + touches[1].clientX) / 2;
                    const my = (touches[0].clientY + touches[1].clientY) / 2;
                    self.state.camera.panX = dragStartPanX + (mx - dragStartX) * 0.5;
                    self.state.camera.panY = dragStartPanY - (my - dragStartY) * 0.5;
                    self.showCameraGuide("DOLLY");
                    self.render();
                }
            });

            viewport.on("touchend touchcancel", () => {
                dragMode = "";
            });

        },

        open(params, done) {
            this.ensureUi();
            this.scheduleRootFrameSync();
            this.adapter = ensureAdapter(() => this.render());
            this.clearAdapterRetry();
            this.stopRuntimeHealthCheck();
            this.adapterRecoveryInFlight = false;
            this.session = {
                done,
                mode: "shoot",
                resultVar: params.result || "f.stone_photo_result",
            };

            this.mode = "shoot";
            this.state = deepClone(DEFAULT_STATE);
            this.state.heroineId = params.heroine || this.getActiveModelConfig().defaultHeroineId || DEFAULT_STATE.heroineId;
            this.state.locationId = params.location || DEFAULT_STATE.locationId;
            this.state.themeId = params.theme || DEFAULT_STATE.themeId;
            this.explicitStateOverrides = {
                heroineId: Boolean(params.heroine),
                locationId: Boolean(params.location),
                themeId: Boolean(params.theme),
            };
            this.profileDefaultsApplied = false;
            this.profileFramingApplied = false;
            this.activeTray = "";
            this.clearTransientAssets();
            this.previewResult = null;
            this.isCapturing = false;
            this.albumEntries = getAlbumEntries();
            this.albumSelectionId = this.albumEntries[0] ? this.albumEntries[0].captureId : "";

            this.hideGameUi();
            this.hudPinnedHidden = false;
            this.hudHoldHidden = false;
            this.root.removeClass("hidden");
            this.scheduleRootFrameSync(true);
            this.syncHudVisibility();
            this.root.removeClass("is-help-dimmed");
            this.root.find(".stone-photo-mvp__preview").addClass("hidden");
            this.root.find(".stone-photo-mvp__album").addClass("hidden");
            this.root.find(".stone-photo-mvp__tray").removeClass("is-open");
            const beginOpen = (modelConfig) => {
                this.state = applyHeroineDefaults(
                    this.state,
                    modelConfig || this.getActiveModelConfig(),
                    this.state.heroineId,
                    this.explicitStateOverrides,
                    { includeCamera: true }
                );
                this.profileDefaultsApplied = true;
                this.profileFramingApplied = !ENABLE_AUTO_CAMERA_FRAMING;
                this.runtimeStatusMessage = "";
                this.runtimeStatusTone = "";
                const openContext = this.createAdapterOpenContext();
                this.awaitingContextRestore = false;
                this.startRuntimeHealthCheck();
                this.scheduleAdapterRetry();
                this.scheduleHelpHintFade();
                this.render();
                Promise.resolve(this.adapter.onOpen(this.state, this.root, openContext))
                    .then(() => {
                        if (!openContext.isCurrent()) {
                            return;
                        }
                        this.render();
                    })
                    .catch((error) => {
                        if (!openContext.isCurrent()) {
                            return;
                        }
                        console.error(error);
                        this.render();
                    });
            };
            if (this.modelConfig) {
                beginOpen(this.modelConfig);
            } else {
                this.ensureModelConfig()
                    .then((config) => beginOpen(config))
                    .catch(() => beginOpen(this.getActiveModelConfig()));
            }
        },

        openAlbum(done) {
            this.ensureUi();
            this.ensureModelConfig();
            this.mode = "album";
            this.session = {
                done,
                mode: "album",
                resultVar: "",
            };
            this.clearTransientAssets();
            this.previewResult = null;
            this.isCapturing = false;
            this.albumEntries = getAlbumEntries();
            this.albumSelectionId = this.albumEntries[0] ? this.albumEntries[0].captureId : "";

            this.invalidateAdapterOpen();
            if (this.adapter) {
                this.adapter.onClose();
            }
            this.clearAdapterRetry();
            this.stopRuntimeHealthCheck();
            this.adapterRecoveryInFlight = false;

            this.hideGameUi();
            this.hudPinnedHidden = false;
            this.hudHoldHidden = false;
            this.root.removeClass("hidden");
            this.scheduleRootFrameSync(true);
            this.syncHudVisibility();
            this.root.addClass("is-help-dimmed");
            this.root.find(".stone-photo-mvp__preview").addClass("hidden");
            this.root.find(".stone-photo-mvp__album").removeClass("hidden");
            this.render();
        },

        resetState() {
            const params = {
                heroine: this.state.heroineId,
                location: this.state.locationId,
                theme: this.state.themeId,
            };
            const nextState = deepClone(DEFAULT_STATE);
            nextState.heroineId = params.heroine;
            nextState.locationId = params.location;
            nextState.themeId = params.theme;
            this.state = applyHeroineDefaults(
                nextState,
                this.getActiveModelConfig(),
                params.heroine,
                {
                    heroineId: true,
                    locationId: true,
                    themeId: true,
                },
                { includeCamera: true }
            );
            this.profileDefaultsApplied = true;
            this.profileFramingApplied = !ENABLE_AUTO_CAMERA_FRAMING;
            this.render();
        },

        resetCamera() {
            const profileState = applyHeroineDefaults(
                deepClone(DEFAULT_STATE),
                this.getActiveModelConfig(),
                this.state.heroineId,
                {
                    heroineId: true,
                    locationId: true,
                    themeId: true,
                },
                { includeCamera: true }
            );
            const refinedCamera =
                ENABLE_AUTO_CAMERA_FRAMING &&
                this.adapter &&
                typeof this.adapter.refineCameraDefaults === "function"
                    ? this.adapter.refineCameraDefaults(profileState)
                    : null;
            this.state.camera = deepClone(refinedCamera || profileState.camera);
            this.state.modelRotY = profileState.modelRotY || 0;
            this.state.modelRotX = profileState.modelRotX || 0;
            syncCameraOrbitState(this.state);
            this.render();
        },

        clearAdapterRetry() {
            clearTimeout(this.adapterRetryTimer);
            this.adapterRetryTimer = null;
        },

        createAdapterOpenContext() {
            this.adapterOpenToken = (this.adapterOpenToken || 0) + 1;
            const requestToken = this.adapterOpenToken;
            return {
                requestToken,
                isCurrent: () =>
                    this.adapterOpenToken === requestToken &&
                    this.mode === "shoot" &&
                    this.session &&
                    this.session.mode === "shoot" &&
                    this.root &&
                    !this.root.hasClass("hidden"),
            };
        },

        invalidateAdapterOpen() {
            this.adapterOpenToken = (this.adapterOpenToken || 0) + 1;
        },

        startRuntimeHealthCheck() {
            this.stopRuntimeHealthCheck();
            this.runtimeEventHandlers = {
                onContextLost: () => {
                    this.awaitingContextRestore = true;
                    this.runtimeStatusMessage = "表示を復旧しています。しばらくお待ちください。";
                    this.runtimeStatusTone = "warning";
                    this.scheduleAdapterRetry();
                    this.render();
                },
                onRestoreStart: () => {
                    this.awaitingContextRestore = true;
                    this.runtimeStatusMessage = "表示を復旧しています。しばらくお待ちください。";
                    this.runtimeStatusTone = "warning";
                    this.scheduleAdapterRetry();
                    this.render();
                },
                onRestoreComplete: () => {
                    this.awaitingContextRestore = true;
                    this.runtimeStatusMessage = "";
                    this.runtimeStatusTone = "";
                    if (!this.tryUpgradeAdapter(true)) {
                        this.scheduleAdapterRetry();
                    }
                    this.render();
                },
                onRestoreFailed: () => {
                    this.awaitingContextRestore = true;
                    this.runtimeStatusMessage =
                        "表示の復旧に失敗しました。BACKで閉じて開き直してください。";
                    this.runtimeStatusTone = "error";
                    this.scheduleAdapterRetry();
                    this.render();
                },
            };
            window.addEventListener("vroid:contextlost", this.runtimeEventHandlers.onContextLost);
            window.addEventListener("vroid:restore-start", this.runtimeEventHandlers.onRestoreStart);
            window.addEventListener("vroid:restore-complete", this.runtimeEventHandlers.onRestoreComplete);
            window.addEventListener("vroid:restore-failed", this.runtimeEventHandlers.onRestoreFailed);
            this.runtimeHealthTimer = window.setInterval(() => {
                if (
                    this.mode !== "shoot" ||
                    !this.root ||
                    this.root.hasClass("hidden") ||
                    !window.VRoid ||
                    !window.VRoid.three
                ) {
                    return;
                }

                const runtime = window.VRoid.three;
                if (runtime.isWebglcontextlost) {
                    this.awaitingContextRestore = true;
                    this.runtimeStatusMessage = "表示を復旧しています。しばらくお待ちください。";
                    this.runtimeStatusTone = "warning";
                    this.scheduleAdapterRetry();
                    this.render();
                    return;
                }

                const host = this.root.find(".stone-photo-mvp__render-host").get(0);
                const canvas = document.getElementById("StonePhotoLayer");
                const hostHasCanvas = Boolean(host && canvas && host.contains(canvas));

                if (this.awaitingContextRestore) {
                    if (!this.tryUpgradeAdapter(true)) {
                        this.scheduleAdapterRetry();
                    }
                    return;
                }

                if (this.adapter && this.adapter.isAvailable && this.adapter.isAvailable() && !hostHasCanvas) {
                    if (!this.tryUpgradeAdapter(true) && runtime.forceRenderUpdate) {
                        this.render();
                        runtime.forceRenderUpdate("StonePhotoLayer");
                    }
                }
            }, 500);
        },

        stopRuntimeHealthCheck() {
            clearInterval(this.runtimeHealthTimer);
            this.runtimeHealthTimer = null;
            if (this.runtimeEventHandlers) {
                if (this.runtimeEventHandlers.onContextLost) {
                    window.removeEventListener("vroid:contextlost", this.runtimeEventHandlers.onContextLost);
                }
                if (this.runtimeEventHandlers.onRestoreStart) {
                    window.removeEventListener("vroid:restore-start", this.runtimeEventHandlers.onRestoreStart);
                }
                if (this.runtimeEventHandlers.onRestoreComplete) {
                    window.removeEventListener("vroid:restore-complete", this.runtimeEventHandlers.onRestoreComplete);
                }
                if (this.runtimeEventHandlers.onRestoreFailed) {
                    window.removeEventListener("vroid:restore-failed", this.runtimeEventHandlers.onRestoreFailed);
                }
            }
            this.runtimeEventHandlers = null;
            this.awaitingContextRestore = false;
        },

        tryUpgradeAdapter(forceReload = false) {
            if (
                this.mode !== "shoot" ||
                !this.root ||
                this.root.hasClass("hidden") ||
                this.adapterRecoveryInFlight ||
                !window.VRoid ||
                !window.VRoid.three
            ) {
                return false;
            }

            const nextAdapter = ensureAdapter(() => this.render());
            if (!nextAdapter || !nextAdapter.isAvailable || (!forceReload && !nextAdapter.isAvailable())) {
                return false;
            }

            if (!forceReload && this.adapter && this.adapter.isAvailable && this.adapter.isAvailable()) {
                return false;
            }

            this.adapterRecoveryInFlight = true;
            this.adapter = nextAdapter;
            this.profileFramingApplied = false;
            const recoveryContext = this.createAdapterOpenContext();
            Promise.resolve(this.adapter.onOpen(this.state, this.root, recoveryContext))
                .then(() => {
                    if (!recoveryContext.isCurrent()) {
                        return;
                    }
                    if (
                        this.mode === "shoot" &&
                        this.adapter &&
                        this.adapter.isAvailable &&
                        this.adapter.isAvailable()
                    ) {
                        this.awaitingContextRestore = false;
                        this.runtimeStatusMessage = "";
                        this.runtimeStatusTone = "";
                        this.render();
                        if (window.VRoid && window.VRoid.three && window.VRoid.three.forceRenderUpdate) {
                            window.VRoid.three.forceRenderUpdate("StonePhotoLayer");
                        }
                    } else if (this.mode === "shoot") {
                        this.awaitingContextRestore = true;
                        this.scheduleAdapterRetry();
                    }
                })
                .catch((error) => {
                    if (!recoveryContext.isCurrent()) {
                        return;
                    }
                    console.error(error);
                    this.awaitingContextRestore = true;
                    this.scheduleAdapterRetry();
                })
                .finally(() => {
                    this.adapterRecoveryInFlight = false;
                });
            return true;
        },

        scheduleAdapterRetry() {
            this.clearAdapterRetry();
            if (
                this.mode !== "shoot" ||
                !this.root ||
                this.root.hasClass("hidden") ||
                (this.adapter && this.adapter.isAvailable && this.adapter.isAvailable())
            ) {
                return;
            }

            this.adapterRetryTimer = window.setTimeout(() => {
                this.adapterRetryTimer = null;
                if (this.adapter && this.adapter.isAvailable && this.adapter.isAvailable()) {
                    this.render();
                    return;
                }
                if (!this.tryUpgradeAdapter()) {
                    this.scheduleAdapterRetry();
                }
            }, 250);
        },

        render() {
            if (!this.root) return;
            this.syncRootFrame();

            if (
                this.mode === "shoot" &&
                this.adapter &&
                this.adapter.isAvailable &&
                !this.adapter.isAvailable()
            ) {
                this.tryUpgradeAdapter();
                this.scheduleAdapterRetry();
            }

            this.applyProfileDefaultsIfNeeded();
            if (
                ENABLE_AUTO_CAMERA_FRAMING &&
                !this.profileFramingApplied &&
                this.mode !== "album" &&
                this.adapter &&
                typeof this.adapter.refineCameraDefaults === "function"
            ) {
                const refinedCamera = this.adapter.refineCameraDefaults(this.state);
                if (refinedCamera) {
                    this.state.camera = deepClone(refinedCamera);
                    this.profileFramingApplied = true;
                } else if (!this.adapter.usesRealViewport || this.adapter.usesRealViewport()) {
                    this.profileFramingApplied = true;
                }
            } else if (!ENABLE_AUTO_CAMERA_FRAMING) {
                this.profileFramingApplied = true;
            }
            syncCameraOrbitState(this.state);
            const effectiveState = getEffectiveShotState(this.state);

            const camera = this.state.camera;
            const adapter = this.adapter;
            const isStone = this.state.stoneState === "stone";
            const viewport = this.root.find(".stone-photo-mvp__viewport");
            const mockModel = this.root.find(".stone-photo-mvp__model");
            const usesRealViewport = adapter && adapter.usesRealViewport ? adapter.usesRealViewport() : false;
            const hudStatus = this.getHudStatus();
            const isLoading = this.isAdapterLoading();
            const loadingText = this.getLoadingOverlayText();

            this.root.toggleClass("is-album-only", this.mode === "album");
            this.root.toggleClass("has-open-tray", Boolean(this.activeTray));
            this.syncHudVisibility();
            viewport.toggleClass("is-stone", isStone);
            mockModel.toggleClass("is-hidden", usesRealViewport);
            mockModel.css(
                "transform",
                `rotateY(${camera.orbitYaw || 0}deg) rotateX(${camera.orbitPitch || 0}deg) scale(${1.35 + (1.8 - camera.distance) * 0.45})`
            );

            // HUD top
            this.root.find(".stone-photo-mvp__heroine-name").text(this.getActiveHeroineLabel());
                const reactionLabel = effectiveState.autoReactionId ? ` / ${getAutoReactionLabel(effectiveState.autoReactionId)}` : "";
            this.root.find(".stone-photo-mvp__theme-name").text(reactionLabel ? reactionLabel.replace(/^ \//, "").trim() : "");
            const badge = this.root.find(".stone-photo-mvp__state-badge");
            badge.text(getStoneStateLabel(this.state.stoneState)).toggleClass("is-stone", isStone);
            const statusNode = this.root.find(".stone-photo-mvp__status");
            statusNode
                .toggleClass("hidden", !hudStatus)
                .toggleClass("is-warning", Boolean(hudStatus && hudStatus.tone === "warning"))
                .toggleClass("is-error", Boolean(hudStatus && hudStatus.tone === "error"))
                .text(hudStatus ? hudStatus.message : "");
            const loadingNode = this.root.find(".stone-photo-mvp__loading");
            loadingNode.toggleClass("hidden", !isLoading);
            loadingNode.find(".stone-photo-mvp__loading-text").text(loadingText || "モデルを読み込んでいます。しばらくお待ちください。");

            // Main buttons
            const randomButton = this.root.find('[data-action="randomize-style"]');
            const stoneBtn = this.root.find(".stone-photo-mvp__btn-stone");
            stoneBtn.text(isStone ? "元に戻す" : "石化する").toggleClass("is-stone", isStone);
            randomButton.prop("disabled", isStone);

            // Sub-actions (POSE/FACE/LOOK) visibility
            this.root.find(".stone-photo-mvp__hud-sub")
                .toggleClass("is-hidden-by-stone", isStone)
                .find(".stone-photo-mvp__btn")
                .prop("disabled", isStone);
            if (isStone && this.activeTray) {
                this.closeTray();
            }

            // Reset button label
            this.root.find('[data-action="reset"]').text(isStone ? "RESET CAMERA" : "RESET");

            // Disabled states
            const shutterButton = this.root.find('[data-action="shutter"]');
            const commitButton = this.root.find('[data-action="commit"]');
            const exportButton = this.root.find('[data-action="export-album-item"]');
            const deleteButton = this.root.find('[data-action="delete-album-item"]');
            const bulkExportButton = this.root.find('[data-action="export-filtered-album"]');
            shutterButton.prop("disabled", this.isCapturing);
            commitButton.prop("disabled", this.isCapturing);
            exportButton.prop("disabled", this.isCapturing);
            deleteButton.prop("disabled", this.isCapturing);
            bulkExportButton.prop("disabled", this.isCapturing);

            if (
                this.mode !== "album" &&
                adapter &&
                adapter.applyState &&
                (!adapter.isAvailable || adapter.isAvailable())
            ) {
                adapter.applyState(effectiveState);
            }

            if (this.root.find(".stone-photo-mvp__album:not(.hidden)").length) {
                this.renderAlbum();
            }
        },

        async resolveAlbumAssetUrl(entry, kind, renderToken = 0) {
            const cacheMap = this.assetUrlCache[kind];
            if (cacheMap && cacheMap.has(entry.captureId)) {
                return cacheMap.get(entry.captureId);
            }

            const inlineKey = kind === "thumbnail" ? "thumbnailRef" : "imageRef";
            if (entry[inlineKey]) {
                return entry[inlineKey];
            }

            const storedCapture = await loadCaptureFromDatabase(entry.captureId).catch(() => null);
            const blob = storedCapture && kind === "thumbnail" ? storedCapture.thumbnailBlob : storedCapture && storedCapture.imageBlob;

            if (renderToken && renderToken !== this.albumRenderToken) {
                return "";
            }
            if (!blob) {
                return "";
            }

            const url = window.URL.createObjectURL(blob);
            if (cacheMap && (!renderToken || renderToken === this.albumRenderToken)) {
                cacheMap.set(entry.captureId, url);
            } else {
                revokeObjectUrl(url);
                return "";
            }
            return url;
        },

        getSelectedAlbumEntry() {
            return this.albumEntries.find((entry) => entry.captureId === this.albumSelectionId) || this.albumEntries[0] || null;
        },

        async renderAlbum() {
            if (!this.root) {
                return;
            }

            const renderToken = ++this.albumRenderToken;

            const album = this.root.find(".stone-photo-mvp__album");
            const list = album.find(".stone-photo-mvp__album-list");
            const detailImage = album.find(".stone-photo-mvp__album-image");
            const emptyState = album.find(".stone-photo-mvp__album-empty");
            const albumSortSelect = album.find('select[data-field="albumSort"]');
            const albumFilterSelect = album.find('select[data-field="albumFilter"]');
            const albumCount = album.find(".stone-photo-mvp__album-count");
            const albumCaption = album.find(".stone-photo-mvp__album-caption");
            const albumPageLabel = album.find(".stone-photo-mvp__album-page-label");
            const prevPageButton = album.find('[data-action="album-prev-page"]');
            const nextPageButton = album.find('[data-action="album-next-page"]');
            const exportButton = album.find('[data-action="export-album-item"]');
            const deleteButton = album.find('[data-action="delete-album-item"]');
            const bulkExportButton = album.find('[data-action="export-filtered-album"]');

            this.albumEntries = this.sortAlbumEntries(getAlbumEntries());
            const modelConfig = this.getActiveModelConfig();
            const usedHeroineIds = Array.from(new Set(this.albumEntries.map((entry) => entry.heroineId).filter(Boolean)));
            const filterOptions = [`<option value="all">全員</option>`]
                .concat(
                    usedHeroineIds.map((heroineId) =>
                        `<option value="${escapeHtml(heroineId)}">${escapeHtml(getHeroineLabel(modelConfig, heroineId))}</option>`
                    )
                )
                .join("");
            albumFilterSelect.html(filterOptions);
            if (this.albumFilter !== "all" && usedHeroineIds.indexOf(this.albumFilter) === -1) {
                this.albumFilter = "all";
            }
            albumSortSelect.val(this.albumSort);
            albumFilterSelect.val(this.albumFilter);

            const filteredEntries = this.filterAlbumEntries(this.albumEntries);
            const pageCount = this.clampAlbumPage(filteredEntries);
            const pageStart = (this.albumPage - 1) * ALBUM_PAGE_SIZE;
            const pageEntries = filteredEntries.slice(pageStart, pageStart + ALBUM_PAGE_SIZE);
            const selected =
                pageEntries.find((entry) => entry.captureId === this.albumSelectionId) || pageEntries[0] || null;

            if (selected) {
                this.albumSelectionId = selected.captureId;
            }

            albumCount.text(
                filteredEntries.length
                    ? `${filteredEntries.length}枚中 ${pageStart + 1}-${pageStart + pageEntries.length}枚を表示`
                    : "写真はありません"
            );
            albumPageLabel.text(`${this.albumPage} / ${pageCount}`);
            albumSortSelect.prop("disabled", this.isCapturing);
            albumFilterSelect.prop("disabled", this.isCapturing);
            prevPageButton.prop("disabled", this.isCapturing || this.albumPage <= 1 || !filteredEntries.length);
            nextPageButton.prop("disabled", this.isCapturing || this.albumPage >= pageCount || !filteredEntries.length);
            bulkExportButton.prop("disabled", this.isCapturing || !filteredEntries.length);

            list.html(
                pageEntries.length
                    ? pageEntries
                          .map((entry) => {
                              const isActive = entry.captureId === this.albumSelectionId;
                              return buildAlbumEntryMarkup(entry, modelConfig, isActive);
                          })
                          .join("")
                    : `<div class="stone-photo-mvp__album-list-empty">該当する写真はありません</div>`
            );
            list.find(".stone-photo-mvp__album-item").prop("disabled", this.isCapturing);

            if (!selected) {
                detailImage.addClass("hidden").attr("src", "");
                albumCaption.html(buildAlbumCaptionMarkup(null, modelConfig));
                emptyState.removeClass("hidden").text(filteredEntries.length ? "このページに表示できる写真がありません" : "まだ写真がありません");
                exportButton.prop("disabled", true);
                deleteButton.prop("disabled", true);
                return;
            }

            exportButton.prop("disabled", this.isCapturing);
            deleteButton.prop("disabled", this.isCapturing);

            await Promise.all(
                pageEntries.map(async (entry) => {
                    const thumbnailUrl = await this.resolveAlbumAssetUrl(entry, "thumbnail", renderToken);
                    if (renderToken !== this.albumRenderToken) {
                        return;
                    }
                    list.find(`.stone-photo-mvp__album-item[data-capture-id="${entry.captureId}"] img`).attr("src", thumbnailUrl || "");
                })
            );

            const detailUrl = await this.resolveAlbumAssetUrl(selected, "image", renderToken);
            if (renderToken !== this.albumRenderToken) {
                return;
            }

            emptyState.addClass("hidden");
            detailImage.removeClass("hidden").attr("src", detailUrl || "");
            albumCaption.html(buildAlbumCaptionMarkup(selected, modelConfig));
        },

        selectAlbumEntry(captureId) {
            this.albumSelectionId = captureId;
            this.renderAlbum();
        },

        openAlbumPanel() {
            this.ensureModelConfig();
            this.albumEntries = getAlbumEntries();
            this.albumSelectionId = this.albumEntries[0] ? this.albumEntries[0].captureId : "";
            this.root.find(".stone-photo-mvp__album").removeClass("hidden");
            this.renderAlbum();
        },

        closeAlbumPanel() {
            this.invalidateAlbumRender();
            this.revokeAlbumAssetCache();
            this.root.find(".stone-photo-mvp__album").addClass("hidden");
            if (this.mode === "album") {
                this.finish("album_closed");
            }
        },

        async deleteSelectedAlbumItem() {
            const selected = this.getSelectedAlbumEntry();
            if (!selected) {
                return;
            }

            const ok = window.confirm("選択中の写真をアルバムから削除します。よろしいですか？");
            if (!ok) {
                return;
            }

            this.isCapturing = true;
            this.render();

            try {
                await deleteCaptureFromDatabase(selected.captureId);
                const nextEntries = removeAlbumEntry(selected.captureId);
                if (this.assetUrlCache.image.has(selected.captureId)) {
                    revokeObjectUrl(this.assetUrlCache.image.get(selected.captureId));
                    this.assetUrlCache.image.delete(selected.captureId);
                }
                if (this.assetUrlCache.thumbnail.has(selected.captureId)) {
                    revokeObjectUrl(this.assetUrlCache.thumbnail.get(selected.captureId));
                    this.assetUrlCache.thumbnail.delete(selected.captureId);
                }
                this.albumEntries = this.sortAlbumEntries(nextEntries);
                this.albumSelectionId = this.albumEntries[0] ? this.albumEntries[0].captureId : "";
            } catch (error) {
                console.error(error);
                window.alert("アルバム画像の削除に失敗しました");
            } finally {
                this.isCapturing = false;
                this.renderAlbum();
                this.render();
            }
        },

        async exportSelectedAlbumItem() {
            if (this.isCapturing) {
                return;
            }

            const selected = this.getSelectedAlbumEntry();
            if (!selected) {
                return;
            }

            this.isCapturing = true;
            this.render();

            try {
                const exported = await this.downloadAlbumEntry(selected);
                if (!exported) {
                    window.alert("書き出し対象の画像データが見つかりません");
                }
            } catch (error) {
                console.error(error);
                window.alert("画像の書き出しに失敗しました");
            } finally {
                this.isCapturing = false;
                this.renderAlbum();
                this.render();
            }
        },

        async exportFilteredAlbumItems() {
            if (this.isCapturing) {
                return;
            }

            const entries = this.filterAlbumEntries(this.sortAlbumEntries(getAlbumEntries()));
            if (!entries.length) {
                return;
            }

            const ok = window.confirm(`${entries.length}枚の写真を書き出します。よろしいですか？`);
            if (!ok) {
                return;
            }

            this.isCapturing = true;
            this.render();

            try {
                for (let index = 0; index < entries.length; index += 1) {
                    await this.downloadAlbumEntry(entries[index]);
                    if (index < entries.length - 1) {
                        await new Promise((resolve) => window.setTimeout(resolve, BULK_EXPORT_DELAY_MS));
                    }
                }
            } catch (error) {
                console.error(error);
                window.alert("写真の一括書き出しに失敗しました");
            } finally {
                this.isCapturing = false;
                this.renderAlbum();
                this.render();
            }
        },

        async downloadAlbumEntry(entry) {
            if (!entry) {
                return false;
            }

            const storedCapture = await loadCaptureFromDatabase(entry.captureId);
            const imageBlob = storedCapture && storedCapture.imageBlob;
            const imageType = entry.imageType || (imageBlob && imageBlob.type) || "image/jpeg";
            if (!imageBlob && !entry.imageRef) {
                return false;
            }

            const extension = imageType.split("/").pop() || "jpg";
            const timestamp = formatTimestamp(entry.createdAt).replace(/[/: ]/g, "-");
            const safeHeroine = String(entry.heroineId || "photo").replace(/[^a-zA-Z0-9_-]/g, "_");
            const downloadUrl = imageBlob ? window.URL.createObjectURL(imageBlob) : entry.imageRef;
            const anchor = document.createElement("a");
            anchor.href = downloadUrl;
            anchor.download = `${safeHeroine}-${timestamp}.${extension}`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            if (imageBlob) {
                window.setTimeout(() => revokeObjectUrl(downloadUrl), 250);
            }
            return true;
        },

        async openPreview() {
            if (this.isCapturing) return;

            this.revokePreviewAssets();
            this.isCapturing = true;
            syncCameraOrbitState(this.state);
            const effectiveState = getEffectiveShotState(this.state);
            this.render();

            const viewportElement = this.root.find(".stone-photo-mvp__viewport").get(0);

            try {
                const captureResult = await captureViewportImage(viewportElement);
                const captureId = makeCaptureId();
                this.previewCaptureAssets = captureResult;
                this.previewResult = {
                    captureId,
                    heroineId: effectiveState.heroineId,
                    locationId: effectiveState.locationId,
                    themeId: effectiveState.themeId,
                    stoneState: effectiveState.stoneState,
                    poseId: effectiveState.poseId,
                    expressionId: effectiveState.expressionId,
                    lookAtId: effectiveState.lookAtId,
                    autoReactionId: effectiveState.autoReactionId || "",
                    modelRotY: effectiveState.modelRotY || 0,
                    modelRotX: effectiveState.modelRotX || 0,
                    camera: deepClone(effectiveState.camera),
                    createdAt: new Date().toISOString(),
                    adapterMode: this.adapter.getMode ? this.adapter.getMode() : this.adapter && this.adapter.isAvailable ? "vrm-plugin" : "unavailable",
                    modelPath: this.adapter.getModelPath ? this.adapter.getModelPath() : "",
                    storageKind: "indexeddb",
                    imageType: captureResult.imageType,
                    thumbnailType: captureResult.thumbnailType,
                    captureSize: captureResult.captureSize,
                };

                this.root.find(".stone-photo-mvp__preview-image").attr("src", captureResult.previewImageUrl);
                this.root.find(".stone-photo-mvp__preview").removeClass("hidden");
            } catch (error) {
                console.error(error);
                window.alert("撮影画像の生成に失敗しました");
            } finally {
                this.isCapturing = false;
                this.render();
            }
        },

        closePreview() {
            this.root.find(".stone-photo-mvp__preview").addClass("hidden");
            this.root.find(".stone-photo-mvp__preview-image").attr("src", "");
            this.revokePreviewAssets();
            this.previewResult = null;
        },

        async commit() {
            if (!this.previewResult) return;
            if (!this.previewCaptureAssets) {
                window.alert("保存用の画像データが見つかりません。もう一度撮影してください。");
                return;
            }

            this.isCapturing = true;
            this.render();

            try {
                await saveCaptureToDatabase({
                    captureId: this.previewResult.captureId,
                    createdAt: this.previewResult.createdAt,
                    imageBlob: this.previewCaptureAssets.imageBlob,
                    thumbnailBlob: this.previewCaptureAssets.thumbnailBlob,
                    imageType: this.previewCaptureAssets.imageType,
                    thumbnailType: this.previewCaptureAssets.thumbnailType,
                    captureSize: this.previewResult.captureSize,
                });

                const albumEntry = {
                    captureId: this.previewResult.captureId,
                    heroineId: this.previewResult.heroineId,
                    createdAt: this.previewResult.createdAt,
                };

                const resultPayload = makeResultPayload("committed", albumEntry);
                const albumUpdate = appendAlbumEntry(albumEntry);
                if (albumUpdate.removedEntries && albumUpdate.removedEntries.length) {
                    await Promise.all(
                        albumUpdate.removedEntries.map((entry) =>
                            deleteCaptureFromDatabase(entry.captureId).catch(() => undefined)
                        )
                    );
                }
                setVariable(this.session.resultVar, resultPayload);
            } catch (error) {
                console.error(error);
                window.alert("撮影画像の保存に失敗しました");
                this.isCapturing = false;
                this.render();
                return;
            }

            this.finish("committed");
        },

        cancel() {
            if (this.session && this.session.resultVar) {
                setVariable(this.session.resultVar, makeResultPayload("cancelled"));
            }
            this.finish("cancelled");
        },

        finish(status) {
            clearTimeout(this.helpHintTimer);
            this.hideCameraGuide();
            this.clearAdapterRetry();
            this.stopRuntimeHealthCheck();
            this.adapterRecoveryInFlight = false;
            this.invalidateAdapterOpen();
            if (this.adapter && this.mode !== "album") {
                this.adapter.onClose();
            }
            this.clearTransientAssets();
            this.root.addClass("hidden");
            this.root.find(".stone-photo-mvp__preview").addClass("hidden");
            this.root.find(".stone-photo-mvp__album").addClass("hidden");
            const done = this.session && this.session.done;
            this.session = null;
            this.previewResult = null;
            this.albumSelectionId = "";
            this.isCapturing = false;
            this.runtimeStatusMessage = "";
            this.runtimeStatusTone = "";
            this.hudPinnedHidden = false;
            this.hudHoldHidden = false;
            this.mode = "shoot";
            this.restoreGameUi();
            if (done) done(makeResultPayload(status || "closed"));
        },
    };

    window.StonePhotoMvp = StonePhotoMvp;

    function registerTag() {
        const kag = getKag();
        const tagRegistry = window.tyrano && window.tyrano.plugin && window.tyrano.plugin.kag && window.tyrano.plugin.kag.tag;

        if (!kag || !kag.ftag || !tagRegistry) {
            window.setTimeout(registerTag, 100);
            return;
        }

        if (tagRegistry.stone_photo_mvp && tagRegistry.stone_photo_album) {
            return;
        }

        function jumpOrNext(params, targetKey, storageKey) {
            const target = params[targetKey];
            const storage = params[storageKey];
            if (target || storage) {
                kag.ftag.startTag("jump", {
                    target: target || "",
                    storage: storage || "",
                });
                return;
            }
            kag.ftag.nextOrder();
        }

        if (!tagRegistry.stone_photo_mvp) {
            tagRegistry.stone_photo_mvp = {
                pm: {
                    heroine: "",
                    location: "",
                    theme: "",
                    result: "f.stone_photo_result",
                    commit_target: "",
                    commit_storage: "",
                    cancel_target: "",
                    cancel_storage: "",
                },
                start(pm) {
                    StonePhotoMvp.open(pm, (result) => {
                        if (result && result.status === "committed") {
                            jumpOrNext(pm, "commit_target", "commit_storage");
                            return;
                        }
                        if (result && result.status === "cancelled") {
                            jumpOrNext(pm, "cancel_target", "cancel_storage");
                            return;
                        }
                        kag.ftag.nextOrder();
                    });
                },
            };

            kag.ftag.master_tag.stone_photo_mvp = object(tagRegistry.stone_photo_mvp);
            kag.ftag.master_tag.stone_photo_mvp.kag = kag;
        }

        if (!tagRegistry.stone_photo_album) {
            tagRegistry.stone_photo_album = {
                pm: {},
                start() {
                    StonePhotoMvp.openAlbum(() => {
                        kag.ftag.nextOrder();
                    });
                },
            };

            kag.ftag.master_tag.stone_photo_album = object(tagRegistry.stone_photo_album);
            kag.ftag.master_tag.stone_photo_album.kag = kag;
        }
    }

    registerTag();
})();
