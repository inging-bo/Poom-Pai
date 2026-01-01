import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete } from "lucide-react"; // 아이콘 라이브러리

interface KeypadInputProps {
  length?: number;
  onComplete: (code: string) => void;
}

export default function CustomKeypad({ length = 6, onComplete }: KeypadInputProps) {
  const [code, setCode] = useState<string>("");

  // 코드가 다 입력되면 상위 컴포넌트로 전달
  useEffect(() => {
    if (code.length === length) {
      onComplete(code);
    }
  }, [code, length, onComplete]);

  const handleKeyPress = (num: string) => {
    if (code.length < length) setCode((prev) => prev + num);
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto h-full bg-main-bg p-6 justify-between">
      {/* 상단 입력 칸 표시 영역 */}
      <div className="flex flex-col items-center gap-8 mt-10">
        <h2 className="text-xl font-bold text-main-color">입장 코드를 입력해주세요</h2>
        <div className="flex gap-3">
          {Array.from({ length }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-2xl font-bold transition-all
                ${code[i] ? "border-main-color text-main-color shadow-md" : "border-gray-200 text-gray-300"}
                ${code.length === i ? "border-active-color ring-2 ring-active-color/20" : ""}`}
            >
              {/* 입력된 값이 있으면 숫자 표시, 아니면 점(dot) 혹은 빈칸 */}
              <AnimatePresence mode="popLayout">
                {code[i] ? (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    {code[i]}
                  </motion.span>
                ) : (
                  <div className="w-2 h-2 bg-gray-200 rounded-full" />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* 커스텀 숫자 키패드 영역 */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"].map((key, idx) => {
          if (key === "") return <div key={idx} />; // 빈칸

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.9 }}
              onClick={() => (key === "delete" ? handleDelete() : handleKeyPress(key))}
              className={`h-16 flex items-center justify-center rounded-2xl text-2xl font-bold transition-colors
                ${key === "delete" ? "text-red-500 hover:bg-red-50" : "text-main-text hover:bg-gray-100 bg-white shadow-sm"}`}
            >
              {key === "delete" ? <Delete size={28} /> : key}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}