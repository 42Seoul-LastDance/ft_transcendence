'use client';
// CommonListItem.tsx
import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { Divider } from '@mui/material';

interface CommonListItemProps {
  text: string | undefined;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const CommonListItem: React.FC<CommonListItemProps> = ({ text, onClick }) => {
  return (
    <div onClick={onClick}>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt={text} src="/static/images/avatar/1.jpg" />
        </ListItemAvatar>
        <ListItemText primary={text} secondary="introduce" />
      </ListItem>
      <Divider />
    </div>
  );
};

export default CommonListItem;
