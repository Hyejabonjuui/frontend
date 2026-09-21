import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { LOGIN_NOTICE } from '@/constants/messages';
import { SEARCH_KEYWORD_MAX_LENGTH } from '@/constants/policy';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useLoginDialog } from '@/hooks/useLoginDialog';

const FIELD_WIDTH = 240;

/**
 * 설계서 Header/SearchSmall. 홈·추천 결과의 큰 검색창과 달리 화면 안에 작게 놓는다.
 * 검색은 로그인한 사람만 쓸 수 있어 비로그인이면 로그인 안내 창을 띄운다.
 */
function PolicySearchField() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openLoginNotice } = useLoginDialog();
  const [keyword, setKeyword] = useState('');

  /** 잠금 상태에서는 포커스를 막아야 안내 창이 닫힐 때 다시 열리지 않는다. */
  const handleLockedMouseDown = (event) => {
    event.preventDefault();
    openLoginNotice(LOGIN_NOTICE.SEARCH);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      openLoginNotice(LOGIN_NOTICE.SEARCH);
      return;
    }

    if (!keyword.trim()) {
      return;
    }

    navigate(`${ROUTES.RECOMMENDATION}?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        value={keyword}
        onChange={(event) => setKeyword(event.target.value.slice(0, SEARCH_KEYWORD_MAX_LENGTH))}
        onMouseDown={isAuthenticated ? undefined : handleLockedMouseDown}
        placeholder="주거 정책 검색"
        size="small"
        sx={{ width: FIELD_WIDTH, '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
        slotProps={{
          htmlInput: {
            maxLength: SEARCH_KEYWORD_MAX_LENGTH,
            'aria-label': '주거 정책 검색',
            readOnly: !isAuthenticated,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit" size="small" aria-label="검색">
                  <Icon icon="mdi:magnify" width={18} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}

export default PolicySearchField;
