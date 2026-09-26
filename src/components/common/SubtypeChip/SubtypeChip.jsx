import Chip from '@mui/material/Chip';

function SubtypeChip({ label, isSelected = false, onClick }) {
  return (
    <Chip
      label={label}
      variant={isSelected ? 'filled' : 'outlined'}
      color={isSelected ? 'primary' : 'default'}
      clickable={Boolean(onClick)}
      onClick={onClick}
      sx={{ height: 34, px: 0.5 }}
    />
  );
}

export default SubtypeChip;
