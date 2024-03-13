import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Gallery = () => {
    const [data, setData] = useState({
        photoId: null,
        photoUrl: null,
        photoName: null,
        folderId: null,
        folderName: null,
        type:null,
        elementMembers:[],
        userGroups:[],
        userFriends:[],
    });
    const [isInviteVisible, setInviteVisible] = useState(false);
    const [isFolderInviteVisible, setFolderInviteVisible] = useState(false);
    const [isNameVisible, setNameVisible] = useState(false);
    const [isFolderNameVisible, setFolderNameVisible] = useState(false);
    const [NewFolderVisible, setNewFolderVisible] = useState(false);
    const [fullScreenVisible, setFullScreenVisible] = useState(false);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [photoNameValue, setPhotoNameValue] = useState('');
    const [folderNameValue, setFolderNameValue] = useState('');

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

        const addClickEventListener = (selector, handler) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.addEventListener('click', handler);
            });
            return () => {
                elements.forEach(element => {
                    element.removeEventListener('click', handler);
                });
            };
        };


        const cleanupFunctions = [
            addClickEventListener('.photo-name', handleName),
            addClickEventListener('.photo-content', handleContent),
            addClickEventListener('.photo-delete', handleDelete),
            addClickEventListener('.photo-share', handleShare),
            addClickEventListener('.folder-content', handleContentFolder),
            addClickEventListener('.folder-name', handleNameFolder),
            addClickEventListener('.folder-delete', handleDeleteFolder),
            addClickEventListener('.folder-share', handleShareFolder),
        ];

        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }, []);


    const handleContentFolder = (event) => {
        const folderName = event.currentTarget.dataset.folderName;
        const folderShared = event.currentTarget.dataset.folderShared;
        if(folderName==="Main"){
            window.location.href = `${window.location.origin}/gallery`;
        }else if(folderName==="Shared"){
            window.location.href = `${window.location.origin}/gallery/Shared`;
        }else if(folderName==="NewFolder") {
            setNewFolderVisible(true);
        }else if(folderShared !== 'owner') {
            window.location.href = `${window.location.origin}/gallery/shared/${folderName}`;
        }else{
            window.location.href = `${window.location.origin}/gallery/${folderName}`;
        }
    };

    const handleNameFolder = (event) => {
        const folderId = event.currentTarget.dataset.folderId;
        setFolderNameValue(event.currentTarget.dataset.folderName);
        setData((prevData) => ({
            ...prevData,folderId: folderId, type: "folder"
        }));
        setFolderNameVisible(true);
    };

    const handleDeleteFolder = (event) => {
        const folderId = event.currentTarget.dataset.folderId;
        const folderName = event.currentTarget.dataset.folderName;
        setData((prevData) => ({
            ...prevData,folderId: folderId, folderName: folderName, type: "folder"
        }));
        setDeleteConfirmVisible(true);
    };

    const handleShareFolder = (event) => {
        const folderId = event.currentTarget.dataset.folderId;
        const folderName = event.currentTarget.dataset.folderName;
        setData((prevData) => ({
            ...prevData,folderName: folderName, folderId: folderId
        }));
        fetchInfo(folderId, "folder");
    };

    const FolderInviteClose = () => {
        setFolderInviteVisible(false);
    };

    const handleNameClose = () => {
        setNameVisible(false);
        setFolderNameVisible(false);
        setData((prevData) => ({
            ...prevData,type: null
        }));
    };
    const deleteConfirmVisibleClose = () => {
        setDeleteConfirmVisible(false);
        setData((prevData) => ({
            ...prevData, type: null
        }));

    };
    const NewFolderVisibleClose = () => {
        setNewFolderVisible(false);
        setData((prevData) => ({
            ...prevData,folderId: null, folderName: null
        }));
    };

    const fullScreenClose = () => {
        setFullScreenVisible(false);
    };

    const handleName = (event) => {
        const photoId = event.currentTarget.dataset.photoId;
        setData((prevData) => ({
            ...prevData,photoId: photoId, type:"photo"
        }));
        setPhotoNameValue(event.currentTarget.dataset.photoName);
        setNameVisible(true);
    };

    const handleContent = (event) => {
        const photoName = event.currentTarget.dataset.photoName;
        const photoUrl = event.currentTarget.dataset.photoUrl;

        setData((prevData) => ({
            ...prevData,photoUrl: photoUrl,photoName: photoName,
        }));
        setFullScreenVisible(true);
    };

    const handleDelete = (event) => {
        const photoId = event.currentTarget.dataset.photoId;
        elementDelete(photoId,"photo")
    };

    const handleDeleteFolderAgree = () => {
        elementDelete(data.folderId,"folder")
        setDeleteConfirmVisible(false);
    };

    function elementDelete(elementId, type){
        const url = type !== "photo" ? `${window.location.origin}/gallery/deleteFolder/${elementId}` : `${window.location.origin}/gallery/delete/${elementId}`;
        fetch(url, {
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
                    if(data.deletedPhoto){
                        const photoLink = document.querySelector(`div[data-photo-id="${data.deletedPhoto}"]`);
                        photoLink.remove();
                    }else{
                        const folderLink = document.querySelector(`div[data-folder-id="${data.deletedFolder}"]`);
                        folderLink.remove();
                    }
                }
            })
            .catch(error => {
                toast.error(error.message , {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            });
    }

    function handleShare(event){
        const photoId = event.currentTarget.dataset.photoId;
        const photoName = event.currentTarget.dataset.photoName;
        setData((prevData) => ({
            ...prevData,photoName: photoName, photoId: photoId
        }));
        fetchInfo(photoId, "photo");
    }

    function InviteVisibleClose(event){
        setInviteVisible(false);
    }


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
        const currentPath = window.location.pathname;
        let url;
        if(currentPath === "/gallery"){
            url = `/gallery/upload/`;
        }else{
            const parts = currentPath.split('/');
            const folderName = parts[parts.length - 1];
            url =`${window.location.origin}/gallery/upload/${folderName}`;
        }

        await fetch(url, {
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

    const handleNewNameSend = (newName) => {
        if (newName.length <= 50) {
        const url = data.type !== "photo" ? `${window.location.origin}/gallery/renameFolder/${data.folderId}` : `${window.location.origin}/gallery/rename/${data.photoId}`;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': window.csrfToken,
                },
                body: JSON.stringify({newName}),
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
                    if (data.success && data.photoId) {
                        const photoName = document.querySelector(`p[data-photo-id="${data.photoId}"]`);
                        photoName.innerText = data.newName+data.extension;
                        const photoNameButton = document.querySelector(`button[data-photo-id="${data.photoId}"].photo-name`);
                        photoNameButton.dataset.photoName = data.newName;
                    }else if(data.success && data.folderName){
                        window.location.href = `${window.location.origin}/gallery/${data.folderName}`;
                    }
                })
            handleNameClose();
        } else {
            toast.error('Długość nazwy przekracza 50 znaków.', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
        }
    };

    const handleNewFolderName = (folderNameValue) => {
        if (folderNameValue.length <= 50) {
            fetch(`/gallery/newFolder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': window.csrfToken,
                },
                body: JSON.stringify({folderNameValue}),
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
                    if (data.success) {
                        localStorage.setItem('toastMessages', JSON.stringify(data.messages));
                        localStorage.setItem('shouldShowToast', 'true');
                        if(data.success){window.location.reload(false);}
                    }
                })
                .catch(error => {
                    console.log('Błąd podczas przetwarzania żądania:', error);
                });
            NewFolderVisibleClose();
        } else {
            toast.error('Długość nazwy przekracza 50 znaków.', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
        }
    }

    const ModalName = ({ isVisible, onClose, onConfirm, content, value }) => {
        const [inputValue, setInputValue] = React.useState(value);
        return isVisible && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
                <div className="bg-white p-4 rounded shadow-lg w-4/5 md:w-3/5 md:min-w-80 xl:w-2/5 2xl:w-1/3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={onClose}>
                            <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </span>

                    <h2 className="flex text-2xl font-bold mb-4 text-black justify-center">{content}</h2>

                    <input
                        type="text"
                        className="w-full p-2 border mb-4 text-black"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />

                    <button
                        onClick={() => onConfirm(inputValue)}
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 "
                    >
                        Zmień
                    </button>
                </div>
            </div>
        );
    };

    function fetchInfo(elementId, type) {
        const url = type !== "photo" ? `${window.location.origin}/gallery/api/folder/${elementId}` : `${window.location.origin}/gallery/api/photo/${elementId}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(prevData => ({ ...prevData, elementMembers: data.elementMembers, userGroups: data.userGroups, userFriends :data.userFriends}));
                if(type === "folder"){
                    setFolderInviteVisible(true);
                }else if(type === "photo"){
                    setInviteVisible(true);
                }
            })
            .catch(error => {
                console.error('Error fetching messages:', error.message);
                console.log('Response content:', error.response && error.response.text());
            });
    }

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

    const ModalShare = ({ isVisible, onClose, shareTitle, content, type }) => {
        return isVisible && (
            <div className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50`}>
                <div className={`p-4 min-h-104 shadow-lg w-3/4 lg:w-5/6 xl:w-2/3 2xl:w-1/2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl`}>
                        <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={onClose}>
                            <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </span>
                    <div className="flex flex-col items-center justify-center">
                        <div className='flex top-4'>
                            <p className='h-auto bg-transparent border-none text-center font-bold text-2xl underline underline-offset-8'>{content} "{shareTitle}</p>
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
                                {Array.isArray(data.elementMembers) && data.elementMembers.length > 0 ? (
                                    data.elementMembers.map((info, index) => (
                                        <a className="note-link" key={index}>
                                            {(info.surname) ? (
                                                <div className="flex hover:bg-slate-100 transition px-5 py-3">
                                                    <div className="w-[50px] h-[50px] rounded-full overflow-hidden mr-4">
                                                        <img src={info.avatar_url ? `${window.location.origin}/${info.avatar_url}` : `https://ui-avatars.com/api/?name=${info.name}+${info.surname}&background=818cf8&color=fff`} width="50" className={"rounded-full object-cover w-full h-full"} />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="text-violet-500 tex-md">{info.name} {info.surname}</h3>
                                                        <p className="text-sm text-gray-400 font-light ">{info.email}</p>
                                                    </div>
                                                    <div className="flex justify-items-end ml-auto">
                                                        <button onClick={() => handleMemberRemove(info.user_id, "user", type)}>
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
                                            ) : (
                                                <div className="flex hover:bg-slate-100 transition px-5 py-3">
                                                    <div className="pr-4">
                                                        <img src={`${window.location.origin}/images/groupAvatar.png`} width="50" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="text-violet-500 tex-md">{info.name}</h3>
                                                    </div>
                                                    <div className="flex justify-items-end ml-auto">
                                                        <button onClick={() => handleMemberRemove(info.group_id, "group", type)}>
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
                                    <div>
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
                                                    <img src={`https://ui-avatars.com/api/?name=${info.name}+${info.surname}&background=818cf8&color=fff`} className="rounded-full object-cover w-full h-full" width="50" />
                                                </div>
                                                <div>
                                                    <h3 className="text-violet-500 tex-md">{info.name} {info.surname}</h3>
                                                </div>
                                                <div className="flex justify-items-end ml-auto">
                                                    <button onClick={() => handleMemberAdd(info.user_id, "user", type)}>
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
                                    <div>
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
                                                    <button onClick={() => handleMemberAdd(info.group_id, "group", type)}>
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
                                    <div>
                                        Brak grup do wyswietlenia.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleMemberAdd = (memberId, group, type ) => {
        let url;
        if ((group === "group" && type === "folder")) {
            url = `${window.location.origin}/gallery/addGroup/${type}/${data.folderId}/${memberId}`;
        } else if ((group === "user" && type === "photo") ) {
            url = `${window.location.origin}/gallery/addUser/${type}/${data.photoId}/${memberId}`;
        }else if(group === "group" && type === "photo"){
            url = `${window.location.origin}/gallery/addGroup/${type}/${data.photoId}/${memberId}`;
        }else if(group === "user" && type === "folder"){
            url = `${window.location.origin}/gallery/addUser/${type}/${data.folderId}/${memberId}`;
        }
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
                        setData(prevData => ({ ...prevData, elementMembers: [data.newUser, ...prevData.elementMembers], }));
                    }
                    if(data.newGroup){
                        setData(prevData => ({...prevData, userGroups: prevData.userGroups.filter(group => group.group_id !== data.newGroup.group_id),}));
                        setData(prevData => ({...prevData, elementMembers: [data.newGroup, ...prevData.elementMembers],}));
                        data.newGroup.newUser.forEach((newUser) => {
                            console.log(newUser.user_id);
                            setData(prevData => ({...prevData, userFriends: prevData.userFriends.filter(user => user.user_id !== newUser.user_id),}));
                            setData(prevData => ({ ...prevData, elementMembers: [newUser, ...prevData.elementMembers], }));
                        });
                    }
                }
            })
    };

    const handleMemberRemove = (memberId, group, type) => {
        let url;

        if ((group === "group" && type === "folder")) {
            url = `${window.location.origin}/gallery/removeGroup/${type}/${data.folderId}/${memberId}`;
        } else if ((group === "user" && type === "photo") ) {
            url = `${window.location.origin}/gallery/removeUser/${type}/${data.photoId}/${memberId}`;
        }else if(group === "group" && type === "photo"){
            url = `${window.location.origin}/gallery/removeGroup/${type}/${data.photoId}/${memberId}`;
        }else if(group === "user" && type === "folder"){
            url = `${window.location.origin}/gallery/removeUser/${type}/${data.folderId}/${memberId}`;
        }
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
                        setData(prevData => ({...prevData, elementMembers: prevData.elementMembers.filter(user => user.user_id !== data.removedUser.user_id),}));
                        setData(prevData => ({ ...prevData, userFriends: [data.removedUser, ...prevData.userFriends], }));
                    }
                    if(data.removedGroup){
                        setData(prevData => ({...prevData, elementMembers: prevData.elementMembers.filter(group => group.group_id !== data.removedGroup.group_id),}));
                        setData(prevData => ({...prevData, userGroups: [data.removedGroup, ...prevData.userGroups],}));
                        setData(prevData => ({...prevData,elementMembers: prevData.elementMembers.filter(user => !data.removedGroup.deletedUsers.some(deletedUser => deletedUser.user_id === user.user_id)),}));
                        setData(prevData => ({...prevData,userFriends: [...data.removedGroup.deletedUsers, ...prevData.userFriends],}));
                    }
                }
            })
            .catch(error => {
            });
    };

    return (
        <div>
            <ToastContainer />
            <label htmlFor="file-input" className={`flex flex-col h-48 w-36 md:w-44 border-2 rounded-xl ml-3 mt-3 relative cursor-pointer ${(window.location.pathname === "/gallery/Shared") || window.location.pathname.startsWith("/gallery/shared/") ? 'hidden' : ''}`}>
                    <div className="h-2/3 mt-4 mx-2 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-800 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 1v16M1 9h16"/>
                        </svg>
                        <input id="file-input" type="file" className="hidden" onChange={handleFileChange} />
                    </div>
                    <div className="flex items-center justify-center flex-row h-1/3 w-full mb-2 ml-auto">
                        <p className="font-bold text-sm">Dodaj zdjęcie</p>
                    </div>
                </label>
            <ModalName
                isVisible={isNameVisible}
                onClose={handleNameClose}
                value={photoNameValue}
                onConfirm={handleNewNameSend}
                content={"Zmień nazwę obrazu"}
            />
            <ModalName
                isVisible={isFolderNameVisible}
                onClose={handleNameClose}
                value={folderNameValue}
                onConfirm={handleNewNameSend}
                content={"Zmień nazwę folderu"}
            />
            {NewFolderVisible && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded shadow-lg w-1/3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={NewFolderVisibleClose}>
                            <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </span>

                        <h2 className="flex text-2xl font-bold mb-4 text-black justify-center">Nazwa nowego folderu</h2>

                        <input
                            type="text"
                            className="w-full p-2 border mb-4 text-black"
                            value={folderNameValue}
                            onChange={(e) => setFolderNameValue(e.target.value)}
                        />


                        <button
                            onClick={() => handleNewFolderName(folderNameValue)}
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 "
                        >
                            Dodaj
                        </button>
                    </div>
                </div>
            )}
            {fullScreenVisible && (
                <div className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50`}>
                    <div className={`p-4 rounded shadow-lg mx-1 md:mx-0 w-full md:w-2/3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-400`}>
                        <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={fullScreenClose}>
                            <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </span>
                        <div className="flex flex-col items-center justify-center h-[calc(75vh)]">
                            <img src={`${window.location.origin}/gallery/photo/${data.photoUrl}${data.photoName}`} alt="Zdjęcie" className="object-center object-scale-down rounded-xl max-h-full max-w-full" />
                        </div>
                    </div>
                </div>
            )}
            {deleteConfirmVisible && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded shadow-lg w-1/3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={deleteConfirmVisibleClose}>
                    <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </span>
                        <h2 className="text-2xl font-bold mb-4 text-black text-center">Usuwasz folder "{data.folderName}"</h2>
                        <div className="flex justify-center items-center">Usunięcie folderu spowoduje usunięcie zdjęć z folderu. Chcesz kontynuować?</div>
                        <div className="flex justify-center items-center">
                            <button  className="bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-5 mr-5" onClick={handleDeleteFolderAgree}>
                                Tak
                            </button>
                            <button  className="bg-red-600 text-white font-bold py-2 px-4 rounded-full mt-5" onClick={deleteConfirmVisibleClose}>
                                Anuluj
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ModalShare
                isVisible={isInviteVisible}
                onClose={InviteVisibleClose}
                value={folderNameValue}
                onConfirm={handleNewNameSend}
                content={"Dodaj użytkowników do zdjęcia"}
                shareTitle={data.photoName}
                type="photo"
            />
            <ModalShare
                isVisible={isFolderInviteVisible}
                onClose={FolderInviteClose}
                value={folderNameValue}
                onConfirm={handleNewNameSend}
                content={"Dodaj użytkowników do folderu"}
                shareTitle={data.folderName}
                type="folder"
            />
        </div>
    );
}

export default Gallery;

if (document.getElementById('Gallery')) {
    const rootElement = document.getElementById('Gallery');

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Gallery />
        </React.StrictMode>
    );
}
