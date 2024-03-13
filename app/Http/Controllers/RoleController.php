<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function loginCheck($view){
        if(!(Auth::check())){
            return redirect()->to('/login');
        }

        return view($view);
    }
}
