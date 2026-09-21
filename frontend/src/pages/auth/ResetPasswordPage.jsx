import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import * as authApi from '@/api/authApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/getErrorMessage';

function ResetPasswordPage() {
  const { showError } = useToast();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await authApi.resetPassword({ email });
      setIsSent(true);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 440, mx: 'auto' }}>
      <Typography variant="h1">비밀번호 재발급</Typography>

      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          label="이메일"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="example@email.com"
          fullWidth
        />

        <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
          임시 비밀번호 받기
        </Button>
      </Stack>

      {isSent && <Alert severity="success">입력한 이메일로 임시 비밀번호를 보냈어요</Alert>}
    </Stack>
  );
}

export default ResetPasswordPage;
