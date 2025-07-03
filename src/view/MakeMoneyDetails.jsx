function makeMoneyDetails({ setOpenModal }) {
  const goHome = () => {
    setOpenModal(false)
  }
  
  return (
    <div className="flex flex-col p-5 w-full gap-4">
      {/* 모임 제목 */}
      <div className="flex flex-col gap-2">
        <h2 className="text-main-text text-3xl">모임 제목</h2>
        <input
          className="h-14 text-xl text-main-text placeholder:text-sub-color placeholder:text-lg placeholder:font-money border-[6px] px-2 border-main-color rounded-lg"
          type="text" id="" name="name" minLength="8" placeholder="모임 제목을 입력하세요" required/>
      </div>
      {/* 입장 코드 */}
      <div className="flex items-center gap-2">
        <h2 className="text-main-text text-2xl">입장 코드</h2>
        <input
          className="flex-1 w-full text-main-text placeholder:text-sub-color placeholder:font-money border-[6px] h-14 px-2 border-main-color rounded-lg"
          inputMode="numeric" pattern="[0-9]*" minLength="8" placeholder="코드 입력" required/>
      </div>
      {/* 버튼 */}
      <div className="text-main-text flex justify-between">
        <button className="px-1 py-2 w-32 text-2xl border-[6px] border-main-color rounded-lg"
                onClick={() => goHome()}>등록 취소
        </button>
        <button className="px-1 py-2 w-32 text-2xl bg-main-color text-white rounded-lg">등록</button>
      </div>
    </div>
  )
}

export default makeMoneyDetails;