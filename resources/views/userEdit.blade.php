<x-app-main-layout>
    <x-slot name="title">Chat</x-slot>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <div class="p-0 bg-white h-full m-0 w-full flex">
        <div class="flex-row flex w-full">
            <div class="flex flex-col w-1/6 px-4 border-r-2 items-center">
                <div class="users-list overflow-y-auto w-full py-3 pt-5 justify-center items-center">
                    <a class="user-link" href="/admin/users">
                        <div class="flex bg-slate-100 transition px-5 py-3 my-3 hover:cursor-pointer hover:bg-indigo-400 rounded-3xl mt-1 w-full justify-center hover:text-white text-indigo-400">
                            <div class="pl-2 items-center flex justify-center">
                                <h3 class="tex-md">Użytkownicy</h3>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="flex h-full w-5/6 items-center justify-center">
                <div class="flex h-2/3 min-h-108 w-full md:w-2/3 xl:w-1/2 flex-row mx-2 justify-center items-center ">
                    <form method="POST" action="{{ url("/admin/users/edit/$user->id") }}" class="h-full w-full bg-slate-100 rounded-2xl items-center flex justify-items-center justify-center border-2 border-gray-300">
                        @csrf
                        @method('PUT')
                        <div class="w-1/2 flex-col justify-center items-center flex">
                            @if($user->avatar_url)
                                <img src="{{ url('/'.$user->avatar_url) }}" width="200" class="hover:opacity-75 cursor-pointer transition-opacity object-cover w-[150px] h-[150px] rounded-full overflow-hidden" />
                                <a href="{{ route('admin.users.removeAvatar',['userId' => $user['id']]) }}" class="text-red-500 mt-4">Usuń avatar użytkownika</a>
                            @else
                                <img src="https://ui-avatars.com/api/?name={{$user->name}}+{{$user->surname}}&background=818cf8&color=fff" class="hover:opacity-75 cursor-pointer transition-opacity object-cover w-[150px] h-[150px] rounded-full overflow-hidden" />
                            @endif
                            <h3 class="text-indigo-400 tex-xs flex justify-center w-full mt-10">Imię i nazwisko:</h3>
                            <input type="text" name="name" class="text-center p-2 border-2 rounded-full bg-slate-100 mb-3 placeholder-black" placeholder="Imię" value={{old('name',$user->name)}} />
                            <input type="text" name="surname" class="text-center p-2 border-2 rounded-full bg-slate-100 mb-3 placeholder-black" placeholder="Imię" value={{old('surname',$user->surname)}} />
                        </div>

                        <div class="flex flex-col justify-center items-center h-full relative w-1/2">
                            <div class=" flex flex-col mt-5 w-11/12 lg:w-2/3 mx-5 lg:mx-0">
                                <h3 class="text-indigo-400 tex-xs flex justify-center w-full">E-mail:</h3>
                                <input type="text" name="email" class="text-center p-2 border-2 rounded-full bg-slate-100 mb-3 placeholder-black" placeholder="E-mail" value={{old('email',$user->email)}} />
                                <h3 class="text-indigo-400 tex-xs flex justify-center w-full">Nowe hasło:</h3>
                                <input type="password" id="password" name="password" class="text-center p-2 border-2 rounded-full bg-slate-100 mb-3 placeholder-black" placeholder="Nowe haslo" />
                                <div id="message" class="text-center tex-xs flex justify-center w-full"></div>
                                <h3 class="text-indigo-400 tex-xs flex justify-center w-full mt-3">Opis:</h3>
                                <textarea name="user_description" class="text-center p-2 border-2 rounded-2xl bg-slate-100 h-24 placeholder-black resize-none" placeholder="Brak opisu" maxLength="150" >{{$user->user_description}}</textarea>
                            </div>
                            <button class="bg-indigo-400 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-5">Zapisz</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <script>
            window.csrfToken = "{{ csrf_token() }}";
        </script>
    </div>
</x-app-main-layout>
