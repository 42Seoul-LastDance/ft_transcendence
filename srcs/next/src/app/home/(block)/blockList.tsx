'use client';

import React, { useEffect, useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import sendRequest from '../../api';
import { useRouter } from 'next/navigation';
import { UserInfoJson } from '@/app/interfaces';
import { Button, Grow } from '@mui/material';

const BlockList: React.FC = () => {
  const [blockList, setBlockList] = useState<UserInfoJson[]>([]);
  const router = useRouter();

  const handleResponse = async () => {
    const response = await sendRequest('get', '/block/getBlockList', router);
    setBlockList(response.data);
  };

  const unblockUser = async (slackId: string) => {
    const requestUnblock = await sendRequest(
      'delete',
      `/block/unblockUser/${slackId}`,
      router,
    );
    if (requestUnblock.status === 200) handleResponse();
	handleResponse();
  };

  useEffect(() => {
    handleResponse();
  }, []);
  return (
    <>
      {Array.isArray(blockList) ? (
        blockList?.map((info: UserInfoJson, rowIdx: number) => (
          <Grow in={true} timeout={400 * (rowIdx + 1)} key={rowIdx}>
            <ListItem
              key={rowIdx}
              divider
              className="list-item"
              sx={{
                width: 450,
              }}
            >
              <ListItemText
                primary={`유저 이름: ${info.userName}`}
                secondary={info.slackId}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={() => unblockUser(info.slackId)}
              >
                해제하기
              </Button>
            </ListItem>
          </Grow>
        ))
      ) : (
        <></>
      )}

      {/* 여기서부터 예전 */}
      {/* <List>
        {blockList.map((blockName: string) => (
          <ListItem key={blockName} divider>
            <ListItemText primary={`유저 이름: ${blockName}`} />
            <Button
              variant="contained"
              onClick={async () => await unblockUser(blockName)}
            >
              차단해제
            </Button>
          </ListItem>
        ))}
      </List> */}
    </>
  );
};

export default BlockList;
