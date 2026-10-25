// Adapted from ItchyBeard/singularity's canvas paper sprites (MIT).
// One bounded frame loop; no dependency or per-particle canvas allocations.
export function confettiBurst() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {}
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return () => {}
  const width = window.innerWidth,
    height = window.innerHeight
  canvas.width = width
  canvas.height = height
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:101;width:100%;height:100%'
  const colors = [
    '#EF5350',
    '#AB47BC',
    '#7E57C2',
    '#42A5F5',
    '#26C6DA',
    '#66BB6A',
    '#FFEE58',
    '#FFA726',
  ]
  const particles = Array.from({ length: width < 600 ? 55 : 100 }, () => ({
    x: width / 2,
    y: height * 0.4,
    vx: (Math.random() - 0.5) * width * 0.95,
    vy: -150 - Math.random() * 430,
    rotation: Math.random() * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
  document.body.appendChild(canvas)
  const start = performance.now()
  let frame,
    stopped = false
  const stop = () => {
    stopped = true
    cancelAnimationFrame(frame)
    clearTimeout(timer)
    canvas.remove()
  }
  const render = (now) => {
    if (stopped) return
    const t = (now - start) / 1000
    if (t >= 3.5) {
      stop()
      return
    }
    context.clearRect(0, 0, width, height)
    for (const particle of particles) {
      context.save()
      context.translate(particle.x + particle.vx * t, particle.y + particle.vy * t + 240 * t * t)
      context.rotate(particle.rotation * t)
      context.fillStyle = particle.color
      context.globalAlpha = Math.min(1, 3.5 - t)
      context.fillRect(-4, -6, 8 * Math.abs(Math.sin(t * 8 + particle.rotation)), 12)
      context.restore()
    }
    frame = requestAnimationFrame(render)
  }
  const timer = setTimeout(stop, 4000)
  frame = requestAnimationFrame(render)
  return stop
}
