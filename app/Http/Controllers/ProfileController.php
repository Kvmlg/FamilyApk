<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;



class ProfileController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function show()
    {
        $user = Auth::user();
        return view('profile', compact('user'));
    }

    public function userInfo()
    {
        $user = User::find(Auth::user()->id);
        $userInfo = [
            'user_id' => $user->id,
            'name' => $user->name,
            'surname' => $user->surname,
            'email' => $user->email,
            'avatarUrl' => $user->avatar_url,
            'description' => $user->user_description
        ];


        return response()->json(['userInfo' => $userInfo]);
    }

    private function isImage($file)
    {
        $imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];

        return in_array($file->getMimeType(), $imageTypes);
    }

    public function upload(Request $request)
    {
        if ($request->hasFile('file')) {
            $file = $request->file('file');

            if (!$this->isImage($file)) {
                return response()->json(['success' => false, 'message' => 'Przesłany plik nie jest obrazem'], 500);
            }

            try {
                $userId = Auth::user()->id;
                $user=User::find($userId);
                $folder = 'avatars/' . $userId;
                $fileName = $file->getClientOriginalName();
                $pathInfo = pathinfo($fileName);
                $fileOnlyName = $pathInfo['filename'];

                if (strlen($fileOnlyName) > 50) {
                    return response()->json(['success' => false, 'message' => 'Maksymalna długość nazwy to 50 znaków.'], 400);
                }else if(strlen($fileOnlyName) < 3){
                    return response()->json(['success' => false, 'message' => 'Minimalna długość nazwy to 3 znaki'], 400);
                }

                if ($user->avatar_url) {
                    $FolderPath = storage_path("app/public/avatars/$userId");
                    File::deleteDirectory($FolderPath);
                }
                $path= $file->storePubliclyAs($folder, $fileName, 'public');

                $user->avatar_url = 'storage/'.$path;
                $user->save();

                return response()->json(['success' => true, 'messages' => 'Pomyślnie przesłano avatar']);
            } catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }

        return response()->json(['success' => false, 'message' => 'Brak przesłanego pliku'], 500);
    }

    public function update(Request $userData)
    {
        $user=User::find(Auth::user()->id);
        try {

            $this->validate(request(), [
                'email' => 'nullable|email|unique:users',
                'password' => 'nullable|min:6',
                'description' => 'nullable|max:150',
            ], [
                'email.email' => 'Niepoprawny adres e-mail.',
                'email.unique' => 'Adres e-mail jest zajęty.',
                'password.min' => 'Minimalna długość adres to 8 znakow!.',
                'description.max' => 'Maksymalna długość nazwy to 150 znaków.',
            ]);

            if ($userData->email !== null) {
                $user->email = $userData->email;
            }

            if ($userData->password !== null) {
                $user->password = $userData->password;
            }

            $user->user_description = $userData->description;


            $user->save();

            return response()->json(['success' => true, 'messages' => 'Pomyślnie zaktualizowano użytkownika']);

        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }



    }


    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
