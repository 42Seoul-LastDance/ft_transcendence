'use client';

import React, { useRef } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { push } from '../Redux/mySlice';
import { store } from '../Redux/store';
import { getChatSocket } from '../SSock';
import { Socket } from 'socket.io-client';

enum roomStatus {
    PRIVATE = 'PRIVATE',
    PUBLIC = 'PUBLIC',
}

const TestAdd = () => {
    const inputName = useRef<string>('');
    const dispatch = useDispatch();
    var socket: Socket | undefined;

    try {
        socket = getChatSocket();
        if (!socket.hasListeners('create ChatRoom')) {
            socket.on('create ChatRoom', () => {
                dispatch(push({ name: inputName.current }));
            });
        }
        if (!socket.hasListeners('getMessage'))
            socket.on('getMessage', (msg) => {
                console.log('msg from server: ', msg);
            });
    } catch (error) {
        console.log('socket error');
    }

    const handleCreateRoom = () => {
        if (socket) {
            console.log('try handle Create Room');
            socket.emit('createChatRoom', {
                roomname: inputName.current,
                username: 'kwsong',
                password: null,
                isLocked: false,
                status: roomStatus.PUBLIC,
            });
        }
    };

    return (
        <div>
            <h1>TestAdd</h1>
            <input
                onChange={(e) => (inputName.current = e.target.value)}
            ></input>
            <button onClick={handleCreateRoom}>Create Room</button>
        </div>
    );
};

const WrappedAdd = () => {
    return (
        <div>
            <Provider store={store}>
                <TestAdd />
            </Provider>
        </div>
    );
};

export default WrappedAdd;
