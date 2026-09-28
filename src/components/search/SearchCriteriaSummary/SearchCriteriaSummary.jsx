import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * 설계서 S-05: 검색창 바로 아래에 이번 검색의 유형과 판정에 쓴 내 조건을 한 줄로 보여 준다.
 * typeLabel은 해시태그 검색처럼 유형을 확실히 알 때만 준다. 자유 문장은 AI가 고른 유형을 응답에 주지 않는다.
 */
function SearchCriteriaSummary({ typeLabel, conditions, action }) {
  if (!typeLabel && conditions.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      {typeLabel && <Chip label={typeLabel} variant="outlined" size="small" />}

      {conditions.length > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
        >
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
            적용된 내 조건:
          </Box>{' '}
          {conditions.join(' · ')}
        </Typography>
      )}

      {action}
    </Stack>
  );
}

export default SearchCriteriaSummary;
