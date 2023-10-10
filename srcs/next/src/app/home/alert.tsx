import React, { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import { setShowAlert } from '../redux/alertSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface AutoAlertProps {
  severity: 'error' | 'warning' | 'info' | 'success'; // severity의 유효한 값으로 수정
}

const AutoAlert: React.FC<AutoAlertProps> = ({ severity }) => {
  const showAlert = useSelector((state: RootState) => state.alert.showAlert);
  const message = useSelector((state: RootState) => state.alert.alertMsg);
  const timeout = 2000;
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setShowAlert(false));
    }, timeout);

    return () => clearTimeout(timer);
  }, [showAlert, timeout]);

  return showAlert ? (
    <div className="alert-container">
      <Alert severity={severity}>{message}</Alert>
    </div>
  ) : null;
};

export default AutoAlert;
