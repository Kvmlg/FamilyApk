<?php

namespace App\Http\Controllers;

use App\Models\User;

class RegisterController extends Controller
{
    public $timestamps = false;

    public function create()
    {
        return view('register');
    }

    public function store()
    {

        $this->validate(request(), [
            'name' => 'required',
            'surname' => 'required',
            'phone_number' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required',
        ]);

        try {
            error_log('try');
            User::create(request(['name', 'surname', 'password', 'email', 'phone_number']));

            return redirect()->back()->with('success', 'Konto zostało pomyślnie utworzone, możesz się zalogować.');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1062) {
                return redirect()->back()->withErrors(['email' => 'Ten adres email jest już używany.'])->withInput();
            }

        }
    }
}
