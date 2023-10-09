'use client';

import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import CreateRoomForm from './createRoomForm';
import { useState } from 'react';

const style: React.CSSProperties = {
  position: 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: 'background.paper',
  border: '2px solid #000',
  boxShadow: '24px 24px 48px rgba(0, 0, 0, 0.2)',
  padding: 4,
};

const CreateRoomButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Box sx={{ '& > :not(style)': { m: 1 } }}>
        <Fab color="primary" aria-label="add" onClick={handleOpen}>
          <AddIcon />
        </Fab>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h6">
            방 만들기
          </Typography>
          <CreateRoomForm onClose={handleClose} />
        </Box>
      </Modal>
    </div>
  );
};

export default CreateRoomButton;
