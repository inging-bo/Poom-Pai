# Poom-Pai

## 공동 가계부 서비스 Poom-Pai

- 모임에서 사용한 금액, 남은 금액 등을 확인 할 수 있습니다.
- 미리 예산을 정하고 사용하거나 
- 사용 금액에 대해 얼마씩 지출해야 하는지를 알 수 있습니다.

## 주요 기능

- 모임 등록
- 참여자 추가
- 선입금 금액 표시
- 참석자가 받아야 하는 금액 or 더 지출해야하는 금액 표시 (뿜빠이)
- 지출 내역 작성
- 각 지출 내역에 포함되지 않는 인원 제외 기능
- 각 사용 장소 세부 내역 별 인원 제외 가능

## 해야 할 일

- 삭제 버튼 추가 하기
- 각 사용자 클릭 시 사용 금액 자세히 보기 기능
- 수정 취소도 고려 해보기
- 모임 등록 UI 수정 등록 클릭 시 홈에서 변경 됨
- 수정 상태에서 뒤로 가면 수정 상태 유지되고 있다
- 참여자 지출 내역 스크롤 다르게 하기
- 이름 보냄정산결과 네이밍 수정
- 이름 등 위치 수정
- 모바일에서 탭 사용 하기\

## 용어 컨벤션

- 모임 제목 : meetTitle
- 입장 코드 : meetEntryCode
- 수정 코드 : meetEditCode

- 유저 ID : userId
- 유저 이름 : userName
- 선입금 : upfrontPayment
- 지출 내역 장소 ID : placeId
- 지출 내역 장소 이름 : placeName: string;
- 지출 내역 장소 총 사용 금액 : placeTotalPrice
- 지출 내역 장소 세부 내역 그릅 : placeDetails
- 지출 내역 별 제외 인원 : placeExcludeUser

  - 세부내역 ID : placeItemId
  - 세부내역 이름 : placeItemName
  - 세부내역 사용 금액 : placeItemPrice
  - 세부내역 제외 인원 : placeItemExcludeUser
