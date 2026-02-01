import { motion } from "framer-motion";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import React from "react";
import { useModalStore } from "@/store/modalStore.ts"; // 아이콘 라이브러리

interface KeypadInputProps {
  setCode:  React.Dispatch<React.SetStateAction<string>>
  modalId?: string
}

export default function CustomKeypad({setCode, modalId} : KeypadInputProps) {
  const { closeModal } = useModalStore();
  const handleKeyPress = (num: string) => {
    setCode((prev) => prev + num);
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col w-full mx-auto h-full justify-between">
      {/* 커스텀 숫자 키패드 영역 */}
      <div className="grid grid-cols-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "닫기", "0", "delete"].map((key, idx) => {
          // 3열 구조이므로 (idx + 1) % 3 === 0 이면 마지막 열
          const isLastColumn = (idx + 1) % 3 === 0;
          // 전체가 12개이므로 idx가 9, 10, 11이면 마지막 행
          const isLastRow = idx >= 9;

          return (
            <motion.button
              key={idx}
              type="button"
              onPointerDown={() => {
                if (key === "delete") return handleDelete();
                if (key === "닫기") return modalId && closeModal(modalId);

                // 위 조건에 해당하지 않는 나머지 모든 경우 (숫자 입력)
                handleKeyPress(key);
              }}
              className={cn("h-16 flex items-center justify-center text-2xl font-bold transition-colors ",
                "active:bg-gray-200 touch-action-none select-none",
                // 오른쪽 보더: 마지막 열이 아닐 때만 추가
                !isLastColumn && "border-r border-gray-200",
                // 아래쪽 보더: 마지막 행이 아닐 때만 추가
                !isLastRow && "border-b border-gray-200",
                key === "delete" ? "text-red-500 hover:bg-red-50" : "text-main-text hover:bg-gray-50"
              )}
            >
              {key === "delete" ? <Delete size={28} /> : key}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}