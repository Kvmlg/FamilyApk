<?php

namespace App\Http\Controllers;

use App\Models\Administrators;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;

class AdminController extends Controller
{
    public function showUsers()
    {

        if( Auth::user()->administrator){
            $users = User::cursorPaginate(15);
            return view('admin', compact('users'));
        }
        abort(404);
    }

    public function deleteUser($userId)
    {
        if( Auth::user()->administrator){
            $user = User::find($userId);
            $user->sentMessages()->delete();
            $user->receivedMessages()->delete();
            $user->receivedMessages()->delete();
            $user->yoursFriends()->delete();
            $user->friendAs()->delete();
            $user->friendRequests()->delete();
            $user->friendRequests()->delete();
            $user->groups()->delete();
            $user->events()->delete();
            $user->notes()->delete();
            $user->folders()->delete();
            $user->foldersMem()->delete();
            $user->notesMem()->delete();
            $user->photosMem()->delete();
            $user->eventsMem()->delete();
            $user->delete();
            return redirect()->back();
        }
        abort(404);
    }

    public function editUser($userId)
    {
        if( Auth::user()->administrator){
            $user = User::find($userId);
            return view('userEdit', compact('user'));
        }
        abort(404);
    }

    public function updateUser(Request $request, $userId)
    {
        if( Auth::user()->administrator){
            $user = User::find($userId);
            $input=$request->all();
            $user->name=$input['name'];
            $user->surname=$input['surname'];
            $user->email=$input['email'];
            if($user->password){
                $user->password=$input['password'];
            }
            $user->user_description=$input['user_description'];
            $user->save();
            return view('userEdit', compact('user'));
        }
        abort(404);
    }

    public function removeAvatar($userId)
    {
        if( Auth::user()->administrator){
            $user = User::find($userId);
            if ($user->avatar_url) {
                $FolderPath = storage_path("app/public/avatars/$userId");
                File::deleteDirectory($FolderPath);
            }

            $user->avatar_url = null;
            $user->save();
            return redirect()->back();
        }
        abort(404);
    }

}
