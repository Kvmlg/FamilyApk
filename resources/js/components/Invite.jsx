import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Invite = () => {
    const [isInviteVisible, setInviteVisible] = useState(false);
    const userIdRef = useRef('');

    const handleInviteClick = () => {
        setInviteVisible(true);
    };

    const handleInviteClose = () => {
        setInviteVisible(false);
    };

    const handleInviteSend = () => {
        if ( userIdRef.current) {
            fetch(`/chat/api/invite/${userIdRef.current}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': window.csrfToken,
                },
                body: JSON.stringify({ userId: userIdRef.current || '' }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Odpowiedź z serwera:', data);
                    toast.success(data.messages, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                    toast.error(data.message , {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });

                })
                .catch(error => {
                    console.error('Błąd podczas przetwarzania żądania:', error);
                })
                .finally(() => {
                    handleInviteClose();
                });
        } else {
            console.error('ID użytkownika jest puste.');
        }
        handleInviteClose();
    };


    return (
        <div>
            <ToastContainer />
            <div className={"flex w-full z-50 h-full justify-end mt-1"}>
                <button className="flex text-black align-middle right-0" onClick={handleInviteClick}>
                    <svg className="w-5 h-5 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                        <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z"/>
                    </svg>
                </button>
            </div>

            {isInviteVisible && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded shadow-lg w-1/3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-72">
                        <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={handleInviteClose}>
                            <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </span>

                        <h2 className="text-2xl font-bold mb-4 text-black">Zaproś do znajomych</h2>

                        <input
                            type="email"
                            placeholder="E-mail użytkownika"
                            className="w-full p-2 border mb-4 text-black"
                            onChange={(e) => userIdRef.current = e.target.value}
                        />


                        <button onClick={() => handleInviteSend()} className="bg-indigo-400 text-white p-2 rounded hover:bg-blue-700 ">
                            Wyślij zaproszenie
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Invite;

if (document.getElementById('Invite')) {
    const rootElement = document.getElementById('Invite');

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Invite />
        </React.StrictMode>
    );
}
