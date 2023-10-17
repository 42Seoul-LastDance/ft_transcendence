// ChatSetting.js
import React, { useState, MouseEvent, useEffect } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import { Button, Menu } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import CommonListItem from './CommonListItem';
import ChatMenu from './chatMenu';
import { ChatRoomDto, Member } from '@/app/interface';
import { useChatSocket } from '@/app/context/chatSocketContext';
import { IoEventListener } from '@/app/context/socket';
import { setRoomMemberList, setSelectedMember } from '@/app/redux/roomSlice';

const ChatSetting: React.FC = () => {
  const dispatch = useDispatch();
  const chatSocket = useChatSocket();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const memberList = useSelector(
    (state: RootState) => state.room.roomMemberList,
  );
  const selectedMember = useSelector(
    (state: RootState) => state.room.selectedMember,
  );

  useEffect(() => {
    console.log('--------- chatSetting component ---------');

    const e = [
      {
        event: 'getMemberStateList',
        callback: (data: Member[]) => dispatch(setRoomMemberList(data)),
      },
    ];

    // 소켓 이벤트 등록
    e.forEach(({ event, callback }) => {
      IoEventListener(chatSocket!, event, callback);
    });
    return () => {
      // 이벤트 삭제
      e.forEach(({ event, callback }) => {
        chatSocket?.off(event, callback);
      });
    };
  }, [memberList]);

  const handleClick = (event: MouseEvent<HTMLDivElement>, member: Member) => {
    dispatch(setSelectedMember(member));
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <List sx={{ width: 300, bgcolor: 'background.paper' }}>
        <p>채팅방 유저 리스트</p>
        {memberList.map((member: Member, index: number) => (
          <CommonListItem
            key={index}
            text={member.userName}
            onClick={(event: React.MouseEvent<HTMLDivElement>) =>
              handleClick(event, member)
            }
          />
        ))}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <ChatMenu />
        </Menu>
        {/* ChatMenu 컴포넌트에 선택한 멤버 정보 전달 */}
        <Divider variant="inset" component="li" />
      </List>
    </>
  );
};

export default ChatSetting;
