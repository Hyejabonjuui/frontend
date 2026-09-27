import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { confirmEmailVerification, sendEmailVerification } from '@/api/authApi';
import ErrorState from '@/components/common/ErrorState';
import FieldError from '@/components/common/FieldError';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { TOAST_MESSAGES, VALIDATION_MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useCodes } from '@/hooks/useCodes';
import { useConditionForm } from '@/hooks/useConditionForm';
import { useToast } from '@/hooks/useToast';
import ConditionForm from '@/pages/onboarding/ConditionForm';
import { conditionDraft } from '@/utils/conditionDraft';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  getEmailError,
  getNicknameError,
  getPasswordError,
  NICKNAME_MAX_LENGTH,
} from '@/utils/validateAuthForm';

const INITIAL_FORM = { email: '', password: '', passwordConfirm: '', nickname: '' };
const VERIFICATION_CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const VERIFICATION_VALID_DURATION_MS = 30 * 60 * 1000;

const formatRemainingTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
};

const useCountdown = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [seconds]);

  return [seconds, setSeconds];
};

function SignupPage() {
  const { signup } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { codes, isLoading, errorMessage, refetch } = useCodes();
  const {
    form: profile,
    fieldErrors: profileErrors,
    changeField: changeProfileField,
    validate: validateProfile,
  } = useConditionForm();
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useCountdown();
  const [resendRemainingSeconds, setResendRemainingSeconds] = useCountdown();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isConfirmingCode, setIsConfirmingCode] = useState(false);
  const isCompletedRef = useRef(false);
  const verifiedAtRef = useRef(null);

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

    if (name === 'email' && value !== form.email) {
      setVerificationStatus('idle');
      setVerificationCode('');
      setVerificationError('');
      setRemainingSeconds(0);
      setResendRemainingSeconds(0);
      verifiedAtRef.current = null;
    }
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSendVerification = async () => {
    const emailError = getEmailError(form.email);
    setFieldErrors((previous) => ({ ...previous, email: emailError }));

    if (emailError) {
      return;
    }

    setIsSendingCode(true);
    setVerificationError('');

    try {
      const result = await sendEmailVerification(form.email);
      setVerificationStatus('sent');
      setVerificationCode('');
      setRemainingSeconds(result?.expiresInSeconds ?? 300);
      setResendRemainingSeconds(RESEND_COOLDOWN_SECONDS);
      showSuccess(TOAST_MESSAGES.EMAIL_VERIFICATION_SENT);
    } catch (error) {
      const message = getErrorMessage(error);
      setVerificationError(message);

      if (error?.response?.data?.code === 'MEMBER_002') {
        setFieldErrors((previous) => ({
          ...previous,
          email: VALIDATION_MESSAGES.DUPLICATED_EMAIL,
        }));
      }
      if (error?.response?.data?.code === 'VERIFY_004') {
        setResendRemainingSeconds(RESEND_COOLDOWN_SECONDS);
      }
      showError(message);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleConfirmVerification = async () => {
    if (verificationCode.length !== VERIFICATION_CODE_LENGTH) {
      setVerificationError(VALIDATION_MESSAGES.VERIFICATION_CODE_REQUIRED);
      return;
    }

    if (remainingSeconds <= 0) {
      setVerificationError(VALIDATION_MESSAGES.VERIFICATION_CODE_EXPIRED);
      return;
    }

    setIsConfirmingCode(true);
    setVerificationError('');

    try {
      const result = await confirmEmailVerification(form.email, verificationCode);

      if (!result?.verified) {
        setVerificationError(VALIDATION_MESSAGES.VERIFICATION_CODE_INVALID);
        return;
      }

      setVerificationStatus('verified');
      setRemainingSeconds(0);
      setResendRemainingSeconds(0);
      verifiedAtRef.current = Date.now();
      setFieldErrors((previous) => ({ ...previous, email: '' }));
      showSuccess(TOAST_MESSAGES.EMAIL_VERIFICATION_DONE);
    } catch (error) {
      const message = getErrorMessage(error);
      setVerificationError(message);
      if (error?.response?.data?.code === 'VERIFY_002') {
        setRemainingSeconds(0);
      }
      showError(message);
    } finally {
      setIsConfirmingCode(false);
    }
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
    const isProfileValid = validateProfile();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0 || !isProfileValid) {
      if (!isProfileValid) {
        showError(TOAST_MESSAGES.CONDITION_REQUIRED);
      }
      return;
    }

    const isVerificationExpired =
      verificationStatus === 'verified' &&
      (!verifiedAtRef.current ||
        Date.now() - verifiedAtRef.current >= VERIFICATION_VALID_DURATION_MS);

    if (verificationStatus !== 'verified' || isVerificationExpired) {
      if (isVerificationExpired) {
        setVerificationStatus('sent');
        setVerificationCode('');
        setRemainingSeconds(0);
        setResendRemainingSeconds(0);
        verifiedAtRef.current = null;
      }
      const message = isVerificationExpired
        ? VALIDATION_MESSAGES.EMAIL_VERIFICATION_EXPIRED
        : VALIDATION_MESSAGES.EMAIL_VERIFICATION_REQUIRED;
      setVerificationError(message);
      setFieldErrors((previous) => ({ ...previous, email: message }));
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        email: form.email,
        nickname: form.nickname,
        password: form.password,
        profile,
      });
      conditionDraft.clear();
      isCompletedRef.current = true;
      showSuccess(TOAST_MESSAGES.SIGNUP_DONE);
      // 이동은 PublicOnlyRoute가 조건 등록 여부를 보고 처리한다.
    } catch (error) {
      const message = getErrorMessage(error);

      if (error?.response?.status === 409) {
        const field = error.response.data?.code === 'MEMBER_003' ? 'nickname' : 'email';
        const duplicateMessage =
          field === 'nickname'
            ? VALIDATION_MESSAGES.DUPLICATED_NICKNAME
            : VALIDATION_MESSAGES.DUPLICATED_EMAIL;
        setFieldErrors((previous) => ({ ...previous, [field]: duplicateMessage }));
      }
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={refetch} />;
  }

  return (
    <Stack sx={{ alignItems: 'center' }}>
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 620, p: { xs: 2, sm: 4 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h1">회원가입</Typography>
          <Chip label="계정과 내 조건을 함께 등록해요" size="small" color="primary" />
        </Stack>

        <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'start' }}>
            <TextField
              label="이메일"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              disabled={verificationStatus === 'verified'}
              error={Boolean(fieldErrors.email)}
              helperText={
                fieldErrors.email ? (
                  <FieldError>{fieldErrors.email}</FieldError>
                ) : (
                  '로그인 아이디로 써요'
                )
              }
              fullWidth
            />
            <Button
              type="button"
              variant="outlined"
              onClick={handleSendVerification}
              disabled={
                isSendingCode ||
                verificationStatus === 'verified' ||
                (verificationStatus === 'sent' && resendRemainingSeconds > 0)
              }
              sx={{ minWidth: 132, minHeight: 56 }}
            >
              {isSendingCode
                ? '발송 중'
                : verificationStatus === 'sent' && resendRemainingSeconds > 0
                  ? `재발송 (${resendRemainingSeconds}초)`
                  : verificationStatus === 'sent'
                    ? '인증 코드 재발송'
                    : '인증 코드 발송'}
            </Button>
          </Stack>

          {verificationStatus !== 'idle' && (
            <Stack spacing={1}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ alignItems: 'start' }}
              >
                <TextField
                  label="인증 코드"
                  value={verificationCode}
                  onChange={(event) => {
                    setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                    setVerificationError('');
                  }}
                  disabled={verificationStatus === 'verified'}
                  error={Boolean(verificationError)}
                  helperText={
                    verificationError ? <FieldError>{verificationError}</FieldError> : ' '
                  }
                  slotProps={{
                    htmlInput: { inputMode: 'numeric', maxLength: VERIFICATION_CODE_LENGTH },
                  }}
                  fullWidth
                />
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleConfirmVerification}
                  disabled={
                    isConfirmingCode || verificationStatus === 'verified' || remainingSeconds <= 0
                  }
                  sx={{ minWidth: 132, minHeight: 56 }}
                >
                  인증 코드 확인
                </Button>
              </Stack>
              <Typography
                variant="caption"
                color={verificationStatus === 'verified' ? 'success.main' : 'text.secondary'}
              >
                {verificationStatus === 'verified'
                  ? '이메일 인증 완료 · 30분 안에 가입해 주세요'
                  : remainingSeconds > 0
                    ? `남은 시간 ${formatRemainingTime(remainingSeconds)}`
                    : VALIDATION_MESSAGES.VERIFICATION_CODE_EXPIRED}
              </Typography>
            </Stack>
          )}
          <TextField
            label="비밀번호"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={Boolean(fieldErrors.password)}
            helperText={
              fieldErrors.password ? (
                <FieldError>{fieldErrors.password}</FieldError>
              ) : (
                '8자 이상, 영문과 숫자, 특수문자를 섞어 주세요'
              )
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
            helperText={
              fieldErrors.passwordConfirm ? (
                <FieldError>{fieldErrors.passwordConfirm}</FieldError>
              ) : (
                ' '
              )
            }
            fullWidth
          />
          <TextField
            label="닉네임"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            error={Boolean(fieldErrors.nickname)}
            helperText={
              fieldErrors.nickname ? (
                <FieldError>{fieldErrors.nickname}</FieldError>
              ) : (
                `홈페이지에서 사용하는 닉네임 (최대 ${NICKNAME_MAX_LENGTH}자)`
              )
            }
            fullWidth
          />

          <ConditionForm
            form={profile}
            fieldErrors={profileErrors}
            codes={codes}
            onChange={changeProfileField}
          />

          <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
            회원가입
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
