<x-app-main-layout>
    <x-slot name="title">Groups</x-slot>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script>
        function toggleOptionsList(index, type) {
            const optionsList = document.getElementById(`optionsList-${index}`);
            const optionsFolderList = document.getElementById(`optionsFolderList-${index}`);
            if (type === 'folder' && !optionsFolderList.classList.contains('hidden')) {
                optionsFolderList.classList.add('hidden');
            } else if (type === 'photo' && !optionsList.classList.contains('hidden')) {
                optionsList.classList.add('hidden');
            } else {
                const openLists = document.querySelectorAll('.options-list:not(.hidden)');
                openLists.forEach(list => {
                    list.classList.add('hidden');
                });

                const openFolderLists = document.querySelectorAll('.options-folder-list:not(.hidden)');
                openFolderLists.forEach(list => {
                    list.classList.add('hidden');
                });
                if (type === 'folder') {
                    optionsFolderList.classList.toggle('hidden');
                } else if (type === 'photo') {
                    optionsList.classList.toggle('hidden');
                }
            }
        }

        function hideLists() {
            const openLists = document.querySelectorAll('.options-list:not(.hidden)');
            openLists.forEach(list => {
                list.classList.add('hidden');
            });

            const openFolderLists = document.querySelectorAll('.options-folder-list:not(.hidden)');
            openFolderLists.forEach(list => {
                list.classList.add('hidden');
            });
        }
    </script>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
