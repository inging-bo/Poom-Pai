import { motion as Motion } from "framer-motion";
import { useState } from "react";

function MakeMoneyDetails() {
  const goHome = () => {
    setOpenModal(false)
  }
  
  const [openModal, setOpenModal] = useState(false)
  
  const makeDetails = () => {
    setOpenModal(true)
  }
  
  return (
    <Motion.div
      className={`
      ${openModal ? "" : "justify-start cursor-pointer"}
      fixed flex flex-col max-w-2xl gap-5 overflow-hidden rounded-lg`}
      initial={false}
      animate={openModal ? "open" : "closed"}
      variants={{
        open  : {
          width          : "85%",
          top            : "30%",
          height         : "300px",
          lineHeight     : "inherit",
          backgroundColor: "var(--color-main-bg)",
          transition     : {
            width          : { duration: 0.3, delay: 0.2 },
            height         : { duration: 0.2, delay: 0.3 },
            top            : { duration: 0.3 },
            backgroundColor: { duration: 0.1, delay: 0.3 },
          },
        },
        closed: {
          width          : "200px",
          top            : "85%",
          height         : "50px",
          minHeight      : "unset",
          lineHeight     : "50px",
          backgroundColor: "var(--color-active-color)",
          transition     : {
            width : { duration: 0.3 },
            height: { duration: 0.3 },
            top   : { duration: 0.3, delay: 0.3 }
          },
        }
      }}
    >
      {/* 모임 제목 */}
      <div className="flex flex-col gap-4">
        <Motion.h2
          onClick={() => makeDetails()}
          initial={false}
          animate={openModal ? "open" : "closed"}
          variants={{
            open  : {
              fontSize  : "1.875rem",
              color     : "var(--color-main-text)",
              transition: {
                color: { delay: 0.3 }
              },
            },
            closed: {
              fontSize  : "1.275rem",
              color     : "#ffffff",
              transition: {},
            }
          }}
          className="text-main-text text-center">모임 {openModal ? "제목" : "등록 +"}
        </Motion.h2>
        <Motion.input
          initial={false}
          animate={openModal ? "open" : "closed"}
          variants={{
            open  : {
              opacity   : 1,
              y         : "-15%",
              transition: {
                duration: 0.3, delay: 0.3
              },
            },
            closed: {
              opacity   : 0,
              y         : 0,
              transition: {
                duration: 0.3
              },
            }
          }}
          className="h-14 text-xl text-main-text placeholder:text-sub-color placeholder:text-lg placeholder:font-money border-[6px] px-2 border-main-color rounded-lg"
          type="text" id="" name="name" minLength="8" placeholder="모임 제목을 입력하세요" required/>
      </div>
      {/* 입장 코드 */}
      <Motion.div
        initial={false}
        animate={openModal ? "open" : "closed"}
        variants={{
          open  : {
            opacity   : 1,
            y         : "-15%",
            transition: {
              duration: 0.3, delay: 0.3
            },
          },
          closed: {
            opacity   : 0,
            y         : 0,
            transition: {
              duration: 0.3
            },
          }
        }}
        className="flex items-center gap-2"
      >
        <h2 className="text-main-text text-2xl">입장 코드</h2>
        <input
          className="flex-1 w-full text-main-text placeholder:text-sub-color placeholder:font-money border-[6px] h-14 px-2 border-main-color rounded-lg"
          inputMode="numeric" pattern="[0-9]*" minLength="8" placeholder="코드 입력" required/>
      </Motion.div>
      {/* 버튼 */}
      <Motion.div
        initial={false}
        animate={openModal ? "open" : "closed"}
        variants={{
          open  : {
            opacity   : 1,
            y         : "-15%",
            transition: {
              duration: 0.3, delay: 0.3
            },
          },
          closed: {
            opacity   : 0,
            y         : 0,
            transition: {
              duration: 0.3
            },
          }
        }}
        className="text-main-text flex justify-between"
      >
        <button className="px-1 py-2 w-32 text-2xl border-[6px] border-main-color rounded-lg"
                onClick={() => goHome()}>등록 취소
        </button>
        <button className="px-1 py-2 w-32 text-2xl bg-main-color text-white rounded-lg">등록</button>
      </Motion.div>
    </Motion.div>
  )
}

export default MakeMoneyDetails;