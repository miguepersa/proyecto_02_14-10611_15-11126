precision highp float;

attribute float lifetime;
uniform float u_time;
uniform int u_behavior;
uniform vec3 u_centerOfMass;

varying float vAlpha;

void main() {
    vec3 newPosition = position;
    float timeFactor = mod((u_time + lifetime), 1.0);
    
    if (u_behavior == 0) {
        // Fire Effect: Moves upwards & flickers
        newPosition.y += timeFactor * 0.5;
        vAlpha = 1.0 - timeFactor;

    } else if (u_behavior == 1) {
        // Spore Effect: Expands outward radially
        float expansion = timeFactor * 0.5;
        newPosition.x += position.x * expansion;
        newPosition.z += position.z * expansion;
        vAlpha = 1.0 - timeFactor;

    } else if (u_behavior == 2){
        // Asteroids effect: rotates around the same center of mass
        float rotationAngle = u_time * 0.5;

        // Posicion relativa al centro de masa
        vec3 relativePosition = position - u_centerOfMass;

        // Matriz de rotacion alrededor del eje Y
        mat3 rotationMatrix = mat3(cos(rotationAngle), 0.0, sin(rotationAngle),0.0, 1.0, 0.0,-sin(rotationAngle), 0.0, cos(rotationAngle));

        // Aplicar rotacion
        relativePosition = rotationMatrix * relativePosition;

        // Calcular posicion final
        newPosition = relativePosition + u_centerOfMass;

        vAlpha = 1.0; // No alpha fade for rotation (adjust as needed)
    } else {
        vAlpha = 1.0; // Default alpha if no behavior is selected

    }


    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = mix(2.0, 8.0, vAlpha); // Varying size over lifetime
}
