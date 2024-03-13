import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import allLocales from '@fullcalendar/core/locales-all'
import interactionPlugin from "@fullcalendar/interaction";
import {toast, ToastContainer} from "react-toastify";
import Moment from 'moment';


const Calendar = () => {
    const [newEventVisible, setNewEventVisible] = useState(false);
    const [editEventVisible, setEditEventVisible] = useState(false);
    const [isInviteVisible, setInviteVisible] = useState(false);
    const [events, setEvents] = useState([]);
    const [data, setData] = useState({
        day:null,
        eventId:null,
        eventName:null,
        eventContent:null,
        eventOwner:null,
        eventOwnerName:null,
    });



    useEffect(() => {
        fetch('calendar/api/events')
            .then(response => response.json())
            .then(data => setEvents(data.UserEvents))
            .catch(error => console.error('Błąd pobierania danych:', error));
    }, []);

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
    const handleDateClick = (date) => {
        setData(prevData => ({ ...prevData,day:date}));
        setNewEventVisible(true);
    };
    const handleEventClick = (eventId,eventTitle,date,eventContent,eventOwner,eventOwnerName) => {
        setData({
            eventId: eventId,
            eventName: eventTitle,
            day: date,
            eventContent: eventContent,
            eventOwner: eventOwner,
            eventOwnerName:eventOwnerName,
        });
        setEditEventVisible(true);
    };

    const eventClose = () => {
        setNewEventVisible(false);
        setEditEventVisible(false);
    };

    const handleInviteClose = () => {
        setInviteVisible(false);
    };

    const eventShare = () => {
        setEditEventVisible(false);
        fetchInfo(data.eventId);
    };

    function fetchInfo(eventId) {
        fetch(`calendar/api/event/${eventId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(prevData => ({ ...prevData, eventMembers: data.eventMembers, userGroups: data.userGroups, userFriends :data.userFriends}));
                setInviteVisible(true);
            })
            .catch(error => {
                console.error('Error fetching messages:', error.message);
                console.log('Response content:', error.response && error.response.text());
            });
    }

    const handleMemberAdd = (memberId, type) => {
        const url = type !== "User" ? `/calendar/addGroup/${data.eventId}/${memberId}` : `/calendar/addUser/${data.eventId}/${memberId}`;
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
                        setData(prevData => ({ ...prevData, eventMembers: [data.newUser, ...prevData.eventMembers], }));
                    }
                    if(data.newGroup){
                        setData(prevData => ({...prevData, userGroups: prevData.userGroups.filter(group => group.group_id !== data.newGroup.group_id),}));
                        setData(prevData => ({...prevData, eventMembers: [data.newGroup, ...prevData.eventMembers],}));
                        data.newGroup.newUser.forEach((newUser) => {
                            setData(prevData => ({...prevData, userFriends: prevData.userFriends.filter(user => user.user_id !== newUser.user_id),}));
                            setData(prevData => ({ ...prevData, eventMembers: [newUser, ...prevData.eventMembers], }));
                        });
                    }
                }
            })
            .catch(error => {
            });
    };

    const handleMemberRemove = (memberId, type) => {
        const url = type !== "User" ? `calendar/removeGroup/${data.eventId}/${memberId}` : `calendar/removeUser/${data.eventId}/${memberId}`;
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
                        setData(prevData => ({...prevData, eventMembers: prevData.eventMembers.filter(user => user.user_id !== data.removedUser.user_id),}));
                        setData(prevData => ({ ...prevData, userFriends: [data.removedUser, ...prevData.userFriends], }));
                    }
                    if(data.removedGroup){
                        setData(prevData => ({...prevData, eventMembers: prevData.eventMembers.filter(group => group.group_id !== data.removedGroup.group_id),}));
                        setData(prevData => ({...prevData, userGroups: [data.removedGroup, ...prevData.userGroups],}));
                        setData(prevData => ({...prevData,eventMembers: prevData.eventMembers.filter(user => !data.deletedUsers.some(deletedUser => deletedUser.user_id === user.user_id)),}));
                        setData(prevData => ({...prevData,userFriends: [...data.deletedUsers, ...prevData.userFriends],}));
                    }
                }
            })
            .catch(error => {
            });
    };

    const eventDelete = () => {
        fetch(`${window.location.origin}/calendar/eventDelete/${data.eventId}`, {
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
                    setEditEventVisible(false);
                }
            })
            .catch(error => {
                toast.error(error.message , {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            });
    };



    const handleEventAdd = (eventTitle, eventContent, date, actionType) => {

        if(actionType==="edit" && eventTitle===data.eventName && eventContent===data.eventContent){
            toast.error('Brak zmian do wprowadzenia!', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
            return;
        }
        const url = actionType !== "new" ? `${window.location.origin}/calendar/eventEdit/${data.eventId}` : `${window.location.origin}/calendar/eventCreate`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.csrfToken,
            },
            body: JSON.stringify({ eventTitle, eventContent, date}),
        })
            .then(response => response.json())
            .then(data => {
                toast.error(data.message, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
                if (data.success) {
                    localStorage.setItem('toastMessages', JSON.stringify(data.messages));
                    localStorage.setItem('shouldShowToast', 'true');
                    window.location.reload(false);
                }

            })
            .catch(error => {
                console.log('Błąd podczas przetwarzania żądania:', error);
            });
    };


    const ModalEvent = ({ isVisible, onClose, onSubmit, titleValue, contentValue, actionType, shared}) => {
        const [eventTitleValue, setEventTitleValue] = React.useState(titleValue);
        const [eventContentValue, setEventContentValue] = React.useState(contentValue);
        return isVisible && (
            <div className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50`}>
                <div className={`p-4 rounded-xl shadow-lg w-5/6 md:w-4/6 lg:w-3/5 xl:w-2/5 2xl:w-2/6 h-2/3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-100 flex flex-col items-center`}>
                        <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={onClose}>
                            <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </span>
                    <div className='flex pt-10 border-b-2 border-black w-2/3'>
                        { data.eventOwner || shared?
                            <input className='w-full h-10 bg-transparent border-none text-center text-2xl rounded-lg placeholder-black' spellCheck="false" placeholder={"Wprowadź nazwe wydarzenia..." } value={eventTitleValue || ''} onChange={(e) => setEventTitleValue(e.target.value)}></input>
                        :
                            <p className='w-full h-10 bg-transparent border-none text-center text-2xl rounded-lg placeholder-black'>{titleValue}</p>
                        }
                    </div>
                    <div className='flex pt-14 items-center justify-content-center text-xl'>
                        Data wydarzenia: <p className="inline ms-10 font-bold border-indigo-400 border-b-4">{data.day}</p>
                    </div>
                    <div className='flex-col h-2/5 pt-12 w-3/4'>
                        <h3 className="text-indigo-400 tex-xs flex justify-center w-full font-bold">Opis wydarzenia:</h3>
                        { data.eventOwner || shared?
                        <textarea className='rounded-lg w-full h-full bg-transparent border-2 border-gray-600 resize-none text-l text-decoration-none hover:none leading-9' spellCheck="false" value={eventContentValue || ''} onChange={(e) => setEventContentValue(e.target.value)}></textarea>
                        :
                        <p className='rounded-lg w-full h-full bg-transparent e text-l text-decoration-none hover:none leading-9 text-center'>{contentValue}</p>
                        }
                    </div>
                    { data.eventOwner || shared?
                    <div className={`absolute left-4 bottom-4 ${shared}`}>
                        <svg className="w-6 h-6 text-gray-800 dark:text-gray-500 inline mr-1 cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18" onClick={eventShare}>
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 8h6m-3 3V5m-6-.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 11h3a4 4 0 0 1 4 4v2H1v-2a4 4 0 0 1 4-4Z"/>
                        </svg>
                        <svg className="w-6 h-6 text-gray-800 dark:text-gray-500 inline ml-2 cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20" onClick={eventDelete}>
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h16M7 8v8m4-8v8M7 1h4a1 1 0 0 1 1 1v3H6V2a1 1 0 0 1 1-1ZM3 5h12v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z"/>
                        </svg>
                    </div>
                    : null }
                    { data.eventOwner || shared ? <button className="flex mt-10 border-2 p-1 px-3 border-gray-600 text-gray-800 rounded-full items-end justify-end font-bold" onClick={()=>onSubmit(eventTitleValue, eventContentValue, data.day, actionType)}>Zapisz</button>
                        :
                        <div className={`absolute left-4 bottom-4 ${shared}`}>
                            <p className="text-gray-800">Owner: {data.eventOwnerName}</p>
                        </div>
                    }

                </div>
            </div>
        )
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

    return (
        <>
            <ToastContainer/>
            <FullCalendar
                plugins={[dayGridPlugin,interactionPlugin]}
                initialView="dayGridMonth"
                height ={'100%'}
                aspectRatio={2}
                locales={allLocales}
                locale={'pl'}
                events={events}
                dateClick={(info) => handleDateClick(info.dateStr)}
                headerToolbar={{
                    left:'',
                    center: 'title',
                }}
                eventClick={(info) => {
                    handleEventClick(info.event.id, info.event.title,Moment(info.event.start).format('YYYY-MM-DD'), info.event.extendedProps.description, info.event.extendedProps.isOwner, info.event.extendedProps.ownerName);
                }}
            />

            <ModalEvent
                isVisible={newEventVisible}
                onClose={eventClose}
                onSubmit={handleEventAdd}
                titleValue={''}
                contentValue={''}
                actionType={'new'}
                shared={'hidden'}
            />
            <ModalEvent
                isVisible={editEventVisible}
                onClose={eventClose}
                onSubmit={handleEventAdd}
                titleValue={data.eventName}
                contentValue={data.eventContent}
                actionType={'edit'}
            />
            {isInviteVisible && (
                <div className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50`}>
                    <div className={`p-4 min-h-104 shadow-lg w-3/4 lg:w-5/6 xl:w-2/3 2xl:w-1/2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl`}>
                        <span className="absolute top-2 right-2 cursor-pointer text-black" onClick={handleInviteClose}>
                            <svg className="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </span>
                        <div className="flex flex-col items-center justify-center h-[calc(100vh-450px)]">
                            <div className='flex top-4'>
                                <p className='h-auto bg-transparent border-none text-center font-bold text-2xl underline underline-offset-8'>Zarządzaj członkami "{data.eventName}"</p>
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
                                    {Array.isArray(data.eventMembers) && data.eventMembers.length > 0 ? (
                                        data.eventMembers.map((info, index) => (
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
        </>
        );
}

export default Calendar;

if (document.getElementById('Calendar')) {
    const rootElement = document.getElementById('Calendar');

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Calendar />
        </React.StrictMode>
    );
}
