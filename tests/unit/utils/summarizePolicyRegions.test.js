import { describe, expect, it } from 'vitest';

import { summarizePolicyRegions } from '@/utils/summarizePolicyRegions';

const SEOUL_SIGUNGU = [
  ['11110', '종로구'],
  ['11140', '중구'],
  ['11170', '용산구'],
  ['11200', '성동구'],
  ['11215', '광진구'],
  ['11230', '동대문구'],
  ['11260', '중랑구'],
  ['11290', '성북구'],
  ['11305', '강북구'],
  ['11320', '도봉구'],
  ['11350', '노원구'],
  ['11380', '은평구'],
  ['11410', '서대문구'],
  ['11440', '마포구'],
  ['11470', '양천구'],
  ['11500', '강서구'],
  ['11530', '구로구'],
  ['11545', '금천구'],
  ['11560', '영등포구'],
  ['11590', '동작구'],
  ['11620', '관악구'],
  ['11650', '서초구'],
  ['11680', '강남구'],
  ['11710', '송파구'],
  ['11740', '강동구'],
];

const SIDO_REGIONS = [
  {
    sidoCode: '11',
    sidoName: '서울특별시',
    sigungu: SEOUL_SIGUNGU.map(([code, name]) => ({ code, name })),
  },
  {
    sidoCode: '36',
    sidoName: '세종특별자치시',
    sigungu: [{ code: '36110', name: '세종특별자치시' }],
  },
  {
    sidoCode: '41',
    sidoName: '경기도',
    sigungu: [
      { code: '41131', name: '성남시 수정구' },
      { code: '41133', name: '성남시 중원구' },
      { code: '41135', name: '성남시 분당구' },
    ],
  },
];

const seoul = (name) => {
  const [code] = SEOUL_SIGUNGU.find(([, sigunguName]) => sigunguName === name);

  return { region_code: code, region_name: `서울특별시 ${name}` };
};

const ALL_SEOUL = SEOUL_SIGUNGU.map(([, name]) => seoul(name));
const BUNDANG = { region_code: '41135', region_name: '경기도 성남시 분당구' };
const GANGNAM_CODE = '11680';

const summarize = (regions, options = {}) =>
  summarizePolicyRegions({
    regions,
    nationwide: false,
    memberRegionCode: GANGNAM_CODE,
    sidoRegions: SIDO_REGIONS,
    ...options,
  }).label;

describe('summarizePolicyRegions', () => {
  describe('회원이 서울특별시 강남구에 살 때', () => {
    it('서울 25개 구 전체는 시·도 이름 하나로 묶는다', () => {
      expect(summarize(ALL_SEOUL)).toBe('서울특별시');
    });

    it('회원 지역을 포함하면 회원 지역을 첫 단위로 둔다', () => {
      expect(summarize([seoul('서초구'), seoul('강남구'), seoul('송파구')])).toBe(
        '서울특별시 강남구 외 2개',
      );
    });

    it('회원 지역이 없는 정책은 지역 코드 순서의 첫 단위를 쓴다', () => {
      expect(summarize([seoul('송파구'), seoul('서초구')])).toBe('서울특별시 서초구 외 1개');
    });

    it('시·도로 묶은 뒤 남은 단위를 센다', () => {
      expect(summarize([...ALL_SEOUL, BUNDANG])).toBe('서울특별시 외 1개');
    });
  });

  it('비회원은 지역 코드 순서의 첫 단위를 쓴다', () => {
    expect(
      summarize([seoul('송파구'), seoul('강남구'), seoul('서초구')], { memberRegionCode: null }),
    ).toBe('서울특별시 서초구 외 2개');
  });

  it('회원 지역이 시·도로 묶은 단위에 속하면 그 단위를 첫 단위로 둔다', () => {
    expect(summarize([...ALL_SEOUL, BUNDANG], { memberRegionCode: '41135' })).toBe(
      '경기도 성남시 분당구 외 1개',
    );
  });

  it('전국 정책은 "전국"으로 보여 준다', () => {
    expect(
      summarizePolicyRegions({
        regions: [],
        nationwide: true,
        memberRegionCode: GANGNAM_CODE,
        sidoRegions: SIDO_REGIONS,
      }),
    ).toEqual({ label: '전국', regionLabels: [] });
  });

  it('지역이 1개면 그대로 보여 준다', () => {
    expect(summarize([seoul('마포구')])).toBe('서울특별시 마포구');
  });

  it('코드표가 없으면 시·도로 묶지 않고 개수만 줄인다', () => {
    expect(summarize(ALL_SEOUL, { sidoRegions: [] })).toBe('서울특별시 강남구 외 24개');
    expect(summarize(ALL_SEOUL, { sidoRegions: [], memberRegionCode: null })).toBe(
      '서울특별시 종로구 외 24개',
    );
  });

  it('시·도의 시군구 일부만 포함하면 묶지 않는다', () => {
    expect(summarize(ALL_SEOUL.slice(1))).toBe('서울특별시 강남구 외 23개');
  });

  it('코드표에 남은 시·도 행(11000)은 전체 판별에서 뺀다', () => {
    const sidoRegions = [
      {
        ...SIDO_REGIONS[0],
        sigungu: [{ code: '11000', name: '서울 전체' }, ...SIDO_REGIONS[0].sigungu],
      },
    ];

    expect(summarize(ALL_SEOUL, { sidoRegions })).toBe('서울특별시');
  });

  it('시군구가 하나뿐인 시·도(세종)는 묶지 않는다', () => {
    expect(summarize([{ region_code: '36110', region_name: '세종특별자치시' }])).toBe(
      '세종특별자치시',
    );
  });

  it('툴팁용 전체 목록은 묶은 단위를 지역 코드 순서로 돌려준다', () => {
    expect(
      summarizePolicyRegions({
        regions: [BUNDANG, ...ALL_SEOUL],
        memberRegionCode: '41135',
        sidoRegions: SIDO_REGIONS,
      }).regionLabels,
    ).toEqual(['서울특별시', '경기도 성남시 분당구']);
  });

  it('지역이 없으면 빈 문자열을 돌려준다', () => {
    expect(summarize([])).toBe('');
  });
});
