import { motion as Motion } from "framer-motion";

const AddBtn = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <Motion.div
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="p-3 h-fit py-auto text-center text-sm font-bold text-main-color border-2 border-dashed border-main-color/30 rounded-xl cursor-pointer bg-main-color/5 hover:bg-main-color/10 transition-colors"
  >
    {label} +
  </Motion.div>
);

export default AddBtn;