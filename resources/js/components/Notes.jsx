import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Notes = () => {
    const [data, setData] = useState({
        noteId: null,
        noteColor:null,
        noteInfo:[],
        noteMembers:[],
        noteOwner:[],
        userGroups:[],
        userFriends:[],
        nextColor:null,
    });
    const [isContentVisible, setContentVisible] = useState(false);
    const [isNewNoteVisible, setNewNoteVisible] = useState(false);
    const [isInviteVisible, setInviteVisible] = useState(false);
    const [noteTitleValue, setNoteTitleValue] = useState('');
    const [noteContentValue, setNoteContentValue] = useState('');
    const handleContentClick = () => {
        setContentVisible(true);
        BgClip();
    };

    const BgClip=()=>{
        document.querySelector(`div[id="viewSlot"]`).classList.add('overflow-clip');
        document.querySelector(`div[id="viewSlot"]`).classList.remove('overflow-y-auto');
    }
    const BgUnClip=()=>{
        document.querySelector(`div[id="viewSlot"]`).classList.remove('overflow-clip');
        document.querySelector(`div[id="viewSlot"]`).classList.add('overflow-y-auto');
    }


    const handleNewNoteClick = () => {
        setNewNoteVisible(true);
        BgClip();
    };

    const handleNewNoteClose = () => {
        setNewNoteVisible(false);
        BgUnClip();
    };

    const handleContentClose = () => {
        setContentVisible(false);
        BgUnClip();
    };

    const handleInviteClick = () => {
        setInviteVisible(true);
        BgClip();
    };

    const handleInviteClose = () => {
        setInviteVisible(false);
        BgUnClip();
    };



    useEffect(() => {

        const noteAdd = document.querySelectorAll('.note-add');
        noteAdd.forEach(link => {
            link.addEventListener('click', handleAdd);
        });

        const noteContent = document.querySelectorAll('.note-content');
        noteContent.forEach(link => {
            link.addEventListener('click', handleClick);
        });

        const noteColor = document.querySelectorAll('.note-color');
        noteColor.forEach(link => {
            link.addEventListener('click', handleColor);
        });

        const noteDelete = document.querySelectorAll('.note-delete');
        noteDelete.forEach(link => {
            link.addEventListener('click', handleDelete);
        });

        return () => {
            noteAdd.forEach(link => {
                link.removeEventListener('click', handleClick);
            });

            noteContent.forEach(link => {
                link.removeEventListener('click', handleDelete);
            });

            noteColor.forEach(link => {
                link.removeEventListener('click', handleColor);
            });

            noteDelete.forEach(link => {
                link.removeEventListener('click', handleAdd);
            });


        };
    }, []);


    const handleClick = (event) => {
        const noteId = event.currentTarget.dataset.noteId;
        if(noteId !== "0"){
            const noteColor = event.currentTarget.dataset.noteColor;
            setData({
                noteId: noteId,
                noteColor: noteColor,
            });
            fetchInfo(noteId, "content");
        }else{
            setData({
                noteColor: "bg-yellow-200",
            });
            handleNewNoteClick();
        }
    };

    const handleAdd = (event) => {
        const noteId = event.currentTarget.dataset.noteId;
        fetchInfo(noteId, "invite");
    };

    const handleColor = (event) => {
        const noteId = event.currentTarget.dataset.noteId;
        const noteColor = event.currentTarget.dataset.noteColor;
        changeColor(noteId,noteColor);
    };

    const handleDelete = (event) => {
        const noteId = event.currentTarget.dataset.noteId;
        handleNoteDelete(noteId);
    };

    function changeColor(noteId,noteColor){

        switch (noteColor) {
            case "bg-green-200":
                console.log(noteColor)
                data.nextColor = "bg-yellow-200";
                break;
            case "bg-yellow-200":
                data.nextColor = "bg-orange-200";
                break;
            case "bg-orange-200":
                data.nextColor = "bg-blue-200";
                break;
            case "bg-blue-200":
                data.nextColor = "bg-green-200";
                break;
            default:
                console.log('Nieprawidłowa wartość koloru:', noteColor);
        }

        fetch(`/notes/color/${noteId}/${data.nextColor}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success){
                    const noteLink = document.querySelector(`div[data-note-id="${noteId}"]`);
                    const noteButton = document.querySelector(`button[data-note-id="${noteId}"][data-note-color="${noteColor}"]`);
                    noteLink.classList.remove(noteColor);
                    noteLink.classList.add(data.color);
                    noteButton.dataset.noteColor = data.color;
                }
            })
            .catch(error => {
                toast.error(data.message , {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            });
    }
    function fetchInfo(noteId, action) {
        fetch(`notes/api/note/${noteId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(prevData => ({ ...prevData, noteInfo: data.noteInfo, noteMembers: data.noteMembers, noteOwner:data.noteInfo.noteOwner, userGroups: data.userGroups, userFriends :data.userFriends}));
                setNoteTitleValue(data.noteInfo.title);
                setNoteContentValue(data.noteInfo.content);
                if(action === "content"){
                    handleContentClick();
                }

                if(action === "invite"){
                    handleInviteClick();
                }

            })
            .catch(error => {
                console.error('Error fetching messages:', error.message);
                console.log('Response content:', error.response && error.response.text());
            });
    }

    const handleNoteChange = (newNoteTitle, newNoteContent, noteId) => {
        const updatedData = {};

        if(newNoteTitle !== data.noteInfo.title) {
            updatedData.title = newNoteTitle;
        }

        if (newNoteContent !== data.noteInfo.content) {
            updatedData.content = newNoteContent;
        }

        if (Object.keys(updatedData).length === 0) {
            return;
        }

        fetch(`/notes/change/${data.noteInfo.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
            body: JSON.stringify({ updatedData }),
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
                    const noteLink = document.querySelector(`div[data-note-id="${noteId}"]`);
                    const noteTitle = noteLink.querySelector('h2');
                    const noteContent = noteLink.querySelector('p');
                    noteTitle.innerText = newNoteTitle;
                    noteContent.innerText = newNoteContent;
                    setContentVisible(false);
                }
            })
            .catch(error => {
                console.log('Błąd podczas przetwarzania żądania:', error);
            });
    };
    const handleNoteAdd = (newNoteTitle, newNoteContent) => {
        const newData = {};

        if(newNoteTitle !== null) {
            newData.title = newNoteTitle;
        }

        if (newNoteContent !== null) {
            newData.content = newNoteContent;
        }

        if (Object.keys(newData).length === 0) {
            return;
        }


        fetch(`/notes/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
            body: JSON.stringify({ newData }),
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
                if(data.success){window.location.reload(false);}

            })
            .catch(error => {
                console.log('Błąd podczas przetwarzania żądania:', error);
            });
    };

    const handleMemberAdd = (memberId, type) => {
        const url = type !== "User" ? `/notes/addGroup/${data.noteInfo.id}/${memberId}` : `/notes/addUser/${data.noteInfo.id}/${memberId}`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                toast.error(data.message , {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
                if(data.success){
                    if(data.newUser){
                        setData(prevData => ({...prevData, userFriends: prevData.userFriends.filter(user => user.user_id !== data.newUser.user_id),}));
                        setData(prevData => ({ ...prevData, noteMembers: [data.newUser, ...prevData.noteMembers], }));
                    }
                    if(data.newGroup){
                        setData(prevData => ({...prevData, userGroups: prevData.userGroups.filter(group => group.group_id !== data.newGroup.group_id),}));
                        setData(prevData => ({...prevData, noteMembers: [data.newGroup, ...prevData.noteMembers],}));
                        data.newGroup.newUser.forEach((newUser) => {
                            setData(prevData => ({...prevData, userFriends: prevData.userFriends.filter(user => user.user_id !== newUser.user_id),}));
                            setData(prevData => ({ ...prevData, noteMembers: [newUser, ...prevData.noteMembers], }));
                        });
                    }
                }
            })
            .catch(error => {
            });
    };

    const handleMemberRemove = (memberId, type) => {
        const url = type !== "User" ? `/notes/removeGroup/${data.noteInfo.id}/${memberId}` : `/notes/removeUser/${data.noteInfo.id}/${memberId}`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                if(data.success){
                    if(data.removedUser){
                        setData(prevData => ({...prevData, noteMembers: prevData.noteMembers.filter(user => user.user_id !== data.removedUser.user_id),}));
                        setData(prevData => ({ ...prevData, userFriends: [data.removedUser, ...prevData.userFriends], }));
                    }
                    if(data.removedGroup){
                        setData(prevData => ({...prevData, noteMembers: prevData.noteMembers.filter(group => group.group_id !== data.removedGroup.group_id),}));
                        setData(prevData => ({...prevData, userGroups: [data.removedGroup, ...prevData.userGroups],}));
                        setData(prevData => ({...prevData,noteMembers: prevData.noteMembers.filter(user => !data.deletedUsers.some(deletedUser => deletedUser.user_id === user.user_id)),}));
                        setData(prevData => ({...prevData,userFriends: [...data.deletedUsers, ...prevData.userFriends],}));
                    }
                }
            })
            .catch(error => {
            });
    };
    const handleNoteDelete = (noteId) => {

        fetch(`/notes/delete/${noteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success){
                    toast.success(data.messages, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                    const noteLink = document.querySelector(`div[data-note-id="${noteId}"]`);
                    if (noteLink) {
                        noteLink.remove();
                    }
                }
            })
            .catch(error => {
                toast.error(error.message , {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            });
    };

    function groupsList() {
        document.querySelector(`div[id="invMembers"]`).classList.add('hidden');
        document.querySelector(`div[id="invGroups"]`).classList.remove('hidden');
    }

    function usersList() {
        document.querySelector(`div[id="invMembers"]`).classList.add('hidden');
        document.querySelector(`div[id="invFriends"]`).classList.remove('hidden');
    }

    function membersList() {
        document.querySelector(`div[id="invFriends"]`).classList.add('hidden');
        document.querySelector(`div[id="invGroups"]`).classList.add('hidden');
        document.querySelector(`div[id="invMembers"]`).classList.remove('hidden');
    }

    return (
        <div>
            <ToastContainer />
            {isNewNoteVisible && (
                <div className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50`}>
                    <div className={`p-4 rounded h-5/6 shadow-lg w-full md:w-2/3 lg:w-3/5 xl:w-1/3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${data.noteColor}`}>
                        <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={handleNewNoteClose}>
                          <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                          </svg>
                        </span>
                            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
                                <div className='absolute top-14 w-1/2 border-b-2 border-black'>
                                    <input className='w-full h-10 bg-transparent border-none text-center font-bold text-2xl rounded-lg' spellCheck="false" placeholder="Wprowadź tytuł" onChange={(e) => setNoteTitleValue(e.target.value)}></input>
                                </div>
                                <div className='absolute top-32 h-[calc(100vh-250px)] w-[calc(100%-30px)]'>
                                <textarea className='rounded-lg w-full h-4/6 bg-transparent border-1 resize-none text-xl text-decoration-none hover:none leading-9' spellCheck="false" placeholder="Wprowadź treść..." onChange={(e) => setNoteContentValue(e.target.value)}>
                                </textarea>
                                </div>
                                <button className="absolute bottom-2 border-2 p-1 px-2 border-gray-600 text-gray-800 rounded-full flex items-end justify-end font-bold" onClick={() => handleNoteAdd(noteTitleValue, noteContentValue)}>Zapisz Notatkę</button>
                            </div>
                    </div>
                </div>
            )}
            {isContentVisible && (
                <div className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50`}>
                    <div className={`p-4 rounded h-5/6 shadow-lg w-full md:w-2/3 lg:w-3/5 xl:w-1/3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${data.noteColor}`}>
                        <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={handleContentClose}>
                          <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                          </svg>
                        </span>
                        {(data.noteInfo.isOwner) ? (
                        <div className="flex flex-col items-center justify-center">
                            <div className='absolute top-14 w-1/2 border-b-2 border-black'>
                                <input className='w-full h-10 bg-transparent border-none text-center font-bold text-2xl rounded-lg' spellCheck="false" defaultValue={noteTitleValue} onChange={(e) => setNoteTitleValue(e.target.value)}></input>
                            </div>
                            <div className='absolute top-32 h-5/6 w-[calc(100%-30px)]'>
                                <textarea className='rounded-lg w-full h-4/6 bg-transparent border-1 resize-none text-xl text-decoration-none hover:none leading-9' spellCheck="false" defaultValue={noteContentValue} onChange={(e) => setNoteContentValue(e.target.value)}>
                                </textarea>
                            </div>
                            <button className="absolute bottom-2 border-2 p-1 px-2 border-gray-600 text-gray-800 rounded-full flex items-end justify-end font-bold" onClick={() => handleNoteChange(noteTitleValue, noteContentValue, data.noteId )}>Zapisz</button>
                        </div>
                            ) : (
                            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
                                <div className='absolute top-14 w-1/2 border-b-2 border-black'>
                                    <p className='w-full h-10 bg-transparent border-none text-center font-bold text-2xl rounded-lg'>{noteTitleValue}</p>
                                </div>
                                <div className='absolute top-32 5/6 w-[calc(100%-30px)] p-3'>
                                <p className='rounded-lg w-full h-full bg-transparent resize-none text-xl text-decoration-none hover:none leading-9 overflow-auto'>
                                    {noteContentValue}
                                </p>
                                </div>
                                {data.noteOwner.name && (
                                    <p className="absolute bottom-2 left-2 text-gray-800 flex items-end justify-end ">Owner: {data.noteOwner.name} {data.noteOwner.surname}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {isInviteVisible && (
                <div className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50`}>
                    <div className={`p-4 min-h-104 shadow-lg w-3/4 lg:w-5/6 xl:w-2/3 2xl:w-1/2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl`}>
                        <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={handleInviteClose}>
                            <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </span>
                        <div className="flex flex-col items-center justify-center h-[calc(100vh-450px)]">
                            <div className='flex top-4'>
                                <p className='h-auto bg-transparent border-none text-center font-bold text-2xl underline underline-offset-8'>Zarządzaj członkami "{noteTitleValue}"</p>
                            </div>
                            <div className='flex top-32 w-full h-[calc(100vh-500px)] pt-5 '>
                                <div className='h-full w-full lg:w-1/3 lg:inline inline overflow-y-auto' id="invMembers">
                                    <div className="flex-row flex w-full justify-center items-center " >
                                        <button className="flex items-start mr-auto lg:hidden" onClick={groupsList}>
                                            <svg className="w-6 h-6 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 19">
                                                <path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z"/>
                                                <path d="M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h-.424a5.016 5.016 0 0 1-1.942 2.232A6.007 6.007 0 0 1 17 17h2a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5ZM5.424 9H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h2a6.007 6.007 0 0 1 4.366-5.768A5.016 5.016 0 0 1 5.424 9Z"/>
                                            </svg>
                                            <svg className="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                            </svg>
                                        </button>

                                        <p className='flex items-center mr-auto ml-auto border-none text-center text-xl'>Członkowie</p>

                                        <button className="flex items-end ml-auto lg:hidden" onClick={usersList}>
                                            <svg className="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                            </svg>
                                            <svg className="w-5 h-5 text-gray-500 mb-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 18">
                                                <path d="M7 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm2 1H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
                                            </svg>
                                        </button>
                                    </div>
                                    {Array.isArray(data.noteMembers) && data.noteMembers.length > 0 ? (
                                        data.noteMembers.map((info, index) => (
                                            <a className="note-link" key={index}>
                                                {(info.surname) ? (
                                                    <div className="flex hover:bg-slate-100 transition px-5 py-3">
                                                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden mr-4">
                                                            <img src={info.avatar_url ? `${window.location.origin}/${info.avatar_url}` : `https://ui-avatars.com/api/?name=${info.name}+${info.surname}&background=818cf8&color=fff`} className="rounded-full object-cover w-full h-full" width="50" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <h3 className="text-violet-500 tex-md">{info.name} {info.surname}</h3>
                                                            <p className="text-sm text-gray-400 font-light ">{info.email}</p>
                                                        </div>
                                                        {!(data.noteOwner.user_id === info.user_id) && (
                                                            <div className="flex justify-items-end ml-auto">
                                                                <button onClick={() => handleMemberRemove(info.user_id, "User")}>
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
                                                ) : (
                                                    <div className="flex hover:bg-slate-100 transition px-5 py-3">
                                                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden mr-4">
                                                            <img src={`${window.location.origin}/images/groupAvatar.png`} width="50" className={"rounded-full object-cover w-full h-full"} />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <h3 className="text-violet-500 tex-md">{info.name}</h3>
                                                        </div>
                                                        <div className="flex justify-items-end ml-auto">
                                                            <button onClick={() => handleMemberRemove(info.group_id, "Group")}>
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
                                                    </div>
                                                )}
                                            </a>
                                        ))):(
                                        <div className={'flex h-3/4 items-center justify-center font-bold justify-items-center'}>
                                            Brak członków.
                                        </div>
                                    )}
                                </div>
                                <div className='h-full w-full hidden lg:w-1/3 lg:inline overflow-y-auto' id="invFriends">
                                    <div className="flex-row flex w-full justify-center items-center">
                                        <button className="flex items-start mr-auto lg:hidden w-1/5" onClick={membersList}>
                                            <svg className="w-6 h-6 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"/>
                                            </svg>
                                        </button>
                                        <p className='flex items-center mr-auto ml-auto border-none text-center text-xl'>Znajomi</p>
                                        <div className="flex items-end ml-auto lg:hidden w-1/5" >

                                        </div>
                                    </div>
                                    {Array.isArray(data.userFriends) && data.userFriends.length > 0 ? (
                                        data.userFriends.map((info, index) => (
                                            <a className="note-link" key={index}>
                                                <div className="flex hover:bg-slate-100 transition px-5 py-3">
                                                    <div className="w-[50px] h-[50px] rounded-full overflow-hidden mr-4">
                                                        <img src={info.avatar_url ? `${window.location.origin}/${info.avatar_url}` : `https://ui-avatars.com/api/?name=${info.name}+${info.surname}&background=818cf8&color=fff`} className="rounded-full object-cover w-full h-full" width="50" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-violet-500 tex-md">{info.name} {info.surname}</h3>
                                                    </div>
                                                    <div className="flex justify-items-end ml-auto">
                                                        <button onClick={() => handleMemberAdd(info.user_id, "User")}>
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
                                                    </div>
                                                </div>
                                            </a>
                                        ))):(
                                        <div className={'flex h-3/4 items-center justify-center font-bold justify-items-center'}>
                                            Brak znajomych.
                                        </div>
                                    )}
                                </div>
                                <div className='h-full w-full hidden lg:w-1/3 lg:inline overflow-y-auto' id="invGroups">
                                    <div className="flex-row flex w-full justify-center items-center">
                                        <button className="flex items-start mr-auto lg:hidden w-1/5" onClick={membersList}>
                                            <svg className="w-6 h-6 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"/>
                                            </svg>
                                        </button>
                                        <p className='flex items-center mr-auto ml-auto border-none text-center text-xl'>Grupy</p>
                                        <div className="flex items-end ml-auto lg:hidden w-1/5" >

                                        </div>
                                    </div>
                                    {Array.isArray(data.userGroups) && data.userGroups.length > 0 ? (
                                        data.userGroups.map((info, index) => (
                                            <a className="note-link" key={index}>
                                                <div className="flex hover:bg-slate-100 transition px-5 py-3 ">
                                                    <div className="pr-4">
                                                        <img src={`${window.location.origin}/images/groupAvatar.png`} width="50" />
                                                    </div>
                                                    <div className="text-ellipsis overflow-hidden">
                                                        <h3 className="text-violet-500 tex-md">{info.name} </h3>
                                                    </div>
                                                    <div className="flex justify-items-end ml-auto">
                                                        <button onClick={() => handleMemberAdd(info.group_id, "Group")}>
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
                                                    </div>
                                                </div>
                                            </a>
                                        ))):(
                                        <div className={'flex h-3/4 items-center justify-center font-bold justify-items-center'}>
                                            Brak grup do wyswietlenia.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notes;

if (document.getElementById('Notes')) {
    const rootElement = document.getElementById('Notes');

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Notes />
        </React.StrictMode>
    );
}
