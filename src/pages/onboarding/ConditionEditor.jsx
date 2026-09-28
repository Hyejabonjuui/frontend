import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import ErrorState from '@/components/common/ErrorState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as userApi from '@/api/userApi';
import { TOAST_MESSAGES } from '@/constants/messages';
import { useAuth } from '@/hooks/useAuth';
import { useCodes } from '@/hooks/useCodes';
import { useConditionForm } from '@/hooks/useConditionForm';
import { useToast } from '@/hooks/useToast';
import ConditionForm from '@/pages/onboarding/ConditionForm';
import { conditionDraft } from '@/utils/conditionDraft';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { searchResultCache } from '@/utils/searchResultCache';

function ConditionEditor({ initialConditions, draft, submitLabel, onSaved }) {
  const { showSuccess, showError, showInfo } = useToast();
  const { refreshUser } = useAuth();
  const { codes, isLoading, errorMessage, refetch } = useCodes();
  const { form, fieldErrors, changeField, validate } = useConditionForm({
    ...initialConditions,
    ...draft,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 설계서 S-04: 임시 저장한 내용을 불러왔으면 안내한다.
  useEffect(() => {
    if (draft) {
      showInfo(TOAST_MESSAGES.CONDITION_DRAFT_LOADED);
    }
  }, [draft, showInfo]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      showError(TOAST_MESSAGES.CONDITION_REQUIRED);
      return;
    }

    setIsSubmitting(true);

    try {
      await userApi.updateMyConditions(form);
      conditionDraft.clear();
      // 추천 판정은 내 조건으로 하므로, 이전 조건으로 받은 검색 결과는 더 쓰지 않는다.
      searchResultCache.clear();
      await refreshUser();
      showSuccess(TOAST_MESSAGES.CONDITION_SAVED);
      onSaved?.();
    } catch (error) {
      showError(getErrorMessage(error));
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
    <Stack component="form" spacing={3} onSubmit={handleSubmit}>
      {draft && <Alert severity="info">{TOAST_MESSAGES.CONDITION_DRAFT_LOADED}</Alert>}

      <ConditionForm form={form} fieldErrors={fieldErrors} codes={codes} onChange={changeField} />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{ alignSelf: 'flex-end' }}
      >
        {submitLabel}
      </Button>
    </Stack>
  );
}

export default ConditionEditor;
