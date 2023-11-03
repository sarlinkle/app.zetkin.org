import { Box } from '@mui/system';
import messageIds from 'features/import/l10n/messageIds';
import { Msg } from 'core/i18n';
import { Typography } from '@mui/material';
import useOrganizations from 'features/organizations/hooks/useOrganizations';

interface ImportChangeTrackerProps {
  changedNum: number;
  fieldName: string;
  orgs?: string[];
}
const ImportChangeTracker: React.FunctionComponent<
  ImportChangeTrackerProps
> = ({ changedNum, fieldName, orgs }) => {
  const organizations = useOrganizations();

  if (orgs !== undefined && orgs.length === 0) {
    return null;
  }
  const filteredOrg = organizations.data?.filter((item) =>
    orgs?.some((org) => org === item.id.toString())
  );

  return (
    <Box sx={{ border: 'solid 1px lightgrey', borderRadius: '4px', p: 2 }}>
      <Box alignItems="center" display="flex">
        <Typography fontWeight="bold" sx={{ mr: 0.5 }}>
          {changedNum}
        </Typography>
        <Msg
          id={
            orgs
              ? messageIds.validation.trackers.orgs
              : messageIds.validation.trackers.defaultDesc
          }
        />
        <Typography fontWeight="bold" sx={{ ml: 0.5 }}>
          {fieldName}
        </Typography>
      </Box>
      <Box display="flex" flexWrap="wrap" gap={0.5}>
        {filteredOrg?.map((org) => (
          <Typography key={org.id} color="secondary">
            {org.title},
          </Typography>
        ))}
      </Box>
    </Box>
  );
};
export default ImportChangeTracker;
