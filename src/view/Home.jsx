import { useNavigate } from "react-router-dom";
import MakeMoneyDetails from "./MakeMoneyDetails.jsx";
import { motion as Motion } from "framer-motion";

function Home() {
  const navigate = useNavigate()
  const goList = () => {
    navigate('/money-details')
  }


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
          className="focus:border-active-color focus:outline-0 placeholder:text-sub-color placeholder:font-money border-[6px] h-14 text-xl px-2 border-main-color rounded-lg"
          inputMode="numeric" pattern="[0-9]*" placeholder="코드를 입력하세요" required/>
        <button className="tracking-wide bg-main-color text-2xl text-white rounded-lg h-14" onClick={() => goList()}
                value="Sign in">입장하기
        </button>
      </div>
      <MakeMoneyDetails/>
    </Motion.div>
  )
}

export default Home;