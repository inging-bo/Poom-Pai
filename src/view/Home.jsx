import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate()
  const goList = () => {
    navigate('/money-details')
  }
  const makeDetails = () => {
    navigate('/make-money-details')
  }
  
  return  (
    <>
      <div className="relative min-h-screen w-screen max-w-xl my-0 mx-auto flex justify-center items-center">
        <div className="flex flex-col">
          <label htmlFor="pass">모임 코드 입력</label>
          <input type="password" id="pass" name="password" minLength="8" required/>
        </div>
        <input onClick={() => goList()} type="submit" value="Sign in"/>
        <div onClick={() => makeDetails()} className="absolute right-10 bottom-10">
          모임 추가 통장
        </div>
      </div>
    </>
  )
}

export default Home;