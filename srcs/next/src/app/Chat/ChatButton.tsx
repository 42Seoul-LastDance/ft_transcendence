'use client';
import { useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocket } from '../SSock';
import { Tab, RadioGroup } from '@headlessui/react';

function MyRadioGroup() {
    let [plan, setPlan] = useState('startup');

    return (
        <RadioGroup value={plan} onChange={setPlan}>
            <RadioGroup.Label>public room</RadioGroup.Label>
            <RadioGroup.Option value="startup">
                {({ checked }) => (
                    <span className={checked ? 'bg-blue-200' : ''}>
                        chatroom1
                    </span>
                )}
            </RadioGroup.Option>
            <RadioGroup.Option value="business">
                {({ checked }) => (
                    <span className={checked ? 'bg-blue-200' : ''}>
                        chatroom2
                    </span>
                )}
            </RadioGroup.Option>
            <RadioGroup.Option value="enterprise">
                {({ checked }) => (
                    <span className={checked ? 'bg-blue-200' : ''}>
                        chatroom3
                    </span>
                )}
            </RadioGroup.Option>
        </RadioGroup>
    );
}

function MyTabs() {
    return (
        <Tab.Group>
            <Tab.List>
                <Tab>Chat</Tab>
                <Tab>Friends</Tab>
                <Tab>Settings</Tab>
            </Tab.List>
            <Tab.Panels>
                <Tab.Panel>
                    <MyRadioGroup />
                </Tab.Panel>
                <Tab.Panel>Content 2</Tab.Panel>
                <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
        </Tab.Group>
    );
}

const ChatRoomList = () => {
    return (
        <div>
            <MyTabs />
        </div>
    );
};

export default ChatRoomList;
