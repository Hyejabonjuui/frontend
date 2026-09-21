import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { POLICY_SUBTYPES } from '@/constants/policy';

function PolicyFilterTabs({ subtype, onSubtypeChange }) {
  return (
    <Tabs
      value={subtype}
      onChange={(event, value) => onSubtypeChange(value)}
      variant="scrollable"
      scrollButtons="auto"
      aria-label="주거 정책 분류"
      sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
    >
      {POLICY_SUBTYPES.map((option) => (
        <Tab key={option.value} value={option.value} label={option.label} />
      ))}
    </Tabs>
  );
}

export default PolicyFilterTabs;
