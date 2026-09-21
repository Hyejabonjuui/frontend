/** GET /api/codes 응답. 설계서 S-04의 선택지 정의를 따른다. */
export const REGION_CODES = [
  {
    sidoCode: '11',
    sidoName: '서울특별시',
    sigungu: [
      { code: '11000', name: '서울 전체' },
      { code: '11440', name: '마포구' },
      { code: '11680', name: '강남구' },
      { code: '11200', name: '성동구' },
      { code: '11305', name: '강북구' },
    ],
  },
  {
    sidoCode: '41',
    sidoName: '경기도',
    sigungu: [
      { code: '41000', name: '경기 전체' },
      { code: '41135', name: '성남시 분당구' },
      { code: '41285', name: '고양시 덕양구' },
      { code: '41110', name: '수원시' },
    ],
  },
  {
    sidoCode: '26',
    sidoName: '부산광역시',
    sigungu: [
      { code: '26000', name: '부산 전체' },
      { code: '26440', name: '강서구' },
      { code: '26230', name: '부산진구' },
    ],
  },
];

export const EMPLOYMENT_CODES = [
  { code: 'EMPLOYED', name: '재직 중' },
  { code: 'JOB_SEEKING', name: '구직 중' },
  { code: 'STUDENT', name: '학생' },
  { code: 'ETC', name: '기타' },
];

export const MARRIAGE_CODES = [
  { code: 'SINGLE', name: '미혼' },
  { code: 'MARRIED', name: '기혼' },
];

export const INCOME_RANGE_CODES = [
  { code: 'UNDER_2000', name: '2,000만 원 미만', medianRatio: 50 },
  { code: 'R2000_3000', name: '2,000만 ~ 3,000만 원', medianRatio: 60 },
  { code: 'R3000_4000', name: '3,000만 ~ 4,000만 원', medianRatio: 80 },
  { code: 'R4000_5000', name: '4,000만 ~ 5,000만 원', medianRatio: 100 },
  { code: 'OVER_5000', name: '5,000만 원 이상', medianRatio: 130 },
];

export const EDUCATION_CODES = [
  { code: 'HIGH_SCHOOL', name: '고등학교 졸업' },
  { code: 'COLLEGE', name: '대학 재학' },
  { code: 'BACHELOR', name: '대학 졸업' },
  { code: 'GRADUATE', name: '대학원 이상' },
];

export const HOUSING_TYPE_CODES = [
  { code: 'PARENTS', name: '부모님 집' },
  { code: 'MONTHLY_RENT', name: '월세' },
  { code: 'JEONSE', name: '전세' },
  { code: 'OWNED', name: '자가' },
];

export const CODE_GROUPS = {
  regions: REGION_CODES,
  employments: EMPLOYMENT_CODES,
  marriages: MARRIAGE_CODES,
  incomeRanges: INCOME_RANGE_CODES,
  educations: EDUCATION_CODES,
  housingTypes: HOUSING_TYPE_CODES,
};
