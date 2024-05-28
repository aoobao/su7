<script setup lang="ts">
import { GLTF } from '@/lib/GLTFLoader'
import { getItemList } from '@/utils/res'
import { Texture, MathUtils } from 'three'
import { initWindSpeed } from '../shaders/windspeed'
import { initLineCar } from '../shaders/linecar'
import { useThreeRender } from '@/store/three'
import { useConfig } from '@/store/config'
import { watch } from 'vue'
import { Tween } from '@tweenjs/tween.js'
import { global } from '@/store/global'
import { addHtmlEvent } from '@/utils/dom'
import { useBeforeRender } from '@/store/update'
import { clamp } from '@/lib/camera-controls/utils/math-utils'
const [sm_windspeed, sm_linecar, saLine] = getItemList('sm_windspeed', 'sm_linecar', 't_saLine') as [GLTF, GLTF, Texture]

const { windSpeed, windMaterial } = initWindSpeed(sm_windspeed, saLine)

const { lineCarMaterial } = initLineCar(sm_linecar)

const config = useConfig()

const beforeRender = useBeforeRender()

let isDown = false

let cancels: (() => void)[] = []

const cancelFunc = () => {
  if (cancels.length) {
    cancels.forEach(cancel => cancel())
    cancels = []
  }
}

windSpeed.visible = false
sm_linecar.scene.visible = false

useThreeRender(env => {
  env.scene.add(sm_windspeed.scene)
  env.scene.add(sm_linecar.scene)

  const func = watch(
    () => config.showWindSpeed,
    flag => {
      cancelFunc()

      windSpeed.visible = flag
      sm_linecar.scene.visible = false

      if (flag) {
        config.envIntensity = 0.1
        // global.uEnvMapIntensity.value =
        cancels = [
          // addHtmlEvent(env.dom, 'mousedown', () => {
          //   isDown = true
          // }),
          // addHtmlEvent(env.dom, 'mouseup', () => {
          //   isDown = false
          // }),
          addHtmlEvent(document.body, 'keydown', e => {
            // console.log(e.code)
            if (e.code === 'Space') {
              isDown = true
            }
          }),
          addHtmlEvent(document.body, 'keyup', e => {
            // console.log(e.code)
            if (e.code === 'Space') {
              isDown = false
            }
          }),

          beforeRender(({ delta }) => {
            const step = isDown ? -1 : 1
            const add = step * delta

            const value = MathUtils.clamp(global.uDiscardOpacity.value + add, 0, 1)

            global.uDiscardOpacity.value = value
            windMaterial.uniforms.opacity.value = Math.max(value, 0)

            lineCarMaterial.uniforms.opacity.value = 1-value
            sm_linecar.scene.visible = value < 0.9
          })
        ]
      } else {
        config.envIntensity = 0.5

        global.uDiscardOpacity.value = 1
        windMaterial.uniforms.opacity.value = 1
      }
    }
  )

  return () => {
    func()
    cancelFunc()
    env.scene.remove(windSpeed)
  }
})
</script>
<template>
  <div class="explain" v-if="config.showWindSpeed">按住空格键查看特效</div>

  <!-- <slot /> -->
</template>
<style scoped>
.explain {
  position: absolute;
  bottom: 10vh;
  display: flex;
  justify-content: center;
  pointer-events: none;
  width: 100%;
  font-size: 24px;
  color: #fff;
}
</style>
