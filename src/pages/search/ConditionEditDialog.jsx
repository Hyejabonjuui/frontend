import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import AppIcon from '@/components/common/AppIcon';
import ConditionEditor from '@/pages/onboarding/ConditionEditor';

/**
 * 추천 결과에서 내 조건을 고쳐 같은 검색어로 다시 찾는다.
 * 검색 API는 서버에 저장된 내 조건으로 판정하므로, 적용하면 마이페이지의 내 조건도 함께 바뀐다.
 */
function ConditionEditDialog({ isOpen, conditions, onClose, onSaved }) {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          typography: 'h2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        조건 수정
        <IconButton onClick={onClose} aria-label="닫기" size="small">
          <AppIcon name="close" size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          수정한 조건은 내 정보에도 반영돼요. 적용하면 같은 검색어로 다시 찾아요.
        </Typography>

        <ConditionEditor
          initialConditions={conditions}
          submitLabel="적용"
          onSaved={onSaved}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ConditionEditDialog;
