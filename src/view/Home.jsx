import { useNavigate } from "react-router-dom";
import { useState } from "react";
import MakeMoneyDetails from "./MakeMoneyDetails.jsx";
import { motion as Motion} from "framer-motion";

function Home() {
  const navigate = useNavigate()
  const goList = () => {
    navigate('/money-details')
  }
  const makeDetails = () => {
    // navigate('/make-money-details')
    setOpenModal(true)
  }
  
  const [openModal, setOpenModal] = useState(false)
  
  return (
    <Motion.div
      className="relative touch-none min-h-svh w-screen max-w-xl my-0 mx-auto flex flex-col justify-center items-center"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.4 }}
    >
      <div className="fixed top-1/5 text-main-color text-5xl">Poom-Pai</div>
      <div className="flex flex-col w-3/4 gap-4 bg-main-bg ">
        <input
          className="placeholder:text-sub-color placeholder:font-money border-[6px] h-14 text-xl px-2 border-main-color rounded-lg"
          inputMode="numeric" pattern="[0-9]*" placeholder="코드를 입력하세요" required/>
        <button className="tracking-wide bg-main-color text-2xl text-white rounded-lg h-14" onClick={() => goList()}
                value="Sign in">입장하기
        </button>
      </div>
      <div
        onClick={!openModal ? () => makeDetails() : undefined}
        className={`${openModal
          ? "w-5/6 bottom-1/2 border-[6px] border-main-color bg-main-bg"
          : "w-40 bottom-16 bg-active-color h-12"}
          flex justify-center items-center max-w-2xl rounded-lg text-white text-center fixed duration-300 translate-y-1/2`}>
        {openModal ? <MakeMoneyDetails setOpenModal={setOpenModal}/> : "모임 추가 통장 +"}
      </div>
    </Motion.div>
  )
}

export default Home;