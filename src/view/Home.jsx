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
          className="placeholder:text-sub-color placeholder:font-money border-[6px] h-14 text-xl px-2 border-main-color rounded-lg"
          inputMode="numeric" pattern="[0-9]*" placeholder="코드를 입력하세요" required/>
        <button className="tracking-wide bg-main-color text-2xl text-white rounded-lg h-14" onClick={() => goList()}
                value="Sign in">입장하기
        </button>
      </div>
      <MakeMoneyDetails/>
      {/*<Motion.div*/}
      {/*  onClick={!openModal ? () => makeDetails() : undefined}*/}
      {/*  initial={false}*/}
      {/*  animate={openModal ? "open" : "closed"}*/}
      {/*  variants={{*/}
      {/*    open: {*/}
      {/*      width: "83.3333%",*/}
      {/*      height: "inherit",*/}
      {/*      bottom: "50%",*/}
      {/*      backgroundColor: "var(--color-main-bg)",*/}
      {/*      borderWidth: "6px",*/}
      {/*      borderColor: "var(--color-main-color)",*/}
      {/*      transition: {*/}
      {/*        width: { duration: 0.4, delay: 0.4 },*/}
      {/*        bottom: { duration: 0.4 },*/}
      {/*        backgroundColor: { duration: 0.4 },*/}
      {/*        borderWidth: { duration: 0.4 },*/}
      {/*      },*/}
      {/*    },*/}
      {/*    closed: {*/}
      {/*      width: "10rem",*/}
      {/*      height: "3rem",*/}
      {/*      bottom: "10%",*/}
      {/*      backgroundColor: "var(--color-active-color)",*/}
      {/*      borderWidth: "0px",*/}
      {/*      transition: {*/}
      {/*        width: { duration: 0.4 },*/}
      {/*        bottom: { duration: 0.4, delay: 0.4 },*/}
      {/*        backgroundColor: { duration: 0.4 },*/}
      {/*        borderWidth: { duration: 0.4 },*/}
      {/*      },*/}
      {/*    }*/}
      {/*  }}*/}
      {/*  className="fixed bottom-0 flex max-w-2xl justify-center items-center rounded-lg text-white text-center z-50 translate-y-1/2 overflow-hidden"*/}
      {/*>*/}
      {/*  {openModal ? <MakeMoneyDetails openModal={openModal} setOpenModal={setOpenModal}/> : "모임 추가 통장 +"}*/}
      {/*</Motion.div>*/}
    </Motion.div>
  )
}

export default Home;