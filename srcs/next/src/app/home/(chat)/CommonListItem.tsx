'use client';
import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { Badge, Divider } from '@mui/material';
import { UserPermission } from '@/app/enums';

interface CommonListItemProps {
  primaryText: string | undefined;
  secondText: string | undefined;
  permission: UserPermission;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const CommonListItem: React.FC<CommonListItemProps> = ({
  primaryText,
  secondText,
  permission,
  onClick,
}) => {
  if (permission === UserPermission.OWNER) primaryText = '👑 ' + primaryText;
  return (
    <div onClick={onClick}>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt={primaryText} src="/static/images/avatar/1.jpg" />
        </ListItemAvatar>
        <ListItemText primary={primaryText} secondary={secondText} />
      </ListItem>
      <Divider />
    </div>
  );
};

export default CommonListItem;
