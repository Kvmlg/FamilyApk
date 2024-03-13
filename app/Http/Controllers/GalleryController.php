<?php

namespace App\Http\Controllers;
use App\Models\Folder;
use App\Models\Group;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class GalleryController extends Controller
{

    public function show()
    {
        $requester=Auth::user();
        $photos = $requester->photosMain;
        $UserPhotos = $photos->sortByDesc('id')->map(function ($sortedPhotos) {
            return [
                'photo_id' => $sortedPhotos->id,
                'url' => $sortedPhotos->url,
                'name' => $sortedPhotos->name,
                'extension' => $sortedPhotos->extension,
                'isOwner' => $sortedPhotos->owner == Auth::user()->id ? 'owner' : null,
                'isFolder' => 'folder',

            ];
        })->values()->toArray();

        $UserFolders=$this->userFolders();

        return view('gallery', compact('UserPhotos', 'UserFolders'));
    }

    private function userFolders()
    {
        $folders = Auth::user()->folders;
        $userFolders = $folders->sortBy('id')->map(function ($sortedFolders) {
            return [
                'folder_id' => $sortedFolders->id,
                'name' => $sortedFolders->name,
                'isOwner' => $sortedFolders->owner == Auth::user()->id ? 'owner' : null,
            ];
        })->values()->toArray();

        $sharedFolders = Auth::user()->foldersMem;
        $userSharedFolders = $sharedFolders->sortBy('id')->map(function ($sortedFolders) {
            return [
                'folder_id' => $sortedFolders->id,
                'name' => $sortedFolders->name,
                'isOwner' => $sortedFolders->owner == Auth::user()->id ? 'owner' : null,
            ];
        })->values()->toArray();

        return array_merge($userFolders, $userSharedFolders);

    }

    public function upload(Request $request, $folderName = null)
    {
        if ($request->hasFile('file')) {
            $file = $request->file('file');

            if (!$this->isImage($file)) {
                return response()->json(['success' => false, 'message' => 'Przesłany plik nie jest obrazem'], 500);
            }

            if ($folderName === "Shared") {
                return response()->json(['success' => false, 'message' => 'Nie można przesłać do tego folderu!'], 500);
            }

            try {
                $userId = Auth::user()->id;
                $folder = $folderName ? 'user/' . $userId .'/'. $folderName : 'user/' . $userId;
                $fileName = $file->getClientOriginalName();
                $pathInfo = pathinfo($fileName);
                $fileOnlyName = $pathInfo['filename'];

                if (strlen($fileOnlyName) > 50) {
                    return response()->json(['success' => false, 'message' => 'Maksymalna długość nazwy to 50 znaków.'], 400);
                }else if(strlen($fileOnlyName) < 3){
                    return response()->json(['success' => false, 'message' => 'Minimalna długość nazwy to 3 znaki'], 400);
                }

                $fileOnlyExtension = $pathInfo['extension'];
                $file->storeAs($folder, $fileName);
                $path = $folderName ?  $userId . '/' . $folderName . '/' : $userId . '/';

                $folderModel = $folderName ? Folder::where('name', $folderName)->where('owner', $userId)->first() : null;

                $photo = new Photo();
                $photo->url = $path;
                $photo->name = $fileOnlyName;
                $photo->extension = "." . $fileOnlyExtension;
                $photo->owner = $userId;
                $photo->folder_id = $folderModel ? $folderModel->id : null;
                $photo->save();

                if ($folderModel) {
                    $folderModel->members->each(function ($user) use ($photo) {
                        $photo->members()->attach($user->id);
                    });
                }


                return response()->json(['success' => true, 'messages' => 'Pomyślnie przesłano obraz']);
            } catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }

        return response()->json(['success' => false, 'message' => 'Brak przesłanego pliku'], 500);
    }

    private function isImage($file)
    {
        $imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];

        return in_array($file->getMimeType(), $imageTypes);
    }

    public function showImg($userId = null, $photoName = null)
    {

        if ($userId === null || $photoName === null) {
            abort(404);
        }

        $photo = Photo::where('name', $photoName)->where('owner', $userId)->first();
        if ($photo && ((auth()->user()->id == $photo->owner) || ($photo->members->contains(auth()->user()->id)))) {
            $filePath = storage_path('app/user/' . $photo->url . $photo->name . $photo->extension);
            if (file_exists($filePath)) {
                $fileContent = file_get_contents($filePath);
                return response($fileContent, 200, [
                    'Content-Type' => 'image/jpeg',
                ]);
            }
        }

        abort(404);
    }
    public function showImgFolder($userId = null, $folderName = null, $photoName = null)
    {

        if ($userId === null || $photoName === null) {
            abort(404);
        }

        $folder=Folder::where('name', $folderName)->first();
        $photo = Photo::where('name', $photoName)->where('owner', $userId)->where("folder_id",$folder->id )->first();
        if ($photo && (auth()->user()->id == $photo->owner || ($photo->members->contains(auth()->user()->id)))) {
            $filePath = storage_path('app/user/' . $photo->url . $photo->name . $photo->extension);
            if (file_exists($filePath)) {
                $fileContent = file_get_contents($filePath);
                return response($fileContent, 200, [
                    'Content-Type' => 'image/jpeg',
                ]);
            }
        }

        abort(404);
    }

    public function renameImg(Request $request, $photoId)
    {
        $photo = Photo::find($photoId);
        $newName = $request->newName;


        if ($photo && auth()->user()->id == $photo->owner) {
            $oldFilePath = "user/{$photo->url}{$photo->name}{$photo->extension}";
            $newFilePath = "user/{$photo->url}{$newName}{$photo->extension}";
            if (!Storage::disk('local')->exists($newFilePath)) {
                try {
                    $this->validate($request, [
                        'newName' => 'required|min:3|max:50',
                    ], [
                        'newName.required' => 'Nazwa folderu jest wymagana.',
                        'newName.min' => 'Minimalna długość nazwy to 3 znaki.',
                        'newName.max' => 'Maksymalna długość nazwy to 50 znaków.',
                    ]);
                    Storage::disk('local')->move($oldFilePath, $newFilePath);
                    $photo->name = $newName;
                    $photo->save();
                    return response()->json(['success' => true, 'messages' => 'Nazwa zostala zmieniona.', 'newName' => $newName, 'extension'=>$photo->extension, 'photoId'=> $photo->id]);
                } catch (\Exception $th) {
                    return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
                }
            } else {
                return response()->json(['success' => false, 'message' => 'Plik o nowej nazwie już istnieje.'], 500);
            }
        }
        abort(404);
    }

    public function renameFolder(Request $request, $folderId)
    {
        $folder = Folder::find($folderId);
        $newName = $request->newName;
        $requester = Auth::user()->id;


        if ($folder && auth()->user()->id == $folder->owner) {
            $oldFolderPath = "user/{$requester}/$folder->name/";
            $newFolderPath = "user/{$requester}/$newName/";
            if (!Storage::disk('local')->exists($newFolderPath)) {
                try {
                    $this->validate($request, [
                        'newName' => 'required|min:3|max:50',
                    ], [
                        'newName.required' => 'Nazwa folderu jest wymagana.',
                        'newName.min' => 'Minimalna długość nazwy to 3 znaki.',
                        'newName.max' => 'Maksymalna długość nazwy to 50 znaków.',
                    ]);

                    Storage::disk('local')->move($oldFolderPath, $newFolderPath);
                    $photos = $folder->photos;

                    foreach ($photos as $photo) {
                        $newPhotoUrl = "{$requester}/$newName/";
                        $photo->url = $newPhotoUrl;
                        $photo->save();
                    }
                    $folder->name = $newName;
                    $folder->save();
                    return response()->json(['success' => true, 'messages' => 'Nazwa zostala zmieniona.', 'folderName' => $newName]);
                } catch (\Exception $th) {
                    return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
                }
            } else {
                return response()->json(['success' => false, 'message' => 'Folder o nowej nazwie już istnieje.'], 500);
            }
        }
        abort(404);
    }

    public function deleteImg($photoId)
    {
        $photo = Photo::find($photoId);

        if ($photo && auth()->user()->id == $photo->owner) {
            $FilePath = "user/{$photo->url}{$photo->name}{$photo->extension}";

            try {
                $photo->members()->detach();
                $photo->delete();
                Storage::disk('local')->delete($FilePath);
                return response()->json(['success' => true, 'messages' => 'Zdjęcie zostało usunięte.', 'deletedPhoto' => $photo->id]);
            } catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        } else if($photo && ($photo->members->contains(auth()->user()->id))) {
            $photo->members()->detach(auth()->user()->id);
            return response()->json(['success' => true, 'messages' => "Zdjęcie zostało usunięta!", 'deletedPhoto' => $photo->id]);
        }else{
            abort(404);
        }

    }

    public function deleteFolder($folderId)
    {
        $folder = Folder::find($folderId);
        $requester = Auth::user()->id;
        if ($folder && auth()->user()->id == $folder->owner) {
            $FolderPath = storage_path("app/user/$requester/$folder->name");
            try {
                $photosInFolder = $folder->photos;
                foreach ($photosInFolder as $photo) {
                    $photo->members()->detach();
                    $photo->delete();
                }
                $folder->members()->detach();
                File::deleteDirectory($FolderPath);
                $folder->delete();
                return response()->json(['success' => true, 'messages' => 'Folder został usunięty.', 'deletedFolder' => $folder->id]);
            } catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        } else {
            abort(404);
        }

    }

    public function downloadImg($photoId)
    {
        $photo = Photo::find($photoId);

        if ($photo && ((auth()->user()->id == $photo->owner) || ($photo->members->contains(auth()->user()->id)))) {
            $FilePath = "user/{$photo->url}{$photo->name}{$photo->extension}";
            return  Storage::disk('local')->download($FilePath);
        } else {
            abort(404);
        }

    }

    public function showFolder($folderName)
    {
        $requester = Auth::user();
        $isSharedFolder = $folderName === "Shared";
        $folder = $isSharedFolder ? null : Folder::where('name', $folderName)->first();

        if ($isSharedFolder || (($folder && $folder->owner == $requester->id) || ($folder && $folder->members->contains(auth()->user()->id)))) {
            $photos = ($isSharedFolder || $folder->owner !== $requester->id) ? $requester->photosMem : $requester->photos;


            $UserPhotos = $photos->when(!$isSharedFolder, function ($query) use ($folder) {
                return $query->where('folder_id', $folder->id);
            })->sortByDesc('id')->map(function ($sortedPhotos) use ($isSharedFolder) {
                return [
                    'photo_id' => $sortedPhotos->id,
                    'url' => $sortedPhotos->url,
                    'name' => $sortedPhotos->name,
                    'extension' => $sortedPhotos->extension,
                    'isOwner' => $sortedPhotos->owner == Auth::user()->id ? 'owner' : null,
                    'isFolder' => $isSharedFolder ? 'folder' : null,
                ];
            })->values()->toArray();

            $UserFolders = $this->userFolders();
            return view('gallery', compact('UserPhotos', 'UserFolders'));
        }

        abort(404);
    }

    public function newFolder(Request $request)
    {
        $requester=Auth::user();

        try {

            $this->validate($request, [
                'folderNameValue' => 'required|min:3|max:50',
            ], [
                'folderNameValue.required' => 'Nazwa folderu jest wymagana.',
                'folderNameValue.min' => 'Minimalna długość nazwy to 3 znaki.',
                'folderNameValue.max' => 'Maksymalna długość nazwy to 50 znaków.',
            ]);
            $folder = new Folder();
            $folder->name = $request->folderNameValue;
            $folder->owner = $requester->id;
            $folder->save();

            return response()->json(['success' => true, 'messages' => 'Nowy folder został dodany.']);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }

    public function getElementData($element_type, $element_id){
        $element = ($element_type === "photo") ? Photo::find($element_id) : Folder::find($element_id);

        $requester=Auth::user();
            $photoUser = $element->members->filter(function ($user) {
                return !isset($user->pivot->groups_id);
            })->map(function ($user) {
                return [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'surname' => $user->surname,
                    'email' => $user->email,
                    'created_at' => $user->pivot->created_at,
                    'user_group' => $user->pivot->groups_id,
                    'avatar_url'=>$user->avatar_url,
                ];
            })->values()->toArray();

            $photoGroup = $element->groupMembers->map(function ($group) {
                return [
                    'group_id' => $group->id,
                    'name' => $group->group_name,
                    'created_at' => $group->pivot->created_at,
                ];
            })->values()->toArray();

            $groupedPhotoGroupMembers = [];
            foreach ($photoGroup as $member) {
                $groupedPhotoGroupMembers[$member['group_id']] = $member;
            }

            $photoGroupMembers = array_values($groupedPhotoGroupMembers);

            $elementMembers = array_merge($photoUser, $photoGroupMembers);
            usort($elementMembers, function ($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });


            $groups = $requester->groupsMem->sortByDesc('id')->map(function ($sortedGroups) {
                return [
                    'group_id' => $sortedGroups->id,
                    'name' => $sortedGroups->group_name,
                    'isOwner' => $sortedGroups->owner == Auth::user()->id ? 'owner' : null,
                ];
            })->values()->toArray();

            $friendsWithNames = $this->mapFriends($requester->yoursFriends)
                ->values()
                ->toArray();

            $asFriendsWithNames = $this->mapFriends($requester->friendAs)
                ->values()
                ->toArray();

            $allFriends = array_merge($friendsWithNames, $asFriendsWithNames);

            $friendsNotInNote = array_filter($allFriends, function ($friend) use ($photoUser) {
                return !in_array($friend['user_id'], array_column($photoUser, 'user_id'));
            });

            $groupsNotInNote = array_filter($groups, function ($group) use ($elementMembers) {
                return !in_array($group['group_id'], array_column($elementMembers, 'group_id'));
            });

            $userFriends = array_values($friendsNotInNote);
            $userGroups = array_values($groupsNotInNote);
        return response()->json(compact('elementMembers', 'userGroups', 'userFriends'));
    }

    private function mapFriends($friends)
    {
        return $friends->map(function ($friend) {
            return [
                'user_id' => $friend->id,
                'name' => $friend->name,
                'surname' => $friend->surname,
                'avatar_url'=>$friend->avatar_url,
            ];
        });
    }
    public function newMemberGroup($type,$element_id, $memberId)
    {
        $element = ($type === "photo") ? Photo::find($element_id) : Folder::find($element_id);
        $requester=Auth::user();
        $group = Group::where('id', $memberId)->first();
        $groupAdded = false;
        $addedUsers = [];
        try {
            if(!is_null($element) && ($element->owner == $requester->id)){
                $users = $group->members;
                $users->each(function ($user) use ($element, $group, &$groupAdded,&$addedUsers,&$type, $requester) {
                    if ($user->id !== $requester->id && !$element->members->contains($user->id)) {
                        $element->members()->attach($user->id, ['created_at' => now(), 'groups_id' => $group->id]);
                        $groupAdded = true;
                        $addedUsers[] = [
                            'user_id' => $user->id,
                            'name' => $user->name,
                            'surname' => $user->surname,
                            'email' => $user->email,
                            'avatar_url'=>$user->avatar_url,
                        ];
                        if($type === "folder") {
                            $element->photos->each(function ($photo) use ($group) {
                                $photo->groupMembers()->attach($group->id, ['created_at' => now()]);
                            });
                        }
                    }
                });
                if (!$groupAdded) {
                    throw new \Exception('Wszyscy użytkownicy z grupy są już dodani!.');
                }
            }else{
                throw ValidationException::withMessages(['Brak dostępu!']);
            }
            return response()->json(['success' => true, 'messages' => "Grupa dodana!",'newGroup' => array_merge(['group_id' => $group->id],['name' => $group->group_name],['newUser' => $addedUsers])]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }

    public function newMemberUser($type,$element_id, $memberId)
    {
        $element = ($type === "photo") ? Photo::find($element_id) : Folder::find($element_id);
        $requester=Auth::user();
        $user = User::where('id', $memberId)->first();
        try {
            if(!is_null($element) && ($element->owner == $requester->id)){
                $element->members()->attach($user->id, ['created_at' => now()]);
                if($type === "folder"){
                    $element->photos->each(function ($photo) use ($user) {
                        $photo->members()->attach($user->id, ['created_at' => now()]);
                    });
                }
            }else{
                throw ValidationException::withMessages(['Brak dostępu!']);
            }
            return response()->json(['success' => true, 'newUser'=> array_merge(['user_id' => $user->id],  $user->only(['name', 'surname', 'email', 'id', 'avatar_url']))]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }

    public function removeMemberGroup($type,$element_id, $memberId)
    {
        $element = ($type === "photo") ? Photo::find($element_id) : Folder::find($element_id);
        $requester=Auth::user();
        $group = Group::where('id', $memberId)->first();
        $deletedUsers=[];
        if(!is_null($element) && $element->owner == $requester->id){
            try {
                $element->groupMembers()->detach($group->id);
                if ($type === "folder") {
                    $element->photos->each(function ($photo) use ($group) {
                        $photo->groupMembers()->detach($group->id);
                    });
                }
                $users = $group->members;
                $users->each(function ($user) use ( &$deletedUsers) {
                    if ($user->id !== Auth::user()->id){
                        $deletedUsers[] = [
                            'user_id' => $user->id,
                            'id' => $user->id,
                            'name' => $user->name,
                            'surname' => $user->surname,
                            'email' => $user->email,
                            'avatar_url'=>$user->avatar_url,
                        ];
                    }
                });
                return response()->json(['success' => true, 'removedGroup' => array_merge(['group_id' => $group->id],['name' => $group->group_name],['deletedUsers'=>$deletedUsers])]);
            }catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }else{
            throw ValidationException::withMessages(['Brak dostępu!']);
        }

    }

    public function removeMemberUser($type,$element_id, $memberId)
    {
        $element = ($type === "photo") ? Photo::find($element_id) : Folder::find($element_id);
        $requester=Auth::user();
        $user = User::where('id', $memberId)->first();
        if(!is_null($element) && $element->owner == $requester->id){
            try {
                $element->members()->detach($user->id);
                if ($type === "folder") {
                    $element->photos->each(function ($photo) use ($user) {
                        $photo->members()->detach($user->id);
                    });
                }
                return response()->json(['success' => true, 'removedUser' => array_merge(['user_id' => $user->id],  $user->only(['name', 'surname', 'email', 'id', 'avatar_url']))]);
            }catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }else{
            throw ValidationException::withMessages(['Brak dostępu!']);
        }

    }
}
