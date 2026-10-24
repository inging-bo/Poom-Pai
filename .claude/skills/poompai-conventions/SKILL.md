---
name: poompai-conventions
description: "Poom-Pai 프로젝트의 구조, 용어 컨벤션, 기술 스택, 정산 로직 주의점, 검증 명령을 정리한 참조 스킬. poompai-architect·developer·qa 에이전트가 작업 전에 읽는다. Poom-Pai 코드를 수정·설계·검토할 때 사용한다."
---

# Poom-Pai 프로젝트 규칙

## 스택과 구조
- React 19, Vite 7, TypeScript, Zustand, Firebase Firestore(`MeetList` 컬렉션), Tailwind v4, framer-motion, lucide-react. 배포는 Firebase Hosting(GitHub Actions).
- `src/view` 화면(Home, CreateMeet, SettlementDetail, CustomKeypad), `src/modal` 모달(ModalManager가 `store/modalStore`로 관리), `src/component`·`src/ui` 재사용 조각, `src/store/useDataStore.ts` 모든 모임 데이터와 정산 셀렉터, `src/hooks` 기기·탭 훅, `src/constant/contant.ts` 문구·제한값.
- 경로 별칭 `@/` = `src/`. 라우트는 `src/router/router.tsx`.

## 용어 컨벤션 (README 기준)
모임 `meetTitle`/`meetEntryCode`/`meetEditCode`, 유저 `userId`/`userName`, 선입금 `upFrontPayment`(코드 기준 표기), 장소 `placeId`/`placeName`/`placeTotalPrice`/`placeDetails`/`placeExcludeUser`, 세부 `placeItemId`/`placeItemName`/`placeItemPrice`/`placeItemExcludeUser`. 새 필드도 이 접두 규칙을 따른다. 필드를 바꾸면 README 용어 목록도 갱신한다.

## 정산 로직 주의점
`getTotals`, `getBalances`, `getUserExpenseDetails`는 (1) 장소 제외 인원, (2) 세부 항목 제외 인원, (3) 세부 합계와 장소 총액의 차이(미분류 잔액), (4) 이름이 빈 참가자 제외로 이루어진다. 참여자 0명일 때 나눗셈이 발생하지 않는지 항상 확인한다.

## 편집 모드와 로컬 모드
`isEdit`, `isLocal`, `dbData`(저장 전 원본), `cancelEdit`이 얽혀 있다. 수정 취소 시 `dbData`로 복원되는지 확인한다.

## 검증 명령
`npm run lint`, `npx tsc -b`, `npm run build`. 테스트 러너는 없다.

## 하지 않는 것
`firebase.ts`의 설정값, `.firebaserc`, `dist/`, `pglite-debug.log`는 수정하지 않는다.
