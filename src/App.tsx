// src/App.tsx
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ModalManager from "./modal/ModalManager";
import "./App.css";
import { useEffect } from "react";

function App() {
  const location = useLocation();
  const outlet = useOutlet();
  const isDetailsPage = location.pathname.includes("money-details");

  useEffect(() => {
    // 1. 핀치 줌(두 손가락 확대) 막기
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // 2. 더블 탭 확대 막기
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const getVariants = () => {
    if (isDetailsPage) {
      return {
        initial: { x: "100%" }, // 오른쪽에서 대기
        animate: { x: 0 },
        exit: { x: "100%" },    // 다시 오른쪽으로 나감
      };
    } else {
      return {
        initial: { x: "-100%" }, // 왼쪽에서 대기
        animate: { x: 0 },
        exit: { x: "-100%" },    // 다시 왼쪽으로 나감
      };
    }
  };

  return (
    <div className="app-container overflow-hidden relative h-dvh">
      {/* mode를 popLayout으로 변경하여 동시에 애니메이션 실행 */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={location.pathname}
          variants={getVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }} // 부드러운 연결을 위해 tween 권장
          className="overflow-hidden w-full absolute top-0 left-0 bottom-0"
        >
          {outlet}
        </motion.div>
      </AnimatePresence>

      <ModalManager />
    </div>
  );
}

export default App;