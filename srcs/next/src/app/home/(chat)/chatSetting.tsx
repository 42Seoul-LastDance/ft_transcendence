// ChatSetting.js
import React, { useState, MouseEvent, useEffect } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import { Menu } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import CommonListItem from './CommonListItem';
import ChatMenu from './chatMenu';
import { ChatRoomDto, MemberList } from '@/app/interface';
import { setChatRoom } from '@/app/redux/userSlice';
import { useChatSocket } from '@/app/context/chatSocketContext';
import { IoEventListener } from '@/app/context/socket';
import { setRoomMemberList } from '@/app/redux/roomSlice';

const ChatSetting: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>(''); // 클릭한 멤버 정보 상태 추가
  const chatRoom = useSelector((state: RootState) => state.user.chatRoom);
  const dispatch = useDispatch();
  const chatSocket = useChatSocket();
  const memberList = useSelector(
    (state: RootState) => state.room.roomMemberList,
  );

  useEffect(() => {}, [memberList]);
  const handleClick = (event: MouseEvent<HTMLDivElement>, member: any) => {
    console.log('click', member);
    setAnchorEl(event.currentTarget);
    setSelectedMember(member); // 클릭한 멤버 정보 설정
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedMember(''); // 메뉴 닫을 때 멤버 정보 초기화
  };

  IoEventListener(chatSocket!, 'getChatRoomInfo', (data: ChatRoomDto) => {
    dispatch(setChatRoom(data));
  });

  IoEventListener(chatSocket!, 'getMemberStateList', (data: MemberList[]) => {
    dispatch(setRoomMemberList(data));
  });

  return (
    <List sx={{ width: 300, bgcolor: 'background.paper' }}>
      <p>채팅방 유저 리스트</p>
      {memberList.map((memberList: MemberList, index: number) => (
        <CommonListItem
          key={index}
          text={memberList.userName}
          onClick={(event) => handleClick(event, memberList.userName)}
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
        {/* ChatMenu 컴포넌트에 선택한 멤버 정보 전달 */}
        <ChatMenu targetName={selectedMember} />
      </Menu>
      <Divider variant="inset" component="li" />
    </List>
  );
};

export default ChatSetting;
