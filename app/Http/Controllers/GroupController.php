<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class GroupController extends Controller
{

    public function show()
    {
        $requester=Auth::user();
        $groups = $requester->groupsMem;
        $UserGroups = $groups->sortByDesc('id')->map(function ($sortedGroups) {
            return [
                'group_id' => $sortedGroups->id,
                'name' => $sortedGroups->group_name,
                'isOwner' => $sortedGroups->owner == Auth::user()->id ? 'owner' : null,
            ];
        })->values()->toArray();
        return view('groups', compact('UserGroups'));
    }

    public function getGroupData($group_id)
    {
        $group = Group::find($group_id);
        $requester=Auth::user();
        if(!is_null($group) && ($group->owner == $requester->id || $group->members->contains($requester))){
            $users = $group->members;

            $group_memb = $users->map(function ($users) {
                return [
                    'user_id' => $users->id,
                    'name' => $users->name,
                    'surname' => $users->surname,
                    'email' => $users->email,
                    'avatar_url' => $users->avatar_url,
                ];
            })->values()->toArray();

            $group_info = [
                'group_id' => $group->id,
                'name' => $group->group_name,
                'owner' => $group->owner,
            ];
        }else{
            throw ValidationException::withMessages(['Brak dostępu!']);
        }


        return response()->json(compact('group_info','group_memb'));
    }

    public function removeFromGroup($userid, $groupId)
    {
        $requester=Auth::user();
        try {
            $group = Group::find($groupId);
            $user=User::find($userid);
            if(!is_null($group) && $group->owner == $requester->id){
                $group->members()->detach($user->id);
            }else{
                throw ValidationException::withMessages(['Brak dostępu!']);
            }
            return response()->json(['success' => true, 'messages' => "Użytkownik usunięty z grupy"]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }
    public function addToGroup($userMail, $groupId)
    {
        $requester=Auth::user();
        $group = Group::find($groupId);
        $user = User::where('email', $userMail)->first();
        try {
            if(is_null($user)){
                throw ValidationException::withMessages(['Brak użytkownika o takim mailu!']);
            }elseif($group->members()->where('users_id', $user->id)->exists()){
                throw ValidationException::withMessages(['Użytkownik jest już w grupie!']);
            }elseif(!is_null($group) && $group->owner == $requester->id){
                $group->members()->attach($user->id);
            }else{
                throw ValidationException::withMessages(['Brak dostępu!']);
            }
            return response()->json(['success' => true, 'messages' => "Użytkownik dodany!", 'newUser'=> $user->only(['name', 'surname', 'email', 'id'])]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }
    public function renameGroup(Request $request, $groupId)
    {
        $newGroupName = $request->newGroupName;
        $requester=Auth::user();
        $group = Group::find($groupId);

        if (strlen($newGroupName) > 45) {
            return response()->json(['success' => false, 'message' => 'Nazwa grupy jest za długa. Maksymalna długość to 45 znaków.'], 500);
        }

        try {
            if(!is_null($group) && $group->owner == $requester->id){
                $group->group_name = $newGroupName;
                $group->save();
            }else{
                throw ValidationException::withMessages(['Brak dostępu!']);

            }
            return response()->json(['success' => true, 'messages' => "Nazwa grupy zmieniona!", 'newName'=> $group]);
        } catch (\Exception $th) {
            $errorMessage = $th->getMessage();
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }

    public function createGroup(Request $request)
    {

        $newGroupName = $request->GroupName;
        $requester=Auth::user();

        if (strlen($newGroupName) > 45) {
            return response()->json(['success' => false, 'message' => 'Nazwa grupy jest za długa. Maksymalna długość to 45 znaków.'], 500);
        }

        try {
            $group = new Group();
            $group->group_name = $newGroupName;
            $group->owner = $requester->id;
            $group->save();
            $group->members()->attach($requester->id);

            $users = $group->members;
            $usersInfo = $users->map(function ($users) {
                return [
                    'user_id' => $users->id,
                    'name' => $users->name,
                    'surname' => $users->surname,
                    'email' => $users->email,
                ];
            })->values()->toArray();

            return response()->json(['success' => true, 'messages' => "Grupa utworzona!", 'newGroup'=> $group, 'group_memb' => $usersInfo]);
        } catch (\Exception $th) {
            $errorMessage = $th->getMessage();
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }

    public function deleteGroup($groupId)
    {
        $requester = User::find(Auth::user()->id);
        $group = Group::find($groupId);
        if(!is_null($group) && $group->owner == $requester->id){
            try {
                $group->members()->detach();
                $group->delete();
                return response()->json(['success' => true, 'messages' => "Grupa została usunięta!"]);
            }catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }else{
            throw ValidationException::withMessages(['Brak dostępu!']);
        }

    }
    public function leaveGroup($groupId)
    {
        $requester = User::find(Auth::user()->id);
        $group = Group::find($groupId);
        if(!is_null($group) && ($group->owner !== $requester->id && $group->members->contains($requester))){
            try {
                $group->members()->detach($requester->id);
                return response()->json(['success' => true, 'messages' => "Opuściłeś grupę"]);
            }catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }else{
            throw ValidationException::withMessages(['Brak dostępu!']);
        }
    }
}
