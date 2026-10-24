import type { Person, UseHistory, UseHistoryDetails, UserExpenseDetail } from "@/store/useDataStore.ts";
import { SAVE_ERRORS, SETTLE_LABELS } from "@/constant/contant.ts";

/*
 정산 계산 순수 함수 모음
 - React/Zustand/Firebase에 의존하지 않고 people, history 배열만 받는다.
 - 스토어 셀렉터(getTotals, getBalances, getUserExpenseDetails)와 화면이 같은 규칙을 공유하도록 여기서만 계산한다.
 - 스토어 타입은 import type으로만 가져온다. (값 import 시 런타임 순환 참조 발생)
 */

// --- 기본 헬퍼 ---

// 금액 변환 (숫자가 아니면 0)
export const toAmount = (value: unknown): number => Number(value) || 0;

// 이름이 있는 참여자인지 (이름이 빈 참여자는 정산에서 제외)
export const isActivePerson = (p: Person): boolean => p.userName.trim() !== "";

// 이름이 있는 참여자 목록
export const getActivePeople = (people: Person[]): Person[] => people.filter(isActivePerson);

/** 장소 참여자 = 활성 인원 − 장소 제외 인원 */
export const getPlaceParticipants = (place: UseHistory, activePeople: Person[]): Person[] => {
  const placeExcludes = place.placeExcludeUser || [];
  return activePeople.filter(p => !placeExcludes.includes(p.userId));
};

/** 항목 참여자 = 장소 참여자 − 항목 제외 인원 */
export const getItemParticipants = (item: UseHistoryDetails, placeParticipants: Person[]): Person[] => {
  const itemExcludes = item.placeItemExcludeUser || [];
  return placeParticipants.filter(p => !itemExcludes.includes(p.userId));
};

/** 0명이면 0을 반환하는 n분의 1 (0 나누기 방지 단일 지점) */
export const splitEvenly = (amount: number, count: number): number =>
  count > 0 ? amount / count : 0;

/** 세부 항목 가격 합 */
export const getDetailsSum = (place: UseHistory): number =>
  (place.placeDetails || []).reduce((sum, d) => sum + toAmount(d.placeItemPrice), 0);

/** 장소 총액 − 세부 항목 합 (음수 가능) */
export const getPlaceRemainder = (place: UseHistory): number =>
  toAmount(place.placeTotalPrice) - getDetailsSum(place);

// --- 장소 배분 (getBalances / 상세 내역의 단일 원천) ---

export type AllocationKind = "place" | "item" | "remainder";

export interface Allocation {
  kind: AllocationKind; // 장소 전체 / 세부 항목 / 미분류 잔액
  placeId: string;
  placeName: string;
  itemId: string | null; // kind === "item"일 때만
  itemName: string; // 표시용 문구
  totalAmount: number; // 이 행의 전체 금액 (장소 총액 / 항목 가격 / 잔액)
  participantIds: string[]; // 이 금액을 나눠 내는 사람
  perPerson: number; // 1인당 부담액
}

/**
 한 장소를 배분 행 목록으로 변환. 참여자 0명 행은 만들지 않는다.
 1. 장소 참여자 0명 → 배분 없음
 2. 세부 항목 없음 → 장소 총액을 장소 참여자 전원이 n분의 1
 3. 세부 항목 있음 → 항목 참여자가 있는 항목만 항목 참여자끼리 n분의 1,
    남은 금액(장소 총액 − 배분된 항목 합)이 0보다 크면 장소 참여자 전원이 n분의 1
 */