<div class="h-full w-full">
    <div class="folders min-h-56 ml-6 w-full mt-4 ">
        <p class="font-bold text-xl">Foldery</p>
        <div class="folder-items flex flex-wrap items-center">
            <div class="flex h-12 w-4/5 md:w-48 items-center border-2 rounded-xl justify-center mt-2 md:ml-2 relative cursor-pointer folder-content" data-folder-name="NewFolder">
                <div class="w-1/5 flex justify-center items-end ml-2">
                    <svg class="w-5 h-5 text-gray-800 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                        <path d="M9.043.8a2.009 2.009 0 0 0-1.6-.8H2a2 2 0 0 0-2 2v2h11.443L9.043.8ZM0 6v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6H0Zm11 7h-1v1a1 1 0 1 1-2 0v-1H7a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2Z"/>
                    </svg>
                </div>
                <div class="w-3/5 flex justify-items-end ml-1">
                    <p class="font-bold text-sm">Utwórz folder</p>
                </div>
                <div class="w-1/5 flex justify-center items-end relative"></div>
            </div>


                <div class="flex h-12 w-4/5 md:w-48 items-center border-2 rounded-xl justify-center mt-2 md:ml-2 relative cursor-pointer folder-content @if (request()->path() == 'gallery') bg-gray-200 @endif" data-folder-name="Main">
                    <div class="w-1/5 flex justify-center items-end ml-2">
                        <svg class="w-5 h-5 text-gray-800 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                            <path d="M18 5H0v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5Zm-7.258-2L9.092.8a2.009 2.009 0 0 0-1.6-.8H2.049a2 2 0 0 0-2 2v1h10.693Z"/>
                        </svg>
                    </div>
                    <div class="w-3/5 flex justify-items-end ml-1">
                        <p class="font-bold text-sm">Główny folder</p>
                    </div>
                    <div class="w-1/5 flex justify-center items-end relative"></div>
                </div>

                <div class="flex h-12 w-4/5 md:w-48 items-center border-2 rounded-xl justify-center mt-2 md:ml-2 relative cursor-pointer folder-content @if (request()->path() == 'gallery/Shared') bg-gray-200 @endif" data-folder-name="Shared">
                    <div class="w-1/5 flex justify-center items-end ml-2">
                        <svg class="w-5 h-5 text-gray-800 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 19 19">
                            <path d="M1 19h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H0v10a1 1 0 0 0 1 1ZM0 6h7.443l-1.2-1.6a1 1 0 0 0-.8-.4H1a1 1 0 0 0-1 1v1Z"/>
                            <path d="M17 4h-4.557l-2.4-3.2a2.009 2.009 0 0 0-1.6-.8H4a2 2 0 0 0-2 2h3.443a3.014 3.014 0 0 1 2.4 1.2l2.1 2.8H14a3 3 0 0 1 3 3v8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/>
                        </svg>
                    </div>
                    <div class="w-3/5 flex justify-items-end ml-1">
                        <p class="font-bold text-sm">Udostępnione dla ciebie</p>
                    </div>
                    <div class="w-1/5 flex justify-center items-end relative"></div>
                </div>


            @foreach($UserFolders as $UserFolder)
                <div class="flex h-12 w-4/5 md:w-48 items-center border-2 rounded-xl justify-center mt-2 md:ml-2 relative cursor-pointer @if (request()->path() == 'gallery/'.$UserFolder['name']) bg-gray-200 @endif" data-folder-id="{{$UserFolder['folder_id']}}">
                    <div class="w-1/5 flex justify-center items-end ml-2 folder-content" data-folder-name="{{$UserFolder['name']}}">
                        @if ($UserFolder['isOwner'] === 'owner')
                        <svg class="w-5 h-5 text-gray-800 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                            <path d="M18 5H0v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5Zm-7.258-2L9.092.8a2.009 2.009 0 0 0-1.6-.8H2.049a2 2 0 0 0-2 2v1h10.693Z"/>
                        </svg>
                        @else
                            <svg class="w-5 h-5 text-gray-800 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 19">
                                <path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z"/>
                                <path d="M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h-.424a5.016 5.016 0 0 1-1.942 2.232A6.007 6.007 0 0 1 17 17h2a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5ZM5.424 9H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h2a6.007 6.007 0 0 1 4.366-5.768A5.016 5.016 0 0 1 5.424 9Z"/>
                            </svg>
                        @endif
                    </div>
                    <div class="w-3/5 flex ml-1 folder-content text-ellipsis overflow-hidden h-full justify-items-end items-center" data-folder-name="{{$UserFolder['name']}}" data-folder-shared="{{$UserFolder['isOwner']}}">
                        <p class="font-bold text-sm" title="{{$UserFolder['name']}}">{{$UserFolder['name']}}</p>
                    </div>
                    <div class="w-1/5 flex justify-center items-end relative">
                        <svg class="w-3 h-3 text-gray-800 dark:text-black cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15" onclick="toggleOptionsList({{$UserFolder['folder_id']}}, 'folder')">
                            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
                        </svg>
                        <ul id="optionsFolderList-{{$UserFolder['folder_id']}}" class="absolute hidden bg-white border rounded-md shadow-md p-2 mt-1 right-0 options-folder-list z-50 top-3 h-26 w-36 left-100">
                            @if ($UserFolder['isOwner'] === 'owner') <li class="pt-1 hover:bg-gray-200 flex justify-center "><button class="folder-name w-full h-full" data-folder-id="{{$UserFolder['folder_id']}}" data-folder-name="{{$UserFolder['name']}}" onclick="hideLists()">Zmień nazwe</button></li>@endif
                            <li class="pt-1 hover:bg-gray-200 flex justify-center"><button class="folder-delete w-full h-full" data-folder-id="{{$UserFolder['folder_id']}}" data-folder-name="{{$UserFolder['name']}}" onclick="hideLists()">Usuń</button></li>
                            @if ($UserFolder['isOwner'] === 'owner')<li class="pt-1 hover:bg-gray-200 flex justify-center"><button class="folder-share w-full h-full" data-folder-id="{{$UserFolder['folder_id']}}" data-folder-name="{{$UserFolder['name']}}" onclick="hideLists()">Udostępnij</button></li>@endif
                        </ul>
                    </div>
                </div>
            @endforeach

        </div>
    </div>

    <div class="items min-h-56 ml-6 relative">
        <p class="font-bold text-xl">Zdjęcia</p>
        <div class="photo-items flex flex-wrap items-center">
            <div id="Gallery">
            </div>
            @foreach($UserPhotos as $UserPhoto)
            <div class="flex flex-col h-48 w-36 md:w-44 border-2 rounded-xl ml-3 mt-3 relative" data-photo-id="{{$UserPhoto['photo_id']}}">
                <div class="h-2/3 mt-4 mx-2 photo-content" data-photo-url="{{$UserPhoto['url']}}" data-photo-name="{{$UserPhoto['name']}}">
                    <img src="{{ url('gallery/photo/'.$UserPhoto['url'].$UserPhoto['name']) }}" alt="Zdjęcie" class="object-center object-scale-down rounded-xl h-24 w-48 " />
                </div>
                <div class="flex items-center justify-center flex-row h-1/3 w-full mb-2">
                    <div class="flex ml-auto text-ellipsis overflow-hidden items-center justify-center">
                        <p class="font-bold text-sm text-ellipsis overflow-hidden truncate w-24 text-gray-500" title="{{$UserPhoto['name']}}" data-photo-id="{{$UserPhoto['photo_id']}}">{{$UserPhoto['name']}}{{$UserPhoto['extension']}}</p>
                    </div>
                    <div class="flex ml-auto mr-3 relative">
                        <svg class="w-3 h-3 text-gray-800 dark:text-black options-icon cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15" onclick="toggleOptionsList({{$UserPhoto['photo_id']}}, 'photo')">
                            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
                        </svg>
                        <ul id="optionsList-{{$UserPhoto['photo_id']}}" class="absolute hidden bg-white border rounded-md shadow-md p-2 mt-1 right-0 options-list z-50 top-3 h-26 w-36 left-100">
                            @if ($UserPhoto['isOwner'] === 'owner') <li class="pt-1 hover:bg-gray-200 flex justify-center"><button class="photo-name w-full h-full" data-photo-id="{{$UserPhoto['photo_id']}}" data-photo-name="{{$UserPhoto['name']}}" onclick="hideLists()">Zmień nazwe</button></li>@endif
                            @if ($UserPhoto['isFolder'] === 'folder' || $UserPhoto['isOwner'] === 'owner')<li class="pt-1 hover:bg-gray-200 flex justify-center"><button class="photo-delete w-full h-full" data-photo-id="{{$UserPhoto['photo_id']}}" onclick="hideLists()">Usuń </button></li>@endif
                            @if ($UserPhoto['isOwner'] === 'owner') <li class="pt-1 hover:bg-gray-200 flex justify-center"><button class="photo-share w-full h-full" data-photo-id="{{$UserPhoto['photo_id']}}" data-photo-name="{{$UserPhoto['name']}}" onclick="hideLists()">Udostępnij</button></li>@endif
                            <li class="pt-1 hover:bg-gray-200 flex"><a class="w-full h-full flex justify-center items-center" href="{{ url('gallery/download/'.$UserPhoto['photo_id'])}}"  onclick="hideLists()">Pobierz</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</div>
<script>
    window.csrfToken = "{{ csrf_token() }}";
</script>
</x-app-main-layout>
