import * as THREE from "../three/three.module.min.js";
import { FBXLoader } from '../three/loaders/FBXLoader.js';
import { mixamoVRMRigMap } from './mixamoVRMRigMap.js';

/**
 * Load Mixamo animation, convert for three-vrm use, and return it.
 *
 * @param {string} url A url of mixamo animation data
 * @param {VRM} vrm A target VRM
 * @returns {Promise<THREE.AnimationClip>} The converted AnimationClip
 */

const loadMixamoAsset = function ( url ) {

	const loader = new FBXLoader(); // A loader which loads FBX
	return loader.loadAsync( url ).then( ( asset ) => {
		return asset;
	} );

}

const loadMixamoClip = function ( asset, vrm ) {

	const tmpClip = THREE.AnimationClip.findByName( asset.animations, 'mixamo.com' ); // extract the AnimationClip
	const clip = tmpClip.clone();

	const tracks = []; // KeyframeTracks compatible with VRM will be added here

	const restRotationInverse = new THREE.Quaternion();
	const parentRestWorldRotation = new THREE.Quaternion();
	const _quatA = new THREE.Quaternion();
	const _vec3 = new THREE.Vector3();

	// Adjust with reference to hips height.
	const motionHipsHeight = asset.getObjectByName( 'mixamorigHips' ).position.y;
	//const vrmHipsY = vrm.humanoid?.getNormalizedBoneNode( 'hips' ).getWorldPosition( _vec3 ).y;
	let vrmHipsY;
	if (vrm.humanoid && vrm.humanoid.getNormalizedBoneNode('hips')) {
		vrmHipsY = vrm.humanoid.getNormalizedBoneNode('hips').getWorldPosition(_vec3).y;
	}

	const vrmRootY = vrm.scene.getWorldPosition( _vec3 ).y;
	const vrmHipsHeight = Math.abs( vrmHipsY - vrmRootY );
	const hipsPositionScale = vrmHipsHeight / motionHipsHeight;

	clip.tracks.forEach( ( track ) => {

		// Convert each tracks for VRM use, and push to `tracks`
		const trackSplitted = track.name.split( '.' );
		const mixamoRigName = trackSplitted[ 0 ];
		const vrmBoneName = mixamoVRMRigMap[ mixamoRigName ];
		//const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode( vrmBoneName )?.name;
		let vrmNodeName;
		if (vrm.humanoid && vrm.humanoid.getNormalizedBoneNode(vrmBoneName)) {
			vrmNodeName = vrm.humanoid.getNormalizedBoneNode(vrmBoneName).name;
		}

		const mixamoRigNode = asset.getObjectByName( mixamoRigName );

		if ( vrmNodeName != null ) {

			const propertyName = trackSplitted[ 1 ];

			// Store rotations of rest-pose.
			mixamoRigNode.getWorldQuaternion( restRotationInverse ).invert();
			mixamoRigNode.parent.getWorldQuaternion( parentRestWorldRotation );

			if ( track instanceof THREE.QuaternionKeyframeTrack ) {

				// Retarget rotation of mixamoRig to NormalizedBone.
				const tmpTrack = track.clone();
				
				for ( let i = 0; i < tmpTrack.values.length; i += 4 ) {

					const flatQuaternion = tmpTrack.values.slice( i, i + 4 );

					_quatA.fromArray( flatQuaternion );

					// 親のレスト時ワールド回転 * トラックの回転 * レスト時ワールド回転の逆
					_quatA
						.premultiply( parentRestWorldRotation )
						.multiply( restRotationInverse );

					_quatA.toArray( flatQuaternion );

					flatQuaternion.forEach( ( v, index ) => {

						tmpTrack.values[ index + i ] = v;

					} );

				}

				tracks.push(
					new THREE.QuaternionKeyframeTrack(
						`${vrmNodeName}.${propertyName}`,
						tmpTrack.times,
						//track.values.map( ( v, i ) => ( vrm.meta?.metaVersion === '0' && i % 2 === 0 ? - v : v ) ),
						tmpTrack.values.map((v, i) => {
							if (vrm.meta && vrm.meta.metaVersion === '0' && i % 2 === 0) {
								return -v;
							} else {
								return v;
							}
						}),

					),
				);

			} else if ( track instanceof THREE.VectorKeyframeTrack ) {
			
				const tmpTrack = track.clone();

				//const value = tmpTrack.values.map( ( v, i ) => ( vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? - v : v ) * hipsPositionScale );
				const value = tmpTrack.values.map((v, i) => {
					if (vrm.meta && vrm.meta.metaVersion === '0' && i % 3 !== 1) {
						return -v;
					} else {
						return v;
					}
				}).map(v => v * hipsPositionScale);

				tracks.push( new THREE.VectorKeyframeTrack( `${vrmNodeName}.${propertyName}`, tmpTrack.times, value ) );

			}

		}

	} );

	return new THREE.AnimationClip( 'vrmAnimation', clip.duration, tracks );

}

export {
  loadMixamoAsset,
  loadMixamoClip
};