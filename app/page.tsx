"use client";

import { motion } from "framer-motion";
import { FaGithub, FaTwitter, FaEnvelope } from "react-icons/fa";
import { SiBilibili, SiCodeforces } from "react-icons/si";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface CfCommit {
  id: number;
  creationTimeSeconds: number;
  problem: { name: string };
  verdict: string;
}

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [cfCommits, setCfCommits] = useState<CfCommit[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let petals: { x: number; y: number; r: number; speed: number; drift: number }[] = [];

    const createPetal = () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      r: Math.random() * 6 + 4,
      speed: Math.random() * 2 + 1,
      drift: Math.random() * 2 - 1,
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach((p) => {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r, p.r * 0.6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,182,193,0.8)";
        ctx.fill();
        p.y += p.speed;
        p.x += p.drift;
        if (p.y > window.innerHeight) Object.assign(p, createPetal());
      });
      animationId = requestAnimationFrame(draw);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    petals = Array.from({ length: 60 }, createPetal);
    draw();
    window.addEventListener("resize", resize);
    const timer = setTimeout(() => setShowIntro(false), 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    fetch("https://codeforces.com/api/user.status?handle=koileo")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "OK") setCfCommits(data.result.slice(0, 10));
      })
      .catch((err) => console.error(err));
  }, []);

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case "OK":
        return "text-green-600 font-semibold";
      case "WRONG_ANSWER":
        return "text-red-600 font-semibold";
      case "TIME_LIMIT_EXCEEDED":
        return "text-orange-500 font-semibold";
      default:
        return "text-gray-700 font-semibold";
    }
  };

  const snsLinks = [
    { icon: <FaGithub />, link: "https://github.com/Koileo" },
    { icon: <FaTwitter />, link: "https://x.com/Koileo7" },
    { icon: <SiBilibili />, link: "https://space.bilibili.com/456061507" },
    { icon: <SiCodeforces />, link: "https://codeforces.com/profile/Koileo" },
    { icon: <FaEnvelope />, link: "mailto:koileo@outlook.com" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 via-rose-100 to-white flex items-center justify-center relative overflow-hidden font-[Noto_Serif_JP]">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 1.5 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black"
        >
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.4, 1], opacity: [0, 1, 0.7] }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-5xl font-extrabold text-pink-200 drop-shadow-[0_0_35px_rgba(255,182,193,1)] animate-bounce"
          >
            🌸 こんにちは 🌸
          </motion.h1>
        </motion.div>
      )}

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 80 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, type: "spring" }}
          whileHover={{ scale: 1.02 }}
          className="p-10 rounded-[2rem] bg-white/70 backdrop-blur-2xl shadow-[0_0_60px_rgba(255,182,193,0.8)] border border-pink-200/60 text-center"
        >
          <motion.div
            className="relative w-48 h-48 mx-auto rounded-full border-4 border-pink-300 shadow-[0_0_40px_rgba(255,182,193,0.9)] overflow-hidden bg-white"
            whileHover={{ scale: 1.15, rotate: 3 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Image
              src="https://q.qlogo.cn/headimg_dl?dst_uin=2448087646&spec=640&img_type=jpg"
              alt="avatar"
              width={192}
              height={192}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.h1
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mt-6 text-5xl font-extrabold text-pink-500 drop-shadow-[0_0_15px_rgba(255,182,193,0.8)]"
          >
            Koileo ✨
          </motion.h1>

          <p className="mt-4 text-lg text-gray-700 leading-relaxed">
            🌸 欢迎来到 <span className="font-semibold text-pink-500">Koileo</span> 的小世界!
          </p>
          <p className="mt-4 text-lg text-gray-700 leading-relaxed">遠くの星、近くの輝き</p>
          <div className="mt-10 flex justify-center gap-8">
            {snsLinks.map((item) => (
              <motion.a
                key={item.link}
                href={item.link}
                target="_blank"
                whileHover={{ scale: 1.4, rotate: 10 }}
                className="text-2xl"
              >
                {item.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 80 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, type: "spring" }}
          whileHover={{ scale: 1.02 }}
          className="p-10 rounded-[2rem] bg-white/70 backdrop-blur-2xl shadow-[0_0_60px_rgba(255,182,193,0.8)] border border-pink-200/60 text-center"
        >
          <h2 className="text-3xl font-bold text-pink-500 drop-shadow mb-6">最新动态</h2>
          <img
            src="https://ghchart.rshah.org/Koileo"
            alt="GitHub Contributions"
            className="mx-auto mb-6"
          />
          <p className="text-gray-700 text-lg font-semibold mb-4">GitHub 活跃度</p>
          <div className="text-left max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">Codeforces 最近提交</h3>
            <ul className="ml-0 grid grid-cols-1 gap-2">
              {cfCommits.map((commit) => (
                <li
                  key={commit.id}
                  className="p-2 rounded-lg border border-gray-300 bg-white shadow hover:shadow-md transition-all"
                >
                  <span className="font-semibold">{commit.problem.name}</span> -{" "}
                  <span className={getVerdictStyle(commit.verdict)}>
                    {commit.verdict.replace("_", " ")}
                  </span>{" "}
                  -{" "}
                  <span className="text-gray-500 text-sm">
                    {new Date(commit.creationTimeSeconds * 1000).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
