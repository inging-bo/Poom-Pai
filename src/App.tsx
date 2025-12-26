import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ModalManager from "./modal/ModalManager"; // 여기로 이동
import "./App.css";

function App() {
  const location = useLocation();
  const outlet = useOutlet(); // 현재 경로에 맞는 컴포넌트를 가져옴

  return (
    <div className="app-container">
      {/* 1. 페이지 전환 애니메이션 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>

      {/* 2. 전역 모달 매니저 (이제 라우터 기능을 마음껏 쓸 수 있음) */}
      <ModalManager />
    </div>
  );
}

export default App;