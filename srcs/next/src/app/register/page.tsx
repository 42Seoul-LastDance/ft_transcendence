import RegisterButton from './RegisterButton';
import NicknameForm from './NicknameForm';
import ImageForm from './ImageForm';

const RegisterHome: React.FC = () => {
    return (
        <div>
            <h1>Register Page!!</h1>
            <div>
                <ImageForm></ImageForm>
                <br />
                <NicknameForm />
                <br />
                <RegisterButton />
            </div>
        </div>
    );
};

export default RegisterHome;
