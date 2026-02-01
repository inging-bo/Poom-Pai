import { motion } from "framer-motion";
import { Delete } from "lucide-react"; // 아이콘 라이브러리

interface KeypadInputProps {
  setEditCode:  React.Dispatch<React.SetStateAction<string>>
}

export default function CustomKeypad({setEditCode} : KeypadInputProps) {

  const handleKeyPress = (num: string) => {
    setEditCode((prev) => prev + num);
  };

  const handleDelete = () => {
    setEditCode((prev) => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col w-full mx-auto h-full justify-between">
      {/* 커스텀 숫자 키패드 영역 */}
      <div className="grid grid-cols-3 gap-4">
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