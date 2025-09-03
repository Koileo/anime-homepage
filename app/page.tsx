"use client";

import { motion } from "framer-motion";
import { FaGithub, FaTwitter, FaEnvelope, FaCircle, FaSync } from "react-icons/fa";
import { SiBilibili, SiCodeforces } from "react-icons/si";
import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";

// API 数据结构接口
interface CfCommit {
  id: number;
  creationTimeSeconds: number;
  problem: { name: string };
  verdict: string;
}

interface BangumiItem {
  subject: {
    id: number;
    name: string;
    name_cn: string;
    images: { large: string };
    score: number;
    rank: number;
  };
}

interface StatusInfo {
  name: string;
  desc: string;
  color: string;
}

interface DeviceInfo {
  show_name: string;
  status: string | null;
  using: boolean | null;
}

interface StatusResponse {
  success: boolean;
  status: StatusInfo;
  device: { [key: string]: DeviceInfo };
}


export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [cfCommits, setCfCommits] = useState<CfCommit[]>([]);
  const [watchingBangumiList, setWatchingBangumiList] = useState<BangumiItem[]>([]);
  const [watchedBangumiList, setWatchedBangumiList] = useState<BangumiItem[]>([]);
  const [currentStatus, setCurrentStatus] = useState<StatusResponse | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 检测设备类型
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // 为“在看的番”生成随机但固定的样式
  const watchingBangumiStyles = useMemo(() => {
    const count = watchingBangumiList.length > 0 ? watchingBangumiList.length : 1;
    return watchingBangumiList.map((_, index) => {
      const radiusX = isMobile ? 150 : 430;
      const radiusY = isMobile ? 100 : 190;
      const angle = (index / count) * Math.PI * 2;
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 40;

      return {
        rotate: Math.random() * 20 - 10,
        x: x + offsetX,
        y: y + offsetY,
        scale: Math.random() * 0.1 + 0.9,
      };
    });
  }, [watchingBangumiList, isMobile]);


  // 下雪背景
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let snowflakes: {
      x: number;
      y: number;
      r: number;
      speed: number;
      drift: number;
      opacity: number;
    }[] = [];

    const createSnowflake = () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      r: Math.random() * 6 + 2, // 雪花半径范围更大
      speed: Math.random() * 1.5 + 0.5, // 下落速度
      drift: Math.random() * 1.5 - 0.75, // 左右飘动
      opacity: Math.random() * 0.5 + 0.3, // 透明度层次
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      snowflakes.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
        p.y += p.speed;
        p.x += p.drift;

        // 如果雪花飘出屏幕，随机重置到顶部
        if (p.y > window.innerHeight) {
          Object.assign(p, createSnowflake(), { y: -Math.random() * 50 });
        }
        if (p.x > window.innerWidth || p.x < 0) {
          Object.assign(p, createSnowflake(), { x: Math.random() * window.innerWidth });
        }
      });
      animationId = requestAnimationFrame(draw);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // 根据屏幕面积动态调整雪花数量
      const numSnowflakes = Math.floor((window.innerWidth * window.innerHeight) / 3000);
      snowflakes = Array.from({ length: numSnowflakes }, createSnowflake);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    const timer = setTimeout(() => setShowIntro(false), 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  // 获取当前状态并设置自动刷新
  useEffect(() => {
    const fetchStatus = () => {
      setIsStatusLoading(true);
      fetch("http://monitor.koileo.top:9010/api/status/query")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCurrentStatus(data);
            setLastUpdated(new Date());
          }
        })
        .catch((err) => console.error("获取当前状态失败", err))
        .finally(() => {
          setIsStatusLoading(false);
        });
    };

    fetchStatus(); // 立即获取一次
    const intervalId = setInterval(fetchStatus, 5000); // 每 5 秒刷新一次

    return () => clearInterval(intervalId); // 组件卸载时清除定时器
  }, []);


  // Codeforces 提交
  useEffect(() => {
    fetch("https://codeforces.com/api/user.status?handle=koileo")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "OK") setCfCommits(data.result.slice(0, 10));
      })
      .catch((err) => console.error(err));
  }, []);

  // 通用的 Bangumi 数据获取函数
  const fetchBangumiCollection = async (type: number) => {
    try {
      const limit = 50;
      const firstPageUrl = `https://api.bgm.tv/v0/users/koileo/collections?subject_type=2&type=${type}&limit=${limit}&offset=0`;
      const res = await fetch(firstPageUrl);
      const firstPageData = await res.json();

      if (!firstPageData || typeof firstPageData.total !== 'number') {
        throw new Error(`无效的 Bangumi API 响应 (type=${type})`);
      }

      const total = firstPageData.total;
      const allItems = firstPageData.data || [];
      const totalPages = Math.ceil(total / limit);
      const fetchPromises = [];

      for (let i = 1; i < totalPages; i++) {
        const offset = i * limit;
        const pageUrl = `https://api.bgm.tv/v0/users/koileo/collections?subject_type=2&type=${type}&limit=${limit}&offset=${offset}`;
        fetchPromises.push(fetch(pageUrl).then(res => res.json()));
      }

      const remainingPagesData = await Promise.all(fetchPromises);
      remainingPagesData.forEach(pageData => {
        if (pageData && Array.isArray(pageData.data)) {
          allItems.push(...pageData.data);
        }
      });
      return allItems;
    } catch (err) {
      console.error(`获取 Bangumi 数据失败 (type=${type})`, err);
      return [];
    }
  };

  // 获取“在看”和“看过”的番剧
  useEffect(() => {
    fetchBangumiCollection(3).then(setWatchingBangumiList); // type=3 在看
    fetchBangumiCollection(2).then(setWatchedBangumiList);  // type=2 看过
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

  const getStatusColorClass = (color: string) => {
    switch (color) {
      case "awake":
        return "text-green-500";
      case "sleeping":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const snsLinks = [
    { icon: <FaGithub />, link: "https://github.com/Koileo" },
    { icon: <FaTwitter />, link: "https://x.com/Koileo7" },
    { icon: <SiBilibili />, link: "https://space.bilibili.com/456061507" },
    { icon: <SiCodeforces />, link: "https://codeforces.com/profile/Koileo" },
    { icon: <FaEnvelope />, link: "mailto:koileo@outlook.com" },
  ];

  const directoryLinks = [
    { href: "#about-me", label: "关于我" },
    { href: "#current-status", label: "当前状态" },
    { href: "#latest-updates", label: "最新动态" },
    { href: "#watching-anime", label: "在看的番" },
    { href: "#watched-anime", label: "看过的番" },
  ];
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Intro 期间禁止滚动
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "auto"; // 恢复滚动
    }, 2500); // 2.5 秒后关闭

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-blue-100 to-white flex justify-center relative overflow-hidden font-[Noto_Serif_JP]">
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />

      {/* 右侧悬浮目录 */}
      {!isMobile && (
      <motion.nav
        className="fixed top-1/2 right-0 z-30 -translate-y-1/2"
        initial={{ x: "calc(100% - 2.5rem)" }}
        whileHover={{ x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div className="flex items-center bg-white/60 backdrop-blur-lg rounded-l-2xl shadow-lg border-l border-t border-b border-white/50">
          <div className="flex items-center justify-center w-10 h-32 cursor-pointer">
            <span className="font-bold text-sky-500 -rotate-90 whitespace-nowrap tracking-widest">
              目 录
            </span>
          </div>
          <ul className="pr-8 pl-4 py-4 space-y-4">
            {directoryLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-gray-700 hover:text-sky-500 font-semibold transition-colors text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(link.href)?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </motion.nav>
      )}

      {/* Intro 动画 */}
      {showIntro && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-1000 ${
            visible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.4, 1], opacity: [0, 1, 0.7] }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-5xl font-extrabold text-sky-300 drop-shadow-[0_0_35px_rgba(135,206,250,1)] animate-bounce"
          >
            ☁️ こんにちは ☁️
          </motion.h1>
        </motion.div>
      )}

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl w-full px-8 py-16 md:py-24">
        {/* 个人卡片 */}
        <motion.div
          id="about-me"
          initial={{ opacity: 0, scale: 0.6, y: 80 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, type: "spring" }}
          whileHover={{ scale: 1.02 }}
          className="p-10 rounded-[2rem] bg-white/70 backdrop-blur-2xl shadow-[0_0_60px_rgba(135,206,250,0.7)] border border-sky-200/60 text-center"
        >
          <motion.div
            className="relative w-48 h-48 mx-auto rounded-full border-4 border-sky-300 shadow-[0_0_40px_rgba(135,206,250,0.9)] overflow-hidden bg-white"
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
            className="mt-6 text-5xl font-extrabold text-sky-500 drop-shadow-[0_0_15px_rgba(135,206,250,0.8)]"
          >
            Koileo ✨
          </motion.h1>

          <p className="mt-4 text-lg text-gray-700 leading-relaxed">
            ☁️ 欢迎来到 <span className="font-semibold text-sky-500">Koileo</span> 的小世界!
          </p>
          <p className="mt-4 text-lg text-gray-700 leading-relaxed">遠くの星、近くの輝き</p>

          <div className="mt-8 flex justify-center gap-8">
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
          <div className="mt-8 flex justify-center">
            <img src="https://count.getloli.com/@Koileo?name=Koileo&theme=gelbooru&padding=7&offset=0&align=top&scale=0.7&pixelated=1&darkmode=auto" alt="Visitor Counter" />
          </div>
        </motion.div>

        {/* 当前状态 */}
        <motion.div
          id="current-status"
          initial={{ opacity: 0, scale: 0.6, y: 80 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.15, type: "spring" }}
          whileHover={{ scale: 1.02 }}
          className="p-10 rounded-[2rem] bg-white/70 backdrop-blur-2xl shadow-[0_0_60px_rgba(135,206,250,0.7)] border border-sky-200/60"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-sky-500 drop-shadow">当前状态</h2>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              {isStatusLoading && <FaSync className="animate-spin" />}
              {lastUpdated && <span>上次更新: {lastUpdated.toLocaleTimeString()}</span>}
            </div>
          </div>
          
          {currentStatus ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3">
                  <FaCircle className={getStatusColorClass(currentStatus.status.color)} />
                  <p className="text-2xl font-bold text-gray-800">{currentStatus.status.name}</p>
                </div>
                <p className="mt-2 text-gray-600">{currentStatus.status.desc}</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-700">设备状态</h3>
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {Object.entries(currentStatus.device).map(([id, device]) => (
                    <li key={id} className="p-3 rounded-lg border border-gray-300 bg-white/80 shadow-sm">
                      <p className="font-semibold text-gray-800">{device.show_name}</p>
                      <p className="text-sm text-gray-500">{device.status || (device.using ? '正在使用' : '未使用')}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 pt-10">正在加载状态...</p>
          )}
        </motion.div>

        {/* 最新动态 */}
        <motion.div
          id="latest-updates"
          initial={{ opacity: 0, scale: 0.6, y: 80 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, type: "spring" }}
          whileHover={{ scale: 1.02 }}
          className="md:col-span-2 p-10 rounded-[2rem] bg-white/70 backdrop-blur-2xl shadow-[0_0_60px_rgba(135,206,250,0.7)] border border-sky-200/60 text-center"
        >
          <h2 className="text-3xl font-bold text-sky-500 drop-shadow mb-6">最新动态</h2>
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

        {/* Bangumi 在看的番 - 条件渲染 */}
        <motion.div
          id="watching-anime"
          initial={{ opacity: 0, scale: 0.6, y: 80 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, type: "spring" }}
          className="md:col-span-2 p-10 rounded-[2rem] bg-white/70 backdrop-blur-2xl shadow-[0_0_60px_rgba(135,206,250,0.7)] border border-sky-200/60"
        >
          <h2 className="text-3xl font-bold text-sky-500 drop-shadow mb-6 text-center">在看的番</h2>
          {isMobile ? (
            // 移动端：普通网格布局
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[40rem] overflow-y-auto"
            >
              {watchingBangumiList.map((item) => (
                <motion.div
                  key={item.subject.id}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1 },
                  }}
                  className="relative rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white group"
                >
                  <Image
                    src={item.subject.images.large}
                    alt={item.subject.name_cn || item.subject.name}
                    width={500}
                    height={700}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-white text-center p-1">
                      <p className="text-2xl font-bold">{item.subject.score}</p>
                      <p className="text-xs mt-1">Rank: {item.subject.rank || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="p-2 text-sm text-gray-700 truncate">
                    {item.subject.name_cn || item.subject.name}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // 桌面端：3D散落布局
            <div
              className="relative h-[40rem] w-full"
              style={{ perspective: "1000px" }}
            >
              {watchingBangumiList.map((item, index) => (
                <motion.div
                  key={item.subject.id}
                  className="absolute top-1/2 left-1/2"
                  initial={{
                    x: "-50%",
                    y: "-50%",
                    rotate: watchingBangumiStyles[index]?.rotate,
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    x: `calc(-50% + ${watchingBangumiStyles[index]?.x}px)`,
                    y: [
                      `calc(-50% + ${watchingBangumiStyles[index]?.y - 5}px)`,
                      `calc(-50% + ${watchingBangumiStyles[index]?.y + 5}px)`
                    ],
                    rotate: watchingBangumiStyles[index]?.rotate,
                    scale: watchingBangumiStyles[index]?.scale,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      stiffness: 50,
                      delay: index * 0.1,
                      y: {
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                      }
                    },
                  }}
                  whileHover={{
                    scale: 1.25,
                    zIndex: 50,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                >
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white group w-48">
                    <Image
                      src={item.subject.images.large}
                      alt={item.subject.name_cn || item.subject.name}
                      width={500}
                      height={700}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-white text-center p-2">
                        <p className="text-3xl font-bold">{item.subject.score}</p>
                        <p className="text-sm mt-1">BGM Rank: {item.subject.rank || 'N/A'}</p>
                        <p className="text-xs mt-2 font-semibold line-clamp-2">
                          {item.subject.name_cn || item.subject.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bangumi 看过的番 - 普通网格 */}
        <motion.div
          id="watched-anime"
          initial={{ opacity: 0, scale: 0.6, y: 80 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.9, type: "spring" }}
          className="md:col-span-2 p-10 rounded-[2rem] bg-white/70 backdrop-blur-2xl shadow-[0_0_60px_rgba(135,206,250,0.7)] border border-sky-200/60 text-center"
        >
          <h2 className="text-3xl font-bold text-sky-500 drop-shadow mb-6">看过的番</h2>
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-[40rem] overflow-y-auto"
          >
            {watchedBangumiList.map((item) => (
              <motion.div
                key={item.subject.id}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
                className="relative rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white group"
              >
                <Image
                  src={item.subject.images.large}
                  alt={item.subject.name_cn || item.subject.name}
                  width={500}
                  height={700}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-white text-center p-1">
                    <p className="text-2xl font-bold">{item.subject.score}</p>
                    <p className="text-xs mt-1">Rank: {item.subject.rank || 'N/A'}</p>
                  </div>
                </div>
                <p className="p-2 text-sm text-gray-700 truncate">
                  {item.subject.name_cn || item.subject.name}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