export const allocatePlace = (place: UseHistory, activePeople: Person[]): Allocation[] => {
  const placeParticipants = getPlaceParticipants(place, activePeople);
  if (placeParticipants.length === 0) return [];

  const placeParticipantIds = placeParticipants.map(p => p.userId);
  const placeTotalPrice = toAmount(place.placeTotalPrice);
  const details = place.placeDetails || [];

  // 일반 모드: 장소 전체 N분의 1
  if (details.length === 0) {
    return [{
      kind: "place",
      placeId: place.placeId,
      placeName: place.placeName,
      itemId: null,
      itemName: SETTLE_LABELS.PLACE_ALL,
      totalAmount: placeTotalPrice,
      participantIds: placeParticipantIds,
      perPerson: splitEvenly(placeTotalPrice, placeParticipantIds.length)
    }];
  }

  const allocations: Allocation[] = [];
  let allocatedDetailsPrice = 0;

  // 세부 항목별 정산 (고기, 술 등 특정 인원만 먹은 것)
  details.forEach(item => {
    const itemParticipants = getItemParticipants(item, placeParticipants);
    // 항목 참여자가 없으면 배분하지 않고, 그 금액은 미분류 잔액으로 넘어간다
    if (itemParticipants.length === 0) return;

    const price = toAmount(item.placeItemPrice);
    allocatedDetailsPrice += price;

    allocations.push({
      kind: "item",
      placeId: place.placeId,
      placeName: place.placeName,
      itemId: item.placeItemId,
      itemName: item.placeItemName || SETTLE_LABELS.UNNAMED_ITEM,
      totalAmount: price,
      participantIds: itemParticipants.map(p => p.userId),
      perPerson: splitEvenly(price, itemParticipants.length)
    });
  });

  // 미분류 잔액 정산 (장소 전체 금액 - 세부 항목 합계)
  // 예: 10만원 결제했는데 세부내역은 8만원만 적었다면, 남은 2만원은 해당 장소 참여자 전원이 1/n
  // 잔액이 0보다 클 때만 정산 (세부 항목 합계가 전체 금액을 초과하는 경우 방지)
  const remaining = placeTotalPrice - allocatedDetailsPrice;
  if (remaining > 0) {
    allocations.push({
      kind: "remainder",
      placeId: place.placeId,
      placeName: place.placeName,
      itemId: null,
      itemName: SETTLE_LABELS.REMAINDER,
      totalAmount: remaining,
      participantIds: placeParticipantIds,
      perPerson: splitEvenly(remaining, placeParticipantIds.length)
    });
  }

  return allocations;
};

/** 전체 장소 배분 (장소 순서 → 항목 순서 → 잔액 순서 유지) */
export const allocateHistory = (people: Person[], history: UseHistory[]): Allocation[] => {
  const activePeople = getActivePeople(people);
  return history.flatMap(place => allocatePlace(place, activePeople));
};

// --- 공개 계산 함수 (스토어 셀렉터가 호출) ---

/** 총 경비 / 총 사용 / 남은 금액 */
export const calculateTotals = (people: Person[], history: UseHistory[]) => {
  // 총 경비: 사람들이 낸 선입금의 총합
  const totalMoney = people.reduce((acc, cur) => acc + toAmount(cur.upFrontPayment), 0);

  // 총 사용 금액: 각 장소의 placeTotalPrice 총합
  const totalUse = history.reduce((acc, place) => acc + toAmount(place.placeTotalPrice), 0);

  return { totalMoney, totalUse, haveMoney: totalMoney - totalUse };
};

/** 사람별 부담액 (선입금 미반영, 부담이 배분된 사람만 키를 가진다) */
export const calculateBalances = (people: Person[], history: UseHistory[]): Record<string, number> => {
  const balances: Record<string, number> = {};

  allocateHistory(people, history).forEach(allocation => {
    allocation.participantIds.forEach(userId => {
      balances[userId] = (balances[userId] || 0) + allocation.perPerson;
    });
  });

  return balances;
};

/** 특정 사용자의 상세 지출 내역 (calculateBalances와 같은 배분 행에서 파생) */
export const calculateUserExpenseDetails = (
  people: Person[],
  history: UseHistory[],
  userId: string
): UserExpenseDetail[] => {
  const targetPerson = people.find(p => p.userId === userId);
  if (!targetPerson || !isActivePerson(targetPerson)) return [];

  return allocateHistory(people, history)
    .filter(allocation => allocation.participantIds.includes(userId))
    .map(allocation => ({
      placeName: allocation.placeName,
      itemName: allocation.itemName,
      amount: allocation.perPerson,
      kind: allocation.kind,
      placeId: allocation.placeId,
      itemId: allocation.itemId,
      totalAmount: allocation.totalAmount
    }));
};

/**
 뿜빠이 = 부담액 − 선입금 (부호 규약의 단일 정의)
 - 양수: 더 내야 할 돈
 - 음수: 돌려받을 돈
 - Participant 카드와 ModalDetail 하단 합계가 모두 이 함수를 쓴다.
 */
export const calculateSettleAmount = (person: Person, balances: Record<string, number>): number =>
  Math.round(balances[person.userId] || 0) - toAmount(person.upFrontPayment);

// --- 저장 전 검증 ---

/** 이름도 금액도 없는 빈 세부 항목인지 (저장 시 정리 대상) */
export const isEmptyDetail = (item: UseHistoryDetails): boolean =>
  item.placeItemName.trim() === "" && toAmount(item.placeItemPrice) === 0;

