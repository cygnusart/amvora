'use client';

import { useEffect, useRef } from 'react';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formARef = useRef(false); // keep track of formA
  const particleCount = 600;
  let particles: Particle[] = [];
  let targetPositions: { x: number; y: number }[] = [];

  class Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    tx: number;
    ty: number;
    constructor(x: number, y: number) {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.size = 2;
      this.color = 'rgba(155,93,229,0.8)';
      this.speedX = (Math.random() - 0.5) * 1.2;
      this.speedY = (Math.random() - 0.5) * 1.2;
      this.tx = x;
      this.ty = y;
    }
    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    update(ctx: CanvasRenderingContext2D) {
      if (formARef.current) {
        this.x += (this.tx - this.x) * 0.08;
        this.y += (this.ty - this.y) * 0.08;
      } else {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > window.innerWidth) this.speedX *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.speedY *= -1;
      }
      this.draw(ctx);
    }
  }

  function getTextShape(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.font = 'bold 220px Yeseva One';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText('A', window.innerWidth / 2, window.innerHeight / 2 + 70);

    const textData = ctx.getImageData(0, 0, window.innerWidth, window.innerHeight);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let positions: { x: number; y: number }[] = [];
    for (let y = 0; y < textData.height; y += 6) {
      for (let x = 0; x < textData.width; x += 6) {
        const index = (y * textData.width + x) * 4;
        if (textData.data[index + 3] > 128) {
          positions.push({ x, y });
        }
      }
    }
    return positions;
  }

  function init(ctx: CanvasRenderingContext2D) {
    targetPositions = getTextShape(ctx);
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      const pos = targetPositions[i % targetPositions.length];
      particles.push(new Particle(pos.x, pos.y));
    }
  }

  function animate(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((p) => p.update(ctx));
    requestAnimationFrame(() => animate(ctx));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init(ctx);
    animate(ctx);

    const handleClick = () => {
      formARef.current = true;
      setTimeout(() => (formARef.current = false), 5000); // back to floating after 5 sec
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init(ctx);
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#020003]">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0"></canvas>
      <div className="relative z-10 flex flex-col justify-center items-center w-full h-full text-center">
        <p className="mb-6 text-[#9b5de5] text-xl">Your AI-powered productivity hub</p>
        <h1 className="text-white text-6xl font-serif mb-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.8)] drop-shadow-[0_0_50px_rgba(155,93,229,0.5)]">
          AMVORA
        </h1>
        <button
          className="relative z-10 px-8 py-3 text-white font-semibold border border-white/20 bg-white/5 rounded-full backdrop-blur-md
                     transition-all duration-300
                     hover:border-purple-500 hover:shadow-[0_0_20px_rgba(155,93,229,0.7)]
                     active:scale-95 active:shadow-[0_0_30px_rgba(155,93,229,1)]"
        >
          Begin
        </button>
      </div>
    </div>
  );
}