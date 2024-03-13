import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';


const MessageZone = () => {

    const [data, setData] = useState({
        messages: [],
        group_memb:[],
        receiver: null,
        userId: null,
        senderid: null,
        senderName: null,
        senderSurname: null,
        channel: null,
        isGroup:null,
    });

    const messagesContainerRef = useRef(null);
    const [selectedUserId, setSelectedUserId] = useState(null);


    const handleLinkClick = (event) => {
        const receiverId = event.currentTarget.dataset.userId || event.currentTarget.dataset.groupId;
        const isGroup = !!event.currentTarget.dataset.groupId;
        document.querySelector(`div[id="friends-div"]`).classList.add('hidden');
        document.querySelector(`div[id="Messages"]`).classList.add('w-full');
        document.querySelector(`div[id="Messages"]`).classList.remove('w-0');
        fetchMessages(receiverId, isGroup);
    };
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };



    useEffect(() => {
        const userLinks = document.querySelectorAll('.user-list a');
        userLinks.forEach(link => {
            link.addEventListener('click', handleLinkClick);
        });

        const groupLinks = document.querySelectorAll('.groups-list a');
        groupLinks.forEach(link => {
            link.addEventListener('click', handleLinkClick);
        });

        return () => {
            userLinks.forEach(link => {
                link.removeEventListener('click', handleLinkClick);
            });

            groupLinks.forEach(link => {
                link.removeEventListener('click', handleLinkClick);
            });
        };
    }, []);



    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        };

        const timeoutId = setTimeout(() => {
            scrollToBottom();
        }, 100);


        return () =>{
            clearTimeout(timeoutId);
        }
    }, [data.messages]);

    useEffect(() => {
        fetch(`${window.location.origin}/chat/api/senderid`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(prevData => ({ ...prevData, senderid: data.senderid}));

                const channel = Echo.private(`friend_accept.${data.senderid}`);

                channel.subscribed(() => {
                }).listen('.RequestAccepted', (event) => {
                    const friendName = event.newFriendName;
                    const friendSurname = event.newFriendSurname;
                    const friendId = event.newFriendId;
                    const friendEmail = event.newFriendEmail;
                    const friendUrl = event.newFriendUrl;
                    let photoUrl = `https://ui-avatars.com/api/?name=${friendName}+${friendSurname}&background=818cf8&color=fff`;
                    if(friendUrl){
                        photoUrl=`${window.location.origin}/${friendUrl}`
                    }

                    const usersList = document.querySelector('.users-list');
                    const existingUser = usersList.querySelector(`[data-user-id="${friendId}"]`);

                    if (!existingUser) {
                        if (usersList) {
                            const newUserElement = document.createElement('a');
                            newUserElement.dataset.userId = friendId;
                            newUserElement.classList.add('user-link');

                            newUserElement.innerHTML = `
                                    <div class="flex hover:bg-slate-100 transition px-5 py-3 hover:cursor-pointer rounded-3xl mt-1 w-full">
                                        <div class="w-[50px] h-[50px]">
                                            <img src='${photoUrl}' class="rounded-full object-cover w-full h-full" />
                                        </div>
                                        <div class="pl-2">
                                            <h3 class="text-violet-500 tex-md">${friendName} ${friendSurname}</h3>
                                            <p class="text-sm text-gray-400 font-light ">${friendEmail}</p>
                                        </div>
                                    </div>
                                `;

                            newUserElement.setAttribute('data-user-id', friendId);

                            newUserElement.addEventListener('click', handleLinkClick);

                            usersList.insertBefore(newUserElement, usersList.firstChild);
                        }
                    }
                });

            })
            .catch(error => {
                console.error('Error fetching userId:', error.message);
            });

    }, []);



    function fetchMessages(receiverId, isGroup) {

        const url = isGroup ? `${window.location.origin}/chat/api/group/${receiverId}` : `${window.location.origin}/chat/api/chat/${receiverId}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(prevData => ({ ...prevData, messages: data.messages, receiver: data.receiver, userId: data.userId, isGroup: isGroup, group_memb: data.group_memb }));
            })
            .catch(error => {
                console.error('Error fetching messages:', error.message);
                console.log('Response content:', error.response && error.response.text());
            });

        joinToChannel(receiverId, isGroup)

    }

    function joinToChannel(receiverId, isGroup){
        fetch(`${window.location.origin}/chat/api/senderid`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(prevData => ({ ...prevData, senderid: data.senderid}));
                const channel = isGroup ? Echo.private(`group_chat.${receiverId}`) : Echo.private(`messenger.${receiverId}.${data.senderid}`);

                channel.subscribed(() => {
                }).listen('.MessageSent', (event) => {

                    const message = event.message;
                    setData(prevData => ({
                        ...prevData,
                        messages: [...prevData.messages, message],
                    }));
                });

            scrollToBottom();
            })
            .catch(error => {
                console.error('Error fetching userId:', error.message);
            });

    }

    function submitOnEnter(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submitForm(event);
        }
    }

    function submitForm(event) {
        event.preventDefault();
        const form = document.getElementById("chatForm");
        const inputMessage = document.getElementById('text-message');
        const userInput = inputMessage.value;
        let formAction = '/chat/' + data.receiver.id;
        let newMessage;

        if(data.isGroup === false){
             newMessage = {
                id: Date.now(),
                message: userInput,
                sender_id: data.userId,
                receiver_id: data.receiver.id,
                created_at: new Date().toISOString(),
            };
        }else{
            formAction = '/chat/group/' + data.receiver.id;
             newMessage = {
                id: Date.now(),
                message: userInput,
                sender_id: data.userId,
                group_receiver: data.receiver.id,
                created_at: new Date().toISOString(),
            };
        }

        fetch(formAction, {
            method: form.method,
            body: new URLSearchParams(newMessage),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => response.json())
            .then(responseData => {
                if (responseData.success && !data.isGroup) {

                    setData(prevData => ({
                        ...prevData,
                        messages: [...prevData.messages, newMessage],
                    }));

                    scrollToBottom();
                }
            })
            .catch(error => {
                console.error('Error sending message:', error.message);
            });

        form.reset();
    }

    function removeConversation() {
        const receiverId = data.receiver.id;
        const url = data.isGroup ? `${window.location.origin}/chat/api/leaveGroup/${receiverId}` : `${window.location.origin}/chat/api/removeFriend/${receiverId}`;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success){
                        const groupLink = document.querySelector(`a[data-group-id="${receiverId}"]`);
                    if (groupLink) {
                        groupLink.remove();
                    }

                    const userLink = document.querySelector(`a[data-user-id="${receiverId}"]`);
                    if (userLink) {
                        userLink.remove();
                    }
                    setData(prevData => ({ ...prevData, messages: [], receiver: null, userId: null, isGroup: null }));

                }
            })
            .catch(error => {
                console.error('Error fetching messages:', error.message);
                console.log('Response content:', error.response && error.response.text());
            });


    }
    function userList() {
        document.querySelector(`div[id="friends-div"]`).classList.remove('hidden');
        document.querySelector(`div[id="Messages"]`).classList.remove('w-full');
        document.querySelector(`div[id="Messages"]`).classList.add('w-0');
    }
    function userInfo() {
        document.querySelector(`div[id="UserMain"]`).classList.add('hidden');
        document.querySelector(`div[id="UserInfo"]`).classList.remove('hidden');
        document.querySelector(`div[id="UserInfo"]`).classList.add('flex');

    }
    function userMain() {
        document.querySelector(`div[id="UserInfo"]`).classList.add('hidden');
        document.querySelector(`div[id="UserMain"]`).classList.remove('hidden');
        document.querySelector(`div[id="UserMain"]`).classList.add('flex');

    }



    if (!data.receiver) {
        return (
            <div className="justify-center items-center bg-slate-100 h-[calc(83vh)] hidden md:flex">
                <p className="font-bold text-3xl text-gray-500 ">Wybierz adresata</p>
            </div>
        );
    } else {
        return (
            <div className="h-full flex overflow-y-hidden w-full">
                <div className="w-full z-20 xl:flex xl:w-3/5 2xl:w-2/3" id="UserMain">
                    <div className="h-[calc(85vh)] flex flex-col pb-16 w-full" >
                        <div className="bg-white user-info-header px-5 py-3">
                            <div className="flex justify-center xl:justify-start items-center">
                                <button className="flex justify-start mr-auto md:hidden" onClick={userList}>
                                    <svg className="w-5 h-5 text-gray-800 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3a3 3 0 1 1-1.614 5.53M15 12a4 4 0 0 1 4 4v1h-3.348M10 4.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 11h3a4 4 0 0 1 4 4v2H1v-2a4 4 0 0 1 4-4Z"/>
                                    </svg>
                                </button>
                                <div className="flex items-center justify-center ">
                                    <div className="w-[40px] h-[40px] rounded-full overflow-hidden mr-4">
                                        {data.receiver.surname ?
                                        <img src={data.receiver.avatar_url ? `${window.location.origin}/${data.receiver.avatar_url}` : `https://ui-avatars.com/api/?name=${data.receiver.name}+${data.receiver.surname}&background=818cf8&color=fff`} className="rounded-full object-cover w-full h-full" width="50" />
                                        :
                                        <img src={`${window.location.origin}/images/groupAvatar.png`} className="rounded-full object-cover w-full h-full" width="50" />
                                        }
                                        </div>
                                    <h3 className="text-gray-400 tex-md pl-4">{data.receiver.name ? `${data.receiver.name} ${data.receiver.surname}` : data.receiver.group_name}</h3>
                                </div>
                                <button className="flex justify-end ml-auto xl:hidden" onClick={userInfo}>
                                    <svg className="w-5 h-5 text-gray-800 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9h2v5m-2 0h4M9.408 5.5h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto h-75 " ref={messagesContainerRef}>
                            {data.messages.map((message, index) => (
                            <div key={index}>
                                {(message?.sender_name && (message.sender_id !== data.userId && ( index === 0 || message.sender_id !== data.messages[index - 1].sender_id))) && (
                                    <p className="text-gray-400 text-xs ml-1">
                                        {message.sender_name} {message.sender_surnname}
                                    </p>
                                )}
                                <div
                                    id="messagesstore"

                                    className={`${
                                        message && (message.receiver_id === data.userId || !(message.sender_id === data.userId))
                                            ? "receive-chat justify-start pl-1"
                                            : "send-chat justify-end pr-1"
                                    } relative flex rounded-2xl break-words`}
                                >
                                    <div
                                        className={`mb-2 max-w-[80%] rounded ${
                                            message && (message.sender_id === data.userId || message.sender_id === data.userId)
                                                ? "bg-violet-400 text-white"
                                                : "bg-violet-200 text-slate-500"
                                        } px-5 py-2 text-sm font-light rounded-2xl break-words`}
                                    >
                                        {message && message.message}
                                    </div>
                                </div>
                            </div>
                            ))}

                            <div className="bg-gray-100 fixed w-full pl-4 bottom-0 b">
                                <form method="POST" action={`${window.location.origin}/chat/${data.receiver.id}`} style={{ margin: '0 auto 0' }} id="chatForm">
                                    <input type="hidden" value={data.receiver.id} name="receiver" />
                                    <input type="hidden" name="_token" value={window.csrfToken} />

                                    <textarea
                                        name="message"
                                        id="text-message"
                                        className="w-full bg-gray-100 pt-3 h-12 focus:outline-none font-light"
                                        placeholder="Write a message"
                                        onKeyDown={(event) => submitOnEnter(event)}
                                    ></textarea>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden h-full xl:flex xl:w-2/5 md:w-full flex-col w-full" id="UserInfo">
                    <div className={`flex flex-col justify-center items-center ${data.receiver.surname ? 'h-full' : 'h-1/2'} bg-slate-100 w-full`}>
                        <button className="flex justify-end ml-auto xl:hidden" onClick={userMain}>
                            <svg className="w-6 h-6 text-gray-500 absolute top-0 left-0 mt-2 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                            </svg>
                        </button>
                        <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
                            {data.receiver.surname ?
                                <img src={data.receiver.avatar_url ? `${window.location.origin}/${data.receiver.avatar_url}` : `https://ui-avatars.com/api/?name=${data.receiver.name}+${data.receiver.surname}&background=818cf8&color=fff`} className="rounded-full object-cover w-full h-full" width="50" />
                                :
                                <img src={`${window.location.origin}/images/groupAvatar.png`} className="rounded-full object-cover w-full h-full" width="50" />
                            }
                        </div>
                        <div className="flex mt-5 ">
                            <h3 className="text-violet-500 tex-md text-2xl">{data.receiver.name ? `${data.receiver.name} ${data.receiver.surname}` : data.receiver.group_name}</h3>
                        </div>
                        <div className="flex mt-5 justify-center w-full">
                            {data.receiver.name ?
                                <div className={"flex flex-col items-center w-3/5"}>
                                    <div className="flex-col mt-5 w-full">
                                        <h3 className="text-gray-400 tex-md flex justify-center mb-3 w-full">
                                            Opis użytkownika:
                                        </h3>
                                        <p className="justify-content-center items-center justify-center flex italic text-gray-700 mb-5">
                                            {data.receiver.user_description}
                                        </p>
                                    </div>
                                    <button className="bg-red-400 justify-center items-center hover:bg-red-800 text-white font-bold py-2 px-4 rounded-full mt-5 w-full" onClick={removeConversation}>
                                        Wyrzuć ze znajomych
                                    </button>
                                </div>
                                :
                                data.receiver.owner !== data.senderid ?
                                    <button className="bg-red-400 justify-center items-center hover:bg-red-800 text-white font-bold py-2 px-4 rounded-full mt-5 " onClick={removeConversation}>Opuść grupę</button>
                                    : null
                            }
                        </div>
                    </div>
                    <div className="flex overflow-y-auto flex-col">
                        {Array.isArray(data.group_memb) && data.group_memb.length > 0 ? (
                            data.group_memb.map((info, index) => (
                                <a className="group-link" key={index}>
                                    <div className="flex hover:bg-slate-100 transition px-5 py-3">
                                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden mr-4">
                                            <img src={info.avatar_url ? `${window.location.origin}/${info.avatar_url}` : `https://ui-avatars.com/api/?name=${info.name}+${info.surname}&background=818cf8&color=fff`} className="rounded-full object-cover w-full h-full" width="50" />
                                        </div>
                                        <div>
                                            <h3 className="text-violet-500 tex-md">{info.name} {info.surname}</h3>
                                            <p className="text-sm text-gray-400 font-light ">{info.email}</p>
                                        </div>
                                    </div>
                                </a>
                            ))) : (
                                <div className="h-full bg-slate-100"></div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
};

export default MessageZone;

if (document.getElementById('MessageZone')) {
    const rootElement = document.getElementById('MessageZone');

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <MessageZone />
        </React.StrictMode>
    );
}
