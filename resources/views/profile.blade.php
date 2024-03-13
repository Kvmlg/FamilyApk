<x-app-main-layout>
    <x-slot name="title">Profile</x-slot>
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <div class="h-full flex w-full items-center justify-items-center justify-center">
        <div class="flex h-2/3 min-h-108 w-full md:w-2/3 xl:w-1/2 flex-row mx-2">
            <div id="Avatar" class="w-full h-full"></div>
        </div>
    </div>
    <script>
        window.csrfToken = "{{ csrf_token() }}";
    </script>
</x-app-main-layout>
