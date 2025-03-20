precision highp float;

uniform vec3 u_color;
varying float vAlpha;

void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    
    if (dist > 0.5) discard;

    gl_FragColor = vec4(u_color, vAlpha);
}
