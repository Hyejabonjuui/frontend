import AppIcon from '@/components/common/AppIcon';
import FieldError from '@/components/common/FieldError';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import SubtypeChip from '@/components/common/SubtypeChip';
import { POLICY_SEARCH_HASHTAGS, SEARCH_KEYWORD_MAX_LENGTH } from '@/constants/policy';
import { LAYOUT } from '@/styles/theme';

/**
 * onRequestLogin을 받으면 검색은 잠긴 상태다. 입력도 막고 로그인 안내 창만 띄운다.
 * isCompact는 추천 결과(S-05)처럼 결과 바로 위에 두는 작은 검색창이다.
 * 높이를 줄이고, 오류 문구 자리와 해시태그 바로가기를 두지 않는다.
 */
function PolicySearchBar({
  keyword,
  onKeywordChange,
  onSubmit,
  errorMessage,
  onRequestLogin,
  isCompact = false,
}) {
  const isLocked = Boolean(onRequestLogin);
  const emptyHelperText = isCompact ? undefined : ' ';

  const requestSearch = (searchKeyword) => {
    if (isLocked) {
      onRequestLogin();
      return;
    }

    onSubmit(searchKeyword);
  };

  // 백엔드는 "#월세"처럼 #까지 같은 검색어만 AI 없이 유형으로 찾는다.
  const handleHashtagClick = (hashtag) => {
    const hashtagKeyword = `#${hashtag}`;

    if (!isLocked) {
      onKeywordChange(hashtagKeyword);
    }

    requestSearch(hashtagKeyword);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    requestSearch(keyword);
  };

  /**
   * 잠금 상태에서는 입력칸에 포커스가 가지 않게 막는다.
   * 포커스가 남으면 안내 창이 닫힐 때 포커스가 되돌아오면서 안내 창이 다시 열린다.
   */
  const handleLockedMouseDown = isLocked
    ? (event) => {
        event.preventDefault();
        onRequestLogin();
      }
    : undefined;

  return (
    <Stack
      component="form"
      spacing={1.5}
      onSubmit={handleSubmit}
      sx={{ alignItems: 'center', width: '100%' }}
    >
      <TextField
        value={keyword}
        onChange={(event) =>
          onKeywordChange(event.target.value.slice(0, SEARCH_KEYWORD_MAX_LENGTH))
        }
        onMouseDown={handleLockedMouseDown}
        placeholder="예: 월세 지원 알려줘"
        error={Boolean(errorMessage)}
        helperText={errorMessage ? <FieldError>{errorMessage}</FieldError> : emptyHelperText}
        size={isCompact ? 'small' : 'medium'}
        fullWidth
        sx={{
          maxWidth: LAYOUT.searchColumnWidth,
          '& .MuiOutlinedInput-root': { borderRadius: 999, pr: 0.5 },
          '& .MuiInputAdornment-root .MuiTypography-root': { display: { xs: 'none', sm: 'block' } },
        }}
        slotProps={{
          htmlInput: {
            maxLength: SEARCH_KEYWORD_MAX_LENGTH,
            'aria-label': '정책 검색',
            readOnly: isLocked,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="caption" color="text.disabled" sx={{ mr: 1 }}>
                  {keyword.length} / {SEARCH_KEYWORD_MAX_LENGTH}
                </Typography>
                <IconButton
                  type="submit"
                  color="primary"
                  size={isCompact ? 'small' : 'medium'}
                  aria-label="검색"
                  sx={{ bgcolor: 'primary.main' }}
                >
                  <AppIcon name="search" size={isCompact ? 18 : 20} sx={{ color: '#0b1626' }} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {!isCompact && (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {POLICY_SEARCH_HASHTAGS.map((hashtag) => (
            <SubtypeChip
              key={hashtag}
              label={`#${hashtag}`}
              onClick={() => handleHashtagClick(hashtag)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default PolicySearchBar;
