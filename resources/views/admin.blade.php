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
        <div class="flex flex-col w-5/6 px-4 border-r-2 items-center">
            <table class="w-full mt-4 px-6 py-3">
                <tr class="border-b items-center">
                    <th class="px-1 py-3 bg-gray-100">Id</th>
                    <th class="px-2 py-3 ">Imie</th>
                    <th class="px-2 py-3 bg-gray-100">Nazwisko</th>
                    <th class="px-2 py-3">Email</th>
                    <th class="px-2 py-3 bg-gray-100">Numer telefonu</th>
                    <th class="px-6 py-3">Avatar url</th>
                    <th class="px-6 py-3 bg-gray-100">Opis</th>
                    <th class="px-6 py-3">Opcje</th>
                </tr>
                @foreach( $users as  $user)
                <tr class="text-center hover:bg-gray-100 rounded-2xl">
                    <td class="bg-gray-100 py-2">{{$user['id']}}</td>
                    <td>{{$user['name']}}</td>
                    <td class="bg-gray-100">{{$user['surname']}}</td>
                    <td>{{$user['email']}}</td>
                    <td class="bg-gray-100">{{$user['phone_number']}}</td>
                    <td>{{$user['avatar_url']}}</td>
                    <td class="max-w-64 bg-gray-100 text-ellipsis truncate" title="{{$user['user_description']}}">{{$user['user_description']}}</td>
                    <td>
                        <a class="text-blue-700" href="{{route('admin.users.edit',['userId' => $user['id']]) }}">
                            Edytuj
                        </a>
                        <button class="text-red-500 pl-5" onclick="confirmDelete('{{ route('admin.users.delete', ['userId' => $user['id']]) }}')">
                            Usuń
                        </button>
                    </td>
                </tr>
                @endforeach
            </table>
            <div class="flex w-full h-full justify-center items-end pb-4">
                {{ $users->links() }}
            </div>
        </div>

    </div>
    <script>
        window.csrfToken = "{{ csrf_token() }}";
        function confirmDelete(url) {
            if (confirm('Czy na pewno chcesz usunąć?')) {
                window.location.href = url;
            }
        }
    </script>
</div>
</x-app-main-layout>
