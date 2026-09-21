import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { TOAST_MESSAGES, VALIDATION_MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  getEmailError,
  getNicknameError,
  getPasswordError,
  NICKNAME_MAX_LENGTH,
} from '@/utils/validateAuthForm';

const INITIAL_FORM = { email: '', password: '', passwordConfirm: '', nickname: '' };

function SignupPage() {
  const { signup } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCompletedRef = useRef(false);

  // 설계서 S-03: 가입 도중 화면을 벗어나면 처음부터 다시 한다고 알린다.
  useEffect(
    () => () => {
      if (!isCompletedRef.current) {
        showInfo(TOAST_MESSAGES.SIGNUP_LEFT);
      }
    },
    [showInfo],
  );


  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const validate = () => {
    const errors = {
      email: getEmailError(form.email),
      password: getPasswordError(form.password),
      nickname: getNicknameError(form.nickname),
      passwordConfirm:
        form.password === form.passwordConfirm ? '' : VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    };

    return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        email: form.email,
        nickname: form.nickname,
        password: form.password,
      });
      isCompletedRef.current = true;
      showSuccess(TOAST_MESSAGES.SIGNUP_DONE);
      // 이동은 PublicOnlyRoute가 조건 등록 여부를 보고 처리한다.
    } catch (error) {
      const message = getErrorMessage(error);

      if (error?.response?.status === 409) {
        setFieldErrors({ email: VALIDATION_MESSAGES.DUPLICATED_EMAIL });
      }
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack sx={{ alignItems: 'center' }}>
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 440, p: 4 }}>
        <Stack spacing={1.5}>
          <Typography variant="h1">회원가입</Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label="1 계정 만들기" size="small" color="primary" />
            <Typography variant="caption" color="text.disabled">
              →
            </Typography>
            <Chip label="2 내 조건 등록" size="small" variant="outlined" />
          </Stack>
        </Stack>

        <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            label="이메일"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email ? `⚠ ${fieldErrors.email}` : '로그인 아이디로 써요'}
            fullWidth
          />
          <TextField
            label="비밀번호"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={Boolean(fieldErrors.password)}
            helperText={
              fieldErrors.password
                ? `⚠ ${fieldErrors.password}`
                : '8자 이상, 영문과 숫자, 특수문자를 섞어 주세요'
            }
            fullWidth
          />
          <TextField
            label="비밀번호 확인"
            name="passwordConfirm"
            type="password"
            value={form.passwordConfirm}
            onChange={handleChange}
            error={Boolean(fieldErrors.passwordConfirm)}
            helperText={fieldErrors.passwordConfirm ? `⚠ ${fieldErrors.passwordConfirm}` : ' '}
            fullWidth
          />
          <TextField
            label="닉네임"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            error={Boolean(fieldErrors.nickname)}
            helperText={
              fieldErrors.nickname
                ? `⚠ ${fieldErrors.nickname}`
                : `홈페이지에서 사용하는 닉네임 (최대 ${NICKNAME_MAX_LENGTH}자)`
            }
            fullWidth
          />

          <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
            가입하고 내 조건 등록하기
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            이미 회원이에요?{' '}
            <Link component={RouterLink} to={ROUTES.HOME}>
              로그인
            </Link>
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );
}

export default SignupPage;
