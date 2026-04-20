(function(){
//表情の定義
//defaultは一番下に定義

	VRoid.three.emotionObj = {
		happy: [
			{ expressionName: 'happy',   val: 1.0 },
		],

		angry: [
			{ expressionName: 'angry',   val: 1.0 },
		],

		sad: [
			{ expressionName: 'sad',     val: 1.0 },
		],

		relaxed: [
			{ expressionName: 'relaxed', val: 1.0 },
		],

		neutral: [
			{ expressionName: 'neutral', val: 1.0 },
		],
		
		Surprised: [
			{ expressionName: 'Surprised', val: 1.0 },
		],

		surprised: [
			{ expressionName: 'surprised', val: 1.0 },
		],

		blink: [
			{ expressionName: 'blink',      val: 1.0 },
		],

		blinkLeft: [
			{ expressionName: 'blinkLeft',  val: 1.0 },
		],

		blinkRight: [
			{ expressionName: 'blinkRight', val: 1.0 },
		],

		aa: [
			{ expressionName: 'aa', val: 1.0 },
		],

		ih: [
			{ expressionName: 'ih', val: 1.0 },
		],

		ou: [
			{ expressionName: 'ou', val: 1.0 },
		],

		ee: [
			{ expressionName: 'ee', val: 1.0 },
		],

		oh: [
			{ expressionName: 'oh', val: 1.0 },

		],

		default: [
			{ expressionName: 'neutral', val: 0 },
		],

	}

	//defaultを書き換えられるように定義
	VRoid.three.emotionObj.default = VRoid.three.emotionObj.default;

})();
