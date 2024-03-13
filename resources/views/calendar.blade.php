<x-app-main-layout>

    <x-slot name="title">Kalendarz</x-slot>
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <div id="Calendar" class="w-full h-full py-2 px-1"></div>

    <script>
        window.csrfToken = "{{ csrf_token() }}";
    </script>

</x-app-main-layout>
