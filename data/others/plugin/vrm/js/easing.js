(function(){
//easing関数の定義
//defaultは一番下に定義

	VRoid.three.easing = {
		linear: function (t) {
		    return t;
		},
		swing: function (t) {
		    return 0.5 - Math.cos(t * Math.PI) / 2;
		},
		ease: function (t) {
			const bezier = cubicBezier(0.25, 0.1, 0.25, 1.0);
			return bezier(t)
		},
		"ease-in": function (t) {
			const bezier = cubicBezier(0.42, 0, 1.0, 1.0);
			return bezier(t)
		},
		"ease-out": function (t) {
			const bezier = cubicBezier(0, 0, 0.58, 1.0);
			return bezier(t)
		},
		"ease-in-out": function (t) {
			const bezier = cubicBezier(0.42, 0, 0.58, 1.0);
			return bezier(t)
		},
		easeInQuad: function (t) {
		    return t * t;
		},
		easeOutQuad: function (t) {
		    return 1 - (1 - t) * (1 - t);
		},
		easeInOutQuad: function (t) {
		    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
		},
		easeInCubic: function (t) {
		    return t * t * t;
		},
		easeOutCubic: function (t) {
		    return 1 - Math.pow(1 - t, 3);
		},
		easeInOutCubic: function (t) {
		    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
		},
		easeInQuart: function (t) {
		    return t * t * t * t;
		},
		easeOutQuart: function (t) {
		    return 1 - Math.pow(1 - t, 4);
		},
		easeInOutQuart: function (t) {
		    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
		},
		easeInQuint: function (t) {
		    return t * t * t * t * t;
		},
		easeOutQuint: function (t) {
		    return 1 - Math.pow(1 - t, 5);
		},
		easeInOutQuint: function (t) {
		    return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
		},
		easeInExpo: function (t) {
		    return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
		},
		easeOutExpo: function (t) {
		    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
		},
		easeInOutExpo: function (t) {
		    return t === 0
		        ? 0
		        : t === 1
		        ? 1
		        : t < 0.5
		        ? Math.pow(2, 10 * (2 * t - 1)) / 2
		        : (2 - Math.pow(2, -10 * (2 * t - 1))) / 2;
		},
		easeInSine: function (t) {
		    return 1 - Math.cos((t * Math.PI) / 2);
		},
		easeOutSine: function (t) {
		    return Math.sin((t * Math.PI) / 2);
		},
		easeInOutSine: function (t) {
		    return -(Math.cos(Math.PI * t) - 1) / 2;
		},
		easeInCirc: function (t) {
		    return 1 - Math.sqrt(1 - t * t);
		},
		easeOutCirc: function (t) {
		    return Math.sqrt(1 - Math.pow(t - 1, 2));
		},
		easeInOutCirc: function (t) {
		    return t < 0.5
		        ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
		        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
		},
		easeInElastic: function (t) {
		    return t === 0
		        ? 0
		        : t === 1
		        ? 1
		        : -Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1) * 2 * Math.PI) / 0.3);
		},
		easeOutElastic: function (t) {
		    return t === 0
		        ? 0
		        : t === 1
		        ? 1
		        : Math.pow(2, -10 * t) * Math.sin((t * 2 * Math.PI) / 0.3) + 1;
		},
		easeInOutElastic: function (t) {
		    return t === 0
		        ? 0
		        : t === 1
		        ? 1
		        : t < 0.5
		        ? -Math.pow(2, 10 * (2 * t - 1)) * Math.sin(((2 * t - 1) * 2 * Math.PI) / 0.45) / 2
		        : Math.pow(2, -10 * (2 * t - 1)) * Math.sin(((2 * t - 1) * 2 * Math.PI) / 0.45) / 2 + 1;
		},
		easeInBack: function (t) {
		    const c1 = 1.70158;
		    const c3 = c1 + 1;

		    return c3 * t * t * t - c1 * t * t;
		},
		easeOutBack: function (t) {
		    const c1 = 1.70158;
		    const c3 = c1 + 1;

		    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
		},
		easeInOutBack: function (t) {
		    const c1 = 1.70158;
		    const c2 = c1 * 1.525;

		    return t < 0.5
		        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
		        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
		},
		easeInBounce: function (t) {
		    return 1 - VRoid.three.easing.easeOutBounce(1 - t);
		},
		easeOutBounce: function (t) {
		    const n1 = 7.5625;
		    const d1 = 2.75;

		    if (t < 1 / d1) {
		        return n1 * t * t;
		    } else if (t < 2 / d1) {
		        return n1 * (t -= 1.5 / d1) * t + 0.75;
		    } else if (t < 2.5 / d1) {
		        return n1 * (t -= 2.25 / d1) * t + 0.9375;
		    } else {
		        return n1 * (t -= 2.625 / d1) * t + 0.984375;
		    }
		},
		easeInOutBounce: function (t) {
		    return t < 0.5 ? (1 - VRoid.three.easing.easeOutBounce(1 - 2 * t)) / 2 : (1 + VRoid.three.easing.easeOutBounce(2 * t - 1)) / 2;
		},
		jswing: function (t) {
		    return 0.5 - Math.cos(t * Math.PI) / 2;
		},
		def: function (t) {
		    return jswing(t);
		},
	}

	//CSSのanimation-timing-functionを再現
	function cubicBezier(p1x, p1y, p2x, p2y) {
		var cx = 3.0 * p1x;
		var bx = 3.0 * (p2x - p1x) - cx;
		var ax = 1.0 - cx -bx;
		
		var cy = 3.0 * p1y;
		var by = 3.0 * (p2y - p1y) - cy;
		var ay = 1.0 - cy - by;
		
		function sampleCurveX(t) {
			return ((ax * t + bx) * t + cx) * t;
		}
		
		function sampleCurveY(t) {
			return ((ay * t + by) * t + cy) * t;
		}
		
		function sampleCurveDerivativeX(t) {
			return (3.0 * ax * t + 2.0 * bx) * t + cx;
		}
		
		function solveCurveX(x) {
			var t0, t1, t2, x2, d2, i;
			var epsilon = 1e-6; // Precision

			for (t2 = x, i = 0; i < 8; i++) {
				x2 = sampleCurveX(t2) - x;
				if (Math.abs(x2) < epsilon) return t2;
				d2 = sampleCurveDerivativeX(t2);
				if (Math.abs(d2) < epsilon) break;
				t2 = t2 - x2 / d2;
			}

			t0 = 0.0;
			t1 = 1.0;
			t2 = x;

			if (t2 < t0) return t0;
			if (t2 > t1) return t1;

			while (t0 < t1) {
				x2 = sampleCurveX(t2);
				if (Math.abs(x2 - x) < epsilon) return t2;
				if (x > x2) t0 = t2;
				else t1 = t2;
				t2 = (t1 - t0) * 0.5 + t0;
			}

			return t2;
		}

		return function(t) {
			return sampleCurveY(solveCurveX(t));
		};
	}

	//defaultを書き換えられるように定義
	//V2からデフォルトを全てeaseInOutQuartに統一
	VRoid.three.easing.default = VRoid.three.easing.easeInOutQuart;
	//VRoid.three.easing.default = VRoid.three.easing.ease;

})();
