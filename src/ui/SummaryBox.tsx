// 하위 컴포넌트들 (메모이제이션 고려 가능)
import { cn } from "@/lib/utils.ts";

const SummaryBox = ({ className, label, value, isNegative }: {
  className: string,
  label: string,
  value: number,
  isNegative?: boolean
}) => (
  <div className={cn("flex flex-col items-center min-w-[60px]", className)}>
    <span className="text-main-text">{label}</span>
    <span className={cn("text-sm font-money wrap-anywhere", isNegative ? "text-red-500" : "text-main-text")}>
      {value.toLocaleString()}원
    </span>
  </div>
);

export default SummaryBox;