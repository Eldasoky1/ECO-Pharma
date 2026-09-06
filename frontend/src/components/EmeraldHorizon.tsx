import React, { useRef, useEffect } from "react";

export interface EmeraldHorizonProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  waveScale?: number;
  variation?: number;
  glow?: number;
  vignette?: number;
  isDark?: boolean;
}

export const EmeraldHorizon = ({
  speed = 1,
  waveScale = 1,
  variation = 1.2,
  glow = 0.9,
  vignette = 0.8,
  isDark = false,
  ...props
}: EmeraldHorizonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vertexShaderSrc = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShaderSrc = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_wave_scale;
      uniform float u_variation;
      uniform float u_glow;
      uniform float u_vignette;
      uniform float u_light;
      varying vec2 vUv;

      float hash(float n) { return fract(sin(n) * 1e4); }
      float noise(float x) {
        float i = floor(x);
        float f = fract(x);
        float u = f * f * (3.0 - 2.0 * f);
        return mix(hash(i), hash(i + 1.0), u);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float yPos = st.y;
        float wave1 = sin(st.x * 3.0 + u_time * 0.5) * 0.1 * u_wave_scale;
        float wave2 = sin(st.x * 5.0 - u_time * 0.3) * 0.05 * u_wave_scale;
        float combinedWave = wave1 + wave2;
        float intensity = smoothstep(0.4, -0.1, yPos + combinedWave);
        float variationF = noise(st.x * 2.0 + u_time * 0.1) * 0.5 + 0.5;
        intensity *= variationF * 1.5 * u_variation;

        vec3 baseColor = vec3(0.012, 0.05, 0.032);
        vec3 glowColor1 = vec3(0.03, 0.65, 0.25);
        vec3 glowColor2 = vec3(0.05, 0.9, 0.5);
        vec3 finalGlow = mix(glowColor1, glowColor2, st.x + sin(u_time * 0.2) * 0.5);

        vec3 lightBase = vec3(0.99, 1.0, 0.985);
        vec3 lightGlow = vec3(0.32, 0.78, 0.55);

        vec3 bg = mix(baseColor, lightBase, u_light);
        vec3 glow = mix(finalGlow, lightGlow, u_light);
        float strength = mix(1.15, 0.4, u_light) * u_glow;

        vec3 color = bg + glow * pow(intensity, 1.5) * 1.2 * strength;
        float vignetteF = mix(1.0, smoothstep(1.2, 0.5, length(st - vec2(0.5, 0.0))), u_vignette);
        color *= vignetteF;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("EmeraldHorizon shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, vertexShaderSrc);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentShaderSrc);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("EmeraldHorizon link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const quad = new Float32Array([
      -1.0, -1.0, 0.0, 0.0,
       1.0, -1.0, 1.0, 0.0,
      -1.0,  1.0, 0.0, 1.0,
       1.0,  1.0, 1.0, 1.0,
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "position");
    const uvLoc = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8);

    const uniforms = {
      u_time: gl.getUniformLocation(program, "u_time"),
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_wave_scale: gl.getUniformLocation(program, "u_wave_scale"),
      u_variation: gl.getUniformLocation(program, "u_variation"),
      u_glow: gl.getUniformLocation(program, "u_glow"),
      u_vignette: gl.getUniformLocation(program, "u_vignette"),
      u_light: gl.getUniformLocation(program, "u_light"),
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    const resize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let animationId: number;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 30; // background is slow-moving; 30fps throttle
    const render = (t: number) => {
      animationId = requestAnimationFrame(render);
      if (document.hidden) return;
      if (t - lastFrameTime < frameInterval) return;
      lastFrameTime = t;

      gl.uniform1f(uniforms.u_time, t * 0.001 * speed);
      gl.uniform1f(uniforms.u_wave_scale, waveScale);
      gl.uniform1f(uniforms.u_variation, variation);
      gl.uniform1f(uniforms.u_glow, glow);
      gl.uniform1f(uniforms.u_vignette, vignette);
      gl.uniform1f(uniforms.u_light, isDark ? 0 : 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    animationId = requestAnimationFrame(render);

    container.appendChild(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
      gl.deleteBuffer(buffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [speed, waveScale, variation, glow, vignette, isDark]);

  return <div ref={containerRef} className="pointer-events-none absolute inset-0" {...props} />;
};

export default EmeraldHorizon;