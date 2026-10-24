// 공통적으로 사용되는 제약 조건
const LIMITS = {

  /** 10 */
  NAME: 10,

  /** 15 */
  CODE: 15,
};

// 입력란 관련 메시지 (Placeholders)
export const PLACEHOLDERS = {
  /** 모임 제목을 입력하세요.*/
  MEET_NAME: "모임 제목을 입력하세요.",

  /** 입장 코드를 입력하세요.*/
  ENTER_CODE: "입장 코드를 입력하세요.",

  /** 입장 시 필요한 코드입니다.*/
  NEED_IN: "입장 시 필요한 코드입니다.",

  /** 내역 수정 시 필요합니다.*/
  NEED_EDIT: "내역 수정 시 필요합니다.",

  /** 수정 코드를 입력해주세요*/
  EDIT_CODE: "수정 코드를 입력해주세요",


  // 에러 발생 시 교체용

   /** 모임 제목이 비었습니다.*/
  EMPTY_NAME: "모임 제목이 비었습니다.",

   /** 코드가 비었습니다.*/
  EMPTY_CODE: "코드가 비었습니다.",

};

// 에러 알림 메시지 (Errors)
export const ERRORS = {

  /** 이미 사용 중인 이름입니다. */
  DUPLICATED_NAME: "이미 사용 중인 이름입니다.",

  /** 이미 사용 중인 코드입니다. */
  DUPLICATED_CODE: "이미 사용 중인 코드입니다.",

  /** 존재하지 않는 코드입니다. */
  INVALID_CODE: "존재하지 않는 코드입니다.",

  /** 수정 코드가 틀렸습니다. */
  WRONG_EDIT_CODE: "수정 코드가 틀렸습니다.",

  /** 이름은 ${LIMITS.NAME}자 이내여야 합니다. */
  LIMIT_NAME: `이름은 ${LIMITS.NAME}자 이내여야 합니다.`,

  /** 코드는 ${LIMITS.CODE}자 이내여야 합니다. */
  LIMIT_CODE: `코드는 ${LIMITS.CODE}자 이내여야 합니다.`,

  /** 변경 사항이 없습니다. */
  EXCLUDE_SAME: "변경 사항이 없습니다.",

  /** 전원 제외는 불가능합니다. */
  EXCLUDE_FULL: "전원 제외는 불가능합니다.",

  /** 데이터 저장에 실패했습니다. */
  SAVE_FAILED: "데이터 저장에 실패했습니다.",
};

// 저장 전 검증 메시지 (Save Validation)
export const SAVE_ERRORS = {

  /** 저장할 수 없습니다. */
  TITLE: "저장할 수 없습니다.",

  /** [장소] 세부 항목 합계(N원)가 장소 총액(N원)보다 큽니다. ... */
  DETAILS_OVER_TOTAL: (placeName: string, detailsSum: number, totalPrice: number) =>
    `[${placeName}] 세부 항목 합계(${detailsSum.toLocaleString()}원)가 장소 총액(${totalPrice.toLocaleString()}원)보다 큽니다. 세부 합계를 장소 총액에 맞춰 수정해주세요.`,

  /** 이름이 입력된 참여자가 없습니다. ... */
  NO_NAMED_PARTICIPANT: "이름이 입력된 참여자가 없습니다. 참여자 이름을 먼저 입력해주세요.",

  /** [장소] 비용을 나눌 참여자가 없습니다. ... */
  NO_PLACE_PARTICIPANT: (placeName: string) =>
    `[${placeName}] 비용을 나눌 참여자가 없습니다. 장소 제외 인원을 확인해주세요.`,

  /** [장소 > 항목] 금액이 있는데 비용을 나눌 참여자가 없습니다. ... */
  NO_ITEM_PARTICIPANT: (placeName: string, itemName: string) =>
    `[${placeName} > ${itemName}] 금액이 있는데 비용을 나눌 참여자가 없습니다. 제외 인원을 확인해주세요.`,

  /** 금액 N원인 장소에 이름이 없습니다. ... */
  UNNAMED_PLACE: (price: number) =>
    `금액 ${price.toLocaleString()}원인 장소에 이름이 없습니다. 장소 이름을 입력해주세요.`,

  /** [장소] 금액 N원인 세부 항목에 이름이 없습니다. ... */
  UNNAMED_ITEM: (placeName: string, price: number) =>
    `[${placeName}] 금액 ${price.toLocaleString()}원인 세부 항목에 이름이 없습니다. 항목 이름을 입력해주세요.`,

  /** (외 N건) */
  MORE: (count: number) => `(외 ${count}건)`,
};

// 수정 중 나가기 (Leave Edit)
export const LEAVE_EDIT = {

  /** 저장하지 않고 나가기 */
  DISCARD: "저장하지 않고 나가기",

  /** 계속 수정 */
  KEEP_EDIT: "계속 수정",
};

// 정산 표시 문구 (Settlement Labels)
export const SETTLE_LABELS = {

  /** 장소 전체 */
  PLACE_ALL: "장소 전체",

  /** ※ 미분류 잔액 */
  REMAINDER: "※ 미분류 잔액",

  /** 세부 항목 (이름 빈 세부 항목 표시용) */
  UNNAMED_ITEM: "세부 항목",

  /** 이름 없는 장소 (검증 문구용) */
  UNNAMED_PLACE: "이름 없는 장소",
};

// 성공 메시지 (Success)
export const SUCCESS = {

  /** 모임이 생성되었습니다. */
  CREATE: "모임이 생성되었습니다.",

  /** 데이터 업데이트 완료! */
  UPDATE: "데이터 업데이트 완료!",
};

// 모드 및 기타
export const MODES = {

  /** 기본 모드 */
  NORMAL: "기본 모드",

  /** 수정 모드 */
  EDIT: "수정 모드",

  /** 수정을 종료하시겠습니까? */
  EDIT_COMPLETE: "수정을 계속하시겠어요?",
};