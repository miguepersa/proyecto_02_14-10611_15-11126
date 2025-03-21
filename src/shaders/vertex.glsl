precision highp float;

attribute float lifetime;
uniform float u_time;
uniform float u_radius_mult;
uniform int u_behavior;
uniform vec3 u_centerOfMass;
uniform float u_innerRadius;

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

        // Distance from origin
        float distance = length(position.xz);

        if (distance < u_innerRadius) {
            
            float angle = atan(position.z, position.x);
            newPosition.x = cos(angle) * u_innerRadius;
            newPosition.z = sin(angle) * u_innerRadius;
        }

        // Asteroids effect: rotates around the same center of mass
        float rotationAngle = u_time * 0.5;

        // Relative position to center of mass
        vec3 relativePosition = newPosition - u_centerOfMass;

        // Rotation matrix around Y axis
        mat3 rotationMatrix = mat3(cos(rotationAngle), 0.0, sin(rotationAngle),0.0, 1.0, 0.0,-sin(rotationAngle), 0.0, cos(rotationAngle));

        // Apply rotation
        relativePosition = rotationMatrix * relativePosition;

        // Final position
        newPosition = (relativePosition + u_centerOfMass)*u_radius_mult;

        vAlpha = 1.0;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = mix(2.0, 8.0, vAlpha); // Varying size over lifetime
}
