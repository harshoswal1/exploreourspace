import * as THREE from 'https://esm.sh/three@0.152.2';

export function createFocusController(camera, controls) {
  let targetObject = null;
  let offset = new THREE.Vector3();
  let currentOffset = new THREE.Vector3();
  const targetPosition = new THREE.Vector3();
  const jumpStartCamera = new THREE.Vector3();
  const jumpStartTarget = new THREE.Vector3();
  const jumpEndCamera = new THREE.Vector3();
  const jumpEndTarget = new THREE.Vector3();
  let previousTarget = controls.target.clone();
  let jumpProgress = 1;
  let jumping = false;

  function follow(object3D, nextOffset) {
    if (!targetObject) {
      previousTarget = controls.target.clone();
    }
    targetObject = object3D;
    offset.copy(nextOffset);
    currentOffset.copy(nextOffset.clone().multiplyScalar(3.4));
  }

  function jumpTo(object3D, nextOffset) {
    object3D.getWorldPosition(targetPosition);

    jumpStartCamera.copy(camera.position);
    jumpStartTarget.copy(controls.target);
    jumpEndTarget.copy(targetPosition);
    jumpEndCamera.copy(targetPosition).add(nextOffset);

    targetObject = null;
    jumping = true;
    jumpProgress = 0;
  }

  function clear() {
    targetObject = null;
    jumping = false;
    jumpProgress = 1;
    controls.target.copy(previousTarget);
  }

  function update() {
    if (jumping) {
      jumpProgress = Math.min(1, jumpProgress + 0.06);
      const eased = 1 - Math.pow(1 - jumpProgress, 3);
      camera.position.lerpVectors(jumpStartCamera, jumpEndCamera, eased);
      controls.target.lerpVectors(jumpStartTarget, jumpEndTarget, eased);
      if (jumpProgress >= 1) {
        jumping = false;
      }
      return;
    }

    if (!targetObject) return;

    targetObject.getWorldPosition(targetPosition);

    currentOffset.lerp(offset, 0.2);

    const desiredPosition = targetPosition.clone().add(currentOffset);
    camera.position.copy(desiredPosition);
    controls.target.copy(targetPosition);
  }

  return {
    follow,
    jumpTo,
    clear,
    isFollowing: () => Boolean(targetObject) || jumping,
    update,
  };
}
