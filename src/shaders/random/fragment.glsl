uniform float uTime;

vec3 ApplyHue(vec3 col, float hueAdjust)
{
    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(hueAdjust);
    return col * cosAngle + cross(k, col) * sin(hueAdjust) + k * dot(k, col) * (1.0 - cosAngle);
}


void main()
{
    // float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    // float strength = 0.05 / distanceToCenter - 0.05 * 2.0;

    // gl_FragColor = vec4(1.0, 1.0, 1.0, strength);

    // Disc point
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = step(0.5, strength);
    strength = 1.0 - strength;

    vec3 chosenColor = vec3(0.9, 1.0, 0.4);
    vec3 color = ApplyHue(chosenColor, uTime);

    gl_FragColor = vec4(color, strength);

}