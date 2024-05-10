import { ShaderMaterial } from 'three'

const noiseFunc = `
vec2 hash( vec2 p ) {
  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
  return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}
float noise2d( in vec2 p ) {
  const float K1 = 0.366025404; // (sqrt(3)-1)/2;
  const float K2 = 0.211324865; // (3-sqrt(3))/6;
  vec2 i = floor(p + (p.x+p.y)*K1);	
  vec2 a = p - i + (i.x+i.y)*K2;
  vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0); //vec2 of = 0.5 + 0.5*vec2(sign(a.x-a.y), sign(a.y-a.x));
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0*K2;
  vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
  vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
  return dot(n, vec3(70.0));	
}`

const colorNoiseFunc = `
float random (vec2 st) {
  return fract(sin(dot(st.xy,
                       vec2(12.9898,78.233)))*
      43758.5453123);
}

vec3 pos2col ( vec2 ipos ) {

  ipos += vec2(9.,0.); // Just moved to pick some nice colors
  
  float r = random( ipos + vec2( 12., 2. ) );
  float g = random( ipos + vec2(7., 5. ) );
  float b = random( ipos );

  
  vec3 col = vec3(r,g,b);
  return col;
}

vec3 colorNoise ( vec2 st ) {
  vec2 ipos = floor( st );
  vec2 fpos = fract( st );

  
  // Four corners in 2D of a tile
  vec3 a = pos2col(ipos);
  vec3 b = pos2col(ipos + vec2(1.0, 0.0));
  vec3 c = pos2col(ipos + vec2(0.0, 1.0));
  vec3 d = pos2col(ipos + vec2(1.0, 1.0));
  
  // Cubic Hermine Curve.  Same as SmoothStep()
  vec2 u = fpos*fpos*(3.0-2.0*fpos);
  // u = smoothstep(0.,1.,fpos);
  
  // Mix 4 coorners percentages
  return mix(a, b, u.x) +
          (c - a)* u.y * (1.0 - u.x) +
          (d - b) * u.x * u.y;
}`

const vertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPositionW;
varying vec3 vNormalW;

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
    vNormalW = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );
    vUv = uv;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    #ifdef USE_INSTANCING
      vPositionInsModel = position;
      vPositionIns = vec3(instanceMatrix * vec4(vec3(0.),1.));
      vPositionW = vec3(instanceMatrix * vec4(vPositionW,1.));
      vPosition = vec3(instanceMatrix * vec4(vPosition,1.));
      vInstanceColor = instanceColor;
    #endif
    
    gl_Position = projectionMatrix * mvPosition;
}`

const fragmentShader = ` varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPositionW;
varying vec3 vNormalW;

uniform float uSpeed;
uniform float uTime;

${noiseFunc}
${colorNoiseFunc}
void main() {
    vec2 uv_0 = vUv+vec2(-uTime*0.5,0.);
    float noiseMask = (noise2d(uv_0*vec2(3.,100.))+1.)/2.;
    noiseMask = pow(clamp(noiseMask-0.1,0.,1.),11.);
    noiseMask = smoothstep(0.0,0.04,noiseMask)*2.;

    vec3 colorNoiseMask = colorNoise(uv_0*vec2(10.,100.))*vec3(1.5,1.,400.);
    noiseMask*=smoothstep(0.02,0.5,vUv.x)*smoothstep(0.02,0.5,1.-vUv.x);
    noiseMask*=smoothstep(0.01,0.1,vUv.y)*smoothstep(0.01,0.1,1.-vUv.y);

    noiseMask*=smoothstep(1.,10.,uSpeed);

    gl_FragColor = vec4(vec3(colorNoiseMask),noiseMask);
}`

export const createSpeedUpMaterial = () => {
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 5 }
    },
    vertexShader,
    fragmentShader,
    depthWrite: false,
    transparent: true
  })

  return material
}
