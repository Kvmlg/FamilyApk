<x-app-main-layout>
    <x-slot name="title">Chat</x-slot>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
<div class="messanger p-0 bg-white h-full m-0 w-full flex">
    <div class="flex-row flex w-full">
        <div class="flex bg-white border-r border-slate-100 overflow-y-auto h-full w-full md:flex md:w-2/5 xl:w-1/5 min-w-64" id="friends-div">
            <div class="h-[calc(82vh)] w-full">
                <div class="search-box h-10 text-slate-300">
                    <div class="flex justify-between px-5 border-b border-slate-100 pb-4 mt-3">
                        <form class="flex justify-center left-0 w-2/3" action="{{ route('chat.search') }}" method="GET" onsubmit="return submitForm(event)">
                            <i class="fa fa-search pr-2"></i>
                            <input type="text" name="search" id="search" placeholder="Wyszukaj" class="font-light focus:outline-none text-left w-full " />
                        </form>
                        <div class="w-1/6">
                            <div id="Invite"></div>
                        </div>
                    </div>
                </div> <!-- End Search-box -->
                <div class="flex justify-center items-center space-x-4 text-black h-8" id="chatPage">
                    <button id="toggleUsers" class="underline cursor-pointer font-bold text-indigo-400">Użytkownicy</button>
                    <button id="toggleGroups" class="cursor-pointer">Grupy</button>
                </div>
                <div class="user-list bg-white" id="usersSection">
                    <div id="Requests"></div>
                    @foreach( $friendRequests as $friendRequest)
                        <div class="flex hover:bg-slate-100 transition px-5 py-3 ">
                            <div class="w-[50px] h-[50px] rounded-full overflow-hidden mr-4">
                                @if($friendRequest['avatar_url'])
                                    <div class="w-[50px] h-[50px]">
                                        <img src="{{ url('/'.$friendRequest['avatar_url']) }}" class="rounded-full object-cover w-full h-full" />
                                    </div>
                                @else
                                    <img src="https://ui-avatars.com/api/?name={{$friendRequest['name']}}+{{$friendRequest['surname']}}&background=818cf8&color=fff" width="50" class="rounded-full w-50 h-50" />
                                @endif
                            </div>
                            <div class="">
                                <h3 class="text-violet-500 tex-md">{{$friendRequest['name']}} {{$friendRequest['surname']}}</h3>
                                <p class="text-sm text-gray-400 font-light ">#{{$friendRequest['user_id']}}</p>
                            </div>
                            <div class="buttons flex ml-14 ">
                                <form method="POST" action="chat/friend/acceptt/{{$friendRequest['user_id']}}" style="display: inline" class="">
                                    @csrf
                                    <button type="submit" class="none">
                                        <div class="max-w-2xl right-0 pr-0.5">
                                            <div class="w-auto h-auto">
                                                <div class="flex-1 h-full">
                                                    <div class="flex items-center justify-center flex-1 h-full p-2 bg-green-500 text-white shadow rounded-lg">
                                                        <div class="relative">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="White">
                                                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </form>

                                <form method="POST" action="chat/friend/decline/{{$friendRequest['user_id']}}" style="display: inline" class="">
                                    @csrf
                                    <button type="submit" >
                                        <div class="max-w-2xl">
                                            <div class="w-auto h-auto">
                                                <div class="flex-1 h-full">
                                                    <div class="flex items-center justify-center flex-1 h-full p-2 bg-red-500 text-white shadow rounded-lg">
                                                        <div class="relative">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="White">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12h6m-6 0H6" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </form>
                            </div>
                        </div> <!-- Single user item -->
                    @endforeach
                    <div id="usersSection" class="users-list overflow-y-auto w-full">
                        @foreach( $friendsWithNames as  $friendWithNames)
                            <a data-user-id="{{ $friendWithNames['user_id'] }}" class="user-link">
                                <div class="flex hover:bg-slate-100 transition px-5 py-3 hover:cursor-pointer rounded-3xl mt-1 w-full">
                                    <div class="w-[50px] h-[50px] overflow-hidden">
                                        @if($friendWithNames['avatar_url'])
                                            <div class="w-[50px] h-[50px]">
                                                <img src="{{ url('/'.$friendWithNames['avatar_url']) }}" class="rounded-full object-cover w-full h-full" />
                                            </div>
                                        @else
                                            <img src="https://ui-avatars.com/api/?name={{$friendWithNames['name']}}+{{$friendWithNames['surname']}}&background=818cf8&color=fff" width="50" class="rounded-full w-50 h-50" />
                                        @endif
                                    </div>
                                    <div class="pl-2">
                                        <h3 class="text-violet-500 tex-md">{{$friendWithNames['name']}} {{$friendWithNames['surname']}}</h3>
                                        <p class="text-sm text-gray-400 font-light ">{{$friendWithNames['email']}}</p>
                                    </div>
                                </div> <!-- Single user item -->
                            </a>
                        @endforeach
                    </div>
                </div>
                <!-- End User list -->
                <div id="groupsSection" class="groups-list overflow-y-auto" style="display: none;">
                    @foreach( $UserGroups as  $UserGroup)
                        <a data-group-id="{{$UserGroup['group_id']}}" class="group-link">
                            <div class="flex hover:bg-slate-100 transition px-5 py-3 hover:cursor-pointer rounded-3xl">
                                <div class="pr-4">
                                    <img src="{{ url('/images/groupAvatar.png')}}" width="50" />
                                </div>
                                <div>
                                    <h3 class="text-violet-500 tex-md inline">{{$UserGroup['name']}}</h3>
                                    @if($UserGroup['isOwner'] =='owner')
                                        <svg class="w-3 h-3 text-gray-800 dark:text-gray-500 inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19A18.55 18.55 0 0 1 1 4l8-3 8 3a18.549 18.549 0 0 1-8 15Z"/>
                                        </svg>
                                    @endif
                                    <p class="text-sm text-gray-400 font-light ">#{{$UserGroup['group_id']}}</p>
                                </div>
                            </div>
                        </a>
                    @endforeach
                </div>
            </div>
        </div>

        <div id="Messages" class="xl:w-5/6 md:w-3/5 ">
            <div id="MessageZone" class="h-full w-full"></div>
        </div>
    </div>
    <script>
        window.csrfToken = "{{ csrf_token() }}";
        function submitForm(event) {
            event.preventDefault();
            event.target.submit();
        }
    </script>
</div>
</x-app-main-layout>
