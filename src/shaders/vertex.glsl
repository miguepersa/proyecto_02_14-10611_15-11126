precision highp float;

attribute float lifetime;
uniform float u_time;
uniform int u_behavior;

varying float vAlpha;

void main() {
    vec3 newPosition = position;
    float timeFactor = mod((u_time + lifetime), 1.0);
    
    if (u_behavior == 0) {
        // Fire Effect: Moves upwards & flickers
        newPosition.y += timeFactor * 0.5;
        vAlpha = 1.0 - timeFactor;
    } else {
        // Spore Effect: Expands outward radially
        float expansion = timeFactor * 0.5;
        newPosition.x += position.x * expansion;
        newPosition.z += position.z * expansion;
        vAlpha = 1.0 - timeFactor;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = mix(2.0, 8.0, vAlpha); // Varying size over lifetime
}
