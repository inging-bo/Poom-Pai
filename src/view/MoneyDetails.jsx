import { useNavigate } from "react-router-dom";

function MoneyDetails() {
  
  const navigate = useNavigate()
  
  const goHome = () => {
    navigate('/')
  }
  
  return (
    <>
      <div className="relative min-h-screen w-screen max-w-xl my-0 mx-auto flex flex-col justify-center items-center">
        <div className="flex bg-[#000000] text-white w-full sticky top-0 justify-between">
          <div>
            <div>
              총 경비
            </div>
            <div>
              1,000,000원
            </div>
          </div>
          <div>
            <div>
              남은 금액
            </div>
            <div>
              1,000,000원
            </div>
          </div>
        </div>
        <table className="border-2 border-black border-collapse">
          <thead>
          <tr>
            <th scope="col">참여자</th>
            <th scope="col">내야할 돈</th>
            <th scope="col">지불 금액</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>집</td>
            <td>HTML tables</td>
            <td>22</td>
          </tr>
          <tr>
            <td>어디</td>
            <td>Web accessibility</td>
            <td>45</td>
          </tr>
          <tr>
            <td>고기</td>
            <td>JavaScript frameworks</td>
            <td>29</td>
          </tr>
          <tr>
            <td>하이</td>
            <td>Web performance</td>
            <td>36</td>
          </tr>
          </tbody>
        </table>
        <table className="border-2 h-[1500px] border-black border-collapse">
          <thead>
          <tr>
            <th scope="col">사용처</th>
            <th scope="col">사용금액</th>
            <th scope="col">제외될 사람</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>집</td>
            <td>HTML tables</td>
            <td>22</td>
          </tr>
          <tr>
            <td>어디</td>
            <td>Web accessibility</td>
            <td>45</td>
          </tr>
          <tr>
            <td>고기</td>
            <td>JavaScript frameworks</td>
            <td>29</td>
          </tr>
          <tr>
            <td>하이</td>
            <td>Web performance</td>
            <td>36</td>
          </tr>
          </tbody>
        </table>
        <div className="fixed max-w-xl bottom-10 flex w-full justify-between">
          <div onClick={() => goHome()} className="border-2 border-black">뒤로가기</div>
          <div className="border-2 border-black">인원추가</div>
        </div>
      </div>
    </>
  )
}

export default MoneyDetails;