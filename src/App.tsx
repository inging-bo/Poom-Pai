// src/App.tsx
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ModalManager from "./modal/ModalManager";
import "./App.css";

function App() {
  const location = useLocation();
  const outlet = useOutlet();
  const isDetailsPage = location.pathname.includes("money-details");

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
    <div className="app-container" style={{ overflowX: "hidden", position: "relative", minHeight: "100vh" }}>
      {/* 1. mode를 popLayout으로 변경하여 동시에 애니메이션 실행 */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={location.pathname}
          variants={getVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }} // 부드러운 연결을 위해 tween 권장
          style={{
            width: "100%",
            position: "absolute", // 2. 절대 좌표로 설정하여 두 페이지가 겹쳐서 움직이게 함
            top: 0,
            left: 0
          }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>

      <ModalManager />
    </div>
  );
}

export default App;