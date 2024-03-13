
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Family web</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="w-full h-full flex-col flex scroll-smooth overflow-x-clip">
    <header class="bg-transparent fixed top-0 left-0 w-full z-50">
        <nav>
            <ul class="list-none text-right m-1 mt-4">
                <li class="inline ml-10"><a class="bg-orange-400 font-bold text-white rounded-full p-3 top-3" href="/login">Login</a></li>
                <li class="inline ml-5"><a class="bg-orange-400 font-bold text-white rounded-full p-3" href="/register">Rejstracja</a></li>
            </ul>
        </nav>
    </header>

    <section id="section1" class="flex w-screen h-screen object-cover text-center shadow-2xl" style="background-image: url('/images/welcomeBg.jpg' );  box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.6);">
    <div class=" items-center flex justify-center w-full">
        <div class="row ">
            <div class="col">
                <h1 class="mb-12 text-orange-500 size text-8xl ">Witaj!</h1>
                <p class="text-lg text-white mb-16">Jeśli szukasz miejsca do organizacji i tworzenia niezapomnianych chwil twojej grupy dobrze trafiłeś!</p>
                <a href="#section2" class="text-center mr-5 tracking-wider bg-orange-400 text-white rounded-full p-4 font-bold hover:bg-orange-200">Dowiedz się więcej</a>
            </div>
        </div>
    </div>
    </section>

    <section id="section2">
        <div class="flex h-[60vh] w-full bg-white text-gray-700 items-center justify-center">
            <div class="flex-row flex">
                <div class="flex-col flex text-center w-3/6  justify-center items-end">
                    <h1 class="text-5xl mb-5 w-3/6 ">Załóż Rodzinę</h1>
                    <p class="w-3/6">Załóż swoją unikalną rodzinę, nadając jej nazwę, i dodawaj swoich bliskich, tworząc wirtualny dom dla twojej rodziny.</p>
                </div>
                <div class="w-3/6 justify-center flex items-center">
                    <img src="{{ url('/images/Groups.png') }}" class="h-2/3 items-center rounded-2xl" />
                </div>
            </div>
        </div>
    </section>

    <section id="section3" >
        <div class="flex h-[60vh] w-full bg-gray-700 text-white items-center justify-center">
            <div class="flex-row flex">
                <div class="w-3/6 items-center justify-center flex">
                    <img src="{{ url('/images/Gallery.png') }}" class="h-2/3 rounded-2xl" />
                </div>
                <div class="flex-col flex text-center w-3/6  justify-center">
                    <h1 class="text-5xl mb-5 w-3/6 ">Zakładki Zdjęć</h1>
                    <p class="w-3/6">Nasza aplikacja umożliwia tworzenie kategorii zdjęć, takich jak 'Wakacje' czy 'Zdjęcia Bieżące', które pozwalają na przechowywanie wspomnień i dzielenie się fotografiami i wspomnieniami.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="section4">
        <div class="flex h-[60vh] w-full bg-white text-gray-700 items-center justify-center">
            <div class="flex-row flex">
                <div class="flex-col flex text-center w-3/6  justify-center items-end">
                    <h1 class="text-5xl mb-5 w-3/6 ">Zakładki Notatek</h1>
                    <p class="w-3/6">Organizuj swoje myśli i notatki w formie karteczek, nadając im kolory i kontrolując dostępność dla innych członków rodziny.</p>
                </div>
                <div class="w-3/6 justify-center flex items-center">
                    <img src="{{ url('/images/Notes.png') }}" class="h-2/3 items-center rounded-2xl" />
                </div>
            </div>
        </div>
    </section>


    <section id="section5">
        <div class="flex h-[60vh] w-full bg-gray-700 text-white items-center justify-center">
            <div class="flex-row flex">
                <div class="w-3/6 items-center justify-center flex">
                    <img src="{{ url('/images/Gallery.png') }}" class="h-2/3 rounded-2xl" />
                </div>
                <div class="flex-col flex text-center w-3/6  justify-center">
                    <h1 class="text-5xl mb-5 w-3/6 ">Komunikator</h1>
                    <p class="w-3/6">Twórz konwersacje grupowe, komunikuj się z bliskimi i twórz spersonalizowane chaty, które ułatwiają komunikację i planowanie wydarzeń.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="section6" >
        <div class="flex h-[60vh] w-full bg-white text-gray-700 items-center justify-center">
            <div class="flex-row flex">
                <div class="flex-col flex text-center w-3/6  justify-center items-end">
                    <h1 class="text-5xl mb-5 w-3/6 ">Kalendarz</h1>
                    <p class="w-3/6">Planuj rodzinne wydarzenia i dodawaj je do kalendarza, aby wszyscy mieli dostęp do ważnych dat i informacji.</p>
                </div>
                <div class="w-3/6 justify-center flex items-center">
                    <img src="{{ url('/images/Calendar.png') }}" class="h-2/3 items-center rounded-2xl " />
                </div>
            </div>
        </div>
    </section>
    <footer class="bg-gray-700 text-white p-5 text-right">
        <div class="author-info">
            <p class="text-lg font-bold">Autor: Kamil Gręda</p>
        </div>
    </footer>
</body>
</html>
