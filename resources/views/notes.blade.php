<x-app-main-layout>
    <x-slot name="title">Notes</x-slot>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
<script>
    document.addEventListener("DOMContentLoaded", function() {
        let paragraphs = document.querySelectorAll('.text-ellipsis');

        paragraphs.forEach((paragraph) => {
            let text = paragraph.innerText;
            let words = text.split(' ');

            let maxLength = 21;
            let truncatedText = words.slice(0, maxLength).join(' ');

            if (words.length > maxLength) {
                truncatedText += '...';
            }
            paragraph.innerText = truncatedText;
        });
    });
</script>
<div class="note-list p-0 bg-white m-0 flex flex-wrap justify-center ">
    <div class="flex w-full h-96 max-w-96 min-w-60 md:w-60 md:h-72 rounded-lg ml-3 mt-3 p-6 relative hover:scale-105 duration-200 bg-yellow-200 justify-center items-center note-content" data-note-id="0">
        <svg class="w-12 h-12 text-gray-800 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 1v16M1 9h16"/>
        </svg>
    </div>
    @foreach($UserNotes as  $UserNote)
        <div class="w-full h-96 max-w-96 min-w-60 md:w-60 md:h-72 rounded-lg ml-3 mt-3 p-6 relative hover:scale-105 duration-200 {{$UserNote['color']}}" data-note-id="{{$UserNote['id']}}">
            <h2 class="text-lg font-bold mb-2 text-center">{{$UserNote['title']}}</h2>
            <p class="pt-1 overflow-hidden h-48 whitespace-normal text-ellipsis note-content" data-note-id="{{$UserNote['id']}}" data-note-color="{{$UserNote['color']}}">
                {{$UserNote['content']}}
            </p>
            <div class="absolute bottom-4 right-10 flex items-end justify-end " id="icons">
                <div>
                    @if ($UserNote['isOwner'] === 'owner')
                    <button class="note-add" data-note-id="{{$UserNote['id']}}">
                    <svg class="w-4 h-4 text-gray-800 dark:text-gray-500 inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 8h6m-3 3V5m-6-.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 11h3a4 4 0 0 1 4 4v2H1v-2a4 4 0 0 1 4-4Z"/>
                    </svg>
                    </button>
                    @endif

                    <button class="note-color" data-note-id="{{$UserNote['id']}}" data-note-color="{{$UserNote['color']}}">
                        <svg class="w-4 h-4 text-gray-800 dark:text-gray-500 inline ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 21">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.15 5.6h.01m3.337 1.913h.01m-6.979 0h.01M5.541 11h.01M15 15h2.706a1.957 1.957 0 0 0 1.883-1.325A9 9 0 1 0 2.043 11.89 9.1 9.1 0 0 0 7.2 19.1a8.62 8.62 0 0 0 3.769.9A2.013 2.013 0 0 0 13 18v-.857A2.034 2.034 0 0 1 15 15Z"/>
                        </svg>
                    </button>

                    <button class="note-delete" data-note-id="{{$UserNote['id']}}" >
                    <svg class="w-4 h-4 text-gray-800 dark:text-gray-500 inline ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h16M7 8v8m4-8v8M7 1h4a1 1 0 0 1 1 1v3H6V2a1 1 0 0 1 1-1ZM3 5h12v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z"/>
                    </svg>
                    </button>

                </div>
            </div>
        </div>
    @endforeach
        <div id="Notes"></div>
</div>
<script>
    window.csrfToken = "{{ csrf_token() }}";
</script>
</x-app-main-layout>
