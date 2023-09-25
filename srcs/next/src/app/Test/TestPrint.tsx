'use client';

import { Provider } from 'react-redux';
import { useAppSelector, store } from '../Redux/store';

const TestPrint = () => {
    const seletor = useAppSelector((state) => state.room.roomState);

    return (
        <table>
            <h1> TestPrint </h1>
            {seletor.map((my) => (
                <tr key={my.id}>
                    <td>{my.id + ' : ' + my.name}</td>
                </tr>
            ))}
        </table>
    );
};

const WrappedPrint = () => {
    return (
        <div>
            <Provider store={store}>
                <TestPrint />
            </Provider>
        </div>
    );
};

export default WrappedPrint;
