'use client';
import React, { useState, ChangeEvent } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { setImageUrl } from '../redux/userSlice';
import store from '../redux/store';

const ImageFormContent = () => {
    const dispatch = useDispatch();
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const upload = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function (e) {
                if (e.target) {
                    const img = new Image();
                    img.src = e.target.result as string;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d')!;
                        const size = 500; // 정사각형 크기

                        canvas.width = size;
                        canvas.height = size;

                        // 이미지를 비율 무시하고 정사각형으로 조정
                        ctx.drawImage(img, 0, 0, size, size);

                        const resizedImageUrl = canvas.toDataURL('image/jpeg'); // 또는 'image/png' 등으로 변경 가능
                        // console.log('resizedImageUrl: ', resizedImageUrl);
                        setPreviewImage(resizedImageUrl);
                        dispatch(setImageUrl(resizedImageUrl));
                    };
                }
            };

            reader.readAsDataURL(file);
        }
    };

    return (
        <form id="imageForm" encType="multipart/form-data">
            <label htmlFor="imageUpload">Upload image (180x180):</label>
            <img
                src={previewImage || '/defaultUser.jpeg'}
                alt="Preview"
                style={{ maxWidth: '180px', maxHeight: '180px' }}
            />
            <br />
            <input
                type="file"
                id="imageUpload"
                accept="image/*"
                required
                onChange={upload}
            />
        </form>
    );
};

const ImageForm = () => {
    return (
        <Provider store={store}>
            <ImageFormContent />
        </Provider>
    );
};

export default ImageForm;
