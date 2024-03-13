import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Avatar = () => {
    const fileInputRef = useRef(null);
    const [data, setData] = useState({
        userInfo:[],
    });
    const [inputPassword, setInputPassword] = useState('');
    const [inputPasswordConfirm, setInputPasswordConfirm] = useState('');
    const [newEmailValue, setNewEmailValue] = useState('');
    const [newDescriptionValue, setNewDescriptionValue] = useState('');

    useEffect(() => {
        const shouldShowToast = localStorage.getItem('shouldShowToast');
        if (shouldShowToast === 'true') {
            const toastMessages = localStorage.getItem('toastMessages');
            if (toastMessages) {
                const messages = JSON.parse(toastMessages);

                toast.success(messages, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });

                localStorage.removeItem('shouldShowToast');
                localStorage.removeItem('toastMessages');
            }
        }
    }, []);

    useEffect(() => {
        fetch(`/profile/api/userInfo`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(prevData => ({ ...prevData, userInfo: data.userInfo}));
                setNewEmailValue(data.userInfo.email)
                setNewDescriptionValue(data.userInfo.description)
            })
            .catch(error => {
                console.error('Error fetching userId:', error.message);
            });

    }, []);

    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            toast.error('Nie wybrano pliku' , {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
            return;
        }

        const maxSize = 19 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            toast.error('Zbyt duży plik. Maksymalna wielkość to 19 MB', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        await fetch(`/profile/uploadAvatar/`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': window.csrfToken,
            },
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('toastMessages', JSON.stringify(data.messages));
                    localStorage.setItem('shouldShowToast', 'true');
                    window.location.reload(false);
                }
                toast.error(data.message , {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            })
            .catch(error => {
                console.error('Błąd podczas przetwarzania żądania:', error);
            })

    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleInputsValue = (email,password,passwordConfirm,description) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            toast.error('Podany adres e-mail jest nieprawidłowy!', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
            return;
        }

        if(password !== passwordConfirm){
            toast.error('Podane hasła nie są identyczne!', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
            return;
        }

        if (email.trim() === data.userInfo.email.trim()) {
            email = null;
        }

        fetch(`/profile/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
            body: JSON.stringify({email,password,description}),
        })
            .then(response => response.json())
            .then(data => {
                toast.success(data.messages, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
                toast.error(data.message, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
                if(data.success){
                    window.location.reload(false);
                }
            })
            .catch(error => {
                console.log('Błąd podczas przetwarzania żądania:', error);
            });


    }

    return (



            <div className="h-full w-full bg-slate-100 rounded-2xl items-center flex justify-items-center justify-center border-2 border-gray-300">
                <ToastContainer/>
                <div className="w-1/2 flex-col justify-center items-center flex">
                    <input
                        id="file-input"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                    <img
                        src={data && data.userInfo.avatarUrl ? `${window.location.origin}/${data.userInfo.avatarUrl}` : `https://ui-avatars.com/api/?name=${data.userInfo.name}+${data.userInfo.surname}&background=818cf8&color=fff`}
                        width="200"
                        className="hover:opacity-75 cursor-pointer transition-opacity object-cover w-[150px] h-[150px] rounded-full overflow-hidden"
                        onClick={handleImageClick}
                    />
                    <h3 className="text-indigo-400 tex-xs flex justify-center w-full mt-10">Imię i nazwisko:</h3>
                    <h3 className="text-black text-xl flex justify-center w-full mb-3">{data.userInfo.name} {data.userInfo.surname} </h3>
                </div>

                <div className="flex flex-col justify-center items-center h-full relative w-1/2">
                    <div className=" flex flex-col mt-5 w-11/12 lg:w-2/3 mx-5 lg:mx-0">
                        <h3 className="text-indigo-400 tex-xs flex justify-center w-full">E-mail:</h3>
                        <input type="text" name="username" className="text-center p-2 border-2 rounded-full bg-slate-100 mb-3 placeholder-black" placeholder="E-mail" value={newEmailValue}  onChange={(e) => setNewEmailValue(e.target.value)} />
                        <h3 className="text-indigo-400 tex-xs flex justify-center w-full">Nowe hasło:</h3>
                        <input type="password" id="password" name="password" className="text-center p-2 border-2 rounded-full bg-slate-100 mb-3 placeholder-black" placeholder="Wprowadź nowe haslo" onChange={(e) => setInputPassword(e.target.value)}/>
                        <input type="password" id="confirm_password" name="confirm_password" className="text-center p-2 border-2 rounded-full bg-slate-100 mt-1 placeholder-black" placeholder="Potwierdź haslo" onChange={(e) => setInputPasswordConfirm(e.target.value)}/>
                        <div id="message" className="text-center tex-xs flex justify-center w-full"></div>
                        <h3 className="text-indigo-400 tex-xs flex justify-center w-full mt-3">Opis:</h3>
                        <textarea name="description" className="text-center p-2 border-2 rounded-2xl bg-slate-100 h-24 placeholder-black resize-none" placeholder="Opis swoją osobę..." maxLength="150" value={newDescriptionValue || ''} onChange={(e) => setNewDescriptionValue(e.target.value)}></textarea>
                    </div>
                    <button onClick={() => handleInputsValue(newEmailValue,inputPassword,inputPasswordConfirm,newDescriptionValue)} className="bg-indigo-400 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-5">Zapisz</button>
                </div>
            </div>

    );
}

export default Avatar;

if (document.getElementById('Avatar')) {
    const rootElement = document.getElementById('Avatar');

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Avatar />
        </React.StrictMode>
    );
}
