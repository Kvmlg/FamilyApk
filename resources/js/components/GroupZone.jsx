import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {toast, ToastContainer} from "react-toastify";

const GroupZone = () => {
    const [isInviteVisible, setInviteVisible] = useState(false);
    const [isDeleteVisible, setDeleteVisible] = useState(false);
    const [isLeaveVisible, setLeaveVisible] = useState(false);

    const [data, setData] = useState({
        group_info: [],
        group_memb:[],
        newGroup:[],
        groupid: null,
        userId: null,
    });
    const userEmailRef = useRef('');
    const groupName = useRef('');
    const [groupNameValue, setGroupNameValue] = useState('');

    useEffect(() => {

        const groupLinks = document.querySelectorAll('.group-list a');
        groupLinks.forEach(link => {
            link.addEventListener('click', handleClick);
        });

        return () => {
            groupLinks.forEach(link => {
                link.removeEventListener('click', handleClick);
            });
        };
    }, []);

    useEffect(() => {
        fetch(`/chat/api/senderid`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(prevData => ({ ...prevData, userId: data.senderid }));
            })
            .catch(error => {
                console.error('Error fetching userId:', error.message);
            });
    }, []);


    const Modal = ({ isVisible, onClose, onConfirm, title, content }) => {
        return isVisible && (
            <div className="absolute top-0 left-0 w-screen h-screen md:h-full md:w-full bg-black bg-opacity-50 ">
                <div className="bg-white p-4 rounded shadow-lg w-1/3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-72">
                <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={onClose}>
                    <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </span>

                    <h2 className="text-2xl font-bold mb-4 text-black text-center">{title}</h2>

                    {content}

                </div>
            </div>
        );
    };

    const handleClick = (event) => {
        document.querySelector(`div[id="groups-div"]`).classList.add('hidden');
        document.querySelector(`div[id="Groups"]`).classList.add('w-full');
        document.querySelector(`div[id="Groups"]`).classList.remove('w-0');
        const groupid = event.currentTarget.dataset.groupId;
        if (groupid !== '0') {
            fetchMessages(groupid);
        }else{
            setData((prevData) => ({
                ...prevData,
                group_info: {
                    ...prevData.group_info,
                    group_id: groupid,
                },
            }));
        }
    };

    function fetchMessages(groupid) {
        fetch(`group/api/group/${groupid}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(prevData => ({ ...prevData, group_info: data.group_info, group_memb: data.group_memb}));
                setGroupNameValue(data.group_info.name);
            })
            .catch(error => {
                console.error('Error fetching messages:', error.message);
                console.log('Response content:', error.response && error.response.text());
            });
    }

    const handleDecline = (user_id) => {
        fetch(`/group/remove/${user_id}/${data.group_info.group_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                toast.success(data.messages, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
                setData(prevData => ({
                    ...prevData,
                    group_memb: prevData.group_memb.filter(item => item.user_id !== user_id),
                }));
            })
            .catch(error => {
                toast.error(data.message , {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            });
    };


    const handleGroupNameChange = (newGroupName) => {

        fetch(`/group/change-name/${data.group_info.group_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
            body: JSON.stringify({ newGroupName }),
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
                if(data.success) {
                    updateGroupName(newGroupName)
                }
            })
            .catch(error => {
                console.log('Błąd podczas przetwarzania żądania:', error);
            });
    };

    const handleGroupCreate = (GroupName) => {


        fetch(`/group/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
            body: JSON.stringify({GroupName }),
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
                    setData(prevData => ({
                        ...prevData,
                        group_info: {
                            ...data.newGroup,
                            group_id: data.newGroup.id,
                        },
                        group_memb: data.group_memb,
                    }));
                    setGroupNameValue(data.newGroup.group_name);
                    updateGroupList(data.newGroup);
                }
            })
            .catch(error => {
                console.log('Błąd podczas przetwarzania żądania:', error);
            });

    };


    const updateGroupList = (newGroup) => {
        const groupList = document.querySelector('.groups-list');
        if (groupList) {
            const newGroupElement = document.createElement('a');
            newGroupElement.dataset.groupId = newGroup.group_id;
            newGroupElement.classList.add('group-link');

            newGroupElement.innerHTML = `
            <div class="flex hover:bg-slate-100 transition px-5 py-3 hover:cursor-pointer">
                <div class="pr-4">
                    <img src='/images/groupAvatar.png' class="rounded-full object-cover w-12 h-12" />
                </div>
                <div>
                    <h3 class="text-violet-500 tex-md">${newGroup.group_name}</h3>
                    <p class="text-sm text-gray-400 font-light ">#${newGroup.id}</p>
                </div>
            </div>
        `;

            newGroupElement.setAttribute('data-group-id', newGroup.id);

            newGroupElement.addEventListener('click', handleClick);

            groupList.insertBefore(newGroupElement, groupList.firstChild);
        }
    };


    const handleInviteSend = () => {
        if ( userEmailRef.current) {
            fetch(`group/add/${userEmailRef.current}/${data.group_info.group_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': window.csrfToken,
                },
                body: JSON.stringify({ userEmail: userEmailRef.current || '' }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        setData(prevData => ({
                            ...prevData,
                            group_memb: [
                                ...prevData.group_memb,
                                { ...data.newUser, user_id: data.newUser.id },
                            ],
                        }));
                    }
                    toast.success(data.messages, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                    toast.error(data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                })
                .catch(error => {

                    console.error(error);
                })
                .finally(() => {
                    handleInviteClose();
                });
        } else {
            toast.error('Pole jest puste!', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
        }
        handleInviteClose();
    };

    const updateGroupName = (newName) => {
        const groupId = data.group_info.group_id;
        const groupLink = document.querySelector(`a[data-group-id="${groupId}"]`);
        if (groupLink) {
            const groupNameElement = groupLink.querySelector('.text-violet-500');
            if (groupNameElement) {
                groupNameElement.textContent = newName;
            }
        }
    };

    const handleInviteClick = () => {
        setInviteVisible(true);
    };

    const handleInviteClose = () => {
        setInviteVisible(false);
    };

    const handleDeleteClick = () => {
        setDeleteVisible(true);
    };

    const handleDeleteClose = () => {
        setDeleteVisible(false);
    };

    const handleLeaveClick = () => {
        setLeaveVisible(true);
    };

    const handleLeaveClose = () => {
        setLeaveVisible(false);
    };

    const handleLeaveConfirm = () => {
        fetch(`/group/leave/${data.group_info.group_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                toast.success(data.messages, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
                setData(prevData => ({ ...prevData, group_info: [], group_memb: [] }));
                GroupElementRemove();
            })
            .catch(error => {
                toast.error(data.message , {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            });
        handleLeaveClose();
    };


    const handleDeleteConfirm = () => {
        fetch(`/group/delete/${data.group_info.group_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                toast.success(data.messages, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
                setData(prevData => ({ ...prevData, group_info: [], group_memb: [] }));
                GroupElementRemove();
                groupsList();
            })
            .catch(error => {
                toast.error(data.message , {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            });
    };

    const GroupElementRemove = () => {
        const groupId = data.group_info.group_id;
        const groupLink = document.querySelector(`a[data-group-id="${groupId}"]`);
        if (groupLink) {
            groupLink.remove();
        }
    };

    function groupsList() {
        document.querySelector(`div[id="groups-div"]`).classList.remove('hidden');
        document.querySelector(`div[id="Groups"]`).classList.remove('w-full');
        document.querySelector(`div[id="Groups"]`).classList.add('w-0');
    }

    if(data.group_info.length === 0) {
        return (
        <div className="justify-center items-center bg-slate-100 h-[calc(83vh)] hidden md:flex">
            <ToastContainer />
            <p className="font-bold text-3xl text-gray-500 ">Zarządzaj grupą</p>
        </div>
        );
    }else if(data.group_info.group_id === '0') {
        return (
            <div className="h-[calc(85vh)] w-4/4 flex flex-col border-r border-slate-100 ">
                <ToastContainer />
                <div className="flex justify-center items-center bg-slate-100 h-full flex-col">
                    <img src={`${window.location.origin}/images/groupAvatar.png`} width="200" className={"rounded-full object-cover w-48 h-48"} />
                    <div className="flex mt-5">
                        <input type="text" className="text-center p-2 border-2 rounded-full bg-slate-100 mt-2" placeholder="Wprowadź nazwę grupy" onChange={(e) => groupName.current = e.target.value}/>
                    </div>
                    <button className="bg-violet-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-5 " onClick={() => handleGroupCreate(groupName.current)}>Utwórz</button>
                </div>
            </div>
        );
    }else{
        return (
            <div className="flex-col h-full xl:flex-row flex overflow-y-auto">
                <ToastContainer />
                {(data.userId === data.group_info.owner) ? (
                    <div className="flex h-full w-full xl:w-2/4 flex-col border-r border-slate-100 ">
                        <button className="flex justify-end ml-auto xl:hidden" onClick={groupsList}>
                            <svg className="w-6 h-6 text-gray-500 absolute top-0 left-0 mt-2 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                            </svg>
                        </button>
                        <div className="flex justify-center items-end bg-slate-100 flex-col">
                            <button className="bg-red-400 justify-center hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-5 mr-5" onClick={handleDeleteClick}>Usuń grupę</button>
                        </div>
                        <div className="flex justify-center items-center bg-slate-100 h-full flex-col">
                            <img src={`${window.location.origin}/images/groupAvatar.png`}  className={"rounded-full object-cover w-48 h-48"} />
                            <div className="flex mt-5">
                                <input type="text" name="username" className="text-center p-2 border-2 rounded-full bg-slate-100" value={groupNameValue}  onChange={(e) => setGroupNameValue(e.target.value)}/>
                            </div>
                            <button className="bg-violet-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-5 mb-5" onClick={() => handleGroupNameChange(groupNameValue)}>Zapisz</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full w-full xl:w-2/4 flex-col border-r border-slate-100 ">
                        <button className="flex justify-end ml-auto xl:hidden" onClick={groupsList}>
                            <svg className="w-6 h-6 text-gray-500 absolute top-0 left-0 mt-2 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                            </svg>
                        </button>
                        <div className="flex justify-center items-end bg-slate-100 flex-col">
                            <button className="bg-red-400 justify-center hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-5 mr-5" onClick={handleLeaveClick}>Opuść grupę</button>
                        </div>
                        <div className="flex justify-center items-center bg-slate-100 h-full flex-col">
                            <img src={`${window.location.origin}/images/groupAvatar.png`}  className={"rounded-full object-cover w-48 h-48"} />
                            <div className="flex mt-5 ">
                                <h3 className="text-violet-500 tex-md text-2xl">{data.group_info.name}</h3>
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-full w-full xl:w-2/4 flex flex-col pb-16 border-r border-slate-100  ">
                    <div className="group-list bg-white">
                        <div className="flex transition px-5 py-3">
                            {(data.userId === data.group_info.owner) && (
                                <button onClick={handleInviteClick}>
                                    <h3 className="text-violet-500 tex-md ">Dodaj użytkownika</h3>
                                </button>
                            )}
                        </div>
                        {Array.isArray(data.group_memb) && data.group_memb.length > 0 ? (
                            data.group_memb.map((info, index) => (
                                <a className="group-link" key={index}>
                                    <div className="flex hover:bg-slate-100 transition px-5 py-3">
                                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden mr-4">
                                            <img src={info.avatar_url ? `${window.location.origin}/${info.avatar_url}` : `https://ui-avatars.com/api/?name=${info.name}+${info.surname}&background=818cf8&color=fff`} width="50" className={"rounded-full object-cover w-full h-full"} />
                                        </div>
                                        <div>
                                            <h3 className="text-violet-500 tex-md">{info.name} {info.surname}</h3>
                                            <p className="text-sm text-gray-400 font-light ">{info.email}</p>
                                        </div>
                                        {(!(info.user_id === data.group_info.owner) && (data.userId === data.group_info.owner)) && (
                                            <div className="flex justify-items-end ml-auto">
                                                <button onClick={() => handleDecline(info.user_id)}>
                                                    <div className="w-auto h-auto ">
                                                        <div className="flex-1 h-full">
                                                            <div className="flex items-center justify-center flex-1 h-full p-2 bg-red-500 text-white shadow rounded-lg">
                                                                <div className="relative">
                                                                    <svg className="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16"/>
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </a>
                            ))) : (
                            <div>
                                Brak członków.
                            </div>
                        )}
                    </div>
                </div>

                <Modal
                    isVisible={isInviteVisible}
                    onClose={handleInviteClose}
                    onConfirm={handleInviteSend}
                    title="Dodaj użytkownika do grupy"
                    content={
                        <>
                            <input
                                type="text"
                                placeholder="Email użytkownika"
                                className="w-full p-2 border mb-4 text-black"
                                onChange={(e) => userEmailRef.current = e.target.value}
                            />
                            <button
                                onClick={handleInviteSend}
                                className="bg-indigo-400 text-white p-2 rounded hover:bg-blue-700"
                            >
                                Wyślij zaproszenie
                            </button>
                        </>
                    }
                />

                <Modal
                    isVisible={isDeleteVisible}
                    onClose={handleDeleteClose}
                    onConfirm={handleDeleteConfirm}
                    title="Czy na pewno chcesz usunąć grupę?"
                    content={
                        <>
                            <div className="flex justify-center items-center">Usunięcie grupy spowoduje usunięcie członków i historii czatu.</div>
                            <div className="flex justify-center items-center">
                                <button onClick={handleDeleteConfirm} className="bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-5 mr-5">
                                    Tak
                                </button>
                                <button onClick={handleDeleteClose} className="bg-red-600 text-white font-bold py-2 px-4 rounded-full mt-5">
                                    Anuluj
                                </button>
                            </div>
                        </>
                    }
                />

                <Modal
                    isVisible={isLeaveVisible}
                    onClose={handleLeaveClose}
                    onConfirm={handleLeaveConfirm}
                    title="Czy na pewno chcesz opuścić grupę?"
                    content={
                        <>
                            <div className="flex justify-center items-center">Usunięcie grupy spowoduje usunięcie członków i historii czatu.</div>
                            <div className="flex justify-center items-center">
                                <button onClick={handleLeaveConfirm} className="bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-5 mr-5">
                                    Tak
                                </button>
                                <button onClick={handleLeaveClose} className="bg-red-600 text-white font-bold py-2 px-4 rounded-full mt-5">
                                    Anuluj
                                </button>
                            </div>
                        </>
                    }
                />
            </div>
    );
    }
};

export default GroupZone;

if (document.getElementById('GroupZone')) {
    const rootElement = document.getElementById('GroupZone');

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <GroupZone />
        </React.StrictMode>
    );
}