/** 장소 금액 (장소 총액, 세부 합계 중 큰 값) */
const getPlaceAmount = (place: UseHistory): number =>
  Math.max(toAmount(place.placeTotalPrice), getDetailsSum(place));

/** 이름도 금액도 없는 빈 장소인지 (저장 시 정리 대상) */
export const isEmptyPlace = (place: UseHistory): boolean =>
  place.placeName.trim() === "" && getPlaceAmount(place) === 0;

/** 금액이 있는데 항목 참여자가 0명인 세부 항목 (장소 참여자 기준) */
export const getUnsplittableItems = (place: UseHistory, activePeople: Person[]): UseHistoryDetails[] => {
  const placeParticipants = getPlaceParticipants(place, activePeople);
  return (place.placeDetails || []).filter(item =>
    toAmount(item.placeItemPrice) > 0 && getItemParticipants(item, placeParticipants).length === 0
  );
};

/**
 저장 전 검증. 문제가 있으면 문구 목록을 반환한다(빈 배열이면 저장 가능).
 빈 장소/빈 세부 항목(이름도 금액도 없음)은 저장 시 정리되므로 검사하지 않는다.
 1. 금액이 있는데 이름이 없는 장소 / 세부 항목
 2. 세부 항목 합계 > 장소 총액
 3. 장소 참여자 0명 (제외 인원, 이름 빈 참여자 제외)
 4. 금액이 있는데 항목 참여자가 0명인 세부 항목
 이름이 있는 참여자가 아예 없으면 3, 4 대신 참여자 이름 입력 안내를 한 번만 맨 앞에 넣는다.
 */
export const validateHistoryForSave = (people: Person[], history: UseHistory[]): string[] => {
  const activePeople = getActivePeople(people);
  const issues: string[] = [];

  // 0. 이름 있는 참여자가 한 명도 없음 (장소 제외 인원 문제가 아님)
  const noNamedParticipant = activePeople.length === 0;
  if (noNamedParticipant && history.some(place => !isEmptyPlace(place))) {
    issues.push(SAVE_ERRORS.NO_NAMED_PARTICIPANT);
  }

  history.forEach(place => {
    if (isEmptyPlace(place)) return;

    const placeName = place.placeName.trim() || SETTLE_LABELS.UNNAMED_PLACE;
    const details = (place.placeDetails || []).filter(item => !isEmptyDetail(item));

    // 1. 이름 없는 금액 장소 / 세부 항목
    if (place.placeName.trim() === "") {
      issues.push(SAVE_ERRORS.UNNAMED_PLACE(getPlaceAmount(place)));
    }
    details.forEach(item => {
      if (item.placeItemName.trim() === "") {
        issues.push(SAVE_ERRORS.UNNAMED_ITEM(placeName, toAmount(item.placeItemPrice)));
      }
    });

    // 2. 세부 합계 > 장소 총액
    const detailsSum = getDetailsSum(place);
    const placeTotalPrice = toAmount(place.placeTotalPrice);
    if (detailsSum > placeTotalPrice) {
      issues.push(SAVE_ERRORS.DETAILS_OVER_TOTAL(placeName, detailsSum, placeTotalPrice));
    }

    // 참여자 이름이 없으면 0번 문구로 대신한다
    if (noNamedParticipant) return;

    // 3. 장소 참여자 0명 (이 경우 항목 검사는 중복이므로 생략)
    if (getPlaceParticipants(place, activePeople).length === 0) {
      issues.push(SAVE_ERRORS.NO_PLACE_PARTICIPANT(placeName));
      return;
    }

    // 4. 금액이 있는데 항목 참여자 0명
    getUnsplittableItems(place, activePeople).forEach(item => {
      issues.push(SAVE_ERRORS.NO_ITEM_PARTICIPANT(placeName, item.placeItemName.trim() || SETTLE_LABELS.UNNAMED_ITEM));
    });
  });

  return issues;
};

/** 저장 전 검증 실패 (issues: 문구 목록, message: 첫 문구 + 나머지 건수) */
export class SaveValidationError extends Error {
  issues: string[];

  constructor(issues: string[]) {
    const more = issues.length > 1 ? ` ${SAVE_ERRORS.MORE(issues.length - 1)}` : "";
    super(`${issues[0] ?? ""}${more}`);
    this.name = "SaveValidationError";
    this.issues = issues;
  }
}
