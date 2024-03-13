<x-app-main-layout>
    <x-slot name="title">Groups</x-slot>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
<div class="p-0 bg-white h-full m-0 w-full flex">
    <div class="flex-row flex w-full">
        <div class="flex bg-white border-r border-slate-100 overflow-y-auto h-full w-full md:flex md:w-2/5 xl:w-1/5 min-w-64" id="groups-div">
            <div class="h-[calc(82vh)] w-full">
                <div class="group-list bg-white">
                    <a class="group-link">
                        <div class="flex transition px-5 py-3 hover:cursor-pointer justify-center">
                            <a data-group-id="0" class="group-link my-5">
                                <h3 class="text-violet-500">Utwórz nową grupę</h3>
                            </a>
                        </div>
                    </a>
                    <div class="groups-list">
                    @foreach( $UserGroups as  $UserGroup)
                        <a data-group-id="{{$UserGroup['group_id']}}" class="group-link">
                            <div class="flex hover:bg-slate-100 transition px-5 py-3 hover:cursor-pointer rounded-3xl">
                                <div class="pr-4">
                                    <img src={{ url('/images/groupAvatar.png')}} width="50" />
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
                </div> <!-- End User list -->
            </div>
        </div>
        <script>
            window.csrfToken = "{{ csrf_token() }}";
        </script>
        <div id="Groups" class="xl:w-5/6 md:w-3/5 ">
            <div id="GroupZone" class="h-full w-full"></div>
        </div>

    </div>
</div>
</x-app-main-layout>
