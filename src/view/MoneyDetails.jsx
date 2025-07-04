import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";

function MoneyDetails() {
  
  const navigate = useNavigate()
  
  const goHome = () => {
    navigate('/')
  }
  
  return (
    <Motion.div
      className="relative min-h-svh w-screen max-w-xl my-0 mx-auto flex flex-col justify-start items-center"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="flex z-50 bg-main-bg border-b-2 border-main-color items-center w-full sticky top-0 justify-between pt-2 pb-1 px-2">
        {/* 상단 */}
        <div className="flex flex-col justify-center">
          <div className="text-2xl text-center">
            총 경비
          </div>
          <div className="bg-main-bg text-main-text px-2 py-1 text-xl font-money">
            1,000,000원
          </div>
        </div>
        <div>
          <div className="text-2xl text-center">
            남은 금액
          </div>
          <div className="bg-main-bg text-main-text px-2 py-1 text-xl font-money">
            1,000,000원
          </div>
        </div>
      </div>
      <div className="
      {/*before:content-[''] before:absolute before:-z-20  before:left-0 before:right-0 before:bottom-1/2 before:h-1 befor before:-translate-y-1/2 before:top-1/2 before:bg-main-color*/}
      relative text-2xl border-b-2 border-main-color w-full text-center py-2">
        <span className="bg-main-bg px-2">참여자 명단</span>
      </div>
      {/* 참여자 */}
      <ul className="flex flex-col gap-3 w-full pt-4 px-2 pb-8">
        <li className="flex">
          <span className="basis-[32%] text-2xl text-center">참석자</span>
          <span className="basis-[38%] text-2xl text-center">뿜빠이</span>
          <span className="basis-[38%] text-2xl text-center">지불 금액</span>
        </li>
        <li className="flex text-xl gap-2 font-money">
          <span className="basis-[32%]">
            <input className="w-full py-1 text-center bg-[#00000010]" type="text" placeholder="이름"/>
          </span>
          <span className="basis-[38%] flex gap-1 items-center text-right">
            <input className="w-full py-1 text-lg text-right bg-[#00000010] pr-1 backdrop-opacity-50" inputMode="numeric" pattern="[0-9]*" placeholder="0"/><span>원</span>
          </span>
          <span className="basis-[38%] flex gap-1 items-center text-right">
            <input className="w-full py-1 text-lg text-right bg-[#00000010] pr-1 backdrop-opacity-50" inputMode="numeric" pattern="[0-9]*" placeholder="0"/><span>원</span>
          </span>
        </li>
        <li className="p-3 text-center text-xl text-main-color border-2 border-sub-color mx-[10%] rounded-full">인원 추가
          +
        </li>
      </ul>
      <div className="
      before:content-[''] before:absolute before:-z-20  before:left-0 before:right-0 before:bottom-1/2 before:h-1 befor before:-translate-y-1/2 before:top-1/2 before:bg-main-color
      relative text-2xl w-full text-center py-2">
        <span className="bg-main-bg px-2">지출 내역</span>
      </div>
      {/* 사용처 */}
      <ul className="flex flex-col gap-3 w-full py-4 px-2 mb-32">
        <li className="flex">
          <span className="flex-1 text-2xl text-center">사용처</span>
          <span className="flex-1 text-2xl text-center">사용 금액</span>
          <span className="flex-1 text-2xl text-center">제외 인원</span>
        </li>
        <li className="flex text-xl gap-2 font-money flex-wrap">
          <span className="flex-1 items-center text-center">
            <input className="w-full py-1 text-center bg-[#00000010]" type="text" placeholder="이름"/>
          </span>
          <span className="flex-1 items-center flex gap-1 text-right">
            <input className="w-full py-1 text-lg text-right bg-[#00000010] pr-1 backdrop-opacity-50" inputMode="numeric" pattern="[0-9]*" placeholder="0"/><span>원</span>
          </span>
          <span className="flex-1 items-center flex gap-1 text-right">
            <input className="w-full py-1 text-lg text-right bg-[#00000010] pr-1 backdrop-opacity-50" inputMode="numeric" pattern="[0-9]*" placeholder="0"/>
          </span>
        </li>
        <li className="p-3 text-center text-xl text-main-color border-2 border-sub-color mx-[10%] rounded-full">사용처 추가
          +
        </li>
      </ul>
      <div className="fixed flex justify-around max-w-xl bottom-10 w-full">
        <button onClick={() => goHome()}
             className="px-1 py-2 w-32 text-2xl border-[6px] bg-main-bg border-main-color rounded-lg">
          뒤로가기
        </button>
        <button className="px-1 py-2 w-32 text-2xl bg-main-color text-white rounded-lg">저장</button>
      </div>
    </Motion.div>
  )
}

export default MoneyDetails;