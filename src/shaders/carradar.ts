import { Color, DoubleSide, ShaderMaterial, Vector3 } from 'three'

export const getCarRadarMaterial = (center1: Vector3, center2: Vector3) => {
  const material = new ShaderMaterial({
    name: 'm_carradar',
    uniforms: {
      time: { value: 0 },
      opacity: { value: 1 },
      uColor: { value: new Color(0x88eeff) },
      uCenter1: { value: center1 },
      uCenter2: { value: center2 }
    },
    vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPositionW;
    varying vec3 vPositionObj;
    varying vec3 vNormalW;
    attribute vec3 color;
    varying vec3 vColor;
    varying vec3 vViewPosition;
    varying vec4 viewerUV;
    
    #ifdef USE_INSTANCING
      varying vec3 vPositionIns;
      varying vec3 vPositionInsModel;
      varying vec3 vInstanceColor;
      attribute vec3 instanceColor; // 实例化颜色属性
    #endif
    
    void main() {
        vPosition = position;
        vNormal = normalMatrix * normal;
        vPositionW = vec3( modelMatrix*vec4( position, 1.0 ));
        vPositionObj = vec3( modelMatrix*vec4( vec3(0.), 1.0 ));
        vNormalW = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );
        vUv = uv;
        vColor=color;
    
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
    
        #ifdef USE_INSTANCING
          vPositionInsModel = position;
          vPositionIns = vec3(instanceMatrix * vec4(vec3(0.),1.));
          vPositionW = vec3(instanceMatrix * vec4(vPositionW,1.));
          vPosition = vec3(instanceMatrix * vec4(vPosition,1.));
          vInstanceColor = instanceColor;
        #endif
        
        gl_Position = projectionMatrix * mvPosition;
    }`,
    fragmentShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPositionW;
    varying vec3 vNormalW;

    uniform vec3 uColor;
    uniform float time;
    uniform float opacity;
    uniform vec3 uCenter1;
    uniform vec3 uCenter2;

    const float X_By_Y = 2.3; //  x/z椭圆长宽比

    //椭圆化
    float normalizedEllipticalDistance(vec3 position, vec3 center, float radius) {
        vec2 d = center.xz - position.xz;
        d.y *= X_By_Y;
        return length(d) / radius;
    }

    void main() {

        float distanceP = clamp(1. - normalizedEllipticalDistance(vPositionW, uCenter1, 4.3), 0., 1.);
        distanceP += clamp(1. - normalizedEllipticalDistance(vPositionW, uCenter2, 4.3), 0., 1.);

        float uv_x = vUv.x*10. - time*3.;
        float maskCos = cos(uv_x);

        float maskX = mod(vUv.x*10.-time*3.,1.);
        maskX = step(maskX,0.2+distanceP*0.8);
        maskX *= maskCos;

        float maskY = mod(vUv.y*100.,1.);
        maskY = step(maskY,0.2);

        float mask = clamp( maskX*maskY,0.,1.);

        vec3 color = mix(uColor,vec3(0.1,1.,0.2),vec3(smoothstep(0.,0.5,distanceP)));

        gl_FragColor = vec4(color,mask*opacity);
        // gl_FragColor = vec4(vec3(distanceP),1.);
    }
    `,
    transparent: true,
    depthWrite: false,
    side: DoubleSide
  })

  return material
}
