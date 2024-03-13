<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
<body class="overflow-hidden" style="background-image: url('/images/welcomeBg.jpg' );  box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.6);">
<div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <a href="{{ url('') }}" class="btn btn-link text-white font-size-20">Home</a>
            </div>
        </div>
</div>
<div class="flex w-screen h-screen items-center justify-center">
    <div class="bg-white flex bg-opacity-50 backdrop-blur-sm h-4/5 min-h-108 md:h-1/2 w-4/5 md:w-3/5 lg:w-2/5 xl:1/5 2xl:w-2/6 rounded-2xl border-2 border-gray-800 ">
        <div class="flex flex-col w-full h-full">
            <div class="flex flex-col h-1/3">
                <h1 class="w-full h-full flex items-center justify-center underline text-3xl underline-offset-8 font-bold">Logowanie</h1>
            </div>
            <div class="h-2/3 justify-center">
                <form class="login-form w-full " method="POST" action="{{ route('login.create') }}">
                    {{ csrf_field() }}
                    <div class="mb-3 flex-col flex items-center">
                        <label for="email" class="form-label font-bold">Adres email</label>
                        <input type="email" name="email" class="form-control p-3 rounded-full bg-black bg-opacity-80 w-2/3 text-white text-center" id="email" placeholder="nazwa@email.com" required>
                    </div>
                    <div class="mb-3 flex-col flex items-center font-bold">
                        <label for="password" class="form-label ">Hasło</label>
                        <input type="password" name="password" class="form-control p-3 rounded-full bg-black bg-opacity-80 w-2/3 text-center" id="password" placeholder="*****" required>
                        <a href="/register" class="text-white mt-2">Zarejestruj się</a>
                    </div>
                    <div class="mb-3 flex justify-center justify-items-end flex-col items-center">
                        <div class="flex items-center w-full justify-center text-red-700 font-bold">
                            @if ($errors->has('message'))
                                {{ $errors->first('message') }}
                            @endif
                        </div>
                        <button class="p-3 rounded-full bg-black bg-opacity-40 w-1/3 hover:bg-orange-400 mt-2">Login</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
</body>
</html>
