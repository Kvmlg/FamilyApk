import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';



const Requests = () => {
    const [data, setData] = useState({
        NewFriend: [],
    });

    useEffect(() => {
        fetch(`/chat/api/senderid`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(prevData => ({ ...prevData, senderid: data.senderid }));
                const channel = Echo.private(`friend_request.${data.senderid}`);
                channel.subscribed(() => {
                }).listen('.RequestSent', (event) => {
                    const NewFriend = event.senderData;
                        setData(prevData => ({
                            ...prevData,
                            NewFriend: [NewFriend],
                        }));
                });

            })
            .catch(error => {
                console.error('Error fetching userId:', error.message);
            });
    }, []);



    const handleAccept = (friendId) => {
        fetch(`/chat/friend/accept/${friendId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                setData(prevData => ({
                    ...prevData,
                    NewFriend: [],
                }));
            })
            .catch(error => {


            });

    };

    const handleDecline = (friendId) => {
        fetch(`/chat/friend/decline/${friendId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => response.json())
            .then(data => {

            })
            .catch(error => {
                setData(prevData => ({
                    ...prevData,
                    NewFriend: [],
                }));
            });
    };

    return (
        <div>
            {data.NewFriend.map((friend, index) => (
            <div className="flex hover:bg-slate-100 transition px-5 py-3 hover:cursor-pointer rounded-3xl mt-1 w-full" key={index}>
                <div className="w-[50px] h-[50px] overflow-hidden">
                    <img src={friend.avatarUrl ? `${window.location.origin}/${friend.avatar_url}` : `https://ui-avatars.com/api/?name=${friend.name}+${friend.surname}&background=818cf8&color=fff` } width="50" className="rounded-full w-50 h-50" />
                </div>
                <div className="pl-2">
                    <h3 className="text-violet-500 tex-md">{friend.name} {friend.surname}</h3>
                    <p className="text-sm text-gray-400 font-light ">#{friend.id}</p>
                </div>
                <div className="buttons flex ml-14 ">
                        <button onClick={() => handleAccept(friend.id)}>
                            <div className="max-w-2xl right-0 pr-0.5">
                                <div className="w-auto h-auto">
                                    <div className="flex-1 h-full">
                                        <div className="flex items-center justify-center flex-1 h-full p-2 bg-green-500 text-white shadow rounded-lg">
                                            <div className="relative">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="White">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => handleDecline(friend.id)}>
                            <div className="max-w-2xl">
                                <div className="w-auto h-auto">
                                    <div className="flex-1 h-full">
                                        <div className="flex items-center justify-center flex-1 h-full p-2 bg-red-500 text-white shadow rounded-lg">
                                            <div className="relative">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="White">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12h6m-6 0H6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                </div>
            </div>
            ))}
        </div>
    );
}

export default Requests;


if (document.getElementById('Requests')) {
    const rootElement = document.getElementById('Requests');

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Requests />
        </React.StrictMode>
    );
}
