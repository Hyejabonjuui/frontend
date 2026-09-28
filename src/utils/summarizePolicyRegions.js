const NATIONWIDE_LABEL = '전국';

const toSidoCode = (regionCode) => String(regionCode).slice(0, 2);

/** 예전 수집이 남긴 시·도 행(예: 11000)은 시군구가 아니므로 "전체" 판별에서 뺀다. */
const isSidoRegionCode = (regionCode) => String(regionCode).endsWith('000');

const findWholeSidoCodes = (regionCodes, sidoRegions) => {
  const includedCodes = new Set(regionCodes);

  return new Set(
    sidoRegions
      .filter((sido) => {
        const sigunguCodes = (sido.sigungu ?? [])
          .map((sigungu) => sigungu.code)
          .filter((code) => !isSidoRegionCode(code));

        return sigunguCodes.length > 1 && sigunguCodes.every((code) => includedCodes.has(code));
      })
      .map((sido) => sido.sidoCode),
  );
};

const buildRegionUnits = (regions, sidoRegions) => {
  const sortedRegions = [...regions].sort((first, second) =>
    String(first.region_code).localeCompare(String(second.region_code)),
  );
  const wholeSidoCodes = findWholeSidoCodes(
    sortedRegions.map((region) => region.region_code),
    sidoRegions,
  );
  const units = [];

  sortedRegions.forEach((region) => {
    const sidoCode = toSidoCode(region.region_code);

    if (!wholeSidoCodes.has(sidoCode)) {
      units.push({ label: region.region_name, regionCode: region.region_code, sidoCode: null });
      return;
    }

    if (units.some((unit) => unit.sidoCode === sidoCode)) {
      return;
    }

    const sido = sidoRegions.find((item) => item.sidoCode === sidoCode);
    units.push({ label: sido.sidoName, regionCode: null, sidoCode });
  });

  return units;
};

const containsRegion = (unit, regionCode) =>
  unit.sidoCode ? toSidoCode(regionCode) === unit.sidoCode : unit.regionCode === regionCode;

/**
 * 정책 대상 지역을 목록 한 칸에 들어가도록 요약한다.
 * 시·도의 시군구를 전부 포함하면 시·도 이름 하나로 묶고, 남은 단위가 여럿이면 "첫 단위 외 N개"로 줄인다.
 * 첫 단위는 회원 거주지를 포함한 단위를 우선하고, 없으면 지역 코드 순서를 따른다.
 */
export const summarizePolicyRegions = ({
  regions = [],
  nationwide = false,
  memberRegionCode = null,
  sidoRegions = [],
}) => {
  if (nationwide || regions.length === 0) {
    return { label: NATIONWIDE_LABEL, regionLabels: [] };
  }

  const units = buildRegionUnits(regions, sidoRegions);
  const regionLabels = units.map((unit) => unit.label);

  if (units.length === 1) {
    return { label: regionLabels[0], regionLabels };
  }

  const memberUnit = memberRegionCode
    ? units.find((unit) => containsRegion(unit, memberRegionCode))
    : null;
  const leadingUnit = memberUnit ?? units[0];

  return { label: `${leadingUnit.label} 외 ${units.length - 1}개`, regionLabels };
};
