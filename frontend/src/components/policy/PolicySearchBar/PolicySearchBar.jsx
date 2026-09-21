import { Icon } from '@iconify/react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import SubtypeChip from '@/components/common/SubtypeChip';
import { POLICY_SEARCH_HASHTAGS, SEARCH_KEYWORD_MAX_LENGTH } from '@/constants/policy';

/** onRequestLogin을 받으면 검색은 잠긴 상태다. 입력도 막고 로그인 안내 창만 띄운다. */
function PolicySearchBar({ keyword, onKeywordChange, onSubmit, errorMessage, onRequestLogin }) {
  const isLocked = Boolean(onRequestLogin);

  const requestSearch = (searchKeyword) => {
    if (isLocked) {
      onRequestLogin();
      return;
    }

    onSubmit(searchKeyword);
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
    <Stack component="form" spacing={1.5} onSubmit={handleSubmit} sx={{ alignItems: 'center' }}>
      <TextField
        value={keyword}
        onChange={(event) =>
          onKeywordChange(event.target.value.slice(0, SEARCH_KEYWORD_MAX_LENGTH))
        }
        onMouseDown={handleLockedMouseDown}
        placeholder="예: 월세 지원 알려줘"
        error={Boolean(errorMessage)}
        helperText={errorMessage ? `⚠ ${errorMessage}` : ' '}
        fullWidth
        sx={{ maxWidth: 560, '& .MuiOutlinedInput-root': { borderRadius: 999, pr: 0.5 } }}
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
                  aria-label="검색"
                  sx={{ bgcolor: 'primary.main' }}
                >
                  <Icon icon="mdi:magnify" width={20} color="#0b1626" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        {POLICY_SEARCH_HASHTAGS.map((hashtag) => (
          <SubtypeChip key={hashtag} label={`#${hashtag}`} onClick={() => requestSearch(hashtag)} />
        ))}
      </Stack>
    </Stack>
  );
}

export default PolicySearchBar;
