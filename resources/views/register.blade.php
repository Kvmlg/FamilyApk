<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Rejestracja</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="overflow-x-hidden min-h-130" style="background-image: url('/images/welcomeBg.jpg' );  box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.6);">
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <a href="{{ url('') }}" class="btn btn-link text-white font-size-20">Home</a>
        </div>
    </div>
</div>
<div class="flex w-screen h-screen items-center justify-center">
    <div class="bg-white min-h-120 flex bg-opacity-50 backdrop-blur-sm h-4/5 w-4/5 md:w-3/5 lg:w-2/5 xl:1/5 2xl:w-2/6 rounded-2xl border-2 border-gray-800 ">
        <div class="flex flex-col bg-light w-full h-full">
            <div class="flex flex-col h-1/5">
                <h1 class="w-full h-full flex items-center justify-center underline text-3xl underline-offset-8 font-bold">Rejestracja</h1>
            </div>
            <div class="card-body h-4/5 justify-center">
                <form method="POST" action="{{ route('register.store') }}">
                {{ csrf_field() }}
                @csrf
                    <div class="mb-6 flex-col flex items-center font-bold">
                        <label for="name" class="form-label">Imie</label>
                        <input type="text" name="name" class="form-control p-3 rounded-full bg-black bg-opacity-80 w-2/3 text-white text-center" id="name" placeholder="Jan" required>
                    </div>
                    <div class="mb-6 flex-col flex items-center font-bold">
                        <label for="surname" class="form-label">Nazwisko</label>
                        <input type="text" name="surname" class="form-control p-3 rounded-full bg-black bg-opacity-80 w-2/3 text-white text-center" id="surname" placeholder="Kowalski" required>
                    </div>
                    <div class="mb-6 flex-col flex items-center font-bold">
                        <label for="password" class="form-label">Hasło</label>
                        <input type="password" name="password" class="form-control p-3 rounded-full bg-black bg-opacity-80 w-2/3 text-white text-center" id="password" placeholder="********" required>
                    </div>
                    <div class="mb-6 flex-col flex items-center font-bold">
                        <label for="email" class="form-label">Adres email</label>
                        <input type="email" name="email" class="form-control p-3 rounded-full bg-black bg-opacity-80 w-2/3 text-white text-center" id="email" placeholder="nazwa@email.com" required>
                        @error('email')
                            <div class="alert alert-danger">{{ $message }}</div>
                        @enderror
                    </div>
                    <div class="mb-6 flex-col flex items-center font-bold">
                        <label for="phone_number" class="form-label">Numer telefonu</label>
                        <input type="number" name="phone_number" class="form-control p-3 rounded-full bg-black bg-opacity-80 w-2/3 text-white text-center" id="phone_number" placeholder="111 222 333" required>
                    </div>
                    <div class="mb-6 flex-col flex items-center font-bold">
                        <div class="d-grid">
                                @if(Session::has('success'))
                                    <div class="flex items-center w-full justify-center text-green-500 font-bold" role="alert">
                                        {{ Session::get('success') }}
                                    </div>
                                @endif
                            </div>
                                <button class="p-3 rounded-full bg-black bg-opacity-40 w-1/3 hover:bg-orange-400 mt-2">Zarejestruj</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
</body>
</html>
